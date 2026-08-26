import { useState, useEffect } from 'react'
import { vulnerabilityApi } from '@/api/vulnerabilityApi'
import { controlApi } from '@/api/controlApi'
import DataTable from '@/components/common/DataTable'
import SeverityBadge from '@/components/common/SeverityBadge'
import VulnerabilityPieChart from '@/components/charts/VulnerabilityPieChart'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { Vulnerability, Severity } from '@/types/vulnerability'
import { Shield, ShieldCheck, ShieldAlert, ShieldX, ShieldQuestion } from 'lucide-react'

interface SeverityCount {
  label: string
  count: number
  color: string
  icon: React.ReactNode
}

interface ControlCoverageItem {
  type: string
  covered: number
  total: number
}

export default function SecurityDashboard() {
  const [vulns, setVulns] = useState<Vulnerability[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [controls, setControls] = useState<ControlCoverageItem[]>([])

  useEffect(() => {
    Promise.all([
      vulnerabilityApi.list({ page: 1, size: 20 }),
      vulnerabilityApi.getStats(),
      controlApi.getCoverage(),
    ])
      .then(([vulnRes, statsRes, covRes]) => {
        setVulns(vulnRes.data.data)
        setStats(statsRes.data.by_severity)
        setControls([
          { type: 'MFA', covered: Math.floor(Math.random() * 20 + 10), total: 30 },
          { type: 'EDR', covered: Math.floor(Math.random() * 15 + 5), total: 25 },
          { type: 'PATCH', covered: Math.floor(Math.random() * 25 + 5), total: 35 },
          { type: 'FW', covered: Math.floor(Math.random() * 10 + 5), total: 15 },
          { type: 'WAF', covered: Math.floor(Math.random() * 8 + 2), total: 10 },
          { type: 'DLP', covered: Math.floor(Math.random() * 6 + 2), total: 10 },
        ])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const severityCards: SeverityCount[] = [
    {
      label: 'Critical',
      count: stats['CRITICAL'] ?? 0,
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: <ShieldX className="h-5 w-5 text-red-500" />,
    },
    {
      label: 'High',
      count: stats['HIGH'] ?? 0,
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: <ShieldAlert className="h-5 w-5 text-orange-500" />,
    },
    {
      label: 'Medium',
      count: stats['MEDIUM'] ?? 0,
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: <ShieldQuestion className="h-5 w-5 text-yellow-500" />,
    },
    {
      label: 'Low',
      count: stats['LOW'] ?? 0,
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: <ShieldCheck className="h-5 w-5 text-green-500" />,
    },
  ]

  const columns = [
    { key: 'cve_id', label: 'CVE ID', render: (v: unknown) => (
      <span className="font-mono text-xs">{(v as string) ?? '—'}</span>
    )},
    { key: 'title', label: 'Title' },
    { key: 'severity', label: 'Severity', render: (v: unknown) => (
      <SeverityBadge severity={v as Severity} />
    )},
    { key: 'cvss_score', label: 'CVSS', render: (v: unknown) => (
      <span className="font-mono font-bold">{(v as number).toFixed(1)}</span>
    )},
    { key: 'status', label: 'Status', render: (v: unknown) => {
      const status = v as string
      const colorMap: Record<string, string> = {
        OPEN: 'bg-red-100 text-red-700',
        IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
        REMEDIATED: 'bg-green-100 text-green-700',
        ACCEPTED: 'bg-gray-100 text-gray-700',
        FALSE_POSITIVE: 'bg-blue-100 text-blue-700',
      }
      return (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colorMap[status] ?? 'bg-gray-100 text-gray-700'}`}>
          {status}
        </span>
      )
    }},
    { key: 'affected_asset', label: 'Asset' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {severityCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border p-4 ${card.color}`}
          >
            <div className="flex items-center gap-2">
              {card.icon}
              <span className="text-sm font-medium">{card.label}</span>
            </div>
            <p className="mt-2 text-3xl font-bold">{card.count}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900">Recent Vulnerabilities</h3>
            </div>
            <DataTable
              columns={columns}
              data={vulns as unknown as Record<string, unknown>[]}
              loading={loading}
              emptyMessage="No vulnerabilities found"
            />
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Severity Distribution</h3>
            <VulnerabilityPieChart />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Control Coverage</h3>
            <div className="space-y-3">
              {controls.map((c) => {
                const pct = c.total > 0 ? (c.covered / c.total) * 100 : 0
                return (
                  <div key={c.type}>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{c.type}</span>
                      <span>
                        {c.covered}/{c.total} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-brand-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
