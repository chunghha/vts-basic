/**
 * precompress-assets.js
 *
 * Precompress build artifacts in dist/client for efficient static serving.
 *
 * Generates .gz and .br variants for eligible asset types and a manifest file:
 *   dist/client/asset-compression-manifest.json
 *
 * Eligible extensions (case-insensitive):
 *   .js .mjs .cjs .css .html .svg .json .txt .wasm
 *
 * Skips:
 *   - Files already ending with .gz or .br
 *   - Files smaller than MIN_SIZE_BYTES
 *
 * Compression:
 *   - Gzip: level 9
 *   - Brotli: generic mode, quality 11 (max), text/literal handling
 *
 * The manifest contains:
 * {
 *   "generatedAt": "RFC3339 timestamp",
 *   "files": {
 *     "relative/path.js": {
 *       "originalBytes": 12345,
 *       "gzBytes": 4567,
 *       "brBytes": 4321,
 *       "sha256": "hex",
 *       "mime": "text/javascript",
 *       "etag": "\"<weak-etag>\""
 *     },
 *     ...
 *   }
 * }
 *
 * Usage (after build):
 *   bun run precompress-assets.js
 *
 * Integration (Docker multi-stage):
 *   RUN bun run build && bun run precompress
 *
 * Serving Guidance (Rust proxy or any static server):
 *   1. On request, inspect Accept-Encoding.
 *   2. If brotli accepted & .br exists -> serve .br with:
 *        Content-Encoding: br
 *   3. Else if gzip accepted & .gz exists -> serve .gz with:
 *        Content-Encoding: gzip
 *   4. Always set Content-Type based on original file extension.
 *   5. Set Cache-Control:
 *        - For hashed filenames: public, max-age=31536000, immutable
 *        - For un-hashed (html, manifest.json): no-cache
 *   6. Set Vary: Accept-Encoding.
 *
 * Exit codes:
 *   0 success
 *   1 unrecoverable error (logged)
 */

/// Configuration constants
const DIST_ROOT = "dist/client";
const ASSET_DIRS = ["assets", "."]; // search top-level and assets subdir
const MANIFEST_PATH = `${DIST_ROOT}/asset-compression-manifest.json`;
const MIN_SIZE_BYTES = 512; // skip tiny files (header cost > benefit)
const CONCURRENCY = 8; // concurrent compression workers

// Eligible extensions
const ELIGIBLE = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".css",
  ".html",
  ".svg",
  ".json",
  ".txt",
  ".wasm",
]);

import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { basename, extname, join, relative } from "node:path";
import { cpus } from "node:os";
import zlib from "node:zlib";

/**
 * Small utility: sleep
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Determine MIME type heuristically; minimal mapping to avoid an extra dependency.
 */
function mimeTypeFor(ext) {
  switch (ext.toLowerCase()) {
    case ".js":
    case ".mjs":
    case ".cjs":
      return "text/javascript";
    case ".css":
      return "text/css";
    case ".html":
      return "text/html; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".json":
      return "application/json";
    case ".txt":
      return "text/plain; charset=utf-8";
    case ".wasm":
      return "application/wasm";
    default:
      return "application/octet-stream";
  }
}

/**
 * Weak ETag: just uses size + modified times hashed, or sha256 if available.
 */
function computeEtag(sha256Hex, size) {
  // Weak ETag prefix (not necessarily content stable for all transformations)
  return `"W/${sha256Hex.slice(0, 16)}-${size}"`;
}

/**
 * Walk directory recursively collecting eligible files.
 */
async function walk(dir, files = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (e) {
    // Ignore missing directories
    return files;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, files);
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Gzip compression wrapper (Promise-based).
 */
function gzipBuffer(buf) {
  return new Promise((resolve, reject) => {
    zlib.gzip(
      buf,
      {
        level: 9,
        strategy: zlib.constants.Z_DEFAULT_STRATEGY,
      },
      (err, out) => {
        if (err) reject(err);
        else resolve(out);
      },
    );
  });
}

/**
 * Brotli compression wrapper.
 */
function brotliBuffer(buf) {
  return new Promise((resolve, reject) => {
    zlib.brotliCompress(
      buf,
      {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
          [zlib.constants.BROTLI_PARAM_MODE]:
            zlib.constants.BROTLI_MODE_GENERIC,
        },
      },
      (err, out) => {
        if (err) reject(err);
        else resolve(out);
      },
    );
  });
}

