/**
 * Type-safe localStorage utilities with error handling
 */

/**
 * Safely retrieves an item from localStorage with type safety
 * @param key - The localStorage key
 * @param defaultValue - Default value if key doesn't exist or parsing fails
 * @returns The parsed value or default value
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
	try {
		if (typeof window === 'undefined') {
			return defaultValue
		}

		const item = localStorage.getItem(key)
		if (item === null) {
			return defaultValue
		}

		// Try to parse as JSON, fall back to string
		try {
			return JSON.parse(item) as T
		} catch {
			// If it's not JSON, return as-is if it matches the type
			return item as T
		}
	} catch (error) {
		if (import.meta.env.DEV) {
			console.warn(`Failed to get ${key} from localStorage:`, error)
		}
		return defaultValue
	}
}

/**
 * Safely sets an item in localStorage with type safety
 * @param key - The localStorage key
 * @param value - The value to store
 * @returns true if successful, false otherwise
 */
export function setStorageItem<T>(key: string, value: T): boolean {
	try {
		if (typeof window === 'undefined') {
			return false
		}

		const stringValue =
			typeof value === 'string' ? value : JSON.stringify(value)
		localStorage.setItem(key, stringValue)
		return true
	} catch (error) {
		if (import.meta.env.DEV) {
			console.warn(`Failed to save ${key} to localStorage:`, error)
		}
		return false
	}
}

/**
 * Safely removes an item from localStorage
 * @param key - The localStorage key to remove
 * @returns true if successful, false otherwise
 */
export function removeStorageItem(key: string): boolean {
	try {
		if (typeof window === 'undefined') {
			return false
		}

		localStorage.removeItem(key)
		return true
	} catch (error) {
		if (import.meta.env.DEV) {
			console.warn(`Failed to remove ${key} from localStorage:`, error)
		}
		return false
	}
}

/**
 * Safely clears all localStorage items
 * @returns true if successful, false otherwise
 */
export function clearStorage(): boolean {
	try {
		if (typeof window === 'undefined') {
			return false
		}

		localStorage.clear()
		return true
	} catch (error) {
		if (import.meta.env.DEV) {
			console.warn('Failed to clear localStorage:', error)
		}
		return false
	}
}

/**
 * Checks if localStorage is available
 * @returns true if localStorage is available and working
 */
export function isStorageAvailable(): boolean {
	try {
		if (typeof window === 'undefined') {
			return false
		}

		const testKey = '__storage_test__'
		localStorage.setItem(testKey, 'test')
		localStorage.removeItem(testKey)
		return true
	} catch {
		return false
	}
}
