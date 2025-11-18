# VTS Basic

VTS Basic is a production-ready React application that combines modern web technologies with best practices for performance, accessibility, and developer experience. Built with TanStack Start, it provides a solid foundation for building fast, accessible web applications.

## Features

### Core Stack
- **Framework**: TanStack Start with SSR and type-safe routing
- **Styling**: Tailwind CSS + DaisyUI with theme switching
- **State Management**: TanStack Query for server state
- **Language**: TypeScript for type safety
- **Runtime**: Bun for fast development and builds

### User Experience
- **PWA Support**: Service Worker with offline capabilities and intelligent caching
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **Toast Notifications**: User feedback with theme-aware notifications
- **Loading States**: Shimmer-animated skeletons for better perceived performance
- **Theme Switching**: Multiple DaisyUI themes with persistent selection

### Performance
- **Virtual Scrolling**: Efficient rendering of large country lists
- **Optimized Images**: Lazy loading and caching for flag images
- **API Client**: Centralized HTTP client with retry logic and error handling
- **Service Worker**: Advanced caching strategies (NetworkFirst, StaleWhileRevalidate, CacheFirst)

### Developer Experience
- **Architecture Decision Records**: Documented technical decisions in `docs/rationale/`
- **Comprehensive Testing**: Unit tests with Vitest (86%+ coverage)
- **E2E Testing**: Playwright for browser automation
- **Build Validation**: Automatic asset validation to catch deployment issues
- **Docker Support**: Multi-stage builds with Rust proxy server

### Production Ready
- **Rust Proxy**: High-performance proxy server for static assets and API requests
- **Docker Deployment**: Containerized with multi-stage builds
- **Metrics**: Prometheus-compatible metrics endpoint
- **Error Handling**: Centralized error handling with retry logic

## Documentation

