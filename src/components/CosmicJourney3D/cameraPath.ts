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

// Whether beat `index` draws. The active beat always does. A neighbour draws only
// while the camera travels to or from it, so a held shot shows just its own scene.
export function beatVisible(index: number, active: number, activeLocal: number): boolean {
  if (index === active) return true
  if (index === active - 1) return activeLocal < SHOT_TRAVEL / 2
  if (index === active + 1) return activeLocal > 1 - SHOT_TRAVEL / 2
  return false
}

const FOV_LANDSCAPE = 60
const FOV_PORTRAIT_MAX = 100
/** Narrower than this, the fixed vertical field of view starts cropping scenes at the sides. */
const FULL_WIDTH_ASPECT = 1.2

/** Vertical field of view that keeps a scene's width in frame on portrait screens. */
export function baseFov(aspect: number): number {
  if (aspect >= FULL_WIDTH_ASPECT) return FOV_LANDSCAPE
  const halfWidth = Math.tan((FOV_LANDSCAPE * Math.PI) / 360) * FULL_WIDTH_ASPECT
  const fov = (2 * Math.atan(halfWidth / Math.max(aspect, 0.1)) * 180) / Math.PI
  return Math.min(FOV_PORTRAIT_MAX, fov)
}

/** How far to lift the image on portrait screens (fraction of height), so the art clears the copy below it. */
export function portraitLift(aspect: number): number {
  return aspect < 0.8 ? 0.16 : 0
}
