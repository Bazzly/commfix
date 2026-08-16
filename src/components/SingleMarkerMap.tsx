'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { CATEGORY_LABELS, type Report } from '@/lib/types'
import { categoryStatusIcon } from './markerIcon'

export default function SingleMarkerMap({ report }: { report: Report }) {
  return (
    <MapContainer
      center={[report.location.lat, report.location.lng]}
      zoom={16}
      className="h-full w-full"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={[report.location.lat, report.location.lng]}
        icon={categoryStatusIcon(report.category, report.status)}
      >
        <Popup>{CATEGORY_LABELS[report.category]}</Popup>
      </Marker>
    </MapContainer>
  )
}
