/**
 * Basic DOM test setup for Vitest + Testing Library
 *
 * - Provide a minimal `matchMedia` polyfill used by some UI libraries.
 * - Set the React act environment flag so React's testing behavior is correct.
 */

if (typeof window !== 'undefined' && !window.matchMedia) {
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		configurable: true,
		value: (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		}),
	})
}

// Ensure React testing utilities behave as expected in the test environment
// (React 18+ uses this global flag in some test scenarios)
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', {
	value: true,
	writable: true,
	configurable: true,
})
