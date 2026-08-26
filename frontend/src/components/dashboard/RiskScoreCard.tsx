import { Shield, TrendingDown, TrendingUp } from 'lucide-react'

interface RiskScoreCardProps {
  score: number
  previousScore?: number
}

export default function RiskScoreCard({ score, previousScore }: RiskScoreCardProps) {
  const diff = previousScore ? score - previousScore : 0
  const improved = diff < 0

  const getColor = (s: number) => {
    if (s >= 80) return 'text-red-600'
    if (s >= 60) return 'text-orange-600'
    if (s >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
          <Shield className="h-5 w-5 text-brand-600" />
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
            {Math.abs(diff).toFixed(1)}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-gray-500">Enterprise Risk Score</p>
      <p className={`mt-1 text-3xl font-bold ${getColor(score)}`}>{score.toFixed(1)}</p>
    </div>
  )
}
