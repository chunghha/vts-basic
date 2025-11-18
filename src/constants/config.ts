/**
 * Application configuration constants
 */

/**
 * TanStack Query configuration
 */
export const QUERY_CONFIG = {
	/** How long data stays fresh before refetching (1 hour) */
	COUNTRIES_STALE_TIME: 1000 * 60 * 60,
	/** How long unused data stays in cache (1 hour) */
	COUNTRIES_GC_TIME: 1000 * 60 * 60,
} as const

/**
 * UI configuration constants
 */
export const UI_CONFIG = {
	/** Maximum length for search input */
	MAX_SEARCH_LENGTH: 100,
	/** Number of loading placeholders to show */
	LOADING_PLACEHOLDERS: 6,
	/** Test timeout in milliseconds */
	TEST_TIMEOUT: 60000,
} as const

/**
 * Theme configuration
 */
export const THEME_CONFIG = {
	/** LocalStorage key for theme persistence */
	STORAGE_KEY: 'theme',
	/** Default theme to use */
	DEFAULT_THEME: 'polar' as const,
	/** Available DaisyUI themes */
	AVAILABLE_THEMES: [
		{ id: 'light', label: 'Light' },
		{ id: 'milkshake', label: 'Milkshake' },
		{ id: 'dark', label: 'Dark' },
		{ id: 'mindful', label: 'Mindful' },
		{ id: 'polar', label: 'Polar' },
		{ id: 'pursuit', label: 'Pursuit' },
	] as const,
} as const

/**
 * Navigation configuration
 */
export const NAV_CONFIG = {
	/** Main navigation links */
	LINKS: [
		{ to: '/', label: 'Home' },
		{ to: '/about', label: 'About' },
		{ to: '/country', label: 'Country' },
		{ to: '/metrics', label: 'Metrics' },
	] as const,
} as const

// Type exports for convenience
export type ThemeId = (typeof THEME_CONFIG.AVAILABLE_THEMES)[number]['id']
export type NavLink = (typeof NAV_CONFIG.LINKS)[number]
