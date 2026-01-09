/**
 * US Map color palette and configuration
 * 4-color pastel palette used for both GDP and income quartile visualization
 */

export const US_MAP_COLORS = {
	/** Q1 (Lowest): Pastel purple/lavender */
	q1: '#c7d2e8',
	/** Q2 (Low): Pastel green/lime */
	q2: '#d9e9c1',
	/** Q3 (Medium): Pastel orange */
	q3: '#f5d5b8',
	/** Q4 (High): Pastel pink/coral */
	q4: '#f5b9b1',
	/** Selected state highlight */
	selected: '#8b5cf6',
} as const

/**
 * Display modes for the US Map
 */
export const US_MAP_MODES = {
	GDP: 'gdp',
	INCOME: 'income',
	HOUSE_PRICE: 'housePrice',
} as const

export type USMapMode = (typeof US_MAP_MODES)[keyof typeof US_MAP_MODES]

/**
 * Shadow configurations for interactive elements
 */
export const US_MAP_SHADOWS = {
	/** Small shadow for inactive buttons */
	inactive: '0 1px 2px rgba(0, 0, 0, 0.05)',
	/** Standard shadow for active buttons and elements */
	standard: '0 2px 4px rgba(0, 0, 0, 0.1)',
	/** Large shadow for hover/focus states */
	hover: '0 4px 8px rgba(0, 0, 0, 0.15)',
} as const
