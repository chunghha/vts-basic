#!/bin/sh
set -e

echo "Waiting for Bun server to start..."
BUN_HOST="${BUN_HOST:-127.0.0.1}"
BUN_PORT="${BUN_PORT:-8081}"
echo "Checking $BUN_HOST:$BUN_PORT..."

# If `nc` (netcat) is available, poll the Bun server until it responds or a timeout is reached.
# Otherwise fall back to the original short sleep so this script still works in minimal environments.
if command -v nc >/dev/null 2>&1; then
  timeout=30
  elapsed=0
  while ! nc -z "$BUN_HOST" "$BUN_PORT" >/dev/null 2>&1; do
    if [ "$elapsed" -ge "$timeout" ]; then
      echo "Bun server did not become available after $timeout seconds"
      exit 1
    fi
    sleep 1
    elapsed=$((elapsed + 1))
  done
  echo "Bun server is up"
else
  echo "nc not found; falling back to sleep 2"
  sleep 2
fi


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
