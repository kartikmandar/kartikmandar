// How the flight maps onto the sound: pure, so the mix can be tested and tuned without audio.

import type { SoundMix } from '@/lib/audioEngine'

/** Page progress per second that counts as scrolling flat out. */
export const FULL_SCROLL_SPEED = 0.04

const REST_CUTOFF_HZ = 2200
const MOVING_CUTOFF_HZ = 16000
const WHOOSH_PEAK = 0.09
const WHOOSH_LOW_HZ = 350
const WHOOSH_HIGH_HZ = 2950
const SUB_PEAK = 0.32

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

/**
 * `swell` is a 0..1 event whose middle carries the sub: for now the opening's
 * hand-off into the story. Phase 6 moves it to each path's ending (spec §10).
 */
export function storyMix({ scrollSpeed, cameraSpeed, swell }: { scrollSpeed: number; cameraSpeed: number; swell: number }): SoundMix {
  const scroll = clamp01(scrollSpeed)
  const camera = clamp01(cameraSpeed)
  const sub = Math.sin(Math.PI * clamp01(swell)) ** 2
  return {
    // Exponential, because hearing is: each step in speed opens the sound by the same amount.
    cutoffHz: REST_CUTOFF_HZ * (MOVING_CUTOFF_HZ / REST_CUTOFF_HZ) ** scroll,
    whooshGain: WHOOSH_PEAK * camera ** 1.5,
    whooshHz: WHOOSH_LOW_HZ + (WHOOSH_HIGH_HZ - WHOOSH_LOW_HZ) * camera,
    subGain: SUB_PEAK * sub,
  }
}

const PENTATONIC_RATIOS = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3] as const
const ROOT_HZ = 220
const BEATS_PER_OCTAVE = 15

/** The arrival chord for a beat: a pentatonic note, rising as the story goes on, with its fifth and octave. */
export function arrivalNotes(index: number): number[] {
  const position = Math.max(0, index)
  const octave = Math.floor(position / BEATS_PER_OCTAVE)
  const root = ROOT_HZ * 2 ** octave * PENTATONIC_RATIOS[position % PENTATONIC_RATIOS.length]!
  return [root, root * 1.5, root * 2]
}
