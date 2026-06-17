// src/components/CosmicJourney3D/ChapterRail.tsx
'use client'

import { useEffect, useState } from 'react'
import { useScrollProgressRef } from './ScrollRig'
import { cumulativeRanges, chapterOffset, locate } from './scrollMath'
import { SCROLL_LENGTHS, BEATS, TOTAL_SCROLL_VH } from './registry'
import { splitProgress } from './prologueScroll'

export function ChapterRail() {
  const progressRef = useScrollProgressRef()
  const [active, setActive] = useState(0)

  useEffect(() => {
    const ranges = cumulativeRanges(SCROLL_LENGTHS)
    let raf = 0
    const tick = () => {
      const { index } = locate(splitProgress(progressRef.current).flightProgress, ranges)
      setActive((p) => (p === index ? p : index))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progressRef])

  const jumpTo = (fraction: number) => {
    const total = (TOTAL_SCROLL_VH / 100) * window.innerHeight
    window.scrollTo({ top: fraction * total, behavior: 'smooth' })
  }

  const ranges = cumulativeRanges(SCROLL_LENGTHS)

  return (
    <nav aria-label="Chapters" style={{ position: 'fixed', top: '50%', right: 14, transform: 'translateY(-50%)', zIndex: 5, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {BEATS.map((b, i) => (
        <button
          key={b.id}
          onClick={() => jumpTo(chapterOffset(i, ranges))}
          aria-current={active === i}
          title={b.eyebrow ?? b.headline}
          style={{
            all: 'unset', cursor: 'pointer', width: 10, height: 10, borderRadius: 999,
            background: active === i ? '#a5b4fc' : 'rgba(255,255,255,0.3)',
            outlineOffset: 2,
          }}
        />
      ))}
      <button onClick={() => jumpTo(1)} style={{ all: 'unset', cursor: 'pointer', marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
        Skip ↓
      </button>
    </nav>
  )
}
