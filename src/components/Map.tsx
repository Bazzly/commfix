'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import Link from 'next/link'
import { fetchReports, upvoteReport } from '@/lib/reports'
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  type Category,
  type Report,
  type Status,
} from '@/lib/types'
import { categoryStatusIcon, pendingPinIcon } from './markerIcon'

export const DEFAULT_CENTER: [number, number] = [7.1475, 3.3619] // Abeokuta

interface MapProps {
  center?: [number, number]
  zoom?: number
  filters?: { categories: Category[]; statuses: Status[] }
  onMapClick?: (lat: number, lng: number) => void
  pendingPin?: { lat: number; lng: number } | null
  reloadToken?: number
  onReportsLoaded?: (reports: Report[]) => void
}

function ClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function Map({
  center = DEFAULT_CENTER,
  zoom = 13,
  filters,
  onMapClick,
  pendingPin,
  reloadToken,
  onReportsLoaded,
}: MapProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchReports()
      setReports(data)
      onReportsLoaded?.(data)
    } finally {
      setLoading(false)
    }
  }, [onReportsLoaded])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial + on-demand data fetch
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadToken])

  const visibleReports = useMemo(() => {
    if (!filters) return reports
    return reports.filter(
      (r) => filters.categories.includes(r.category) && filters.statuses.includes(r.status)
    )
  }, [reports, filters])

  async function handleUpvote(id: string) {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r)))
    try {
      await upvoteReport(id)
    } catch {
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes - 1 } : r)))
    }
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer center={center} zoom={zoom} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onMapClick={onMapClick} />

        {visibleReports.map((report) => (
          <Marker
            key={report.id}
            position={[report.location.lat, report.location.lng]}
            icon={categoryStatusIcon(report.category, report.status)}
          >
            <Popup>
              <div className="w-48 space-y-1">
                {report.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={report.photo_url}
                    alt={CATEGORY_LABELS[report.category]}
                    className="mb-1 h-24 w-full rounded object-cover"
                  />
                )}
                <p className="text-sm font-semibold">{CATEGORY_LABELS[report.category]}</p>
                {report.description && (
                  <p className="text-xs text-gray-600">{report.description}</p>
                )}
                <p className="text-xs">
                  Status: <span className="font-medium">{STATUS_LABELS[report.status]}</span>
                </p>
                <p className="text-[11px] text-gray-400">
                  Reported {new Date(report.created_at).toLocaleDateString()}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleUpvote(report.id)}
                    className="rounded bg-gray-100 px-2 py-1 text-xs font-medium hover:bg-gray-200"
                  >
                    👍 {report.upvotes} confirmed
                  </button>
                  <Link href={`/report/${report.id}`} className="text-xs text-blue-600 underline">
                    Share
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {pendingPin && (
          <Marker position={[pendingPin.lat, pendingPin.lng]} icon={pendingPinIcon()} />
        )}
      </MapContainer>

      {loading && (
        <div className="pointer-events-none absolute left-2 top-2 z-[1000] rounded bg-white/90 px-2 py-1 text-xs shadow">
          Loading reports…
        </div>
      )}
    </div>
  )
}
