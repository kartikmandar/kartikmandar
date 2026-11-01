import { describe, expect, it } from 'vitest'
import { chooseView, isStoryView, slugFor } from '../storyView'

const base = { requested: null, stored: null, reducedMotion: false, canFly: true }

describe('chooseView', () => {
  it('flies by default on a capable device', () => {
    expect(chooseView(base)).toBe('flight')
  })

  it('uses calm mode under reduced motion', () => {
    expect(chooseView({ ...base, reducedMotion: true })).toBe('calm')
  })

  it('uses calm mode when the device cannot fly', () => {
    expect(chooseView({ ...base, canFly: false })).toBe('calm')
  })

  it('honours a stored choice', () => {
    expect(chooseView({ ...base, stored: 'calm' })).toBe('calm')
    expect(chooseView({ ...base, stored: 'timeline' })).toBe('timeline')
  })

  it('lets a visitor opt in to the flight under reduced motion', () => {
    expect(chooseView({ ...base, reducedMotion: true, stored: 'flight' })).toBe('flight')
  })

  it('never flies on a device that cannot', () => {
    expect(chooseView({ ...base, canFly: false, stored: 'flight' })).toBe('calm')
    expect(chooseView({ ...base, canFly: false, requested: 'flight' })).toBe('calm')
  })

  it('prefers the URL to a stored choice', () => {
    expect(chooseView({ ...base, requested: 'timeline', stored: 'calm' })).toBe('timeline')
  })

  it('ignores unknown values', () => {
    expect(chooseView({ ...base, requested: 'nonsense', stored: 'other' })).toBe('flight')
    expect(isStoryView('nonsense')).toBe(false)
  })
})

describe('slugFor', () => {
  it('drops legacy suffixes', () => {
    expect(slugFor('rri-research-section')).toBe('rri-research')
    expect(slugFor('search-section-wrapper')).toBe('search')
  })
})
