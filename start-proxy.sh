#!/bin/sh
set -e

echo "Waiting for Bun server to start..."
max_wait=30
interval=1
waited=0

# Use nc (netcat) if available for a lighter-weight check, otherwise fall back to curl
if command -v nc > /dev/null; then
  echo "Using 'nc' to check for server readiness on port 8081..."
  while ! nc -z localhost 8081 > /dev/null 2>&1; do
    if [ $waited -ge $max_wait ]; then
      echo "Timeout: Bun server did not start on port 8081 within $max_wait seconds."
      exit 1
    fi
    sleep $interval
    waited=$((waited + interval))
    echo "Waited $waited seconds..."
  done
else
  echo "Using 'curl' to check for server readiness on port 8081..."
  while ! curl --output /dev/null --silent --head --fail http://localhost:8081; do
    if [ $waited -ge $max_wait ]; then
      echo "Timeout: Bun server did not start on port 8081 within $max_wait seconds."
      exit 1
    fi
    sleep $interval
    waited=$((waited + interval))
    echo "Waited $waited seconds..."
  done
fi

echo "Bun server is ready."

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
