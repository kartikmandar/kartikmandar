import { describe, expect, it } from 'vitest'
import { ABOUT_SECTIONS, CERTIFICATE_GROUPS, COURSE_GROUPS, HOBBIES, JOURNAL_CLUB_TALKS } from '../about'

describe('about data', () => {
  it('keeps every certificate and course from the old pages', () => {
    expect(CERTIFICATE_GROUPS.flatMap((group) => group.items)).toHaveLength(25)
    expect(COURSE_GROUPS.flatMap((group) => group.items)).toHaveLength(56)
  })

  it('leads the hobbies with the current four', () => {
    expect(HOBBIES.slice(0, 4).map((hobby) => hobby.title)).toEqual(['Running', 'Calisthenics', 'Cycling', 'Treks'])
  })

  it('has no live meeting invite or old site links', () => {
    const hrefs = [...JOURNAL_CLUB_TALKS, ...CERTIFICATE_GROUPS.flatMap((group) => group.items)].map((item) => item.href)
    expect(hrefs.some((href) => href.includes('meet.google.com') || href.includes('kartikmandar.com'))).toBe(false)
  })

  it('has unique section anchors', () => {
    const ids = ABOUT_SECTIONS.map((section) => section.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
