#!/bin/sh
set -e

echo "Waiting for Bun server to start..."
sleep 2

echo "Starting proxy server..."
cd /app
export RUST_LOG=info
exec ./proxy/target/release/proxy 2>&1
