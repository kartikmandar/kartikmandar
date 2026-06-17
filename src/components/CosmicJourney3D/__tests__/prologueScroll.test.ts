import { describe, it, expect } from 'vitest'
import { splitProgress, PROLOGUE_FRACTION, CROSSFADE_BAND } from '../prologueScroll'

describe('splitProgress', () => {
  const PF = 0.25
  const B = 0.05

  it('maps the prologue range to 0..1 prologueProgress', () => {
    expect(splitProgress(0, PF, B).prologueProgress).toBeCloseTo(0, 6)
    expect(splitProgress(PF / 2, PF, B).prologueProgress).toBeCloseTo(0.5, 6)
    expect(splitProgress(PF, PF, B).prologueProgress).toBeCloseTo(1, 6)
  })

  it('maps the flight range to 0..1 flightProgress and holds 0 during the prologue', () => {
    expect(splitProgress(0, PF, B).flightProgress).toBeCloseTo(0, 6)
    expect(splitProgress(PF, PF, B).flightProgress).toBeCloseTo(0, 6)
    expect(splitProgress((PF + 1) / 2, PF, B).flightProgress).toBeCloseTo(0.5, 6)
    expect(splitProgress(1, PF, B).flightProgress).toBeCloseTo(1, 6)
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
