import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { OPENING_CENTER, openingCameraPose } from '../openingCamera'
import { ORIGIN_ANCHOR } from '../beatsMeta'
import { segmentRange } from '../openingStory'

const pose = (opening: number, handoff: number) => {
  const position = new THREE.Vector3()
  const look = new THREE.Vector3()
  openingCameraPose(opening, handoff, position, look)
  return { position, look }
}

describe('openingCameraPose', () => {
  it('ends the hand-off exactly where the flight starts', () => {
    const { position, look } = pose(1, 1)
    expect(position.toArray()).toEqual(ORIGIN_ANCHOR.position.map((v) => expect.closeTo(v, 9)))
    expect(look.toArray()).toEqual((ORIGIN_ANCHOR.lookAt ?? [0, 0, 0]).map((v) => expect.closeTo(v, 9)))
  })

  it('keeps the opening behind the flight, so it is out of view once the flight starts', () => {
    expect(OPENING_CENTER.z).toBeGreaterThan(ORIGIN_ANCHOR.position[2])
  })

  it('moves smoothly: no jumps across the opening and the hand-off', () => {
    let last = pose(0, 0).position
    for (let i = 1; i <= 20000; i++) {
      const t = i / 20000
      const next = t <= 0.5 ? pose(t * 2, 0).position : pose(1, (t - 0.5) * 2).position
      expect(next.distanceTo(last)).toBeLessThan(0.1)
      last = next
    }
  })

  it('closes in on the followed clump by the end of the protostar segment', () => {
    const far = pose(0, 0).position.distanceTo(OPENING_CENTER)
    const near = pose(segmentRange('protostar').end, 0).position.distanceTo(OPENING_CENTER)
    expect(far).toBeGreaterThan(50)
    expect(near).toBeLessThan(12)
  })

  it('looks toward the star throughout the opening', () => {
    for (const p of [0, 0.1, 0.3, 0.7, 1]) {
      const { look } = pose(p, 0)
      expect(look.distanceTo(OPENING_CENTER)).toBeLessThan(2)
    }
  })
})
