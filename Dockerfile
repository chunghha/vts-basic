# --------------------------------------------------------------------
# Multi-stage build: Rust + Bun build phases, unified minimal runtime
# --------------------------------------------------------------------

# Stage 1: Build Rust proxy (glibc build on a consistent base image)
FROM debian:trixie-slim AS rust-builder

# Install build dependencies and Rust toolchain
RUN apt-get update && \
  apt-get install -y --no-install-recommends curl build-essential ca-certificates && \
  rm -rf /var/lib/apt/lists/*

# Install rustup and set default toolchain
ENV RUSTUP_HOME=/usr/local/rustup \
  CARGO_HOME=/usr/local/cargo \
  PATH=/usr/local/cargo/bin:$PATH
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain 1.91.0 && \
  ls -l "$CARGO_HOME"/bin && \
  find / -name cargo 2>/dev/null

WORKDIR /app

# Copy Rust proxy manifest files first (cache dependencies)
COPY proxy/Cargo.toml proxy/Cargo.lock ./proxy/

# Copy actual source and build release binary
COPY proxy/src ./proxy/src
ARG CACHEBUST=1
RUN echo "Rust cache bust: ${CACHEBUST}" && \
  cd proxy && \
  cargo build --release

# Stage 2: Build Bun/Vite assets (client + server)
FROM oven/bun:1.3-slim AS bun-builder

WORKDIR /app

# Copy dependency manifests
COPY package.json bun.lock ./

# Install all deps (include dev for build)
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Clean any stale build artifacts
RUN rm -rf dist .tanstack node_modules/.cache

# Build SSR + client
RUN bun run build

# Stage 3: Unified runtime (Debian slim + Bun + proxy binary)
FROM debian:trixie-slim AS runtime

# Set non-interactive
ENV DEBIAN_FRONTEND=noninteractive

# Install runtime necessities: curl (for healthcheck), CA certs, minimal libs
RUN apt-get update && \
  apt-get install -y --no-install-recommends bash curl ca-certificates libssl3 unzip && \
  rm -rf /var/lib/apt/lists/*

# Install Bun (download official binary)
RUN curl -fsSL https://bun.sh/install | bash && \
  cp /root/.bun/bin/bun /usr/local/bin/bun && \
  chmod 755 /usr/local/bin/bun

WORKDIR /app

# Environment defaults
ENV NODE_ENV=production \
  PORT=8081 \
  RUST_LOG=info

# Copy production dependency manifests & install prod deps only
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# Copy built application artifacts
COPY --from=bun-builder /app/dist ./dist
# Copy proxy release binary (glibc build)
COPY --from=rust-builder /app/proxy/target/release/proxy ./proxy/target/release/proxy

# Ensure the Rust proxy can read the source CSS used for theme parsing.
# We copy the original src/styles.css into the runtime image at ./src/styles.css.
COPY src/styles.css ./src/styles.css

# Create non-root user for security
RUN useradd -r -u 1001 -d /app -s /usr/sbin/nologin appuser && \
  chown -R appuser:appuser /app

# Copy standalone entrypoint script (kept in repository root)
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose public (proxy) and internal (SSR) ports
EXPOSE 3000 8081

# Healthcheck targets proxy (public interface)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fs http://127.0.0.1:3000/ || exit 1

USER appuser

ENTRYPOINT ["/app/entrypoint.sh"]
