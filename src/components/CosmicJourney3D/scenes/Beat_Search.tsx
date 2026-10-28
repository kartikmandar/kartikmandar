// src/components/CosmicJourney3D/scenes/Beat_Search.tsx
'use client'

// Beat 5 · Searching for the Right Trajectory (Act I, spark).
// A young star made of light, ringed by candidate orbits drawn as dotted light
// paths. Each carries a small probe and flickers like an option being weighed.
// One by one the candidates fade; the survivor brightens, its probe peels off
// the orbit and leads a solid light path toward a new star system in the
// distance (the hand-off into Act II). The typed phrases live in the DOM overlay.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr, setHdr } from '../art/palette'
import { createRimMaterial, getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, pulse, ramp, seeded } from '../art/anim'

const STAR = new THREE.Vector3(-1.2, 0.95, -1.8)
const STAR_RADIUS = 0.3
const NEW_SYSTEM = new THREE.Vector3(3.1, 2.45, -4.6)
const ORBIT_SAMPLES = 256

interface Candidate {
  /** Semi-major axis. */
  a: number
  /** Eccentricity. */
  e: number
  /** Orbit-plane orientation (the orbit is built in XZ with the star at a focus). */
  rot: [number, number, number]
  /** Flicker frequency (rad/s) and the order in which it gives up. */
  flicker: number
  fadeAt: number
}

// Five candidate trajectories. Index SURVIVOR is the one that holds.
const CANDIDATES: Candidate[] = [
  { a: 1.05, e: 0.12, rot: [0.72, 0.3, 0.22], flicker: 3.1, fadeAt: 0.4 },
  { a: 1.55, e: 0.38, rot: [0.62, -0.5, -0.28], flicker: 2.3, fadeAt: 0.3 },
  { a: 1.95, e: 0.22, rot: [0.78, 2.6, 0.12], flicker: 1.7, fadeAt: 0 },
  { a: 1.35, e: 0.55, rot: [0.92, 1.3, 0.42], flicker: 3.7, fadeAt: 0.34 },
  { a: 2.15, e: 0.42, rot: [0.58, -1.7, -0.36], flicker: 2.7, fadeAt: 0.45 },
]
const SURVIVOR = 2

function orbitPoints(c: Candidate): THREE.Vector3[] {
  const euler = new THREE.Euler(c.rot[0], c.rot[1], c.rot[2])
  const pts: THREE.Vector3[] = []
  const semiLatus = c.a * (1 - c.e * c.e)
  for (let i = 0; i <= ORBIT_SAMPLES; i++) {
    const nu = (i / ORBIT_SAMPLES) * Math.PI * 2
    const r = semiLatus / (1 + c.e * Math.cos(nu))
    pts.push(new THREE.Vector3(r * Math.cos(nu), 0, r * Math.sin(nu)).applyEuler(euler).add(STAR))
  }
  return pts
}

function ringPoints(radius: number, tilt: number, center: THREE.Vector3): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const euler = new THREE.Euler(tilt, 0, 0.18)
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius).applyEuler(euler).add(center))
  }
  return pts
}

