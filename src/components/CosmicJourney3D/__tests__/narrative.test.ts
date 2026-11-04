// src/components/CosmicJourney3D/__tests__/narrative.test.ts
import { describe, it, expect } from 'vitest'
import { NARRATIVE, PAGE_TITLE, PAGE_SUBTITLE } from '../narrative'

// Narrative v2, approved by the owner on 2026-10-28
// (docs/superpowers/specs/2026-10-28-my-story-narrative-v2-draft.md).
// The snapshot pins every word; any copy change must be a deliberate snapshot update.

const ORDER = [
  'nao-section', 'comet-section', 'decision-section', 'constellation-section', 'search-section-wrapper',
  'new-system-section', 'fixation-section', 'slingshot-section', 'lens-section', 'internship-section', 'injury-section',
  'rri-research-section', 'gsoc-section', 'doubling-down-section', 'journal-club-section', 'bs-exit-section',
  'lensing-section', 'publication-section', 'cygnus-publication-section',
  'radiosim-section', 'hera-upstream-section', 'instruments-section', 'xray-followup-section', 'oss-maintainer-section',
  'engineer-section', 'enrolia-section', 'off-court-section',
  'admission-section', 'arrival-section', 'analysis-section', 'journey-continues-section',
]

describe('narrative v2', () => {
  it('has the 31 approved beats in order', () => {
    expect(NARRATIVE.map((b) => b.id)).toEqual(ORDER)
  })

  it('pins the full approved copy', () => {
    expect({ PAGE_TITLE, PAGE_SUBTITLE, NARRATIVE }).toMatchSnapshot()
  })

  it('keeps acts contiguous and in story order', () => {
    const acts = NARRATIVE.map((b) => b.act)
    const firstSeen = [...new Set(acts)]
    expect(firstSeen).toEqual(['spark', 'course-correction', 'ignition', 'widening', 'catania'])
    for (let i = 1; i < acts.length; i++) {
      if (acts[i] !== acts[i - 1]) expect(firstSeen.indexOf(acts[i]!)).toBe(firstSeen.indexOf(acts[i - 1]!) + 1)
    }
  })

  it('gives every beat a headline, a HUD readout, and either a body or typed phrases', () => {
    for (const b of NARRATIVE) {
      expect(b.headline.length).toBeGreaterThan(0)
      expect(b.hud.length).toBeGreaterThan(0)
      expect(Boolean(b.body) !== Boolean(b.typedPhrases)).toBe(true)
    }
  })

  it('keeps the search beat as typed phrases', () => {
    const search = NARRATIVE.find((b) => b.id === 'search-section-wrapper')!
    expect(search.typedPhrases).toEqual(['DU > Hansraj College...', 'IISERs...', 'IISER Bhopal'])
  })

  it('uses only absolute https or site-relative evidence links', () => {
    for (const b of NARRATIVE) {
      if (!b.evidence) continue
      expect(b.evidence.label.length).toBeGreaterThan(0)
      expect(b.evidence.href).toMatch(/^(https:\/\/|\/[a-z])/)
    }
  })

  it('never leaks private details into public copy', () => {
    const text = JSON.stringify(NARRATIVE).toLowerCase()
    for (const banned of ['visa', 'permesso', 'codice fiscale', 'scholarship', 'ersu', 'isee', '€', '$', 'upwork', 'rejected', 'gpa', 'cgpa', 'ranked first', 'moneta']) {
      expect(text, `contains "${banned}"`).not.toContain(banned)
    }
  })
})
