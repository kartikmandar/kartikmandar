// src/components/CosmicJourney3D/scenes/Beat_SmashToCoach.tsx
'use client'

// Beat 11 · Captaincy and Injury (reference beat, Phase 1 art bible).
// A shuttlecock made of light is smashed steeply over a hairline court, leaving a
// gold trail (the captain). At impact it fractures and bursts into shards. The
// shards then drift back together, each settling as a marker along a slower,
// higher coaching arc drawn in cool chalk-light (the coach).

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr, setHdr } from '../art/palette'
import { createRimMaterial, useDisposable } from '../art/materials'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, easeInCubic, pulse, ramp, seeded } from '../art/anim'

const FLOOR_Y = -1.5
const SHARDS = 24

// Smash: high from the back court, steeply down over the net to the front court.
const SMASH = [new THREE.Vector3(-3.2, 3.0, -3.6), new THREE.Vector3(-1.0, 3.25, -2.4), new THREE.Vector3(1.5, -0.35, 0.2)] as const
// Coaching arc: a calm, high clear, drawn slowly in chalk-light.
const COACH = [new THREE.Vector3(2.3, -0.7, -0.6), new THREE.Vector3(0.2, 3.4, -2.2), new THREE.Vector3(-2.6, -0.3, -3.2)] as const

function bezier(out: THREE.Vector3, p: readonly [THREE.Vector3, THREE.Vector3, THREE.Vector3], t: number): THREE.Vector3 {
  const u = 1 - t
  return out
    .copy(p[0]).multiplyScalar(u * u)
    .addScaledVector(p[1], 2 * u * t)
    .addScaledVector(p[2], t * t)
}

function bezierTangent(out: THREE.Vector3, p: readonly [THREE.Vector3, THREE.Vector3, THREE.Vector3], t: number): THREE.Vector3 {
  // B'(t) = 2(1-t)(P1-P0) + 2t(P2-P1)
  const u = 1 - t
  return out
    .copy(p[1]).sub(p[0]).multiplyScalar(2 * u)
    .addScaledVector(p[2], 2 * t)
    .addScaledVector(p[1], -2 * t)
}

function sampleCurve(p: readonly [THREE.Vector3, THREE.Vector3, THREE.Vector3], n: number): THREE.Vector3[] {
  return Array.from({ length: n + 1 }, (_, i) => bezier(new THREE.Vector3(), p, i / n))
}

// Shuttlecock skirt in local space: cork at the origin, feathers along +Y.
function skirtPoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const feathers = 16
  for (let i = 0; i < feathers; i++) {
    const a = (i / feathers) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * 0.065, 0.05, Math.sin(a) * 0.065))
    pts.push(new THREE.Vector3(Math.cos(a) * 0.2, 0.36, Math.sin(a) * 0.2))
  }
  for (const [y, r] of [[0.15, 0.11], [0.3, 0.17]] as const) {
    const seg = 28
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2
      const a1 = ((i + 1) / seg) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a0) * r, y, Math.sin(a0) * r))
      pts.push(new THREE.Vector3(Math.cos(a1) * r, y, Math.sin(a1) * r))
    }
  }
  return pts
}

// Hairline badminton court (line segments) with the net.
function courtPoints(): THREE.Vector3[] {
  const y = FLOOR_Y
  const pts: THREE.Vector3[] = []
  const seg = (a: [number, number, number], b: [number, number, number]) => pts.push(new THREE.Vector3(...a), new THREE.Vector3(...b))
  const xs = 2.6
  const back = -5.6
  const front = 1.4
  seg([-xs, y, front], [-xs, y, back])
  seg([xs, y, front], [xs, y, back])
  seg([-xs, y, back], [xs, y, back])
  seg([-xs, y, front], [xs, y, front])
  seg([-xs, y, -3.3], [xs, y, -3.3])
  seg([-xs, y, -0.2], [xs, y, -0.2])
  seg([0, y, -3.3], [0, y, back])
  seg([0, y, -0.2], [0, y, front])
  // net
  const netZ = -1.75
  const top = -0.55
  const bottom = -0.95
  seg([-2.9, top, netZ], [2.9, top, netZ])
  seg([-2.9, bottom, netZ], [2.9, bottom, netZ])
  seg([-2.9, y, netZ], [-2.9, top, netZ])
  seg([2.9, y, netZ], [2.9, top, netZ])
  for (let x = -2.5; x <= 2.51; x += 0.42) seg([x, bottom, netZ], [x, top, netZ])
  return pts
}

