import EChart, { type EChartsCoreOption } from '@/components/charts/EChart'
import type { ROSIResult } from '@/types/investment'

interface InvestmentROSIChartProps {
  data: ROSIResult[]
}

export default function InvestmentROSIChart({ data }: InvestmentROSIChartProps) {
  const chartData = data.map((d) => ({
    name: d.control_name,
    rosi: d.rosi_percent,
  }))

  const option: EChartsCoreOption = {
    color: ['#38BDF8'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#161C25',
      borderColor: '#252C37',
      textStyle: { color: '#F1F5F9' },
      valueFormatter: (value: unknown) => `${Number(value).toFixed(1)}%`,
    },
    grid: { left: 45, right: 20, top: 20, bottom: 90 },
    xAxis: {
      type: 'category',
      data: chartData.map((d) => d.name),
      axisLabel: { fontSize: 10, color: '#64748B', interval: 0, rotate: 30 },
      axisLine: { lineStyle: { color: '#252C37' } },
    },
    yAxis: { type: 'value', axisLabel: { fontSize: 11, color: '#64748B' } },
    series: [
      {
        type: 'bar',
        data: chartData.map((d) => d.rosi),
        barMaxWidth: 34,
        itemStyle: { borderRadius: [4, 4, 0, 0], color: '#38BDF8' },
      },
    ],
  }

  return (
    <div className="cyber-card p-6">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">ROSI by Control</h3>
      <EChart option={option} height={300} />
    </div>
  )
}