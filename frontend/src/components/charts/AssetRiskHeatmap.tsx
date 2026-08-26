import { useState } from 'react'

interface AssetRiskHeatmapProps {
  assets: { name: string; risk_score: number }[]
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'bg-red-600'
  if (score >= 60) return 'bg-orange-500'
  if (score >= 40) return 'bg-yellow-500'
  if (score >= 20) return 'bg-lime-500'
  return 'bg-green-500'
}

export default function AssetRiskHeatmap({ assets }: AssetRiskHeatmapProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500">Asset Risk Heatmap</h3>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
        {assets.map((asset) => (
          <div
            key={asset.name}
            className={`relative flex h-12 cursor-default items-center justify-center rounded-md text-xs font-medium text-white transition-transform hover:scale-110 ${getScoreColor(asset.risk_score)}`}
            onMouseEnter={() => setHovered(asset.name)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="truncate px-1">{asset.risk_score}</span>
            {hovered === asset.name && (
              <div className="absolute -top-10 z-10 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg">
                {asset.name} ({asset.risk_score})
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
