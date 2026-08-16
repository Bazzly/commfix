import type { Status } from '@/lib/types'
import { STATUS_LABELS } from '@/lib/types'

const STATUS_CLASSES: Record<Status, string> = {
  reported: 'border border-amber text-ink bg-transparent',
  in_progress: 'bg-slate text-ink',
  resolved: 'bg-moss text-paper',
}

export default function StatusPill({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}
    >
      {status === 'resolved' && (
        <svg viewBox="0 0 16 16" width="11" height="11" fill="none" aria-hidden="true">
          <path
            d="M3 8.5l3 3 7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {STATUS_LABELS[status]}
    </span>
  )
}
