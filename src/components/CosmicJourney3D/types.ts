// src/components/CosmicJourney3D/types.ts
export type QualityTier = 'high' | 'low' | 'mobile'

export interface Anchor {
  position: [number, number, number]
  lookAt?: [number, number, number]
}

export interface SceneProps {
  localProgress: number
  clock: number
  quality: QualityTier
  reducedMotion: boolean
}

export interface BeatMeta {
  scrollLength: number
  pin: boolean
  anchor: Anchor
  posterSrc: string
  acceptance: string[]
}
