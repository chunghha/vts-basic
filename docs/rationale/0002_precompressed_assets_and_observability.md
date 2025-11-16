# 0002: Precompressed Static Assets & Observability Enhancements

## 1. Summary

We introduced build-time precompression (gzip + brotli) for static assets and upgraded observability in the Rust proxy by adding:
- Structured JSON logging (opt-in via `LOG_FORMAT=json`)
- Prometheus-format metrics (request counters, latency histograms, error counters)
- Graceful shutdown handling
- Conditional serving of `.br` / `.gz` variants based on `Accept-Encoding`
- Stronger cache directives for hashed assets

This document captures the rationale, trade-offs, implementation details, and operational guidance.

---

## 2. Context

The application consists of:
- Bun-based SSR (dynamic HTML and API responses)
- A Rust proxy that serves static assets and reverse-proxies unmatched routes

Initially, the proxy served files uncompressed and had only simple tracing logs. As traffic scales, bandwidth efficiency, TTFB, cacheability, and production diagnostics become more critical.

---

## 3. Problem Statement

Prior approach deficiencies:
1. Static assets were sent uncompressed (larger payloads, slower cold loads).
2. No differentiation between hashed (immutable) and non-hashed (mutable) resources for caching headers.
3. Limited observability: no per-request metrics or latency instrumentation.
4. Logging lacked consistent machine-readable structure.
5. Proxy termination was abrupt (no graceful shutdown path).
6. Asset compression performed on-demand would increase per-request CPU cost if added naïvely.

---

## 4. Goals

- Reduce initial page load and repeat asset fetch times via precompression.
- Maintain deterministic build artifacts (explicit manifest).
- Provide clear, structured logs for ingestion by centralized logging tools.
- Instrument request volume and latency to support SLO tracking.
- Enable safe, graceful shutdown without dropping in-flight requests.
- Preserve simplicity (avoid introducing heavyweight external services inside the container).

---

## 5. Non-Goals

- Introducing full OpenTelemetry tracing spans across services (deferred).
- Runtime dynamic content negotiation beyond brotli/gzip/original.
- Content fingerprinting stronger than existing hashed filenames.
- CDN configuration (left for infrastructure layer).
- Automatic purge logic for old asset versions.

---

## 6. Decision: Build-Time Precompression

### 6.1 Asset Selection

Eligible extensions:
```
.js, .mjs, .cjs, .css, .html, .svg, .json, .txt, .wasm
```
Rationale: These are text or semi-text (WASM compresses reasonably) and benefit from gzip/brotli.

### 6.2 Threshold

Skip files < 512 bytes (header overhead > savings). This reduces negligible wins and build time.

### 6.3 Compression Parameters

- Gzip: level 9 (maximum compression; one-time cost at build)
- Brotli: quality 11, generic mode

Rationale: CPU cost shifted entirely to build phase. Serving is constant-time file read.

### 6.4 Manifest

Generated at `dist/client/asset-compression-manifest.json` with fields:
- `originalBytes`, `gzBytes`, `brBytes`
- `sha256` (content hash of original)
- `etag` (weak format derived from sha256 + size)
- `mime`
- `immutable` (true if filename contains a hex hash segment)

Uses deterministic JSON structure (stable for diff review).

### 6.5 Serving Logic

Replaced `ServeDir` for `/assets` with a custom handler:
1. Parse the request path.
2. Inspect `Accept-Encoding` header.
3. Prefer brotli (`.br`) > gzip (`.gz`) > original.
4. Set:
   - `Content-Encoding` when serving compressed variant
   - `Content-Type` from original extension
   - `Cache-Control`:
     - Hashed: `public, max-age=31536000, immutable`
     - Non-hashed: `no-cache`
   - `ETag`: weak, derived from file content
   - `Vary: Accept-Encoding`

### 6.6 Hashed Filename Heuristic

A filename is considered hashed if any segment (split by `.`) has ≥ 8 hex characters.
Example: `app.8f3a9c1d.js` → immutable.

### 6.7 Trade-offs

| Aspect | Benefit | Drawback | Mitigation |
|--------|---------|----------|------------|
| Build-time CPU | One-time cost | Longer build | Parallel compression (concurrency=8) |
| Disk space | More artifacts (.gz/.br) | Larger image size | Text compresses well; increased size modest |
| Complexity | Custom route logic | Additional code paths | Unit/integration tests + manifest |
| Serving dynamic HTML | Not precompressed | Some CPU headroom lost | SSR responses rarely large & vary by content |

### 6.8 Risks

- Missing compressed file fallback handled (returns original).
- Manifest divergence if build skipped → Acceptable; runtime does not require the manifest for core function.

---

## 7. Decision: Observability Enhancements

### 7.1 Structured Logging

`LOG_FORMAT=json` enables flattened JSON events:
- RFC 3339 timestamps
- Targets (`proxy`, `tower_http`)
- Request spans (method, path, upstream, status)

Fallback to human-readable text by default.

### 7.2 Metrics

