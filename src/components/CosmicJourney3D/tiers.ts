import { isSoftwareRenderer } from './robustness'
import type { QualityTier } from './types'

export interface JourneyEnv {
  reducedMotion: boolean
  coarsePointer: boolean
  smallScreen: boolean
  deviceMemoryGb: number | null
  webgl2: boolean
  softwareRenderer: boolean
  /** Can render to half-float targets, which the post stack prefers. */
  halfFloat: boolean
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
  let softwareRenderer = false
  let halfFloat = false
  try {
    // The caveat flag refuses a context the browser knows would be very slow.
    const gl = document.createElement('canvas').getContext('webgl2', { failIfMajorPerformanceCaveat: true })
    webgl2 = !!gl
    if (gl) {
      const info = gl.getExtension('WEBGL_debug_renderer_info')
      softwareRenderer = isSoftwareRenderer(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : null)
      halfFloat = !!(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'))
      // Browsers cap live contexts, so give this probe's back straight away.
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  } catch {
    webgl2 = false
  }
  return {
    reducedMotion: canMatchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
    coarsePointer: canMatchMedia ? window.matchMedia('(pointer: coarse)').matches : false,
    smallScreen: typeof window !== 'undefined' ? Math.min(window.screen.width, window.screen.height) < 768 : false,
    deviceMemoryGb: typeof nav?.deviceMemory === 'number' ? nav.deviceMemory : null,
    webgl2,
    softwareRenderer,
    halfFloat,
  }
}

/** Adaptive DPR range per tier (upper end never above the device's own DPR). */
export const DPR_RANGE: Record<QualityTier, [number, number]> = {
  high: [1, 2],
  low: [0.75, 1.5],
  mobile: [1, 1.25],
}

/** PerformanceMonitor starts here (0..1), i.e. a little under the tier's maximum. */
export const DPR_START_FACTOR = 0.7

/**
 * DPR for a PerformanceMonitor factor (0 = struggling, 1 = headroom), in 0.25
 * steps so the canvas only resizes on meaningful changes.
 */
export function adaptiveDpr(quality: QualityTier, factor: number, deviceDpr: number): number {
  const [lo, hiTier] = DPR_RANGE[quality]
  const hi = Math.max(lo, Math.min(hiTier, deviceDpr))
  const f = Math.max(0, Math.min(1, factor))
  return Math.round((lo + (hi - lo) * f) * 4) / 4
}

export type FrameSignal = 'steady' | 'struggling' | 'capped'

/**
 * Reads a window of frame intervals (ms). Low Power Mode caps the frame rate at
 * a very even 30 Hz, which looks different from a GPU that can't keep up.
 */
export function frameSignal(intervals: readonly number[]): FrameSignal {
  if (intervals.length === 0) return 'steady'
  const sorted = [...intervals].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]!
  const p90 = sorted[Math.floor(sorted.length * 0.9)]!
  if (median >= 31 && median <= 36 && p90 <= 40) return 'capped'
  return median > 28 ? 'struggling' : 'steady'
}

/** The tier to drop to for a signal, or the same tier if there's nothing to do. A capped device is smooth, so it stops at low. */
export function nextTier(quality: QualityTier, signal: FrameSignal): QualityTier {
  if (signal === 'steady') return quality
  if (quality === 'high') return 'low'
  if (quality === 'low' && signal === 'struggling') return 'mobile'
  return quality
}
