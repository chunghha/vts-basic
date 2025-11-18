import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
	clearStorage,
	getStorageItem,
	isStorageAvailable,
	removeStorageItem,
	setStorageItem,
} from '../storage'

describe('Storage Utilities', () => {
	beforeEach(() => {
		// Clear localStorage before each test
		localStorage.clear()
		// Clear all mocks
		vi.clearAllMocks()
	})

	afterEach(() => {
		localStorage.clear()
	})

	describe('getStorageItem', () => {
		it('should return default value when key does not exist', () => {
			const result = getStorageItem('nonexistent', 'default')
			expect(result).toBe('default')
		})

		it('should retrieve and parse JSON objects', () => {
			const testObj = { name: 'test', value: 42 }
			localStorage.setItem('testKey', JSON.stringify(testObj))

			const result = getStorageItem('testKey', {})
			expect(result).toEqual(testObj)
		})

		it('should retrieve and parse JSON arrays', () => {
			const testArray = [1, 2, 3, 4, 5]
			localStorage.setItem('testArray', JSON.stringify(testArray))

			const result = getStorageItem('testArray', [])
			expect(result).toEqual(testArray)
		})

		it('should retrieve string values', () => {
			localStorage.setItem('testString', 'hello world')

			const result = getStorageItem('testString', '')
			expect(result).toBe('hello world')
		})

		it('should retrieve boolean values', () => {
			localStorage.setItem('testBool', JSON.stringify(true))

			const result = getStorageItem('testBool', false)
			expect(result).toBe(true)
		})

		it('should retrieve number values', () => {
			localStorage.setItem('testNumber', JSON.stringify(42))

			const result = getStorageItem('testNumber', 0)
			expect(result).toBe(42)
		})

		it('should handle corrupted JSON gracefully', () => {
			localStorage.setItem('corrupted', '{invalid json}')

			const result = getStorageItem('corrupted', 'default')
			// Should return the raw string when JSON parsing fails
			expect(result).toBe('{invalid json}')
		})

		it('should handle null values', () => {
			localStorage.setItem('nullValue', JSON.stringify(null))

			const result = getStorageItem('nullValue', 'default')
			expect(result).toBe(null)
		})

		it('should handle empty string values', () => {
			localStorage.setItem('emptyString', '')

			const result = getStorageItem('emptyString', 'default')
			expect(result).toBe('')
		})

		it('should handle complex nested objects', () => {
			const complexObj = {
				user: {
					name: 'John',
					preferences: {
						theme: 'dark',
						notifications: true,
					},
				},
				items: [1, 2, 3],
			}
			localStorage.setItem('complex', JSON.stringify(complexObj))

			const result = getStorageItem('complex', {})
			expect(result).toEqual(complexObj)
		})
	})

	describe('setStorageItem', () => {
		it('should store string values', () => {
			const success = setStorageItem('testString', 'hello')

			expect(success).toBe(true)
			expect(localStorage.getItem('testString')).toBe('hello')
		})

		it('should store and stringify objects', () => {
			const testObj = { name: 'test', value: 42 }
			const success = setStorageItem('testObj', testObj)

			expect(success).toBe(true)
			expect(localStorage.getItem('testObj')).toBe(JSON.stringify(testObj))
		})

		it('should store and stringify arrays', () => {
			const testArray = [1, 2, 3]
			const success = setStorageItem('testArray', testArray)

			expect(success).toBe(true)
			expect(localStorage.getItem('testArray')).toBe(JSON.stringify(testArray))
		})

		it('should store boolean values', () => {
			const success = setStorageItem('testBool', true)

			expect(success).toBe(true)
			expect(localStorage.getItem('testBool')).toBe('true')
		})

		it('should store number values', () => {
			const success = setStorageItem('testNumber', 42)

			expect(success).toBe(true)
			expect(localStorage.getItem('testNumber')).toBe('42')
		})

		it('should overwrite existing values', () => {
			setStorageItem('test', 'old')
			setStorageItem('test', 'new')

			expect(localStorage.getItem('test')).toBe('new')
		})

		it('should store null values', () => {
			const success = setStorageItem('nullValue', null)

			expect(success).toBe(true)
			expect(localStorage.getItem('nullValue')).toBe('null')
		})

		it('should store empty string', () => {
			const success = setStorageItem('emptyString', '')

			expect(success).toBe(true)
			expect(localStorage.getItem('emptyString')).toBe('')
		})

		it('should handle circular references gracefully', () => {
			const circular: { name: string; self?: unknown } = { name: 'test' }
			circular.self = circular

			const success = setStorageItem('circular', circular)
			expect(success).toBe(false)
		})
	})

	describe('removeStorageItem', () => {
		it('should remove existing items', () => {
			localStorage.setItem('test', 'value')
			const success = removeStorageItem('test')

			expect(success).toBe(true)
			expect(localStorage.getItem('test')).toBe(null)
		})

		it('should return true even if item does not exist', () => {
			const success = removeStorageItem('nonexistent')

			expect(success).toBe(true)
		})

		it('should handle multiple removals', () => {
			localStorage.setItem('item1', 'value1')
			localStorage.setItem('item2', 'value2')

			removeStorageItem('item1')
			removeStorageItem('item2')

			expect(localStorage.getItem('item1')).toBe(null)
			expect(localStorage.getItem('item2')).toBe(null)
		})
	})

	describe('clearStorage', () => {
		it('should clear all items from localStorage', () => {
			localStorage.setItem('item1', 'value1')
			localStorage.setItem('item2', 'value2')
			localStorage.setItem('item3', 'value3')

			const success = clearStorage()

			expect(success).toBe(true)
			expect(localStorage.length).toBe(0)
		})

		it('should return true even if localStorage is already empty', () => {
			const success = clearStorage()

			expect(success).toBe(true)
		})
	})

	describe('isStorageAvailable', () => {
		it('should return true when localStorage is available', () => {
			const result = isStorageAvailable()

			expect(result).toBe(true)
		})

		it('should clean up test key after check', () => {
			isStorageAvailable()

			expect(localStorage.getItem('__storage_test__')).toBe(null)
		})
	})

	describe('SSR Scenarios', () => {
		it('getStorageItem should return default value when window is undefined', () => {
			// Mock window as undefined
			const originalWindow = global.window
			// @ts-expect-error - Testing SSR scenario
			delete global.window

			const result = getStorageItem('test', 'default')
			expect(result).toBe('default')

			// Restore window
			global.window = originalWindow
		})

		it('setStorageItem should return false when window is undefined', () => {
			const originalWindow = global.window
			// @ts-expect-error - Testing SSR scenario
			delete global.window

			const result = setStorageItem('test', 'value')
			expect(result).toBe(false)

			global.window = originalWindow
		})

		it('removeStorageItem should return false when window is undefined', () => {
			const originalWindow = global.window
			// @ts-expect-error - Testing SSR scenario
			delete global.window

			const result = removeStorageItem('test')
			expect(result).toBe(false)

			global.window = originalWindow
		})

		it('clearStorage should return false when window is undefined', () => {
			const originalWindow = global.window
			// @ts-expect-error - Testing SSR scenario
			delete global.window

			const result = clearStorage()
			expect(result).toBe(false)

			global.window = originalWindow
		})

		it('isStorageAvailable should return false when window is undefined', () => {
			const originalWindow = global.window
			// @ts-expect-error - Testing SSR scenario
			delete global.window

			const result = isStorageAvailable()
			expect(result).toBe(false)

			global.window = originalWindow
		})
	})

	describe('Type Safety', () => {
		it('should maintain type safety for different data types', () => {
			// String
			setStorageItem('string', 'test')
			const str = getStorageItem('string', '')
			expect(typeof str).toBe('string')

			// Number
			setStorageItem('number', 42)
			const num = getStorageItem('number', 0)
			expect(typeof num).toBe('number')

			// Boolean
			setStorageItem('boolean', true)
			const bool = getStorageItem('boolean', false)
			expect(typeof bool).toBe('boolean')

			// Object
			setStorageItem('object', { key: 'value' })
			const obj = getStorageItem('object', {})
			expect(typeof obj).toBe('object')

			// Array
			setStorageItem('array', [1, 2, 3])
			const arr = getStorageItem('array', [])
			expect(Array.isArray(arr)).toBe(true)
		})
	})
})
