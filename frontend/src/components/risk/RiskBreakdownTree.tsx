import type { RiskDriver } from '@/types/risk'
import { GitBranch } from 'lucide-react'

interface RiskBreakdownTreeProps {
  drivers: RiskDriver[]
}

const categoryColor: Record<string, string> = {
  CRITICAL: 'border-red-400 bg-red-50',
  HIGH: 'border-orange-400 bg-orange-50',
  MEDIUM: 'border-yellow-400 bg-yellow-50',
  LOW: 'border-green-400 bg-green-50',
}

export default function RiskBreakdownTree({ drivers }: RiskBreakdownTreeProps) {
  if (drivers.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">No risk drivers available</div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <GitBranch className="h-5 w-5 text-brand-600" />
        <h3 className="text-sm font-semibold text-gray-900">Risk Breakdown</h3>
      </div>
      <div className="space-y-3">
        {drivers.map((d) => (
          <div
            key={d.asset_id}
            className={`rounded-lg border-l-4 p-4 ${categoryColor[d.risk_category] ?? 'border-gray-300 bg-gray-50'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{d.asset_name}</p>
                <p className="mt-1 text-xs text-gray-600">
                  Category: {d.risk_category} · Open Vulns: {d.open_vulns}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{d.risk_score.toFixed(1)}</p>
                <p className="text-xs text-gray-500">
                  EAL: ₹{d.expected_annual_loss.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-white/50">
              <div
                className="h-2 rounded-full bg-current opacity-30"
                style={{ width: `${Math.min(d.risk_score, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
