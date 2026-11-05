// src/components/CosmicJourney3D/TryAnotherStar.tsx
'use client'

// "Try another star", under the hand-off line (decision 9.4): flies back to the
// choice of mass and focuses the slider. A real link to #choose, so it can also
// be opened in a new tab, which lands on the choice the same way.

import { CHOOSE_HASH } from './navigation'
import { jumpToChoice } from './JourneyNav'

export function TryAnotherStar() {
  return (
    <>
      <a
        href={CHOOSE_HASH}
        className="journey-try-star"
        style={link}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
          e.preventDefault()
          jumpToChoice()
        }}
      >
        <span aria-hidden style={arrow}>↑</span>
        Try another star
      </a>
      <style>{`
        .journey-try-star:hover{border-color:#ff7a1a;color:#eef2ff}
        .journey-try-star:focus-visible{outline:2px solid #5ee7ff;outline-offset:3px}
      `}</style>
    </>
  )
}

const link: React.CSSProperties = {
  pointerEvents: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 26, minHeight: 40, padding: '8px 16px',
  borderRadius: 999, border: '1px solid rgba(238,242,255,0.28)', background: 'rgba(4,5,11,0.45)', color: 'rgba(238,242,255,0.86)',
  fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace', fontSize: 12, letterSpacing: '0.08em', textDecoration: 'none',
  transition: 'border-color 200ms ease, color 200ms ease',
}
const arrow: React.CSSProperties = { color: '#ff7a1a' }
