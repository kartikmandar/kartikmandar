import { describe, expect, it } from 'vitest'
import { PUBLICATIONS, citationLine, toBibtex } from '../publications'

const byId = (id: string) => PUBLICATIONS.find((publication) => publication.id === id)!

describe('publications', () => {
  it('has unique citation keys and lists Mandar on every paper', () => {
    expect(new Set(PUBLICATIONS.map((p) => p.id)).size).toBe(PUBLICATIONS.length)
    for (const p of PUBLICATIONS) expect(p.authors.some((a) => a.last === 'Mandar')).toBe(true)
  })

  it('formats citations for published and under-review papers', () => {
    expect(citationLine(byId('Duraphe2026timing'))).toBe('The Astrophysical Journal 1003, 13 (2026)')
    expect(citationLine(byId('Cox2025fftvis'))).toBe('RAS Techniques and Instruments 4, rzaf056 (2025)')
    expect(citationLine(byId('Duraphe2026reflection'))).toBe('Under review at The Astrophysical Journal (2026)')
  })

  it('writes an @article with journal fields for a published paper', () => {
    const bibtex = toBibtex(byId('Cox2025fftvis'))
    expect(bibtex.startsWith('@article{Cox2025fftvis,\n')).toBe(true)
    expect(bibtex).toContain('author = {Cox, Tyler A. and Murray, Steven G.')
    expect(bibtex).toContain('pages = {rzaf056}')
    expect(bibtex).toContain('doi = {10.1093/rasti/rzaf056}')
    expect(bibtex).toContain('eprint = {2506.02130}')
    expect(bibtex.endsWith('\n}')).toBe(true)
  })

  it('writes a @misc with a review note and no journal for an unpublished paper', () => {
    const bibtex = toBibtex(byId('Duraphe2026reflection'))
    expect(bibtex.startsWith('@misc{Duraphe2026reflection,\n')).toBe(true)
    expect(bibtex).toContain('note = {Under review at The Astrophysical Journal}')
    expect(bibtex).not.toContain('journal =')
    expect(bibtex).not.toContain('doi =')
  })
})
