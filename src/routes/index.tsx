import { createFileRoute } from '@tanstack/react-router'
import { ROUTES } from '../enums/routes.enum'
import Home from '../pages/Home'
import type { Theme } from '../types/theme'

export const Route = createFileRoute(`${ROUTES.HOME}`)({
	component: Home,

	// Server-side loader: fetch themes and return directly for component consumption.
	// During SSR, we fetch from the proxy server which has the /api/themes endpoint.
	loader: async () => {
		try {
			// Use absolute URL for SSR (proxy runs on 3000 and has /api/themes)
			// In SSR context, we fetch from the proxy server
			const baseUrl =
				typeof window === 'undefined'
					? 'http://127.0.0.1:3000' // SSR: fetch from proxy server
					: '' // Client: use relative URL (proxied)

			const res = await fetch(`${baseUrl}/api/themes`)
			if (!res.ok) {
				throw new Error('Failed to fetch themes')
			}
			const themes = (await res.json()) as Theme[]
			return { themes }
		} catch (err) {
			// Don't fail SSR if the fetch fails; log and return empty array.
			// eslint-disable-next-line no-console
			console.warn('Failed to fetch themes in loader', err)
			return { themes: [] as Theme[] }
		}
	},
})
