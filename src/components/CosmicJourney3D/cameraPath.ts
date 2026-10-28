import { locate, type Range } from './scrollMath'

export function smootherstep(t: number): number {
  const x = Math.max(0, Math.min(1, t))
  return x * x * x * (x * (x * 6 - 15) + 10)
}

// Map global scroll progress -> CatmullRom curve parameter u in [0,1].
// Station i sits at u = i/(N-1), reached at the CENTER of beat i's scroll range.
// Between adjacent centers, u eases with smootherstep (slow arrival + departure).
export function easedCurveU(progress: number, ranges: Range[]): number {
  const n = ranges.length
  if (n <= 1) return smootherstep(progress)
  const p = Math.max(0, Math.min(1, progress))
  const centers = ranges.map((r) => (r.start + r.end) / 2)
  // centers[0] and centers[n-1] are in-bounds: n >= 2 (guarded above)
  if (p <= centers[0]!) return 0
  if (p >= centers[n - 1]!) return 1
  let i = 0
  // centers[i] and centers[i+1] are in-bounds: loop only runs while i < n-1
  while (i < n - 1 && !(p >= centers[i]! && p <= centers[i + 1]!)) i++
  const t = (p - centers[i]!) / (centers[i + 1]! - centers[i]! || 1)
  return (i + smootherstep(t)) / (n - 1)
}

// Curve parameter t for a CatmullRom built from [origin, ...stations, nebula]
// (n stations → n + 2 control points), sampled with getPoint (not getPointAt):
// getPoint(k / (n + 1)) lands exactly on control point k, so every beat's
// center lands the camera exactly on its station. Before the first center the
// camera eases in from the origin; after the last it eases out to the nebula.
export function flightCurveT(progress: number, ranges: Range[]): number {
  const n = ranges.length
  if (n === 0) return smootherstep(progress)
  const segments = n + 1
  const p = Math.max(0, Math.min(1, progress))
  const first = (ranges[0]!.start + ranges[0]!.end) / 2
  const last = (ranges[n - 1]!.start + ranges[n - 1]!.end) / 2
  if (p <= first) return smootherstep(first > 0 ? p / first : 1) / segments
  if (p >= last) return (n + smootherstep(last < 1 ? (p - last) / (1 - last) : 1)) / segments
  return (1 + easedCurveU(p, ranges) * (n - 1)) / segments
}

/** Fraction of each beat's scroll spent travelling (half arriving, half departing). The rest is a held shot. */
export const SHOT_TRAVEL = 0.3

// Shot schedule over the same [origin, ...stations, nebula] curve as flightCurveT
// (getPoint parameter). Each beat is: arrive (first travel/2) → HOLD on its
// station (the middle 1 - travel) → depart (last travel/2). Travel between
// neighbours spans their shared boundary, so the camera never stops mid-air.
// The first beat arrives from the origin; the last departs to the nebula.
export function shotCurveT(progress: number, ranges: Range[], travel: number = SHOT_TRAVEL): number {
  const n = ranges.length
  if (n === 0) return smootherstep(progress)
  const segments = n + 1
  const { index: i, local: l } = locate(progress, ranges)
  const half = travel / 2
  let u: number // control-point index: 0 origin, i + 1 station i, n + 1 nebula
  if (l < half) {
    u = i === 0 ? smootherstep(l / half) : i + smootherstep((l + half) / travel)
  } else if (l > 1 - half) {
    u = i === n - 1 ? n + smootherstep((l - (1 - half)) / half) : i + 1 + smootherstep((l - (1 - half)) / travel)
  } else {
    u = i + 1
  }
  return u / segments
}

/** 0..1 progress through a beat's held shot (0 while arriving, 1 once departing). */
export function holdProgress(local: number, travel: number = SHOT_TRAVEL): number {
  const half = travel / 2
  return Math.max(0, Math.min(1, (local - half) / (1 - travel)))
}
