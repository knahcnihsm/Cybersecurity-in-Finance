import { useState, useEffect, useCallback } from 'react'
import { assetApi } from '@/api/assetApi'
import DataTable from '@/components/common/DataTable'
import { clsx } from 'clsx'
import { Search, Plus, Eye, Edit, Server, Database, Globe, Monitor, Cloud, Laptop } from 'lucide-react'
import type { Asset } from '@/types/asset'

const typeIcons: Record<string, React.ReactNode> = {
  SERVER: <Server className="h-3.5 w-3.5" />,
  DATABASE: <Database className="h-3.5 w-3.5" />,
  APPLICATION: <Globe className="h-3.5 w-3.5" />,
  NETWORK: <Monitor className="h-3.5 w-3.5" />,
  CLOUD: <Cloud className="h-3.5 w-3.5" />,
  ENDPOINT: <Laptop className="h-3.5 w-3.5" />,
}

const typeColors: Record<string, string> = {
  SERVER: 'bg-blue-100 text-blue-700',
  DATABASE: 'bg-purple-100 text-purple-700',
  APPLICATION: 'bg-green-100 text-green-700',
  NETWORK: 'bg-orange-100 text-orange-700',
  CLOUD: 'bg-cyan-100 text-cyan-700',
  ENDPOINT: 'bg-gray-100 text-gray-700',
}

function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`
}

function getCriticalityColor(score: number): string {
  if (score >= 80) return 'bg-red-500'
  if (score >= 60) return 'bg-orange-500'
  if (score >= 40) return 'bg-yellow-500'
  return 'bg-green-500'
}

export default function AssetManagement() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, size: 20 }
      if (typeFilter) params.asset_type = typeFilter
      const res = await assetApi.list(params as any)
      setAssets(res.data.data)
      setTotal(res.data.total)
    } catch {}
    setLoading(false)
  }, [page, typeFilter])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  const filtered = search
    ? assets.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.department.toLowerCase().includes(search.toLowerCase())
      )
    : assets

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (v: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[row.asset_type as string] ?? 'bg-gray-100 text-gray-700'}`}>
            {typeIcons[row.asset_type as string]}
            {row.asset_type as string}
          </span>
          <span className="font-medium text-gray-900">{v as string}</span>
        </div>
      ),
    },
    { key: 'department', label: 'Department' },
    {
      key: 'criticality_score',
      label: 'Criticality',
      render: (v: unknown) => {
        const score = v as number
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-20 rounded-full bg-gray-200">
              <div
                className={`h-2 rounded-full ${getCriticalityColor(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">{score}</span>
          </div>
        )
      },
    },
    {
      key: 'business_value_inr',
      label: 'Business Value',
      render: (v: unknown) => (
        <span className="font-medium">{formatINR(v as number)}</span>
      ),
    },
    {
      key: 'internet_exposed',
      label: 'Internet Exposed',
      className: 'text-center',
      render: (v: unknown) => (
        <span
          className={clsx(
            'mx-auto block h-3 w-3 rounded-full',
            v ? 'bg-red-500' : 'bg-green-500'
          )}
        />
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      className: 'text-center',
      render: (_v: unknown) => (
        <div className="flex items-center justify-center gap-1">
          <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-brand-600">
            <Eye className="h-4 w-4" />
          </button>
          <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-brand-600">
            <Edit className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-sm text-gray-500">{total} assets total</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" />
          Add Asset
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Types</option>
          <option value="SERVER">Server</option>
          <option value="DATABASE">Database</option>
          <option value="APPLICATION">Application</option>
          <option value="NETWORK">Network</option>
          <option value="CLOUD">Cloud</option>
          <option value="ENDPOINT">Endpoint</option>
        </select>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <DataTable
          columns={columns}
          data={filtered as unknown as Record<string, unknown>[]}
          loading={loading}
          emptyMessage="No assets found"
        />
      </div>
    </div>
  )
}
