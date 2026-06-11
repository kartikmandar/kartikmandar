import { describe, it, expect } from 'vitest'
import { derivePhaseUniforms } from '../phaseUniforms'
import { Phase, CONSTANTS } from '../types'

describe('derivePhaseUniforms', () => {
  it('STAR: full-size star, nothing else active', () => {
    const u = derivePhaseUniforms({ phase: Phase.STAR, progress: 0 })
    expect(u.starRadius).toBe(CONSTANTS.STAR_RADIUS)
    expect(u.flash).toBe(0)
    expect(u.lensing).toBe(0)
    expect(u.ignition).toBe(0)
    expect(u.shellRadius).toBe(0)
  })

  it('is continuous across COLLAPSE -> FLASH (star radius)', () => {
    const end = derivePhaseUniforms({ phase: Phase.COLLAPSE, progress: 1 })
    const start = derivePhaseUniforms({ phase: Phase.FLASH, progress: 0 })
    expect(start.starRadius).toBeCloseTo(end.starRadius, 5)
  })

  it('is continuous across FLASH -> SHELL (shell radius)', () => {
    const end = derivePhaseUniforms({ phase: Phase.FLASH, progress: 1 })
    const start = derivePhaseUniforms({ phase: Phase.SHELL, progress: 0 })
    expect(start.shellRadius).toBeCloseTo(end.shellRadius, 5)
  })

  it('FLASH peaks at entry and decays', () => {
    const a = derivePhaseUniforms({ phase: Phase.FLASH, progress: 0 })
    const b = derivePhaseUniforms({ phase: Phase.FLASH, progress: 1 })
    expect(a.flash).toBeGreaterThan(2)
    expect(b.flash).toBeCloseTo(0, 3)
  })

  it('SHELL decelerates (Sedov-like): first half covers most of the radius', () => {
    const half = derivePhaseUniforms({ phase: Phase.SHELL, progress: 0.5 })
    const full = derivePhaseUniforms({ phase: Phase.SHELL, progress: 1 })
    expect(half.shellRadius).toBeGreaterThan(0.6 * full.shellRadius)
  })

  it('BIRTH ramps lensing and ignition together from 0 to 1', () => {
    const mid = derivePhaseUniforms({ phase: Phase.BIRTH, progress: 0.5 })
    expect(mid.lensing).toBeCloseTo(0.5, 5)
    expect(mid.ignition).toBeCloseTo(0.5, 5)
    expect(mid.starRadius).toBe(0)
  })

  it('QUASAR: steady state', () => {
    const u = derivePhaseUniforms({ phase: Phase.QUASAR, progress: 1 })
    expect(u).toEqual({
      starRadius: 0,
      shellRadius: 0,
      flash: 0,
      lensing: 1,
      ignition: 1,
    })
  })

  it('is continuous across STAR -> COLLAPSE', () => {
    const end = derivePhaseUniforms({ phase: Phase.STAR, progress: 0 })
    const start = derivePhaseUniforms({ phase: Phase.COLLAPSE, progress: 0 })
    expect(start).toEqual(end)
  })

  it('is continuous across SHELL -> BIRTH (shell radius)', () => {
    const end = derivePhaseUniforms({ phase: Phase.SHELL, progress: 1 })
    const start = derivePhaseUniforms({ phase: Phase.BIRTH, progress: 0 })
    expect(start.shellRadius).toBeCloseTo(end.shellRadius, 5)
  })

  it('is continuous across BIRTH -> QUASAR for lensing/ignition (shellRadius intentionally resets)', () => {
    const end = derivePhaseUniforms({ phase: Phase.BIRTH, progress: 1 })
    const start = derivePhaseUniforms({ phase: Phase.QUASAR, progress: 1 })
    expect(start.lensing).toBeCloseTo(end.lensing, 5)
    expect(start.ignition).toBeCloseTo(end.ignition, 5)
    // shellRadius jumps 40 -> 0 by design; shader alpha is 0 by end of BIRTH.
  })
})
