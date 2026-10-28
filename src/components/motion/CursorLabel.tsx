'use client'

// A small label that follows the pointer over anything marked data-cursor="…"
// (e.g. "View", "Open"). Desktop pointers only; off under reduced motion. It is
// decorative: the element's own text and aria labels stay the source of truth.

import { useEffect, useRef } from 'react'

export function CursorLabel() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let x = 0
    let y = 0
    let tx = 0
    let ty = 0
    let frame = 0
    let label = ''

    const tick = () => {
      x += (tx - x) * 0.22
      y += (ty - y) * 0.22
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.1 ? requestAnimationFrame(tick) : 0
    }
    const onMove = (event: PointerEvent) => {
      tx = event.clientX + 16
      ty = event.clientY + 18
      const target = (event.target as Element | null)?.closest?.('[data-cursor]')
      const next = target?.getAttribute('data-cursor') ?? ''
      if (next !== label) {
        label = next
        if (next) el.textContent = next
        el.dataset.visible = next ? 'true' : 'false'
        if (next && !frame) {
          x = tx
          y = ty
        }
      }
      if (!frame) frame = requestAnimationFrame(tick)
    }
    const onLeave = () => {
      label = ''
      el.dataset.visible = 'false'
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <div ref={ref} className="cursor-label mono-label" data-visible="false" aria-hidden />
}
