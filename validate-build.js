#!/usr/bin/env node

/**
 * validate-build.js
 *
 * Validates that all asset references in the built server.js match actual files
 * in the dist/client directory. This catches hash mismatches that can cause
 * 404 errors in production.
 *
 * Usage: node validate-build.js
 * or: bun validate-build.js
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const DIST_SERVER = "dist/server/server.js";
const DIST_SERVER_ASSETS = "dist/server/assets";
const DIST_CLIENT = "dist/client";
const DIST_CLIENT_ASSETS = "dist/client/assets";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`✗ ${message}`, "red");
}

function logSuccess(message) {
  log(`✓ ${message}`, "green");
}

function logWarning(message) {
  log(`⚠ ${message}`, "yellow");
}

function logInfo(message) {
  log(`ℹ ${message}`, "cyan");
}

function findAllFiles(dir, fileList = []) {
  if (!existsSync(dir)) {
    return fileList;
  }

  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      findAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function extractAssetReferences(serverJsContent) {
  const references = new Set();

  // Match asset paths in various formats
  const patterns = [
    // href="/assets/..."
    /href=["']\/assets\/([^"']+)["']/g,
    // src="/assets/..."
    /src=["']\/assets\/([^"']+)["']/g,
    // /assets/... in strings
    /["']\/assets\/([^"']+)["']/g,
    // import('/assets/...')
    /import\(["']\/assets\/([^"']+)["']\)/g,
  ];

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(serverJsContent)) !== null) {
      references.add(`assets/${match[1]}`);
    }
  });

  return Array.from(references);
}

function extractManifestReferences(manifestContent) {
  const references = new Set();

  // Match asset paths in manifest files
  const patterns = [
    // "preloads": ["/assets/..."]
    /"preloads":\s*\[([^\]]+)\]/g,
    // "clientEntry": "/assets/..."
    /"clientEntry":\s*"\/assets\/([^"]+)"/g,
    // Any /assets/... in strings
    /"\/assets\/([^"]+)"/g,
  ];

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(manifestContent)) !== null) {
      if (match[1].includes("/assets/")) {
        // Extract all asset paths from arrays
        const assetMatches = match[1].matchAll(/"\/assets\/([^"]+)"/g);
        for (const assetMatch of assetMatches) {
          references.add(`assets/${assetMatch[1]}`);
        }
      } else {
        references.add(`assets/${match[1]}`);
      }
    }
  });

  return Array.from(references);
}

function validateBuild() {
  logInfo("Starting build validation...\n");

  // Check if dist/server/server.js exists
  if (!existsSync(DIST_SERVER)) {
    logError(`Server build not found: ${DIST_SERVER}`);
    logInfo('Run "bun run build" first to generate the build.');
    process.exit(1);
  }

  // Check if dist/client exists
  if (!existsSync(DIST_CLIENT)) {
    logError(`Client build not found: ${DIST_CLIENT}`);
    logInfo('Run "bun run build" first to generate the build.');
    process.exit(1);
  }

  logSuccess(`Found server build: ${DIST_SERVER}`);
  logSuccess(`Found client build directory: ${DIST_CLIENT}\n`);

  // Read server.js
  const serverJsContent = readFileSync(DIST_SERVER, "utf-8");

  // Extract asset references from server.js
  logInfo("Extracting asset references from server.js...");
  const serverReferences = extractAssetReferences(serverJsContent);

  // Check for manifest files and extract references
  const manifestReferences = [];
  if (existsSync(DIST_SERVER_ASSETS)) {
    logInfo("Checking manifest files...");
    const manifestFiles = findAllFiles(DIST_SERVER_ASSETS).filter(
      (f) => f.includes("manifest") && f.endsWith(".js"),
    );

    manifestFiles.forEach((manifestFile) => {
      const manifestContent = readFileSync(manifestFile, "utf-8");
      const refs = extractManifestReferences(manifestContent);
      manifestReferences.push(...refs);
    });

    if (manifestReferences.length > 0) {
      logSuccess(
        `Found ${manifestReferences.length} asset reference(s) in manifest files`,
      );
    }
  }

  // Combine all references
  const allReferences = [
    ...new Set([...serverReferences, ...manifestReferences]),
  ];
  const assetReferences = allReferences;

  if (assetReferences.length === 0) {
    logWarning("No asset references found in server.js or manifest files");
    logInfo("This might be expected if assets are loaded dynamically.\n");
  } else {
    logSuccess(`Total: ${assetReferences.length} unique asset reference(s)\n`);
  }

  // Get all actual files in dist/client
  const actualFiles = findAllFiles(DIST_CLIENT).map((file) =>
    relative(DIST_CLIENT, file).replace(/\\/g, "/"),
  );

  logInfo(`Found ${actualFiles.length} file(s) in ${DIST_CLIENT}\n`);

  // Validate each reference
  let hasErrors = false;
  let missingFiles = [];
  let foundFiles = [];

  assetReferences.forEach((ref) => {
    const filePath = join(DIST_CLIENT, ref);

    if (existsSync(filePath)) {
      foundFiles.push(ref);
      logSuccess(`Found: /assets/${ref.split("assets/")[1]}`);
    } else {
      hasErrors = true;
      missingFiles.push(ref);
      logError(`Missing: /assets/${ref.split("assets/")[1]}`);

      // Try to find similar files
      const filename = ref.split("/").pop();
      const baseFilename = filename.split("-")[0]; // Get base name before hash
      const extension = filename.split(".").pop();

      const similarFiles = actualFiles.filter(
        (file) => file.includes(baseFilename) && file.endsWith(`.${extension}`),
      );

      if (similarFiles.length > 0) {
        logWarning(`  Similar files found:`);
        similarFiles.forEach((similar) => {
          logWarning(`    - ${similar}`);
        });
      }
    }
  });

  console.log();
  log("═".repeat(60), "blue");

  if (hasErrors) {
    logError(`Validation FAILED: ${missingFiles.length} missing asset(s)`);
    log("═".repeat(60), "blue");
    console.log();

    logError("Asset hash mismatch detected!");
    logInfo("The build manifest references assets that do not exist.");
    logInfo("This usually means:");
    logInfo("  - The server was built with stale asset references");
    logInfo("  - Build caching caused inconsistent hashes");
    logInfo("  - The build process is not deterministic");
    console.log();
    logInfo("Try these solutions:");
    logInfo(
      "  1. Clean build: rm -rf dist .tanstack node_modules/.cache && bun run build",
    );
    logInfo(
      "  2. Reinstall dependencies: rm -rf node_modules && bun install && bun run build",
    );
    logInfo("  3. Clear Docker build cache: docker builder prune");
    logInfo(
      "  4. Check if you are copying dist/ during Docker build (should be excluded)",
    );
    console.log();

    process.exit(1);
  } else if (assetReferences.length === 0) {
    logWarning("No asset references found - unable to validate");
    log("═".repeat(60), "blue");
    console.log();
    logWarning("Build validation incomplete!");
    logInfo(
      "The validation script could not find asset references to validate.",
    );
    logInfo("This may indicate that assets are loaded entirely at runtime.");
    console.log();
    process.exit(0);
  } else {
    logSuccess(
      `Validation PASSED: All ${assetReferences.length} asset reference(s) found`,
    );
    log("═".repeat(60), "blue");
    console.log();
    logSuccess("Build is valid and ready for deployment!");
    console.log();

    // Show summary
    if (assetReferences.length > 0) {
      logInfo("Asset Summary:");
      const jsFiles = foundFiles.filter((f) => f.endsWith(".js")).length;
      const cssFiles = foundFiles.filter((f) => f.endsWith(".css")).length;
      const otherFiles = foundFiles.length - jsFiles - cssFiles;

      if (jsFiles > 0) logInfo(`  - ${jsFiles} JavaScript file(s)`);
      if (cssFiles > 0) logInfo(`  - ${cssFiles} CSS file(s)`);
      if (otherFiles > 0) logInfo(`  - ${otherFiles} other file(s)`);
      console.log();
    }

    process.exit(0);
  }
}

// Run validation
try {
  validateBuild();
} catch (error) {
  console.error();
  logError("Validation failed with error:");
  console.error(error);
  process.exit(1);
}
