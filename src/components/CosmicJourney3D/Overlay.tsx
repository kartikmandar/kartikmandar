// src/components/CosmicJourney3D/Overlay.tsx
'use client'

import { useEffect, useState } from 'react'
import { useScrollProgressRef } from './ScrollRig'
import { cumulativeRanges, locate } from './scrollMath'
import { SCROLL_LENGTHS, BEATS } from './registry'
import { splitProgress } from './prologueScroll'
import { phaseStateFromProgress } from './prologuePhase'
import { HERO_PHASES } from './narrative'
import { Phase } from '@/components/QuasarBackground/engine/types'

// Map Phase -> hero copy line (COLLAPSE and FLASH reuse the prior STAR line)
const HERO_TEXT: Record<Phase, string> = {
  [Phase.STAR]: HERO_PHASES[0]!.text,
  [Phase.COLLAPSE]: HERO_PHASES[0]!.text,
  [Phase.FLASH]: HERO_PHASES[0]!.text,
  [Phase.SHELL]: HERO_PHASES[1]!.text,
  [Phase.BIRTH]: HERO_PHASES[2]!.text,
  [Phase.QUASAR]: HERO_PHASES[3]!.text,
}

export function Overlay() {
  const progressRef = useScrollProgressRef()
  const [index, setIndex] = useState(0)
  // Page loads at scroll 0 = prologue STAR, so seed the STAR line to avoid a
  // first-frame flash of beat copy before the rAF loop runs.
  const [heroText, setHeroText] = useState<string | null>(HERO_PHASES[0]!.text)

  useEffect(() => {
    const ranges = cumulativeRanges(SCROLL_LENGTHS)
    let raf = 0
    const tick = () => {
      const sp = splitProgress(progressRef.current)
      if (sp.inPrologue) {
        const ph = phaseStateFromProgress(sp.prologueProgress).phase
        const t = HERO_TEXT[ph]
        setHeroText((prev) => (prev === t ? prev : t))
      } else {
        setHeroText((prev) => (prev === null ? prev : null))
        const { index: i } = locate(sp.flightProgress, ranges)
        setIndex((prev) => (prev === i ? prev : i)) // re-render only on beat change
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progressRef])

  if (heroText !== null) {
    return (
      <div
        aria-live="polite"
        style={{
          position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          pointerEvents: 'none', padding: '0 6vw', color: '#fff', zIndex: 2,
        }}
      >
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, margin: '8px 0', textShadow: '0 2px 24px rgba(0,0,0,0.9)' }}>
          {heroText}
        </h2>
      </div>
    )
  }

  const beat = BEATS[index]
  if (!beat) return null

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        pointerEvents: 'none', padding: '0 6vw', color: '#fff', zIndex: 2,
      }}
    >
      {beat.eyebrow && (
        <div style={{ textTransform: 'uppercase', letterSpacing: 2, fontSize: 12, color: '#a5b4fc' }}>{beat.eyebrow}</div>
      )}
      <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, margin: '8px 0', textShadow: '0 2px 24px rgba(0,0,0,0.9)' }}>
        {beat.headline}
      </h2>
      {beat.body && (
        <p style={{ maxWidth: 620, fontSize: 'clamp(14px, 1.6vw, 18px)', lineHeight: 1.6, textShadow: '0 2px 16px rgba(0,0,0,0.95)' }}>
          {beat.body}
        </p>
      )}
    </div>
  )
}
