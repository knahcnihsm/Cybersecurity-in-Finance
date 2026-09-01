import EChart, { type EChartsCoreOption } from '@/components/charts/EChart'
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

  const option: EChartsCoreOption = {
    color: ['#38BDF8', '#818CF8'],
    tooltip: { trigger: 'axis', backgroundColor: '#161C25', borderColor: '#252C37', textStyle: { color: '#F1F5F9' } },
    legend: { data: ['Risk Score', 'EAL'], textStyle: { color: '#94A3B8' } },
    grid: { left: 40, right: 40, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: chartData.map((d) => d.date),
      axisLabel: {
        fontSize: 11,
        color: '#64748B',
        formatter: (v: string) => {
          const d = new Date(v)
          return `${d.getMonth() + 1}/${d.getDate()}`
        },
      },
      axisLine: { lineStyle: { color: '#252C37' } },
    },
    yAxis: [
      { type: 'value', splitLine: { lineStyle: { color: '#1B212B' } } },
      { type: 'value', splitLine: { show: false } },
    ],
    series: [
      {
        name: 'Risk Score',
        type: 'line',
        data: chartData.map((d) => d.riskScore),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#38BDF8' },
      },
      {
        name: 'EAL',
        type: 'line',
        yAxisIndex: 1,
        data: chartData.map((d) => d.eal),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#818CF8' },
      },
    ],
  }

  return (
    <div className="cyber-card p-6">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">Risk Score Timeline</h3>
      <EChart option={option} height={300} />
    </div>
  )
}