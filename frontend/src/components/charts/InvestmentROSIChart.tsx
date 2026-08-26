import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ROSIResult } from '@/types/investment'

interface InvestmentROSIChartProps {
  data: ROSIResult[]
}

export default function InvestmentROSIChart({ data }: InvestmentROSIChartProps) {
  const chartData = data.map((d) => ({
    name: d.control_name,
    rosi: d.rosi_percent,
    netBenefit: d.net_benefit,
  }))

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">ROSI by Control</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={80} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
          <Bar dataKey="rosi" fill="#4f46e5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
