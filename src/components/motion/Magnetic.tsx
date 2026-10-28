'use client'

import { useRef, type ReactNode } from 'react'
import { cn } from '@/utilities/ui'
import { useMagnetic } from './useMagnetic'

/** Wraps a call-to-action so it leans toward the pointer (desktop only). */
export function Magnetic({ children, className, strength }: {
  children: ReactNode
  className?: string
  strength?: { x: number; y: number }
}) {
  const ref = useRef<HTMLSpanElement>(null)
  useMagnetic(ref, strength)
  return (
    <span ref={ref} className={cn('magnetic inline-block', className)}>
      {children}
    </span>
  )
}
