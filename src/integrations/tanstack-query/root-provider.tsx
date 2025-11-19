import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function getContext() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: Infinity,
				// Reduce noisy refetch behavior during navigation / focus
				refetchOnWindowFocus: false,
				refetchOnMount: false,
				refetchOnReconnect: false,
				// Single retry for transient failures
				retry: 1,
			},
		},
	})

	// Small typed shim to avoid using `any` repeatedly while preserving
	// compatibility with code that expects `defaultQueryOptions` on the instance.
	type MaybeQueryClient = QueryClient & {
		defaultQueryOptions?: (opts?: unknown) => unknown
		getDefaultOptions?: () => unknown
		setDefaultOptions?: (opts?: unknown) => void
		defaultOptions?: unknown
	}

	const qc = queryClient as MaybeQueryClient

	if (typeof qc.defaultQueryOptions !== 'function') {
		qc.defaultQueryOptions = (opts?: unknown) => {
			try {
				if (opts && typeof qc.setDefaultOptions === 'function') {
					qc.setDefaultOptions(opts)
				}
			} catch (_) {
				// ignore setter errors
			}

			if (typeof qc.getDefaultOptions === 'function') {
				return qc.getDefaultOptions()
			}

			if (qc.defaultOptions) return qc.defaultOptions

			return {}
		}
	}

	return {
		queryClient,
	}
}

export function Provider({
	children,
	queryClient,
}: {
	children: React.ReactNode
	queryClient: QueryClient
}) {
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
}
