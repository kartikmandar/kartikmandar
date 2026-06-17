// src/components/CosmicJourney3D/fallbackPlan.ts
import { NARRATIVE } from './narrative'
import { BEATS_META } from './beatsMeta'

export type FallbackMode = 'none' | 'static'

export function fallbackMode(reducedMotion: boolean, webgl2: boolean): FallbackMode {
  return reducedMotion || !webgl2 ? 'static' : 'none'
}

export interface FallbackEntry {
  id: string
  eyebrow?: string
  headline: string
  body?: string
  posterSrc: string
}

export function fallbackEntries(): FallbackEntry[] {
  return NARRATIVE.map((b) => ({
    id: b.id,
    eyebrow: b.eyebrow,
    headline: b.headline,
    body: b.body,
    posterSrc: BEATS_META[b.id]!.posterSrc,
  }))
}
