import { describe, it, expect } from 'vitest'
import { fallbackMode } from '../fallbackPlan'

describe('fallbackMode', () => {
  it('uses static experience when reduced-motion is requested', () => {
    expect(fallbackMode(true, true)).toBe('static')
  })
  it('uses static experience when WebGL2 is unavailable', () => {
    expect(fallbackMode(false, false)).toBe('static')
  })
  it('otherwise runs the full motion experience', () => {
    expect(fallbackMode(false, true)).toBe('none')
  })
  it('uses static experience on a software renderer', () => {
    expect(fallbackMode(false, true, true)).toBe('static')
  })
  it('reduced-motion with WebGL2 available still forces static', () => {
    expect(fallbackMode(true, false)).toBe('static')
  })
})
