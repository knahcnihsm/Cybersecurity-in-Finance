import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useEffect, useState } from 'react'
import { riskApi } from '@/api/riskApi'
import { IndianRupee } from 'lucide-react'

export default function FinancialExposureChart() {
  const [data, setData] = useState<{ name: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    riskApi
      .getEAL()
      .then((res) => {
        const byDept = res.data.breakdown_by_department
        const chartData = Object.entries(byDept).map(([name, value]) => ({
          name,
          value,
        }))
        setData(chartData)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
        Loading...
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <IndianRupee className="h-5 w-5 text-orange-500" />
        <h3 className="text-sm font-semibold text-gray-900">Financial Exposure by Department</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value: number) =>
              `₹${value.toLocaleString('en-IN')}`
            }
          />
          <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
