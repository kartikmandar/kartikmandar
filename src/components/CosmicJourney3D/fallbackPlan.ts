// src/components/CosmicJourney3D/fallbackPlan.ts
export type FallbackMode = 'none' | 'static'

export function fallbackMode(reducedMotion: boolean, webgl2: boolean): FallbackMode {
  return reducedMotion || !webgl2 ? 'static' : 'none'
}
