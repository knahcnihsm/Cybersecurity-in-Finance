import EChart, { type EChartsCoreOption } from '@/components/charts/EChart'
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
      <div className="flex h-64 items-center justify-center text-sm text-text-tertiary">
        Loading...
      </div>
    )
  }

  const option: EChartsCoreOption = {
    color: ['#38BDF8'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#161C25',
      borderColor: '#252C37',
      textStyle: { color: '#F1F5F9' },
      valueFormatter: (value: unknown) => `₹${Number(value).toLocaleString('en-IN')}`,
    },
    grid: { left: 130, right: 40, top: 20, bottom: 30 },
    xAxis: { type: 'value', axisLabel: { fontSize: 11, color: '#64748B' } },
    yAxis: {
      type: 'category',
      data: data.map((d) => d.name),
      axisLabel: { fontSize: 11, color: '#94A3B8', width: 110, overflow: 'truncate' },
    },
    series: [
      {
        type: 'bar',
        data: data.map((d) => d.value),
        barMaxWidth: 22,
        itemStyle: { borderRadius: [0, 4, 4, 0], color: '#38BDF8' },
      },
    ],
  }

  return (
    <div className="cyber-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <IndianRupee className="h-5 w-5 text-status-info" />
        <h3 className="text-sm font-semibold text-text-primary">Financial Exposure by Department</h3>
      </div>
      <EChart option={option} height={300} />
    </div>
  )
}