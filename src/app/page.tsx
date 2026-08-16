'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState } from 'react'
import Filters, { type FilterState } from '@/components/Filters'
import ReportForm from '@/components/ReportForm'
import Button from '@/components/ui/Button'
import Logo from '@/components/ui/Logo'
import RippleLoop from '@/components/ui/RippleLoop'
import StatsCard from '@/components/ui/StatsCard'
import HowItWorksModal from '@/components/HowItWorks/HowItWorksModal'
import { CATEGORIES, STATUSES, type Report } from '@/lib/types'

const Map = dynamic(() => import('@/components/Map'), { ssr: false })

const ALL_FILTERS: FilterState = { categories: [...CATEGORIES], statuses: [...STATUSES] }

const STORY_PANELS = [
  {
    title: 'Report',
    copy: 'Drop a pin, add a photo. No account, no login — takes under a minute.',
  },
  {
    title: 'Confirm',
    copy: 'Neighbors upvote issues they see too, so nothing gets lost in the noise.',
  },
  {
    title: 'Resolve',
    copy: 'Admins update status as work happens. The map reflects it instantly.',
  },
]

export default function Home() {
  const [filters, setFilters] = useState<FilterState>(ALL_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [allReports, setAllReports] = useState<Report[]>([])

  function handleStartReporting() {
    setFiltersOpen(false)
    setReporting(true)
    setPin(null)
  }

  function handleBrowse() {
    setFiltersOpen(false)
    setReporting(false)
    setPin(null)
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

  const resolvedCount = allReports.filter((r) => r.status === 'resolved').length

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative h-[85vh] min-h-[520px] w-full sm:h-screen">
        <div className="absolute inset-0">
          <Map
            filters={filters}
            onMapClick={handleMapClick}
            pendingPin={pin}
            reloadToken={reloadToken}
            onReportsLoaded={setAllReports}
          />
        </div>

        <nav className="absolute inset-x-0 top-0 z-1200 flex flex-wrap items-center justify-between gap-3 bg-linear-to-b from-paper/90 to-transparent px-4 py-3 sm:px-6 sm:py-4">
          <Logo />
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => setFiltersOpen((v) => !v)}>
              Filters
            </Button>
            <Button variant="secondary" onClick={handleBrowse}>
              Browse
            </Button>
            <Button variant="primary" onClick={handleStartReporting}>
              Report an Issue
            </Button>
          </div>
        </nav>

        {filtersOpen && (
          <div className="absolute right-4 top-20 z-1200 w-[min(20rem,calc(100vw-2rem))] rounded-card bg-paper/95 p-1 shadow-(--shadow-soft-lg) backdrop-blur-md sm:right-6">
            <Filters value={filters} onChange={setFilters} />
          </div>
        )}

        {reporting && (
          <div className="absolute inset-x-4 bottom-4 z-1300 max-h-[70vh] overflow-y-auto rounded-card bg-paper/95 p-4 shadow-(--shadow-soft-lg) backdrop-blur-md sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-20 sm:w-96">
            {!pin && (
              <p className="mb-3 rounded-full bg-amber/20 px-3 py-2 text-sm text-ink">
                Click the map to drop a pin at the issue location.
              </p>
            )}
            <ReportForm pin={pin} onCancel={handleCancel} onSubmitted={handleSubmitted} />
          </div>
        )}

        <StatsCard
          total={allReports.length}
          resolved={resolvedCount}
          className="absolute bottom-6 left-4 z-1200 hidden sm:block sm:left-6"
        />

        <div className="absolute bottom-6 right-4 z-1200 hidden sm:right-6 sm:block">
          <HowItWorksModal
            trigger={<Button variant="secondary">▶ See how it works</Button>}
          />
        </div>
      </section>

      <StatsCard total={allReports.length} resolved={resolvedCount} className="mx-4 -mt-1 block sm:hidden" />

      <div className="flex justify-center px-4 py-4 sm:hidden">
        <HowItWorksModal trigger={<Button variant="secondary">▶ See how it works</Button>} />
      </div>

      <section className="mx-auto w-full max-w-4xl px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          One report creates spreading impact.
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-ink/70">
          See a pothole, broken streetlight, illegal dump, or blocked drain? Drop a pin and let
          your community — and local authorities — see it.
        </p>

        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          {STORY_PANELS.map((panel) => (
            <div key={panel.title} className="flex flex-col items-center gap-3">
              <RippleLoop />
              <h3 className="font-display text-base font-bold text-ink">{panel.title}</h3>
              <p className="text-sm text-ink/65">{panel.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink/10 px-6 py-4 text-center font-mono text-xs text-ink/50">
        <p>Built by GeoTechieX</p>
        <Link href="/admin/login" className="text-ink/35 underline hover:text-ink/60">
          Admin
        </Link>
      </footer>
    </div>
  )
}
