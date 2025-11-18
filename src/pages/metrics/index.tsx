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
		refetchInterval: 5000, // Refetch every 5 seconds
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

	if (isLoading && metricsData.length === 0) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
			</div>
		)
	}

	if (isError) {
		return (
			<div className="alert alert-error shadow-lg">
				<div>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="stroke-current shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						role="alert"
					>
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
		)
	}

	return (
		<main className="min-h-screen bg-base-100 text-base-content p-4 sm:p-6 lg:p-8">
			<div className="max-w-7xl mx-auto">
				<header className="mb-8">
					<h1 className="text-4xl font-bold text-center text-primary">
						Application Metrics
					</h1>
					<p className="text-lg text-center text-base-content/80 mt-2">
						Real-time monitoring of requests and latency.
					</p>
				</header>
				<div className="grid grid-cols-1 gap-8">
					<div className="card bg-base-100 shadow-sm">
						<div className="card-body">
							<h2 className="card-title">Requests and Latency Over Time</h2>
							<div style={{ width: '100%', height: 400 }}>
								<ResponsiveContainer>
									<LineChart
										data={metricsData}
										margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="timestamp" />
										<YAxis
											yAxisId="left"
											label={{
												value: 'Requests',
												angle: -90,
												position: 'insideLeft',
											}}
										/>
										<YAxis
											yAxisId="right"
											orientation="right"
											label={{
												value: 'Latency (ms)',
												angle: 90,
												position: 'insideRight',
											}}
										/>
										<Tooltip />
										<Legend />
										<Line
											yAxisId="left"
											type="monotone"
											dataKey="requests"
											stroke="#8884d8"
											activeDot={{ r: 8 }}
										/>
										<Line
											yAxisId="right"
											type="monotone"
											dataKey="latency"
											stroke="#82ca9d"
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>
					<div className="card bg-base-100 shadow-sm">
						<div className="card-body">
							<h2 className="card-title">Route Visits</h2>
							<div style={{ width: '100%', height: 400 }}>
								<ResponsiveContainer>
									<BarChart
										data={routeData}
										layout="vertical"
										margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis type="number" />
										<YAxis
											dataKey="route"
											type="category"
											width={120}
											yAxisId="left"
											interval={0}
										/>
										<YAxis
											yAxisId="right"
											orientation="right"
											tick={false}
											tickLine={false}
											axisLine={false}
											label={{
												value: '\u00A0',
												angle: 90,
												position: 'insideRight',
											}}
										/>
										<Tooltip />
										<Legend />
										<Bar dataKey="visits" fill="#8884d8" />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}
