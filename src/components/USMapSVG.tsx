import { useCallback, useEffect, useMemo } from 'react'
import type { USState } from '../types/us-map'

interface Props {
	states: USState[]
	onStateClick: (state: USState | null) => void
	selectedState?: USState | null
}

import { US_STATE_PATHS as STATE_PATHS } from '../data/us-state-paths'

// Map of state codes to edge overlay positions (outside the state)
const STATE_OVERLAY_POSITIONS: Record<string, { x: string; y: string }> = {
	AL: { x: '75%', y: '70%' },
	AK: { x: '2%', y: '85%' },
	AZ: { x: '15%', y: '55%' },
	AR: { x: '65%', y: '58%' },
	CA: { x: '8%', y: '45%' },
	CO: { x: '42%', y: '28%' },
	CT: { x: '92%', y: '20%' },
	DE: { x: '88%', y: '28%' },
	FL: { x: '82%', y: '82%' },
	GA: { x: '80%', y: '65%' },
	HI: { x: '2%', y: '95%' },
	ID: { x: '12%', y: '15%' },
	IL: { x: '68%', y: '28%' },
	IN: { x: '70%', y: '25%' },
	IA: { x: '58%', y: '22%' },
	KS: { x: '52%', y: '45%' },
	KY: { x: '73%', y: '52%' },
	LA: { x: '62%', y: '72%' },
	ME: { x: '95%', y: '8%' },
	MD: { x: '82%', y: '28%' },
	MA: { x: '92%', y: '15%' },
	MI: { x: '72%', y: '18%' },
	MN: { x: '58%', y: '10%' },
	MS: { x: '65%', y: '60%' },
	MO: { x: '58%', y: '48%' },
	MT: { x: '18%', y: '10%' },
	NE: { x: '52%', y: '38%' },
	NV: { x: '10%', y: '48%' },
	NH: { x: '90%', y: '12%' },
	NJ: { x: '85%', y: '22%' },
	NM: { x: '22%', y: '58%' },
	NY: { x: '85%', y: '12%' },
	NC: { x: '80%', y: '52%' },
	ND: { x: '52%', y: '10%' },
	OH: { x: '75%', y: '28%' },
	OK: { x: '55%', y: '55%' },
	OR: { x: '5%', y: '35%' },
	PA: { x: '78%', y: '22%' },
	RI: { x: '92%', y: '20%' },
	SC: { x: '82%', y: '60%' },
	SD: { x: '52%', y: '18%' },
	TN: { x: '70%', y: '55%' },
	TX: { x: '52%', y: '68%' },
	UT: { x: '15%', y: '48%' },
	VT: { x: '88%', y: '8%' },
	VA: { x: '80%', y: '48%' },
	WA: { x: '5%', y: '10%' },
	WV: { x: '78%', y: '45%' },
	WI: { x: '65%', y: '15%' },
	WY: { x: '38%', y: '18%' },
}

// State-specific colors for when selected
const STATE_COLORS: Record<string, string> = {
	AL: '#d4907f', // Terracotta
	AK: '#8fa8b8', // Steel blue
	AZ: '#c7845f', // Clay
	AR: '#9cb896', // Sage
	CA: '#d4a857', // Gold
	CO: '#7a9fc3', // Mountain blue
	CT: '#8b7eb8', // Mauve
	DE: '#a89a7e', // Taupe
	FL: '#b8d9e6', // Sky blue
	GA: '#d4a896', // Peach
	HI: '#6a8fb8', // Ocean blue
	ID: '#7ab878', // Forest green
	IL: '#b8936d', // Chocolate
	IN: '#9db88b', // Olive
	IA: '#b8d49a', // Light green
	KS: '#d4b887', // Wheat
	KY: '#9db8a6', // Mint
	LA: '#d49f8f', // Salmon
	ME: '#7a9fb8', // Slate blue
	MD: '#8ba89b', // Sea green
	MA: '#8b7fa6', // Lavender
	MI: '#6ab8d4', // Lake blue
	MN: '#7ab8c7', // Ice blue
	MS: '#b8a68b', // Sandy brown
	MO: '#9a9b96', // Slate
	MT: '#8fb8a8', // Seafoam
	NE: '#b8c478', // Sage green
	NV: '#d49f78', // Desert sand
	NH: '#6a9fb8', // Cool blue
	NJ: '#8b9fb8', // Slate
	NM: '#d4956f', // Adobe
	NY: '#7a8fb8', // Navy
	NC: '#b8a889', // Tan
	ND: '#8fb8c7', // Powder blue
	OH: '#8b9b96', // Gray green
	OK: '#d4a878', // Rust
	OR: '#7ab8a8', // Teal
	PA: '#8b8fa6', // Smoky purple
	RI: '#7a9fc7', // Periwinkle
	SC: '#b8a896', // Warm tan
	SD: '#b8d49f', // Light green
	TN: '#d4a885', // Caramel
	TX: '#a67c5c', // Velvet (as requested)
	UT: '#8fa67c', // Sage brown
	VT: '#78b878', // Pine green
	VA: '#9b96a6', // Dusty purple
	WA: '#6ab8a8', // Emerald
	WV: '#8b8b78', // Stone
	WI: '#78a6b8', // Cerulean
	WY: '#b8a878', // Tan gold
}

