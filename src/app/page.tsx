'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState } from 'react'
import Filters, { type FilterState } from '@/components/Filters'
import ReportForm from '@/components/ReportForm'
import { CATEGORIES, STATUSES } from '@/lib/types'

const Map = dynamic(() => import('@/components/Map'), { ssr: false })

const ALL_FILTERS: FilterState = { categories: [...CATEGORIES], statuses: [...STATUSES] }

export default function Home() {
  const [filters, setFilters] = useState<FilterState>(ALL_FILTERS)
  const [reporting, setReporting] = useState(false)
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  function handleStartReporting() {
    setReporting(true)
    setPin(null)
    document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleMapClick(lat: number, lng: number) {
    if (reporting) setPin({ lat, lng })
  }

  function handleCancel() {
    setReporting(false)
    setPin(null)
  }

  function handleSubmitted() {
    // Keep the form mounted so its "Thanks!" confirmation is visible;
    // the confirmation screen's Done button calls onCancel to exit reporting mode.
    setReloadToken((t) => t + 1)
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-gray-200 bg-white px-6 py-10 text-center">
        <h1 className="text-3xl font-bold">CommunityFix</h1>
        <p className="mx-auto mt-2 max-w-xl text-gray-600">
          See a pothole, broken streetlight, illegal dump, or blocked drain? Drop a pin, add a
          photo, and let your community — and local authorities — see it. No login required.
        </p>
        <button
          onClick={handleStartReporting}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          Report an Issue
        </button>
      </header>

      <main id="map-section" className="mx-auto w-full max-w-5xl flex-1 space-y-4 px-4 py-6">
        <Filters value={filters} onChange={setFilters} />

        {reporting && !pin && (
          <p className="rounded bg-blue-50 px-3 py-2 text-sm text-blue-800">
            Click the map below to drop a pin at the issue location.
          </p>
        )}

        <div className="h-[500px] overflow-hidden rounded-lg border border-gray-200">
          <Map
            filters={filters}
            onMapClick={handleMapClick}
            pendingPin={pin}
            reloadToken={reloadToken}
          />
        </div>

        {reporting && (
          <ReportForm pin={pin} onCancel={handleCancel} onSubmitted={handleSubmitted} />
        )}
      </main>

      <footer className="border-t border-gray-200 px-6 py-4 text-center text-xs text-gray-500">
        <p>Built by GeoTechieX</p>
        <Link href="/admin/login" className="text-gray-400 underline hover:text-gray-600">
          Admin
        </Link>
      </footer>
    </div>
  )
}
