# E2E Testing with Playwright

This project uses Playwright for end-to-end testing.

## Prerequisites

Before running E2E tests, you need to:

1. **Install Playwright browsers** (one-time setup):
   ```bash
   bun run test:e2e:install
   ```

2. **Build and start the production server**:
   ```bash
   bun run start:prod
   ```
   
   This will:
   - Build the client and SSR bundles
   - Run validation (linting and unit tests)
   - Build the Rust proxy in release mode
   - Start the production server on port 3000

## Running E2E Tests

Once the production server is running, open a new terminal and run:

```bash
# Run all E2E tests
bun run test:e2e

# Run with interactive UI
bun run test:e2e:ui

# Run with browser visible
bun run test:e2e:headed
```

## Test Coverage

The E2E test suite (`e2e/country.spec.ts`) covers:

- ✅ Loading and displaying countries
- ✅ Filtering by region
- ✅ Searching by name
- ✅ Sorting by population
- ✅ Toggling sort order
- ✅ Resetting filters
- ✅ Empty state handling
- ✅ Combined filters
- ✅ Navigation

## Multi-Browser Testing

Tests run on three browsers:
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)

## Troubleshooting

**Tests fail immediately:**
- Make sure the production server is running (`bun run start:prod`)
- Verify the server is accessible at http://localhost:3000

**Browsers not installed:**
- Run `bun run test:e2e:install` to install Playwright browsers

**Port already in use:**
- Stop any other processes using port 3000 or 8081
- Or update `proxy/proxy.ron` to use different ports
