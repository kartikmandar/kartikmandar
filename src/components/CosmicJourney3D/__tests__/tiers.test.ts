import { describe, it, expect } from 'vitest'
import { selectQuality, type JourneyEnv } from '../tiers'

const desktop: JourneyEnv = { reducedMotion: false, coarsePointer: false, smallScreen: false, deviceMemoryGb: 16, webgl2: true }

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
