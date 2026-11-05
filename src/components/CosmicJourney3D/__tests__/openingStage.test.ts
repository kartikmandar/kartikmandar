import { describe, expect, it } from 'vitest'
import { createOpeningStage, openingStage, type OpeningStageState } from '../openingStage'
import { segmentRange, type StarPathId } from '../openingStory'

const at = (opening: number, handoff = 0, path: StarPathId = 'sun'): OpeningStageState => ({ ...openingStage(opening, handoff, createOpeningStage(), path) })
const PLANETS = segmentRange('planets')
const IGNITION = segmentRange('ignition')

describe('openingStage', () => {
  it('starts as a whole cloud, before anything collapses', () => {
    expect(at(0)).toMatchObject({ cloud: 1, collapse: 0, heat: 0, envelope: 0, disk: 0, jets: 0, presence: 1 })
  })

  it('keeps every value in 0..1', () => {
    for (let p = 0; p <= 1; p += 0.01) {
      for (const value of Object.values(at(p))) {
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThanOrEqual(1)
      }
    }
  })

  it('has the clumps collapsed by the end of the cloud segment', () => {
    expect(at(segmentRange('cloud').end).collapse).toBeGreaterThan(0.9)
  })

  it('has the disk and jets by the time the choice comes', () => {
    const choice = at(segmentRange('choice').start)
    expect(choice.disk).toBe(1)
    expect(choice.jets).toBe(1)
    expect(choice.heat).toBe(1)
  })

  it('orders the events like the copy: collapse, then heat, then disk, then jets', () => {
    const firstAbove = (key: keyof OpeningStageState) => {
      for (let p = 0; p <= 1; p += 0.001) if (at(p)[key] > 0.5) return p
      return 1
    }
    expect(firstAbove('collapse')).toBeLessThan(firstAbove('heat'))
    expect(firstAbove('heat')).toBeLessThan(firstAbove('disk'))
    expect(firstAbove('disk')).toBeLessThan(firstAbove('jets'))
  })

  it('leaves some diffuse gas: most of a cloud never becomes stars', () => {
    expect(at(1).cloud).toBeGreaterThan(0)
  })

  it('fades out across the hand-off', () => {
    expect(at(1, 0).presence).toBe(1)
    expect(at(1, 1).presence).toBe(0)
  })

  it('grows nothing before the choice is made', () => {
    const choice = at(segmentRange('choice').end - 0.001)
    expect(choice).toMatchObject({ pebbles: 0, growth: 0, giants: 0, clear: 0, ignite: 0 })
  })

  it('grows planets, then clears the gas, then ignites, round the Sun', () => {
    expect(at(PLANETS.end).growth).toBe(1)
    expect(at(PLANETS.end).giants).toBe(1)
    expect(at(IGNITION.start).clear).toBeGreaterThan(0.9)
    expect(at(IGNITION.start).ignite).toBe(0)
    expect(at(IGNITION.end).ignite).toBe(1)
  })

  it('grows giants only round stars with room for them', () => {
    expect(at(PLANETS.end, 0, 'red-dwarf').giants).toBe(1)
    for (const path of ['brown-dwarf', 'massive', 'very-massive', 'first-stars'] as const) {
      expect(at(PLANETS.end, 0, path).giants).toBe(0)
      expect(at(PLANETS.end, 0, path).snowLine).toBe(0)
    }
  })

  it("clears a heavy star's disk early, but lets it feed until it is already burning", () => {
    const middle = (PLANETS.start + PLANETS.end) / 2
    expect(at(middle, 0, 'massive').clear).toBeGreaterThan(at(middle, 0, 'sun').clear)
    const burning = IGNITION.start + 0.6 * (IGNITION.end - IGNITION.start)
    expect(at(burning, 0, 'massive').ignite).toBe(1)
    expect(at(burning - 0.01, 0, 'massive').innerClear).toBeLessThan(1)
    expect(at(IGNITION.end, 0, 'massive').innerClear).toBe(1)
  })

  it('lets the jets and cocoon die down as the disk ages', () => {
    expect(at(PLANETS.end).jets).toBe(0)
    expect(at(PLANETS.end).envelope).toBe(0)
  })
})

