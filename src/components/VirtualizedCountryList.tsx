import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef, useState } from 'react'
import type { Country } from '../hooks/useCountryFilters'
import { CountryFlag } from './CountryFlag'

/**
 * Props for the CountryCard component
 */
interface CountryCardProps {
	c: Country
	nf: Intl.NumberFormat
}

/**
 * Individual country card component
 */
function CountryCard({ c, nf }: CountryCardProps) {
	return (
		<article className="card bg-base-100 shadow-md overflow-hidden h-full">
			<div className="p-4 border-b border-base-300/10 flex items-start gap-4">
				<div className="avatar">
					<CountryFlag
						name={c.name}
						flagUrl={c.flagUrl}
						flagEmoji={c.flagEmoji}
					/>
				</div>

				<div className="flex-1 min-w-0">
					<h3 className="card-title text-lg truncate">{c.name}</h3>
					<div className="text-xs text-base-content/60 truncate">
						{c.code} • {c.region}
					</div>
				</div>

				<div className="text-right text-sm text-base-content/70">
					<div className="text-xs">Population</div>
					<div className="font-semibold">{nf.format(c.population)}</div>
				</div>
			</div>

			<div className="card-body">
				<p className="text-sm text-base-content/70 mb-4">
					Explore {c.name}. Click details to learn more or open a quick search.
				</p>

				<div className="card-actions justify-end">
					<button
						type="button"
						className="btn btn-ghost btn-sm"
						aria-label={`Open details for ${c.name}`}
					>
						Details
					</button>
					<a
						href={`https://www.google.com/search?q=${encodeURIComponent(c.name)}`}
						target="_blank"
						rel="noreferrer"
						className="btn btn-primary btn-sm"
					>
						Search
					</a>
				</div>
			</div>
		</article>
	)
}

/**
 * Props for the VirtualizedCountryList component
 */
interface VirtualizedCountryListProps {
	countries: Country[]
	nf: Intl.NumberFormat
}

/**
 * Determine number of columns based on screen width
 * This is a simple approach - for production, consider using useMediaQuery
 */
function getColumnCount(): number {
	if (typeof window === 'undefined') return 1
	const width = window.innerWidth
	if (width >= 1024) return 3 // lg breakpoint
	if (width >= 640) return 2 // sm breakpoint
	return 1
}

/**
 * Virtualized country list component for optimal performance with large datasets
 * Uses @tanstack/react-virtual to render only visible items
 *
 * @param countries - Array of countries to display
 * @param nf - Number formatter for population display
 */
export function VirtualizedCountryList({
	countries,
	nf,
}: VirtualizedCountryListProps) {
	const parentRef = useRef<HTMLDivElement>(null)
	const [columnCount, setColumnCount] = useState(() => getColumnCount())

	// Update column count on window resize
	useEffect(() => {
		const handleResize = () => {
			setColumnCount(getColumnCount())
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Calculate row count based on column count
	const rowCount = Math.ceil(countries.length / columnCount)

	// Create virtualizer for rows
	const rowVirtualizer = useVirtualizer({
		count: rowCount,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 320, // Estimated height of each row (card height + gap)
		overscan: 5, // Render 5 extra rows above/below viewport for smooth scrolling
	})

	// Get countries for a specific row
	const getCountriesForRow = (rowIndex: number): Country[] => {
		const startIndex = rowIndex * columnCount
		const endIndex = Math.min(startIndex + columnCount, countries.length)
		return countries.slice(startIndex, endIndex)
	}

	return (
		<div
			ref={parentRef}
			className="h-[calc(100vh-400px)] overflow-auto"
			style={{ contain: 'strict' }}
		>
			<div
				style={{
					height: `${rowVirtualizer.getTotalSize()}px`,
					width: '100%',
					position: 'relative',
				}}
			>
				{rowVirtualizer.getVirtualItems().map((virtualRow) => {
					const rowCountries = getCountriesForRow(virtualRow.index)

					return (
						<div
							key={virtualRow.key}
							data-index={virtualRow.index}
							ref={rowVirtualizer.measureElement}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								transform: `translateY(${virtualRow.start}px)`,
								paddingBottom: '1.5rem', // gap-6 equivalent (24px)
							}}
						>
							<div
								className={`grid gap-6 ${
									columnCount === 3
										? 'grid-cols-3'
										: columnCount === 2
											? 'grid-cols-2'
											: 'grid-cols-1'
								}`}
							>
								{rowCountries.map((country) => (
									<CountryCard key={country.code} c={country} nf={nf} />
								))}
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
