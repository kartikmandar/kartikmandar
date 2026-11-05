// src/components/CosmicJourney3D/openingStage.ts
// What the opening's scene shows at each point of the scroll: pure, so the
// choreography can be tested without WebGL. Timed against the copy (§8): the
// cloud line, then fragmentation, then the core heating, then disk and jets;
// after the choice, planets grow and the gas clears, then the core ignites.
// From the planets on, the schedule follows the chosen path.

import { DEFAULT_STAR_PATH, segmentRange, type StarPathId } from './openingStory'
import { ease } from './art/anim'
import { handoffPresence } from './openingScroll'

export interface OpeningStageState {
  /** 0..1 how much diffuse cloud is left in view. */
  cloud: number
  /** 0..1 progress of the clumps falling in. */
  collapse: number
  /** 0..1 how hot the followed core has become. */
  heat: number
  /** 0..1 the dusty cocoon round the core. */
  envelope: number
  /** 0..1 the disk forming from infalling gas. */
  disk: number
  /** 0..1 the jets pushing out from the poles. */
  jets: number
  /** 0..1 dust in the disk sticking into pebbles (line 6). */
  pebbles: number
  /** 0..1 planetesimals growing into planets (lines 6-7). */
  growth: number
  /** 0..1 giants pulling in gas beyond the snow line (line 7). */
  giants: number
  /** 0..1 the snow line marked in the disk (line 7). */
  snowLine: number
  /** 0..1 the outer disk's gas cleared away (line 8, or early for heavy stars). */
  clear: number
  /** 0..1 the inner disk still feeding the star cleared away (a heavy star keeps feeding through ignition). */
  innerClear: number
  /** 0..1 hydrogen fusion switched on (line 9). */
  ignite: number
  /** 0..1 the whole stage, fading as the hand-off passes it. */
  presence: number
}

const CLOUD = segmentRange('cloud')
const PROTOSTAR = segmentRange('protostar')
const PLANETS = segmentRange('planets')
const IGNITION = segmentRange('ignition')
/** Where the second line of a two-line segment starts. */
const mid = (range: { start: number; end: number }) => (range.start + range.end) / 2
/** Where line `k` of a three-line segment starts. */
const third = (range: { start: number; end: number }, k: number) => range.start + ((range.end - range.start) * k) / 3

/** Stars heavy enough that their light clears the disk early and they ignite while still feeding (§3.1). */
export function isHeavyPath(path: StarPathId): boolean {
  return path === 'massive' || path === 'very-massive' || path === 'first-stars'
}

/** Writes the stage for the opening (0..1), the hand-off (0..1) and the chosen path into `out`. */
export function openingStage(
  opening: number,
  handoff: number,
  out: OpeningStageState,
  path: StarPathId = DEFAULT_STAR_PATH,
): OpeningStageState {
  const p = Math.max(0, Math.min(1, opening))
  const fragment = mid(CLOUD)
  const disk = mid(PROTOSTAR)
  const heavy = isHeavyPath(path)
  // Only stars with a big enough disk and a cold outer region grow giants (§3.1); a brown dwarf's disk is too small.
  const giantsForm = path === 'sun' || path === 'red-dwarf'
  // Line 2: the knots fall in, inside-out. Most of the cloud's gas never becomes a star, so some stays.
  out.collapse = ease(p, fragment - 0.01, CLOUD.end + 0.01)
  out.cloud = 1 - 0.65 * ease(p, fragment, PROTOSTAR.start + 0.02) - 0.2 * ease(p, PROTOSTAR.start, PROTOSTAR.end)
  // Line 3: a core heats up inside a cocoon of dust.
  out.envelope = ease(p, CLOUD.end - 0.015, PROTOSTAR.start + 0.025)
    * (1 - 0.55 * ease(p, disk + 0.02, PROTOSTAR.end + 0.02))
    * (1 - ease(p, PLANETS.start, third(PLANETS, 1)))
  out.heat = ease(p, PROTOSTAR.start, disk)
  // Line 4: the disk spreads out, then the jets open cavities through the cocoon. They die down as the disk ages.
  out.disk = ease(p, disk - 0.01, disk + 0.045)
  out.jets = ease(p, disk + 0.02, PROTOSTAR.end) * (1 - ease(p, PLANETS.start, third(PLANETS, 1)))
  // Line 6: dust sticks into pebbles, pebbles into planetesimals, planetesimals into planets.
  out.pebbles = ease(p, PLANETS.start, PLANETS.start + 0.03)
  out.growth = ease(p, PLANETS.start + 0.015, third(PLANETS, 2))
  // Line 7: beyond the snow line, giants pull in gas. A heavy star's light clears the disk before they can.
  out.snowLine = !giantsForm ? 0 : ease(p, third(PLANETS, 1), third(PLANETS, 1) + 0.02) * (1 - ease(p, third(PLANETS, 2) + 0.01, PLANETS.end))
  out.giants = !giantsForm ? 0 : ease(p, third(PLANETS, 1) + 0.01, third(PLANETS, 2))
  out.clear = heavy ? ease(p, third(PLANETS, 1), third(PLANETS, 2)) : ease(p, third(PLANETS, 2), PLANETS.end)
  // A heavy star keeps feeding from what is left of its inner disk until it is already burning.
  out.innerClear = heavy ? ease(p, mid(IGNITION), IGNITION.end) : out.clear
  // Line 9: the core settles onto the main sequence (or, for a brown dwarf, never quite does).
  out.ignite = ease(p, IGNITION.start, IGNITION.start + 0.6 * (IGNITION.end - IGNITION.start))
  out.presence = handoffPresence(Math.max(0, Math.min(1, handoff)))
  return out
}

export function createOpeningStage(): OpeningStageState {
  return {
    cloud: 1, collapse: 0, heat: 0, envelope: 0, disk: 0, jets: 0,
    pebbles: 0, growth: 0, giants: 0, snowLine: 0, clear: 0, innerClear: 0, ignite: 0, presence: 1,
  }
}
