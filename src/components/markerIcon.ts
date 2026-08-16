import L from 'leaflet'
import { CATEGORY_COLORS, type Category, type Status } from '@/lib/types'

export function categoryStatusIcon(category: Category, status: Status): L.DivIcon {
  const color = CATEGORY_COLORS[category]
  const opacity = status === 'resolved' ? 0.45 : 1
  const dash = status === 'in_progress' ? 'stroke-dasharray="3,2"' : ''

  const svg = `
    <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 11.25 15 27 15 27s15-15.75 15-27C30 6.7 23.3 0 15 0z"
        fill="${color}" fill-opacity="${opacity}" stroke="white" stroke-width="2" ${dash} />
      <circle cx="15" cy="15" r="6" fill="white" fill-opacity="${opacity}" />
    </svg>
  `.trim()

  return L.divIcon({
    html: svg,
    className: 'communityfix-marker',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -36],
  })
}

export function pendingPinIcon(): L.DivIcon {
  const svg = `
    <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 11.25 15 27 15 27s15-15.75 15-27C30 6.7 23.3 0 15 0z"
        fill="#111827" stroke="white" stroke-width="2" />
      <circle cx="15" cy="15" r="6" fill="white" />
    </svg>
  `.trim()

  return L.divIcon({
    html: svg,
    className: 'communityfix-marker',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -36],
  })
}
