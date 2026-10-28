// src/components/CosmicJourney3D/__tests__/beatsMeta.test.ts
import { describe, it, expect } from 'vitest'
import { NARRATIVE } from '../narrative'
import { BEATS_META, ORIGIN_ANCHOR, NEBULA_ANCHOR, dwellFor } from '../beatsMeta'

describe('beatsMeta', () => {
  it('has metadata for every narrative beat and nothing extra', () => {
    const metaIds = Object.keys(BEATS_META).sort()
    const narrativeIds = NARRATIVE.map((b) => b.id).sort()
    expect(metaIds).toEqual(narrativeIds)
  })

  it('every beat has a positive scroll length, an anchor position, a poster, and acceptance notes', () => {
    for (const b of NARRATIVE) {
      const m = BEATS_META[b.id]!
      expect(m.scrollLength).toBeGreaterThan(0)
      expect(m.anchor.position).toHaveLength(3)
      expect(m.posterSrc).toMatch(/^\/media\/.+\.(jpg|png|webp)$/)
      expect(m.acceptance.length).toBeGreaterThan(0)
    }
  })

  it('exposes distinct origin and nebula anchors for the flight ends', () => {
    expect(ORIGIN_ANCHOR.position).toHaveLength(3)
    expect(NEBULA_ANCHOR.position).toHaveLength(3)
    expect(ORIGIN_ANCHOR.position).not.toEqual(NEBULA_ANCHOR.position)
  })

  it('places the nebula beyond the last station so the camera never doubles back', () => {
    const lastZ = Math.min(...NARRATIVE.map((b) => BEATS_META[b.id]!.anchor.position[2]))
    expect(NEBULA_ANCHOR.position[2]).toBeLessThan(lastZ)
  })
})

describe('dwell', () => {
  it('gives longer copy a longer hold, within bounds', () => {
    expect(dwellFor(10)).toBeLessThan(dwellFor(60))
    expect(dwellFor(0)).toBe(110)
    expect(dwellFor(500)).toBe(240)
  })

  it('makes the longest beat at least as long as the shortest', () => {
    const lengths = NARRATIVE.map((b) => BEATS_META[b.id]!.scrollLength)
    expect(Math.max(...lengths)).toBeGreaterThan(Math.min(...lengths))
  })
})
