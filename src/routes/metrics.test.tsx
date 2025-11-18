import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MetricsComponent } from './metrics'
import { parseMetrics } from '../lib/metrics'

const metrics = `# HELP proxy_requests_total Total number of proxy requests
# TYPE proxy_requests_total counter
proxy_requests_total{path="/about"} 1
`

// Mock the global fetch function
global.fetch = vi.fn(() =>
  Promise.resolve({
    text: () => Promise.resolve(metrics),
  } as Response)
)

describe('MetricsComponent', () => {
  it('renders the metrics page and displays metrics', async () => {
    render(<MetricsComponent />)
    expect(screen.getByText('Proxy Metrics')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('proxy_requests_total')).toBeInTheDocument()
    })
  })
})
