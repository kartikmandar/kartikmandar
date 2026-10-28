import { describe, it, expect } from 'vitest'
import { decodeFrame } from '../Hud'

describe('HUD decode', () => {
  const text = 'MAY 2024 · BENGALURU'
  it('keeps length and spaces, resolves left to right', () => {
    const mid = decodeFrame(text, 0.5, 3)
    expect(mid).toHaveLength(text.length)
    expect(mid.slice(0, 10)).toBe(text.slice(0, 10))
    expect(mid[3]).toBe(' ')
  })
  it('is fully resolved at 1 and deterministic per tick', () => {
    expect(decodeFrame(text, 1, 9)).toBe(text)
    expect(decodeFrame(text, 0.2, 4)).toBe(decodeFrame(text, 0.2, 4))
  })
})
