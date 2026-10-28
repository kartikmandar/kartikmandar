// src/components/CosmicJourney3D/scenes/Beat_LoneTrajectory.tsx
'use client'

// Beat 16 · The BS Exit Decision (Act III, ignition).
// A small mote of light circles a warm star on a bright, safe orbit. Partway
// through the hold it peels away on the tangent and drifts, with a slight
// hesitation, out into dark space. The view follows it, so the star and its
// orbit slide off and dim behind. Ahead there are only faint navigation beacons
// blinking out of step and a fan of thin, dashed maybes. Candid, not triumphant.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { createRimMaterial, getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, ramp, seeded } from '../art/anim'

const STAR = new THREE.Vector3(-1.7, 1.0, -1.9)
const STAR_RADIUS = 0.42
const ORBIT_RADIUS = 1.35
// Orbit plane: U along x, V tipped toward the camera, so the circle reads as an ellipse.
const ORBIT_TILT = 1.18
const ORBIT_U = new THREE.Vector3(1, 0, 0)
const ORBIT_V = new THREE.Vector3(0, Math.cos(ORBIT_TILT), Math.sin(ORBIT_TILT))
// The subject leaves at the far side of the orbit, where its velocity points +x.
const DEPART_ANGLE = -Math.PI / 2
const ORBIT_TURNS = 1.25
const ORBIT_END_P = 0.38
const DEPART_END_P = 0.98
// How far the view follows the subject (the whole world slides left).
const FOLLOW_X = -1.6
const FROZEN_T = 4.2

const BEACONS: ReadonlyArray<[number, number, number]> = [
  [2.4, 2.25, -3.4],
  [3.7, 1.15, -4.6],
  [4.6, 2.75, -5.6],
  [3.2, 3.3, -6.2],
  [5.4, 1.7, -7.0],
]

function orbitPoint(out: THREE.Vector3, angle: number): THREE.Vector3 {
  return out
    .copy(STAR)
    .addScaledVector(ORBIT_U, Math.cos(angle) * ORBIT_RADIUS)
    .addScaledVector(ORBIT_V, Math.sin(angle) * ORBIT_RADIUS)
}

function cubic(out: THREE.Vector3, c: readonly THREE.Vector3[], t: number): THREE.Vector3 {
  const u = 1 - t
  return out
    .copy(c[0]!).multiplyScalar(u * u * u)
    .addScaledVector(c[1]!, 3 * u * u * t)
    .addScaledVector(c[2]!, 3 * u * t * t)
    .addScaledVector(c[3]!, t * t * t)
}

// The departure: leaves the orbit on its tangent, then bends gently away from the star.
function departureCurve(): THREE.Vector3[] {
  const p0 = orbitPoint(new THREE.Vector3(), DEPART_ANGLE)
  const tangent = ORBIT_U.clone()
  return [
    p0,
    p0.clone().addScaledVector(tangent, 1.7),
    new THREE.Vector3(2.4, 1.2, -4.2),
    new THREE.Vector3(4.0, 1.75, -5.8),
  ]
}

// Faint, dashed "maybe" paths fanning out from the trajectory toward the beacons.
function maybePaths(curve: readonly THREE.Vector3[]): THREE.Vector3[][] {
  const from = cubic(new THREE.Vector3(), curve, 0.42)
  return [0, 1, 3].map((b, i) => {
    const to = new THREE.Vector3(...BEACONS[b]!)
    const mid = from.clone().lerp(to, 0.5)
    mid.y += 0.35 * (i - 1) + 0.1
    return Array.from({ length: 25 }, (_, k) => {
      const s = k / 24
      const u = 1 - s
      return new THREE.Vector3()
        .copy(from).multiplyScalar(u * u)
        .addScaledVector(mid, 2 * u * s)
        .addScaledVector(to, s * s)
    })
  })
}

