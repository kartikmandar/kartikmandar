import type { QualityTier } from './types'

export interface JourneyEnv {
  reducedMotion: boolean
  coarsePointer: boolean
  smallScreen: boolean
  deviceMemoryGb: number | null
  webgl2: boolean
}

// Order: hard floor (no webgl2) > phone > low-memory > heuristics > high.
export function selectQuality(env: JourneyEnv): QualityTier {
  if (!env.webgl2) return 'mobile'
  if (env.coarsePointer && env.smallScreen) return 'mobile'
  if (env.deviceMemoryGb !== null && env.deviceMemoryGb <= 4) return 'low'
  return 'high'
}

export function readJourneyEnv(): JourneyEnv {
  const canMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  const nav = navigator as Navigator & { deviceMemory?: number }
  let webgl2 = false
  try {
    webgl2 = !!document.createElement('canvas').getContext('webgl2')
  } catch {
    webgl2 = false
  }
  return {
    reducedMotion: canMatchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
    coarsePointer: canMatchMedia ? window.matchMedia('(pointer: coarse)').matches : false,
    smallScreen: typeof window !== 'undefined' ? Math.min(window.screen.width, window.screen.height) < 768 : false,
    deviceMemoryGb: typeof nav?.deviceMemory === 'number' ? nav.deviceMemory : null,
    webgl2,
  }
}
