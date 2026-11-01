import { describe, it, expect } from 'vitest'
import { cumulativeRanges } from '../scrollMath'
import { easedCurveU, flightCurveT, holdProgress, shotCurveT, smootherstep, beatVisible } from '../cameraPath'

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

describe('shotCurveT (dwell plateaus)', () => {
  const ranges = cumulativeRanges([100, 120, 100, 160])
  const n = ranges.length
  const station = (i: number) => (i + 1) / (n + 1)

  it('holds the camera exactly on each station through the middle of its beat', () => {
    ranges.forEach((r, i) => {
      const span = r.end - r.start
      for (const l of [0.16, 0.3, 0.5, 0.7, 0.84]) {
        expect(shotCurveT(r.start + span * l, ranges)).toBeCloseTo(station(i), 9)
      }
    })
  })

  it('starts at the origin and ends at the nebula', () => {
    expect(shotCurveT(0, ranges)).toBe(0)
    expect(shotCurveT(1, ranges)).toBeCloseTo(1, 9)
  })

  it('is continuous across beat boundaries and monotonic overall', () => {
    let prev = -1
    for (let p = 0; p <= 1.000001; p += 0.001) {
      const t = shotCurveT(p, ranges)
      expect(t).toBeGreaterThanOrEqual(prev - 1e-9)
      if (prev >= 0) expect(t - prev).toBeLessThan(0.02)
      prev = t
    }
  })
})

describe('holdProgress', () => {
  it('is 0 while arriving, 1 while departing, linear through the hold', () => {
    expect(holdProgress(0.1)).toBe(0)
    expect(holdProgress(0.5)).toBeCloseTo(0.5, 9)
    expect(holdProgress(0.9)).toBe(1)
  })
})

describe('beatVisible', () => {
  it('always draws the active beat and never distant ones', () => {
    expect(beatVisible(5, 5, 0.5)).toBe(true)
    expect(beatVisible(3, 5, 0.01)).toBe(false)
    expect(beatVisible(7, 5, 0.99)).toBe(false)
  })

  it('hides both neighbours during a held shot', () => {
    expect(beatVisible(4, 5, 0.5)).toBe(false)
    expect(beatVisible(6, 5, 0.5)).toBe(false)
  })

  it('shows the neighbour the camera is travelling from or to', () => {
    expect(beatVisible(4, 5, 0.05)).toBe(true)
    expect(beatVisible(6, 5, 0.95)).toBe(true)
  })
})
