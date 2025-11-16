# 0001: Docker Deployment for VTS Basic

**Date**: 2025-11-16  
**Status**: Implemented  
**Type**: Infrastructure

## Context and Problem Statement

VTS Basic is a React application built with TanStack Start (SSR), using Bun as the runtime and Vite for building. For production deployment, we needed a containerized solution that could:

1. Serve the application efficiently in production
2. Handle both static assets and server-side rendering
3. Be easily deployable to any Docker-compatible environment
4. Provide a clear separation between the frontend build and the serving layer

### Initial Challenges

The initial `start:prod` script was doing too much in a single command:
```bash
"start:prod": "bun run build && cargo build --release --manifest-path server/Cargo.toml && concurrently \"PORT=8081 bun run dist/server/server.js\" \"./server/target/release/server\""
```

This was:
- Hard to debug
- Difficult to run parts independently
- Not suitable for containerization
- Mixed concerns (building and serving)

### Why a Proxy Server?

The Bun server handles SSR on port 8081, but we wanted a more robust solution for production that could:
- Efficiently serve static assets (CSS, JS, images)
- Act as a reverse proxy for API/SSR requests
- Provide better performance for static content
- Allow for future enhancements (caching, rate limiting, etc.)

**Decision**: Implement a Rust-based proxy server using Axum and Tokio for high performance and efficiency.

## Architecture Decision

### Multi-Process Architecture

```
Browser → Rust Proxy (port 3000) → Bun Server (port 8081)
               ↓ (static assets)
          dist/client/
```

**Rust Proxy** (`proxy/`):
- Serves static files from `dist/client/assets/`
- Proxies all other requests to Bun server on port 8081
- Public-facing on port 3000
- Efficient, compiled binary with minimal overhead

**Bun Server**:
- Handles SSR and API routes
- Runs on port 8081 (internal)
- Generates HTML with asset references

### Why Rust for the Proxy?

1. **Performance**: Native binary, zero runtime overhead
2. **Efficiency**: Low memory footprint, fast static file serving
3. **Reliability**: Strong type system, compile-time guarantees
4. **Learning**: Good opportunity to introduce Rust to the project
5. **Production-ready**: Axum/Tokio are battle-tested for production use

### Alternative Considered: Nginx

We could have used Nginx as the proxy, but chose Rust because:
- Easier to customize and extend
- Better integration with the project (source code in repo)
- Single Docker image without external dependencies
- More control over proxy logic

## Implementation

### 1. Renamed `server/` to `proxy/`

The Rust component's role is specifically as a proxy, not a general server. This naming better reflects its purpose and avoids confusion with the Bun server.

### 2. Split Production Scripts

**Before**:
```json
{
  "start:prod": "bun run build && cargo build --release --manifest-path server/Cargo.toml && concurrently ..."
}
```

**After**:
```json
{
  "build:prod": "bun run build && bun run validate && cargo build --release --manifest-path proxy/Cargo.toml",
  "serve:prod": "concurrently \"PORT=8081 bun run dist/server/server.js\" \"./start-proxy.sh\"",
  "start:prod": "bun run build:prod && bun run serve:prod"
}
```

Benefits:
- Separation of concerns (build vs serve)
- Can rebuild without restarting servers
- Easier to debug individual components
- Validates assets before deployment

### 3. Multi-Stage Docker Build

Created `Dockerfile` with three stages:

**Stage 1: Rust Builder** (`rust:1.91-trixie`)
- Compiles the Rust proxy in release mode. The `trixie` base image uses the standard GNU toolchain (glibc), not MUSL, for broader compatibility.
- Uses dependency caching (dummy build → real build)
- Strips binary for smaller size (removed later for debugging)

**Stage 2: Vite/Bun Builder** (`oven/bun:1.3-slim`)
- Installs Node dependencies
- Builds Vite assets (client + server)
- Clears cache directories before build

**Stage 3: Unified Runtime** (`debian:trixie-slim`)
- Minimal Debian base, installs required runtime packages (curl, ca-certificates, unzip, libssl3, bash)
- Installs Bun manually (copies binary to `/usr/local/bin/bun` with proper permissions)
- Copies built `dist/` assets and the release proxy binary
- Drops privileges to non-root `appuser`
- Uses a standalone `entrypoint.sh` supervisor instead of `concurrently`
  - Starts Bun SSR first on port 8081
  - Waits for readiness (HTTP probe)
  - Starts Rust proxy on port 3000
  - Monitors both; exits if either dies
  - Forwards termination signals for graceful shutdown

### 4. Build Validation Script

Created `validate-build.js` to catch asset hash mismatches:

**Problem**: TanStack Start generates asset hashes (e.g., `styles-ABC123.css`) during build. Sometimes the hashes in the server manifest don't match actual files, causing 404 errors in production.

