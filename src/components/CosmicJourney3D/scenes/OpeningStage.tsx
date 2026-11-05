// src/components/CosmicJourney3D/scenes/OpeningStage.tsx
'use client'

// The opening, made of light (O1-O4 in the stellar opening spec).
// A cold molecular filament: dark dust that hides the stars behind it, its
// edges faintly lit. Its densest knots fall in, inside-out, and one is followed.
// A core heats up inside a dusty cocoon, seen reddened. Gas that can't fall
// straight in settles into a disk that shears as Kepler demands (inner orbits
// faster), and two jets with moving knots punch cavities out of the cocoon,
// ending in red shocks. Then the visitor's choice of mass (O5) changes the
// star's size, colour and feeding; dust in the disk grows into planets, giants
// beyond the snow line, while the gas clears (O6); and the core ignites (O7),
// taking the colour of its mass. Motion lives in the shaders; buffers are built once.

import { useCallback, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { QualityTier } from '../types'
import { journeyFrame } from '../store'
import { handoffPresence } from '../openingScroll'
import { PALETTE, GLOW, hdr, setHdr } from '../art/palette'
import { getGlowTexture, NOISE_GLSL, useDisposable } from '../art/materials'
import { GlowSprite } from '../art/GlowSprite'
import { ease, limitRamp, seeded } from '../art/anim'
import { OPENING_CENTER } from '../openingCamera'
import { createOpeningStage, openingStage } from '../openingStage'
import { segmentRange, type StarPathId } from '../openingStory'
import { pathForMass, starStore } from '../starChoice'
import { blackbodyRgb, drawnBrightness, drawnDiskScale, drawnRadius, drawnSpin, surfaceTemperature } from '../starLook'
import { readCapture } from '../capture'
import { createPathStates, pathProgress, pathStar } from '../pathStage'
import { SunPath } from './SunPath'
import { MassivePath } from './MassivePath'
import { VeryMassivePath } from './VeryMassivePath'
import { RedDwarfPath } from './RedDwarfPath'
import { BrownDwarfPath } from './BrownDwarfPath'
import { FirstStarsPath } from './FirstStarsPath'
import OriginBlackHole, { type BlackHoleLook } from './OriginBlackHole'
import { createVeryMassivePath, veryMassivePath } from '../pathStage'

const COUNTS: Record<QualityTier, { cloud: number; octaves: number; fragments: number; disk: number; jets: number }> = {
  high: { cloud: 7, octaves: 4, fragments: 9000, disk: 14000, jets: 2400 },
  low: { cloud: 5, octaves: 4, fragments: 6000, disk: 8000, jets: 1500 },
  mobile: { cloud: 4, octaves: 3, fragments: 3000, disk: 4500, jets: 900 },
}

/** The filament's spine, in stage space (the followed clump sits at the origin). */
function spine(x: number, out: THREE.Vector3): THREE.Vector3 {
  return out.set(x, 1.8 * Math.sin(x * 0.17), 3 * (Math.sin(x * 0.09 + 1) - Math.sin(1)))
}
const FILAMENT_HALF_LENGTH = 38
/** Clumps along the spine; index FOLLOWED is the one the camera closes on. */
const CLUMP_X = [-27, -18, -9.5, 0, 8.5, 17, 26]
const FOLLOWED = 3
const CLUMPS = CLUMP_X.map((x) => spine(x, new THREE.Vector3()))
/** Gas within this distance (in x) of a clump falls into it; the rest stays diffuse. */
const CAPTURE_X = 5.5
const ENVELOPE_RADIUS = 2.2
const DISK_INNER = 0.3
const DISK_OUTER = 3.2
const JET_LENGTH = 7
/** Disk and jets tilt a little toward the camera: close to edge-on, as young disks are usually pictured, with leaning jets. */
const TILT: [number, number, number] = [0.16, 0, 0.22]
/** Up to here the protostar is any young star; from the choice on it shows the chosen mass. */
const CHOICE = segmentRange('choice')

interface PlanetSeed {
  /** Orbit radius, in the Sun's disk units (DISK_INNER..DISK_OUTER). */
  radius: number
  size: number
  phase: number
  giant: boolean
  tint: string
}
/** Worlds are drawn far larger than their orbits allow, or none would be visible at all. */
const WORLD_SCALE = 1.35
const rock = (radius: number, size: number, phase: number): PlanetSeed => ({ radius, size: size * WORLD_SCALE, phase, giant: false, tint: '#8f8579' })
const giant = (radius: number, size: number, phase: number, tint: string): PlanetSeed => ({ radius, size: size * WORLD_SCALE, phase, giant: true, tint })
/**
 * What each path's disk makes (§3.1, line 7): rocky worlds inside the snow
 * line and giants beyond it round the Sun and red dwarfs, a couple of small
 * worlds round a brown dwarf, and nothing round a heavy star, whose light clears
 * the disk first. Radii are in the Sun's disk units; the disk is drawn smaller
 * or larger with the mass.
 */
const PLANETS: Record<StarPathId, { snowLine: number; worlds: PlanetSeed[] }> = {
  'brown-dwarf': { snowLine: 0, worlds: [rock(0.8, 0.05, 1.2), rock(1.25, 0.06, 4.1)] },
  'red-dwarf': { snowLine: 1.45, worlds: [rock(0.6, 0.05, 0.4), rock(0.88, 0.065, 2.6), rock(1.18, 0.055, 4.9), giant(1.85, 0.13, 3.3, '#c7b08e')] },
  sun: {
    snowLine: 1.75,
    worlds: [
      rock(0.62, 0.045, 0.9), rock(0.86, 0.065, 3.4), rock(1.1, 0.07, 5.6), rock(1.4, 0.05, 2.1),
      giant(2.2, 0.2, 4.4, '#c9a77a'), giant(2.9, 0.15, 1.3, '#9fb3c4'),
    ],
  },
  massive: { snowLine: 0, worlds: [] },
  'very-massive': { snowLine: 0, worlds: [] },
  'first-stars': { snowLine: 0, worlds: [] },
}
const MAX_WORLDS = Math.max(...Object.values(PLANETS).map((layout) => layout.worlds.length))

// --- O1: the cloud -----------------------------------------------------------

const CLOUD_VERT = /* glsl */ `
  attribute vec3 aCenter;
  attribute vec2 aSize;
  attribute float aSeed;
  varying vec2 vUv;
  varying float vSeed;
  varying float vFade;
  void main() {
    vUv = uv;
    vSeed = aSeed;
    vec4 center = modelViewMatrix * vec4(aCenter, 1.0);
    // Billboards in view space; they thin out as the camera passes through them.
    vFade = smoothstep(4.0, 16.0, -center.z);
    gl_Position = projectionMatrix * (center + vec4(position.xy * aSize, 0.0, 0.0));
  }
`
const CLOUD_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform vec3 uDust;
  uniform vec3 uRim;
  uniform float uDensity;
  uniform float uTime;
  uniform int uOctaves;
  varying vec2 vUv;
  varying float vSeed;
  varying float vFade;
  float cloudFbm(vec3 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      if (i >= uOctaves) break;
      v += amp * vnoise(p);
      p *= 2.07;
      amp *= 0.5;
    }
    return v;
  }
  void main() {
    vec2 c = vUv - 0.5;
    float mask = smoothstep(0.5, 0.18, length(c));
    float d = cloudFbm(vec3(vUv * vec2(3.2, 1.8) + vSeed * 17.0, vSeed * 5.0 + uTime * 0.012));
    // Dark where dense (it hides the stars behind), with a faint lit band at the edges of the dense parts.
    float dense = smoothstep(0.36, 0.6, d) * mask;
    float rim = smoothstep(0.3, 0.38, d) * (1.0 - smoothstep(0.38, 0.46, d)) * mask;
    float k = uDensity * vFade;
    float alpha = max(dense * 0.97, rim * 0.2) * k;
    gl_FragColor = vec4(uDust + uRim * rim, alpha);
  }
