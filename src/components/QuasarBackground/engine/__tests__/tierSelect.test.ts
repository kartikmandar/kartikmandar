import { describe, it, expect } from 'vitest'
import { selectTier, tierFromBenchmark, type TierEnvironment } from '../tierSelect'
import { CONSTANTS } from '../types'

/** A capable desktop: every heuristic says "raymarched is fine". */
const capable: TierEnvironment = {
  queryQuality: null,
  webgl2: true,
  floatColorBuffer: true,
  reducedMotion: false,
  coarsePointer: false,
  smallScreen: false,
  deviceMemoryGb: 16,
}

describe('selectTier', () => {
  it('?quality=high forces raymarched', () => {
    expect(selectTier({ ...capable, queryQuality: 'high', webgl2: false })).toBe('raymarched')
  })

  it('?quality=low forces mesh', () => {
    expect(selectTier({ ...capable, queryQuality: 'low' })).toBe('mesh')
  })

  it('missing WebGL2 forces mesh', () => {
    expect(selectTier({ ...capable, webgl2: false })).toBe('mesh')
  })

  it('missing float color buffer forces mesh', () => {
    expect(selectTier({ ...capable, floatColorBuffer: false })).toBe('mesh')
  })

  it('prefers-reduced-motion forces mesh', () => {
    expect(selectTier({ ...capable, reducedMotion: true })).toBe('mesh')
  })

  it('coarse pointer + small screen forces mesh', () => {
    expect(selectTier({ ...capable, coarsePointer: true, smallScreen: true })).toBe('mesh')
  })

  it('coarse pointer alone (e.g. touch laptop) does NOT force mesh', () => {
    expect(selectTier({ ...capable, coarsePointer: true })).toBe('benchmark')
  })

  it('low device memory forces mesh', () => {
    expect(selectTier({ ...capable, deviceMemoryGb: 4 })).toBe('mesh')
  })

  it('unknown device memory is not held against the device', () => {
    expect(selectTier({ ...capable, deviceMemoryGb: null })).toBe('benchmark')
  })

  it('ambiguous capable hardware goes to benchmark', () => {
    expect(selectTier(capable)).toBe('benchmark')
  })
})

describe('tierFromBenchmark', () => {
  it('fast frames pick raymarched', () => {
    expect(tierFromBenchmark(CONSTANTS.BENCHMARK_FRAME_MS - 1)).toBe('raymarched')
  })
  it('slow frames pick mesh', () => {
    expect(tierFromBenchmark(CONSTANTS.BENCHMARK_FRAME_MS + 1)).toBe('mesh')
  })
})
