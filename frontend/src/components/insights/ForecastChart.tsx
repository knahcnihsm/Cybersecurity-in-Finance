import { useEffect, useState } from 'react'
import { riskApi } from '@/api/riskApi'
import EChart, { type EChartsCoreOption } from '@/components/charts/EChart'
import { TrendingDown, Loader2 } from 'lucide-react'
import type { ForecastResult } from '@/types/riskInsights'

function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`
  return `₹${value.toLocaleString('en-IN')}`
}

export default function ForecastChart() {
  const [forecast, setForecast] = useState<ForecastResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    riskApi
      .getForecast()
      .then((res) => setForecast(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-tertiary">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Projecting do-nothing trajectory...
      </div>
    )
  }

  if (!forecast) return null

  const labels = (forecast.series ?? []).map((s) => `M${s.month}`)
  const option: EChartsCoreOption = {
    color: ['#F43F5E', '#818CF8'],
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#161C25',
      borderColor: '#252C37',
      textStyle: { color: '#F1F5F9' },
      valueFormatter: (value: unknown) => `₹${Number(value).toLocaleString('en-IN')}`,
    },
    legend: { data: ['Projected EAL', 'Projected Risk Score'], top: 0 },
    grid: { left: 60, right: 40, top: 34, bottom: 30 },
    xAxis: { type: 'category', data: labels, axisLabel: { fontSize: 11, color: '#64748B' } },
    yAxis: [
      { type: 'value', name: 'EAL (₹)', splitLine: { lineStyle: { color: '#1B212B' } } },
      { type: 'value', name: 'Score', min: 0, max: 100, splitLine: { show: false } },
    ],
    series: [
      {
        name: 'Projected EAL',
        type: 'line',
        data: (forecast.series ?? []).map((s) => s.eal_inr),
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2 },
        markLine: {
          symbol: 'none',
          label: { formatter: 'do nothing' },
          data: [{ yAxis: forecast.baseline.current_eal_inr }],
        },
      },
      {
        name: 'Projected Risk Score',
        type: 'line',
        yAxisIndex: 1,
        data: (forecast.series ?? []).map((s) => s.risk_score),
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2 },
      },
    ],
  }

  return (
    <div className="cyber-card p-6">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-primary">
        <TrendingDown className="h-4 w-4 text-status-critical" />
        Do-Nothing Forecast (12 Months)
      </h3>
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-lg bg-accent-primary/10 px-3 py-1 text-accent-primary">
          Today: {formatINR(forecast.baseline.current_eal_inr)}
        </span>
        <span className="rounded-lg bg-status-high/10 px-3 py-1 text-status-high">
          6m: {formatINR(forecast.eal_at_6_months)}
        </span>
        <span className="rounded-lg bg-status-critical/10 px-3 py-1 text-status-critical">
          12m: {formatINR(forecast.eal_at_12_months)}
        </span>
      </div>
      <EChart option={option} height={280} />
      <p className="mt-2 text-[11px] text-text-tertiary">{forecast.method}</p>
    </div>
  )
}
