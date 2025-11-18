import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const config = defineConfig({
	plugins: [
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ['./tsconfig.json'],
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico', 'logo.svg', 'robots.txt'],
			devOptions: {
				enabled: false, // Disable in dev mode
			},
			manifest: {
				name: 'VTS Basic - Country Explorer',
				short_name: 'VTS Basic',
				description: 'A modern country explorer with offline support',
				theme_color: '#ffffff',
				background_color: '#ffffff',
				display: 'standalone',
				start_url: '/',
				scope: '/',
				icons: [
					{
						src: '/logo.svg',
						sizes: '192x192',
						type: 'image/svg+xml',
						purpose: 'any maskable',
					},
				],
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2,ttf}'],
				cleanupOutdatedCaches: true,
				clientsClaim: true,
				skipWaiting: true,
				// Increase maximum file size for caching (default is 2MB)
				maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
				runtimeCaching: [
					{
						// Use NetworkFirst for navigation requests to ensure fresh content when online
						urlPattern: ({ request }) => request.mode === 'navigate',
						handler: 'NetworkFirst',
						options: {
							cacheName: 'pages-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24, // 1 day
							},
							networkTimeoutSeconds: 3,
						},
					},
					{
						// Use StaleWhileRevalidate for API to get cached data quickly while updating in background
						urlPattern: /^https:\/\/restcountries\.com\/.*/i,
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'countries-api-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
							// Add background sync for failed requests
							backgroundSync: {
								name: 'countries-api-queue',
								options: {
									maxRetentionTime: 24 * 60, // Retry for up to 24 hours (in minutes)
								},
							},
						},
					},
					{
						// Cache flag images with CacheFirst (they rarely change)
						urlPattern: /^https:\/\/flagcdn\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'flags-cache',
							expiration: {
								maxEntries: 300,
								maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						// Cache Google Fonts stylesheets
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'google-fonts-stylesheets',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
							},
						},
					},
					{
						// Cache Google Fonts webfonts
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-webfonts',
							expiration: {
								maxEntries: 30,
								maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
				],
			},
		}),
	],
	base: '/',
})

export default config