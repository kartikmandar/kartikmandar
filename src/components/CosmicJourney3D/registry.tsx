// src/components/CosmicJourney3D/registry.tsx
import type React from 'react'
import { NARRATIVE } from './narrative'
import { BEATS_META } from './beatsMeta'
import type { BeatMeta, SceneProps } from './types'
import Beat_Constellation from './scenes/Beat_Constellation'
import UnbuiltBeatMarker from './scenes/UnbuiltBeatMarker'

export interface Beat {
  id: string
  eyebrow?: string
  headline: string
  body?: string
  typedPhrases?: string[]
  meta: BeatMeta
  Scene: React.FC<SceneProps>
}

// Built scenes are registered here; everything else flies as an UnbuiltBeatMarker
// until its own phase replaces it. Origin black hole is mounted separately at ORIGIN_ANCHOR.
const SCENES: Record<string, React.FC<SceneProps>> = {
  'constellation-section': Beat_Constellation,
}

export const BEATS: Beat[] = NARRATIVE.map((b) => ({
  ...b,
  meta: BEATS_META[b.id]!,
  Scene: SCENES[b.id] ?? UnbuiltBeatMarker,
}))

export const SCROLL_LENGTHS = BEATS.map((b) => b.meta.scrollLength)
export const TOTAL_SCROLL_VH = SCROLL_LENGTHS.reduce((a, b) => a + b, 0)
