// src/components/CosmicJourney3D/navigation.ts
// Deep links and jumps: every beat has a stable URL slug (/my-story#rri-research)
// and a scroll target inside its held shot, so a jump lands with the copy visible.
import { BEATS, SCROLL_LENGTHS } from './registry'
import { cumulativeRanges, type Range } from './scrollMath'
import { flightFractionToGlobal } from './prologueScroll'
import { SHOT_TRAVEL } from './cameraPath'

/** Beat id → URL slug: drop the legacy "-section"/"-wrapper" suffixes. */
export function slugFor(id: string): string {
  return id.replace(/-wrapper$/, '').replace(/-section$/, '')
}

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
