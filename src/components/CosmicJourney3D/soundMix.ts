// How the flight maps onto the sound: pure, so the mix can be tested and tuned without audio.

import type { SoundMix } from '@/lib/audioEngine'
import { segmentRange, starPath, type StarPathId } from './openingStory'
import { pathProgress } from './pathStage'

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
 * `swell` is a 0..1 event whose middle carries the sub, at `level` (0..1) of its
 * peak: the opening's ignition and its path's ending (openingSwell).
 */
export function storyMix({ scrollSpeed, cameraSpeed, swell, level = 1 }: { scrollSpeed: number; cameraSpeed: number; swell: number; level?: number }): SoundMix {
  const scroll = clamp01(scrollSpeed)
  const camera = clamp01(cameraSpeed)
  const sub = clamp01(level) * Math.sin(Math.PI * clamp01(swell)) ** 2
  return {
    // Exponential, because hearing is: each step in speed opens the sound by the same amount.
    cutoffHz: REST_CUTOFF_HZ * (MOVING_CUTOFF_HZ / REST_CUTOFF_HZ) ** scroll,
    whooshGain: WHOOSH_PEAK * camera ** 1.5,
    whooshHz: WHOOSH_LOW_HZ + (WHOOSH_HIGH_HZ - WHOOSH_LOW_HZ) * camera,
    subGain: SUB_PEAK * sub,
  }
}

// --- The opening (spec §10) -------------------------------------------------

/** A low rise as the core ignites; the brown dwarf never does. */
const IGNITION_LEVEL = 0.4
/**
 * Each path's ending event, in its life lines (fractional, 0-based), and how
 * loud: the supernovae in full, the collapse a little less, the helium flash
 * soft (nothing shows from outside), and nothing for the dwarfs' quiet endings.
 */
const ENDING_SWELLS: Record<StarPathId, { from: number; to: number; level: number } | null> = {
  'sun': { from: 2.1, to: 2.9, level: 0.45 },
  'massive': { from: 3, to: 4.6, level: 1 },
  'very-massive': { from: 2.05, to: 2.75, level: 0.8 },
  'first-stars': { from: 2, to: 3.6, level: 1 },
  'red-dwarf': null,
  'brown-dwarf': null,
}

const NO_SWELL = { swell: 0, level: 0 }
const across = (value: number, from: number, to: number) => (value <= from || value >= to ? 0 : (value - from) / (to - from))

/** The sub's event at opening progress `opening` (0..1, before the hand-off) on `path`. */
export function openingSwell(path: StarPathId, opening: number): { swell: number; level: number } {
  const ignition = segmentRange('ignition')
  if (path !== 'brown-dwarf') {
    const swell = across(opening, ignition.start + 0.15 * (ignition.end - ignition.start), ignition.end)
    if (swell > 0) return { swell, level: IGNITION_LEVEL }
  }
  const ending = ENDING_SWELLS[path]
  if (!ending) return NO_SWELL
  const lines = pathProgress(opening) * starPath(path).life.length
  const swell = across(lines, ending.from, ending.to)
  return swell > 0 ? { swell, level: ending.level } : NO_SWELL
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
