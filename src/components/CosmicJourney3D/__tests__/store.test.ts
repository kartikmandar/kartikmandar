import { describe, it, expect } from 'vitest'
import { cumulativeRanges } from '../scrollMath'
import { createJourneyFrame, writeBeatProgress } from '../store'

describe('writeBeatProgress', () => {
  const ranges = cumulativeRanges([100, 100, 200]) // [0,.25] [.25,.5] [.5,1]

  it('gives past beats 1, future beats 0 and the active beat its local progress', () => {
    const out = new Float32Array(3)
    const active = writeBeatProgress(0.375, ranges, out)
    expect(active).toBe(1)
    expect(Array.from(out)).toEqual([1, 0.5, 0])
  })

  it('handles both ends of the flight', () => {
    const out = new Float32Array(3)
    expect(writeBeatProgress(0, ranges, out)).toBe(0)
    expect(Array.from(out)).toEqual([0, 0, 0])
    expect(writeBeatProgress(1, ranges, out)).toBe(2)
    expect(Array.from(out)).toEqual([1, 1, 1])
  })

  it('clamps out-of-range progress and agrees with locate() at boundaries', () => {
    const out = new Float32Array(3)
    expect(writeBeatProgress(-2, ranges, out)).toBe(0)
    expect(writeBeatProgress(0.5, ranges, out)).toBe(2) // boundary belongs to the next beat, like locate()
    expect(out[2]).toBe(0)
  })

  it('writes into a larger shared buffer without touching the tail', () => {
    const frame = createJourneyFrame(8)
    frame.local.fill(9)
    writeBeatProgress(0.75, ranges, frame.local)
    expect(Array.from(frame.local.slice(0, 3))).toEqual([1, 1, 0.5])
    expect(frame.local[3]).toBe(9)
  })
})