`

function cloudGeometry(count: number): THREE.BufferGeometry {
  const quad = new THREE.PlaneGeometry(1, 1)
  const geometry = new THREE.InstancedBufferGeometry()
  geometry.index = quad.index
  geometry.setAttribute('position', quad.getAttribute('position'))
  geometry.setAttribute('uv', quad.getAttribute('uv'))
  const centers = new Float32Array(count * 3)
  const sizes = new Float32Array(count * 2)
  const seeds = new Float32Array(count)
  const point = new THREE.Vector3()
  for (let i = 0; i < count; i++) {
    // Spread along the filament, with the last two as wide backdrops behind it.
    const backdrop = i >= count - 2
    const x = backdrop ? (i === count - 1 ? -14 : 16) : -30 + (60 * (i + 0.5)) / (count - 2)
    spine(x, point)
    centers.set([point.x + (seeded(i, 1) - 0.5) * 6, point.y + (seeded(i, 2) - 0.5) * 3, point.z + (backdrop ? -18 : (seeded(i, 3) - 0.5) * 8)], i * 3)
    const size = backdrop ? 70 : 30 + seeded(i, 4) * 16
    sizes.set([size * 1.5, size * 0.75], i * 2)
    seeds[i] = seeded(i, 5)
  }
  geometry.setAttribute('aCenter', new THREE.InstancedBufferAttribute(centers, 3))
  geometry.setAttribute('aSize', new THREE.InstancedBufferAttribute(sizes, 2))
  geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))
  geometry.instanceCount = count
  return geometry
}

// --- O2: fragmentation -------------------------------------------------------

const FRAGMENT_VERT = /* glsl */ `
  attribute vec3 aTarget;
  attribute float aDelay;
  attribute float aSeed;
  attribute float aFollowed;
  uniform float uCollapse;
  uniform float uTime;
  uniform float uSize;
  uniform float uHideFollowed;
  varying float vFall;
  varying float vSeed;
  varying float vShow;
  void main() {
    vShow = 1.0 - aFollowed * uHideFollowed;
    // Inside-out: gas near a clump's centre falls first.
    float fall = smoothstep(aDelay, aDelay + 0.4, uCollapse);
    vFall = fall * step(0.0, aDelay);
    vSeed = aSeed;
    vec3 drift = 0.35 * vec3(sin(uTime * 0.07 + aSeed * 40.0), cos(uTime * 0.05 + aSeed * 23.0), sin(uTime * 0.06 + aSeed * 11.0));
    vec3 p = mix(position + drift, aTarget, vFall * vFall);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = clamp(uSize * (0.5 + aSeed) / -mv.z, 1.0, 7.0);
    gl_Position = projectionMatrix * mv;
  }
