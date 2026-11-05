// src/components/CosmicJourney3D/openingStills.ts
// The opening's stills (spec §10): a few from the trunk, two or three from
// each path, and the night sky. Calm mode shows them in place of the 3D, and
// scripts/capture-posters.mjs renders each one at its place in the opening,
// with `?star=` set to its path. Pure, so both read the same list.

import { HANDOFF_BAND, OPENING_FRACTION } from './openingScroll'
import { segmentRange, starPath, type OpeningSegment, type StarPathId } from './openingStory'

export interface OpeningStill {
  /** File name and calm-mode slug. */
  name: string
  /** The path it is captured on (the trunk's stills are the same for every path). */
  star: StarPathId
  /** Global page progress (0..1) where it is captured. */
  progress: number
}

/** Global progress `within` (0..1) a segment of the opening. */
function inSegment(id: OpeningSegment, within: number): number {
  const range = segmentRange(id)
  return (range.start + (range.end - range.start) * within) * OPENING_FRACTION
}

/** Global progress at `line` (fractional, 0-based) of a path's life lines. */
function atLine(star: StarPathId, line: number): number {
  return inSegment('path', line / starPath(star).life.length)
}

export const TRUNK_STILLS = {
  cloud: { name: 'cloud', star: 'sun', progress: inSegment('cloud', 0.8) },
  protostar: { name: 'protostar', star: 'sun', progress: inSegment('protostar', 0.8) },
  choose: { name: 'choose', star: 'sun', progress: inSegment('choice', 0.5) },
  // The hold on the night sky under the hand-off line.
  sky: { name: 'night-sky', star: 'sun', progress: OPENING_FRACTION + HANDOFF_BAND * 0.85 },
} as const satisfies Record<string, OpeningStill>

/** Each path's stills, in order: the first shows the star's life, the last its ending. */
export const PATH_STILLS: Record<StarPathId, readonly OpeningStill[]> = {
  'sun': [
    { name: 'sun-main-sequence', star: 'sun', progress: atLine('sun', 0.5) },
    { name: 'sun-red-giant', star: 'sun', progress: atLine('sun', 1.75) },
    { name: 'sun-white-dwarf', star: 'sun', progress: atLine('sun', 4.6) },
  ],
  'massive': [
    { name: 'massive-blue', star: 'massive', progress: atLine('massive', 0.5) },
    { name: 'massive-supergiant', star: 'massive', progress: atLine('massive', 1.85) },
    { name: 'massive-supernova', star: 'massive', progress: atLine('massive', 4.2) },
  ],
  'very-massive': [
    { name: 'very-massive-wind', star: 'very-massive', progress: atLine('very-massive', 0.5) },
    { name: 'very-massive-black-hole', star: 'very-massive', progress: atLine('very-massive', 2.8) },
  ],
  'red-dwarf': [
    { name: 'red-dwarf-life', star: 'red-dwarf', progress: atLine('red-dwarf', 0.5) },
    { name: 'red-dwarf-future', star: 'red-dwarf', progress: atLine('red-dwarf', 2.6) },
  ],
  'brown-dwarf': [
    { name: 'brown-dwarf-deuterium', star: 'brown-dwarf', progress: atLine('brown-dwarf', 0.4) },
    { name: 'brown-dwarf-cooling', star: 'brown-dwarf', progress: atLine('brown-dwarf', 1.3) },
  ],
  'first-stars': [
    { name: 'first-stars-pairs', star: 'first-stars', progress: atLine('first-stars', 1.7) },
    { name: 'first-stars-blast', star: 'first-stars', progress: atLine('first-stars', 2.5) },
  ],
}

/** Every still, once. */
export const OPENING_STILLS: readonly OpeningStill[] = [
  TRUNK_STILLS.cloud,
  TRUNK_STILLS.protostar,
  TRUNK_STILLS.choose,
  ...Object.values(PATH_STILLS).flat(),
  TRUNK_STILLS.sky,
]

export function openingPoster(name: string): string {
  return `/media/my-story/opening-${name}.webp`
}
