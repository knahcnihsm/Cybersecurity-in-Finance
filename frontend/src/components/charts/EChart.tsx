import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart, TreemapChart, GaugeChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  DataZoomComponent,
  VisualMapComponent,
  MarkLineComponent,
  MarkPointComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption } from 'echarts/core'
import { useEffect, useRef } from 'react'

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  TreemapChart,
  GaugeChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  DataZoomComponent,
  VisualMapComponent,
  MarkLineComponent,
  MarkPointComponent,
  CanvasRenderer,
])

export type { EChartsCoreOption }

interface EChartProps {
  option: EChartsCoreOption
  height?: number | string
  className?: string
  onEvents?: Record<string, (params: unknown) => void>
}

const baseDark = {
  textStyle: { color: '#94A3B8', fontFamily: 'Inter, system-ui, sans-serif' },
  axisLine: { lineStyle: { color: '#252C37' } },
  splitLine: { lineStyle: { color: '#1B212B' } },
  axisLabel: { color: '#64748B' },
}

function mergeBase(option: EChartsCoreOption): EChartsCoreOption {
  const withText = {
    ...option,
    textStyle: { ...(option.textStyle as object | undefined), ...baseDark.textStyle },
  }
  ;['xAxis', 'yAxis'].forEach((key) => {
    const axes = (withText as Record<string, unknown>)[key]
    if (!axes) return
    const arr = Array.isArray(axes) ? axes : [axes]
    arr.forEach((axis) => {
      axis.textStyle = { ...baseDark.textStyle }
      if (axis.type === 'category') axis.axisLabel = { color: '#64748B' }
    })
    ;(withText as Record<string, unknown>)[key] = Array.isArray(axes) ? arr : arr[0]
  })
  return withText
}

export default function EChart({ option, height = 300, className, onEvents }: EChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const chart = echarts.init(ref.current)
    chartRef.current = chart
    if (onEvents) {
      Object.entries(onEvents).forEach(([event, handler]) => {
        chart.on(event, handler)
      })
    }
    return () => {
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    chartRef.current?.setOption(mergeBase(option), { notMerge: false })
  }, [option])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    const resize = () => chart.resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height }}
    />
  )
}