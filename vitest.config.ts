import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Use the happy-dom environment so DOM APIs are available in tests
    environment: "happy-dom",

    // Enable globals like `describe` / `it` / `expect` without imports
    globals: true,

    // Setup files to run before the test suite (e.g. jest-dom matchers)
    setupFiles: ["src/setupTests.ts"],

    // Files to include as test files
    include: ["src/**/*.{test,spec}.{ts,tsx,js,jsx}"],

    // happy-dom doesn't require the jsdom-specific options used previously
    environmentOptions: {},

    // Increase timeout for slow CI environments (ms)
    testTimeout: 60000,
  },
});
