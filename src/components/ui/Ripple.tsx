'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/lib/motion'

interface RippleProps {
  /** Increment this number to fire a new ripple burst. */
  trigger: number
  color?: string
}

const RING_COUNT = 3
const RING_STAGGER = 0.08
const RING_DURATION = 0.9
const EASE = [0.22, 1, 0.36, 1] as const

export default function Ripple({ trigger, color = 'var(--color-amber)' }: RippleProps) {
  const [bursts, setBursts] = useState<number[]>([])
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (trigger === 0) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fires a new burst on each external trigger increment
    setBursts((b) => [...b, trigger])
  }, [trigger])

  function remove(id: number) {
    setBursts((b) => b.filter((x) => x !== id))
  }

  return (
    <span className="pointer-events-none absolute inset-0 overflow-visible rounded-[inherit]">
      <AnimatePresence>
        {bursts.flatMap((id) =>
          reducedMotion
            ? [
                <motion.span
                  key={id}
                  className="absolute inset-0 rounded-[inherit]"
                  style={{ backgroundColor: color }}
                  initial={{ opacity: 0.35 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  onAnimationComplete={() => remove(id)}
                />,
              ]
            : Array.from({ length: RING_COUNT }, (_, ring) => (
                <motion.span
                  key={`${id}-${ring}`}
                  className="absolute left-1/2 top-1/2 rounded-full border-2"
                  style={{ borderColor: color }}
                  initial={{ width: 0, height: 0, opacity: 0.6, x: '-50%', y: '-50%' }}
                  animate={{ width: 90, height: 90, opacity: 0, x: '-50%', y: '-50%' }}
                  transition={{ duration: RING_DURATION, delay: ring * RING_STAGGER, ease: EASE }}
                  onAnimationComplete={() => ring === RING_COUNT - 1 && remove(id)}
                />
              ))
        )}
      </AnimatePresence>
    </span>
  )
}
