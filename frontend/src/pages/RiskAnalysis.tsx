import { useState, useEffect } from 'react'
import { riskApi } from '@/api/riskApi'
import { assetApi } from '@/api/assetApi'
import RiskMatrix from '@/components/risk/RiskMatrix'
import RiskTimeline from '@/components/risk/RiskTimeline'
import FinancialExposureChart from '@/components/charts/FinancialExposureChart'
import RiskBreakdownTree from '@/components/risk/RiskBreakdownTree'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { EnterpriseRisk, RiskTrend, EALResult } from '@/types/risk'
import type { Asset } from '@/types/asset'
import { clsx } from 'clsx'

function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`
  return `₹${value.toLocaleString('en-IN')}`
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-red-600'
  if (score >= 60) return 'text-orange-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-green-600'
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return 'stroke-red-500'
  if (score >= 60) return 'stroke-orange-500'
  if (score >= 40) return 'stroke-yellow-500'
  return 'stroke-green-500'
}

export default function RiskAnalysis() {
  const [enterpriseRisk, setEnterpriseRisk] = useState<EnterpriseRisk | null>(null)
  const [trends, setTrends] = useState<RiskTrend | null>(null)
  const [eal, setEal] = useState<EALResult | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      riskApi.getScore(),
      riskApi.getTrends(),
      riskApi.getEAL(),
      assetApi.list({ size: 100 }),
    ])
      .then(([scoreRes, trendRes, ealRes, assetRes]) => {
        setEnterpriseRisk(scoreRes.data)
        setTrends(trendRes.data)
        setEal(ealRes.data)
        setAssets(assetRes.data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const score = enterpriseRisk?.enterprise_risk_score ?? 0
  const circumference = 2 * Math.PI * 80
  const dashOffset = circumference - (score / 100) * circumference

  const matrixAssets = (eal?.asset_eals ?? []).map((a) => ({
    name: a.asset_name,
    probability: a.probability,
    financial_impact: a.financial_impact,
    risk_score: a.risk_score,
  }))

  const sortedAssets = [...(eal?.asset_eals ?? [])].sort((a, b) => b.eal - a.eal)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Risk Analysis</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <svg className="h-44 w-44 -rotate-90">
            <circle cx="88" cy="88" r="80" fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle
              cx="88"
              cy="88"
              r="80"
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              className={clsx('transition-all duration-700', getScoreRingColor(score))}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute mt-1">
            <p className={clsx('text-4xl font-bold', getScoreColor(score))}>{score.toFixed(1)}</p>
            <p className="text-center text-sm text-gray-500">Enterprise Risk</p>
          </div>
        </div>
        <div className="lg:col-span-3">
          <RiskBreakdownTree drivers={enterpriseRisk?.top_risk_drivers ?? []} />
        </div>
      </div>

      <RiskMatrix assets={matrixAssets} />

      <RiskTimeline
        data={trends ?? { dates: [], eal_values: [], risk_scores: [], vuln_counts: [] }}
      />

      <FinancialExposureChart />

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">All Assets by EAL</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Asset
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Risk Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  EAL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedAssets.map((a) => (
                <tr key={a.asset_id} className="hover:bg-brand-50 transition-colors">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                    {a.asset_name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                    {a.asset_type}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                    {a.department}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={clsx('text-sm font-bold', getScoreColor(a.risk_score))}>
                      {a.risk_score.toFixed(1)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-orange-600">
                    {formatINR(a.eal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
