# Stage 1: Build Rust proxy
FROM rust:1.91-trixie AS rust-builder

WORKDIR /app

# Copy Rust proxy files
COPY proxy/Cargo.toml proxy/Cargo.lock ./proxy/

# Create a dummy main.rs to cache dependencies
RUN mkdir -p proxy/src && \
  echo "fn main() {}" > proxy/src/main.rs && \
  cd proxy && \
  cargo build --release && \
  rm -rf src

# Copy actual source code and build
COPY proxy/src ./proxy/src
RUN cd proxy && \
  cargo build --release

# Stage 2: Build Vite frontend with Bun
FROM oven/bun:1.3-slim AS node-builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Clear any cached build artifacts and rebuild fresh
RUN rm -rf dist .tanstack node_modules/.cache

# Build the Vite project
RUN bun run build

# Stage 3: Production runtime
FROM oven/bun:1.3-slim

WORKDIR /app

# Install runtime dependencies only
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# Copy built artifacts from previous stages
COPY --from=rust-builder /app/proxy/target/release/proxy ./proxy/target/release/proxy
COPY --from=node-builder /app/dist ./dist

# Copy proxy startup script
COPY start-proxy.sh ./start-proxy.sh
RUN chmod +x ./start-proxy.sh

# Expose ports
# Port 8081 for Bun server (SSR)
# Port 3000 for Rust proxy (public-facing)
EXPOSE 8081 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8081

# Install concurrently for running both processes
RUN bun add concurrently

# Start both Bun server and Rust proxy
CMD ["bun", "run", "serve:prod"]
