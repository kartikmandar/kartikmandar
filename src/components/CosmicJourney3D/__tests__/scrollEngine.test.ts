import { describe, it, expect } from 'vitest'
import { progressForScroll, scrollForProgress, steadyViewportHeight } from '../scrollEngine'

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

describe('steadyViewportHeight', () => {
  it('ignores an address bar sliding away', () => {
    expect(steadyViewportHeight(390, 664)).toBe(664)
    expect(steadyViewportHeight(390, 750)).toBe(664)
    expect(steadyViewportHeight(390, 700)).toBe(664)
  })

  it('follows a rotation or a real resize', () => {
    expect(steadyViewportHeight(390, 664)).toBe(664)
    expect(steadyViewportHeight(844, 340)).toBe(340)
    expect(steadyViewportHeight(844, 900)).toBe(900)
  })
})
