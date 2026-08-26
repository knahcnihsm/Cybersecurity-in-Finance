import { Wallet } from 'lucide-react'

interface BudgetCardProps {
  allocated: number
  total: number
}

function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`
  return `₹${value.toLocaleString('en-IN')}`
}

export default function BudgetCard({ allocated, total }: BudgetCardProps) {
  const pct = total > 0 ? (allocated / total) * 100 : 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
          <Wallet className="h-5 w-5 text-green-600" />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-gray-500">Security Budget</p>
      <p className="mt-1 text-3xl font-bold text-green-600">{formatINR(total)}</p>
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Allocated: {formatINR(allocated)}</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-green-500 transition-all"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
