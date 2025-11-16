# Docker Quick Start Guide

This guide reflects the updated runtime architecture:
- Multi-stage build produces a Rust proxy binary and Bun-built SSR/client assets.
- Final runtime image is based on `debian:trixie-slim` (not the Bun slim image).
- Bun is installed manually and a non-root user (`appuser`) is used.
- A standalone `entrypoint.sh` supervises both the Bun SSR server (port 8081) and the Rust proxy (port 3000).

Quick reference for common Docker commands and workflows with VTS Basic.

## Build and Run

### One Command (Recommended)
```bash
./run_on_local_docker.sh
```

### Manual Steps
```bash
# Build the image
docker build -t vts-basic:latest .

# Run the container
docker run -d \
  --name vts-basic-app \
  -p 3000:3000 \
  -p 8081:8081 \
  vts-basic:latest

# View logs
docker logs -f vts-basic-app
```

## Common Commands

### Container Management
```bash
# Stop the container
docker stop vts-basic-app

# Start the container
docker start vts-basic-app

# Restart the container
docker restart vts-basic-app

# Remove the container
docker rm vts-basic-app

# Stop and remove in one command
docker rm -f vts-basic-app
```

### Logs and Debugging
```bash
# View logs
docker logs vts-basic-app

# Follow logs (live tail)
docker logs -f vts-basic-app

# Last 50 lines
docker logs --tail 50 vts-basic-app

# Debug container with interactive shell
docker exec -it vts-basic-app sh

# Run debug script
./debug_docker.sh
```

### Image Management
```bash
# List images
docker images | grep vts-basic

# Remove old image
docker rmi vts-basic:latest

# Clean up dangling images
docker image prune

# Remove all unused images
docker image prune -a
```

### Build Options
```bash
# Build with no cache (fresh build)
docker build --no-cache -t vts-basic:latest .

# Pull latest base images before building
docker build --pull -t vts-basic:latest .

# Both no-cache and pull
docker build --pull --no-cache -t vts-basic:latest .

# Build with specific tag
docker build -t vts-basic:v1.0.0 .
```

### Inspect Container
```bash
# View container details
docker inspect vts-basic-app

# Check container status
docker ps -a | grep vts-basic

# View container resource usage
docker stats vts-basic-app

# View container processes
docker top vts-basic-app
```

### Clean Up Everything
```bash
# Stop and remove container
docker stop vts-basic-app && docker rm vts-basic-app

# Remove image
docker rmi vts-basic:latest

# Clean up build cache
docker builder prune

# Nuclear option: remove all stopped containers, unused images, and build cache
docker system prune -a
```

## Troubleshooting

### Port Already in Use
```bash
# Find what's using port 3000
lsof -i:3000

# Or for port 8081
lsof -i:8081

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Container Keeps Exiting
```bash
# Check exit code and logs
docker ps -a | grep vts-basic
docker logs vts-basic-app

# Check if ports are available
docker run -d --name vts-basic-app -p 3001:3000 -p 8082:8081 vts-basic:latest
```

### Build Failures
```bash
# Clean everything and rebuild
rm -rf dist .tanstack node_modules/.cache
docker build --pull --no-cache -t vts-basic:latest .
```

### Asset 404 Errors
```bash
# Validate build locally first
bun run validate

# If validation passes, rebuild Docker
docker build --pull --no-cache -t vts-basic:latest .
```

## Development Workflow

### Typical Development Cycle
```bash
# 1. Make changes to code
# 2. Test locally
bun run dev

# 3. Build and validate
bun run build:prod

# 4. Rebuild Docker image
docker build -t vts-basic:latest .

# 5. Stop old container and start new one
docker stop vts-basic-app && docker rm vts-basic-app
docker run -d --name vts-basic-app -p 3000:3000 -p 8081:8081 vts-basic:latest

# Or use the convenience script
./run_on_local_docker.sh
```

### Quick Rebuild
```bash
# If only source code changed (not dependencies)
docker build -t vts-basic:latest . && \
docker stop vts-basic-app && \
docker rm vts-basic-app && \
docker run -d --name vts-basic-app -p 3000:3000 -p 8081:8081 vts-basic:latest
```

## Environment Variables

### Custom Port
```bash
docker run -d \
  --name vts-basic-app \
  -e PORT=9000 \
  -p 3000:3000 \
  -p 9000:9000 \
  vts-basic:latest
```

### Multiple Environment Variables
```bash
docker run -d \
  --name vts-basic-app \
  -e NODE_ENV=production \
  -e PORT=8081 \
  -e LOG_LEVEL=debug \
  -p 3000:3000 \
  -p 8081:8081 \
  vts-basic:latest
```

## Docker Compose (Optional)

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  vts-basic:
    build: .
    container_name: vts-basic-app
    ports:
      - "3000:3000"
      - "8081:8081"
    environment:
      - NODE_ENV=production
      - PORT=8081
    restart: unless-stopped
```

Then use:
```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## URLs

- **Public Application**: http://localhost:3000
- **Bun Server (debug)**: http://localhost:8081
- **Proxy serves**: Static assets from `/assets/*`
- **Proxy proxies**: All other requests to Bun server

## Success Indicators

When the container is running correctly, you should see logs similar to:
```
[startup] Starting Bun SSR on port 8081
[startup] Bun SSR PID: 8
[wait] Port 8081 on 127.0.0.1 is ready
[startup] Starting Rust proxy on port 3000
[startup] Rust proxy PID: 39
[monitor] Supervising processes (SSR=8, PROXY=39)
Proxy server listening on http://localhost:3000
Proxying requests to http://127.0.0.1:8081
Started server: http://localhost:8081
```

Key points:
- The Bun SSR process is started first and probed for readiness by `entrypoint.sh`.
- Only after the SSR port responds does the proxy start.
- The supervision loop exits the container if either process terminates unexpectedly.

## Quick Links

- [Full Docker Guide](rationale/0001_docker_deployment.md)
- [Main README](../README.md)
- [Build Validation](../README.md#build-validation)