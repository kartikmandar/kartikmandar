'use client'

import { useEffect, type RefObject } from 'react'

/**
 * Leans an element toward the pointer while hovered and springs it back on
 * leave. Desktop pointers only, and off under reduced motion. The transition
 * lives in CSS (see .magnetic in globals) so the spring-back stays smooth.
 */
export function useMagnetic(ref: RefObject<HTMLElement | null>, strength: { x: number; y: number } = { x: 0.18, y: 0.28 }): void {
  const { x, y } = strength
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const dx = event.clientX - (rect.left + rect.width / 2)
      const dy = event.clientY - (rect.top + rect.height / 2)
      el.style.transform = `translate(${dx * x}px, ${dy * y}px)`
    }
    const onLeave = () => {
      el.style.transform = 'translate(0px, 0px)'
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      el.style.transform = ''
    }
  }, [ref, x, y])
}
