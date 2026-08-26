import { clsx } from 'clsx'

interface RiskAsset {
  name: string
  probability: number
  financial_impact: number
  risk_score: number
}

interface RiskMatrixProps {
  assets: RiskAsset[]
}

const impactLabels = ['Low', 'Medium', 'High', 'Very High', 'Critical']
const likelihoodLabels = ['High', 'Very High', 'Medium', 'Low', 'Lowest']

function getCellColor(row: number, col: number): string {
  const severity = (4 - row) + col
  if (severity >= 7) return 'bg-red-500/20 border-red-300'
  if (severity >= 5) return 'bg-orange-400/20 border-orange-300'
  if (severity >= 3) return 'bg-yellow-400/20 border-yellow-300'
  return 'bg-green-400/20 border-green-300'
}

function getDotColor(score: number): string {
  if (score >= 80) return 'bg-red-600'
  if (score >= 60) return 'bg-orange-500'
  if (score >= 40) return 'bg-yellow-500'
  return 'bg-green-500'
}

function mapToCell(probability: number, impact: number): { row: number; col: number } {
  const row = Math.min(4, Math.max(0, Math.round((1 - probability) * 4)))
  const impactNormalized = impact > 0 ? Math.min(1, impact / 10000000) : 0
  const col = Math.min(4, Math.max(0, Math.round(impactNormalized * 4)))
  return { row, col }
}

export default function RiskMatrix({ assets }: RiskMatrixProps) {
  const cellAssets: RiskAsset[][][] = Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () => [])
  )

  assets.forEach((a) => {
    const { row, col } = mapToCell(a.probability, a.financial_impact)
    cellAssets[row][col].push(a)
  })

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Risk Matrix (Likelihood × Impact)</h3>
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="px-3 py-2 text-xs font-medium text-gray-500">Likelihood ↓ / Impact →</th>
              {impactLabels.map((label) => (
                <th
                  key={label}
                  className="w-24 border px-3 py-2 text-center text-xs font-medium text-gray-500"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {likelihoodLabels.map((label, rowIdx) => (
              <tr key={label}>
                <td className="border px-3 py-2 text-xs font-medium text-gray-500">
                  {label}
                </td>
                {impactLabels.map((_, colIdx) => (
                  <td
                    key={colIdx}
                    className={clsx(
                      'relative h-16 w-24 border',
                      getCellColor(rowIdx, colIdx)
                    )}
                  >
                    <div className="flex flex-wrap gap-1 p-1">
                      {cellAssets[rowIdx][colIdx].map((a) => (
                        <div
                          key={a.name}
                          className={clsx(
                            'group relative h-3 w-3 rounded-full',
                            getDotColor(a.risk_score)
                          )}
                          title={`${a.name} (Score: ${a.risk_score})`}
                        >
                          <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                            {a.name}: {a.risk_score.toFixed(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
