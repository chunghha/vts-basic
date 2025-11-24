import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

type Metric = {
	timestamp: string
	requests: number
	latency: number
}

type RouteMetric = {
	route: string
	visits: number
}

type CombinedMetrics = {
	timeSeries: Metric
	routeMetrics: RouteMetric[]
}

async function fetchCurrentMetrics(): Promise<CombinedMetrics> {
	const res = await fetch('/api/metrics')
	if (!res.ok) {
		throw new Error(`Failed to fetch metrics: ${res.statusText}`)
	}
	const text = await res.text()

	let totalRequests = 0
	let medianLatency = 0
	const routeMetrics: RouteMetric[] = []

	const requestsMatch = text.matchAll(
		/^proxy_requests_total\{path=".*?"\}\s+(\d+)$/gm,
	)
	for (const match of requestsMatch) {
		totalRequests += parseInt(match[1], 10)
	}

	const latencyMatch = text.match(
		/proxy_upstream_latency_seconds\{quantile="0.5"\}\s+([\d.]+)$/m,
	)
	if (latencyMatch?.[1]) {
		medianLatency = parseFloat(latencyMatch[1])
	}

	const routeMatch = text.matchAll(
		/^frontend_events_total\{route="(.*?)"\}\s+(\d+)$/gm,
	)
	for (const match of routeMatch) {
		routeMetrics.push({ route: match[1], visits: parseInt(match[2], 10) })
	}

	return {
		timeSeries: {
			timestamp: new Date().toLocaleTimeString(),
			requests: totalRequests,
			latency: medianLatency * 1000, // Convert to milliseconds
		},
		routeMetrics,
	}
}

