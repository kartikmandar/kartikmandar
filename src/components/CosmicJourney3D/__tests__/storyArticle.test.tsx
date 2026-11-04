import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StoryArticle } from '../StoryArticle'
import { NARRATIVE, PAGE_TITLE } from '../narrative'
import { DEFAULT_STAR_PATH, openingLines } from '../openingStory'

const html = renderToStaticMarkup(<StoryArticle />)
const escape = (text: string) => renderToStaticMarkup(<>{text}</>)
const count = (needle: string) => html.split(needle).length - 1

describe('StoryArticle', () => {
  it('has one page title', () => {
    expect(count('<h1')).toBe(1)
    expect(html).toContain(escape(PAGE_TITLE))
  })

  it('has a heading for the opening, all 31 beats and the ending', () => {
    expect(NARRATIVE).toHaveLength(31)
    expect(count('<h2')).toBe(33)
  })

  it('includes every headline, body, typed phrase and evidence link', () => {
    for (const beat of NARRATIVE) {
      expect(html).toContain(escape(beat.headline))
      if (beat.body) expect(html).toContain(escape(beat.body))
      for (const phrase of beat.typedPhrases ?? []) expect(html).toContain(escape(phrase))
      if (beat.evidence) expect(html).toContain(`href="${beat.evidence.href}"`)
    }
  })

  it("includes every line of the opening's default path", () => {
    for (const line of openingLines(DEFAULT_STAR_PATH)) expect(html).toContain(escape(line.text))
  })
})
