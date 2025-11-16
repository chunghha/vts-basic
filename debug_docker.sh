#!/bin/bash

# debug_docker.sh
# Script to debug the Docker container and inspect its contents

set -e

CONTAINER_NAME="vts-basic-app"

echo "🔍 Debugging Docker container: ${CONTAINER_NAME}"
echo ""

# Check if container exists
if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Container '${CONTAINER_NAME}' does not exist."
    echo "Run ./run_on_local_docker.sh first to create the container."
    exit 1
fi

echo "📦 Container status:"
docker ps -a --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "📂 Checking /app directory structure:"
docker exec ${CONTAINER_NAME} ls -la /app || echo "Container not running"
echo ""

echo "📂 Checking /app/dist directory:"
docker exec ${CONTAINER_NAME} ls -la /app/dist || echo "dist directory not found or container not running"
echo ""

echo "📂 Checking /app/proxy directory:"
docker exec ${CONTAINER_NAME} ls -la /app/proxy/target/release || echo "proxy binary not found or container not running"
echo ""

echo "🔧 Checking if proxy binary is executable:"
docker exec ${CONTAINER_NAME} file /app/proxy/target/release/proxy || echo "Cannot check proxy binary or container not running"
echo ""

echo "📝 Last 50 lines of container logs:"
docker logs --tail 50 ${CONTAINER_NAME}
echo ""

echo "💡 To enter the container interactively:"
echo "   docker exec -it ${CONTAINER_NAME} /bin/sh"
echo ""

echo "💡 To manually test the proxy:"
echo "   docker exec ${CONTAINER_NAME} /app/proxy/target/release/proxy"
echo ""
