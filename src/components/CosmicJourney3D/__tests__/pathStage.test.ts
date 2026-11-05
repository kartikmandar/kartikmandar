import { describe, expect, it } from 'vitest'
import {
  createMassivePath, createPathStar, createPathStates, createSunPath, createVeryMassivePath, createRedDwarfPath, redDwarfPath, createBrownDwarfPath, brownDwarfPath, BROWN_DWARF_RADIUS, BROWN_DWARF_COLD_KELVIN, createFirstStarsPath, firstStarsPath, skyDensity, FIRST_STAR_RADIUS, BLAST_REACH, pathCameraZoom, RED_DWARF_RADIUS, massivePath, pathStar, steadyStar, sunPath, veryMassivePath,
  SHOCK_REACH, STALLED_SHOCK, SUN_GIANT_RADIUS, SUPERGIANT_RADIUS, type SunPathState,
} from '../pathStage'

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

describe('the massive path', () => {
  const massive = (t: number) => ({ ...massivePath(t, 0, createMassivePath()) })
  const at = (k: number, within = 0.5) => (k + within) / 5

  it('starts as the steady blue star the ignition left', () => {
    expect(massive(0)).toMatchObject({ temperature: 31000, glow: 1, glowSize: 1, body: 0, shock: 0, pulsar: 0 })
  })

  it('becomes a cool red supergiant, cut open to its shells, by the end of line 25', () => {
    const late = massive(at(1, 0.95))
    expect(late.body).toBeCloseTo(SUPERGIANT_RADIUS, 2)
    expect(late.temperature).toBeLessThan(4000)
    expect(late.cutaway).toBe(1)
    expect(late.layers).toBeGreaterThan(0.95)
  })

  it('collapses the core during line 26, before any shock', () => {
    expect(massive(at(2, 0.9)).collapse).toBe(1)
    expect(massive(at(2, 0.9)).shock).toBe(0)
  })

  it('stalls the shock just outside the core while neutrinos heat it, then blows the star apart', () => {
    const stalled = massive(at(3, 0.2))
    expect(stalled.shock).toBeGreaterThan(0)
    expect(stalled.shock).toBeLessThan(STALLED_SHOCK * 1.2)
    expect(stalled.neutrinos).toBeGreaterThan(0.5)
    expect(stalled.bodyOpacity).toBeGreaterThan(0.9)
    const out = massive(at(4, 0.2))
    expect(out.shock).toBeGreaterThan(SUPERGIANT_RADIUS * 2)
    expect(out.bodyOpacity).toBe(0)
  })

  it('ramps the explosion up and back down, never jumping', () => {
    let last = massive(0).glow
    for (let t = 0; t <= 1; t += 0.0005) {
      const glow = massive(t).glow
      expect(Math.abs(glow - last)).toBeLessThan(0.05)
      last = glow
    }
  })

  it('ends with a neutron star, and the shock gone past the camera', () => {
    const end = massive(1)
    expect(end.pulsar).toBe(1)
    expect(end.shock).toBeCloseTo(SHOCK_REACH, 1)
    expect(end.glowSize).toBeLessThan(0.5)
  })
})

describe('the very massive path', () => {
  const vm = (t: number) => ({ ...veryMassivePath(t, 0, createVeryMassivePath()) })

  it('starts as the steady star the ignition left', () => {
    expect(vm(0)).toMatchObject({ temperature: 42000, glow: 1, glowSize: 1, wind: 0, blackHole: 0 })
  })

  it('blows a strong wind in line 29, and is a bare Wolf-Rayet core by the end of line 30', () => {
    expect(vm(1 / 3).wind).toBe(1)
    expect(vm(2 / 3).stripped).toBe(1)
    expect(vm(2 / 3).glowSize).toBeLessThan(vm(1 / 3).glowSize)
    expect(vm(2 / 3).temperature).toBeGreaterThan(vm(0).temperature)
  })

  it('goes dark and leaves a black hole in line 31, with at most a weak outburst', () => {
    expect(vm(2 / 3).blackHole).toBe(0)
    const end = vm(1)
    expect(end.vanish).toBe(1)
    expect(end.glow).toBeCloseTo(0, 10)
    expect(end.blackHole).toBe(1)
    let peak = 0
    for (let t = 0; t <= 1; t += 0.001) peak = Math.max(peak, vm(t).outburst)
    expect(peak).toBeLessThanOrEqual(0.35)
  })

  it('keeps the glow changing smoothly', () => {
    let last = vm(0).glow
    for (let t = 0; t <= 1; t += 0.0005) {
      expect(Math.abs(vm(t).glow - last)).toBeLessThan(0.05)
      last = vm(t).glow
    }
  })
})

