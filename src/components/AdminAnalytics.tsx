import {
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
  type Report,
} from '@/lib/types'
import StatTile from './ui/StatTile'

function averageResolveDays(reports: Report[]): number | null {
  const resolved = reports.filter((r) => r.status === 'resolved')
  if (resolved.length === 0) return null
  const totalDays = resolved.reduce((sum, r) => {
    const days = (new Date(r.updated_at).getTime() - new Date(r.created_at).getTime()) / 86_400_000
    return sum + Math.max(days, 0)
  }, 0)
  return totalDays / resolved.length
}

export default function AdminAnalytics({ reports }: { reports: Report[] }) {
  const total = reports.length
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length
  const totalUpvotes = reports.reduce((sum, r) => sum + r.upvotes, 0)
  const avgResolve = averageResolveDays(reports)

  const statusCounts = STATUSES.map((s) => ({
    status: s,
    count: reports.filter((r) => r.status === s).length,
  }))

  const categoryCounts = CATEGORIES.map((c) => ({
    category: c,
    count: reports.filter((r) => r.category === c).length,
  }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
  const maxCategoryCount = Math.max(1, ...categoryCounts.map((c) => c.count))

  if (total === 0) {
    return (
      <div className="rounded-card bg-ink/3 p-4">
        <h2 className="font-display text-xs font-bold uppercase tracking-wide text-ink/50">
          Analytics
        </h2>
        <p className="mt-2 font-mono text-xs text-ink/50">No reports yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 rounded-card bg-ink/3 p-4">
      <h2 className="font-display text-xs font-bold uppercase tracking-wide text-ink/50">
        Analytics
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total reports" value={total} />
        <StatTile label="Resolved" value={resolvedCount} />
        <StatTile label="Total upvotes" value={totalUpvotes} />
        <StatTile label="Avg. resolve time" value={avgResolve !== null ? `${avgResolve.toFixed(1)}d` : '—'} />
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-ink/60">Status breakdown</p>
        <div className="flex h-6 w-full overflow-hidden rounded-full bg-paper">
          {statusCounts
            .filter((s) => s.count > 0)
            .map((s, i, arr) => (
              <div
                key={s.status}
                title={`${STATUS_LABELS[s.status]}: ${s.count}`}
                style={{
                  width: `${(s.count / total) * 100}%`,
                  backgroundColor: STATUS_COLORS[s.status],
                  borderRight: i < arr.length - 1 ? '2px solid var(--color-paper)' : undefined,
                }}
              />
            ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {statusCounts.map((s) => (
            <span key={s.status} className="flex items-center gap-1.5 font-mono text-xs text-ink/70">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[s.status] }}
                aria-hidden="true"
              />
              {STATUS_LABELS[s.status]} ({s.count})
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-ink/60">By category</p>
        <div className="space-y-1.5">
          {categoryCounts.map((c) => (
            <div key={c.category} className="flex items-center gap-2">
              <span className="w-32 shrink-0 truncate text-xs text-ink/70">
                {CATEGORY_LABELS[c.category]}
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-paper">
                <div
                  title={`${CATEGORY_LABELS[c.category]}: ${c.count}`}
                  className="h-full rounded-full"
                  style={{
                    width: `${(c.count / maxCategoryCount) * 100}%`,
                    backgroundColor: CATEGORY_COLORS[c.category],
                  }}
                />
              </div>
              <span className="w-6 shrink-0 text-right font-mono text-xs text-ink">{c.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
