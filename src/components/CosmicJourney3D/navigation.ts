// src/components/CosmicJourney3D/navigation.ts
// Deep links and jumps: every beat has a stable URL slug (/my-story#rri-research)
// and a scroll target inside its held shot, so a jump lands with the copy visible.
import { BEATS, SCROLL_LENGTHS } from './registry'
import { cumulativeRanges, type Range } from './scrollMath'
import { flightFractionToGlobal, OPENING_FRACTION } from './openingScroll'
import { segmentRange } from './openingStory'
import { SHOT_TRAVEL } from './cameraPath'
import { slugFor } from './storyView'

export { slugFor }

export function beatIndexForSlug(slug: string, ids: readonly string[] = BEATS.map((b) => b.id)): number {
  const clean = slug.replace(/^#/, '').toLowerCase()
  return ids.findIndex((id) => slugFor(id) === clean)
}

/** Where a jump to beat i lands: just into its hold, so the camera has settled and the copy is up. */
export const JUMP_LOCAL = SHOT_TRAVEL / 2 + 0.08

export function beatTargetProgress(index: number, ranges: Range[] = cumulativeRanges(SCROLL_LENGTHS)): number {
  const r = ranges[Math.max(0, Math.min(ranges.length - 1, index))]!
  return flightFractionToGlobal(r.start + (r.end - r.start) * JUMP_LOCAL)
}

/** `/my-story#choose` jumps to the choice of mass (decision 9.6). */
export const CHOOSE_HASH = '#choose'

/** Where `#choose` lands: the middle of the choice segment, with the control on screen. */
export function choiceTargetProgress(): number {
  const range = segmentRange('choice')
  return OPENING_FRACTION * ((range.start + range.end) / 2)
}

/** True while the choice of mass is on screen (opening progress inside the choice segment, before the hand-off). */
export function choiceOnScreen(opening: number, handoff: number): boolean {
  const range = segmentRange('choice')
  return handoff <= 0 && opening >= range.start && opening < range.end
}
