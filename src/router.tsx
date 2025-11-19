import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import * as TanstackQuery from './integrations/tanstack-query/root-provider'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
	const rqContext = TanstackQuery.getContext()

	const router = createRouter({
		routeTree,
		context: { ...rqContext },
		defaultPreload: 'intent',
		Wrap: (props: { children: React.ReactNode }) => {
			return (
				<TanstackQuery.Provider {...rqContext}>
					{props.children}
				</TanstackQuery.Provider>
			)
		},
	})

	setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient })

	// Track route visits only on actual navigation (not on data refetches)
	router.subscribe('onBeforeNavigate', (event) => {
		// Only track if the pathname is actually changing
		// fromLocation can be undefined on initial navigation
		if (
			!event.fromLocation ||
			event.fromLocation.pathname !== event.toLocation.pathname
		) {
			fetch('/api/events', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ route: event.toLocation.pathname }),
			}).catch((error) => {
				// Silently fail or log in development to avoid breaking the app
				if (import.meta.env.DEV) {
					console.warn('Failed to track route event:', error)
				}
			})
		}
	})

	return router
}
