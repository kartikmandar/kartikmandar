// src/components/CosmicJourney3D/ScrollRig.tsx
'use client'

import React, { createContext, useContext, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { readCapture } from './capture'
import { progressForScroll, setLenis, setScrollTrack, steadyViewportHeight } from './scrollEngine'

export const ScrollProgressContext = createContext<React.MutableRefObject<number>>({ current: 0 })

export function useScrollProgressRef() {
  return useContext(ScrollProgressContext)
}

/**
 * Tall native-scroll driver for the journey, smoothed by Lenis. Progress is
 * written to a ref only (no React state), so R3F reads it per frame with zero
 * re-renders. Lenis runs with autoRaf off: JourneyDriver steps it inside the
 * R3F loop, so scroll and the scene advance on the same frame. Native scroll is
 * kept, so keyboard, anchors, find-in-page and assistive tech still work.
 */
export function ScrollRig({ totalScrollVh, children }: { totalScrollVh: number; children: React.ReactNode }) {
  const targetRef = useRef<HTMLDivElement>(null)
  const capture = readCapture()
  // Capture mode pins progress so a frame is reproducible regardless of scroll.
  const progressRef = useRef(capture.enabled ? capture.progress : 0)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const measure = () => {
      const rect = target.getBoundingClientRect()
      setScrollTrack({ top: rect.top + window.scrollY, height: rect.height })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(target)
    window.addEventListener('resize', measure)

    const update = (scrollY: number) => {
      if (!capture.enabled) progressRef.current = progressForScroll(scrollY, steadyViewportHeight(window.innerWidth, window.innerHeight))
    }

    // Lenis owns smoothing here; the site's CSS smooth-scroll would fight it.
    const root = document.documentElement
    const previousBehavior = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'

    let lenis: Lenis | null = null
    if (!capture.enabled) {
      lenis = new Lenis({ autoRaf: false, smoothWheel: true, syncTouch: false, lerp: 0.09 })
      lenis.on('scroll', (l: Lenis) => update(l.scroll))
      setLenis(lenis)
    }
    update(window.scrollY)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      root.style.scrollBehavior = previousBehavior
      setLenis(null)
      lenis?.destroy()
    }
  }, [capture.enabled])

  return (
    <ScrollProgressContext.Provider value={progressRef}>
      {/* tall scroll driver; the fixed canvas + overlay live in children */}
      <div ref={targetRef} style={{ position: 'relative', height: `${totalScrollVh}vh` }}>
        {children}
      </div>
    </ScrollProgressContext.Provider>
  )
}
