import { AlertTriangle } from 'lucide-react'
import type { RiskDriver } from '@/types/risk'

interface TopRiskCardProps {
  drivers: RiskDriver[]
}

function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`
  return `₹${value.toLocaleString('en-IN')}`
}

const categoryColor: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
}

export default function TopRiskCard({ drivers }: TopRiskCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        <h3 className="text-sm font-semibold text-gray-900">Top Risk Drivers</h3>
      </div>
      <div className="space-y-3">
        {drivers.length === 0 && (
          <p className="text-sm text-gray-500">No risk drivers found.</p>
        )}
        {drivers.slice(0, 5).map((d, i) => (
          <div
            key={d.asset_id}
            className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">{d.asset_name}</p>
                <p className="text-xs text-gray-500">
                  {d.open_vulns} open vulns · EAL {formatINR(d.expected_annual_loss)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor[d.risk_category] ?? 'bg-gray-100 text-gray-700'}`}
              >
                {d.risk_category}
              </span>
              <span className="text-sm font-bold text-gray-900">
                {d.risk_score.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
