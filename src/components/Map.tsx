'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import type L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMapEvents } from 'react-leaflet'
import { fetchReports, upvoteReport } from '@/lib/reports'
import { type Category, type Report, type Status } from '@/lib/types'
import { categoryStatusIcon, locateIcon, measurePointIcon, pendingPinIcon } from './markerIcon'
import ReportCard from './ReportCard'
import { formatDistance, totalPathDistance } from '@/lib/geo'

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

function ClickHandler({
  onMapClick,
  measuring,
  onMeasureClick,
}: {
  onMapClick?: (lat: number, lng: number) => void
  measuring: boolean
  onMeasureClick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      if (measuring) {
        onMeasureClick(e.latlng.lat, e.latlng.lng)
      } else {
        onMapClick?.(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

function CrosshairIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <path d="M12 1v4M12 19v4M1 12h4M19 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function RulerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="2.5"
        y="8.5"
        width="19"
        height="7"
        rx="1.2"
        transform="rotate(-35 12 12)"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8.2 10.6l1.3 1.3M11.3 7.5l1.3 1.3M14.4 4.4l1.3 1.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MapButton({
  onClick,
  active = false,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`flex h-9 w-9 items-center justify-center rounded-full shadow-(--shadow-soft) transition-colors ${
        active ? 'bg-ink text-paper' : 'bg-paper/95 text-ink hover:bg-paper'
      }`}
    >
      {children}
    </button>
  )
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
  const mapRef = useRef<L.Map | null>(null)

  const [locating, setLocating] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locateError, setLocateError] = useState<string | null>(null)

  const [measuring, setMeasuring] = useState(false)
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([])

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

  useEffect(() => {
    if (!locateError) return
    const timer = setTimeout(() => setLocateError(null), 4000)
    return () => clearTimeout(timer)
  }, [locateError])

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

  function handleGeolocate() {
    if (!navigator.geolocation) {
      setLocateError('Geolocation is not supported in this browser.')
      return
    }
    setLocating(true)
    setLocateError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        mapRef.current?.flyTo([latitude, longitude], 16, { duration: 1.2 })
        setLocating(false)
      },
      (err) => {
        setLocateError(
          err.code === err.PERMISSION_DENIED
            ? 'Location access was denied.'
            : 'Could not determine your location.'
        )
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function toggleMeasuring() {
    setMeasuring((m) => !m)
    setMeasurePoints([])
  }

  function handleMeasureClick(lat: number, lng: number) {
    setMeasurePoints((pts) => [...pts, [lat, lng]])
  }

  const measureDistance = totalPathDistance(measurePoints)

  return (
    <div className="relative h-full w-full">
      <MapContainer ref={mapRef} center={center} zoom={zoom} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onMapClick={onMapClick} measuring={measuring} onMeasureClick={handleMeasureClick} />

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

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={locateIcon()} />
        )}

        {measurePoints.length > 1 && (
          <Polyline
            positions={measurePoints}
            pathOptions={{ color: 'var(--color-ink)', weight: 3, dashArray: '6,6' }}
          >
            <Tooltip permanent direction="center" className="border-none! bg-transparent! shadow-none!">
              <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-[11px] text-paper">
                {formatDistance(measureDistance)}
              </span>
            </Tooltip>
          </Polyline>
        )}
        {measurePoints.map((pt, i) => (
          <Marker key={i} position={pt} icon={measurePointIcon()} />
        ))}
      </MapContainer>

      <div className="absolute left-2 top-20 z-1000 flex flex-col gap-2">
        <MapButton onClick={handleGeolocate} title="Find my location">
          {locating ? (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
          ) : (
            <CrosshairIcon />
          )}
        </MapButton>
        <MapButton onClick={toggleMeasuring} active={measuring} title="Measure distance">
          <RulerIcon />
        </MapButton>
      </div>

      {measuring && (
        <div className="absolute left-2 top-40 z-1000 flex items-center gap-2 rounded-full bg-paper/95 py-1 pl-3 pr-1 font-mono text-xs text-ink shadow-(--shadow-soft)">
          <span>{measurePoints.length < 2 ? 'Click the map to measure' : formatDistance(measureDistance)}</span>
          {measurePoints.length > 0 && (
            <button
              onClick={() => setMeasurePoints([])}
              className="rounded-full bg-ink/10 px-2 py-0.5 hover:bg-ink/20"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {locateError && (
        <div className="absolute left-2 top-40 z-1000 max-w-55 rounded-card bg-rust/10 px-3 py-2 font-mono text-xs text-rust shadow-(--shadow-soft)">
          {locateError}
        </div>
      )}

      {loading && (
        <div className="pointer-events-none absolute left-2 top-2 z-1000 rounded-full bg-paper/90 px-3 py-1 font-mono text-xs text-ink shadow-(--shadow-soft)">
          Loading reports…
        </div>
      )}
    </div>
  )
}
