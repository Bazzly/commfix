'use client'

import { useState } from 'react'
import Ripple from '../ui/Ripple'
import type { FixKey, FixState } from './beats'

interface Scene2DProps {
  fixed: FixState
  onSelect: (key: FixKey) => void
}

const ITEMS: { key: FixKey; label: string; icon: React.ReactNode }[] = [
  {
    key: 'pothole',
    label: 'Pothole',
    icon: (
      <circle cx="12" cy="12" r="7" fill="currentColor" />
    ),
  },
  {
    key: 'streetlight',
    label: 'Streetlight',
    icon: (
      <>
        <rect x="10.5" y="10" width="3" height="10" fill="currentColor" />
        <circle cx="12" cy="7" r="5" fill="currentColor" />
      </>
    ),
  },
  {
    key: 'waste',
    label: 'Waste',
    icon: (
      <>
        <rect x="7" y="9" width="10" height="9" rx="1.5" fill="currentColor" />
        <rect x="9" y="5" width="6" height="2.5" rx="1" fill="currentColor" />
      </>
    ),
  },
]

export default function Scene2D({ fixed, onSelect }: Scene2DProps) {
  const [ripple, setRipple] = useState<Record<FixKey, number>>({
    pothole: 0,
    streetlight: 0,
    waste: 0,
  })

  function handleClick(key: FixKey) {
    setRipple((r) => ({ ...r, [key]: r[key] + 1 }))
    onSelect(key)
  }

  return (
    <div className="grid grid-cols-3 gap-4 rounded-card bg-ink/5 p-6">
      {ITEMS.map((item) => {
        const isFixed = fixed[item.key]
        return (
          <button
            key={item.key}
            onClick={() => handleClick(item.key)}
            className="flex flex-col items-center gap-2 rounded-card p-2 transition-transform hover:scale-[1.03]"
          >
            <span
              className="relative flex h-16 w-16 items-center justify-center overflow-visible rounded-full text-paper transition-colors duration-500"
              style={{ backgroundColor: isFixed ? 'var(--color-moss)' : 'var(--color-ink)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                {item.icon}
              </svg>
              {isFixed && (
                <svg
                  className="absolute -bottom-1 -right-1 rounded-full bg-paper p-0.5"
                  width="18"
                  height="18"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8.5l3 3 7-7"
                    stroke="var(--color-moss)"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <Ripple trigger={ripple[item.key]} color={isFixed ? 'var(--color-moss)' : 'var(--color-amber)'} />
            </span>
            <span className="font-display text-xs font-semibold text-ink">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
