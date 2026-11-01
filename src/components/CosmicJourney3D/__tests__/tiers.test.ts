import { describe, it, expect } from 'vitest'
import { adaptiveDpr, selectQuality, type JourneyEnv } from '../tiers'

const desktop: JourneyEnv = { reducedMotion: false, coarsePointer: false, smallScreen: false, deviceMemoryGb: 16, webgl2: true, softwareRenderer: false }

describe('selectQuality', () => {
  it('capable desktop -> high', () => {
    expect(selectQuality(desktop)).toBe('high')
  })
  it('coarse pointer + small screen -> mobile', () => {
    expect(selectQuality({ ...desktop, coarsePointer: true, smallScreen: true })).toBe('mobile')
  })
  it('low device memory -> low', () => {
    expect(selectQuality({ ...desktop, deviceMemoryGb: 4 })).toBe('low')
  })
  it('no webgl2 -> mobile (cheapest path)', () => {
    expect(selectQuality({ ...desktop, webgl2: false })).toBe('mobile')
  })
  it('unknown memory does not downgrade a desktop', () => {
    expect(selectQuality({ ...desktop, deviceMemoryGb: null })).toBe('high')
  })
})

describe('adaptiveDpr', () => {
  it('spans the tier range in 0.25 steps', () => {
    expect(adaptiveDpr('high', 0, 2)).toBe(1)
    expect(adaptiveDpr('high', 1, 2)).toBe(2)
    expect(adaptiveDpr('high', 0.5, 2) % 0.25).toBe(0)
  })
  it('never exceeds the device DPR', () => {
    expect(adaptiveDpr('high', 1, 1)).toBe(1)
    expect(adaptiveDpr('mobile', 1, 3)).toBe(1.5)
  })
  it('clamps the factor', () => {
    expect(adaptiveDpr('low', -1, 2)).toBe(0.75)
    expect(adaptiveDpr('low', 9, 2)).toBe(1.5)
  })
})
