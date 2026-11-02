import { describe, expect, it } from 'vitest'
import { arrivalNotes, storyMix } from '../soundMix'

const REST = { scrollSpeed: 0, cameraSpeed: 0, crossfade: 0 }

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

  it('swells the sub through the black hole hand-off, silent at both ends', () => {
    expect(storyMix({ ...REST, crossfade: 0 }).subGain).toBe(0)
    expect(storyMix({ ...REST, crossfade: 1 }).subGain).toBeCloseTo(0)
    expect(storyMix({ ...REST, crossfade: 0.5 }).subGain).toBeCloseTo(0.32)
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
