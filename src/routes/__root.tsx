import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from '../components/ErrorBoundary'
import Header from '../components/Header'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import appCss from '../styles.css?url'
// Client-side emoji replacer to provide consistent emoji images across platforms
// (replaces inline <span class="emoji">...</span> with Twemoji SVG images)
import '../client/emoji'

interface MyRouterContext {
	queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: 'utf-8',
			},
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			},
			{
				title: 'TanStack Start Starter',
			},
			{
				httpEquiv: 'Content-Security-Policy',
				content: [
					"default-src 'self'",
					"script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for dev tools
					"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
					"font-src 'self' https://fonts.gstatic.com",
					"img-src 'self' data: https:",
					"connect-src 'self' https://restcountries.com",
					"frame-src 'none'",
					"object-src 'none'",
					"base-uri 'self'",
					"form-action 'self'",
				].join('; '),
			},
		],
		links: [
			{
				rel: 'stylesheet',
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" data-theme="pursuit">
			<head>
				<HeadContent />
			</head>
			<body className="bg-base-100 font-sans">
				<a href="#main-content" className="skip-link">
					Skip to main content
				</a>
				<ErrorBoundary>
					<Header />
					{children}
				</ErrorBoundary>
				<Toaster
					position="bottom-left"
					toastOptions={{
						// Default options for all toasts
						duration: 3000,
						style: {
							background: 'var(--color-base-100)',
							color: 'var(--color-base-content)',
							border: '1px solid var(--color-base-300)',
						},
						success: {
							iconTheme: {
								primary: 'var(--color-success)',
								secondary: 'var(--color-success-content)',
							},
						},
						error: {
							iconTheme: {
								primary: 'var(--color-error)',
								secondary: 'var(--color-error-content)',
							},
						},
					}}
				/>
				<TanStackDevtools
					config={{
						position: 'bottom-right',
					}}
					plugins={[
						{
							name: 'Tanstack Router',
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	)
}
