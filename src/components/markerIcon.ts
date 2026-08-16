import L from 'leaflet'
import { CATEGORY_COLORS, type Report } from '@/lib/types'
import { daysSince } from '@/lib/motion'

const HIGH_UPVOTE_THRESHOLD = 10
const URGENT_DAYS = 30

type MarkerReport = Pick<Report, 'category' | 'status' | 'upvotes' | 'created_at'>

export function categoryStatusIcon(report: MarkerReport): L.DivIcon {
  const { category, status, upvotes, created_at } = report
  const color = CATEGORY_COLORS[category]
  const isResolved = status === 'resolved'
  const opacity = isResolved ? 0.45 : 1
  const dash = status === 'in_progress' ? 'stroke-dasharray="3,2"' : ''
  const isUrgent = !isResolved && daysSince(created_at) >= URGENT_DAYS
  const isPopular = upvotes >= HIGH_UPVOTE_THRESHOLD

  const rings = [
    isUrgent
      ? `<circle class="communityfix-pulse-urgent" cx="15" cy="15" r="13" fill="none" stroke="var(--color-rust)" stroke-width="2" />`
      : '',
    isPopular
      ? `<circle class="communityfix-pulse-popular" cx="15" cy="15" r="16" fill="none" stroke="var(--color-ink)" stroke-width="1.5" />`
      : '',
  ].join('')

  const checkmark = isResolved
    ? `<path d="M11.5 15.2l2.2 2.2 4.8-4.8" stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" />`
    : ''

  const svg = `
    <svg width="42" height="54" viewBox="0 0 42 54" xmlns="http://www.w3.org/2000/svg" style="overflow: visible">
      <g transform="translate(6,6)">
        ${rings}
        <path d="M15 0C6.7 0 0 6.7 0 15c0 11.25 15 27 15 27s15-15.75 15-27C30 6.7 23.3 0 15 0z"
          fill="${color}" fill-opacity="${opacity}" stroke="var(--color-paper)" stroke-width="2" ${dash} />
        <circle cx="15" cy="15" r="6" fill="var(--color-paper)" fill-opacity="${opacity}" />
        ${checkmark}
      </g>
    </svg>
  `.trim()

  return L.divIcon({
    html: svg,
    className: 'communityfix-marker',
    iconSize: [42, 54],
    iconAnchor: [21, 48],
    popupAnchor: [0, -30],
  })
}

export function locateIcon(): L.DivIcon {
  const svg = `
    <svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg" style="overflow: visible">
      <circle class="communityfix-pulse-locate" cx="13" cy="13" r="10" fill="none" stroke="var(--color-slate)" stroke-width="2" />
      <circle cx="13" cy="13" r="6.5" fill="var(--color-slate)" stroke="var(--color-paper)" stroke-width="2.5" />
    </svg>
  `.trim()

  return L.divIcon({
    html: svg,
    className: 'communityfix-marker',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  })
}

export function measurePointIcon(): L.DivIcon {
  const svg = `
    <svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6" cy="6" r="5" fill="var(--color-ink)" stroke="var(--color-paper)" stroke-width="2" />
    </svg>
  `.trim()

  return L.divIcon({
    html: svg,
    className: 'communityfix-marker',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}

export function pendingPinIcon(): L.DivIcon {
  const svg = `
    <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 11.25 15 27 15 27s15-15.75 15-27C30 6.7 23.3 0 15 0z"
        fill="var(--color-ink)" stroke="var(--color-paper)" stroke-width="2" />
      <circle cx="15" cy="15" r="6" fill="var(--color-paper)" />
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
