#!/bin/bash

# run_on_local_docker.sh
# Script to build and run VTS Basic application in Docker locally

set -e  # Exit on any error

IMAGE_NAME="vts-basic"
CONTAINER_NAME="vts-basic-app"
TAG="latest"

echo "🏗️  Building Docker image: ${IMAGE_NAME}:${TAG}"
docker build -t ${IMAGE_NAME}:${TAG} .

echo ""
echo "🧹 Cleaning up existing container (if any)..."
docker rm -f ${CONTAINER_NAME} 2>/dev/null || true

echo ""
echo "🚀 Starting container: ${CONTAINER_NAME}"
docker run -d \
  --name ${CONTAINER_NAME} \
  -p 3000:3000 \
  -p 8081:8081 \
  ${IMAGE_NAME}:${TAG}

echo ""
echo "✅ Container started successfully!"
echo ""
echo "🔍 Checking container status..."
sleep 2
docker ps -a --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "📊 Container logs:"
docker logs ${CONTAINER_NAME}

echo ""
echo "Press Ctrl+C to stop following logs (container will keep running)"
echo "To stop the container: docker stop ${CONTAINER_NAME}"
echo "To remove the container: docker rm -f ${CONTAINER_NAME}"
echo ""
docker logs -f ${CONTAINER_NAME}
