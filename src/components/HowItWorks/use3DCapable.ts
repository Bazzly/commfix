'use client'

import { useEffect, useState } from 'react'

const MIN_WIDTH = 768

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/** Real 3D scene on larger screens with WebGL support; lightweight 2D/SVG elsewhere. */
export function use3DCapable(): boolean {
  const [capable, setCapable] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser APIs unavailable during render
    setCapable(window.innerWidth >= MIN_WIDTH && detectWebGL())
  }, [])

  return capable
}
