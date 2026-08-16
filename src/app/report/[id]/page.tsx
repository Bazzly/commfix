import Link from 'next/link'
import { notFound } from 'next/navigation'
import { fetchReport } from '@/lib/reports'
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/types'
import SingleMarkerMap from '@/components/SingleMarkerMapLoader'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReportPage({ params }: PageProps) {
  const { id } = await params
  const report = await fetchReport(id)

  if (!report) notFound()

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-8">
      <Link href="/" className="text-sm text-blue-600 underline">
        &larr; Back to map
      </Link>

      <div className="space-y-3 rounded-lg border border-gray-200 p-4">
        {report.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={report.photo_url}
            alt={CATEGORY_LABELS[report.category]}
            className="h-64 w-full rounded object-cover"
          />
        )}
        <h1 className="text-xl font-bold">{CATEGORY_LABELS[report.category]}</h1>
        {report.description && <p className="text-gray-700">{report.description}</p>}
        <p className="text-sm">
          Status: <span className="font-medium">{STATUS_LABELS[report.status]}</span>
        </p>
        <p className="text-sm text-gray-500">
          Reported {new Date(report.created_at).toLocaleDateString()}
        </p>
        <p className="text-sm font-medium">👍 {report.upvotes} people confirmed this is still an issue</p>
      </div>

      <div className="h-72 overflow-hidden rounded-lg border border-gray-200">
        <SingleMarkerMap report={report} />
      </div>
    </div>
  )
}
