import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { RiskTrend } from '@/types/risk'

interface RiskTimelineProps {
  data: RiskTrend
}

export default function RiskTimeline({ data }: RiskTimelineProps) {
  const chartData = data.dates.map((date, i) => ({
    date,
    riskScore: data.risk_scores[i],
    eal: data.eal_values[i],
  }))

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Risk Score Timeline</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: string) => {
              const d = new Date(v)
              return `${d.getMonth() + 1}/${d.getDate()}`
            }}
          />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="riskScore"
            stroke="#dc2626"
            strokeWidth={2}
            dot={false}
            name="Risk Score"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="eal"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="EAL (₹)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
