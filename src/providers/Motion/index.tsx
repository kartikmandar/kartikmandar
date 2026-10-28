'use client'

import { MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'
import { EASE_OUT_EXPO, DURATION } from '@/lib/motion'

/** Site-wide Framer Motion defaults: the house easing, and the OS reduced-motion setting honoured. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: DURATION.base, ease: EASE_OUT_EXPO }}>
      {children}
    </MotionConfig>
  )
}
