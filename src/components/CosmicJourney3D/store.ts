// src/components/CosmicJourney3D/store.ts
// One clock for the whole journey. Per-frame values live in a plain mutable
// object written once per frame (JourneyDriver, via R3F addEffect) and read by
// scenes inside their own useFrame — no React state changes per frame.
// Discrete changes (the active beat) go through a zustand store so React only
// re-renders when the beat actually changes.
import { useMemo } from 'react'
import { createStore, useStore } from 'zustand'
import type { Range } from './scrollMath'

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

export interface JourneyFrame {
  /** Raw page progress 0..1 (opening + flight). */
  raw: number
  /** Flight progress 0..1 (after the opening split). */
  flight: number
  /** Opening progress 0..1 (a star's life, before the hand-off band). */
  opening: number
  /** Opening → flight hand-off 0..1 (the remnant gives way to the night sky). */
  handoff: number
  /** True for a few frames behind the loader: draw the flight's opening once so GPU uploads happen early. */
  warmup: boolean
  /** Shared scene clock in seconds (frozen in capture mode). */
  clock: number
  /** Clamped frame delta in seconds. */
  dt: number
  /** Index of the beat whose range contains the flight progress. */
  activeIndex: number
  /** Continuous per-beat progress: 0 before the beat, 0..1 inside it, 1 after. */
  local: Float32Array
  /** Top edge of the on-screen beat copy in px, or null when no beat copy is showing. */
  copyTopPx: number | null
  /** How fast the camera is travelling, 0..1 (the same signal as the warp lens kick). */
  cameraSpeed: number
}

export function createJourneyFrame(beatCount: number): JourneyFrame {
  return {
    raw: 0, flight: 0, opening: 0, handoff: 0, warmup: false,
    clock: 0, dt: 0, activeIndex: 0, local: new Float32Array(beatCount), copyTopPx: null, cameraSpeed: 0,
  }
}

/** Writes every beat's continuous progress into `out` without allocating. Returns the active index. */
export function writeBeatProgress(flight: number, ranges: Range[], out: Float32Array): number {
  const p = clamp01(flight)
  let active = ranges.length - 1
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i]!
    const span = r.end - r.start || 1
    out[i] = clamp01((p - r.start) / span)
    if (active === ranges.length - 1 && p < r.end) active = i
  }
  return Math.max(0, active)
}

// Module-level singleton: the journey page mounts one Canvas at a time.
// Sized generously; JourneyDriver writes only the first BEATS.length slots.
export const journeyFrame: JourneyFrame = createJourneyFrame(64)

export const journeyStore = createStore<{ activeIndex: number }>(() => ({ activeIndex: 0 }))

/** React hook for the discrete active beat (re-renders only when it changes). */
export function useActiveBeat(): number {
  return useStore(journeyStore, (s) => s.activeIndex)
}

export interface BeatHandle {
  /** This beat's continuous progress (0 before, 0..1 inside, 1 after). */
  readonly local: number
  /** Shared scene clock in seconds. */
  readonly clock: number
  /** Frame delta in seconds. */
  readonly dt: number
  /** True while this beat or a direct neighbour is active (i.e. it is on screen). */
  readonly near: boolean
}

/** Per-frame view of one beat. Read its fields inside useFrame; never in render. */
export function useBeat(index: number): BeatHandle {
  return useMemo<BeatHandle>(
    () => ({
      get local() {
        return journeyFrame.local[index] ?? 0
      },
      get clock() {
        return journeyFrame.clock
      },
      get dt() {
        return journeyFrame.dt
      },
      get near() {
        return Math.abs(journeyFrame.activeIndex - index) <= 1
      },
    }),
    [index],
  )
}
