import { describe, it, expect, beforeEach } from 'vitest'
import { glowFor, loadStore, reportLoad } from '../loader'

describe('loader progress', () => {
  beforeEach(() => loadStore.setState({ progress: 0.05, done: false }))

  it('only moves forward and clamps to 1', () => {
    reportLoad(0.6)
    reportLoad(0.3)
    expect(loadStore.getState().progress).toBe(0.6)
    reportLoad(4)
    expect(loadStore.getState().progress).toBe(1)
  })

  it('latches done once reported', () => {
    reportLoad(1, true)
    reportLoad(1)
    expect(loadStore.getState().done).toBe(true)
  })

  it('grows the point of light with progress', () => {
    const a = glowFor(0)
    const b = glowFor(1)
    expect(b.core).toBeGreaterThan(a.core)
    expect(b.halo).toBeGreaterThan(a.halo)
    expect(glowFor(-1)).toEqual(a)
  })
})
