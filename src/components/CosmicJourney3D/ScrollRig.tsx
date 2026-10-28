// src/components/CosmicJourney3D/ScrollRig.tsx
'use client'

import React, { createContext, useContext, useRef } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'
import { readCapture } from './capture'

export const ScrollProgressContext = createContext<React.MutableRefObject<number>>({ current: 0 })

export function useScrollProgressRef() {
  return useContext(ScrollProgressContext)
}

export function ScrollRig({ totalScrollVh, children }: { totalScrollVh: number; children: React.ReactNode }) {
  const targetRef = useRef<HTMLDivElement>(null)
  const capture = readCapture()
  // Capture mode pins progress so a frame is reproducible regardless of scroll.
  const progressRef = useRef(capture.enabled ? capture.progress : 0)
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start start', 'end end'] })

  // Write to a ref only — no React state, so R3F reads it per-frame with zero re-renders.
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (capture.enabled) return
    progressRef.current = v
  })

  return (
    <ScrollProgressContext.Provider value={progressRef}>
      {/* tall scroll driver; the fixed canvas + overlay live in children */}
      <div ref={targetRef} style={{ position: 'relative', height: `${totalScrollVh}vh` }}>
        {children}
      </div>
    </ScrollProgressContext.Provider>
  )
}
