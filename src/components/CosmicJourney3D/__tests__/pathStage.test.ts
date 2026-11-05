import { describe, expect, it } from 'vitest'
import { createPathStar, createSunPath, pathStar, steadyStar, sunPath, SUN_GIANT_RADIUS, type SunPathState } from '../pathStage'

const sun = (t: number, time = 0): SunPathState => ({ ...sunPath(t, time, createSunPath()) })
const line = (k: number) => k / 7
/** The first path progress where `key` passes `threshold`. */
const firstAbove = (key: keyof SunPathState, threshold = 0.5) => {
  for (let t = 0; t <= 1; t += 0.001) if (sun(t)[key] > threshold) return t
  return 1
}

describe("the Sun's path", () => {
  it('starts as the steady star the ignition left', () => {
    const steady = steadyStar(5800, createPathStar())
    const start = sun(0)
    for (const key of Object.keys(steady) as (keyof typeof steady)[]) expect(start[key]).toBeCloseTo(steady[key], 6)
  })

  it('starts from the chosen mass’s own colour', () => {
    expect(sunPath(0, 0, createSunPath(), 9000).temperature).toBe(9000)
  })

  it('stays steady through its first line', () => {
    expect(sun(line(1) - 0.001).bodyOpacity).toBe(0)
  })

  it('follows the copy: giant, flash, second swelling, nebula, white dwarf, cooling', () => {
    expect(firstAbove('bodyOpacity')).toBeGreaterThan(line(1))
    expect(firstAbove('bodyOpacity')).toBeLessThan(line(2))
    expect(firstAbove('flash')).toBeGreaterThan(line(2))
    expect(firstAbove('flash')).toBeLessThan(line(3))
    expect(firstAbove('shed')).toBeGreaterThan(line(3))
    expect(firstAbove('shed')).toBeLessThan(line(4))
    expect(firstAbove('ionized')).toBeGreaterThan(line(4))
    expect(firstAbove('ionized')).toBeLessThan(line(5))
  })

  it('turns red as a giant and very hot once the bare core shows', () => {
    expect(sun(line(2)).temperature).toBeLessThan(4000)
    expect(sun(line(4) + 0.5 / 7).temperature).toBeGreaterThan(30000)
  })

  it('swallows the inner planets but not the outer ones', () => {
    const end = sun(1)
    expect(end.engulf).toBeGreaterThan(0.86)
    expect(end.engulf).toBeLessThan(1.1)
    expect(SUN_GIANT_RADIUS).toBeGreaterThan(0.86)
    expect(end.orbitScale).toBeGreaterThan(1)
  })

  it('keeps the helium flash hidden at the surface: the giant does not change during it', () => {
    const before = sun(line(2) + 0.2 / 7)
    const during = sun(line(2) + 0.5 / 7)
    expect(during.flash).toBeGreaterThan(0.9)
    expect(during.body).toBeCloseTo(before.body, 6)
    expect(during.temperature).toBeCloseTo(before.temperature, 6)
  })

  it('lets the nebula fade, and leaves a cooling white dwarf', () => {
    const end = sun(1)
    expect(end.nebula).toBe(0)
    expect(end.bodyOpacity).toBe(0)
    expect(end.glow).toBeLessThan(sun(line(5) + 0.6 / 7).glow)
    expect(end.temperature).toBeLessThan(sun(line(6)).temperature)
  })

  it('only pulses the second swelling while time runs (reduced motion stays still)', () => {
    const t = line(4) - 0.1 / 7
    expect(sun(t, 0).body).toBe(sun(t, 0).body)
    expect(sun(t, 0.7).body).not.toBe(sun(t, 0).body)
  })
})

describe('paths not drawn yet', () => {
  it('hold the steady star', () => {
    const state = pathStar('massive', 0.5, 0, 31000, createSunPath())
    expect(state).toMatchObject({ temperature: 31000, glow: 1, body: 0, engulf: 0, orbitScale: 1 })
  })
})
