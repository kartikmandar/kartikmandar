import { describe, it, expect } from 'vitest'
import { diveState, DIVE_SCALE, MAX_SWELL, PROLOGUE_BASE_SCALE, prologueScale } from '../prologueDive'

describe('diveState', () => {
  it('is the untouched prologue before the hand-off', () => {
    expect(diveState(0)).toEqual({ dive: 0, opacity: 1, exposure: 1, fov: 60, covers: true })
  })

  it('has fully revealed the flight at the end of the band', () => {
    const s = diveState(1)
    expect(s.opacity).toBe(0)
    expect(s.covers).toBe(false)
    expect(s.dive).toBe(1)
    expect(s.exposure).toBeCloseTo(1, 6)
  })

  it('keeps covering the flight until the dive is mostly done', () => {
    expect(diveState(0.5).covers).toBe(true)
    expect(diveState(0.7).covers).toBe(false)
  })

  it('swells smoothly and never exceeds the cap (no flash)', () => {
    let prev = diveState(0).exposure
    let peak = 0
    for (let c = 0; c <= 1.0001; c += 0.005) {
      const e = diveState(c).exposure
      expect(e).toBeLessThanOrEqual(MAX_SWELL + 1e-9)
      expect(Math.abs(e - prev)).toBeLessThan(0.05) // gradual ramp at any scroll speed resolution
      peak = Math.max(peak, e)
      prev = e
    }
    expect(peak).toBeGreaterThan(MAX_SWELL - 0.05)
  })

  it('clamps out-of-range input', () => {
    expect(diveState(-1)).toEqual(diveState(0))
    expect(diveState(2)).toEqual(diveState(1))
  })
})

describe('prologueScale', () => {
  it('renders the prologue at the tier base scale', () => {
    expect(prologueScale('high', 0)).toBe(PROLOGUE_BASE_SCALE.high)
    expect(prologueScale('mobile', 0)).toBe(PROLOGUE_BASE_SCALE.mobile)
  })
  it('drops to the dive scale under the swell, never above the tier base', () => {
    expect(prologueScale('high', 0.5)).toBe(DIVE_SCALE)
    expect(prologueScale('mobile', 0.5)).toBe(Math.min(PROLOGUE_BASE_SCALE.mobile, DIVE_SCALE))
  })
})
