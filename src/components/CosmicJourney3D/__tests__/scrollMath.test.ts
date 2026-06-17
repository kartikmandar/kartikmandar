import { describe, it, expect } from 'vitest'
import { cumulativeRanges, locate, chapterOffset } from '../scrollMath'

describe('cumulativeRanges', () => {
  it('normalizes lengths into contiguous [0,1] ranges', () => {
    const r = cumulativeRanges([100, 100, 200]) // total 400
    expect(r[0]).toEqual({ start: 0, end: 0.25 })
    expect(r[1]).toEqual({ start: 0.25, end: 0.5 })
    expect(r[2]).toEqual({ start: 0.5, end: 1 })
  })
})

describe('locate', () => {
  const ranges = cumulativeRanges([100, 100, 200])

  it('maps a global progress to the right beat and a full 0..1 local', () => {
    expect(locate(0, ranges)).toEqual({ index: 0, local: 0 })
    expect(locate(0.125, ranges)).toEqual({ index: 0, local: 0.5 })
    expect(locate(0.5, ranges)).toEqual({ index: 2, local: 0 })
    expect(locate(0.75, ranges)).toEqual({ index: 2, local: 0.5 }) // tall finale still sees full range
    expect(locate(1, ranges)).toEqual({ index: 2, local: 1 })
  })

  it('clamps out-of-range progress', () => {
    expect(locate(-0.2, ranges)).toEqual({ index: 0, local: 0 })
    expect(locate(1.5, ranges)).toEqual({ index: 2, local: 1 })
  })

  it('a short beat still traverses local 0..1 (edge-case the old build broke)', () => {
    const r2 = cumulativeRanges([120, 100, 100, 100]) // first beat short relative to a tall finale
    expect(locate(r2[0]!.start, r2)).toEqual({ index: 0, local: 0 })
    expect(locate((r2[0]!.start + r2[0]!.end) / 2, r2).local).toBeCloseTo(0.5, 5)
    expect(locate(r2[0]!.end - 1e-9, r2).index).toBe(0)
  })
})

describe('chapterOffset', () => {
  it('returns the start of a beat for click-to-jump', () => {
    const ranges = cumulativeRanges([100, 100, 200])
    expect(chapterOffset(1, ranges)).toBeCloseTo(0.25, 5)
    expect(chapterOffset(2, ranges)).toBeCloseTo(0.5, 5)
  })
})
