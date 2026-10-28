// src/components/CosmicJourney3D/types.ts
export type QualityTier = 'high' | 'low' | 'mobile'

export interface Anchor {
  position: [number, number, number]
  lookAt?: [number, number, number]
}

/** Legacy scene API (pre-Phase 1): progress and clock arrive as props, so the scene re-renders per frame. */
export interface SceneProps {
  localProgress: number
  clock: number
  quality: QualityTier
  reducedMotion: boolean
}

/** Beat scene API (Phase 1+): read per-frame values with useBeat(index) inside useFrame; never re-render per frame. */
export interface BeatSceneProps {
  index: number
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
