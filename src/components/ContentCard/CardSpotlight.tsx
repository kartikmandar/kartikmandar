'use client'

import { useEffect } from 'react'

/**
 * Moves the ember spotlight on whichever .content-card the pointer is over,
 * from one document listener. Desktop pointers only, and off under reduced
 * motion, where cards keep their plain hover border.
 */
export function CardSpotlight() {
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let active: HTMLElement | null = null
    const onMove = (event: PointerEvent) => {
      const card = (event.target as Element | null)?.closest?.<HTMLElement>('.content-card') ?? null
      if (card !== active) {
        if (active) delete active.dataset.spot
        active = card
        if (card) card.dataset.spot = 'on'
      }
      if (!card) return
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
      card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    return () => document.removeEventListener('pointermove', onMove)
  }, [])

  return null
}
