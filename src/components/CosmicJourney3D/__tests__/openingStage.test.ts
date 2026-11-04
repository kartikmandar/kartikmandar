import { describe, expect, it } from 'vitest'
import { createOpeningStage, openingStage, type OpeningStageState } from '../openingStage'
import { segmentRange } from '../openingStory'

const at = (opening: number, handoff = 0): OpeningStageState => ({ ...openingStage(opening, handoff, createOpeningStage()) })

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
})
