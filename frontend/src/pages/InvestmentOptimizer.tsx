import { useState, useEffect } from 'react'
import { investmentApi } from '@/api/investmentApi'
import InvestmentROSIChart from '@/components/charts/InvestmentROSIChart'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { OptimizeResult, ROSIResult, SecurityControl } from '@/types/investment'
import { Wallet, TrendingDown, Percent, Clock, Save } from 'lucide-react'
import { clsx } from 'clsx'

function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`
  return `₹${value.toLocaleString('en-IN')}`
}

export default function InvestmentOptimizer() {
  const [budget, setBudget] = useState(10000000)
  const [optimizing, setOptimizing] = useState(false)
  const [result, setResult] = useState<OptimizeResult | null>(null)
  const [controls, setControls] = useState<SecurityControl[]>([])
  const [rosiData, setRosiData] = useState<ROSIResult[]>([])
  const [controlsLoading, setControlsLoading] = useState(true)

  useEffect(() => {
    Promise.all([investmentApi.listControls()])
      .then(([ctrlRes]) => {
        setControls(ctrlRes.data)
      })
      .catch(() => {})
      .finally(() => setControlsLoading(false))
  }, [])

  const runOptimize = async () => {
    setOptimizing(true)
    try {
      const res = await investmentApi.optimize({ budget_inr: budget })
      setResult(res.data)

      const rosiPromises = res.data.items.map((item) =>
        investmentApi.getROSI(item.control_id).catch(() => null)
      )
      const rosiResults = await Promise.all(rosiPromises)
      setRosiData(rosiResults.filter((r) => r !== null).map((r) => r!.data))
    } catch {}
    setOptimizing(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Investment Optimizer</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Budget Configuration</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-gray-500">Security Budget (₹)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              step={100000}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <input
              type="range"
              min={1000000}
              max={50000000}
              step={500000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="mt-2 w-full accent-brand-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>₹10 L</span>
              <span>₹5 Cr</span>
            </div>
          </div>
          <button
            onClick={runOptimize}
            disabled={optimizing}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {optimizing ? (
              <LoadingSpinner size="sm" className="border-white border-t-transparent" />
            ) : null}
            Optimize
          </button>
        </div>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Wallet className="h-4 w-4" />
                <span className="text-xs">Total Budget</span>
              </div>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {formatINR(result.total_budget)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Wallet className="h-4 w-4 text-green-500" />
                <span className="text-xs">Allocated</span>
              </div>
              <p className="mt-1 text-lg font-bold text-green-600">
                {formatINR(result.total_allocated)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Wallet className="h-4 w-4 text-gray-400" />
                <span className="text-xs">Remaining</span>
              </div>
              <p className="mt-1 text-lg font-bold text-gray-600">
                {formatINR(result.remaining_budget)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <TrendingDown className="h-4 w-4 text-orange-500" />
                <span className="text-xs">Risk Reduction</span>
              </div>
              <p className="mt-1 text-lg font-bold text-orange-600">
                {formatINR(result.expected_risk_reduction)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Percent className="h-4 w-4 text-brand-500" />
                <span className="text-xs">ROSI</span>
              </div>
              <p className="mt-1 text-lg font-bold text-brand-600">
                {result.portfolio_rosi.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <InvestmentROSIChart data={rosiData} />
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">Optimization Summary</h3>
              <p className="text-sm text-gray-600">{result.summary}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900">Allocation by Control</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Control
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Allocation
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Risk Reduction
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      ROSI %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {result.items.map((item) => (
                    <tr key={item.control_id} className="hover:bg-brand-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">#{item.priority}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {item.control_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.control_type}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatINR(item.allocation_inr)}
                      </td>
                      <td className="px-4 py-3 text-sm text-orange-600">
                        {formatINR(item.risk_reduction)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-brand-600">
                        {item.expected_rosi.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100">
            <Save className="h-4 w-4" />
            Save as Plan
          </button>
        </>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Available Security Controls</h3>
        </div>
        <div className="overflow-x-auto">
          {controlsLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Control
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Implementation Cost
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Annual Maintenance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Max Risk Reduction
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <Clock className="inline h-3 w-3" /> Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {controls.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.control_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatINR(c.implementation_cost)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatINR(c.annual_maintenance)}/yr
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600">
                      {c.max_risk_reduction}%
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {c.implementation_time_days} days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
