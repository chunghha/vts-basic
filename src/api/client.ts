/**
 * ApiClient - Centralized HTTP client for API requests
 *
 * Provides:
 * - Consistent error handling
 * - Retry logic for failed requests
 * - Type-safe responses
 * - Request/response interceptors
 *
 * @example
 * ```typescript
 * const client = new ApiClient()
 * const data = await client.get<Country[]>('/api/country')
 * ```
 */

export class ApiError extends Error {
	constructor(
		message: string,
		public status?: number,
		public statusText?: string,
	) {
		super(message)
		this.name = 'ApiError'
	}
}

interface ApiClientOptions {
	baseURL?: string
	timeout?: number
	retries?: number
	retryDelay?: number
}

export class ApiClient {
	private baseURL: string
	private timeout: number
	private retries: number
	private retryDelay: number

	constructor(options: ApiClientOptions = {}) {
		this.baseURL = options.baseURL || ''
		this.timeout = options.timeout || 30000 // 30 seconds
		this.retries = options.retries || 3
		this.retryDelay = options.retryDelay || 1000 // 1 second
	}

	/**
	 * Perform a GET request
	 * @param url - The URL to fetch
	 * @param options - Optional fetch options
	 * @returns Promise resolving to typed response data
	 */
	async get<T>(url: string, options?: RequestInit): Promise<T> {
		return this.request<T>(url, { ...options, method: 'GET' })
	}

	/**
	 * Perform a POST request
	 * @param url - The URL to post to
	 * @param data - The data to send
	 * @param options - Optional fetch options
	 * @returns Promise resolving to typed response data
	 */
	async post<T>(
		url: string,
		data?: unknown,
		options?: RequestInit,
	): Promise<T> {
		return this.request<T>(url, {
			...options,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...options?.headers,
			},
			body: data ? JSON.stringify(data) : undefined,
		})
	}

	/**
	 * Core request method with retry logic
	 */
	private async request<T>(url: string, options?: RequestInit): Promise<T> {
		const fullURL = this.baseURL + url

		return this.retry(async () => {
			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), this.timeout)

			try {
				const response = await fetch(fullURL, {
					...options,
					signal: controller.signal,
				})

				clearTimeout(timeoutId)

				return await this.handleResponse<T>(response)
			} catch (error) {
				clearTimeout(timeoutId)
				throw error
			}
		})
	}

	/**
	 * Handle response and extract data
	 */
	private async handleResponse<T>(response: Response): Promise<T> {
		if (!response.ok) {
			throw new ApiError(
				`HTTP ${response.status}: ${response.statusText}`,
				response.status,
				response.statusText,
			)
		}

		const contentType = response.headers.get('content-type')
		if (contentType?.includes('application/json')) {
			return response.json()
		}

		// For non-JSON responses, return text as unknown type
		return response.text() as unknown as T
	}

	/**
	 * Retry logic for failed requests
	 */
	private async retry<T>(
		fn: () => Promise<T>,
		retriesLeft: number = this.retries,
	): Promise<T> {
		try {
			return await fn()
		} catch (error) {
			if (retriesLeft <= 0) {
				throw error
			}

			// Don't retry on client errors (4xx)
			if (error instanceof ApiError && error.status && error.status < 500) {
				throw error
			}

			// Wait before retrying
			await new Promise((resolve) => setTimeout(resolve, this.retryDelay))

			// Retry with exponential backoff
			const newDelay = this.retryDelay * 2
			const originalDelay = this.retryDelay
			this.retryDelay = newDelay

			try {
				return await this.retry(fn, retriesLeft - 1)
			} finally {
				this.retryDelay = originalDelay
			}
		}
	}
}

// Export a default instance
export const apiClient = new ApiClient({
	retries: 3,
	retryDelay: 1000,
	timeout: 30000,
})
