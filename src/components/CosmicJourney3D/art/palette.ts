// src/components/CosmicJourney3D/art/palette.ts
// Art bible: "made of light". One palette shared by every beat (and, from
// Phase 5, by the site's CSS tokens). Hero objects are luminous: hairlines,
// rim-lit bodies, soft glows on a tinted near-black. Colour temperature drifts
// from cold (Act I) to ember (Act V).
import * as THREE from 'three'
import type { Act } from '../narrative'

export const PALETTE = {
  /** Tinted near-black: background, fog, occluders. */
  void: '#04050b',
  /** The accretion-disk accent. The one warm signature colour of the site. */
  ember: '#ff7a1a',
  emberDeep: '#c2410c',
  /** Instruments, signals, data: cool cyan. */
  signal: '#5ee7ff',
  /** Stars, achievements, highlights. */
  starGold: '#ffd27a',
  /** Text, hairlines, the hottest light. */
  nearWhite: '#eef2ff',
  /** 21-cm hydrogen haze. */
  hydrogen: '#ff4d6a',
  /** Hot young stars, cold light. */
  stellarBlue: '#9cc4ff',
} as const

export type PaletteKey = keyof typeof PALETTE

/** Per-act grade: key light colour, accent and fog tint. Drifts cold → ember. */
export const ACT_GRADE: Record<Act, { key: string; accent: string; fog: string }> = {
  spark: { key: '#a9c7ff', accent: PALETTE.stellarBlue, fog: '#04060e' },
  'course-correction': { key: '#b9c8ff', accent: PALETTE.signal, fog: '#04060d' },
  ignition: { key: '#d8d2ff', accent: PALETTE.signal, fog: '#05050c' },
  widening: { key: '#ffe2c4', accent: PALETTE.starGold, fog: '#06050a' },
  catania: { key: '#ffc79a', accent: PALETTE.ember, fog: '#070508' },
}

/** Emission strengths. Bloom only picks up values above ~1, so HDR > 1 means "this glows". */
export const GLOW = {
  /** Faint structure that should never bloom. */
  dim: 0.35,
  /** Readable but quiet. */
  base: 0.9,
  /** Hero hairlines and rims. Blooms softly. */
  hero: 2.2,
  /** Hottest points: cores, impacts. */
  hot: 4.5,
} as const

/** A palette colour scaled into HDR. Allocates; call in useMemo, never per frame. */
export function hdr(color: string, intensity: number): THREE.Color {
  return new THREE.Color(color).multiplyScalar(intensity)
}

/** Writes an HDR colour into `target` without allocating (safe inside useFrame). */
export function setHdr(target: THREE.Color, base: THREE.Color, intensity: number): THREE.Color {
  return target.copy(base).multiplyScalar(intensity)
}

/** Self-hosted OFL mono for in-world labels (latin subset: keep labels to ASCII and "·"). */
export const LABEL_FONT = '/fonts/JetBrainsMono-Medium.woff'
