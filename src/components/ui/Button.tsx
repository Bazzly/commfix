'use client'

import { useState, type ButtonHTMLAttributes } from 'react'
import Ripple from './Ripple'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-amber text-ink hover:brightness-95 disabled:opacity-50',
  secondary: 'border border-ink/30 text-ink bg-transparent hover:bg-ink/5 disabled:opacity-50',
}

export default function Button({
  variant = 'primary',
  className = '',
  onClick,
  children,
  ...rest
}: ButtonProps) {
  const [rippleTrigger, setRippleTrigger] = useState(0)

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    setRippleTrigger((t) => t + 1)
    onClick?.(e)
  }

  const rippleColor = variant === 'primary' ? 'var(--color-ink)' : 'var(--color-amber)'

  return (
    <button
      {...rest}
      onClick={handleClick}
      className={`relative overflow-visible rounded-full px-5 py-2.5 font-display font-semibold transition-[filter] duration-200 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
      <Ripple trigger={rippleTrigger} color={rippleColor} />
    </button>
  )
}
