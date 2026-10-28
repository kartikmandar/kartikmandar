import { describe, it, expect } from 'vitest'
import { progressForScroll, scrollForProgress } from '../scrollEngine'

describe('scroll <-> progress', () => {
  const track = { top: 200, height: 10200 } // 10000px of travel at a 200px viewport
  it('maps the track ends to 0 and 1, clamped outside', () => {
    expect(progressForScroll(200, 200, track)).toBe(0)
    expect(progressForScroll(10200, 200, track)).toBe(1)
    expect(progressForScroll(0, 200, track)).toBe(0)
    expect(progressForScroll(99999, 200, track)).toBe(1)
  })
  it('round-trips', () => {
    for (const p of [0, 0.123, 0.5, 0.9, 1]) {
      expect(progressForScroll(scrollForProgress(p, 200, track), 200, track)).toBeCloseTo(p, 9)
    }
  })
})
