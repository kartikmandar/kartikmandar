// src/components/CosmicJourney3D/scenes/Beat_Walker.tsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { SceneProps } from '../types'

// Acceptance (mirrors drawJourneyContinues): a small stick-figure walker with an
// animated gait ascends a perspective path of stars that narrows into the
// distance, shrinking as it goes, wrapped in a growing blue nebula glow.

// Deterministic path stars in normalized [0..1] x [0..1] (no Math.random at render).
const PATH_STARS = Array.from({ length: 70 }, (_, i) => {
  const r = (i * 9301 + 49297) % 233280 / 233280
  const r2 = (i * 4801 + 9973) % 233280 / 233280
  return [r, r2, 0.5 + ((i * 7) % 10) / 10] as const // x, depth(0..1), size factor
})

// Map normalized 2D [0..1] into local space (~10 wide x 7 tall, centered at origin).
const FLOOR_Y = -3.4 // walker start (bottom of frame)
const APEX_Y = 4.0 // walker vanishing point (top, into distance)

export default function Beat_Walker({ localProgress, clock, reducedMotion }: SceneProps) {
  const p = Math.min(1, Math.max(0, localProgress))
  const t = reducedMotion ? 0 : clock

  // Walker recedes up the path and shrinks (original: scale = 1 - progress*0.9).
  const walkerY = THREE.MathUtils.lerp(FLOOR_Y, APEX_Y, p)
  const walkerZ = -p * 6 // push into distance
  const scale = Math.max(0.06, 1 - p * 0.9)

  // Path stars: corridor narrows (1 - progress) and recedes; alpha fades with depth.
  const { positions, colors } = useMemo(() => {
    const pos: number[] = []
    const col: number[] = []
    const width = (1.4 + 4.6) * (1 - p * 0.85) // perspective width shrinks with progress
    for (let i = 0; i < PATH_STARS.length; i++) {
      const s = PATH_STARS[i]!
      const depth = s[1] // 0 = near/bottom, 1 = far/top
      const y = THREE.MathUtils.lerp(FLOOR_Y - 0.4, APEX_Y, depth)
      const taper = 1 - depth * 0.85 // corridor narrows toward the apex
      const x = (s[0] - 0.5) * width * taper
      const z = -depth * 6
      pos.push(x, y, z)
      const a = (1 - depth) * (0.35 + 0.65 * p)
      col.push(0.8 * a + 0.2, 0.85 * a + 0.2, a + 0.25) // cool white toward blue
    }
    return { positions: new Float32Array(pos), colors: new Float32Array(col) }
  }, [p])

  // Walker stick figure as line segments, built in local walker space (head separate).
  const limbs = useMemo(() => {
    const gait = Math.sin(p * 50) * (Math.PI / 6)
    const arm = Math.cos(p * 50) * (Math.PI / 8)
    const torso = 1.5
    const limb = 1.0
    // pivot at feet (0,0); body up; legs/arms swing.
    const seg = (ax: number, ay: number, bx: number, by: number) => [ax, ay, 0, bx, by, 0]
    const lx = Math.sin(gait) * limb
    const ax = Math.sin(arm) * limb * 0.8
    return new Float32Array([
      ...seg(0, 0, 0, torso), // spine
      ...seg(0, 0, lx, -limb), // leg A
      ...seg(0, 0, -lx, -limb), // leg B
      ...seg(0, torso * 0.8, ax, torso * 0.8 - limb * 0.7), // arm A
      ...seg(0, torso * 0.8, -ax, torso * 0.8 - limb * 0.7), // arm B
    ])
  }, [p])

  // Nebula glow grows with progress (original: radial gradient up to 1.5x progress).
  const nebula = Math.min(1, p * 1.5)
  const nebScale = 2 + nebula * 9
  const breathe = reducedMotion ? 1 : 1 + Math.sin(t * 0.6) * 0.04

  return (
    <group>
      {/* Growing blue nebula glow centered on the walker */}
      {nebula > 0 && (
        <mesh position={[0, walkerY, walkerZ - 1]} scale={nebScale * breathe}>
          <ringGeometry args={[0, 1, 48]} />
          <meshBasicMaterial
            color="#2a3666"
            transparent
            opacity={nebula * 0.55}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Perspective path of stars narrowing into the distance */}
      <points rotation={[0, 0, reducedMotion ? 0 : Math.sin(t * 0.15) * 0.02]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.16} vertexColors transparent opacity={0.95} sizeAttenuation toneMapped={false} />
      </points>

      {/* Stick-figure walker: shrinks and recedes as it ascends the path */}
      <group position={[0, walkerY, walkerZ]} scale={scale}>
        <mesh position={[0, 1.5 + 0.4, 0]}>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[limbs, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#ffffff" transparent opacity={0.95} toneMapped={false} />
        </lineSegments>
      </group>
    </group>
  )
}
