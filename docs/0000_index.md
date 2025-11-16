# VTS Basic Documentation

Welcome to the VTS Basic documentation. This directory contains guides, rationale documents, and reference materials for the project.

## Getting Started

- [Main README](../README.md) - Project overview and quick start
- [Docker Quick Start](docker-quickstart.md) - Quick reference for Docker commands

## Rationale Documents

Rationale documents explain _why_ decisions were made and _how_ they were implemented. They follow the format `NNNN_topic.md` and include:

1. **Context**: Why the document was created
2. **Problem Statement**: What needed to be solved
3. **Decision**: What was chosen and why
4. **Implementation**: How it was accomplished
5. **Results**: What works and what doesn't

### Current Rationale Documents

- [0001: Docker Deployment](rationale/0001_docker_deployment.md) - Multi-stage Docker build, Rust proxy server, and containerization strategy
- [0002: Precompressed Assets & Observability](rationale/0002_precompressed_assets_and_observability.md) - Precompression (gzip+br), caching, metrics, structured logging, graceful shutdown

## Guides

### Docker
- [Quick Start Guide](docker-quickstart.md) - Common Docker commands and workflows
- [Full Deployment Guide](rationale/0001_docker_deployment.md#usage) - Complete Docker deployment documentation

### Build & Validation
- [Build Validation](../README.md#build-validation) - Asset validation script and troubleshooting
- [Production Scripts](../README.md#available-scripts) - Building and serving in production

### Architecture
- [Proxy Server](rationale/0001_docker_deployment.md#architecture-decision) - Why we use a Rust proxy
- [Multi-Process Architecture](rationale/0001_docker_deployment.md#multi-process-architecture) - How Bun and Rust work together
- `entrypoint.sh` Supervisor (see Docker Deployment rationale) - Starts Bun SSR (port 8081), waits for readiness, then launches the Rust proxy (port 3000), monitors both processes, and forwards termination signals

## Project Structure

```
docs/
├── 0000_index.md                      # This file
├── docker-quickstart.md               # Docker command reference
└── rationale/
    └── 0001_docker_deployment.md     # Docker implementation rationale
```

## Contributing Documentation

When adding new documentation:

1. **Rationale Documents**: Use sequential numbering (0001, 0002, etc.) and include:
   - Date and status
   - Context and problem statement
   - Decision and alternatives considered
   - Implementation details
   - Results and known issues

2. **Quick Reference Guides**: Focus on common commands and workflows
   - Keep it concise
   - Include examples
   - Link to detailed docs for more info

3. **Update This Index**: Add links to new documents in the appropriate section

## External Resources

- [TanStack Start](https://tanstack.com/start) - React framework for SSR
- [Bun Runtime](https://bun.sh/) - JavaScript runtime
- [Axum Web Framework](https://github.com/tokio-rs/axum) - Rust web framework
- [Docker Documentation](https://docs.docker.com/) - Container platform
- [DaisyUI](https://daisyui.com/) - Tailwind CSS component library