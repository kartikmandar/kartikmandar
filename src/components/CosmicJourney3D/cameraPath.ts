import type { Range } from './scrollMath'

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
  if (p <= centers[0]) return 0
  if (p >= centers[n - 1]) return 1
  let i = 0
  while (i < n - 1 && !(p >= centers[i] && p <= centers[i + 1])) i++
  const t = (p - centers[i]) / (centers[i + 1] - centers[i] || 1)
  return (i + smootherstep(t)) / (n - 1)
}
