# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the VTS Basic project. ADRs document significant architectural decisions made during the project's development.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences. ADRs help teams:

- Understand why certain technologies or patterns were chosen
- Onboard new team members faster
- Avoid revisiting settled decisions
- Learn from past decisions
- Maintain institutional knowledge

## ADR Format

Each ADR follows a standard format (see [template.md](template.md)):

1. **Title**: Short description of the decision
2. **Status**: Proposed, Accepted, Deprecated, or Superseded
3. **Context**: The problem and constraints
4. **Decision**: What was decided
5. **Consequences**: Positive, negative, and neutral outcomes
6. **Alternatives**: Other options considered and why they weren't chosen
7. **References**: Links to relevant documentation

## Index of ADRs

### Accepted

| ADR | Title | Date | Status |
|-----|-------|------|--------|
| [0001](0001_docker_deployment.md) | Docker Deployment for VTS Basic | 2025-11-16 | Implemented |
| [0002](0002_precompressed_assets_and_observability.md) | Precompressed Assets and Observability | 2025-11-16 | Implemented |
| [0003](0003_use_tanstack_start.md) | Use TanStack Start as React Framework | 2025-11-18 | Accepted |
| [0004](0004_use_rust_proxy.md) | Use Rust-Based Proxy Server | 2025-11-18 | Accepted |
| [0005](0005_use_daisyui.md) | Use DaisyUI for Component Styling | 2025-11-18 | Accepted |

## Creating a New ADR

1. Copy the [template.md](template.md) file
2. Name it with the next number: `XXXX_short-title.md` (note the underscore)
3. Fill in all sections
4. Submit for review
5. Update this index with the new ADR

## Key Decisions Summary

### Infrastructure & Deployment
- **Docker Deployment**: Multi-stage build with Rust proxy and Bun SSR (ADR-0001)
- **Asset Optimization**: Precompressed assets with Brotli/Gzip, Prometheus metrics (ADR-0002)

### Frontend Stack
- **Framework**: TanStack Start (SSR, type-safe routing) (ADR-0003)
- **Styling**: Tailwind CSS + DaisyUI (utility-first + components) (ADR-0005)
- **State Management**: TanStack Query (server state)
- **Language**: TypeScript (type safety)

### Backend Stack
- **Proxy Server**: Rust + Axum (performance, safety)
- **Metrics**: Prometheus (observability)
- **API**: RESTful (RestCountries API)

### Development
- **Build Tool**: Vite (fast development)
- **Testing**: Vitest + Testing Library (unit tests)
- **E2E Testing**: Playwright (browser automation)
- **Linting**: ESLint + TypeScript (code quality)

### Deployment
- **Containerization**: Docker (consistent environments)
- **PWA**: Service Worker (offline support)
- **Caching**: Workbox (intelligent caching)

## References

- [ADR GitHub Organization](https://adr.github.io/)
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [Project README](../../README.md)
