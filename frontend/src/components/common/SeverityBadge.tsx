import { clsx } from 'clsx'
import type { Severity } from '@/types/vulnerability'

interface SeverityBadgeProps {
  severity: Severity
}

const colorMap: Record<Severity, string> = {
  CRITICAL: 'bg-red-600',
  HIGH: 'bg-orange-600',
  MEDIUM: 'bg-yellow-600',
  LOW: 'bg-green-600',
  INFO: 'bg-blue-600',
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white',
        colorMap[severity]
      )}
    >
      {severity}
    </span>
  )
}
