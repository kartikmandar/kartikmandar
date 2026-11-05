// src/components/CosmicJourney3D/LoaderView.tsx
// Presentational loader: a single point of light under the title. Rendered on the
// server as the first paint (no black screen) and by JourneyLoader on the client,
// so the hand-over between the two is invisible. No hooks: server-safe.

import { glowFor, REVEAL_MS } from './loader'
import { PAGE_SUBTITLE, PAGE_TITLE } from './narrative'

export const LOADER_BACKDROP = '/media/my-story/loader-backdrop.webp'

export function LoaderView({ progress, revealing = false }: { progress: number; revealing?: boolean }) {
  const g = glowFor(progress)
  return (
    <div
      className="story-loader"
      role="status"
      aria-live="polite"
      aria-label={revealing ? 'Ready' : 'Loading the journey'}
      style={{
        position: 'fixed', inset: 0, zIndex: 20, background: '#04050b',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: revealing ? 0 : 1,
        transition: `opacity ${REVEAL_MS * 0.55}ms ease ${REVEAL_MS * 0.45}ms`,
        pointerEvents: revealing ? 'none' : 'auto',
      }}
    >
      {/* A still sky, so a slow connection sees more than a dot. Kept short of the full window: browsers don't count a viewport-filling image as LCP. */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: '3% 0', opacity: revealing ? 0 : 0.8,
          backgroundImage: `url(${LOADER_BACKDROP})`, backgroundSize: 'cover', backgroundPosition: 'center',
          maskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, #000 40%, transparent 100%)',
          transition: `opacity ${REVEAL_MS * 0.4}ms ease`,
        }}
      />
      <div
        style={{
          position: 'absolute', top: '30%', left: 0, right: 0, textAlign: 'center',
          color: '#eef2ff', fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
          opacity: revealing ? 0 : 1, transition: `opacity ${REVEAL_MS * 0.4}ms ease`,
        }}
      >
        <p style={{ fontSize: 'clamp(13px, 1.3vw, 16px)', letterSpacing: '0.42em', textTransform: 'uppercase', fontWeight: 500, margin: 0 }}>
          {PAGE_TITLE}
        </p>
        <p style={{ fontSize: 'clamp(11px, 1vw, 13px)', letterSpacing: '0.08em', opacity: 0.55, marginTop: 14 }}>
          {PAGE_SUBTITLE}
        </p>
      </div>
      {/* The point of light: brightens with real progress, then cools and spreads into the cloud the story opens on, never flaring. */}
      <div
        aria-hidden
        style={{
          width: g.core, height: g.core, borderRadius: '50%',
          background: revealing ? '#8fa6c4' : '#fff7ea',
          boxShadow: revealing
            ? `0 0 ${g.halo * 1.6}px ${g.core * 1.2}px rgba(120, 146, 184, 0.3), 0 0 ${g.spread * 1.4}px ${g.spread * 0.2}px rgba(70, 92, 130, 0.16)`
            : `0 0 ${g.halo}px ${g.core * 0.6}px rgba(255, 214, 160, 0.85), 0 0 ${g.spread}px ${g.spread * 0.12}px rgba(255, 122, 26, 0.28)`,
          transform: revealing ? 'scale(3)' : 'scale(1)',
          filter: revealing ? 'blur(3px)' : 'none',
          opacity: revealing ? 0 : 1,
          transition: revealing
            ? `transform ${REVEAL_MS}ms cubic-bezier(0.16, 1, 0.3, 1), background ${REVEAL_MS * 0.5}ms ease, box-shadow ${REVEAL_MS * 0.6}ms ease, filter ${REVEAL_MS}ms ease, opacity ${REVEAL_MS * 0.7}ms ease ${REVEAL_MS * 0.3}ms`
            : 'width 600ms ease, height 600ms ease, box-shadow 600ms ease',
        }}
      />
    </div>
  )
}
