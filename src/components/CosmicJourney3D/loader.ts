// src/components/CosmicJourney3D/loader.ts
// Real load progress for the loader-as-prologue: the point of light brightens
// as the journey actually gets ready (canvas + sky bake, every shader compiled).
import { createStore } from 'zustand'

export interface LoadState {
  /** 0..1, monotonic. */
  progress: number
  done: boolean
}

export const loadStore = createStore<LoadState>(() => ({ progress: 0.05, done: false }))

/** Advances progress (never backwards). */
export function reportLoad(progress: number, done = false): void {
  const s = loadStore.getState()
  loadStore.setState({ progress: Math.max(s.progress, Math.min(1, progress)), done: s.done || done })
}

/** Minimum time the loader stays up on a first visit, so the ignition reads as an opening. */
export const FIRST_VISIT_MIN_MS = 1200
/** Duration of the ignite-into-the-star transition. */
export const IGNITE_MS = 1100
export const SEEN_KEY = 'journey:seen'

/** Glow geometry for a progress value: one source of truth for SSR and client. */
export function glowFor(progress: number): { core: number; halo: number; spread: number } {
  const p = Math.max(0, Math.min(1, progress))
  return { core: 4 + 4 * p, halo: 10 + 46 * p, spread: 40 + 160 * p }
}
