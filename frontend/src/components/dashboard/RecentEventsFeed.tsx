import { useEffect, useState } from 'react'
import { vulnerabilityApi } from '@/api/vulnerabilityApi'
import { AlertCircle } from 'lucide-react'

interface EventItem {
  id: string
  event_type: string
  source: string
  asset_name?: string
  created_at: string
  details: Record<string, unknown>
}

export default function RecentEventsFeed() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vulnerabilityApi
      .list({ page: 1, size: 5 })
      .then((res) => {
        const mapped: EventItem[] = res.data.data.map((v) => ({
          id: v.id,
          event_type: v.severity,
          source: v.source ?? 'unknown',
          asset_name: v.affected_asset ?? undefined,
          created_at: v.created_at,
          details: {},
        }))
        setEvents(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const typeColor: Record<string, string> = {
    CRITICAL: 'bg-red-500',
    HIGH: 'bg-orange-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-green-500',
    INFO: 'bg-blue-500',
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-brand-600" />
        <h3 className="text-sm font-semibold text-gray-900">Recent Events</h3>
      </div>
      {loading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
      ) : events.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">No recent events</div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="flex items-start gap-3">
              <div
                className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${typeColor[e.event_type] ?? 'bg-gray-400'}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{e.event_type}</span>
                  {e.asset_name && (
                    <span className="text-gray-500"> on {e.asset_name}</span>
                  )}
                </p>
                <p className="text-xs text-gray-400">
                  {e.source} · {new Date(e.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
