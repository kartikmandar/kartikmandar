import { describe, expect, it } from 'vitest'
import { EXPOSURE_RAMP_SECONDS, limitRamp } from '../art/anim'

describe('limitRamp', () => {
  it('takes at least the exposure ramp to cross its span, however sudden the jump', () => {
    const frame = 1 / 120
    let value = 0
    let frames = 0
    while (value < 1 && frames < 1000) {
      value = limitRamp(value, 1, frame)
      frames += 1
    }
    expect(frames * frame).toBeGreaterThanOrEqual(EXPOSURE_RAMP_SECONDS - 1e-9)
    expect(EXPOSURE_RAMP_SECONDS).toBeGreaterThanOrEqual(0.3)
  })

  it('limits a fall as well as a rise, and scales with the span', () => {
    expect(limitRamp(1, 0, 0.1)).toBeCloseTo(1 - 0.1 / EXPOSURE_RAMP_SECONDS)
    expect(limitRamp(0, 2, 0.1, 2)).toBeCloseTo(0.2 / EXPOSURE_RAMP_SECONDS)
  })

  it('follows a slow change exactly', () => {
    expect(limitRamp(0.5, 0.51, 1 / 60)).toBe(0.51)
  })

  it('snaps when nothing has been drawn yet, or the clock is frozen', () => {
    expect(limitRamp(NaN, 0.8, 1 / 60)).toBe(0.8)
    expect(limitRamp(0, 0.8, 0)).toBe(0.8)
  })
})
