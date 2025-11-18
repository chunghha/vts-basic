import { describe, it, expect } from 'vitest'
import { parseMetrics } from './metrics'

const metrics = `# HELP proxy_requests_total Total number of proxy requests
# TYPE proxy_requests_total counter
proxy_requests_total{path="/about"} 1
# HELP proxy_errors_total Total number of proxy errors
# TYPE proxy_errors_total counter
proxy_errors_total{error_type="upstream_error"} 1
# HELP proxy_responses_total Total number of proxy responses by status code
# TYPE proxy_responses_total counter
proxy_responses_total{status="500"} 1
# HELP proxy_upstream_latency_seconds Proxy upstream request latency in seconds
# TYPE proxy_upstream_latency_seconds summary
proxy_upstream_latency_seconds{quantile="0"} 0.002
proxy_upstream_latency_seconds{quantile="0.5"} 0.002
proxy_upstream_latency_seconds{quantile="0.9"} 0.002
proxy_upstream_latency_seconds{quantile="0.95"} 0.002
proxy_upstream_latency_seconds{quantile="0.99"} 0.002
proxy_upstream_latency_seconds{quantile="0.999"} 0.002
proxy_upstream_latency_seconds{quantile="1"} 0.002
proxy_upstream_latency_seconds_sum 0.002
proxy_upstream_latency_seconds_count 1
`

describe('parseMetrics', () => {
  it('parses the metrics', () => {
    const parsed = parseMetrics(metrics)
    expect(parsed).toHaveLength(4)
    expect(parsed[0].name).toBe('proxy_requests_total')
    expect(parsed[0].values).toHaveLength(1)
    expect(parsed[0].values[0].value).toBe(1)
    expect(parsed[0].values[0].labels).toEqual({ path: '/about' })
  })
})
