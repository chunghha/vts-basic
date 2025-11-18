import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import packageJson from '../../package.json'
import { ErrorBoundary } from '../components/ErrorBoundary'
import Header from '../components/Header'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import appCss from '../styles.css?url'

interface MyRouterContext {
	queryClient: QueryClient
}

export const APP_VERSION = packageJson.version

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
				<ErrorBoundary>
					<Header />
					{children}
				</ErrorBoundary>
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
