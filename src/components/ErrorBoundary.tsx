import { Component, type ReactNode } from 'react'

interface Props {
	children: ReactNode
	fallback?: ReactNode
}

interface State {
	hasError: boolean
	error?: Error
}

/**
 * ErrorBoundary catches React component errors and displays a fallback UI
 * instead of crashing the entire application.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: unknown) {
		// Log error to console in development, could send to monitoring service in production
		console.error('Error boundary caught:', error, errorInfo)
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
						<div className="card bg-base-100 shadow-xl max-w-md w-full">
							<div className="card-body">
								<h2 className="card-title text-error">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="stroke-current flex-shrink-0 h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
									>
										<title>Error</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									Something went wrong
								</h2>
								<p className="text-base-content/70">
									{this.state.error?.message || 'An unexpected error occurred'}
								</p>
								{import.meta.env.DEV && this.state.error?.stack && (
									<details className="mt-4">
										<summary className="cursor-pointer text-sm text-base-content/60 hover:text-base-content">
											Error details
										</summary>
										<pre className="mt-2 text-xs bg-base-200 p-2 rounded overflow-auto max-h-40">
											{this.state.error.stack}
										</pre>
									</details>
								)}
								<div className="card-actions justify-end mt-4">
									<button
										type="button"
										className="btn btn-ghost"
										onClick={() =>
											this.setState({ hasError: false, error: undefined })
										}
									>
										Try Again
									</button>
									<button
										type="button"
										className="btn btn-primary"
										onClick={() => window.location.reload()}
									>
										Reload Page
									</button>
								</div>
							</div>
						</div>
					</div>
				)
			)
		}

		return this.props.children
	}
}
