import { useState, useEffect } from 'react'
import { riskApi } from '@/api/riskApi'
import { vulnerabilityApi } from '@/api/vulnerabilityApi'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Play, Plus, X, Zap, ArrowRight, CheckCircle2 } from 'lucide-react'
import type { ScenarioResult, ScenarioAssetChange } from '@/types/risk'
import type { Vulnerability } from '@/types/vulnerability'
import { clsx } from 'clsx'

const CONTROL_TYPES = [
  { value: 'MFA', label: 'Multi-Factor Authentication' },
  { value: 'EDR', label: 'Endpoint Detection & Response' },
  { value: 'PATCH', label: 'Patch Management' },
  { value: 'FW', label: 'Firewall Rules' },
  { value: 'WAF', label: 'Web Application Firewall' },
  { value: 'DLP', label: 'Data Loss Prevention' },
  { value: 'SIEM', label: 'SIEM Monitoring' },
  { value: 'BACKUP', label: 'Backup & Recovery' },
]

interface AppliedChange {
  id: string
  type: 'control' | 'remediation'
  label: string
  detail: string
  effectiveness?: number
  vulnId?: string
}

function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`
  return `₹${value.toLocaleString('en-IN')}`
}

export default function ScenarioSimulator() {
  const [currentEal, setCurrentEal] = useState(0)
  const [currentScore, setCurrentScore] = useState(0)
  const [topRisks, setTopRisks] = useState<{ name: string; score: number; eal: number }[]>([])
  const [openVulns, setOpenVulns] = useState<Vulnerability[]>([])
  const [changes, setChanges] = useState<AppliedChange[]>([])
  const [selectedControl, setSelectedControl] = useState('')
  const [effectiveness, setEffectiveness] = useState(50)
  const [selectedVuln, setSelectedVuln] = useState('')
  const [simulating, setSimulating] = useState(false)
  const [result, setResult] = useState<ScenarioResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([riskApi.getEAL(), riskApi.getScore(), vulnerabilityApi.list({ status: 'OPEN', size: 50 })])
      .then(([ealRes, scoreRes, vulnRes]) => {
        setCurrentEal(ealRes.data.total_eal)
        setCurrentScore(scoreRes.data.enterprise_risk_score)
        setTopRisks(
          scoreRes.data.top_risk_drivers.slice(0, 5).map((d) => ({
            name: d.asset_name,
            score: d.risk_score,
            eal: d.expected_annual_loss,
          }))
        )
        setOpenVulns(vulnRes.data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const addControl = () => {
    if (!selectedControl) return
    const ctrl = CONTROL_TYPES.find((c) => c.value === selectedControl)
    if (!ctrl) return
    setChanges((prev) => [
      ...prev,
      {
        id: `ctrl-${Date.now()}`,
        type: 'control',
        label: ctrl.label,
        detail: `Effectiveness: ${effectiveness}%`,
        effectiveness,
      },
    ])
    setSelectedControl('')
  }

  const addRemediation = () => {
    if (!selectedVuln) return
    const vuln = openVulns.find((v) => v.id === selectedVuln)
    if (!vuln) return
    setChanges((prev) => [
      ...prev,
      {
        id: `vuln-${Date.now()}`,
        type: 'remediation',
        label: `Remediate ${vuln.cve_id ?? vuln.title}`,
        detail: `CVSS: ${vuln.cvss_score}`,
        vulnId: vuln.id,
      },
    ])
    setSelectedVuln('')
  }

  const removeChange = (id: string) => {
    setChanges((prev) => prev.filter((c) => c.id !== id))
  }

  const runSimulation = async () => {
    setSimulating(true)
    try {
      const apiChanges = changes.map((c) => {
        if (c.type === 'control') {
          return { type: 'add_control', control_type: c.label, effectiveness: c.effectiveness }
        }
        return { type: 'remediate_vuln', vuln_id: c.vulnId }
      })
      const res = await riskApi.simulateScenario(apiChanges)
      setResult(res.data)
    } catch {}
    setSimulating(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Scenario Simulator</h1>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              1
            </div>
            Current State
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Enterprise Risk Score</p>
              <p className="text-3xl font-bold text-gray-900">{currentScore.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Expected Annual Loss</p>
              <p className="text-2xl font-bold text-orange-600">{formatINR(currentEal)}</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-gray-700">Top Risks</p>
              <div className="space-y-2">
                {topRisks.map((r) => (
                  <div key={r.name} className="flex items-center justify-between rounded-lg bg-gray-50 p-2">
                    <span className="text-xs text-gray-700">{r.name}</span>
                    <span className="text-xs font-bold text-gray-900">{r.score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                2
              </div>
              Build Changes
            </h2>

            <div className="space-y-3">
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="mb-2 text-xs font-medium text-gray-700">Add Security Control</p>
                <div className="flex gap-2">
                  <select
                    value={selectedControl}
                    onChange={(e) => setSelectedControl(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                  >
                    <option value="">Select control...</option>
                    {CONTROL_TYPES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedControl && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Effectiveness</span>
                      <span>{effectiveness}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="95"
                      value={effectiveness}
                      onChange={(e) => setEffectiveness(Number(e.target.value))}
                      className="mt-1 w-full accent-brand-600"
                    />
                  </div>
                )}
                <button
                  onClick={addControl}
                  disabled={!selectedControl}
                  className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  <Plus className="h-3 w-3" />
                  Add Control
                </button>
              </div>

              <div className="rounded-lg border border-gray-200 p-3">
                <p className="mb-2 text-xs font-medium text-gray-700">Remediate Vulnerability</p>
                <div className="flex gap-2">
                  <select
                    value={selectedVuln}
                    onChange={(e) => setSelectedVuln(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                  >
                    <option value="">Select vulnerability...</option>
                    {openVulns.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.cve_id ?? v.title} (CVSS {v.cvss_score})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={addRemediation}
                  disabled={!selectedVuln}
                  className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  <Plus className="h-3 w-3" />
                  Add Remediation
                </button>
              </div>
            </div>

            {changes.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-gray-700">Applied Changes ({changes.length})</p>
                <div className="space-y-1">
                  {changes.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2"
                    >
                      <div>
                        <p className="text-xs font-medium text-gray-900">{c.label}</p>
                        <p className="text-xs text-gray-500">{c.detail}</p>
                      </div>
                      <button
                        onClick={() => removeChange(c.id)}
                        className="rounded p-0.5 text-gray-400 hover:text-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={runSimulation}
              disabled={changes.length === 0 || simulating}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {simulating ? (
                <LoadingSpinner size="sm" className="border-white border-t-transparent" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Run Simulation
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
              3
            </div>
            Simulated State
          </h2>

          {result ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-semibold">Simulation Complete</span>
                </div>
                <p className="mt-2 text-xs text-green-600">{result.summary}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">New Risk Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {result.simulated_risk_score.toFixed(1)}
                  </p>
                  <p className="text-xs text-green-600">
                    {result.risk_score_change.toFixed(1)} change
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">New EAL</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatINR(result.simulated_eal)}
                  </p>
                  <p className="text-xs text-green-600">
                    {result.eal_reduction_percent.toFixed(1)}% reduction
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-gray-700">Per-Asset Changes</p>
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {result.asset_changes.map((c: ScenarioAssetChange) => (
                    <div
                      key={c.asset_id}
                      className="rounded-lg border border-gray-100 p-2"
                    >
                      <p className="text-xs font-medium text-gray-900">{c.asset_name}</p>
                      <p className="text-xs text-gray-500">
                        Score: {c.original_risk_score.toFixed(1)} → {c.simulated_risk_score.toFixed(1)} ·
                        EAL: {formatINR(c.original_eal)} → {formatINR(c.simulated_eal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand-300 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100">
                <Zap className="h-4 w-4" />
                Apply to Plan
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ArrowRight className="mb-3 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">
                Add changes and run simulation to see results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
