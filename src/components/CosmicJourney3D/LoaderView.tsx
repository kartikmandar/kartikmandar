// src/components/CosmicJourney3D/LoaderView.tsx
// Presentational loader: a single point of light under the title. Rendered on the
// server as the first paint (no black screen) and by JourneyLoader on the client,
// so the hand-over between the two is invisible. No hooks: server-safe.

import { glowFor, IGNITE_MS } from './loader'
import { PAGE_SUBTITLE, PAGE_TITLE } from './narrative'

export function LoaderView({ progress, igniting = false }: { progress: number; igniting?: boolean }) {
  const g = glowFor(progress)
  return (
    <div
      className="story-loader"
      role="status"
      aria-live="polite"
      aria-label={igniting ? 'Ready' : 'Loading the journey'}
      style={{
        position: 'fixed', inset: 0, zIndex: 20, background: '#04050b',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: igniting ? 0 : 1,
        transition: `opacity ${IGNITE_MS * 0.55}ms ease ${IGNITE_MS * 0.45}ms`,
        pointerEvents: igniting ? 'none' : 'auto',
      }}
    >
      <div
        style={{
          position: 'absolute', top: '30%', left: 0, right: 0, textAlign: 'center',
          color: '#eef2ff', fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
          opacity: igniting ? 0 : 1, transition: `opacity ${IGNITE_MS * 0.4}ms ease`,
        }}
      >
        <p style={{ fontSize: 'clamp(13px, 1.3vw, 16px)', letterSpacing: '0.42em', textTransform: 'uppercase', fontWeight: 500, margin: 0 }}>
          {PAGE_TITLE}
        </p>
        <p style={{ fontSize: 'clamp(11px, 1vw, 13px)', letterSpacing: '0.08em', opacity: 0.55, marginTop: 14 }}>
          {PAGE_SUBTITLE}
        </p>
      </div>
      {/* The point of light: brightens with real progress, then ignites into the star. */}
      <div
        aria-hidden
        style={{
          width: g.core, height: g.core, borderRadius: '50%', background: '#fff7ea',
          boxShadow: `0 0 ${g.halo}px ${g.core * 0.6}px rgba(255, 214, 160, 0.85), 0 0 ${g.spread}px ${g.spread * 0.12}px rgba(255, 122, 26, 0.28)`,
          transform: igniting ? 'scale(70)' : 'scale(1)',
          opacity: igniting ? 0 : 1,
          transition: igniting
            ? `transform ${IGNITE_MS}ms cubic-bezier(0.7, 0, 0.84, 0), opacity ${IGNITE_MS * 0.6}ms ease ${IGNITE_MS * 0.4}ms`
            : 'width 600ms ease, height 600ms ease, box-shadow 600ms ease',
        }}
      />
    </div>
  )
}
