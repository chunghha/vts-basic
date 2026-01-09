import { useState } from 'react'
import { Footer } from '../../components/Footer'
import USMapSVG from '../../components/USMapSVG'
import { US_STATES_DATA_FULL } from '../../data/us-states'
import { US_MAP_MODES } from '../../constants/us-map-colors'
import type { USState } from '../../types/us-map'
import type { USMapMode } from '../../constants/us-map-colors'

/**
 * US States interactive map page
 * Displays population, GDP and median income data for each state
 */
export default function USMapPage() {
	const [selectedState, setSelectedState] = useState<USState | null>(null)
	const [displayMode, setDisplayMode] = useState<USMapMode>(US_MAP_MODES.GDP)

	const statesData = US_STATES_DATA_FULL

	// Calculate statistics
	const totalPopulation = statesData.reduce((sum, s) => sum + s.population, 0)
	const totalGDP = statesData.reduce((sum, s) => sum + s.gdp, 0)
	const totalMedianIncome = statesData.reduce((sum, s) => sum + s.medianIncome, 0)
	const avgMedianIncome = totalMedianIncome / statesData.length

	return (
		<main className="min-h-screen bg-base-100 text-base-content">
			<section className="py-12 px-6">
				<div className="max-w-5xl mx-auto">
					{/* Page Header */}
					<div className="mb-8">
						<h1 className="text-4xl md:text-5xl font-extrabold mb-4">
							US States by Population, GDP & Income
						</h1>
						<p className="text-lg text-base-content/70 max-w-2xl">
							Click on a state to view its population, GDP and median income data.
						</p>
					</div>

					{/* Interactive Map */}
					<div className="bg-base-200 rounded-lg p-6 shadow-lg mb-12">
						<h2 className="text-2xl font-bold mb-4">Interactive Map</h2>
						<USMapSVG
							states={statesData}
							onStateClick={setSelectedState}
							selectedState={selectedState}
							displayMode={displayMode}
							onModeChange={setDisplayMode}
						/>
					</div>

					{/* Statistics Section */}
					<section className="bg-base-200/50 rounded-lg p-8">
						<h2 className="text-2xl font-bold mb-6">National Summary</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							<div className="stat bg-base-100 rounded-lg shadow">
								<div className="stat-title">Total Population</div>
								<div className="stat-value">
									{(totalPopulation / 1_000_000).toFixed(1)}M
								</div>
							</div>
							<div className="stat bg-base-100 rounded-lg shadow">
								<div className="stat-title">Combined GDP</div>
								<div className="stat-value">${totalGDP.toLocaleString()}B</div>
							</div>
							<div className="stat bg-base-100 rounded-lg shadow">
								<div className="stat-title">Avg Median Income</div>
								<div className="stat-value">
									${avgMedianIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}
								</div>
							</div>
							<div className="stat bg-base-100 rounded-lg shadow">
								<div className="stat-title">States</div>
								<div className="stat-value">{statesData.length}</div>
							</div>
						</div>
					</section>
				</div>
			</section>

			<Footer page="us-map" />
		</main>
	)
}
