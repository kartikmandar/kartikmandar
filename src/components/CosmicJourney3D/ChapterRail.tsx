// src/components/CosmicJourney3D/ChapterRail.tsx
'use client'

// A hairline chapter rail: the fill tracks the flight (written straight to the
// DOM each frame, no React state), ticks mark the 31 beats, and hover/focus
// labels name them. Clicking a tick flies there (longer jumps take longer and
// widen the lens); every control is a real, keyboard-focusable button.

import { useEffect, useRef, useState } from 'react'
import { addEffect } from '@react-three/fiber'
import { BEATS, SCROLL_LENGTHS } from './registry'
import { cumulativeRanges } from './scrollMath'
import { journeyFrame, useActiveBeat } from './store'
import { scrollToProgress } from './scrollEngine'
import { beatTargetProgress } from './navigation'
import { focusBeatHeading } from './JourneyNav'

const RAIL_HEIGHT = '62vh'
const ranges = cumulativeRanges(SCROLL_LENGTHS)

export function ChapterRail() {
  const active = useActiveBeat()
  const fillRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<number | null>(null)

  useEffect(() => {
    let shown = -1
    return addEffect(() => {
      const fill = fillRef.current
      if (!fill) return
      const v = Math.round(journeyFrame.flight * 1000) / 1000
      if (v === shown) return
      shown = v
      fill.style.transform = `scaleY(${v})`
    })
  }, [])

  const jump = (i: number) => scrollToProgress(beatTargetProgress(i, ranges), { onComplete: focusBeatHeading })

  return (
    <nav aria-label="Story chapters" className="journey-rail" style={rail}>
      <div aria-hidden style={track}>
        <div ref={fillRef} style={fillStyle} />
      </div>
      <ol style={list}>
        {BEATS.map((b, i) => {
          const top = `${ranges[i]!.start * 100}%`
          const isActive = active === i
          const showLabel = hovered === i
          return (
            <li key={b.id} style={{ position: 'absolute', top, right: 0, transform: 'translateY(-50%)' }}>
              <button
                type="button"
                onClick={() => jump(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered((h) => (h === i ? null : h))}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`${i + 1}. ${b.headline}`}
                className="journey-rail-tick"
                style={{ ...tick, width: isActive ? 16 : 9, background: isActive ? '#ff7a1a' : 'rgba(238,242,255,0.38)' }}
              />
              <span aria-hidden style={{ ...label, opacity: showLabel ? 1 : 0, transform: `translateY(-50%) translateX(${showLabel ? 0 : 6}px)` }}>
                <span style={{ opacity: 0.55 }}>{String(i + 1).padStart(2, '0')}</span> {b.headline}
              </span>
            </li>
          )
        })}
      </ol>
      <button type="button" onClick={() => jump(BEATS.length - 1)} className="journey-rail-tick" style={skip}>
        Skip story
      </button>
      <style>{`.journey-rail-tick:focus-visible{outline:2px solid #5ee7ff;outline-offset:3px}`}</style>
    </nav>
  )
}

const rail: React.CSSProperties = {
  position: 'fixed', top: '50%', right: 22, transform: 'translateY(-50%)', zIndex: 5,
  height: RAIL_HEIGHT, width: 28, display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
}
const track: React.CSSProperties = {
  position: 'absolute', right: 4, top: 0, bottom: 0, width: 1, background: 'rgba(238,242,255,0.16)',
}
const fillStyle: React.CSSProperties = {
  position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #9cc4ff, #ff7a1a)',
  transformOrigin: 'top', transform: 'scaleY(0)', willChange: 'transform',
}
const list: React.CSSProperties = { position: 'absolute', inset: 0, margin: 0, padding: 0, listStyle: 'none' }
const tick: React.CSSProperties = {
  all: 'unset', display: 'block', height: 2, borderRadius: 2, cursor: 'pointer',
  transition: 'width 260ms ease, background 260ms ease', padding: '6px 0', backgroundClip: 'content-box',
}
const label: React.CSSProperties = {
  position: 'absolute', right: 26, top: '50%', whiteSpace: 'nowrap', pointerEvents: 'none',
  fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace', fontSize: 11, letterSpacing: '0.08em',
  color: '#eef2ff', background: 'rgba(4,5,11,0.78)', padding: '5px 9px', borderRadius: 4,
  transition: 'opacity 180ms ease, transform 180ms ease',
}
const skip: React.CSSProperties = {
  all: 'unset', position: 'absolute', bottom: -34, right: 0, cursor: 'pointer', whiteSpace: 'nowrap',
  fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace', fontSize: 10, letterSpacing: '0.18em',
  textTransform: 'uppercase', color: 'rgba(238,242,255,0.62)',
}
