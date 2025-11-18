import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { parseMetrics, Metric } from '../lib/metrics'

export const Route = createFileRoute('/metrics')({
  component: MetricsComponent,
})

export function MetricsComponent() {
  const [metrics, setMetrics] = useState<Metric[]>([])

  useEffect(() => {
    fetch('/api/metrics')
      .then((res) => res.text())
      .then((text) => setMetrics(parseMetrics(text)))
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Proxy Metrics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{metric.name}</h2>
              <p>{metric.help}</p>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Value</th>
                      {Object.keys(metric.values[0]?.labels || {}).map(
                        (label) => (
                          <th key={label}>{label}</th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {metric.values.map((value, i) => (
                      <tr key={i}>
                        <td>{value.value}</td>
                        {Object.values(value.labels).map((label, j) => (
                          <td key={j}>{label}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