- [Documentation Index](docs/0000_index.md) - Central documentation hub
- [Architecture Decision Records](docs/rationale/0000_ADR_INDEX.md) - Technical decisions and rationale
- [Docker Quick Start](docs/docker-quickstart.md) - Quick reference for Docker commands
- [Docker Deployment Guide](docs/rationale/0001_docker_deployment.md) - Complete guide for building and deploying with Docker
- [Build Validation](#build-validation) - Automatic asset validation after builds

---

## Quickstart

1. Install dependencies:
```vts-basic/README.md#L1-3
bun install
```

2. Start the dev server:
```vts-basic/README.md#L4-6
bun run dev
```

3. Open http://localhost:3000 (or the port shown in your terminal).

---

## Available Scripts

Use these from the project root (`vts-basic`).

- Start dev server:
```vts-basic/README.md#L8-10
bun run dev
```

- Build for production:
```vts-basic/README.md#L11-13
bun run build
```

- Build production assets (Vite + Rust proxy):
```vts-basic/README.md#L14-16
bun run build:prod
```

- Validate build assets:
```vts-basic/README.md#L17-19
bun run validate
```

- Serve production build:
```vts-basic/README.md#L20-22
bun run serve:prod
```

- Build and serve production:
```vts-basic/README.md#L23-25
bun run start:prod
```

- Run tests (Vitest):
```vts-basic/README.md#L26-28
bun run test
```

- Lint / format (Biome or configured tooling):
```vts-basic/README.md#L29-31
bun run lint
bun run format
```

---

## Build Validation

The project includes a build validation script (`validate-build.js`) that checks for asset hash mismatches after building. This ensures that all asset references in the server manifest match the actual files in the `dist/client` directory.

### Running Validation

```vts-basic/README.md#L1-3
bun run validate
```

The script will:
- Check that all assets referenced in manifest files exist
- Identify missing assets and suggest similar files
- Exit with an error if any mismatches are found

**Note**: The `build:prod` script automatically runs validation after building. If validation fails, the build process will stop before compiling the Rust proxy.

### What It Checks

- Asset references in `dist/server/assets/*-manifest*.js` files
- Actual files in `dist/client/assets/`
- JavaScript, CSS, and other static assets

If you see validation errors, try:
1. Clean build: `rm -rf dist .tanstack node_modules/.cache && bun run build`
2. Reinstall dependencies: `rm -rf node_modules && bun install && bun run build`

---

## Proxy Server

The project includes a Rust-based proxy server (`proxy/`) that serves static assets and proxies requests to the Bun server in production. This architecture provides:

- Efficient static file serving
- Request proxying to the Bun SSR server on port 8081
- Production-ready performance

### Running the Proxy

In development, you typically don't need the proxy - just use `bun run dev`.

For production:
1. Build everything: `bun run build:prod`
   - Builds the Vite frontend
   - Compiles the Rust proxy in release mode
2. Run both servers: `bun run serve:prod`
   - Bun server runs on port 8081 (SSR)
   - Rust proxy runs on port 3000 (public-facing)

Access the application at `http://localhost:3000`.

### Docker Support

A multi-stage Dockerfile is included for containerized deployments:

```vts-basic/README.md#L1-3
docker build -t vts-basic:latest .
docker run -p 3000:3000 -p 8081:8081 vts-basic:latest
```

---

## Project Structure (relevant folders)

- `src/` — application source
  - `src/pages/` — page-level components: `Home.tsx`, `about/`, `country/`, error pages
  - `src/components/` — shared UI (if present)
  - `src/routes/` — TanStack Router file-based routes (if applicable)
- `proxy/` — Rust proxy server
  - `proxy/src/main.rs` — main proxy server implementation
  - `proxy/Cargo.toml` — Rust dependencies
- `public/manifest.json` — PWA manifest, updated to "VTS Basic"

---

## Styling & Theming

- Tailwind CSS is the utility layer.
- DaisyUI provides theme variables and component classes.
- A theme switcher is included in the app header so you can preview different DaisyUI themes. Selecting a theme toggles DaisyUI's theme classes (client-side).

If you'd like to persist a theme across sessions, you can:
- Store the selected theme in `localStorage` and read it on app startup.
- Apply the theme class to the `html` or `body` element before React hydrates to avoid flash of un-themed UI.

---

## Data Fetching

The Countries page uses TanStack Query (`@tanstack/react-query`) to fetch live country data from the REST Countries API. Key patterns to follow:
- Create a `QueryClient` and wrap the app with `QueryClientProvider` (already configured).
- Use `useQuery` for fetching and caching.
- Present loading, error, and empty states for a robust UX.

---

## Routing

We use TanStack Router with a small, focused set of routes:
- `/` — Home / components showcase
- `/about` — About and usage guidance
- `/country` — Dynamic country listing (search, filter, sort)

Routes are typically file-based (see `src/routes` if used) and the root layout includes the theme switcher and top navigation.

---

## Accessibility

VTS Basic is built with accessibility as a core principle, meeting WCAG 2.1 AA standards.

### Keyboard Navigation
- **Skip Link**: Press `Tab` on any page to reveal a "Skip to main content" link
- **Focus Indicators**: Clear visual indicators for all interactive elements
- **Tab Order**: Logical tab order throughout the application
- **Keyboard Shortcuts**: All functionality accessible via keyboard

### Screen Reader Support
- **Semantic HTML**: Proper use of HTML5 semantic elements (`<main>`, `<nav>`, `<header>`)
- **ARIA Labels**: Descriptive labels for navigation regions
- **Landmark Regions**: Screen readers can navigate by landmarks
- **Alt Text**: All images have descriptive alt text

### Visual Accessibility
- **High Contrast**: Support for `prefers-contrast: high` media query
- **Focus Visible**: Enhanced focus indicators for keyboard users
- **Color Contrast**: All text meets WCAG AA contrast requirements
- **Theme Support**: Multiple themes with accessible color combinations

### Motion Preferences
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **Animations**: Can be disabled for users with vestibular disorders
- **Transitions**: Minimal or instant transitions when motion is reduced

### Testing Accessibility
```bash
# Test with keyboard navigation
# - Press Tab to navigate
# - Press Enter/Space to activate
# - Press Escape to close modals

# Test with screen reader (macOS)
# - Enable VoiceOver: Cmd + F5
# - Navigate by landmarks: Ctrl + Option + U
# - Navigate by headings: Ctrl + Option + Cmd + H
```

---

## Contributing

- Keep changes small and documented.
- Add new components under `src/components` and pages under `src/pages`.
- Follow Tailwind and DaisyUI patterns for consistent theming.
- Run the linter/formatter before creating PRs:
```vts-basic/README.md#L36-38
bun run lint
bun run format
```

---

## Troubleshooting

### General Issues
- **Styles don't show up**: Confirm Tailwind is compiling and the dev server is running
- **Blank page**: Check browser console for runtime errors (missing env vars, failed fetches)
- **Network/CORS errors**: Usually transient — verify connectivity and external API availability

### Build & Deployment
- **Asset validation failures**: If `bun run validate` fails with missing asset errors:
  1. Clean build artifacts: `rm -rf dist .tanstack node_modules/.cache`
  2. Rebuild: `bun run build`
  3. Validate again: `bun run validate`
  
  If the issue persists, try reinstalling dependencies: `rm -rf node_modules && bun install && bun run build`
  
- **CSS 404 errors in Docker**: If you see "styles-XXX.css net::ERR_ABORTED 404" errors:
  1. Stop and remove the container: `docker stop vts-basic-app && docker rm vts-basic-app`
  2. Clean local build artifacts: `rm -rf dist .tanstack node_modules/.cache`
  3. Rebuild fresh: `docker build --pull --no-cache -t vts-basic:latest .`
  4. Run again: `./run_on_local_docker.sh`
  
  The `build:prod` script includes validation to catch these issues before deployment.

### PWA & Service Worker
- **Old content showing**: Service Worker may be caching old assets
  1. Open DevTools → Application → Service Workers
  2. Click "Unregister" for the service worker
  3. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
  
- **Offline mode not working**: 
  1. Check that Service Worker is registered (DevTools → Application → Service Workers)
  2. Verify you're using HTTPS or localhost (Service Workers require secure context)
  3. Check browser console for Service Worker errors

### Toast Notifications
- **Toasts not appearing**: 
  1. Check that `<Toaster />` is rendered in `__root.tsx`
  2. Verify `react-hot-toast` is installed: `bun install react-hot-toast`
  3. Check browser console for errors

- **Toasts appear in wrong position**: 
  - Position is set to `bottom-left` in `__root.tsx`
  - Modify the `position` prop on `<Toaster />` to change location

### Accessibility
- **Skip link not appearing**: 
  - Press `Tab` key to focus the skip link
  - It's visually hidden until focused (this is intentional)

- **Focus indicators not visible**: 
  - Check that `focus-visible` styles are loaded from `styles.css`
  - Verify you're using keyboard navigation (Tab key), not mouse clicks

---

## Notes

- The app is intentionally minimal and ready to be extended.
- Manifest and branding were updated to "VTS Basic". Update `public/logo192.png` and `logo512.png` if you want custom icons.
- Consider adding tests for page-level behavior (loading / error UI) and components.

---
