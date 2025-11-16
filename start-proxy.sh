#!/bin/sh
set -e

echo "Waiting for Bun server to start..."
sleep 2

echo "Starting proxy server..."
# Resolve script directory (works both locally and in container)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Determine proxy binary path (prefer container location if present)
if [ -x /app/proxy/target/release/proxy ]; then
  PROXY_BIN=/app/proxy/target/release/proxy
elif [ -x "$SCRIPT_DIR/proxy/target/release/proxy" ]; then
  PROXY_BIN="$SCRIPT_DIR/proxy/target/release/proxy"
else
  echo "Proxy binary not found. Expected at /app/proxy/target/release/proxy or $SCRIPT_DIR/proxy/target/release/proxy"
  exit 1
fi

export RUST_LOG="${RUST_LOG:-info}"
exec "$PROXY_BIN" 2>&1
