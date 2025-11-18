import { useCallback, useMemo, useState } from 'react'

export type Country = {
	code: string
	name: string
	region: string
	flagEmoji: string
	population: number
}

export type SortKey = 'name' | 'population'

/**
 * Custom hook for filtering and sorting countries
 * Encapsulates all country filtering, sorting, and search logic
 *
 * @param countries - Array of countries to filter and sort
 * @returns Object containing filtered countries and control functions
 */
export function useCountryFilters(countries: Country[]) {
	const [query, setQuery] = useState('')
	const [regionFilter, setRegionFilter] = useState<'All' | string>('All')
	const [sortKey, setSortKey] = useState<SortKey>('name')
	const [descending, setDescending] = useState(false)

	// Extract unique regions from countries
	const regions = useMemo(() => {
		const set = new Set(countries.map((c) => c.region).filter(Boolean))
		return ['All', ...Array.from(set).sort()]
	}, [countries])

	// Filter and sort countries based on current state
	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()
		let list = countries.filter((c) => {
			if (regionFilter !== 'All' && c.region !== regionFilter) return false
			if (!q) return true
			return (
				c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
			)
		})

		list = list.sort((a, b) => {
			if (sortKey === 'name') {
				return a.name.localeCompare(b.name)
			}
			return a.population - b.population
		})

		if (descending) list = list.reverse()
		return list
	}, [countries, query, regionFilter, sortKey, descending])

	// Reset all filters to default state
	const reset = useCallback(() => {
		setQuery('')
		setRegionFilter('All')
		setSortKey('name')
		setDescending(false)
	}, [])

	return {
		// State
		query,
		regionFilter,
		sortKey,
		descending,
		regions,
		filtered,

		// Actions
		setQuery,
		setRegionFilter,
		setSortKey,
		setDescending,
		reset,
	}
}
