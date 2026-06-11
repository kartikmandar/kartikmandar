import { CONSTANTS } from './types'

export type Tier = 'raymarched' | 'mesh'
export type TierDecision = Tier | 'benchmark'

export interface TierEnvironment {
  queryQuality: 'high' | 'low' | null
  webgl2: boolean
  floatColorBuffer: boolean
  reducedMotion: boolean
  coarsePointer: boolean
  smallScreen: boolean
  deviceMemoryGb: number | null
}

/**
 * Pure tier decision (spec §Tier selection). Order matters:
 * query override > hard requirements > reduced motion > heuristics > benchmark.
 * Note: ?quality=high overrides even missing WebGL2 — the renderer-constructor
 * try/catch demotes to mesh first; shader compile failure is the secondary net.
 */
export function selectTier(env: TierEnvironment): TierDecision {
  if (env.queryQuality === 'high') return 'raymarched'
  if (env.queryQuality === 'low') return 'mesh'
  if (!env.webgl2 || !env.floatColorBuffer) return 'mesh'
  if (env.reducedMotion) return 'mesh'
  if (env.coarsePointer && env.smallScreen) return 'mesh'
  if (env.deviceMemoryGb !== null && env.deviceMemoryGb <= 4) return 'mesh'
  return 'benchmark'
}

export function tierFromBenchmark(avgFrameMs: number): Tier {
  return avgFrameMs < CONSTANTS.BENCHMARK_FRAME_MS ? 'raymarched' : 'mesh'
}

/** Browser reads. Kept thin and untested; all logic lives in selectTier. */
export function readTierEnvironment(): TierEnvironment {
  const params = new URLSearchParams(window.location.search)
  const q = params.get('quality')

  let webgl2 = false
  let floatColorBuffer = false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    if (gl) {
      webgl2 = true
      floatColorBuffer = gl.getExtension('EXT_color_buffer_float') !== null
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  } catch {
    // leave both false
  }

  const nav = navigator as Navigator & { deviceMemory?: number }
  const canMatchMedia = typeof window.matchMedia === 'function'
  return {
    queryQuality: q === 'high' || q === 'low' ? q : null,
    webgl2,
    floatColorBuffer,
    reducedMotion: canMatchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
    coarsePointer: canMatchMedia ? window.matchMedia('(pointer: coarse)').matches : false,
    smallScreen: Math.min(window.screen.width, window.screen.height) < 768,
    deviceMemoryGb: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
  }
}