/**
 * Check if filename looks hashed (simple heuristic).
 */
function isHashedFile(name) {
  // Look for a 8+ hex segment before extension: e.g., app.8f3a9c1d.js
  const base = basename(name);
  const parts = base.split(".");
  if (parts.length < 3) return false;
  return parts.some((p) => /^[a-f0-9]{8,}$/.test(p));
}

/**
 * Main logic
 */
async function main() {
  const cpuCount = cpus().length;
  console.log(
    `[precompress] Starting precompression (cpu=${cpuCount}, concurrency=${CONCURRENCY})`,
  );

  const allFiles = [];
  for (const dir of ASSET_DIRS) {
    await walk(join(DIST_ROOT, dir), allFiles);
  }

  const candidates = allFiles.filter((f) => {
    const e = extname(f).toLowerCase();
    if (!ELIGIBLE.has(e)) return false;
    if (f.endsWith(".gz") || f.endsWith(".br")) return false;
    return true;
  });

  if (candidates.length === 0) {
    console.log("[precompress] No eligible assets found. Exiting.");
    await writeFile(
      MANIFEST_PATH,
      JSON.stringify(
        { generatedAt: new Date().toISOString(), files: {} },
        null,
        2,
      ),
    );
    return;
  }

  console.log(
    `[precompress] Found ${candidates.length} candidate(s) for compression`,
  );

  const manifest = {
    generatedAt: new Date().toISOString(),
    files: {},
  };

  let active = 0;
  let idx = 0;
  let completed = 0;
  const errors = [];

  async function processFile(filePath) {
    try {
      const st = await stat(filePath);
      if (st.size < MIN_SIZE_BYTES) {
        return; // skip small
      }

      const rel = relative(DIST_ROOT, filePath);
      const ext = extname(filePath).toLowerCase();
      const baseContent = await readFile(filePath);
      const sha256 = createHash("sha256")
        .update(baseContent)
        .digest("hex");

      const gzipTarget = `${filePath}.gz`;
      const brotliTarget = `${filePath}.br`;

      // If compressed variants exist and appear up-to-date (size heuristic),
      // you could skip; here we always regenerate for determinism.
      const gzipBuf = await gzipBuffer(baseContent);
      const brotliBuf = await brotliBuffer(baseContent);

      await writeFile(gzipTarget, gzipBuf);
      await writeFile(brotliTarget, brotliBuf);

      manifest.files[rel] = {
        originalBytes: st.size,
        gzBytes: gzipBuf.length,
        brBytes: brotliBuf.length,
        sha256,
        mime: mimeTypeFor(ext),
        immutable: isHashedFile(rel),
        etag: computeEtag(sha256, st.size),
      };

      completed++;
      if (completed % 25 === 0 || completed === candidates.length) {
        console.log(
          `[precompress] Progress: ${completed}/${candidates.length}`,
        );
      }
    } catch (e) {
      errors.push({ file: filePath, error: e.message || String(e) });
      console.error(`[precompress] Error processing ${filePath}:`, e);
    }
  }

  // Simple concurrency pool
  async function next() {
    while (active < CONCURRENCY && idx < candidates.length) {
      const file = candidates[idx++];
      active++;
      processFile(file)
        .catch((e) => {
          errors.push({ file, error: e.message || String(e) });
        })
        .finally(() => {
          active--;
        });
    }
    if (completed + errors.length >= candidates.length) {
      return;
    }
    await sleep(50);
    return next();
  }

  await next();

  // Wait until all done (active == 0)
  while (active > 0) {
    await sleep(25);
  }

  // Write manifest
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(
    `[precompress] Manifest written: ${MANIFEST_PATH} (${Object.keys(manifest.files).length} entries)`,
  );

  if (errors.length) {
    console.error(
      `[precompress] Completed with ${errors.length} error(s). See log above.`,
    );
    process.exitCode = 1;
  } else {
    console.log("[precompress] Completed successfully.");
  }
}

main().catch((err) => {
  console.error("[precompress] Fatal error:", err);
  process.exit(1);
});
