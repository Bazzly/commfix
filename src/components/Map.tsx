'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { fetchReports, upvoteReport } from '@/lib/reports'
import { type Category, type Report, type Status } from '@/lib/types'
import { categoryStatusIcon, pendingPinIcon } from './markerIcon'
import ReportCard from './ReportCard'

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
            icon={categoryStatusIcon(report)}
          >
            <Popup>
              <ReportCard report={report} onUpvote={handleUpvote} />
            </Popup>
          </Marker>
        ))}

        {pendingPin && (
          <Marker position={[pendingPin.lat, pendingPin.lng]} icon={pendingPinIcon()} />
        )}
      </MapContainer>

      {loading && (
        <div className="pointer-events-none absolute left-2 top-2 z-[1000] rounded-full bg-paper/90 px-3 py-1 font-mono text-xs text-ink shadow-(--shadow-soft)">
          Loading reports…
        </div>
      )}
    </div>
  )
}
