// src/components/CosmicJourney3D/openingStage.ts
// What the opening's scene shows at each point of the scroll: pure, so the
// choreography can be tested without WebGL. Timed against the copy (§8): the
// cloud line, then fragmentation, then the core heating, then disk and jets.

import { segmentRange } from './openingStory'
import { ease } from './art/anim'

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
  /** 0..1 the whole stage, fading as the hand-off passes it. */
  presence: number
}

const CLOUD = segmentRange('cloud')
const PROTOSTAR = segmentRange('protostar')
/** Where the second line of a two-line segment starts. */
const mid = (range: { start: number; end: number }) => (range.start + range.end) / 2

/** Writes the stage for the opening (0..1) and the hand-off (0..1) into `out`. */
export function openingStage(opening: number, handoff: number, out: OpeningStageState): OpeningStageState {
  const p = Math.max(0, Math.min(1, opening))
  const fragment = mid(CLOUD)
  const disk = mid(PROTOSTAR)
  // Line 2: the knots fall in, inside-out. Most of the cloud's gas never becomes a star, so some stays.
  out.collapse = ease(p, fragment - 0.01, CLOUD.end + 0.01)
  out.cloud = 1 - 0.65 * ease(p, fragment, PROTOSTAR.start + 0.02) - 0.2 * ease(p, PROTOSTAR.start, PROTOSTAR.end)
  // Line 3: a core heats up inside a cocoon of dust.
  out.envelope = ease(p, CLOUD.end - 0.015, PROTOSTAR.start + 0.025) * (1 - 0.55 * ease(p, disk + 0.02, PROTOSTAR.end + 0.02))
  out.heat = ease(p, PROTOSTAR.start, disk)
  // Line 4: the disk spreads out, then the jets open cavities through the cocoon.
  out.disk = ease(p, disk - 0.01, disk + 0.045)
  out.jets = ease(p, disk + 0.02, PROTOSTAR.end)
  out.presence = 1 - ease(Math.max(0, Math.min(1, handoff)), 0.2, 0.85)
  return out
}

export function createOpeningStage(): OpeningStageState {
  return { cloud: 1, collapse: 0, heat: 0, envelope: 0, disk: 0, jets: 0, presence: 1 }
}
