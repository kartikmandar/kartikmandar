// src/components/CosmicJourney3D/scenes/Beat_Milestones.tsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { SceneProps } from '../types'

// Acceptance: a dashed curved path strung with labeled milestones (NuSTAR, Data,
// Analysis, Results, Paper, ZTF), each fading in as localProgress crosses its
// phase; glowing particles travel along the path (mirrors drawPublicationJourney).
const MILESTONES = [
  { label: 'NuSTAR', phase: 0.0, x: 0.1, y: 0.0, color: '#6496ff' },
  { label: 'Data', phase: 0.2, x: 0.25, y: 0.06, color: '#6496ff' },
  { label: 'Analysis', phase: 0.4, x: 0.4, y: -0.09, color: '#ffc864' },
  { label: 'Results', phase: 0.6, x: 0.6, y: 0.045, color: '#6496ff' },
  { label: 'Paper', phase: 0.8, x: 0.75, y: -0.06, color: '#ffffff' },
  { label: 'ZTF', phase: 1.0, x: 0.9, y: 0.0, color: '#ff9632' },
] as const

// Map the original 2D [0..1] layout into the XY plane of this beat's local space.
const toPos = (x: number, y: number) =>
  new THREE.Vector3((x - 0.5) * 10, y * 7, 0)

// Quadratic-bezier sample between two milestones with a gentle upward control bow,
// matching the canvas quadraticCurveTo(cpx, cpy - 30, ...) undulation.
function curveAt(seg: number, t: number): THREE.Vector3 {
  const a = MILESTONES[seg]!
  const b = MILESTONES[seg + 1]!
  const p0 = toPos(a.x, a.y)
  const p2 = toPos(b.x, b.y)
  const cp = toPos((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.06)
  const u = 1 - t
  return new THREE.Vector3(
    u * u * p0.x + 2 * u * t * cp.x + t * t * p2.x,
    u * u * p0.y + 2 * u * t * cp.y + t * t * p2.y,
    0,
  )
}

const SEGMENTS = MILESTONES.length - 1
const SAMPLES = 24 // per segment, for the dashed polyline
const PARTICLES = 5

export default function Beat_Milestones({ localProgress, clock, reducedMotion }: SceneProps) {
  const t = reducedMotion ? 0 : clock

  // Dashed path: lineSegments drawn as alternating on/off pairs along the curve.
  const pathPositions = useMemo(() => {
    const arr: number[] = []
    for (let s = 0; s < SEGMENTS; s++) {
      for (let i = 0; i < SAMPLES; i += 2) {
        const p1 = curveAt(s, i / SAMPLES)
        const p2 = curveAt(s, (i + 1) / SAMPLES)
        arr.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z)
      }
    }
    return new Float32Array(arr)
  }, [])

  const milestonePts = useMemo(() => MILESTONES.map((m) => toPos(m.x, m.y)), [])

  // Glowing particles riding the curve; travel scaled by overall reveal progress.
  const particles = useMemo(() => {
    const out: { pos: THREE.Vector3; pulse: number }[] = []
    for (let i = 0; i < PARTICLES; i++) {
      const flow = ((t * 0.18 + i * 0.2) % 1) * localProgress
      const along = flow * SEGMENTS
      const seg = Math.min(SEGMENTS - 1, Math.floor(along))
      out.push({ pos: curveAt(seg, along - seg), pulse: 0.7 + 0.3 * Math.sin(t * 3 + i) })
    }
    return out
  }, [t, localProgress])

  return (
    <group>
      {/* Dashed quadratic path, fading in with overall progress */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pathPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#6496ff" transparent opacity={0.35 * localProgress} toneMapped={false} />
      </lineSegments>

      {/* Labeled milestones, each fading in over a 0.1 window past its phase */}
      {MILESTONES.map((m, i) => {
        const a = Math.max(0, Math.min(1, (localProgress - m.phase) / 0.1))
        const p = milestonePts[i]!
        const bob = reducedMotion ? 0 : Math.sin(t * 0.8 + i) * 0.04
        if (a <= 0) return null
        return (
          <group key={m.label} position={[p.x, p.y + bob, 0]}>
            <mesh>
              <sphereGeometry args={[0.22, 20, 20]} />
              <meshBasicMaterial color={m.color} transparent opacity={0.85 * a} toneMapped={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.34, 20, 20]} />
              <meshBasicMaterial color={m.color} transparent opacity={0.18 * a} toneMapped={false} />
            </mesh>
            <Text
              position={[0, 0.62, 0]}
              fontSize={0.34}
              color="#ffffff"
              anchorX="center"
              anchorY="bottom"
              fillOpacity={a}
              outlineWidth={0.012}
              outlineColor="#000000"
            >
              {m.label}
            </Text>
          </group>
        )
      })}

      {/* Glowing particles traveling along the path */}
      {particles.map((pt, i) => (
        <group key={`p${i}`} position={[pt.pos.x, pt.pos.y, 0.02]}>
          <mesh>
            <sphereGeometry args={[0.09 * pt.pulse, 12, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.85 * localProgress} toneMapped={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.18 * pt.pulse, 12, 12]} />
            <meshBasicMaterial color="#6496ff" transparent opacity={0.3 * localProgress} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
