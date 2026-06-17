// src/components/CosmicJourney3D/__tests__/narrative.test.ts
import { describe, it, expect } from 'vitest'
import { NARRATIVE, HERO_PHASES, PAGE_TITLE, PAGE_SUBTITLE } from '../narrative'

describe('narrative copy (preservation guard)', () => {
  it('has the 21 beats in order by id', () => {
    expect(NARRATIVE.map((b) => b.id)).toEqual([
      'nao-section', 'comet-section', 'decision-section', 'constellation-section',
      'search-section-wrapper', 'new-system-section', 'fixation-section', 'slingshot-section',
      'lens-section', 'internship-section', 'injury-section', 'rri-research-section',
      'gsoc-section', 'radio-section', 'doubling-down-section', 'bs-exit-section',
      'lensing-section', 'publication-section', 'cygnus-publication-section',
      'analysis-section', 'journey-continues-section',
    ])
  })

  it('preserves headline + eyebrow + body verbatim for sampled beats', () => {
    const nao = NARRATIVE[0]!
    expect(nao.eyebrow).toBe('4th Standard')
    expect(nao.headline).toBe('The Spark: NAO')
    expect(nao.body).toBe(
      'Cleared the regional round of the National Astronomy Olympiad. Reading their textbooks sparked a fascination that led me to participating each year, fueling a deep interest in the cosmos.',
    )
    const comet = NARRATIVE[1]!
    expect(comet.body).toContain('It was fascinaing.') // typo preserved on purpose
    const decision = NARRATIVE[2]!
    expect(decision.body).toContain('I  solidified my resolve') // double space preserved
    const finale = NARRATIVE[20]!
    expect(finale.headline).toBe('The Journey Continues...')
    expect(finale.body).toBe("...in search of a Master's in Astrophysics.")
    expect(finale.eyebrow).toBeUndefined()
  })

  it('keeps the search beat as typed phrases with no body', () => {
    const search = NARRATIVE[4]!
    expect(search.body).toBeUndefined()
    expect(search.typedPhrases).toEqual(['DU > Hansraj College...', 'IISERs...', 'IISER Bhopal'])
  })

  it('carries the hero prologue phase copy', () => {
    expect(HERO_PHASES.map((p) => p.text)).toEqual([
      'Every story begins with a massive star.',
      'It dies in a supernova, outshining its entire galaxy.',
      'What remains collapses into a black hole. Matter spirals in, and the disk ignites.',
      'But this is just the surface of what really is happening!!',
    ])
    expect(PAGE_TITLE).toBe('A Cosmic Journey')
    expect(PAGE_SUBTITLE).toBe('The story of a path written in the stars.')
  })
})
