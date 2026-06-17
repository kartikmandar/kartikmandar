import { describe, it, expect } from 'vitest'
import { fallbackMode, fallbackEntries } from '../fallbackPlan'
import { NARRATIVE } from '../narrative'

describe('fallbackMode', () => {
  it('uses static experience when reduced-motion is requested', () => {
    expect(fallbackMode(true, true)).toBe('static')
  })
  it('uses static experience when WebGL2 is unavailable', () => {
    expect(fallbackMode(false, false)).toBe('static')
  })
  it('otherwise runs the full motion experience', () => {
    expect(fallbackMode(false, true)).toBe('none')
  })
})

describe('fallbackEntries', () => {
  it('emits every beat as DOM-ready copy in order with a poster', () => {
    const entries = fallbackEntries()
    expect(entries.map((e) => e.id)).toEqual(NARRATIVE.map((b) => b.id))
    for (const e of entries) {
      expect(e.headline.length).toBeGreaterThan(0)
      expect(e.posterSrc).toMatch(/^\/media\//)
    }
  })
})
