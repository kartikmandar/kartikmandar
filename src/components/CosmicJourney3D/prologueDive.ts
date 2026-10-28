// src/components/CosmicJourney3D/prologueDive.ts
// The photon-ring hand-off, as a pure schedule over the prologue→flight
// crossfade (0..1, see splitProgress). The prologue's virtual camera dives at
// the photon ring while the frame swells with light; the pass then dissolves to
// reveal the flight. Photosensitivity: exposure ramps, never flashes.

import { ease, pulse } from './art/anim'

export interface DiveState {
  /** 0..1 progress of the dive toward the photon ring. */
  dive: number
  /** Prologue pass opacity (1 = covers the flight completely). */
  opacity: number
  /** HDR exposure multiplier for the pass (1 = as rendered). Bloom carries the swell. */
  exposure: number
  /** Vertical field of view for the prologue's virtual camera, degrees. */
  fov: number
  /** True while the pass fully covers the screen, so the flight can skip drawing. */
  covers: boolean
}

/** Peak exposure multiplier of the swell. Kept moderate: a glow, not a white-out. */
export const MAX_SWELL = 2.4

/** Writes the hand-off state for `crossfade` into `out` (allocation-free when `out` is reused). */
export function diveState(crossfade: number, out: DiveState = { dive: 0, opacity: 1, exposure: 1, fov: 60, covers: true }): DiveState {
  const c = Math.max(0, Math.min(1, crossfade))
  out.dive = ease(c, 0, 0.62)
  out.opacity = 1 - ease(c, 0.55, 0.95)
  out.exposure = 1 + (MAX_SWELL - 1) * pulse(c, 0.2, 1.0)
  out.fov = 60 + 22 * out.dive
  out.covers = out.opacity >= 0.999
  return out
}

/** Prologue render-target scale per tier (fraction of the drawing buffer). */
export const PROLOGUE_BASE_SCALE: Record<'high' | 'low' | 'mobile', number> = { high: 1, low: 0.75, mobile: 0.6 }
/** Scale while diving: detail sits under the exposure swell, and every ray marches near the hole. */
export const DIVE_SCALE = 0.5

/** Discrete render scale for the prologue raymarch (discrete so the target rarely reallocates). */
export function prologueScale(quality: 'high' | 'low' | 'mobile', crossfade: number): number {
  const base = PROLOGUE_BASE_SCALE[quality]
  return crossfade > 0.12 ? Math.min(base, DIVE_SCALE) : base
}
