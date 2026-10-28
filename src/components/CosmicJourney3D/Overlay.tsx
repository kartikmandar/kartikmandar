// src/components/CosmicJourney3D/Overlay.tsx
'use client'

// The story's copy, typeset like film titling. Each beat's text appears only
// once its shot has settled (the hold window of the shot schedule), revealing
// line by line through masks (GSAP SplitText), and leaves with a short blur
// before the camera departs. The prologue's lines cross-fade per phase.
// React re-renders only when what is on screen changes, never per frame.

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { addEffect } from '@react-three/fiber'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { BEATS } from './registry'
import { HERO_PHASES } from './narrative'
import { journeyFrame } from './store'
import { phaseStateFromProgress } from './prologuePhase'
import { readCapture } from './capture'
import { overlayView, type OverlayView } from './overlayView'
import { PROLOGUE_FRACTION } from './prologueScroll'
import { Phase } from '@/components/QuasarBackground/engine/types'

if (typeof window !== 'undefined') gsap.registerPlugin(SplitText)

// Phase → hero line (COLLAPSE and FLASH keep the STAR line on screen).
const HERO_LINE: Record<Phase, number> = {
  [Phase.STAR]: 0,
  [Phase.COLLAPSE]: 0,
  [Phase.FLASH]: 0,
  [Phase.SHELL]: 1,
  [Phase.BIRTH]: 2,
  [Phase.QUASAR]: 3,
}

export const BEAT_HEADING_ID = 'journey-beat-heading'

const pad = (n: number) => String(n).padStart(2, '0')

function sameView(a: OverlayView, b: OverlayView): boolean {
  return a.kind === b.kind && a.index === b.index && a.visible === b.visible
}

export function Overlay() {
  const capture = readCapture()
  const [view, setView] = useState<OverlayView>({ kind: 'hero', index: 0, visible: true })
  const rootRef = useRef<HTMLDivElement>(null)

  // Watch the shared frame once per frame; commit to React only on change.
  useEffect(() => {
    let current: OverlayView = { kind: 'hero', index: 0, visible: true }
    return addEffect(() => {
      const f = journeyFrame
      const next = overlayView({
        inPrologue: f.raw < PROLOGUE_FRACTION && f.crossfade < 0.5,
        heroIndex: HERO_LINE[phaseStateFromProgress(f.prologue).phase],
        activeIndex: f.activeIndex,
        local: f.local[f.activeIndex] ?? 0,
      })
      if (!sameView(current, next)) {
        current = next
        setView(next)
      }
    })
  }, [])

  // Reveal/exit choreography for whatever is mounted.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      if (capture.enabled) {
        gsap.set(root, { autoAlpha: view.visible ? 1 : 0, filter: 'blur(0px)', y: 0 })
        return
      }
      if (!view.visible) {
        gsap.to(root, { autoAlpha: 0, filter: 'blur(8px)', y: -10, duration: 0.45, ease: 'power2.in' })
        return
      }
      gsap.set(root, { autoAlpha: 1, filter: 'blur(0px)', y: 0 })
      const targets = root.querySelectorAll<HTMLElement>('[data-split]')
      targets.forEach((el, i) => {
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          aria: 'auto',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: 1.0,
              ease: 'expo.out',
              stagger: 0.075,
              delay: 0.12 + i * 0.16,
            }),
        })
      })
      gsap.from(root.querySelectorAll('[data-fade]'), { autoAlpha: 0, y: 8, duration: 0.8, ease: 'power2.out', stagger: 0.08 })
    }, root)
    return () => ctx.revert()
  }, [view, capture.enabled])

  if (view.kind === 'hero') {
    return (
      <div aria-live="polite" style={heroWrap}>
        <div ref={rootRef} key={`hero-${view.index}`}>
          <h2 data-split style={heroText}>{HERO_PHASES[view.index]!.text}</h2>
        </div>
      </div>
    )
  }

  const beat = BEATS[view.index]
  if (!beat) return null
  return (
    <div aria-live="polite" style={beatWrap}>
      {/* Lower-third scrim: guarantees text contrast over any frame. */}
      <div aria-hidden style={scrim} />
      <div ref={rootRef} key={`beat-${view.index}`} style={beatInner}>
        <div data-fade style={eyebrow}>
          <span style={{ opacity: 0.6 }}>{pad(view.index + 1)} / {pad(BEATS.length)}</span>
          {beat.eyebrow && <span>{` · ${beat.eyebrow}`}</span>}
        </div>
        <h2 id={BEAT_HEADING_ID} tabIndex={-1} data-split style={headline}>{beat.headline}</h2>
        {beat.body && <p data-split style={body}>{beat.body}</p>}
        {beat.typedPhrases && (
          <ol data-fade style={phrases}>
            {beat.typedPhrases.map((phrase, i, all) => (
              <li key={phrase} style={{ opacity: i === all.length - 1 ? 1 : 0.45, color: i === all.length - 1 ? '#5ee7ff' : undefined }}>
                {phrase}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

const heroWrap: React.CSSProperties = {
  position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
  textAlign: 'center', pointerEvents: 'none', padding: '0 8vw', color: '#eef2ff', zIndex: 2,
}
const heroText: React.CSSProperties = {
  fontSize: 'clamp(26px, 3.6vw, 52px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15,
  margin: 0, maxWidth: 980, textShadow: '0 2px 30px rgba(0,0,0,0.85)',
}
const beatWrap: React.CSSProperties = {
  position: 'fixed', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  pointerEvents: 'none', color: '#eef2ff', zIndex: 2,
}
const scrim: React.CSSProperties = {
  position: 'absolute', left: 0, right: 0, bottom: 0, height: '52vh',
  background: 'linear-gradient(to top, rgba(4,5,11,0.92) 0%, rgba(4,5,11,0.72) 38%, rgba(4,5,11,0) 100%)',
}
const beatInner: React.CSSProperties = {
  position: 'relative', width: 'min(760px, 88vw)', padding: '0 0 9vh', textAlign: 'center',
  // starts hidden: GSAP reveals it once the shot settles (no flash on mount)
  opacity: 0, visibility: 'hidden',
}
const eyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace', fontSize: 12, letterSpacing: '0.22em',
  textTransform: 'uppercase', color: '#9cc4ff', marginBottom: 14,
}
const headline: React.CSSProperties = {
  fontSize: 'clamp(28px, 3.4vw, 48px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1,
  margin: '0 0 16px', outline: 'none',
}
const body: React.CSSProperties = {
  fontSize: 'clamp(15px, 1.25vw, 18px)', lineHeight: 1.65, fontWeight: 400, margin: 0,
  color: 'rgba(238,242,255,0.86)',
}
const phrases: React.CSSProperties = {
  listStyle: 'none', padding: 0, margin: 0, fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
  fontSize: 'clamp(14px, 1.2vw, 17px)', lineHeight: 1.9,
}
