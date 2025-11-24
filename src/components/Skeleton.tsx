import type { CSSProperties } from 'react'

/**
 * Skeleton component props
 */
export interface SkeletonProps {
	/** Variant of the skeleton */
	variant?: 'text' | 'circular' | 'rectangular'
	/** Width of the skeleton */
	width?: string | number
	/** Height of the skeleton */
	height?: string | number
	/** Additional CSS classes */
	className?: string
}

/**
 * Skeleton component with shimmer animation for loading states
 *
 * @example
 * ```tsx
 * <Skeleton variant="circular" width={48} height={48} />
 * <Skeleton variant="text" width="75%" height={24} />
 * <Skeleton variant="rectangular" width="100%" height={200} />
 * ```
 */
export function Skeleton({
	variant = 'rectangular',
	width,
	height,
	className = '',
}: SkeletonProps) {
	const baseClasses = 'bg-base-200 relative overflow-hidden'

	const variantClasses = {
		text: 'rounded',
		circular: 'rounded-full',
		rectangular: 'rounded-lg',
	}

	const style: CSSProperties = {
		width: typeof width === 'number' ? `${width}px` : width,
		height: typeof height === 'number' ? `${height}px` : height,
	}

	return (
		<div
			className={`${baseClasses} ${variantClasses[variant]} ${className}`}
			style={style}
			aria-busy="true"
			aria-live="polite"
		>
			{/* Shimmer effect */}
			<div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-base-300/50 to-transparent" />
		</div>
	)
}
