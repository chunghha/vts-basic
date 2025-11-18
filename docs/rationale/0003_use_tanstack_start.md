# ADR-0001: Use TanStack Start as React Framework

## Status

Accepted

## Context

The project needed a modern React framework that provides:
- Server-side rendering (SSR) for better performance and SEO
- File-based routing for intuitive navigation structure
- Built-in data fetching with React Query integration
- Type-safe routing with TypeScript support
- Modern development experience with Vite

The application is a country information browser that benefits from SSR for initial page loads and SEO, while maintaining a rich client-side experience for filtering and navigation.

## Decision

We will use **TanStack Start** as the React framework for this application.

TanStack Start is a full-stack React framework built on top of TanStack Router and Vite. It provides:
- Type-safe, file-based routing
- Built-in SSR and streaming
- Seamless integration with TanStack Query for data fetching
- Modern build tooling with Vite
- Excellent TypeScript support

## Consequences

### Positive

- **Type Safety**: Full type safety across routes, params, and search params
- **Performance**: SSR provides fast initial page loads and better SEO
- **Developer Experience**: File-based routing is intuitive and easy to maintain
- **Modern Stack**: Built on proven libraries (React Query, Vite)
- **Flexibility**: Can easily switch between SSR and client-side rendering per route
- **Data Fetching**: TanStack Query integration provides excellent caching and state management

### Negative

- **Newer Framework**: Less mature than Next.js or Remix, smaller community
- **Learning Curve**: Developers need to learn TanStack Router conventions
- **Limited Ecosystem**: Fewer third-party integrations compared to Next.js
- **Documentation**: Still evolving, some edge cases not well documented

### Neutral

- **Bundle Size**: Similar to other modern React frameworks
- **Deployment**: Requires Node.js server for SSR (handled by our Rust proxy)

## Alternatives Considered

### Alternative 1: Next.js

**Pros**:
- Most popular React framework with large community
- Extensive documentation and ecosystem
- Proven at scale
- Many deployment options

**Cons**:
- Opinionated routing (App Router vs Pages Router confusion)
- Vendor lock-in with Vercel-specific features
- Heavier framework with more magic
- Less type-safe routing

**Why not chosen**: TanStack Start provides better type safety and more flexibility without vendor lock-in.

### Alternative 2: Remix

**Pros**:
- Excellent data loading patterns
- Web standards focused
- Good TypeScript support
- Strong community

**Cons**:
- Different mental model (loader/action pattern)
- Less flexible routing
- Requires learning Remix-specific patterns

**Why not chosen**: TanStack Start's integration with React Query provides a more familiar data fetching pattern.

### Alternative 3: Vite + React Router

**Pros**:
- Maximum flexibility
- Lightweight
- Well-known libraries

**Cons**:
- No built-in SSR
- Manual setup required
- More boilerplate code
- No file-based routing out of the box

**Why not chosen**: Lack of SSR support was a dealbreaker for SEO and performance requirements.

## References

- [TanStack Start Documentation](https://tanstack.com/start)
- [TanStack Router Documentation](https://tanstack.com/router)
- [Project Requirements](../../README.md)