describe('the red dwarf path', () => {
  const rd = (t: number) => ({ ...redDwarfPath(t, 0, createRedDwarfPath()) })
  const at = (k: number, within = 0.5) => (k + within) / 4

  it('shows the small star, cut open, during line 13, and closed again by line 14', () => {
    expect(rd(at(0)).cutaway).toBe(1)
    expect(rd(at(0)).body).toBe(RED_DWARF_RADIUS)
    expect(rd(at(1)).cutaway).toBe(0)
  })

  it('stays a red dwarf through line 14: trillions of years, unchanged', () => {
    expect(rd(at(1))).toMatchObject({ temperature: 3100, body: RED_DWARF_RADIUS, ghost: 0 })
  })

  it('shows the prediction ghosted in line 15: hotter, then a tiny white dwarf', () => {
    const late = rd(at(2, 0.95))
    expect(late.ghost).toBe(1)
    expect(late.temperature).toBeGreaterThan(10000)
    expect(late.body).toBeLessThan(0.1)
  })

  it('returns to the red dwarf as it is today in line 16: none has done this yet', () => {
    expect(rd(1)).toMatchObject({ temperature: 3100, body: RED_DWARF_RADIUS, ghost: 0 })
  })

  it('closes the camera in only for the red dwarf, and only around the cutaway', () => {
    expect(pathCameraZoom('red-dwarf', at(0))).toBe(1)
    expect(pathCameraZoom('red-dwarf', at(2))).toBe(0)
    expect(pathCameraZoom('sun', at(0))).toBe(0)
  })
})

describe('the brown dwarf path', () => {
  const bd = (t: number) => ({ ...brownDwarfPath(t, 0, createBrownDwarfPath()) })
  const at = (k: number, within = 0.5) => (k + within) / 2

  it('starts as the faint point the stalled ignition left', () => {
    expect(bd(0)).toMatchObject({ temperature: 2800, glow: 1, body: BROWN_DWARF_RADIUS, bodyOpacity: 0, deuterium: 0 })
  })

  it('burns deuterium during line 11, before it starts to cool', () => {
    const burning = bd(at(0, 0.45))
    expect(burning.deuterium).toBe(1)
    expect(burning.cooling).toBe(0)
    expect(burning.temperature).toBe(2800)
  })

  it('glows only with leftover heat once the deuterium is spent', () => {
    expect(bd(at(1, 0)).deuterium).toBe(0)
    expect(bd(at(1, 0)).cooling).toBeGreaterThan(0)
  })

  it('cools, dims and shrinks a little through line 12, to nearly black', () => {
    const end = bd(1)
    expect(end.temperature).toBe(BROWN_DWARF_COLD_KELVIN)
    expect(end.glow).toBeLessThan(0.03)
    expect(end.body).toBeLessThan(BROWN_DWARF_RADIUS)
    expect(end.body).toBeGreaterThan(0.25)
    for (let t = 0.5; t < 1; t += 0.01) expect(bd(t + 0.01).temperature).toBeLessThanOrEqual(bd(t).temperature)
  })

  it('keeps its worlds where they formed: nothing swells or loses mass', () => {
    for (const t of [0, 0.3, 0.7, 1]) expect(bd(t)).toMatchObject({ engulf: 0, orbitScale: 1 })
  })

  it('closes the camera in for most of the path, then backs out for the ending', () => {
    expect(pathCameraZoom('brown-dwarf', at(0))).toBe(1)
    expect(pathCameraZoom('brown-dwarf', at(1, 0.3))).toBe(1)
    expect(pathCameraZoom('brown-dwarf', 1)).toBe(0)
  })
})

describe('the first stars path', () => {
  const fs = (t: number) => ({ ...firstStarsPath(t, 0, createFirstStarsPath()) })
  const at = (k: number, within = 0.5) => (k + within) / 4

  it('shows a huge blue star in a sparse sky during line 32', () => {
    const star = fs(at(0, 0.8))
    expect(star.body).toBe(FIRST_STAR_RADIUS)
    expect(star.temperature).toBe(55000)
    expect(star.sparse).toBe(1)
    expect(skyDensity('first-stars', at(0, 0.8), 0)).toBeCloseTo(0.15, 6)
  })

  it('thins the sky only on this path, and gives the full sky back over the hand-off', () => {
    expect(skyDensity('massive', 0.5, 0)).toBe(1)
    expect(skyDensity('first-stars', 1, 1)).toBe(1)
  })

  it('makes pairs in the core during line 33, then the core falls in before anything ignites', () => {
    expect(fs(at(1, 0.55)).cutaway).toBe(1)
    expect(fs(at(1, 0.65)).pairs).toBe(1)
    expect(fs(at(1, 0.65)).ignite).toBe(0)
    expect(fs(at(2, 0)).coreFall).toBe(1)
    expect(fs(at(2, 0)).blast).toBe(0)
  })

  it('ignites oxygen in line 34 and blows the whole star apart', () => {
    const blown = fs(at(2, 0.9))
    expect(blown.ignite).toBe(1)
    expect(blown.blast).toBeGreaterThan(FIRST_STAR_RADIUS * 2.2)
    expect(blown.bodyOpacity).toBe(0)
  })

  it('leaves nothing behind: no point of light at the end, and the debris gone past the camera', () => {
    const end = fs(1)
    expect(end.glow).toBeCloseTo(0, 6)
    expect(end.glowSize).toBeCloseTo(0, 6)
    expect(end.blast).toBe(BLAST_REACH)
    expect(end.blastGlow).toBeLessThan(0.1)
  })

  it("changes the explosion's light smoothly, never jumping", () => {
    let last = fs(0).glow
    for (let t = 0; t <= 1; t += 0.0005) {
      expect(Math.abs(fs(t).glow - last)).toBeLessThan(0.05)
      last = fs(t).glow
    }
  })

  it('is what pathStar draws for this path', () => {
    expect(pathStar('first-stars', at(0, 0.8), 0, 55000, createPathStates()).body).toBe(FIRST_STAR_RADIUS)
  })
})
