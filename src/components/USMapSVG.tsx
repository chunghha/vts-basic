import { useCallback, useEffect, useMemo } from 'react'
import type { USState } from '../types/us-map'

interface Props {
	states: USState[]
	onStateClick: (state: USState | null) => void
	selectedState?: USState | null
}

import { US_STATE_PATHS as STATE_PATHS } from '../data/us-state-paths'

// Map of state codes to approximate overlay positions
const STATE_OVERLAY_POSITIONS: Record<string, { x: string; y: string }> = {
	AL: { x: '65%', y: '60%' },
	AK: { x: '10%', y: '75%' },
	AZ: { x: '25%', y: '45%' },
	AR: { x: '55%', y: '50%' },
	CA: { x: '15%', y: '35%' },
	CO: { x: '35%', y: '38%' },
	CT: { x: '85%', y: '25%' },
	DE: { x: '80%', y: '32%' },
	FL: { x: '72%', y: '72%' },
	GA: { x: '70%', y: '55%' },
	HI: { x: '8%', y: '88%' },
	ID: { x: '20%', y: '25%' },
	IL: { x: '60%', y: '35%' },
	IN: { x: '62%', y: '32%' },
	IA: { x: '52%', y: '30%' },
	KS: { x: '45%', y: '38%' },
	KY: { x: '65%', y: '42%' },
	LA: { x: '55%', y: '62%' },
	ME: { x: '88%', y: '15%' },
	MD: { x: '75%', y: '35%' },
	MA: { x: '85%', y: '22%' },
	MI: { x: '65%', y: '25%' },
	MN: { x: '52%', y: '18%' },
	MS: { x: '58%', y: '52%' },
	MO: { x: '52%', y: '42%' },
	MT: { x: '28%', y: '18%' },
	NE: { x: '45%', y: '32%' },
	NV: { x: '18%', y: '38%' },
	NH: { x: '82%', y: '18%' },
	NJ: { x: '78%', y: '28%' },
	NM: { x: '32%', y: '48%' },
	NY: { x: '78%', y: '20%' },
	NC: { x: '72%', y: '45%' },
	ND: { x: '45%', y: '18%' },
	OH: { x: '68%', y: '35%' },
	OK: { x: '48%', y: '48%' },
	OR: { x: '12%', y: '28%' },
	PA: { x: '72%', y: '30%' },
	RI: { x: '85%', y: '24%' },
	SC: { x: '72%', y: '52%' },
	SD: { x: '45%', y: '25%' },
	TN: { x: '62%', y: '48%' },
	TX: { x: '45%', y: '58%' },
	UT: { x: '22%', y: '38%' },
	VT: { x: '82%', y: '15%' },
	VA: { x: '72%', y: '40%' },
	WA: { x: '12%', y: '18%' },
	WV: { x: '70%', y: '38%' },
	WI: { x: '60%', y: '22%' },
	WY: { x: '32%', y: '28%' },
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
	 * Get color based on state's GDP quartile
	 */
	const getColorByGDP = useCallback(
		(state: USState): string => {
			if (selectedState?.code === state.code) {
				return GDP_COLORS.selected
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
									key={state.code}
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
										stroke="#ffffff"
										strokeWidth="2"
										style={{
											filter:
												selectedState?.code === state.code
													? 'brightness(0.9) drop-shadow(0 0 4px rgba(139, 92, 246, 0.5))'
													: undefined,
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
