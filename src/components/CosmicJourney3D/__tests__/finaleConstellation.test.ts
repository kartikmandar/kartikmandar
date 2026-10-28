import { describe, it, expect } from 'vitest'
import { constellationPoints } from '../FinaleConstellation'

describe('constellationPoints', () => {
  const anchors: Array<[number, number, number]> = [[0, 2.5, -14], [5, 1, -22], [-3, -2, -30], [1, 0, -38]]

  it('runs left to right in story order across the requested width', () => {
    const pts = constellationPoints(anchors, 8)
    expect(pts[0]![0]).toBeCloseTo(-4, 9)
    expect(pts[3]![0]).toBeCloseTo(4, 9)
    for (let i = 1; i < pts.length; i++) expect(pts[i]![0]).toBeGreaterThan(pts[i - 1]![0])
  })

  it('keeps the wander small and the figure flat', () => {
    for (const [, y, z] of constellationPoints(anchors)) {
      expect(Math.abs(y)).toBeLessThan(1.5)
      expect(z).toBe(0)
    }
  })

  it('handles an empty journey', () => {
    expect(constellationPoints([])).toEqual([])
  })
})