// Ambient star dust: soft additive points that twinkle on the clock.
const DUST_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  varying float vTwinkle;
  void main() {
    vTwinkle = 0.55 + 0.45 * sin(uTime * (0.6 + aSeed * 1.4) + aSeed * 40.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (0.5 + aSeed) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`
const DUST_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vTwinkle;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    gl_FragColor = vec4(uColor * a * vTwinkle * uOpacity, 1.0);
  }
`

function dustGeometry(count: number): THREE.BufferGeometry {
  const pos = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (seeded(i, 11) - 0.5) * 11
    pos[i * 3 + 1] = -1.2 + seeded(i, 12) * 5.2
    pos[i * 3 + 2] = -6 + seeded(i, 13) * 6.5
    seed[i] = seeded(i, 14)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  return g
}

// Module-level scratch: no allocation inside useFrame.
const _pos = new THREE.Vector3()
const _color = new THREE.Color()
const BLUE = new THREE.Color(PALETTE.stellarBlue)
const SIGNAL = new THREE.Color(PALETTE.signal)

function sampleLoop(out: THREE.Vector3, pts: readonly THREE.Vector3[], f: number): THREE.Vector3 {
  const n = pts.length - 1
  const x = ((f % 1) + 1) % 1 * n
  const i = Math.floor(x)
  return out.lerpVectors(pts[i]!, pts[Math.min(n, i + 1)]!, x - i)
}

function samplePath(out: THREE.Vector3, pts: readonly THREE.Vector3[], f: number): THREE.Vector3 {
  const n = pts.length - 1
  const x = Math.max(0, Math.min(1, f)) * n
  const i = Math.min(n - 1, Math.floor(x))
  return out.lerpVectors(pts[i]!, pts[i + 1]!, x - i)
}

export default function Beat_Search({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const orbitsRef = useRef<THREE.Group>(null)
  const probesRef = useRef<THREE.Group>(null)
  const departRef = useRef<LightLineObject>(null)
  const starGlowRef = useRef<THREE.Sprite>(null)
  const newStarRef = useRef<THREE.Group>(null)
  const newGlowRef = useRef<THREE.Sprite>(null)
  const newRingsRef = useRef<THREE.Group>(null)
  const dustRef = useRef<THREE.Points>(null)
  const labelRef = useRef<THREE.Mesh & { fillOpacity: number }>(null)

  const orbits = useMemo(() => CANDIDATES.map(orbitPoints), [])

  // The departure: leave the survivor orbit where its heading best points at
  // the new system, then curve out to it on a cubic Bezier.
  const departure = useMemo(() => {
    const pts = orbits[SURVIVOR]!
    const tangent = new THREE.Vector3()
    const toward = new THREE.Vector3()
    let best = 0
    let bestScore = -Infinity
    for (let i = 0; i < ORBIT_SAMPLES; i++) {
      tangent.subVectors(pts[i + 1]!, pts[i]!).normalize()
      toward.subVectors(NEW_SYSTEM, pts[i]!).normalize()
      const score = tangent.dot(toward)
      if (score > bestScore) {
        bestScore = score
        best = i
      }
    }
    const p0 = pts[best]!.clone()
    const dir = new THREE.Vector3().subVectors(pts[best + 1]!, pts[best]!).normalize()
    const p1 = p0.clone().addScaledVector(dir, 1.6)
    const p3 = NEW_SYSTEM.clone().add(new THREE.Vector3(-0.42, -0.08, 0.3))
    const p2 = p3.clone().add(new THREE.Vector3(-1.3, -0.5, 0.9))
    const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3)
    return { leaveAt: best / ORBIT_SAMPLES, points: curve.getPoints(90) }
  }, [orbits])

  const newRings = useMemo(() => [ringPoints(0.55, 0.62, NEW_SYSTEM), ringPoints(0.9, 0.62, NEW_SYSTEM)], [])

  const starMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.stellarBlue, 0.45),
    rim: hdr(PALETTE.nearWhite, GLOW.hero),
    power: 1.6,
  }))
  const newStarMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.signal, 0.35),
    rim: hdr(PALETTE.nearWhite, GLOW.hero),
    power: 1.8,
  }))

  const dustCount = quality === 'mobile' ? 100 : quality === 'low' ? 200 : 400
  const dustGeo = useDisposable(() => dustGeometry(dustCount), [dustCount])
  const dustMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uColor: { value: hdr(PALETTE.stellarBlue, GLOW.dim) },
      uTime: { value: 0 },
      uSize: { value: 22 },
      uOpacity: { value: 0 },
    },
    vertexShader: DUST_VERT,
    fragmentShader: DUST_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock

    const appear = ease(p, 0.0, 0.2)
    setUniform(dustRef.current, 'uTime', t)
    setUniform(dustRef.current, 'uOpacity', appear)

    const starGlow = starGlowRef.current
    if (starGlow) {
      const breathe = 0.9 + 0.1 * Math.sin(t * 0.8)
      ;(starGlow.material as THREE.SpriteMaterial).opacity = (0.4 + 0.6 * appear) * breathe * (1 - 0.35 * ease(p, 0.7, 1))
    }

    // Candidates: each draws on, flickers while being weighed, then gives up in turn.
    const choose = ease(p, 0.5, 0.62)
    const orbitsGroup = orbitsRef.current
    const probes = probesRef.current
    for (let i = 0; i < CANDIDATES.length; i++) {
      const c = CANDIDATES[i]!
      const line = (orbitsGroup?.children[i] ?? null) as LightLineObject | null
      const probe = (probes?.children[i] ?? null) as THREE.Sprite | null
      const draw = ease(p, 0.04 + i * 0.03, 0.22 + i * 0.03)
      setLineReveal(line, draw)
      // Flicker on the clock and on scroll (so a still frame still varies per candidate).
      const flick = 0.5 + 0.5 * Math.sin(t * c.flicker + p * 31 + i * 1.9)
      if (i === SURVIVOR) {
        const steady = 0.55 + 0.25 * flick * (1 - choose)
        setLineOpacity(line, draw * (steady + 0.45 * choose))
        if (line) {
          // Brighten: base stellar blue to a hero signal cyan as it is chosen.
          _color.lerpColors(BLUE, SIGNAL, choose)
          setHdr((line.material as THREE.Material & { color: THREE.Color }).color, _color, GLOW.base + (GLOW.hero - GLOW.base) * choose)
        }
      } else {
        const fade = 1 - ease(p, 0.3 + c.fadeAt * 0.5, 0.42 + c.fadeAt * 0.5)
        setLineOpacity(line, draw * (0.3 + 0.45 * flick) * fade)
        if (probe) {
          const visible = draw * fade
          probe.visible = visible > 0.01
          ;(probe.material as THREE.SpriteMaterial).opacity = visible * (0.5 + 0.5 * flick)
          // Ambient orbit on the clock, nudged by scroll.
          sampleLoop(_pos, orbits[i]!, seeded(i, 3) + t * 0.035 * (1 + i * 0.2) + p * 0.4)
          probe.position.copy(_pos)
        }
      }
    }

    // Survivor probe: rides its orbit up to the departure point, then leaves.
    const leave = ease(p, 0.56, 0.95)
    const survivorProbe = (probes?.children[SURVIVOR] ?? null) as THREE.Sprite | null
    if (survivorProbe) {
      const approach = ease(p, 0.08, 0.56)
      if (leave <= 0) {
        sampleLoop(_pos, orbits[SURVIVOR]!, departure.leaveAt - (1 - approach) * 1.15)
      } else {
        samplePath(_pos, departure.points, leave)
      }
      survivorProbe.position.copy(_pos)
      const s = 0.42 + 0.3 * choose
      survivorProbe.scale.set(s, s, 1)
      ;(survivorProbe.material as THREE.SpriteMaterial).opacity = ease(p, 0.06, 0.2) * (0.7 + 0.3 * choose)
    }
    setLineReveal(departRef.current, leave)

    // The new system: faint at first, then answering as the probe arrives.
    const arrive = ease(p, 0.6, 0.9)
    const newStar = newStarRef.current
    if (newStar) {
      newStar.visible = p > 0.35
      const s = 0.4 + 0.6 * ease(p, 0.4, 0.75)
      newStar.scale.set(s, s, s)
    }
    const newGlow = newGlowRef.current
    if (newGlow) {
      const flare = pulse(p, 0.84, 1.0)
      ;(newGlow.material as THREE.SpriteMaterial).opacity = ease(p, 0.38, 0.7) * (0.5 + 0.5 * arrive) + 0.3 * flare
    }
    const rings = newRingsRef.current
    if (rings) {
      for (let i = 0; i < rings.children.length; i++) {
        const ring = rings.children[i] as LightLineObject
        setLineReveal(ring, ease(p, 0.66 + i * 0.06, 0.86 + i * 0.05))
        setLineOpacity(ring, 0.85 * ramp(p, 0.66, 0.7))
      }
    }
    if (labelRef.current) labelRef.current.fillOpacity = ease(p, 0.72, 0.84) * 0.7
  })

  return (
    <group>
      <points ref={dustRef} geometry={dustGeo} material={dustMat} frustumCulled={false} />

      {/* The young star */}
      <mesh position={STAR} material={starMat}>
        <sphereGeometry args={[STAR_RADIUS, 40, 40]} />
      </mesh>
      <GlowSprite ref={starGlowRef} position={[STAR.x, STAR.y, STAR.z]} color={PALETTE.stellarBlue} intensity={GLOW.hero} size={2.6} opacity={0.4} />

      {/* Candidate orbits: dotted light paths */}
      <group ref={orbitsRef}>
        {orbits.map((pts, i) => (
          <LightLine
            key={i}
            points={pts}
            color={PALETTE.stellarBlue}
            intensity={GLOW.base}
            width={i === SURVIVOR ? 0.02 : 0.016}
            opacity={0}
            dashed
            dashSize={0.035}
            gapSize={0.07}
          />
        ))}
      </group>

      {/* One probe per candidate */}
      <group ref={probesRef}>
        {CANDIDATES.map((_, i) => (
          <GlowSprite
            key={i}
            color={i === SURVIVOR ? PALETTE.nearWhite : PALETTE.stellarBlue}
            intensity={i === SURVIVOR ? GLOW.hot : GLOW.hero}
            size={i === SURVIVOR ? 0.5 : 0.32}
            opacity={0}
          />
        ))}
      </group>

      {/* The surviving trajectory, leaving for the new system */}
      <LightLine ref={departRef} points={departure.points} color={PALETTE.signal} intensity={GLOW.hero} width={0.024} />

      {/* The new star system ahead */}
      <group ref={newStarRef} position={NEW_SYSTEM} visible={false}>
        <mesh material={newStarMat}>
          <sphereGeometry args={[0.16, 32, 32]} />
        </mesh>
      </group>
      <GlowSprite ref={newGlowRef} position={[NEW_SYSTEM.x, NEW_SYSTEM.y, NEW_SYSTEM.z]} color={PALETTE.signal} intensity={GLOW.hero} size={1.9} opacity={0} />
      <group ref={newRingsRef}>
        {newRings.map((pts, i) => (
          <LightLine key={i} points={pts} color={PALETTE.signal} intensity={GLOW.base} width={0.012} opacity={0} />
        ))}
      </group>

      <Label ref={labelRef} position={[NEW_SYSTEM.x - 0.1, NEW_SYSTEM.y + 0.85, NEW_SYSTEM.z]} color={PALETTE.signal} opacity={0}>
        IISER Bhopal
      </Label>
    </group>
  )
}
