import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { type Country, useCountryFilters } from '../useCountryFilters'

const mockCountries: Country[] = [
	{
		code: 'US',
		name: 'United States',
		region: 'Americas',
		flagEmoji: '🇺🇸',
		population: 331002651,
	},
	{
		code: 'GB',
		name: 'United Kingdom',
		region: 'Europe',
		flagEmoji: '🇬🇧',
		population: 67886011,
	},
	{
		code: 'JP',
		name: 'Japan',
		region: 'Asia',
		flagEmoji: '🇯🇵',
		population: 126476461,
	},
	{
		code: 'BR',
		name: 'Brazil',
		region: 'Americas',
		flagEmoji: '🇧🇷',
		population: 212559417,
	},
	{
		code: 'DE',
		name: 'Germany',
		region: 'Europe',
		flagEmoji: '🇩🇪',
		population: 83783942,
	},
	{
		code: 'AU',
		name: 'Australia',
		region: 'Oceania',
		flagEmoji: '🇦🇺',
		population: 25499884,
	},
	{
		code: 'MC',
		name: 'Monaco',
		region: '',
		flagEmoji: '🇲🇨',
		population: 39242,
	},
]

describe('useCountryFilters', () => {
	describe('Initial State', () => {
		it('should initialize with default values', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			expect(result.current.query).toBe('')
			expect(result.current.regionFilter).toBe('All')
			expect(result.current.sortKey).toBe('name')
			expect(result.current.descending).toBe(false)
			expect(result.current.filtered).toHaveLength(mockCountries.length)
		})

		it('should extract unique regions and sort them', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			expect(result.current.regions).toEqual([
				'All',
				'Americas',
				'Asia',
				'Europe',
				'Oceania',
			])
		})

		it('should handle empty country array', () => {
			const { result } = renderHook(() => useCountryFilters([]))

			expect(result.current.filtered).toEqual([])
			expect(result.current.regions).toEqual(['All'])
		})
	})

	describe('Region Filtering', () => {
		it('should filter countries by region', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setRegionFilter('Europe')
			})

			expect(result.current.filtered).toHaveLength(2)
			expect(result.current.filtered.map((c) => c.code)).toEqual(['DE', 'GB'])
		})

		it('should show all countries when region is "All"', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setRegionFilter('Europe')
			})

			act(() => {
				result.current.setRegionFilter('All')
			})

			expect(result.current.filtered).toHaveLength(mockCountries.length)
		})

		it('should filter out countries with empty region', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setRegionFilter('Europe')
			})

			const hasMonaco = result.current.filtered.some((c) => c.code === 'MC')
			expect(hasMonaco).toBe(false)
		})
	})

	describe('Search Functionality', () => {
		it('should filter by country name (case-insensitive)', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setQuery('united')
			})

			expect(result.current.filtered).toHaveLength(2)
			expect(result.current.filtered.map((c) => c.code)).toContain('US')
			expect(result.current.filtered.map((c) => c.code)).toContain('GB')
		})

		it('should filter by country code (case-insensitive)', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setQuery('jp')
			})

			expect(result.current.filtered).toHaveLength(1)
			expect(result.current.filtered[0].code).toBe('JP')
		})

		it('should handle empty search query', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setQuery('japan')
			})

			act(() => {
				result.current.setQuery('')
			})

			expect(result.current.filtered).toHaveLength(mockCountries.length)
		})

		it('should trim whitespace from search query', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setQuery('  japan  ')
			})

			expect(result.current.filtered).toHaveLength(1)
			expect(result.current.filtered[0].code).toBe('JP')
		})

		it('should return empty array for no matches', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setQuery('xyz123')
			})

			expect(result.current.filtered).toHaveLength(0)
		})

		it('should handle special characters in search', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setQuery('!@#$%')
			})

			expect(result.current.filtered).toHaveLength(0)
		})
	})

	describe('Sorting', () => {
		it('should sort by name alphabetically (ascending)', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setSortKey('name')
			})

			const names = result.current.filtered.map((c) => c.name)
			expect(names).toEqual([
				'Australia',
				'Brazil',
				'Germany',
				'Japan',
				'Monaco',
				'United Kingdom',
				'United States',
			])
		})

		it('should sort by population (ascending)', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setSortKey('population')
			})

			const populations = result.current.filtered.map((c) => c.population)
			expect(populations).toEqual([
				39242, 25499884, 67886011, 83783942, 126476461, 212559417, 331002651,
			])
		})

		it('should sort by name in descending order', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setSortKey('name')
				result.current.setDescending(true)
			})

			const names = result.current.filtered.map((c) => c.name)
			expect(names).toEqual([
				'United States',
				'United Kingdom',
				'Monaco',
				'Japan',
				'Germany',
				'Brazil',
				'Australia',
			])
		})

		it('should sort by population in descending order', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setSortKey('population')
				result.current.setDescending(true)
			})

			const populations = result.current.filtered.map((c) => c.population)
			expect(populations).toEqual([
				331002651, 212559417, 126476461, 83783942, 67886011, 25499884, 39242,
			])
		})

		it('should toggle descending order', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setDescending(true)
			})
			expect(result.current.descending).toBe(true)

			act(() => {
				result.current.setDescending(false)
			})
			expect(result.current.descending).toBe(false)
		})
	})

	describe('Combined Filters', () => {
		it('should apply region filter and search together', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setRegionFilter('Americas')
				result.current.setQuery('united')
			})

			expect(result.current.filtered).toHaveLength(1)
			expect(result.current.filtered[0].code).toBe('US')
		})

		it('should apply all filters together (region + search + sort)', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setRegionFilter('Europe')
				result.current.setQuery('e')
				result.current.setSortKey('population')
			})

			const filtered = result.current.filtered
			expect(filtered).toHaveLength(2)
			expect(filtered[0].code).toBe('GB')
			expect(filtered[1].code).toBe('DE')
		})

		it('should maintain sort order when changing filters', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setSortKey('population')
				result.current.setDescending(true)
			})

			act(() => {
				result.current.setRegionFilter('Europe')
			})

			const populations = result.current.filtered.map((c) => c.population)
			expect(populations[0]).toBeGreaterThan(populations[1])
		})
	})

	describe('Reset Functionality', () => {
		it('should reset all filters to default state', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setQuery('test')
				result.current.setRegionFilter('Europe')
				result.current.setSortKey('population')
				result.current.setDescending(true)
			})

			act(() => {
				result.current.reset()
			})

			expect(result.current.query).toBe('')
			expect(result.current.regionFilter).toBe('All')
			expect(result.current.sortKey).toBe('name')
			expect(result.current.descending).toBe(false)
		})

		it('should restore full country list after reset', () => {
			const { result } = renderHook(() => useCountryFilters(mockCountries))

			act(() => {
				result.current.setQuery('japan')
			})

			expect(result.current.filtered).toHaveLength(1)

			act(() => {
				result.current.reset()
			})

			expect(result.current.filtered).toHaveLength(mockCountries.length)
		})
	})

	describe('Edge Cases', () => {
		it('should handle countries with identical names', () => {
			const duplicates: Country[] = [
				{
					code: 'A1',
					name: 'Test Country',
					region: 'Region1',
					flagEmoji: '🏳️',
					population: 1000,
				},
				{
					code: 'A2',
					name: 'Test Country',
					region: 'Region2',
					flagEmoji: '🏳️',
					population: 2000,
				},
			]

			const { result } = renderHook(() => useCountryFilters(duplicates))

			expect(result.current.filtered).toHaveLength(2)
		})

		it('should handle countries with zero population', () => {
			const zeroPopulation: Country[] = [
				{
					code: 'ZZ',
					name: 'Zero Pop',
					region: 'Test',
					flagEmoji: '🏳️',
					population: 0,
				},
			]

			const { result } = renderHook(() => useCountryFilters(zeroPopulation))

			act(() => {
				result.current.setSortKey('population')
			})

			expect(result.current.filtered[0].population).toBe(0)
		})

		it('should handle very large population numbers', () => {
			const largePopulation: Country[] = [
				{
					code: 'CN',
					name: 'China',
					region: 'Asia',
					flagEmoji: '🇨🇳',
					population: 1439323776,
				},
			]

			const { result } = renderHook(() => useCountryFilters(largePopulation))

			act(() => {
				result.current.setSortKey('population')
			})

			expect(result.current.filtered[0].population).toBe(1439323776)
		})

		it('should update regions when countries change', () => {
			const { result, rerender } = renderHook(
				({ countries }) => useCountryFilters(countries),
				{
					initialProps: { countries: mockCountries },
				},
			)

			const newCountries: Country[] = [
				{
					code: 'AF',
					name: 'Afghanistan',
					region: 'Africa',
					flagEmoji: '🇦🇫',
					population: 38928346,
				},
			]

			rerender({ countries: newCountries })

			expect(result.current.regions).toEqual(['All', 'Africa'])
		})
	})
})
