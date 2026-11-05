// src/components/CosmicJourney3D/LifetimeTimeline.tsx
'use client'

// Under "It will shine for trillions of years. The Universe is only 13.8
// billion years old.": one hairline for the star's whole life, with the
// Universe's age so far marked on it to scale. At 0.15 solar masses the mark
// sits about half a percent along: a sliver at the very start.

import { lifetimeYears, formatYears, useStarMass } from './starChoice'

/** Age of the Universe, in years (Planck 2018: 13.787 ± 0.020 billion). */
export const UNIVERSE_AGE_YEARS = 13.8e9

export function LifetimeTimeline() {
  const mass = useStarMass()
  const life = lifetimeYears(mass)
  if (life === null) return null
  const share = Math.min(1, UNIVERSE_AGE_YEARS / life)
  const lifeText = formatYears(life).replace(/^about /, '')
  return (
    <figure style={wrap}>
      <div aria-hidden style={track}>
        <span style={{ ...elapsed, width: `${Math.max(0.4, share * 100)}%` }} />
        <span style={{ ...now, left: `${share * 100}%` }} />
      </div>
      <figcaption className="journey-lifetime-caption" style={caption}>
        <span>Now · 13.8 billion years</span>
        <span>{`Its life · about ${lifeText}`}</span>
      </figcaption>
      {/* Stacked on phones, so neither caption wraps into the chapter rail's corner. */}
      <style>{`@media (max-width:560px){.journey-lifetime-caption{flex-direction:column!important;align-items:flex-start;gap:4px!important}}`}</style>
    </figure>
  )
}

const mono = 'var(--font-jetbrains-mono), ui-monospace, monospace'
const wrap: React.CSSProperties = { margin: '26px auto 0', width: 'min(560px, 100%)' }
const track: React.CSSProperties = { position: 'relative', height: 2, background: 'rgba(238,242,255,0.28)' }
const elapsed: React.CSSProperties = { position: 'absolute', left: 0, top: 0, bottom: 0, background: '#ff7a1a' }
const now: React.CSSProperties = {
  position: 'absolute', top: -6, width: 1, height: 14, marginLeft: -0.5, background: '#ff7a1a', boxShadow: '0 0 10px rgba(255,122,26,0.7)',
}
const caption: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 12, fontFamily: mono,
  fontSize: 'clamp(11px, 1.05vw, 13px)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(238,242,255,0.78)',
}
