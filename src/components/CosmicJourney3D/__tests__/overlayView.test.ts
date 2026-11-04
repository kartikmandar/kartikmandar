import { describe, it, expect } from 'vitest'
import { COPY_IN, COPY_OUT, END_AT, overlayView } from '../overlayView'

describe('overlayView', () => {
  it('shows the opening line during the opening', () => {
    expect(overlayView({ inOpening: true, openingIndex: 2, activeIndex: 0, local: 0 })).toEqual({ kind: 'opening', index: 2, visible: true })
  })

  it('keeps beat copy off while the camera travels and on through the hold', () => {
    const at = (local: number) => overlayView({ inOpening: false, openingIndex: 0, activeIndex: 5, local }).visible
    expect(at(0.05)).toBe(false)
    expect(at(COPY_IN)).toBe(true)
    expect(at(0.5)).toBe(true)
    expect(at(COPY_OUT)).toBe(true)
    expect(at(0.95)).toBe(false)
  })

  it('hands the final beat over to the end card as the camera pulls back', () => {
    const last = (local: number) => overlayView({ inOpening: false, openingIndex: 0, activeIndex: 30, local, lastIndex: 30 })
    expect(last(0.5).kind).toBe('beat')
    expect(last(END_AT)).toEqual({ kind: 'end', index: 30, visible: true })
    expect(last(1).kind).toBe('end')
    expect(overlayView({ inOpening: false, openingIndex: 0, activeIndex: 12, local: 0.95, lastIndex: 30 }).kind).toBe('beat')
  })
})
