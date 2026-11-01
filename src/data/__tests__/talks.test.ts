import { describe, expect, it } from 'vitest'
import { CV_SECTIONS_AFTER } from '../cv'
import { getTalks } from '../talks'

describe('getTalks', () => {
  it('lists talks newest first', () => {
    const dates = getTalks().map((talk) => new Date(talk.scheduling.talkDate).getTime())
    expect(dates).toEqual([...dates].sort((a, b) => b - a))
  })

  it('credits Dr. Chandra as the presenter at SALF XI', () => {
    const salf = getTalks().find((talk) => talk.eventDetails.eventName === 'Science at Low Frequencies XI')
    expect(salf?.presentedBy).toBe('Dr. Rajorshi Chandra')
    expect(salf?.shortDescription).toContain('Presented by Dr. Rajorshi Chandra')
  })
})

describe('schools and meetings', () => {
  it('has ASI 2026 as a meeting attended, not a talk', () => {
    const meetings = CV_SECTIONS_AFTER.find((section) => section.id === 'schools')?.entries ?? []
    expect(meetings.some((entry) => entry.title.includes('Astronomical Society of India'))).toBe(true)
    expect(getTalks().some((talk) => talk.title.includes('Astronomical Society of India'))).toBe(false)
  })
})
