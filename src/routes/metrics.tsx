import { createFileRoute } from '@tanstack/react-router'
import MetricsPage from '@/pages/metrics'

export const Route = createFileRoute('/metrics')({
	component: MetricsPage,
})
