// src/components/CosmicJourney3D/Hud.tsx
'use client'

// The scientific HUD: a small mono readout per beat (era · place · a quantity),
// charted the way a sky is charted. It decodes in left to right once the shot
// settles (scrambled glyphs resolving), and fades out as the camera departs.
// Text is written straight to the DOM; React renders only when the beat changes.

import { useEffect, useRef } from 'react'
import { readCapture } from './capture'

const GLYPHS = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ·:/+-'
const DECODE_MS = 700

/** Deterministic scramble: the resolved prefix, then noise glyphs for the rest. */
export function decodeFrame(text: string, progress: number, tick: number): string {
  const resolved = Math.floor(text.length * Math.max(0, Math.min(1, progress)))
  let out = text.slice(0, resolved)
  for (let i = resolved; i < text.length; i++) {
    const ch = text[i]!
    out += ch === ' ' ? ' ' : GLYPHS[(i * 7 + tick * 13) % GLYPHS.length]
  }
  return out
}

export function Hud({ index, total, text, visible }: { index: number; total: number; text: string; visible: boolean }) {
  const lineRef = useRef<HTMLSpanElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const line = lineRef.current
    const wrap = wrapRef.current
    if (!line || !wrap) return
    wrap.style.opacity = visible ? '1' : '0'
    if (!visible) return
    if (readCapture().enabled) {
      line.textContent = text
      return
    }
    let raf = 0
    const start = performance.now()
    let tick = 0
    const step = (now: number) => {
      const p = (now - start) / DECODE_MS
      tick += 1
      line.textContent = p >= 1 ? text : decodeFrame(text, p, tick)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [text, visible])

  return (
    <div ref={wrapRef} aria-hidden style={wrapStyle}>
      <div style={{ opacity: 0.55, marginBottom: 6 }}>
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>
      <span ref={lineRef}>{text}</span>
    </div>
  )
}

const wrapStyle: React.CSSProperties = {
  position: 'fixed', top: 22, left: 24, zIndex: 3, pointerEvents: 'none',
  fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace', fontSize: 11, letterSpacing: '0.16em',
  color: '#9cc4ff', textTransform: 'uppercase', transition: 'opacity 420ms ease',
  borderLeft: '1px solid rgba(156,196,255,0.45)', paddingLeft: 10, maxWidth: 'min(520px, 70vw)',
}