const STAR_VERT = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uSize;
  varying float vTw;
  void main() {
    vTw = 0.7 + 0.3 * sin(uTime * (0.6 + aSeed * 0.9) + aSeed * 40.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * aSize / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const STAR_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vTw;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    gl_FragColor = vec4(uColor * a * vTw * uOpacity, 1.0);
  }
`

// Sparse background stars, thinning out toward the dark side (+x, -z) where the subject heads.
function starfieldGeometry(count: number): THREE.BufferGeometry {
  const pos = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  const size = new Float32Array(count)
  let n = 0
  for (let i = 0; n < count && i < count * 6; i++) {
    const x = -9 + seeded(i, 1) * 20
    const y = -2 + seeded(i, 2) * 8
    const z = -12 + seeded(i, 3) * 9
    // keep fewer stars on the dark side
    const darkness = THREE.MathUtils.smoothstep(x, -1, 6)
    if (seeded(i, 4) < darkness * 0.75) continue
    pos[n * 3] = x
    pos[n * 3 + 1] = y
    pos[n * 3 + 2] = z
    seed[n] = seeded(i, 5)
    size[n] = 0.4 + seeded(i, 6) * seeded(i, 6) * 1.4
    n++
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  g.setDrawRange(0, n)
  return g
}

// Module-level scratch: no allocation inside useFrame.
const _pos = new THREE.Vector3()
const easeOutQuad = (x: number) => 1 - (1 - x) * (1 - x)

export default function Beat_LoneTrajectory({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const worldRef = useRef<THREE.Group>(null)
  const subjectRef = useRef<THREE.Group>(null)
  const subjectGlowRef = useRef<THREE.Sprite>(null)
  const starGlowRef = useRef<THREE.Sprite>(null)
  const orbitRef = useRef<LightLineObject>(null)
  const trailRef = useRef<LightLineObject>(null)
  const maybesRef = useRef<THREE.Group>(null)
  const beaconsRef = useRef<THREE.Group>(null)
  const starsRef = useRef<THREE.Points>(null)
  const labelRef = useRef<THREE.Mesh & { fillOpacity: number }>(null)

  const orbit = useMemo(() => Array.from({ length: 129 }, (_, i) => orbitPoint(new THREE.Vector3(), (i / 128) * Math.PI * 2)), [])
  const curve = useMemo(() => departureCurve(), [])
  const trail = useMemo(() => Array.from({ length: 97 }, (_, i) => cubic(new THREE.Vector3(), curve, i / 96)), [curve])
  const maybes = useMemo(() => maybePaths(curve), [curve])

  const starMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.starGold, 0.6),
    rim: hdr(PALETTE.nearWhite, GLOW.hero),
    power: 1.6,
  }))
  const subjectMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.nearWhite, 0.3),
    rim: hdr(PALETTE.signal, GLOW.hero),
    power: 2.0,
  }))

  const starCount = quality === 'mobile' ? 60 : quality === 'low' ? 120 : 240
  const starsGeo = useDisposable(() => starfieldGeometry(starCount), [starCount])
  const starsMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 22 },
      uMap: { value: getGlowTexture() },
      uColor: { value: hdr(PALETTE.stellarBlue, 0.7) },
      uOpacity: { value: 0 },
    },
    vertexShader: STAR_VERT,
    fragmentShader: STAR_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? FROZEN_T : beat.clock

    // The view follows the subject: the whole world slides left as it leaves.
    const world = worldRef.current
    if (world) world.position.x = FOLLOW_X * ease(p, 0.42, 1.0)

    // 1 · the safe orbit (scroll-driven, so it hands off cleanly at the tangent)
    const leaving = ramp(p, ORBIT_END_P, DEPART_END_P)
    // 2 · the drift: leaves at orbital speed, slows as it goes, with a small hesitation
    const s = easeOutQuad(leaving)
    const travel = Math.max(0, Math.min(1, s - 0.035 * Math.sin(s * Math.PI * 2)))
    const subject = subjectRef.current
    if (subject) {
      if (p < ORBIT_END_P) {
        // constant angular speed, arriving exactly at the departure point
        orbitPoint(_pos, DEPART_ANGLE - ORBIT_TURNS * Math.PI * 2 * (1 - ramp(p, 0.0, ORBIT_END_P)))
      } else {
        cubic(_pos, curve, travel)
        if (!reducedMotion) {
          _pos.y += Math.sin(t * 0.9) * 0.025 * leaving
          _pos.z += Math.sin(t * 0.63 + 1.2) * 0.02 * leaving
        }
      }
      subject.position.copy(_pos)
      subject.visible = p > 0.01
    }
    const subjectGlow = subjectGlowRef.current
    if (subjectGlow) {
      // its light wavers a little once it is out on its own
      const waver = reducedMotion ? 1 : 1 - 0.18 * leaving * (0.5 + 0.5 * Math.sin(t * 1.3) * Math.sin(t * 0.71 + 0.4))
      ;(subjectGlow.material as THREE.SpriteMaterial).opacity = ease(p, 0.0, 0.1) * (0.9 - 0.25 * leaving) * waver
    }

    // The orbit is bright while it holds, then dims behind the subject.
    const behind = ease(p, ORBIT_END_P, 0.8)
    setLineOpacity(orbitRef.current, ease(p, 0.0, 0.12) * (1 - 0.78 * behind))
    setLineReveal(trailRef.current, travel)
    setLineOpacity(trailRef.current, 0.8 - 0.35 * ease(p, 0.85, 1.0))

    const starGlow = starGlowRef.current
    if (starGlow) {
      const breathe = reducedMotion ? 1 : 0.94 + 0.06 * Math.sin(t * 0.8)
      ;(starGlow.material as THREE.SpriteMaterial).opacity = ease(p, 0.0, 0.12) * (1 - 0.55 * behind) * breathe
    }

    // 3 · what lies ahead: faint beacons, out of step with each other, and some maybes
    const ahead = ease(p, 0.42, 0.66)
    const beacons = beaconsRef.current
    if (beacons) {
      for (let i = 0; i < beacons.children.length; i++) {
        const sprite = beacons.children[i] as THREE.Sprite
        const blink = reducedMotion ? 0.6 : Math.pow(0.5 + 0.5 * Math.sin(t * (0.7 + i * 0.23) + i * 2.1), 3)
        ;(sprite.material as THREE.SpriteMaterial).opacity = ahead * (0.25 + 0.55 * blink)
      }
    }
    const maybesGroup = maybesRef.current
    if (maybesGroup) {
      const fan = ease(p, 0.5, 0.74)
      for (let i = 0; i < maybesGroup.children.length; i++) {
        const line = maybesGroup.children[i] as LightLineObject
        setLineReveal(line, fan)
        setLineOpacity(line, fan * (0.5 - 0.1 * i))
      }
    }

    setUniform(starsRef.current, 'uTime', t)
    setUniform(starsRef.current, 'uOpacity', ease(p, 0.0, 0.2))
    if (labelRef.current) labelRef.current.fillOpacity = ease(p, 0.08, 0.2) * (1 - 0.7 * behind) * 0.75
  })

  return (
    <group>
      <points ref={starsRef} geometry={starsGeo} material={starsMat} frustumCulled={false} />

      <group ref={worldRef}>
        {/* The warm star and the safe orbit around it */}
        <mesh position={STAR} material={starMat}>
          <sphereGeometry args={[STAR_RADIUS, 40, 40]} />
        </mesh>
        <GlowSprite ref={starGlowRef} position={[STAR.x, STAR.y, STAR.z]} color={PALETTE.starGold} intensity={GLOW.hero} size={3.4} opacity={0} />
        <LightLine ref={orbitRef} points={orbit} color={PALETTE.starGold} intensity={1.7} width={0.022} opacity={0} />

        {/* The lone trajectory, drawn behind the subject */}
        <LightLine ref={trailRef} points={trail} color={PALETTE.nearWhite} intensity={GLOW.base} width={0.012} />

        {/* Possible paths: thin, dashed, unconfirmed */}
        <group ref={maybesRef}>
          {maybes.map((pts, i) => (
            <LightLine key={i} points={pts} color={PALETTE.signal} intensity={GLOW.base} width={0.008} dashed dashSize={0.07} gapSize={0.13} opacity={0} />
          ))}
        </group>

        {/* Navigation beacons ahead, faint */}
        <group ref={beaconsRef}>
          {BEACONS.map((b, i) => (
            <GlowSprite key={i} position={b} color={PALETTE.signal} intensity={1.3} size={0.42 + 0.12 * (i % 2)} opacity={0} />
          ))}
        </group>

        {/* The subject */}
        <group ref={subjectRef} visible={false}>
          <mesh material={subjectMat}>
            <sphereGeometry args={[0.055, 20, 20]} />
          </mesh>
          <GlowSprite ref={subjectGlowRef} color={PALETTE.nearWhite} intensity={GLOW.hero} size={0.55} opacity={0} />
        </group>

        <Label ref={labelRef} position={[STAR.x, STAR.y + 1.15, STAR.z]} color={PALETTE.starGold} opacity={0}>
          BS · Physics
        </Label>
      </group>
    </group>
  )
}
