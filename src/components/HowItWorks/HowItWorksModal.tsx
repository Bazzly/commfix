'use client'

import { Suspense, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import * as Dialog from '@radix-ui/react-dialog'
import Scene2D from './Scene2D'
import { use3DCapable } from './use3DCapable'
import { usePrefersReducedMotion } from '@/lib/motion'
import { BEATS, INITIAL_FIX_STATE, type FixKey, type FixState } from './beats'

const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false })

function ScenePoster() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-card bg-ink/5">
      <p className="font-mono text-xs text-ink/40">Loading scene…</p>
    </div>
  )
}

export default function HowItWorksModal({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [fixed, setFixed] = useState<FixState>(INITIAL_FIX_STATE)
  const [selected, setSelected] = useState<FixKey>('pothole')
  const use3D = use3DCapable()
  const reducedMotion = usePrefersReducedMotion()

  function handleSelect(key: FixKey) {
    setSelected(key)
    setFixed((f) => ({ ...f, [key]: true }))
  }

  const beat = BEATS.find((b) => b.key === selected)!

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-2000 bg-paper/70 backdrop-blur-sm data-[state=open]:animate-[fadeIn_200ms_ease-out]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-2001 w-[min(640px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-card bg-paper p-5 shadow-(--shadow-soft-lg) focus:outline-none">
          <div className="mb-3 flex items-center justify-between">
            <Dialog.Title className="font-display text-lg font-bold text-ink">
              See how it works
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-1.5 text-ink/60 hover:bg-ink/5 hover:text-ink">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <Dialog.Description className="mb-3 font-mono text-xs text-ink/50">
            Tap a hotspot — pothole, streetlight, or waste pile — to see it get fixed.
          </Dialog.Description>

          <div className="h-72 w-full overflow-hidden rounded-card bg-ink/3">
            {open &&
              (use3D ? (
                <Suspense fallback={<ScenePoster />}>
                  <Scene3D fixed={fixed} onSelect={handleSelect} reducedMotion={reducedMotion} />
                </Suspense>
              ) : (
                <div className="flex h-full items-center p-4">
                  <Scene2D fixed={fixed} onSelect={handleSelect} />
                </div>
              ))}
          </div>

          <p className="mt-3 min-h-5 text-sm text-ink/70">
            {fixed[selected] ? beat.fixedCaption : beat.reportedCaption}
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
