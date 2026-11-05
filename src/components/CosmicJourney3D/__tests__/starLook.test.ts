import { describe, expect, it } from 'vitest'
import { blackbodyRgb, drawnDiskScale, drawnRadius, surfaceTemperature } from '../starLook'

const rgb = (kelvin: number) => blackbodyRgb(kelvin, { r: 0, g: 0, b: 0 })

describe('how the star looks', () => {
  it('runs hotter with mass on the main sequence', () => {
    let last = 0
    for (const mass of [0.1, 0.15, 0.5, 1, 2, 5, 15, 40, 200]) {
      expect(surfaceTemperature(mass)).toBeGreaterThan(last)
      last = surfaceTemperature(mass)
    }
    expect(surfaceTemperature(1)).toBe(5800)
  })

  it('colours a red dwarf red and a massive star blue-white', () => {
    const red = rgb(surfaceTemperature(0.15))
    expect(red.r).toBeGreaterThan(red.b * 2)
    const blue = rgb(surfaceTemperature(40))
    expect(blue.b).toBeGreaterThanOrEqual(blue.r)
  })

  it('keeps the drawn sizes in order but on screen', () => {
    expect(drawnRadius(0.05)).toBeLessThan(drawnRadius(1))
    expect(drawnRadius(1)).toBe(1)
    expect(drawnRadius(200)).toBeLessThanOrEqual(2.6)
    expect(drawnDiskScale(0.05)).toBeLessThan(drawnDiskScale(1))
  })
})
