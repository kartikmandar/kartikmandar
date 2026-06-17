// src/components/CosmicJourney3D/__tests__/beatsMeta.test.ts
import { describe, it, expect } from 'vitest'
import { NARRATIVE } from '../narrative'
import { BEATS_META, ORIGIN_ANCHOR, NEBULA_ANCHOR } from '../beatsMeta'

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
})
