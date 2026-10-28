// src/components/CosmicJourney3D/scenes/Beat_MajorLens.tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { BeatSceneProps } from '../types'
import { useBeat, type BeatHandle } from '../store'

// Acceptance: three labeled orbs (Maths, Physics, Data Sci) left-to-right; a focus
// point sweeps across them so each blurs/sharpens in turn (blur emulated via
// scale/opacity), while a focus ring expands from center (mirrors drawMajorChoiceLens).
const ORBS = [
  { name: 'Maths', pos: [0.2, 0.5] },
  { name: 'Physics', pos: [0.5, 0.5] },
  { name: 'Data Sci', pos: [0.8, 0.5] },
] as const

// Map the original 2D [0..1] layout into the XY plane of this beat's local space.
// Widen the horizontal spread to fill the frame and lift the row so halos/labels
// stay clear of the lower overlay band (local Y = -1.5).
const ROW_Y = 0.7
const toPos = (p: readonly [number, number]) =>
  new THREE.Vector3((p[0] - 0.5) * 11, (0.5 - p[1]) * 7 + ROW_Y, 0)

type TroikaText = THREE.Mesh & { fillOpacity: number }

const RING_SEGMENTS = 64
const RING_THICKNESS = 0.06

interface OrbProps {
  beat: BeatHandle
  name: string
  orbIndex: number
  center: THREE.Vector3
  reducedMotion: boolean
}

function Orb({ beat, name, orbIndex, center, reducedMotion }: OrbProps) {
  const groupRef = useRef<THREE.Group>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const labelRef = useRef<TroikaText>(null)

  useFrame(() => {
    if (!beat.near) return
    const localProgress = beat.local
    const clock = beat.clock
    const drift = reducedMotion ? 0 : Math.sin(clock * 0.6) * 0.12
    // focusPoint per orb (0.2, 0.5, 0.8) — same cadence as the 2D source.
    const focusPoint = 0.2 + orbIndex * 0.3
    const dist = Math.abs(localProgress - focusPoint)
    // In focus -> sharp/bright/full size; out of focus -> dim/shrunk (blur proxy).
    const focus = Math.max(0, 1 - dist * 2)
    const alpha = Math.max(0.1, focus)
    const sharp = 0.6 + focus * 0.4 // 0.6..1.0 scale stands in for blur
    const wobble = reducedMotion ? 0 : Math.sin(clock * 0.9 + orbIndex) * 0.05

    if (groupRef.current) groupRef.current.position.y = center.y + drift * (orbIndex % 2 === 0 ? 1 : -1)
    if (haloRef.current) {
      haloRef.current.scale.setScalar(sharp * (1.7 - focus * 0.3))
      ;(haloRef.current.material as THREE.MeshBasicMaterial).opacity = alpha * 0.18
    }
    if (coreRef.current) {
      coreRef.current.scale.setScalar(sharp + wobble)
      ;(coreRef.current.material as THREE.MeshBasicMaterial).opacity = alpha
    }
    if (labelRef.current) labelRef.current.fillOpacity = alpha
  })

  return (
    <group ref={groupRef} position={[center.x, center.y, center.z]}>
      {/* Soft halo — fattens & dims when the orb is out of focus. */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[1.0, 24, 24]} />
        <meshBasicMaterial color="#cbd5f5" transparent opacity={0.1 * 0.18} toneMapped={false} />
      </mesh>
      {/* Core orb. */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} toneMapped={false} />
      </mesh>
      {/* Label floats just above the orb, beside its element. */}
      <Text
        ref={labelRef}
        position={[0, 1.5, 0.1]}
        fontSize={0.42}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.1}
        outlineWidth={0.012}
        outlineColor="#1e1b4b"
      >
        {name}
      </Text>
    </group>
  )
}

export default function Beat_MajorLens({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const orbPts = useMemo(() => ORBS.map((o) => toPos(o.pos)), [])
  const ringRef = useRef<THREE.Mesh<THREE.RingGeometry>>(null)

  // Unit-circle tables so the ring's vertices can be rewritten in place each frame.
  const ringCos = useMemo(() => {
    const table = new Float32Array(RING_SEGMENTS + 1)
    for (let i = 0; i <= RING_SEGMENTS; i++) table[i] = Math.cos((i / RING_SEGMENTS) * Math.PI * 2)
    return table
  }, [])
  const ringSin = useMemo(() => {
    const table = new Float32Array(RING_SEGMENTS + 1)
    for (let i = 0; i <= RING_SEGMENTS; i++) table[i] = Math.sin((i / RING_SEGMENTS) * Math.PI * 2)
    return table
  }, [])

  useFrame(() => {
    if (!beat.near) return
    const ring = ringRef.current
    if (!ring) return
    // Focus ring grows from center, capped (original: 0.2*min * min(1, progress*4)).
    const ringRadius = 2.0 * Math.min(1, beat.local * 4)
    ring.visible = ringRadius > 0.001
    if (!ring.visible) return
    ring.rotation.z = reducedMotion ? 0 : beat.clock * 0.25
    const outer = ringRadius
    const inner = Math.max(0.001, ringRadius - RING_THICKNESS)
    // RingGeometry(1 phi segment) layout: inner ring vertices first, then outer ring.
    const positions = ring.geometry.attributes.position as THREE.BufferAttribute
    const array = positions.array as Float32Array
    const stride = RING_SEGMENTS + 1
    for (let i = 0; i < stride; i++) {
      array[i * 3] = inner * ringCos[i]!
      array[i * 3 + 1] = inner * ringSin[i]!
      array[(stride + i) * 3] = outer * ringCos[i]!
      array[(stride + i) * 3 + 1] = outer * ringSin[i]!
    }
    positions.needsUpdate = true
  })

  return (
    <group>
      {ORBS.map((orb, i) => {
        const center = orbPts[i]
        if (!center) return null
        return <Orb key={orb.name} beat={beat} name={orb.name} orbIndex={i} center={center} reducedMotion={reducedMotion} />
      })}

      {/* Expanding focus ring centered on the orb row. */}
      <mesh ref={ringRef} position={[0, ROW_Y, 0.05]} visible={false} frustumCulled={false}>
        <ringGeometry args={[0.5, 1, RING_SEGMENTS]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