`
const FRAGMENT_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uCold;
  uniform vec3 uWarm;
  uniform float uOpacity;
  varying float vFall;
  varying float vSeed;
  varying float vShow;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    // Compression warms the gas a little as it falls in. Still cold: a dull red, not a glow.
    vec3 col = mix(uCold, uWarm, vFall) * (0.6 + 0.4 * vSeed);
    gl_FragColor = vec4(col * a * uOpacity * vShow, 1.0);
  }
`

function fragmentGeometry(count: number): THREE.BufferGeometry {
  const positions = new Float32Array(count * 3)
  const targets = new Float32Array(count * 3)
  const delays = new Float32Array(count)
  const seeds = new Float32Array(count)
  const followed = new Float32Array(count)
  const point = new THREE.Vector3()
  for (let i = 0; i < count; i++) {
    const x = (seeded(i, 1) * 2 - 1) * FILAMENT_HALF_LENGTH
    spine(x, point)
    // Gaussian-ish cross-section (sum of uniforms), with a wider faint halo for a few.
    const width = seeded(i, 9) < 0.15 ? 8 : 3.2
    const gy = (seeded(i, 2) + seeded(i, 3) + seeded(i, 4) - 1.5) * width
    const gz = (seeded(i, 5) + seeded(i, 6) + seeded(i, 7) - 1.5) * width
    positions.set([point.x, point.y + gy, point.z + gz], i * 3)
    seeds[i] = seeded(i, 8)
    let nearest = 0
    for (let c = 1; c < CLUMPS.length; c++) if (Math.abs(CLUMP_X[c]! - x) < Math.abs(CLUMP_X[nearest]! - x)) nearest = c
    const clump = CLUMPS[nearest]!
    const offset = Math.hypot(x - clump.x, gy, gz)
    if (Math.abs(x - clump.x) < CAPTURE_X && offset < 7) {
      // Falls into its clump, to a small ball (the followed one stays inside the cocoon).
      const radius = (nearest === FOLLOWED ? 1.6 : 1.1) * (0.15 + 0.85 * seeds[i]! * seeds[i]!)
      const theta = seeded(i, 10) * Math.PI * 2
      const u = seeded(i, 11) * 2 - 1
      const s = Math.sqrt(1 - u * u)
      targets.set([clump.x + Math.cos(theta) * s * radius, clump.y + u * radius, clump.z + Math.sin(theta) * s * radius], i * 3)
      delays[i] = Math.min(0.6, (offset / 7) * 0.6)
      followed[i] = nearest === FOLLOWED ? 1 : 0
    } else {
      targets.set([point.x, point.y + gy, point.z + gz], i * 3)
      delays[i] = -1
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aTarget', new THREE.BufferAttribute(targets, 3))
  geometry.setAttribute('aDelay', new THREE.BufferAttribute(delays, 1))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  geometry.setAttribute('aFollowed', new THREE.BufferAttribute(followed, 1))
  return geometry
}

// --- O3: the cocoon ----------------------------------------------------------

const ENVELOPE_VERT = /* glsl */ `
  varying vec3 vObjectNormal;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vObjectNormal = normal;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
const ENVELOPE_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform vec3 uDust;
  uniform vec3 uWarm;
  uniform vec3 uRim;
  uniform float uEnvelope;
  uniform float uHeat;
  uniform float uJets;
  uniform float uTime;
  varying vec3 vObjectNormal;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float facing = abs(dot(normalize(vNormal), normalize(vView)));
    float n = fbm(vObjectNormal * 3.0 + vec3(0.0, uTime * 0.03, 0.0));
    // Thickest through the middle and soft at the edge; the jets clear cavities along the poles.
    float thick = smoothstep(0.0, 0.75, facing) * (0.55 + 0.7 * n);
    float cavity = smoothstep(0.7, 0.92, abs(vObjectNormal.y)) * uJets;
    float alpha = clamp(thick * uEnvelope * (1.0 - cavity), 0.0, 0.94);
    // The core's light scatters out through the dust, reddened; the edges catch a little cold starlight.
    vec3 col = uDust + uWarm * pow(facing, 8.0) * uHeat * (0.5 + 0.7 * n) + uRim * smoothstep(0.15, 0.45, facing) * pow(1.0 - facing, 2.0);
    gl_FragColor = vec4(col, alpha);
  }
`

// --- O4: disk and jets -------------------------------------------------------

const DISK_VERT = /* glsl */ `
  attribute float aRadius;
  attribute float aPhase;
  attribute float aSeed;
  attribute vec3 aFrom;
  uniform float uDisk;
  uniform float uClock;
  uniform float uSize;
  uniform float uPebbles;
  varying float vRadius;
  varying float vSettled;
  varying float vSeed;
  void main() {
    // Keplerian shear: angular speed falls as r^-1.5. uClock runs faster round a heavier star.
    float angle = aPhase + uClock * 0.55 * pow(aRadius, -1.5);
    float height = 0.06 * pow(aRadius, 1.25) * (aSeed * 2.0 - 1.0);
    vec3 disk = vec3(cos(angle) * aRadius, height, sin(angle) * aRadius);
    // Infalling gas: from the cocoon onto the disk, outer gas last.
    float settle = smoothstep(aSeed * 0.45, aSeed * 0.45 + 0.55, uDisk);
    vec3 p = mix(aFrom, disk, settle);
    vRadius = aRadius;
    vSettled = settle;
    vSeed = aSeed;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    // A few grains are dust: they grow into pebbles, drawn a little larger.
    float dust = step(aSeed, DUST_FRACTION) * uPebbles;
    gl_PointSize = clamp(uSize * (0.5 + aSeed + 0.7 * dust) / -mv.z, 1.0, 6.0);
    gl_Position = projectionMatrix * mv;
  }
`
const DISK_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uHot;
  uniform vec3 uCool;
  uniform float uOpacity;
  uniform float uInner;
  uniform float uOuter;
  uniform float uFeed;
  uniform float uPebbles;
  uniform float uClear;
  uniform float uInnerClear;
  uniform float uGiants;
  uniform vec2 uGaps;
  uniform vec3 uDustColor;
  varying float vRadius;
  varying float vSettled;
  varying float vSeed;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    float t = clamp((vRadius - uInner) / (uOuter - uInner), 0.0, 1.0);
    // Hotter and brighter inside, and brighter still the faster the star feeds.
    vec3 gas = mix(uHot, uCool, sqrt(t)) * pow(1.0 - 0.85 * t, 1.5) * (0.55 + 0.45 * vSeed) * mix(uFeed, 1.0, t);
    // The star's light clears the gas from the outside in; a heavy star's inner disk lasts a little longer.
    float cleared = mix(uInnerClear, uClear, smoothstep(0.7, 1.1, vRadius));
    // Giants open gaps along their orbits as they pull in gas.
    float gap = uGiants * max(1.0 - smoothstep(0.0, 0.16, abs(vRadius - uGaps.x)), 1.0 - smoothstep(0.0, 0.13, abs(vRadius - uGaps.y)));
    float dust = step(vSeed, DUST_FRACTION) * uPebbles;
    // Once the gas is gone, some of the dust stays behind as debris.
    vec3 col = gas * (1.0 - cleared) * (1.0 - gap) * (1.0 - dust) + uDustColor * dust * (1.0 - 0.8 * cleared);
    gl_FragColor = vec4(col * a * uOpacity * (0.25 + 0.75 * vSettled), 1.0);
  }
`

function diskGeometry(count: number): THREE.BufferGeometry {
  const radii = new Float32Array(count)
  const phases = new Float32Array(count)
  const seeds = new Float32Array(count)
  const from = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    // More gas inside (surface density falls with radius).
    radii[i] = DISK_INNER + (DISK_OUTER - DISK_INNER) * seeded(i, 1) ** 1.6
    phases[i] = seeded(i, 2) * Math.PI * 2
    seeds[i] = seeded(i, 3)
    const theta = seeded(i, 4) * Math.PI * 2
    const u = seeded(i, 5) * 2 - 1
    const s = Math.sqrt(1 - u * u)
    const r = ENVELOPE_RADIUS * (0.8 + 0.5 * seeded(i, 6))
    from.set([Math.cos(theta) * s * r, u * r, Math.sin(theta) * s * r], i * 3)
  }
  const geometry = new THREE.BufferGeometry()
  // Positions are computed in the shader; the attribute only sizes the draw.
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  geometry.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1))
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  geometry.setAttribute('aFrom', new THREE.BufferAttribute(from, 3))
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), ENVELOPE_RADIUS * 1.4)
  return geometry
}

/** Share of the disk's particles drawn as dust that grows into pebbles. */
const DUST_DEFINES = { DUST_FRACTION: '0.14' }

// --- O6: planets -------------------------------------------------------------

const PLANET_VERT = /* glsl */ `
  attribute vec3 aTint;
  attribute float aGiant;
  varying vec3 vNormal;
  varying vec3 vToStar;
  varying vec3 vView;
  varying vec3 vTint;
  varying float vBand;
  void main() {
    vec3 center = instanceMatrix[3].xyz;
    vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
    // The star sits at the disk's centre: light falls on each world from there.
    vToStar = normalize(normalMatrix * -center);
    vView = normalize(-mv.xyz);
    vTint = aTint;
    // Giants show faint bands of cloud.
    vBand = aGiant * sin(position.y * 13.0 + sin(position.y * 31.0) * 0.6);
    gl_Position = projectionMatrix * mv;
  }
`
const PLANET_FRAG = /* glsl */ `
  uniform vec3 uStar;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vToStar;
  varying vec3 vView;
  varying vec3 vTint;
  varying float vBand;
  void main() {
    vec3 n = normalize(vNormal);
    float lit = max(dot(n, normalize(vToStar)), 0.0);
    // A hairline of cold starlight on the night side, so unlit worlds still read as round.
    float rim = pow(1.0 - max(dot(n, normalize(vView)), 0.0), 3.0);
    vec3 tint = vTint * (1.0 + 0.12 * vBand);
    vec3 col = tint * (uStar * lit + 0.025) + vec3(0.6, 0.7, 0.9) * rim * 0.06;
    gl_FragColor = vec4(col * uOpacity, 1.0);
  }
`

function planetGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(1, 24, 16)
  const tints = new Float32Array(MAX_WORLDS * 3)
  const giants = new Float32Array(MAX_WORLDS)
  geometry.setAttribute('aTint', new THREE.InstancedBufferAttribute(tints, 3))
  geometry.setAttribute('aGiant', new THREE.InstancedBufferAttribute(giants, 1))
  return geometry
}

function circleGeometry(segments: number): THREE.BufferGeometry {
  const points = new Float32Array(segments * 3)
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    points.set([Math.cos(angle), 0, Math.sin(angle)], i * 3)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(points, 3))
  return geometry
}

const JET_VERT = /* glsl */ `
  attribute float aSeed;
  attribute float aSide;
  attribute vec2 aJitter;
  uniform float uJets;
  uniform float uTime;
  uniform float uSize;
  uniform float uLength;
  varying float vAlong;
  varying float vKnot;
  void main() {
    // Gas streams outward at a steady speed; the jet grows to full length as it switches on.
    float speed = 1.4;
    float along = fract(aSeed * 7.13 + uTime * speed / uLength);
    float y = along * uLength * uJets;
    // Collimated, opening only slightly with distance.
    float width = 0.05 + 0.035 * y;
    vec3 p = vec3(aJitter.x * width, aSide * (0.3 + y), aJitter.y * width);
    vAlong = along;
    // Knots move with the flow (a pattern in y - speed * t).
    vKnot = pow(0.5 + 0.5 * sin((y - uTime * speed) * 2.2 + aSide), 6.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = clamp(uSize * (0.6 + 0.8 * vKnot) / -mv.z, 1.0, 5.0);
    gl_Position = projectionMatrix * mv;
  }
`
const JET_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlong;
  varying float vKnot;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    float fade = sqrt(1.0 - vAlong);
    gl_FragColor = vec4(uColor * a * fade * (0.35 + 0.9 * vKnot) * uOpacity, 1.0);
  }
`

function jetGeometry(count: number): THREE.BufferGeometry {
  const seeds = new Float32Array(count)
  const sides = new Float32Array(count)
  const jitter = new Float32Array(count * 2)
  for (let i = 0; i < count; i++) {
    seeds[i] = seeded(i, 1)
    sides[i] = i % 2 === 0 ? 1 : -1
    const angle = seeded(i, 2) * Math.PI * 2
    const r = Math.sqrt(seeded(i, 3))
    jitter.set([Math.cos(angle) * r, Math.sin(angle) * r], i * 2)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  geometry.setAttribute('aSide', new THREE.BufferAttribute(sides, 1))
  geometry.setAttribute('aJitter', new THREE.BufferAttribute(jitter, 2))
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), JET_LENGTH + 1)
  return geometry
}

const pointsMaterial = (vertexShader: string, fragmentShader: string, uniforms: Record<string, THREE.IUniform>, defines: Record<string, string> = {}) =>
  new THREE.ShaderMaterial({
    uniforms: { uMap: { value: getGlowTexture() }, uTime: { value: 0 }, uOpacity: { value: 1 }, ...uniforms },
    defines,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

const uniformsOf = (object: THREE.Object3D | null) => ((object as THREE.Mesh | null)?.material as THREE.ShaderMaterial | undefined)?.uniforms

// Module-level scratch: no allocation inside useFrame.
const CORE_COOL = new THREE.Color(PALETTE.emberDeep)
const CORE_WARM = new THREE.Color(PALETTE.ember)
const _mixed = new THREE.Color()
const _star = new THREE.Color()
const _rgb = { r: 1, g: 1, b: 1 }
const _matrix = new THREE.Matrix4()
const _tint = new THREE.Color()
/** Background haze, well behind the filament (stage space). */
const HAZE: { position: [number, number, number]; scale: [number, number, number] }[] = [
  { position: [-6, 1, -30], scale: [120, 46, 1] },
  { position: [14, -2, -34], scale: [90, 34, 1] },
]

/** The star's glow multiplier runs from about 0.2 to 2.2 at an outburst's peak: the range a full ramp covers. */
const GLOW_SPAN = 2

export function OpeningStage({ quality, reducedMotion }: { quality: QualityTier; reducedMotion: boolean }) {
  const counts = COUNTS[quality]
  const stage = useMemo(() => createOpeningStage(), [])
  const pathStates = useMemo(() => createPathStates(), [])
  // The black hole reads its own copy of the very massive schedule, so it never waits a frame on this component's.
  const blackHoleState = useRef(createVeryMassivePath())
  const blackHoleLook = useRef<BlackHoleLook>({ opacity: 0, infall: 0 })
  const lookAtBlackHole = useCallback((): BlackHoleLook => {
    const f = journeyFrame
    const t = pathProgress(f.opening)
    const shown = t > 0 && f.handoff < 1 && pathForMass(starStore.getState().mass) === 'very-massive'
    const s = veryMassivePath(t, f.clock, blackHoleState.current)
    const look = blackHoleLook.current
    look.opacity = shown ? s.blackHole * handoffPresence(f.handoff) : 0
    look.infall = s.infall
    return look
  }, [])
  const rootRef = useRef<THREE.Group>(null)
  const cloudRef = useRef<THREE.Mesh>(null)
  const fragmentsRef = useRef<THREE.Points>(null)
  const envelopeRef = useRef<THREE.Mesh>(null)
  const diskRef = useRef<THREE.Points>(null)
  const jetsRef = useRef<THREE.Points>(null)
  const coreRef = useRef<THREE.Sprite>(null)
  const haloRef = useRef<THREE.Sprite>(null)
  const clumpRefs = useRef<(THREE.Sprite | null)[]>([])
  const shockRefs = useRef<(THREE.Sprite | null)[]>([])
  const hazeRefs = useRef<(THREE.Sprite | null)[]>([])
  const diskGroupRef = useRef<THREE.Group>(null)
  const planetsRef = useRef<THREE.InstancedMesh>(null)
  const snowLineRef = useRef<THREE.LineLoop>(null)
  // The drawn mass follows the chosen one smoothly (in log mass), so dragging the slider never jumps.
  const logMass = useRef(Math.log10(starStore.getState().mass))
  const diskClock = useRef(0)
  const laidOut = useRef<StarPathId | null>(null)
  const hazeColor = useMemo(() => hdr(PALETTE.stellarBlue, 0.2), [])

  const cloudGeo = useDisposable(() => cloudGeometry(counts.cloud), [counts.cloud])
  // Materials never depend on the tier: a tier change mid-precompile would dispose one compileAsync is waiting on.
  const cloudMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uOctaves: { value: 4 },
      uDust: { value: new THREE.Color('#050407') },
      uRim: { value: hdr(PALETTE.stellarBlue, 0.1) },
      uDensity: { value: 1 },
      uTime: { value: 0 },
    },
    vertexShader: CLOUD_VERT,
    fragmentShader: CLOUD_FRAG,
    transparent: true,
    depthWrite: false,
  }), [])
  const fragmentGeo = useDisposable(() => fragmentGeometry(counts.fragments), [counts.fragments])
  const fragmentMat = useDisposable(() => pointsMaterial(FRAGMENT_VERT, FRAGMENT_FRAG, {
    uCollapse: { value: 0 },
    uHideFollowed: { value: 0 },
    uSize: { value: 150 },
    uCold: { value: hdr(PALETTE.stellarBlue, 0.18) },
    uWarm: { value: hdr(PALETTE.emberDeep, 0.3) },
  }), [])
  const envelopeMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uDust: { value: new THREE.Color('#070406') },
      uWarm: { value: hdr(PALETTE.emberDeep, 0.6) },
      uRim: { value: hdr(PALETTE.stellarBlue, 0.1) },
      uEnvelope: { value: 0 },
      uHeat: { value: 0 },
      uJets: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: ENVELOPE_VERT,
    fragmentShader: ENVELOPE_FRAG,
    transparent: true,
    depthWrite: false,
  }), [])
  const diskGeo = useDisposable(() => diskGeometry(counts.disk), [counts.disk])
  const diskMat = useDisposable(() => pointsMaterial(DISK_VERT, DISK_FRAG, {
    uDisk: { value: 0 },
    uSize: { value: 30 },
    uHot: { value: hdr(PALETTE.starGold, 1.6) },
    uCool: { value: hdr(PALETTE.emberDeep, 0.5) },
    uInner: { value: DISK_INNER },
    uOuter: { value: DISK_OUTER },
    uClock: { value: 0 },
    uFeed: { value: 1 },
    uPebbles: { value: 0 },
    uClear: { value: 0 },
    uInnerClear: { value: 0 },
    uGiants: { value: 0 },
    uGaps: { value: new THREE.Vector2(-1, -1) },
    uDustColor: { value: hdr(PALETTE.starGold, 0.35) },
  }, DUST_DEFINES), [])
  const planetGeo = useDisposable(() => planetGeometry(), [])
  const planetMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: { uStar: { value: new THREE.Color() }, uOpacity: { value: 1 } },
    vertexShader: PLANET_VERT,
    fragmentShader: PLANET_FRAG,
  }), [])
  const snowGeo = useDisposable(() => circleGeometry(160), [])
  const snowMat = useDisposable(() => new THREE.LineBasicMaterial({
    color: hdr(PALETTE.stellarBlue, 0.7),
    transparent: true,
    opacity: 0,
    depthWrite: false,
    fog: false,
  }), [])
  const jetGeo = useDisposable(() => jetGeometry(counts.jets), [counts.jets])
  const jetMat = useDisposable(() => pointsMaterial(JET_VERT, JET_FRAG, {
    uJets: { value: 0 },
    uSize: { value: 26 },
    uLength: { value: JET_LENGTH },
    uColor: { value: hdr(PALETTE.hydrogen, 1.2) },
  }), [])

  /** The star's exposure as drawn (ignition, and its glow with any outburst): NaN until the opening is on screen. */
  const exposure = useRef({ ignite: NaN, glow: NaN })

  useFrame(() => {
    const f = journeyFrame
    const root = rootRef.current
    if (!root) return
    // Gone once the flight starts (drawn during warm-up so its buffers upload early).
    root.visible = f.warmup || f.handoff < 1
    if (!root.visible) {
      exposure.current.ignite = NaN
      exposure.current.glow = NaN
      return
    }
    const capture = readCapture().enabled
    const chosenMass = starStore.getState().mass
    const path = pathForMass(chosenMass)
    const s = openingStage(f.opening, f.handoff, stage, path)
    const time = reducedMotion ? 0 : f.clock
    const presence = s.presence
    // Before the choice the protostar is any young star; from the choice on it shows the chosen mass.
    const target = Math.log10(chosenMass)
    logMass.current = f.dt > 0 && !reducedMotion ? logMass.current + (target - logMass.current) * (1 - Math.exp(-f.dt * 5)) : target
    const chosen = ease(f.opening, CHOICE.start, CHOICE.start + 0.02)
    const mass = 10 ** (logMass.current * chosen)
    const spin = drawnSpin(mass)
    diskClock.current = capture ? time * spin : diskClock.current + (reducedMotion ? 0 : f.dt * spin)
    const bright = drawnBrightness(mass)
    // The path's life and ending: the star's colour, size and glow, and what becomes of its planets.
    const star = pathStar(path, pathProgress(f.opening), time, surfaceTemperature(mass), pathStates)
    blackbodyRgb(star.temperature, _rgb)
    _star.setRGB(_rgb.r, _rgb.g, _rgb.b)

    const cloud = uniformsOf(cloudRef.current)
    if (cloud) {
      cloud.uOctaves!.value = counts.octaves
      cloud.uDensity!.value = s.cloud * presence
      cloud.uTime!.value = time
    }
    hazeRefs.current.forEach((sprite) => {
      if (sprite) (sprite.material as THREE.SpriteMaterial).opacity = presence * (0.35 + 0.65 * s.cloud)
    })
    const fragments = uniformsOf(fragmentsRef.current)
    if (fragments) {
      fragments.uCollapse!.value = s.collapse
      // The followed clump's gas became the cocoon, then the star and disk: it never comes back.
      fragments.uHideFollowed!.value = Math.max(s.envelope, s.heat)
      fragments.uTime!.value = time
      // The followed clump's gas becomes the cocoon and disk; the field dims as the camera closes in.
      fragments.uOpacity!.value = presence * (1 - 0.5 * s.disk)
    }
    clumpRefs.current.forEach((sprite) => {
      if (sprite) (sprite.material as THREE.SpriteMaterial).opacity = s.collapse * presence * 0.45
    })
    const envelope = uniformsOf(envelopeRef.current)
    if (envelope) {
      envelope.uEnvelope!.value = s.envelope * presence
      envelope.uHeat!.value = s.heat
      envelope.uJets!.value = s.jets
      envelope.uTime!.value = time
    }
    if (coreRef.current && haloRef.current) {
      // Deep red while it is buried, warmer as the cocoon clears. While it feeds it already leans
      // toward its mass's colour; once it ignites it takes that colour fully (red to blue-white).
      _mixed.copy(CORE_COOL).lerp(CORE_WARM, Math.max(s.jets, s.clear))
      _mixed.lerp(_star, 0.3 * chosen + 0.7 * s.ignite)
      // Ignition is an exposure ramp, never a flash. A brown dwarf never ignites: it starts to fade instead.
      // Settled, it is drawn less hot than the buried protostar's glow, so its colour survives tone mapping.
      const feeding = GLOW.hot * (0.15 + 0.85 * s.heat) * (1 + (Math.min(1.4, bright) - 1) * chosen)
      const shining = path === 'brown-dwarf' ? GLOW.base : GLOW.hero * Math.min(1.3, bright) * 1.15
      const core = coreRef.current.material as THREE.SpriteMaterial
      // Ignition and the endings' outbursts ramp over at least 300 ms, however fast the scroll.
      const rampDt = f.warmup || capture ? 0 : f.dt
      exposure.current.ignite = limitRamp(exposure.current.ignite, s.ignite, rampDt)
      exposure.current.glow = limitRamp(exposure.current.glow, star.glow, rampDt, GLOW_SPAN)
      const { ignite, glow } = exposure.current
      setHdr(core.color, _mixed, (feeding + (shining - feeding) * ignite) * glow)
      core.opacity = Math.min(1, s.collapse * 2) * presence
      const radius = drawnRadius(mass)
      // The buried protostar's glow, then the star itself, settled and smaller.
      const coreSize = (1.1 * (1 + (0.7 + 0.3 * radius - 1) * chosen) * (1 - s.ignite) + 0.75 * radius * s.ignite) * star.glowSize
      coreRef.current.scale.set(coreSize, coreSize, 1)
      const halo = haloRef.current.material as THREE.SpriteMaterial
      setHdr(halo.color, _mixed, GLOW.base)
      halo.opacity = (s.heat * 0.6 * (1 - 0.35 * s.clear) + 0.15 * ignite * (path === 'brown-dwarf' ? 0 : 1)) * star.halo * presence
      const haloSize = 5 * (1 + (0.6 + 0.4 * radius - 1) * chosen)
      haloRef.current.scale.set(haloSize, haloSize, 1)
    }
    diskGroupRef.current?.scale.setScalar(1 + (drawnDiskScale(mass) - 1) * chosen)
    const disk = uniformsOf(diskRef.current)
    const layout = PLANETS[path]
    if (disk) {
      disk.uDisk!.value = s.disk
      disk.uClock!.value = diskClock.current
      disk.uOpacity!.value = Math.min(1, s.disk * 3) * star.debris * presence
      // A heavier star feeds faster: its inner disk burns brighter.
      disk.uFeed!.value = 1 + (Math.min(1.8, bright) - 1) * chosen
      disk.uPebbles!.value = s.pebbles
      disk.uClear!.value = s.clear
      disk.uInnerClear!.value = s.innerClear
      disk.uGiants!.value = s.giants
      const giants = layout.worlds.filter((world) => world.giant)
      ;(disk.uGaps!.value as THREE.Vector2).set(giants[0]?.radius ?? -1, giants[1]?.radius ?? -1)
    }
    const planets = planetsRef.current
    if (planets) {
      if (laidOut.current !== path) {
        // Tints change only when the path does (rarely, and never while the planets are on screen).
        laidOut.current = path
        const tints = planets.geometry.getAttribute('aTint') as THREE.InstancedBufferAttribute
        const giantFlags = planets.geometry.getAttribute('aGiant') as THREE.InstancedBufferAttribute
        layout.worlds.forEach((world, i) => {
          _tint.set(world.tint)
          tints.setXYZ(i, _tint.r, _tint.g, _tint.b)
          giantFlags.setX(i, world.giant ? 1 : 0)
        })
        tints.needsUpdate = true
        giantFlags.needsUpdate = true
      }
      planets.count = layout.worlds.length
      planets.visible = s.growth > 0 && layout.worlds.length > 0
      layout.worlds.forEach((world, i) => {
        // Planetesimals grow into planets; giants grow last, as they pull in gas.
        // A swelling star swallows the worlds inside its reach; the rest drift outward as it loses mass.
        const swallowed = world.radius < star.engulf
        const grown = swallowed ? 0 : world.giant ? s.growth * (0.3 + 0.7 * s.giants) : s.growth
        const orbit = world.radius * star.orbitScale
        const angle = world.phase + diskClock.current * 0.55 * world.radius ** -1.5
        const size = Math.max(0.0001, world.size * grown)
        _matrix.makeScale(size, size, size).setPosition(Math.cos(angle) * orbit, 0, Math.sin(angle) * orbit)
        planets.setMatrixAt(i, _matrix)
      })
      planets.instanceMatrix.needsUpdate = true
      const planetUniforms = (planets.material as THREE.ShaderMaterial).uniforms
      // Lit faintly by the young star, then fully once it shines.
      setHdr(planetUniforms.uStar!.value as THREE.Color, _star, (0.35 + 1.4 * s.ignite) * Math.min(1.5, bright))
      planetUniforms.uOpacity!.value = presence
    }
    if (snowLineRef.current) {
      snowLineRef.current.visible = s.snowLine > 0 && layout.snowLine > 0
      snowLineRef.current.scale.setScalar(layout.snowLine || 1)
      ;(snowLineRef.current.material as THREE.LineBasicMaterial).opacity = 0.5 * s.snowLine * presence
    }
    const jets = uniformsOf(jetsRef.current)
    if (jets) {
      jets.uJets!.value = s.jets
      jets.uTime!.value = time
      jets.uOpacity!.value = Math.min(1, s.jets * 4) * presence
    }
    shockRefs.current.forEach((sprite, i) => {
      if (!sprite) return
      sprite.position.y = (i === 0 ? 1 : -1) * (0.3 + JET_LENGTH * s.jets)
      ;(sprite.material as THREE.SpriteMaterial).opacity = s.jets * s.jets * presence
    })
  })

  return (
    <group ref={rootRef} position={OPENING_CENTER.toArray()}>
      {/* Outside the tilted, scaled frame: the impostor works in world units. */}
      <OriginBlackHole look={lookAtBlackHole} />
      {/* Drawn after the sky (renderOrder), so the dust hides the stars and haze behind it. */}
      {/* Faint unresolved starlight behind the filament, so the dust reads as a silhouette against it. */}
      {HAZE.map((haze, i) => (
        <sprite key={i} ref={(sprite) => { hazeRefs.current[i] = sprite }} position={haze.position} scale={haze.scale} renderOrder={1}>
          <spriteMaterial map={getGlowTexture()} color={hazeColor} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
        </sprite>
      ))}
      <mesh ref={cloudRef} geometry={cloudGeo} material={cloudMat} frustumCulled={false} renderOrder={2} />
      <points ref={fragmentsRef} geometry={fragmentGeo} material={fragmentMat} frustumCulled={false} renderOrder={3} />
      {CLUMPS.map((clump, i) => i !== FOLLOWED && (
        <GlowSprite
          key={i}
          ref={(sprite) => { clumpRefs.current[i] = sprite }}
          color={PALETTE.emberDeep}
          intensity={GLOW.dim}
          size={2.6}
          position={clump.toArray()}
          opacity={0}
        />
      ))}
      <group rotation={TILT}>
        <GlowSprite ref={haloRef} color={PALETTE.emberDeep} intensity={GLOW.base} size={5} opacity={0} />
        <GlowSprite ref={coreRef} color={PALETTE.emberDeep} intensity={GLOW.hot} size={1.1} opacity={0} />
        <mesh ref={envelopeRef} material={envelopeMat} renderOrder={4}>
          <sphereGeometry args={[ENVELOPE_RADIUS, 48, 32]} />
        </mesh>
        <group ref={diskGroupRef}>
          <points ref={diskRef} geometry={diskGeo} material={diskMat} frustumCulled={false} renderOrder={5} />
          <instancedMesh ref={planetsRef} args={[planetGeo, planetMat, MAX_WORLDS]} frustumCulled={false} visible={false} />
          <lineLoop ref={snowLineRef} geometry={snowGeo} material={snowMat} renderOrder={5} visible={false} />
          <SunPath reducedMotion={reducedMotion} />
          <MassivePath reducedMotion={reducedMotion} />
          <VeryMassivePath quality={quality} reducedMotion={reducedMotion} />
          <RedDwarfPath reducedMotion={reducedMotion} />
          <BrownDwarfPath reducedMotion={reducedMotion} />
          <FirstStarsPath reducedMotion={reducedMotion} />
        </group>
        <points ref={jetsRef} geometry={jetGeo} material={jetMat} frustumCulled={false} renderOrder={5} />
        {[0, 1].map((i) => (
          <GlowSprite
            key={i}
            ref={(sprite) => { shockRefs.current[i] = sprite }}
            color={PALETTE.hydrogen}
            intensity={GLOW.base}
            size={0.9}
            opacity={0}
          />
        ))}
      </group>
    </group>
  )
}
