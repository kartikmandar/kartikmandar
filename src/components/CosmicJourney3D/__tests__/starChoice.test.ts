import { describe, expect, it } from 'vitest'
import { STAR_PATHS } from '../openingStory'
import {
  DETENT_STEPS, MASS_MAX, MASS_MIN, PATH_BOUNDARIES, SLIDER_STEPS,
  endingFor, formatMass, formatYears, lifetimeYears, massReadout, massToSlider,
  parseStarParam, pathForMass, sliderToMass, snapToPreset, withStarParam,
} from '../starChoice'

describe('the mass slider', () => {
  it('spans 0.02 to 250 solar masses on a log scale', () => {
    expect(sliderToMass(0)).toBeCloseTo(MASS_MIN, 10)
    expect(sliderToMass(SLIDER_STEPS)).toBeCloseTo(MASS_MAX, 8)
    // Each decade of mass takes the same length of slider.
    const decade = massToSlider(10) - massToSlider(1)
    expect(massToSlider(1) - massToSlider(0.1)).toBeCloseTo(decade, -1)
  })

  it('lands exactly on every preset mass', () => {
    for (const path of STAR_PATHS) expect(sliderToMass(massToSlider(path.mass))).toBe(path.mass)
  })

  it('snaps a dragged thumb onto a nearby preset, and leaves it alone elsewhere', () => {
    const sun = massToSlider(1)
    expect(snapToPreset(sun + DETENT_STEPS - 1)).toBe(sun)
    expect(snapToPreset(sun - DETENT_STEPS + 1)).toBe(sun)
    expect(snapToPreset(sun + DETENT_STEPS + 20)).toBe(sun + DETENT_STEPS + 20)
  })

  it('moves on every arrow-key step (a rounded mass would snap back to where it was)', () => {
    for (let v = 0; v < SLIDER_STEPS; v++) expect(massToSlider(sliderToMass(v + 1))).toBe(v + 1)
  })

  it('never shows more than two significant figures', () => {
    for (let v = 0; v <= SLIDER_STEPS; v += 7) {
      const shown = Number(formatMass(sliderToMass(v)))
      expect(Number(shown.toPrecision(2))).toBe(shown)
    }
  })
})

describe('paths by mass', () => {
  it('sends every preset down its own path', () => {
    for (const path of STAR_PATHS) expect(pathForMass(path.mass)).toBe(path.id)
  })

  it('changes path only at the boundaries, in order of mass', () => {
    const order = STAR_PATHS.map((path) => path.id)
    let last = order.indexOf(pathForMass(MASS_MIN))
    expect(last).toBe(0)
    for (let v = 1; v <= SLIDER_STEPS; v++) {
      const next = order.indexOf(pathForMass(sliderToMass(v)))
      expect(next === last || next === last + 1).toBe(true)
      last = next
    }
    expect(last).toBe(order.length - 1)
  })

  it('puts the tick marks where the path changes', () => {
    for (const boundary of PATH_BOUNDARIES) {
      expect(pathForMass(boundary * 0.98)).not.toBe(pathForMass(boundary * 1.02))
    }
  })
})

describe('the readout', () => {
  it("reads like the spec's example for the Sun", () => {
    expect(massReadout(1)).toBe('1.0 M☉ · about 10 billion years · white dwarf')
  })

  it('gives model lifetimes, not the M^-2.5 rule, at both ends (§3.3)', () => {
    expect(formatYears(lifetimeYears(15)!)).toBe('about 12 million years')
    expect(formatYears(lifetimeYears(40)!)).toBe('about 5 million years')
    expect(formatYears(lifetimeYears(0.2)!)).toBe('about 1 trillion years')
    expect(lifetimeYears(0.15)!).toBeGreaterThan(1e12)
  })

  it('has lifetimes that only fall with mass', () => {
    let last = Infinity
    for (let v = massToSlider(0.08); v <= SLIDER_STEPS; v += 3) {
      const years = lifetimeYears(sliderToMass(v))!
      expect(years).toBeLessThanOrEqual(last)
      last = years
    }
  })

  it('says a brown dwarf never fuses hydrogen', () => {
    expect(lifetimeYears(0.05)).toBeNull()
    expect(massReadout(0.05)).toBe('0.05 M☉ · no hydrogen fusion · cools and fades')
  })

  it('names each path’s typical ending', () => {
    expect(endingFor(0.15)).toBe('helium white dwarf')
    expect(endingFor(15)).toBe('supernova, neutron star')
    expect(endingFor(40)).toContain('black hole')
    expect(endingFor(200)).toBe('nothing left')
  })

  it('formats masses plainly', () => {
    expect(STAR_PATHS.map((path) => formatMass(path.mass))).toEqual(['0.05', '0.15', '1.0', '15', '40', '200'])
  })
})

describe('?star= deep links', () => {
  it('reads a path id and ignores anything else', () => {
    expect(parseStarParam('?star=massive')).toBe('massive')
    expect(parseStarParam('?capture=1&star=red-dwarf')).toBe('red-dwarf')
    expect(parseStarParam('?star=neutron')).toBeNull()
    expect(parseStarParam('')).toBeNull()
  })

  it('writes the path id and keeps the other parameters', () => {
    expect(withStarParam('', 'sun')).toBe('?star=sun')
    expect(withStarParam('?perf&star=sun', 'massive')).toBe('?perf=&star=massive')
  })
})
