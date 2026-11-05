// src/components/CosmicJourney3D/openingCamera.ts
// The opening's camera, as a pure function of scroll. The opening's world sits
// behind the flight's first camera position (positive z), so when the flight
// starts it is out of view. Over the opening the camera closes in from the
// whole cloud to one collapsing clump; over the hand-off band it glides past the
// young star and settles exactly on ORIGIN_ANCHOR, where the flight begins.

import * as THREE from 'three'
import { ORIGIN_ANCHOR } from './beatsMeta'
import { segmentRange } from './openingStory'
import { HANDOFF_ARRIVE } from './openingScroll'
import { ease, ramp } from './art/anim'

/** Where the followed clump, and later the star, sits. */
export const OPENING_CENTER = new THREE.Vector3(0, 0, 40)

/** Camera offsets from OPENING_CENTER: the whole cloud, the clumps, then close on the young star. */
const CLOUD_VIEW = new THREE.Vector3(0, 6, 75)
const CLUMPS_VIEW = new THREE.Vector3(0, 3, 34)
const STAR_DISTANCE = 9
const STAR_HEIGHT = 2.6
/** Over the planets the camera rises, so the orbits open out instead of lying edge-on. */
const PLANETS_DISTANCE = 8.2
const PLANETS_HEIGHT = 5.4
/** Late in a star's life its ejecta (a nebula, a supernova) outgrow the close view: the camera backs away. */
const ENDING_PULLBACK = 3.6
const ENDING_RISE = 1.2
/** How far the close view drifts round the star (radians) while the rest of the opening plays. */
const ORBIT = 0.5
/** The close view looks a little below the star, so it sits above the centred copy. */
const STAR_LOOK_DROP = 1.6
/** Seen from higher up, the disk spreads down the screen: look further below it to keep it above the copy. */
const PLANETS_LOOK_DROP = 3.1
/** The hand-off passes beside the star, off its jets and disk, on the way to the origin. */
const PASS_BY = new THREE.Vector3(5, 1.5, -4)

const CLOUD = segmentRange('cloud')
const PROTOSTAR = segmentRange('protostar')
const PLANETS = segmentRange('planets')
const PATH = segmentRange('path')

const _a = new THREE.Vector3()
const _b = new THREE.Vector3()
const _c = new THREE.Vector3()
const _look = new THREE.Vector3()
const ORIGIN_POSITION = new THREE.Vector3(...ORIGIN_ANCHOR.position)
const ORIGIN_LOOK = new THREE.Vector3(...(ORIGIN_ANCHOR.lookAt ?? [0, 0, 0]))

/** The close view at opening progress `p` (after the protostar segment), in world space. */
/** 0..1 how far the camera has risen over the planets. */
const riseAt = (p: number) => ease(p, PLANETS.start, PLANETS.start + (PLANETS.end - PLANETS.start) / 3)

function closeView(p: number, out: THREE.Vector3): THREE.Vector3 {
  const angle = ORBIT * ramp(p, PROTOSTAR.end, 1)
  const rise = riseAt(p)
  const pull = ease(p, PATH.start + 0.5 * (PATH.end - PATH.start), PATH.start + 0.7 * (PATH.end - PATH.start))
  const distance = STAR_DISTANCE + (PLANETS_DISTANCE - STAR_DISTANCE) * rise + ENDING_PULLBACK * pull
  const height = STAR_HEIGHT + (PLANETS_HEIGHT - STAR_HEIGHT) * rise + ENDING_RISE * pull
  return out.set(Math.sin(angle) * distance, height, Math.cos(angle) * distance).add(OPENING_CENTER)
}

/**
 * Writes the camera position and look target for the opening (0..1) and the
 * hand-off (0..1) into `position` and `look`, without allocating.
 */
export function openingCameraPose(opening: number, handoff: number, position: THREE.Vector3, look: THREE.Vector3): void {
  const p = Math.max(0, Math.min(1, opening))
  // Opening: a slow push into the cloud, then in to the followed clump, then a gentle drift round it.
  if (p <= CLOUD.end) {
    position.lerpVectors(CLOUD_VIEW, CLUMPS_VIEW, ease(p, CLOUD.start, CLOUD.end)).add(OPENING_CENTER)
  } else if (p <= PROTOSTAR.end) {
    _a.copy(CLUMPS_VIEW).add(OPENING_CENTER)
    closeView(PROTOSTAR.end, _b)
    position.lerpVectors(_a, _b, ease(p, PROTOSTAR.start, PROTOSTAR.end))
  } else {
    closeView(p, position)
  }
  const drop = STAR_LOOK_DROP * ease(p, PROTOSTAR.start, PROTOSTAR.end) + (PLANETS_LOOK_DROP - STAR_LOOK_DROP) * riseAt(p)
  look.copy(OPENING_CENTER).setY(OPENING_CENTER.y - drop)

  const h = Math.max(0, Math.min(1, handoff))
  if (h <= 0) return
  // Hand-off: a quadratic curve from the close view, past the star, onto the flight's first position,
  // arriving early enough to hold there on the night sky before beat 1.
  const t = ease(h, 0, HANDOFF_ARRIVE)
  _a.copy(position)
  _b.copy(PASS_BY).add(OPENING_CENTER)
  _c.copy(_a).lerp(_b, t)
  _b.lerp(ORIGIN_POSITION, t)
  position.copy(_c.lerp(_b, t))
  _look.copy(look)
  look.copy(_look.lerp(ORIGIN_LOOK, ease(h, 0.1, HANDOFF_ARRIVE - 0.05)))
}