// Module-level scratch: no allocation inside useFrame.
const _pos = new THREE.Vector3()
const _dir = new THREE.Vector3()
const _burst = new THREE.Vector3()
const _target = new THREE.Vector3()
const _obj = new THREE.Object3D()
const _color = new THREE.Color()
const NEG_Y = new THREE.Vector3(0, -1, 0)
const GOLD = hdr(PALETTE.starGold, GLOW.hero)
const CHALK = hdr(PALETTE.signal, GLOW.hero)

export default function Beat_SmashToCoach({ index }: BeatSceneProps) {
  const beat = useBeat(index)
  const shuttleRef = useRef<THREE.Group>(null)
  const trailRef = useRef<LightLineObject>(null)
  const coachRef = useRef<LightLineObject>(null)
  const courtRef = useRef<LightLineObject>(null)
  const impactRef = useRef<THREE.Sprite>(null)
  const shardsRef = useRef<THREE.InstancedMesh>(null)
  const captainRef = useRef<THREE.Mesh & { fillOpacity: number }>(null)
  const coachLabelRef = useRef<THREE.Mesh & { fillOpacity: number }>(null)

  const trail = useMemo(() => sampleCurve(SMASH, 72), [])
  const coach = useMemo(() => sampleCurve(COACH, 96), [])
  const skirt = useMemo(() => skirtPoints(), [])
  const court = useMemo(() => courtPoints(), [])

  // Per-shard seeds: burst velocity (xyz), spin axis (xyz), spin rate, arc slot, stagger.
  const seeds = useMemo(() => {
    const s = new Float32Array(SHARDS * 9)
    for (let i = 0; i < SHARDS; i++) {
      const o = i * 9
      s[o] = (seeded(i, 1) - 0.5) * 3.2
      s[o + 1] = seeded(i, 2) * 2.2 + 0.4
      s[o + 2] = (seeded(i, 3) - 0.5) * 2.4
      s[o + 3] = seeded(i, 4) - 0.5
      s[o + 4] = seeded(i, 5) - 0.5
      s[o + 5] = seeded(i, 6) - 0.5
      s[o + 6] = (seeded(i, 7) - 0.5) * 9
      s[o + 7] = (i + 0.5) / SHARDS // even slots along the coaching arc
      s[o + 8] = seeded(i, 8) * 0.06 // stagger
    }
    return s
  }, [])

  const shardGeo = useDisposable(() => {
    // a slender feather fragment
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0.09, 0, -0.03, -0.05, 0, 0.03, -0.05, 0]), 3))
    g.computeVertexNormals()
    return g
  })
  const shardMat = useDisposable(() => new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true }))
  const corkMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.starGold, 0.5),
    rim: hdr(PALETTE.nearWhite, GLOW.hot),
    power: 1.8,
  }))

  useLayoutEffect(() => {
    const mesh = shardsRef.current
    if (!mesh) return
    for (let i = 0; i < SHARDS; i++) mesh.setColorAt(i, GOLD)
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [])

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = beat.clock

    setLineOpacity(courtRef.current, ease(p, 0.0, 0.2) * 0.9)

    // 1 · the smash (accelerating, like a real smash)
    const travel = easeInCubic(ramp(p, 0.04, 0.42))
    setLineReveal(trailRef.current, travel)
    setLineOpacity(trailRef.current, p < 0.5 ? 1 : 1 - 0.65 * ease(p, 0.5, 0.75))

    const shuttle = shuttleRef.current
    if (shuttle) {
      shuttle.visible = p > 0.03 && p < 0.5
      bezier(_pos, SMASH, travel)
      // 2 · impact: it stops and trembles before it breaks
      const crack = ramp(p, 0.42, 0.5)
      _pos.x += Math.sin(t * 61) * 0.012 * crack
      _pos.y += Math.cos(t * 53) * 0.012 * crack
      shuttle.position.copy(_pos)
      bezierTangent(_dir, SMASH, Math.max(0.02, travel)).normalize()
      shuttle.quaternion.setFromUnitVectors(NEG_Y, _dir)
    }

    const impact = impactRef.current
    if (impact) {
      const glow = pulse(p, 0.4, 0.58)
      ;(impact.material as THREE.SpriteMaterial).opacity = glow * 0.9
      const s = 0.6 + 1.1 * glow
      impact.scale.set(s, s, 1)
    }

    // 3 · burst, then 4 · re-form along the coaching arc
    const shards = shardsRef.current
    if (shards) {
      const bursting = p >= 0.5
      shards.visible = bursting
      if (bursting) {
        const tau = ramp(p, 0.5, 0.72) * 1.3
        const tauEnd = 1.3
        const settleFade = ease(p, 0.7, 1.0)
        for (let i = 0; i < SHARDS; i++) {
          const o = i * 9
          // drag-limited flight from the impact point, with a little gravity
          const k = 2.6
          const travelBurst = (1 - Math.exp(-k * tau)) / k
          _burst.set(seeds[o]!, seeds[o + 1]!, seeds[o + 2]!).multiplyScalar(travelBurst).add(SMASH[2])
          _burst.y -= 0.35 * tau * tau
          // where this shard settles on the coaching arc
          const reform = ease(p, 0.72 + seeds[o + 8]!, 0.92 + seeds[o + 8]!)
          if (reform > 0) {
            const endFlight = (1 - Math.exp(-k * tauEnd)) / k
            _pos.set(seeds[o]!, seeds[o + 1]!, seeds[o + 2]!).multiplyScalar(endFlight).add(SMASH[2])
            _pos.y -= 0.35 * tauEnd * tauEnd
            bezier(_target, COACH, seeds[o + 7]!)
            _burst.lerpVectors(_pos, _target, reform)
          }
          _obj.position.copy(_burst)
          const spin = seeds[o + 6]! * tau * (1 - reform)
          _obj.rotation.set(seeds[o + 3]! * spin, seeds[o + 4]! * spin, seeds[o + 5]! * spin)
          const scale = 1 - 0.45 * reform
          _obj.scale.set(scale, scale, scale)
          _obj.updateMatrix()
          shards.setMatrixAt(i, _obj.matrix)
          _color.lerpColors(GOLD, CHALK, reform)
          shards.setColorAt(i, setHdr(_color, _color, 1 + 0.4 * settleFade))
        }
        shards.instanceMatrix.needsUpdate = true
        if (shards.instanceColor) shards.instanceColor.needsUpdate = true
      }
    }

    setLineReveal(coachRef.current, ease(p, 0.74, 0.96))

    if (captainRef.current) captainRef.current.fillOpacity = ease(p, 0.06, 0.18) * (1 - 0.65 * ease(p, 0.55, 0.75)) * 0.9
    if (coachLabelRef.current) coachLabelRef.current.fillOpacity = ease(p, 0.86, 0.98) * 0.9
  })

  return (
    <group>
      <LightLine ref={courtRef} points={court} segments color={PALETTE.nearWhite} intensity={0.45} width={0.012} opacity={0} />

      <LightLine ref={trailRef} points={trail} color={PALETTE.starGold} intensity={GLOW.hero} width={0.035} />

      <group ref={shuttleRef} visible={false}>
        <mesh material={corkMat}>
          <sphereGeometry args={[0.075, 24, 24]} />
        </mesh>
        <LightLine points={skirt} segments color={PALETTE.nearWhite} intensity={GLOW.hero} width={0.012} />
        <GlowSprite color={PALETTE.starGold} intensity={GLOW.hero} size={0.7} opacity={0.8} />
      </group>

      <GlowSprite ref={impactRef} position={[SMASH[2].x, SMASH[2].y, SMASH[2].z]} color={PALETTE.starGold} intensity={GLOW.hot} size={1} opacity={0} />

      <instancedMesh ref={shardsRef} args={[shardGeo, shardMat, SHARDS]} frustumCulled={false} visible={false} />

      <LightLine ref={coachRef} points={coach} color={PALETTE.signal} intensity={1.8} width={0.022} dashed dashSize={0.16} gapSize={0.1} />

      <Label ref={captainRef} position={[-3.2, 3.5, -3.6]} color={PALETTE.starGold} opacity={0}>Captain</Label>
      <Label ref={coachLabelRef} position={[-0.1, 1.95, -2.0]} color={PALETTE.signal} opacity={0}>Coach</Label>
    </group>
  )
}
