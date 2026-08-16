'use client'

import { useState } from 'react'
import Link from 'next/link'
import CategoryPill from './ui/CategoryPill'
import StatusPill from './ui/StatusPill'
import Ripple from './ui/Ripple'
import { relativeTime } from '@/lib/motion'
import { CATEGORY_LABELS, type Report } from '@/lib/types'

interface ReportCardProps {
  report: Report
  onUpvote?: (id: string) => void
  showShareLink?: boolean
}

export default function ReportCard({ report, onUpvote, showShareLink = true }: ReportCardProps) {
  const [rippleTrigger, setRippleTrigger] = useState(0)

  function handleUpvote() {
    setRippleTrigger((t) => t + 1)
    onUpvote?.(report.id)
  }

  return (
    <div className="w-60 space-y-2 rounded-card">
      {report.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={report.photo_url}
          alt={CATEGORY_LABELS[report.category]}
          className="h-28 w-full rounded-[calc(var(--radius-card)-8px)] object-cover"
        />
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <CategoryPill category={report.category} />
        <StatusPill status={report.status} />
      </div>

      {report.description && <p className="text-sm text-ink/80">{report.description}</p>}

      <p className="font-mono text-[11px] text-ink/45">
        Reported {relativeTime(report.created_at)}
      </p>

      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handleUpvote}
          className="relative overflow-visible rounded-full bg-ink/5 px-2.5 py-1 text-xs font-medium text-ink transition-colors hover:bg-ink/10"
        >
          👍 {report.upvotes} confirmed
          <Ripple trigger={rippleTrigger} color="var(--color-amber)" />
        </button>
        {showShareLink && (
          <Link
            href={`/report/${report.id}`}
            className="font-mono text-xs text-slate underline decoration-slate/50 underline-offset-2 hover:text-ink"
          >
            Share
          </Link>
        )}
      </div>
    </div>
  )
}
