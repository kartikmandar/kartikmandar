'use client'

import { fallbackEntries } from './fallbackPlan'
import { PAGE_TITLE, PAGE_SUBTITLE, HERO_PHASES } from './narrative'

// Static, fully-readable experience for reduced-motion / no-WebGL users.
// Posters may not exist yet (generated in a later phase); alt text + copy carry meaning.
export default function Fallback() {
  const entries = fallbackEntries()
  return (
    <section aria-label={PAGE_TITLE} style={{ background: '#05060d', color: '#e8eaf5' }}>
      <header style={{ textAlign: 'center', padding: '12vh 1rem 6vh' }}>
        <h1>{PAGE_TITLE}</h1>
        <p style={{ opacity: 0.7 }}>{PAGE_SUBTITLE}</p>
      </header>
      {HERO_PHASES.map((hp) => (
        <article key={hp.phase} style={{ maxWidth: 720, margin: '0 auto', padding: '4vh 1.25rem' }}>
          <h2>{hp.text}</h2>
        </article>
      ))}
      {entries.map((e) => (
        <article key={e.id} style={{ maxWidth: 720, margin: '0 auto', padding: '4vh 1.25rem' }}>
          {e.eyebrow && (
            <div style={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: 12, color: '#a5b4fc' }}>{e.eyebrow}</div>
          )}
          <h2>{e.headline}</h2>
          {e.body && <p style={{ opacity: 0.85, lineHeight: 1.6 }}>{e.body}</p>}
          {/* Cosmic-gradient placeholder until real GPU-captured poster stills exist
              (headless software-WebGL can't render faithful frames). */}
          <div
            aria-hidden
            style={{
              width: '100%', aspectRatio: '16 / 9', marginTop: 12, borderRadius: 10,
              background: 'radial-gradient(120% 100% at 50% 0%, #1a1438 0%, #0b0e1c 60%, #05060d 100%)',
              boxShadow: 'inset 0 0 60px rgba(99,102,241,0.18)',
            }}
          />
        </article>
      ))}
    </section>
  )
}
