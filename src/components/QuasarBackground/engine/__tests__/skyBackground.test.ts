import { describe, it, expect } from 'vitest'
import { HalfFloatType, UnsignedByteType } from 'three'
import { resolveBakeType } from '../background'
import { buildSkyFragment, GALACTIC_BASIS, HERO_STARS, SKY_SEED } from '../shaders/sky.frag'

describe('resolveBakeType', () => {
  it('WebGL2 + float color buffer gets the HDR half-float target', () => {
    expect(resolveBakeType(true, true)).toBe(HalfFloatType)
  })

  it('missing float color buffer falls back to bytes', () => {
    expect(resolveBakeType(true, false)).toBe(UnsignedByteType)
  })

  it('missing WebGL2 falls back to bytes', () => {
    expect(resolveBakeType(false, true)).toBe(UnsignedByteType)
  })

  it('neither capability falls back to bytes', () => {
    expect(resolveBakeType(false, false)).toBe(UnsignedByteType)
  })
})

describe('HERO_STARS', () => {
  it('has the 12 art-directed entries of the spec', () => {
    expect(HERO_STARS).toHaveLength(12)
  })

  it('directions are unit vectors', () => {
    for (const star of HERO_STARS) {
      const [x, y, z] = star.dir
      expect(Math.hypot(x, y, z)).toBeCloseTo(1, 5)
    }
  })

  it('fluxes are HDR (above bloom threshold) within the spec range 1.5-4.0', () => {
    for (const star of HERO_STARS) {
      expect(star.flux).toBeGreaterThanOrEqual(1.5)
      expect(star.flux).toBeLessThanOrEqual(4.0)
    }
  })

  it('temperatures are normalized for the blackbody ramp', () => {
    for (const star of HERO_STARS) {
      expect(star.temp).toBeGreaterThanOrEqual(0)
      expect(star.temp).toBeLessThanOrEqual(1)
    }
  })
})

describe('GALACTIC_BASIS', () => {
  const { u, pole, v } = GALACTIC_BASIS
  const dot = (a: readonly number[], b: readonly number[]) =>
    a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!

  it('basis vectors are unit length', () => {
    for (const vec of [u, pole, v]) {
      expect(Math.hypot(...vec)).toBeCloseTo(1, 6)
    }
  })

  it('basis vectors are mutually orthogonal', () => {
    expect(dot(u, pole)).toBeCloseTo(0, 6)
    expect(dot(u, v)).toBeCloseTo(0, 6)
    expect(dot(pole, v)).toBeCloseTo(0, 6)
  })
})

describe('buildSkyFragment', () => {
  it('is deterministic — the fixed-seed sky is identical on every build', () => {
    expect(buildSkyFragment()).toBe(buildSkyFragment())
  })

  it('injects the seed literal', () => {
    expect(buildSkyFragment()).toContain(SKY_SEED.toFixed(5))
  })

  it('unrolls one heroStar call per HERO_STARS entry', () => {
    const frag = buildSkyFragment()
    const calls = frag.match(/heroStar\(/g) ?? []
    // one definition reference is the function itself; the rest are calls
    expect(calls.length).toBeGreaterThanOrEqual(HERO_STARS.length)
    for (const star of HERO_STARS) {
      expect(frag).toContain(star.flux.toFixed(5))
    }
  })

  it('contains no formatting accidents from codegen', () => {
    const frag = buildSkyFragment()
    expect(frag).not.toContain('NaN')
    expect(frag).not.toContain('undefined')
    expect(frag).not.toContain('Infinity')
  })
})