export default function MetricsPage() {
	const [metricsData, setMetricsData] = useState<Metric[]>([])
	const [routeData, setRouteData] = useState<RouteMetric[]>([])

	const { data, isLoading, isError, error } = useQuery<CombinedMetrics, Error>({
		queryKey: ['currentMetrics'],
		queryFn: fetchCurrentMetrics,
		refetchInterval: 10000, // Refetch every 10 seconds
	})

	useEffect(() => {
		if (data) {
			setMetricsData((prevData) => {
				const newData = [...prevData, data.timeSeries]
				return newData.slice(-20)
			})
			setRouteData(data.routeMetrics)
		}
	}, [data])

	// Scroll Animation Logic
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible')
					}
				}
			},
			{ threshold: 0.1 },
		)

		const elements = document.querySelectorAll('.animate-on-scroll')
		for (const el of elements) observer.observe(el)

		return () => observer.disconnect()
	}, [])

	if (isLoading && metricsData.length === 0) {
		return (
			<div className="flex flex-col justify-center items-center h-screen bg-base-100">
				<div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-primary"></div>
				<p className="mt-6 text-lg text-base-content/70">Loading metrics...</p>
			</div>
		)
	}

	if (isError) {
		return (
			<div className="min-h-screen bg-base-100 flex items-center justify-center p-6">
				<div className="alert alert-error shadow-lg max-w-md">
					<div>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="stroke-current shrink-0 h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							role="alert"
						>
							<title>Error</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>Error: {error.message}</span>
					</div>
				</div>
			</div>
		)
	}

	return (
		<main className="min-h-screen bg-base-100 text-base-content">
			{/* Hero Section */}
			<section className="pt-6 pb-12 px-6 bg-linear-to-b from-base-200/50 to-base-100">
				<div className="max-w-7xl mx-auto">
					<div className="text-center animate-on-scroll">
						<div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full mb-4">
							<span className="inline-block w-2 h-2 bg-success rounded-full animate-pulse" />
							<span className="text-sm font-semibold text-success">
								Live Updates
							</span>
						</div>
						<h1 className="text-4xl md:text-5xl font-extrabold mb-4">
							<span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
								Application Metrics
							</span>
						</h1>
						<p className="text-lg text-base-content/70 max-w-2xl mx-auto">
							Real-time monitoring of requests and latency. Data refreshes every
							10 seconds.
						</p>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-6 py-8">
				<div className="grid grid-cols-1 gap-8">
					{/* Requests and Latency Chart */}
					<div className="card bg-base-100 border border-primary/20 shadow-lg hover:shadow-xl transition-shadow animate-on-scroll">
						<div className="card-body">
							<h2 className="card-title text-2xl font-bold mb-4 flex items-center gap-2">
								<span className="mr-2 text-primary">📈</span>
								Requests and Latency Over Time
								<span className="ml-2 badge badge-sm bg-primary/10 text-primary border-0">
									Last 20 data points
								</span>
							</h2>
							<div className="w-full h-96">
								<ResponsiveContainer>
									<LineChart
										data={metricsData}
										margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
									>
										<CartesianGrid strokeDasharray="3 3" opacity={0.3} />
										<XAxis dataKey="timestamp" style={{ fontSize: '12px' }} />
										<YAxis
											yAxisId="left"
											label={{
												value: 'Requests',
												angle: -90,
												position: 'insideLeft',
												style: { fontSize: '14px', fontWeight: 'bold' },
											}}
											style={{ fontSize: '12px' }}
										/>
										<YAxis
											yAxisId="right"
											orientation="right"
											label={{
												value: 'Latency (ms)',
												angle: 90,
												position: 'insideRight',
												style: { fontSize: '14px', fontWeight: 'bold' },
											}}
											style={{ fontSize: '12px' }}
										/>
										<Tooltip
											contentStyle={{
												backgroundColor: 'hsl(var(--b1))',
												border: '1px solid hsl(var(--bc) / 0.2)',
												borderRadius: '8px',
											}}
										/>
										<Legend />
										<Line
											yAxisId="left"
											type="monotone"
											dataKey="requests"
											stroke="hsl(var(--p))"
											strokeWidth={2}
											activeDot={{ r: 8 }}
											name="Requests"
										/>
										<Line
											yAxisId="right"
											type="monotone"
											dataKey="latency"
											stroke="hsl(var(--s))"
											strokeWidth={2}
											name="Latency (ms)"
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>

					{/* Route Visits Chart */}
					<div className="card bg-base-100 border border-secondary/20 shadow-lg hover:shadow-xl transition-shadow animate-on-scroll">
						<div className="card-body">
							<h2 className="card-title text-2xl font-bold mb-4 flex items-center gap-2">
								<span className="mr-2 text-secondary">📊</span>
								Route Visits
								<span className="ml-2 badge badge-sm bg-secondary/10 text-secondary border-0">
									{routeData.length} routes
								</span>
							</h2>
							<div className="w-full h-96">
								<ResponsiveContainer>
									<BarChart
										data={routeData}
										layout="vertical"
										margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
									>
										<CartesianGrid strokeDasharray="3 3" opacity={0.3} />
										<XAxis type="number" style={{ fontSize: '12px' }} />
										<YAxis
											dataKey="route"
											type="category"
											width={120}
											interval={0}
											style={{ fontSize: '12px' }}
										/>
										<Tooltip
											contentStyle={{
												backgroundColor: 'hsl(var(--b1))',
												border: '1px solid hsl(var(--bc) / 0.2)',
												borderRadius: '8px',
											}}
										/>
										<Legend />
										<Bar
											dataKey="visits"
											fill="hsl(var(--s))"
											name="Visits"
											radius={[0, 8, 8, 0]}
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>

					{/* Quick Stats */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-on-scroll">
						<div className="card bg-linear-to-br from-primary/5 to-primary/10 border border-primary/20 shadow-md">
							<div className="card-body text-center">
								<div className="text-4xl font-extrabold text-primary mb-2">
									{metricsData.length > 0
										? metricsData[metricsData.length - 1].requests
										: 0}
								</div>
								<div className="text-sm font-semibold text-base-content/70 uppercase tracking-wider">
									Total Requests
								</div>
							</div>
						</div>

						<div className="card bg-linear-to-br from-secondary/5 to-secondary/10 border border-secondary/20 shadow-md">
							<div className="card-body text-center">
								<div className="text-4xl font-extrabold text-secondary mb-2">
									{metricsData.length > 0
										? metricsData[metricsData.length - 1].latency.toFixed(2)
										: 0}
									<span className="text-2xl ml-1">ms</span>
								</div>
								<div className="text-sm font-semibold text-base-content/70 uppercase tracking-wider">
									Current Latency
								</div>
							</div>
						</div>

						<div className="card bg-linear-to-br from-accent/5 to-accent/10 border border-accent/20 shadow-md">
							<div className="card-body text-center">
								<div className="text-4xl font-extrabold text-accent mb-2">
									{routeData.length}
								</div>
								<div className="text-sm font-semibold text-base-content/70 uppercase tracking-wider">
									Active Routes
								</div>
							</div>
						</div>
					</div>

					{/* How It Works */}
					<div className="card bg-base-200/30 border border-base-300/30 shadow-md animate-on-scroll">
						<div className="card-body">
							<h3 className="text-xl font-bold mb-4 flex items-center gap-2">
								<span>ℹ️</span>
								How This Page Works
							</h3>
							<div className="space-y-3 text-base-content/80">
								<p>
									<strong className="text-base-content">
										Live Monitoring:
									</strong>{' '}
									This page fetches metrics from{' '}
									<code className="bg-base-300/50 px-2 py-0.5 rounded text-sm">
										/api/metrics
									</code>{' '}
									every 10 seconds to display real-time application performance.
								</p>
								<p>
									<strong className="text-base-content">
										Requests & Latency:
									</strong>{' '}
									The line chart tracks total proxy requests and median upstream
									latency over the last 20 data points.
								</p>
								<p>
									<strong className="text-base-content">Route Visits:</strong>{' '}
									The bar chart shows frontend event counts per route, helping
									you understand which pages are most visited.
								</p>
								<p>
									<strong className="text-base-content">Quick Stats:</strong>{' '}
									The cards above provide at-a-glance metrics for current
									requests, latency, and active routes.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}
