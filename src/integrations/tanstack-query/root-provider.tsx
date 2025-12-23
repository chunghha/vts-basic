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