Added Prometheus exporter (default port `9000`):
- Counters:
  - `proxy_requests_total` (labels: method, path)
  - `proxy_upstream_errors_total` (labels: error string)
- Histograms:
  - `proxy_upstream_latency_seconds` (labels: method, path, status or "error")

Rationale: Direct Prometheus compatibility without external dependencies inside container.

### 7.3 Graceful Shutdown

Intercepts:
- `Ctrl+C` (SIGINT)
- `SIGTERM` (Unix)
Process:
1. Log receipt
2. Short drain delay (100ms) to allow accept loop to settle
3. Exit with code 0 if clean

### 7.4 Compression Middleware Interaction

`CompressionLayer` remains for proxied dynamic responses. Static assets use precompressed variants—not recompressed—to avoid double compression or wasted cycles.

### 7.5 Future Observability Extensions

| Feature | Value | Status |
|---------|-------|--------|
| OpenTelemetry spans | Distributed tracing | Deferred |
| Custom histogram buckets | Tuning latency resolution | Possible |
| Exemplars | High-cardinality linking | Deferred |
| Error classification | Better alerting | Manual label conventions needed |

---

## 8. Alternative Approaches Considered

| Alternative | Reason Rejected |
|-------------|-----------------|
| On-the-fly compression | Per-request CPU overhead; harder to scale |
| CDN-managed compression only | Still beneficial to ship precompressed for fallback/self-host |
| Using external reverse proxy (nginx) for compression | Increased ops surface; Rust solution sufficient |
| Embedding asset manifest into binary | Adds build coupling; manifest as file is simpler |
| Full OpenTelemetry adoption immediately | Higher complexity; incremental metrics sufficient now |

---

## 9. Security Considerations

- Serving only files under `dist/client/assets`; no directory traversal (path segments sanitized by route).
- Compressed variants share same ETag logic; no separate injection vectors.
- SHA256 used purely for metadata (not security enforcement).
- Long cache assets must remain immutable; ensure build process regenerates new hashed filenames per change.

---

## 10. Operational Guidance

### 10.1 Build Pipeline

Add after existing build:
```
bun run build
bun run precompress
```

### 10.2 Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `PROXY_PORT` | Public listener | 3000 |
| `SSR_UPSTREAM_HOST` | SSR host | 127.0.0.1 |
| `SSR_UPSTREAM_PORT` | SSR port | 8081 |
| `ASSET_DIR` | Root static directory | dist/client |
| `METRICS_PORT` | Prometheus exporter | 9000 |
| `LOG_FORMAT` | `json` for structured | text |

### 10.3 Health & Monitoring

Scrape:
```
GET http://<host>:9000/metrics
```
Track:
- Request volume growth (`proxy_requests_total`)
- Latency distribution (`proxy_upstream_latency_seconds`)
- Error frequency spikes (`proxy_upstream_errors_total`)

### 10.4 Log Aggregation

Recommend routing container `stderr` to centralized collector. JSON format allows field extraction:
- `level`
- `target`
- `message` / structured keys

### 10.5 Rolling Deploys

1. Start new container(s); ensure readiness once SSR is available.
2. Drain old instances with SIGTERM; graceful shutdown prevents abrupt drop.
3. Validate metrics continuity across roll.

---

## 11. Rollback Plan

If issues arise (e.g., clients failing to decode brotli):
1. Set an env flag (future improvement) or temporarily comment out precompress invocation and rebuild.
2. Remove custom `/assets/*path` route (revert to `ServeDir`) if logic regression suspected.
3. Disable JSON logging to simplify parsing (set `LOG_FORMAT=text`).
4. Restart deployment.

Because original uncompressed files remain, fallback is always available.

---

## 12. Future Improvements

| Item | Description |
|------|-------------|
| Integrity (SRI) | Add `<script integrity>` tags via manifest |
| Strong ETags | Persist content hash independent of modified time |
| Precompress fonts/images | Selectively for `.woff2` (already compressed) skip; consider `.xml`, `.map` |
| Manifest signature | Sign manifest for tamper detection (low priority internally) |
| Bucket tuning | Adjust histogram buckets for latency SLOs |
| CDN hints | Add `Link: rel=preload` where beneficial |

---

## 13. Appendix: Docker Adjustments

Add precompression:
```
# After build
RUN bun run build && bun run precompress
```

No runtime changes required; proxy auto-detects `.br` / `.gz` alongside originals.

---

## 14. Acceptance Criteria Verification

| Criterion | Met |
|-----------|-----|
| Static assets served with compression when supported | Yes |
| Original assets served when encoding unsupported | Yes |
| Long-term caching for hashed filenames | Yes |
| Structured logs optional | Yes |
| Metrics exposed in Prometheus format | Yes |
| Graceful shutdown implemented | Yes |
| Build deterministic with manifest | Yes |

---

## 15. Conclusion

Precompression and enhanced observability provide tangible performance and operational gains without adding heavy complexity. The approach balances build-time cost vs. runtime efficiency, and lays groundwork for future incremental improvements (SRI, tracing, richer metrics). This change is considered production-ready and maintainable.