**Solution**: Validation script that:
1. Extracts asset references from manifest files
2. Checks if referenced files exist in `dist/client/assets/`
3. Reports mismatches with suggestions for similar files
4. Exits with error if validation fails

This is integrated into `build:prod`, so builds fail early if assets don't match.

### 5. Convenience Scripts

**`run_on_local_docker.sh`**:
- One-command Docker build and run
- Cleans up existing containers
- Shows logs and status

**`debug_docker.sh`**:
- Inspects container contents
- Checks file structure
- Helps debug deployment issues

**`entrypoint.sh`** (replaces prior `start-proxy.sh` + `concurrently` usage):
- Supervises two processes (Bun SSR, Rust proxy)
- Performs readiness wait loop for SSR before starting proxy
- Exits if either child dies (clear failure semantics)
- Graceful signal forwarding (SIGINT / SIGTERM)
- Provides timestamped structured shell logs

### 6. Enhanced Proxy Logging

Switched to `tracing` macros (integrated with `tracing_subscriber`) for structured logging instead of raw `println!/eprintln!`:
```rust
tracing::info!("Proxy server listening on http://localhost:3000");
tracing::info!("Proxying requests to http://127.0.0.1:8081");
tracing::error!("Failed to bind to port 3000: {}", e);
```

Advantages:
- Unified log level control via `RUST_LOG`
- Consistent formatting and timestamps
- Plays well with future aggregation / observability tooling

### 7. Documentation

Created comprehensive documentation:
- **DOCKER.md** (this file): Complete Docker deployment guide
- **README.md**: Updated with proxy info and validation steps
- **Troubleshooting**: Common issues and solutions

## Results

### What Works

- **Multi-stage Docker build**: Clean separation of build concerns  
- **Rust proxy**: Efficiently serves static assets and proxies requests  
- **Build validation**: Catches asset mismatches before deployment  
- **Convenience scripts**: Easy local testing and debugging  
- **Comprehensive docs**: Clear guide for deployment  

### Known Issues

- **Asset Hash Inconsistency**: Occasionally, Docker builds generate different asset hashes than local builds, causing manifest mismatches. The validation script catches this, but root cause is unclear (likely Vite/TanStack Start caching).

**Workaround**:
```bash
rm -rf dist .tanstack node_modules/.cache
docker build --pull --no-cache -t vts-basic:latest .
```

## Usage

### Development
```bash
bun run dev
```

### Production (Local)
```bash
bun run start:prod
# or separately:
bun run build:prod
bun run serve:prod
```

### Production (Docker)
```bash
./run_on_local_docker.sh
# or manually:
docker build -t vts-basic:latest .
docker run -d --name vts-basic-app -p 3000:3000 -p 8081:8081 vts-basic:latest
```

Access at: http://localhost:3000

### Validation
```bash
bun run validate
```

## File Structure

```
vts-basic/
├── Dockerfile                    # Multi-stage Docker build
├── .dockerignore                 # Excludes dist/, node_modules/, etc.
├── run_on_local_docker.sh        # Convenience: build + run
├── debug_docker.sh               # Debug container contents
├── entrypoint.sh                 # Unified supervisor for Bun SSR + proxy
├── validate-build.js             # Asset validation script
├── proxy/                        # Rust proxy server
│   ├── Cargo.toml                # (renamed from server)
│   └── src/main.rs               # Axum proxy implementation
├── docs/
│   └── rationale/
│       └── 0001_docker_deployment.md  # This document
└── package.json                  # Updated scripts
```

## Future Improvements

1. **Fix Asset Hash Determinism**: Investigate why Docker and local builds sometimes generate different hashes
2. **Health Checks**: Add Docker HEALTHCHECK for container orchestration
3. **Metrics**: Add Prometheus metrics to proxy
4. **Caching**: Add cache headers and CDN integration
5. **Security**: Run as non-root user in Docker
6. **Image Size**: Reduce from ~520MB using distroless base
7. **Testing**: Add integration tests for Docker deployment

## References

- TanStack Start: https://tanstack.com/start
- Axum Web Framework: https://github.com/tokio-rs/axum
- Docker Multi-stage Builds: https://docs.docker.com/build/building/multi-stage/
- Bun Runtime: https://bun.sh/

## Lessons Learned

1. **Naming Matters**: Renaming `server/` to `proxy/` clarified the architecture
2. **Split Scripts**: Separating build and serve made debugging much easier
3. **Validation is Key**: Asset validation caught numerous deployment issues
4. **Logging Matters**: Using `eprintln!` vs `println!` was crucial for Docker logs
5. **Document Everything**: Comprehensive docs save future debugging time