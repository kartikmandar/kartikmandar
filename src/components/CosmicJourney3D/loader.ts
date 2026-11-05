// src/components/CosmicJourney3D/loader.ts
// Real load progress for the loader: the point of light brightens as the
// journey actually gets ready (canvas live, every shader compiled).
import { createStore } from 'zustand'

export interface LoadState {
  /** 0..1, monotonic. */
  progress: number
  /** Everything is compiled and warmed up. */
  done: boolean
  /** Any deep link has been applied behind the loader (it may reveal the story now). */
  linked: boolean
}

export const loadStore = createStore<LoadState>(() => ({ progress: 0.05, done: false, linked: false }))

/** Called once the opening position (deep link or top) is settled behind the loader. */
export function reportLinked(): void {
  loadStore.setState({ linked: true })
}

/** Advances progress (never backwards). */
export function reportLoad(progress: number, done = false): void {
  const s = loadStore.getState()
  loadStore.setState({ progress: Math.max(s.progress, Math.min(1, progress)), done: s.done || done, linked: s.linked })
}

/** Minimum time the loader stays up on a first visit, so the reveal reads as an opening. */
export const FIRST_VISIT_MIN_MS = 1200
/** Duration of the loader's point of light fading into the cloud the story opens on. */
export const REVEAL_MS = 1100
export const SEEN_KEY = 'journey:seen'

/** Glow geometry for a progress value: one source of truth for SSR and client. */
export function glowFor(progress: number): { core: number; halo: number; spread: number } {
  const p = Math.max(0, Math.min(1, progress))
  return { core: 4 + 4 * p, halo: 10 + 46 * p, spread: 40 + 160 * p }
}
