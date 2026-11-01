import { describe, it, expect } from 'vitest'
import { parseCapture } from '../capture'

describe('parseCapture', () => {
  it('is off without the capture flag', () => {
    expect(parseCapture('').enabled).toBe(false)
    expect(parseCapture('?p=0.5&t=3').enabled).toBe(false)
    expect(parseCapture('?capture=0').enabled).toBe(false)
  })

  it('reads progress, time, dpr and ui', () => {
    expect(parseCapture('?capture=1&p=0.42&t=3.5&dpr=2&ui=0')).toEqual({
      enabled: true, progress: 0.42, time: 3.5, dpr: 2, hideUi: true, solo: false,
    })
  })

  it('defaults to the start of the page at t=0, dpr 1, UI visible', () => {
    expect(parseCapture('?capture=1')).toEqual({
      enabled: true, progress: 0, time: 0, dpr: 1, hideUi: false, solo: false,
    })
  })

  it('clamps out-of-range and ignores garbage values', () => {
    const c = parseCapture('?capture=1&p=7&t=-2&dpr=99')
    expect(c.progress).toBe(1)
    expect(c.time).toBe(0)
    expect(c.dpr).toBe(3)
    expect(parseCapture('?capture=1&p=abc&t=&dpr=x')).toMatchObject({ progress: 0, time: 0, dpr: 1 })
  })
})
