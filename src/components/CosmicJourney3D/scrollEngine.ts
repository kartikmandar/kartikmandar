// src/components/CosmicJourney3D/scrollEngine.ts
// The journey's single scroll clock: one Lenis instance (native document
// scroll, smoothed) stepped once per frame from the R3F loop (JourneyDriver),
// so scroll, camera, copy and rail all advance on the same frame.
import type Lenis from 'lenis'

let lenis: Lenis | null = null

export function setLenis(instance: Lenis | null): void {
  lenis = instance
}

export function getLenis(): Lenis | null {
  return lenis
}

/** Page geometry of the tall scroll driver, so progress <-> scroll px can be converted. */
export interface ScrollTrack {
  top: number
  height: number
}

let track: ScrollTrack = { top: 0, height: 1 }

export function setScrollTrack(next: ScrollTrack): void {
  track = next
}

/** A height change smaller than this is a phone's address bar, not a real resize. */
const ADDRESS_BAR_MAX_PX = 160

let stableViewport = { width: 0, height: 0 }

/**
 * The viewport height with the address bar ignored. Phones change innerHeight as
 * the bar slides; following that would nudge every scroll position mid-flight.
 */
export function steadyViewportHeight(width: number, height: number): number {
  if (width !== stableViewport.width || Math.abs(height - stableViewport.height) > ADDRESS_BAR_MAX_PX) {
    stableViewport = { width, height }
  }
  return stableViewport.height
}

/** Global journey progress (0..1) for a page scroll offset in px. */
export function progressForScroll(scrollY: number, viewport: number, t: ScrollTrack = track): number {
  const range = Math.max(1, t.height - viewport)
  return Math.max(0, Math.min(1, (scrollY - t.top) / range))
}

/** Page scroll offset in px for a global journey progress. */
export function scrollForProgress(progress: number, viewport: number, t: ScrollTrack = track): number {
  const range = Math.max(1, t.height - viewport)
  return t.top + Math.max(0, Math.min(1, progress)) * range
}

/**
 * Smoothly scrolls to a global journey progress. Long jumps get a longer,
 * eased flight (the camera "warps"); `immediate` jumps without animation.
 */
export function scrollToProgress(
  progress: number,
  { immediate = false, onComplete }: { immediate?: boolean; onComplete?: () => void } = {},
): void {
  const viewport = steadyViewportHeight(window.innerWidth, window.innerHeight)
  const target = scrollForProgress(progress, viewport)
  if (lenis) {
    // Lenis caches the page height, and the page is briefly short while the 3D code
    // loads. A stale height would clamp a deep link's jump back to the top.
    lenis.resize()
    const distance = Math.abs(target - lenis.scroll)
    const duration = Math.min(3.2, 0.9 + distance / (viewport * 6))
    // force: also works while Lenis is stopped (e.g. a deep link applied as the loader hands over)
    lenis.scrollTo(target, { immediate, force: true, duration, easing: (t) => 1 - Math.pow(1 - t, 4), onComplete: () => onComplete?.() })
  } else {
    window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' })
    onComplete?.()
  }
}
