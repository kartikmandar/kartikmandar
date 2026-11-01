import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StoryArticle } from '../StoryArticle'
import { HERO_PHASES, NARRATIVE, PAGE_TITLE } from '../narrative'

const html = renderToStaticMarkup(<StoryArticle />)
const escape = (text: string) => renderToStaticMarkup(<>{text}</>)
const count = (needle: string) => html.split(needle).length - 1

describe('StoryArticle', () => {
  it('has one page title', () => {
    expect(count('<h1')).toBe(1)
    expect(html).toContain(escape(PAGE_TITLE))
  })

  it('has a heading for all 31 beats plus the ending', () => {
    expect(NARRATIVE).toHaveLength(31)
    expect(count('<h2')).toBe(32)
  })

  it('includes every headline, body, typed phrase and evidence link', () => {
    for (const beat of NARRATIVE) {
      expect(html).toContain(escape(beat.headline))
      if (beat.body) expect(html).toContain(escape(beat.body))
      for (const phrase of beat.typedPhrases ?? []) expect(html).toContain(escape(phrase))
      if (beat.evidence) expect(html).toContain(`href="${beat.evidence.href}"`)
    }
  })

  it('includes the prologue', () => {
    for (const phase of HERO_PHASES) expect(html).toContain(escape(phase.text))
  })
})
