import { describe, expect, it } from 'vitest'
import { arrivalNotes, openingSwell, storyMix } from '../soundMix'
import { segmentRange, starPath, type StarPathId } from '../openingStory'

const REST = { scrollSpeed: 0, cameraSpeed: 0, swell: 0 }

describe('storyMix', () => {
  it('is muffled, with no whoosh or sub, at rest', () => {
    const mix = storyMix(REST)
    expect(mix.cutoffHz).toBeCloseTo(2200)
    expect(mix.whooshGain).toBe(0)
    expect(mix.subGain).toBe(0)
  })

  it('opens the low-pass as scrolling speeds up', () => {
    expect(storyMix({ ...REST, scrollSpeed: 0.5 }).cutoffHz).toBeGreaterThan(storyMix(REST).cutoffHz)
    expect(storyMix({ ...REST, scrollSpeed: 1 }).cutoffHz).toBeCloseTo(16000)
  })

  it('caps out at flat-out speed', () => {
    expect(storyMix({ ...REST, scrollSpeed: 9 }).cutoffHz).toBeCloseTo(16000)
    expect(storyMix({ ...REST, cameraSpeed: 9 }).whooshGain).toBe(storyMix({ ...REST, cameraSpeed: 1 }).whooshGain)
  })

  it('raises the whoosh in level and pitch with the camera', () => {
    const slow = storyMix({ ...REST, cameraSpeed: 0.2 })
    const fast = storyMix({ ...REST, cameraSpeed: 1 })
    expect(fast.whooshGain).toBeGreaterThan(slow.whooshGain)
    expect(fast.whooshHz).toBeGreaterThan(slow.whooshHz)
  })

  it('swells the sub through an event, silent at both ends', () => {
    expect(storyMix({ ...REST, swell: 0 }).subGain).toBe(0)
    expect(storyMix({ ...REST, swell: 1 }).subGain).toBeCloseTo(0)
    expect(storyMix({ ...REST, swell: 0.5 }).subGain).toBeCloseTo(0.32)
  })
})

describe('storyMix level', () => {
  it('scales the sub, and is silent at level 0', () => {
    expect(storyMix({ ...REST, swell: 0.5, level: 0.5 }).subGain).toBeCloseTo(0.16)
    expect(storyMix({ ...REST, swell: 0.5, level: 0 }).subGain).toBe(0)
  })
})

describe('openingSwell', () => {
  const path = segmentRange('path')
  const ignition = segmentRange('ignition')
  /** Opening progress at a fractional life line of `id`. */
  const atLine = (id: StarPathId, line: number) => path.start + (path.end - path.start) * (line / starPath(id).life.length)
  const loudest = (id: StarPathId) => {
    let peak = 0
    for (let i = 0; i <= 2000; i++) {
      const { swell, level } = openingSwell(id, path.start + ((path.end - path.start) * i) / 2000)
      peak = Math.max(peak, level * Math.sin(Math.PI * swell) ** 2)
    }
    return peak
  }

  it('is silent through the trunk and before each ending', () => {
    for (const id of ['sun', 'massive', 'very-massive', 'first-stars'] as const) {
      expect(openingSwell(id, 0.1).level).toBe(0)
      expect(openingSwell(id, atLine(id, 1)).swell).toBe(0)
    }
  })

  it('rises low at ignition, except for the brown dwarf, which never ignites', () => {
    const mid = (ignition.start + ignition.end) / 2
    expect(openingSwell('sun', mid).swell).toBeGreaterThan(0)
    expect(openingSwell('sun', mid).level).toBeLessThan(0.5)
    expect(openingSwell('brown-dwarf', mid).swell).toBe(0)
  })

  it('swells in full for the supernovae, softly for the helium flash, and not at all for the dwarfs', () => {
    expect(loudest('massive')).toBeGreaterThan(0.95)
    expect(loudest('first-stars')).toBeGreaterThan(0.95)
    expect(loudest('very-massive')).toBeGreaterThan(0.5)
    expect(loudest('sun')).toBeLessThan(0.5)
    expect(loudest('sun')).toBeGreaterThan(0.3)
    expect(loudest('red-dwarf')).toBe(0)
    expect(loudest('brown-dwarf')).toBe(0)
  })

  it('places the massive star\'s swell on its supernova line', () => {
    expect(openingSwell('massive', atLine('massive', 3.5)).swell).toBeGreaterThan(0)
  })
})

describe('arrivalNotes', () => {
  it('gives a root, fifth and octave', () => {
    const [root, fifth, octave] = arrivalNotes(0)
    expect(root).toBe(220)
    expect(fifth).toBe(330)
    expect(octave).toBe(440)
  })

  it('rises across the story and stays in a soft range', () => {
    expect(arrivalNotes(30)[0]!).toBeGreaterThan(arrivalNotes(0)[0]!)
    for (let beat = 0; beat < 31; beat++) expect(Math.max(...arrivalNotes(beat))).toBeLessThan(3000)
  })
})
