import { describe, it, expect } from 'vitest'
import { COPY_IN, COPY_OUT, overlayView } from '../overlayView'

describe('overlayView', () => {
  it('shows the hero line during the prologue', () => {
    expect(overlayView({ inPrologue: true, heroIndex: 2, activeIndex: 0, local: 0 })).toEqual({ kind: 'hero', index: 2, visible: true })
  })

  it('keeps beat copy off while the camera travels and on through the hold', () => {
    const at = (local: number) => overlayView({ inPrologue: false, heroIndex: 0, activeIndex: 5, local }).visible
    expect(at(0.05)).toBe(false)
    expect(at(COPY_IN)).toBe(true)
    expect(at(0.5)).toBe(true)
    expect(at(COPY_OUT)).toBe(true)
    expect(at(0.95)).toBe(false)
  })
})
