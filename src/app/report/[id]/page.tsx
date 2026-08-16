import Link from 'next/link'
import { notFound } from 'next/navigation'
import { fetchReport } from '@/lib/reports'
import { CATEGORY_LABELS } from '@/lib/types'
import SingleMarkerMap from '@/components/SingleMarkerMapLoader'
import CategoryPill from '@/components/ui/CategoryPill'
import StatusPill from '@/components/ui/StatusPill'
import { relativeTime } from '@/lib/motion'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReportPage({ params }: PageProps) {
  const { id } = await params
  const report = await fetchReport(id)

  if (!report) notFound()

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-8">
      <Link href="/" className="font-mono text-sm text-slate hover:text-ink">
        &larr; Back to map
      </Link>

      <div className="space-y-3 rounded-card bg-ink/3 p-4">
        {report.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={report.photo_url}
            alt={CATEGORY_LABELS[report.category]}
            className="h-64 w-full rounded-[calc(var(--radius-card)-8px)] object-cover"
          />
        )}
        <h1 className="font-display text-xl font-bold text-ink">
          {CATEGORY_LABELS[report.category]}
        </h1>
        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryPill category={report.category} />
          <StatusPill status={report.status} />
        </div>
        {report.description && <p className="text-ink/80">{report.description}</p>}
        <p className="font-mono text-xs text-ink/45">Reported {relativeTime(report.created_at)}</p>
        <p className="text-sm font-medium text-ink">
          👍 {report.upvotes} people confirmed this is still an issue
        </p>
      </div>

      <div className="h-72 overflow-hidden rounded-card">
        <SingleMarkerMap report={report} />
      </div>
    </div>
  )
}
