import { describe, expect, it } from 'vitest'
import {
  DEFAULT_STAR_PATH, HANDOFF_LINE, OPENING_SEGMENTS, OPENING_TRUNK, STAR_PATHS,
  openingLineIndex, openingLines, segmentRange, starPath,
} from '../openingStory'

describe('star paths', () => {
  it('has the six approved paths, ordered by mass', () => {
    expect(STAR_PATHS.map((path) => path.id)).toEqual(['brown-dwarf', 'red-dwarf', 'sun', 'massive', 'very-massive', 'first-stars'])
    for (let i = 1; i < STAR_PATHS.length; i++) expect(STAR_PATHS[i]!.mass).toBeGreaterThan(STAR_PATHS[i - 1]!.mass)
  })

  it("defaults to the Sun's path", () => {
    expect(DEFAULT_STAR_PATH).toBe('sun')
    expect(starPath(DEFAULT_STAR_PATH).mass).toBe(1)
  })

  it('keeps the copy free of em dashes', () => {
    for (const id of STAR_PATHS.map((path) => path.id)) {
      for (const line of openingLines(id)) expect(line.text).not.toContain('—')
    }
  })
})

describe('the opening schedule', () => {
  it('budgets 1,880 vh before the 200 vh hand-off band (spec §5)', () => {
    expect(OPENING_SEGMENTS.reduce((sum, segment) => sum + segment.vh, 0)).toBe(1880)
  })

  it('tiles 0..1 with the segments in order', () => {
    let end = 0
    for (const segment of OPENING_SEGMENTS) {
      const range = segmentRange(segment.id)
      expect(range.start).toBeCloseTo(end, 12)
      end = range.end
    }
    expect(end).toBeCloseTo(1, 12)
  })

  it('starts with the cloud and ends with the hand-off line on every path', () => {
    for (const path of STAR_PATHS) {
      const lines = openingLines(path.id)
      expect(lines[0]!.text).toBe(OPENING_TRUNK[0])
      expect(lines[lines.length - 1]).toEqual({ segment: 'handoff', text: HANDOFF_LINE })
    }
  })

  it('shows every line once, in order, as the opening scrolls', () => {
    const lines = openingLines('sun')
    const seen: number[] = []
    for (let p = 0; p < 1; p += 0.0005) {
      const index = openingLineIndex(p, false, lines)
      if (seen[seen.length - 1] !== index) seen.push(index)
    }
    seen.push(openingLineIndex(0, true, lines))
    expect(seen).toEqual(lines.map((_, i) => i))
  })

  it('keeps each line inside its own segment', () => {
    const lines = openingLines('massive')
    for (const segment of OPENING_SEGMENTS) {
      const range = segmentRange(segment.id)
      const mid = (range.start + range.end) / 2
      expect(lines[openingLineIndex(mid, false, lines)]!.segment).toBe(segment.id)
    }
  })

  it('shows the hand-off line through the band and past the end', () => {
    const lines = openingLines('red-dwarf')
    expect(openingLineIndex(0.2, true, lines)).toBe(lines.length - 1)
    expect(openingLineIndex(1, false, lines)).toBe(lines.length - 1)
  })
})
