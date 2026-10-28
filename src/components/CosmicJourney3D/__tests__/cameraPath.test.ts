import { describe, it, expect } from 'vitest'
import { cumulativeRanges } from '../scrollMath'
import { easedCurveU, flightCurveT, smootherstep } from '../cameraPath'

describe('smootherstep', () => {
  it('pins endpoints and has near-zero slope at the ends', () => {
    expect(smootherstep(0)).toBe(0)
    expect(smootherstep(1)).toBe(1)
    expect(smootherstep(0.5)).toBeCloseTo(0.5, 5)
    expect(smootherstep(0.02)).toBeLessThan(0.02) // slow start
  })
})

describe('easedCurveU', () => {
  const ranges = cumulativeRanges([100, 100, 100, 100]) // 4 beats

  it('is 0 at progress 0 and 1 at progress 1', () => {
    expect(easedCurveU(0, ranges)).toBeCloseTo(0, 6)
    expect(easedCurveU(1, ranges)).toBeCloseTo(1, 6)
  })

  it('n <= 1 branch: single-range array delegates to smootherstep', () => {
    const single = cumulativeRanges([100])
    expect(easedCurveU(0, single)).toBeCloseTo(smootherstep(0), 6)  // 0
    expect(easedCurveU(1, single)).toBeCloseTo(smootherstep(1), 6)  // 1
    expect(easedCurveU(0.5, single)).toBeCloseTo(smootherstep(0.5), 6)
  })

  it('maps each beat center to its station parameter on the curve', () => {
    // station i sits at curve param i/(N-1); beat-i center progress eases to it
    const centers = ranges.map((r) => (r.start + r.end) / 2)
    centers.forEach((c, i) => {
      expect(easedCurveU(c, ranges)).toBeCloseTo(i / (ranges.length - 1), 5)
    })
  })

  it('is monotonically non-decreasing across the scroll', () => {
    let prev = -1
    for (let p = 0; p <= 1.00001; p += 0.01) {
      const u = easedCurveU(p, ranges)
      expect(u).toBeGreaterThanOrEqual(prev - 1e-9)
      prev = u
    }
  })
})

describe('flightCurveT', () => {
  const ranges = cumulativeRanges([100, 120, 100, 160]) // 4 stations → 6 control points

  it('lands each beat center exactly on its station control point', () => {
    const centers = ranges.map((r) => (r.start + r.end) / 2)
    centers.forEach((c, i) => {
      expect(flightCurveT(c, ranges)).toBeCloseTo((i + 1) / (ranges.length + 1), 6)
    })
  })

  it('starts at the origin and ends at the nebula', () => {
    expect(flightCurveT(0, ranges)).toBe(0)
    expect(flightCurveT(1, ranges)).toBeCloseTo(1, 6)
  })

  it('is monotonic and continuous across the whole flight', () => {
    let prev = -1
    for (let p = 0; p <= 1.000001; p += 0.0025) {
      const t = flightCurveT(p, ranges)
      expect(t).toBeGreaterThanOrEqual(prev - 1e-9)
      if (prev >= 0) expect(t - prev).toBeLessThan(0.02)
      prev = t
    }
  })
})