/**
 * Custom SVG US Map component with state click interactions
 */
export default function USMapSVG({
	states,
	onStateClick,
	selectedState,
}: Props) {
	// Auto-dismiss overlay after 5 seconds
	useEffect(() => {
		if (!selectedState) return

		const timer = setTimeout(() => {
			onStateClick(null)
		}, 5000)

		return () => clearTimeout(timer)
	}, [selectedState, onStateClick])

	// Create GDP quartiles for color grouping
	const gdpValues = useMemo(() => {
		return states.map((s) => s.gdp).sort((a, b) => a - b)
	}, [states])

	const quartiles = useMemo(() => {
		const q1 = gdpValues[Math.floor(gdpValues.length * 0.25)]
		const q2 = gdpValues[Math.floor(gdpValues.length * 0.5)]
		const q3 = gdpValues[Math.floor(gdpValues.length * 0.75)]
		return { q1, q2, q3, max: gdpValues[gdpValues.length - 1] }
	}, [gdpValues])

	// Pastel color palette for 4 GDP groups
	const GDP_COLORS = {
		lowest: '#c7d2e8', // Pastel purple/lavender
		low: '#d9e9c1', // Pastel green/lime
		medium: '#f5d5b8', // Pastel orange
		high: '#f5b9b1', // Pastel pink/coral
		selected: '#8b5cf6', // Purple (selected state)
	}

	/**
	 * Get color based on state's GDP quartile or state-specific color when selected
	 */
	const getColorByGDP = useCallback(
		(state: USState): string => {
			if (selectedState?.code === state.code) {
				return STATE_COLORS[state.code] || GDP_COLORS.selected
			}

			const gdp = state.gdp
			if (gdp <= quartiles.q1) return GDP_COLORS.lowest
			if (gdp <= quartiles.q2) return GDP_COLORS.low
			if (gdp <= quartiles.q3) return GDP_COLORS.medium
			return GDP_COLORS.high
		},
		[selectedState?.code, quartiles],
	)

	const handleStateClick = useCallback(
		(stateCode: string) => {
			const state = states.find((s) => s.code === stateCode)
			if (state) {
				onStateClick(state)
			}
		},
		[states, onStateClick],
	)

	return (
		<div className="w-full">
			<div
				className="flex justify-center relative"
				style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}
			>
				<div className="relative w-full" style={{ display: 'inline-block' }}>
					<div
						className="rounded-lg"
						style={{
							width: '800px',
							height: '593px',
							position: 'relative',
						}}
					>
						<svg
							width="800"
							height="593"
							viewBox="0 0 900 600"
							role="img"
							aria-label="Interactive United States map showing GDP data by color"
						>
							{states.map((state) => (
								// biome-ignore lint/a11y/useSemanticElements: Using a <g> element with role='button' is a standard way to make SVG shapes accessible as buttons.
								<g
									key={`${state.code}-${selectedState?.code}`}
									onClick={() => handleStateClick(state.code)}
									aria-label={`${state.name} - GDP: $${state.gdp}B`}
									style={{ cursor: 'pointer' }}
									role="button"
									tabIndex={0}
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											handleStateClick(state.code)
										}
									}}
								>
									<path
										d={STATE_PATHS[state.code]}
										fill={getColorByGDP(state)}
										stroke={
											selectedState?.code === state.code ? '#1a4d52' : '#ffffff'
										}
										strokeWidth={selectedState?.code === state.code ? '4' : '2'}
										style={{
											filter:
												selectedState?.code === state.code
													? 'drop-shadow(0 0 6px rgba(26, 77, 82, 0.4))'
													: undefined,
											willChange: 'fill',
										}}
									/>
								</g>
							))}
						</svg>
					</div>

					{/* State Info Overlay */}
					{selectedState && STATE_OVERLAY_POSITIONS[selectedState.code] && (
						<div
							className="absolute rounded-lg shadow-lg p-4 z-10"
							style={{
								backgroundColor: '#b2dfd9',
								color: '#1a5a52',
								left: STATE_OVERLAY_POSITIONS[selectedState.code].x,
								top: STATE_OVERLAY_POSITIONS[selectedState.code].y,
								transform: 'translate(-50%, -50%)',
								minWidth: '220px',
							}}
						>
							<button
								type="button"
								onClick={() => onStateClick(null)}
								className="absolute top-2 right-2 text-lg leading-none transition-opacity"
								style={{ color: 'inherit', opacity: 0.6 }}
								onMouseEnter={(e) => {
									e.currentTarget.style.opacity = '1'
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.opacity = '0.6'
								}}
								aria-label="Close state details"
							>
								×
							</button>
							<div className="pr-6">
								<h3
									className="font-bold text-lg mb-3"
									style={{ color: 'inherit' }}
								>
									{selectedState.name}
								</h3>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span style={{ color: 'inherit', opacity: 0.75 }}>
											Population:
										</span>
										<span className="font-semibold">
											{(selectedState.population / 1_000_000).toFixed(1)}M
										</span>
									</div>
									<div className="flex justify-between">
										<span style={{ color: 'inherit', opacity: 0.75 }}>
											GDP:
										</span>
										<span className="font-semibold">
											${selectedState.gdp.toLocaleString()}B
										</span>
									</div>
									<div className="flex justify-between text-xs">
										<span style={{ color: 'inherit', opacity: 0.65 }}>
											Per Capita:
										</span>
										<span className="font-semibold">
											$
											{(
												(selectedState.gdp * 1_000_000_000) /
												selectedState.population
											).toLocaleString('en-US', {
												maximumFractionDigits: 0,
											})}
										</span>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Legend */}
			<div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
				<div className="flex items-center gap-2">
					<div
						className="w-6 h-6 rounded-sm border border-gray-300"
						style={{ backgroundColor: GDP_COLORS.lowest }}
					/>
					<span className="text-base-content/70">
						Lowest GDP
						<br />
						<span className="text-xs">${(quartiles.q1 || 0).toFixed(0)}B</span>
					</span>
				</div>
				<div className="flex items-center gap-2">
					<div
						className="w-6 h-6 rounded-sm border border-gray-300"
						style={{ backgroundColor: GDP_COLORS.low }}
					/>
					<span className="text-base-content/70">
						Low GDP
						<br />
						<span className="text-xs">
							${(quartiles.q1 || 0).toFixed(0)}-$
							{(quartiles.q2 || 0).toFixed(0)}B
						</span>
					</span>
				</div>
				<div className="flex items-center gap-2">
					<div
						className="w-6 h-6 rounded-sm border border-gray-300"
						style={{ backgroundColor: GDP_COLORS.medium }}
					/>
					<span className="text-base-content/70">
						Medium GDP
						<br />
						<span className="text-xs">
							${(quartiles.q2 || 0).toFixed(0)}-$
							{(quartiles.q3 || 0).toFixed(0)}B
						</span>
					</span>
				</div>
				<div className="flex items-center gap-2">
					<div
						className="w-6 h-6 rounded-sm border border-gray-300"
						style={{ backgroundColor: GDP_COLORS.high }}
					/>
					<span className="text-base-content/70">
						High GDP
						<br />
						<span className="text-xs">${(quartiles.q3 || 0).toFixed(0)}B+</span>
					</span>
				</div>
			</div>
		</div>
	)
}
