// src/components/CosmicJourney3D/MagneticLink.tsx
'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * A call-to-action that leans toward the pointer on desktop (pointer: fine only),
 * springing back on leave. Purely decorative motion; the link is a normal <a>.
 */
export function MagneticLink({ href, children, primary = false, external = false }: {
  href: string
  children: ReactNode
  primary?: boolean
  external?: boolean
}) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(pointer: fine)').matches) return
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`
    }
    const onLeave = () => {
      el.style.transform = 'translate(0px, 0px)'
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <a
      ref={ref}
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="journey-chip"
      style={{
        display: 'inline-block', padding: primary ? '14px 26px' : '12px 20px', borderRadius: 999,
        fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace', fontSize: primary ? 14 : 13,
        letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none',
        color: primary ? '#04050b' : '#eef2ff',
        background: primary ? '#ff7a1a' : 'rgba(238,242,255,0.06)',
        border: primary ? '1px solid #ff7a1a' : '1px solid rgba(238,242,255,0.28)',
        boxShadow: primary ? '0 0 36px rgba(255,122,26,0.45)' : 'none',
        transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
      {external && <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}> (opens in a new tab)</span>}
    </a>
  )
}
