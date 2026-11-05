import { describe, it, expect } from 'vitest'
import { splitProgress, OPENING_FRACTION, HANDOFF_BAND, HANDOFF_ARRIVE, flightFractionToGlobal, flightStart, handoffFogClear, handoffPresence, pageScrollVh } from '../openingScroll'

describe('splitProgress', () => {
  const OF = 0.25
  const B = 0.05

  it('maps the opening range to 0..1 openingProgress', () => {
    expect(splitProgress(0, OF, B).openingProgress).toBeCloseTo(0, 6)
    expect(splitProgress(OF / 2, OF, B).openingProgress).toBeCloseTo(0.5, 6)
    expect(splitProgress(OF, OF, B).openingProgress).toBeCloseTo(1, 6)
  })

  it('holds the flight at 0 through the opening and the whole hand-off band, then maps to 0..1', () => {
    const start = OF + B
    expect(splitProgress(0, OF, B).flightProgress).toBeCloseTo(0, 6)
    expect(splitProgress(OF, OF, B).flightProgress).toBeCloseTo(0, 6)
    expect(splitProgress(start, OF, B).flightProgress).toBeCloseTo(0, 6)
    expect(splitProgress((start + 1) / 2, OF, B).flightProgress).toBeCloseTo(0.5, 6)
    expect(splitProgress(1, OF, B).flightProgress).toBeCloseTo(1, 6)
  })

  it('never starts the flight before the hand-off has finished', () => {
    for (let g = 0; g <= 1; g += 0.005) {
      const s = splitProgress(g, OF, B)
      if (s.flightProgress > 0) {
        expect(s.handoff).toBe(1)
        expect(s.inOpening).toBe(false)
      }
    }
  })

  it('runs the hand-off 0..1 across the band, after the opening', () => {
    expect(splitProgress(OF - 0.01, OF, B).handoff).toBe(0)
    expect(splitProgress(OF, OF, B).handoff).toBeCloseTo(0, 6)
    expect(splitProgress(OF + B / 2, OF, B).handoff).toBeCloseTo(0.5, 6)
    expect(splitProgress(OF + B, OF, B).handoff).toBeCloseTo(1, 6)
    expect(splitProgress(1, OF, B).handoff).toBe(1)
  })

  it('stays in the opening until the flight starts', () => {
    expect(splitProgress(OF + B / 2, OF, B).inOpening).toBe(true)
    expect(splitProgress(OF + B + 0.01, OF, B).inOpening).toBe(false)
  })

  it('keeps the flight starting where the black hole prologue left it, so beat positions are unchanged', () => {
    expect(OPENING_FRACTION + HANDOFF_BAND).toBeCloseTo(0.26, 12)
    expect(OPENING_FRACTION).toBeGreaterThan(0)
    expect(HANDOFF_BAND).toBeGreaterThan(0)
  })
})

describe('flightFractionToGlobal', () => {
  it('maps 0 to the flight start (after the hand-off band)', () => {
    expect(flightFractionToGlobal(0)).toBeCloseTo(flightStart(), 6)
    expect(flightStart()).toBeCloseTo(OPENING_FRACTION + HANDOFF_BAND, 6)
  })

  it('maps 1 to 1', () => {
    expect(flightFractionToGlobal(1)).toBeCloseTo(1, 6)
  })

  it('maps midpoint correctly', () => {
    const expected = flightStart() + (1 - flightStart()) * 0.5
    expect(flightFractionToGlobal(0.5)).toBeCloseTo(expected, 6)
  })

  it('clamps values below 0', () => {
    expect(flightFractionToGlobal(-0.5)).toBeCloseTo(flightStart(), 6)
  })

  it('clamps values above 1', () => {
    expect(flightFractionToGlobal(1.5)).toBeCloseTo(1, 6)
  })
})

describe('pageScrollVh', () => {
  it('keeps the flight at its full length after reserving the opening and hand-off', () => {
    expect(pageScrollVh(100)).toBeCloseTo(100 / (1 - flightStart()), 6)
  })

  it('accepts a custom openingFraction and band', () => {
    expect(pageScrollVh(100, 0.25, 0.05)).toBeCloseTo(100 / 0.7, 6)
  })
})

describe('the hand-off band', () => {
  it('lets the opening scene recede before the camera arrives, leaving a night-sky hold', () => {
    expect(handoffPresence(0)).toBe(1)
    expect(handoffPresence(HANDOFF_ARRIVE)).toBe(0)
    expect(handoffPresence(1)).toBe(0)
  })

  it('clears the fog only through the end of the hold, so the first station never pops in', () => {
    expect(handoffFogClear(HANDOFF_ARRIVE - 0.1)).toBe(0)
    expect(handoffFogClear(1)).toBe(1)
    for (let h = 0; h < 1; h += 0.01) expect(handoffFogClear(h + 0.01)).toBeGreaterThanOrEqual(handoffFogClear(h))
  })
})
