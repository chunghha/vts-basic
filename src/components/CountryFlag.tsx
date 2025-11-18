import { useState } from 'react'

/**
 * Props for the CountryFlag component
 */
interface CountryFlagProps {
	/** Country code (e.g., 'US', 'GB') */
	code: string
	/** Country name for alt text */
	name: string
	/** Optional URL to flag image */
	flagUrl?: string
	/** Emoji flag as fallback */
	flagEmoji: string
}

/**
 * Optimized country flag component with lazy loading and graceful fallback
 *
 * Features:
 * - Lazy loading for better performance
 * - Shows emoji immediately, upgrades to image when loaded
 * - Falls back to emoji if image fails to load
 * - Prevents layout shift with fixed dimensions
 *
 * @param code - Country code
 * @param name - Country name for accessibility
 * @param flagUrl - Optional URL to flag image
 * @param flagEmoji - Emoji flag as fallback
 */
export function CountryFlag({
	code,
	name,
	flagUrl,
	flagEmoji,
}: CountryFlagProps) {
	const [imageError, setImageError] = useState(false)
	const [imageLoaded, setImageLoaded] = useState(false)

	// If no URL or error occurred, show emoji
	if (!flagUrl || imageError) {
		return (
			<div
				className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center text-2xl"
				role="img"
				aria-label={`Flag of ${name}`}
			>
				{flagEmoji || '🏳️'}
			</div>
		)
	}

	return (
		<div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center overflow-hidden relative">
			{/* Show emoji while loading */}
			{!imageLoaded && (
				<div
					className="absolute inset-0 flex items-center justify-center text-2xl"
					role="img"
					aria-label={`Loading flag of ${name}`}
				>
					{flagEmoji || '🏳️'}
				</div>
			)}

			{/* Actual flag image */}
			<img
				src={flagUrl}
				alt={`Flag of ${name}`}
				loading="lazy"
				onLoad={() => setImageLoaded(true)}
				onError={() => setImageError(true)}
				className={`w-full h-full object-cover transition-opacity duration-200 ${
					imageLoaded ? 'opacity-100' : 'opacity-0'
				}`}
			/>
		</div>
	)
}
