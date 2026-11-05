import { describe, it, expect } from 'vitest'
import { beatIndexForSlug, beatTargetProgress, JUMP_LOCAL, slugFor } from '../navigation'
import { cumulativeRanges } from '../scrollMath'
import { flightStart } from '../openingScroll'
import { COPY_IN, COPY_OUT } from '../overlayView'

describe('deep links', () => {
  it('turns beat ids into short slugs', () => {
    expect(slugFor('rri-research-section')).toBe('rri-research')
    expect(slugFor('search-section-wrapper')).toBe('search')
  })

  it('resolves slugs (with or without #) back to beats', () => {
    const ids = ['nao-section', 'rri-research-section']
    expect(beatIndexForSlug('#rri-research', ids)).toBe(1)
    expect(beatIndexForSlug('NAO', ids)).toBe(0)
    expect(beatIndexForSlug('nope', ids)).toBe(-1)
  })

  it('lands a jump inside the held shot, where the copy is visible', () => {
    expect(JUMP_LOCAL).toBeGreaterThan(COPY_IN)
    expect(JUMP_LOCAL).toBeLessThan(COPY_OUT)
    const ranges = cumulativeRanges([100, 200, 100])
    const p = beatTargetProgress(1, ranges)
    const flight = (p - flightStart()) / (1 - flightStart())
    expect((flight - ranges[1]!.start) / (ranges[1]!.end - ranges[1]!.start)).toBeCloseTo(JUMP_LOCAL, 9)
  })

  it('every real beat has a unique slug', () => {
    const slugs = new Set<string>()
    for (const id of ['nao-section', 'search-section-wrapper', 'journey-continues-section']) slugs.add(slugFor(id))
    expect(slugs.size).toBe(3)
  })
})

describe('#choose', () => {
  it('lands inside the choice, with the control on screen', async () => {
    const { choiceOnScreen, choiceTargetProgress } = await import('../navigation')
    const { splitProgress } = await import('../openingScroll')
    const split = splitProgress(choiceTargetProgress())
    expect(choiceOnScreen(split.openingProgress, split.handoff)).toBe(true)
    expect(choiceOnScreen(0, 0)).toBe(false)
    expect(choiceOnScreen(1, 0.5)).toBe(false)
  })
})
