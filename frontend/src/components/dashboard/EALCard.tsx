import { IndianRupee, TrendingDown, TrendingUp } from 'lucide-react'

interface EALCardProps {
  eal: number
  previousEal?: number
}

function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`
  return `₹${value.toLocaleString('en-IN')}`
}

export default function EALCard({ eal, previousEal }: EALCardProps) {
  const diff = previousEal ? eal - previousEal : 0
  const improved = diff < 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
          <IndianRupee className="h-5 w-5 text-orange-600" />
        </div>
        {diff !== 0 && (
          <span
            className={`flex items-center gap-1 text-sm font-medium ${improved ? 'text-green-600' : 'text-red-600'}`}
          >
            {improved ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            {formatINR(Math.abs(diff))}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-gray-500">
        Expected Annual Loss
      </p>
      <p className="mt-1 text-3xl font-bold text-orange-600">{formatINR(eal)}</p>
    </div>
  )
}
