# ADR-0002: Use Rust-Based Proxy Server

## Status

Accepted

## Context

The application needed a proxy server to:
- Forward API requests to external services (RestCountries API)
- Collect and expose metrics (request counts, latency)
- Handle CORS and security headers
- Provide a health check endpoint
- Serve the React application in production

Initial considerations included using Node.js, but we wanted:
- High performance for API proxying
- Low memory footprint
- Built-in concurrency
- Type safety
- Learning opportunity with modern systems language

## Decision

We will use **Rust with the Axum framework** for the proxy server.

The proxy is implemented as a standalone Rust application that:
- Proxies requests to external APIs
- Collects Prometheus-compatible metrics
- Serves static files (React build output)
- Provides health check endpoints
- Handles all HTTP concerns (CORS, headers, etc.)

## Consequences

### Positive

- **Performance**: Rust provides excellent performance with minimal overhead
- **Memory Efficiency**: Low memory footprint compared to Node.js
- **Concurrency**: Built-in async/await with Tokio runtime
- **Type Safety**: Compile-time guarantees prevent many runtime errors
- **Reliability**: Memory safety without garbage collection pauses
- **Metrics**: Native Prometheus integration for observability
- **Single Binary**: Easy deployment as a single executable

### Negative

- **Learning Curve**: Rust has a steeper learning curve than JavaScript/TypeScript
- **Build Time**: Rust compilation is slower than JavaScript bundling
- **Ecosystem**: Smaller ecosystem compared to Node.js
- **Team Knowledge**: Requires Rust expertise for maintenance

### Neutral

- **Development Speed**: Slower initial development, but fewer bugs
- **Debugging**: Different tooling than JavaScript developers are used to

## Alternatives Considered

### Alternative 1: Node.js with Express

**Pros**:
- Same language as frontend (JavaScript/TypeScript)
- Large ecosystem of middleware
- Familiar to most web developers
- Fast development

**Cons**:
- Higher memory usage
- Single-threaded (requires clustering for concurrency)
- Less performant for CPU-intensive tasks
- Garbage collection pauses

**Why not chosen**: Performance and memory efficiency requirements favored Rust.

### Alternative 2: Next.js API Routes

**Pros**:
- Integrated with frontend framework
- No separate server needed
- Serverless deployment options

**Cons**:
- Couples proxy logic with frontend
- Limited metrics capabilities
- Less control over HTTP layer
- Vendor lock-in

**Why not chosen**: Need for standalone metrics server and separation of concerns.

### Alternative 3: Go with Echo

**Pros**:
- Excellent performance
- Good concurrency model
- Easier learning curve than Rust
- Strong HTTP ecosystem

**Cons**:
- Garbage collection (though minimal)
- Less memory safe than Rust
- Larger binary size

**Why not chosen**: Rust's memory safety and zero-cost abstractions were preferred.

## References

- [Axum Documentation](https://docs.rs/axum)
- [Tokio Runtime](https://tokio.rs/)
- [Prometheus Metrics](https://prometheus.io/)
- [Proxy Implementation](../../proxy/)
