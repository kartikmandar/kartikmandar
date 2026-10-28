import { describe, it, expect } from 'vitest'
import { splitProgress, PROLOGUE_FRACTION, CROSSFADE_BAND, flightFractionToGlobal, flightStart, pageScrollVh } from '../prologueScroll'

describe('splitProgress', () => {
  const PF = 0.25
  const B = 0.05

  it('maps the prologue range to 0..1 prologueProgress', () => {
    expect(splitProgress(0, PF, B).prologueProgress).toBeCloseTo(0, 6)
    expect(splitProgress(PF / 2, PF, B).prologueProgress).toBeCloseTo(0.5, 6)
    expect(splitProgress(PF, PF, B).prologueProgress).toBeCloseTo(1, 6)
  })

  it('holds the flight at 0 through the prologue and the whole hand-off band, then maps to 0..1', () => {
    const start = PF + B
    expect(splitProgress(0, PF, B).flightProgress).toBeCloseTo(0, 6)
    expect(splitProgress(PF, PF, B).flightProgress).toBeCloseTo(0, 6)
    expect(splitProgress(start, PF, B).flightProgress).toBeCloseTo(0, 6)
    expect(splitProgress((start + 1) / 2, PF, B).flightProgress).toBeCloseTo(0.5, 6)
    expect(splitProgress(1, PF, B).flightProgress).toBeCloseTo(1, 6)
  })

  it('never starts the flight before the prologue has fully dissolved', () => {
    for (let g = 0; g <= 1; g += 0.005) {
      const s = splitProgress(g, PF, B)
      if (s.flightProgress > 0) expect(s.crossfade).toBe(1)
    }
  })

  it('crossfade is 0 well before the band and 1 well after', () => {
    expect(splitProgress(PF - B, PF, B).crossfade).toBeCloseTo(0, 6)
    expect(splitProgress(PF + B, PF, B).crossfade).toBeCloseTo(1, 6)
    expect(splitProgress(0, PF, B).crossfade).toBe(0)
    expect(splitProgress(1, PF, B).crossfade).toBe(1)
  })

  it('inPrologue flips at the fraction', () => {
    expect(splitProgress(PF - 0.01, PF, B).inPrologue).toBe(true)
    expect(splitProgress(PF + 0.01, PF, B).inPrologue).toBe(false)
  })

  it('exposes sane defaults', () => {
    expect(PROLOGUE_FRACTION).toBeGreaterThan(0)
    expect(PROLOGUE_FRACTION).toBeLessThan(0.5)
    expect(CROSSFADE_BAND).toBeGreaterThan(0)
  })
})

describe('flightFractionToGlobal', () => {
  it('maps 0 to the flight start (after the hand-off band)', () => {
    expect(flightFractionToGlobal(0)).toBeCloseTo(flightStart(), 6)
    expect(flightStart()).toBeCloseTo(PROLOGUE_FRACTION + CROSSFADE_BAND, 6)
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
  it('keeps the flight at its full length after reserving the prologue and hand-off', () => {
    expect(pageScrollVh(100)).toBeCloseTo(100 / (1 - flightStart()), 6)
  })

  it('accepts a custom prologueFraction and band', () => {
    expect(pageScrollVh(100, 0.25, 0.05)).toBeCloseTo(100 / 0.7, 6)
  })
})
