// src/components/CosmicJourney3D/scenes/Beat_Walker.tsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'

// Acceptance (mirrors drawJourneyContinues): a small stick-figure walker with an
// animated gait ascends a perspective path of stars that narrows into the
// distance, shrinking as it goes, wrapped in a growing blue nebula glow.

// Deterministic path stars in normalized [0..1] x [0..1] (no Math.random at render).
const PATH_STARS = Array.from({ length: 70 }, (_, i) => {
  const r = (i * 9301 + 49297) % 233280 / 233280
  const r2 = (i * 4801 + 9973) % 233280 / 233280
  return [r, r2, 0.5 + ((i * 7) % 10) / 10] as const // x, depth(0..1), size factor
})

// Map normalized 2D into local space; vertical range kept above the overlay copy
// zone (Y > -1.5) and within the top bound (Y <= 4).
const FLOOR_Y = -1.3 // walker start (just above the overlay copy zone)
const APEX_Y = 3.9 // walker vanishing point (top, into distance)

// Fixed-size buffers, rewritten in place each frame.
const STAR_POSITIONS = new Float32Array(PATH_STARS.length * 3)
const STAR_COLORS = new Float32Array(PATH_STARS.length * 3)
const LIMB_POSITIONS = new Float32Array(10 * 3)

const TORSO = 1.5
const LIMB = 1.0

export default function Beat_Walker({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)

  const nebulaRef = useRef<THREE.Mesh>(null)
  const pathRef = useRef<THREE.Points>(null)
  const starGeometryRef = useRef<THREE.BufferGeometry>(null)
  const walkerRef = useRef<THREE.Group>(null)
  const limbGeometryRef = useRef<THREE.BufferGeometry>(null)

  useFrame(() => {
    if (!beat.near) return
    const p = Math.min(1, Math.max(0, beat.local))
    const t = reducedMotion ? 0 : beat.clock

    // Walker recedes up the path and shrinks (original: scale = 1 - progress*0.9).
    const walkerY = THREE.MathUtils.lerp(FLOOR_Y, APEX_Y, p)
    const walkerZ = -p * 6 // push into distance
    const scale = Math.max(0.08, 1.3 - p * 1.2) // near walker reads larger, shrinks up the path

    // Nebula glow grows with progress (original: radial gradient up to 1.5x progress).
    const nebula = Math.min(1, p * 1.5)
    const nebScale = 2 + nebula * 9
    const breathe = reducedMotion ? 1 : 1 + Math.sin(t * 0.6) * 0.04
    const nebulaMesh = nebulaRef.current
    if (nebulaMesh) {
      nebulaMesh.visible = nebula > 0
      nebulaMesh.position.set(0, walkerY, walkerZ - 1)
      nebulaMesh.scale.setScalar(nebScale * breathe)
      ;(nebulaMesh.material as THREE.MeshBasicMaterial).opacity = nebula * 0.55
    }

    // Path stars: corridor narrows (1 - progress) and recedes; alpha fades with depth.
    const starGeometry = starGeometryRef.current
    if (starGeometry) {
      const positionAttr = starGeometry.attributes.position as THREE.BufferAttribute
      const colorAttr = starGeometry.attributes.color as THREE.BufferAttribute
      const width = 8.6 * (1 - p * 0.85) // perspective width shrinks with progress
      for (let i = 0; i < PATH_STARS.length; i++) {
        const s = PATH_STARS[i]!
        const depth = s[1] // 0 = near/bottom, 1 = far/top
        const y = THREE.MathUtils.lerp(FLOOR_Y, APEX_Y, depth)
        const taper = 1 - depth * 0.85 // corridor narrows toward the apex
        const x = (s[0] - 0.5) * width * taper
        positionAttr.setXYZ(i, x, y, -depth * 6)
        const a = (1 - depth) * (0.35 + 0.65 * p)
        colorAttr.setXYZ(i, 0.8 * a + 0.2, 0.85 * a + 0.2, a + 0.25) // cool white toward blue
      }
      positionAttr.needsUpdate = true
      colorAttr.needsUpdate = true
    }
    if (pathRef.current) pathRef.current.rotation.z = reducedMotion ? 0 : Math.sin(t * 0.15) * 0.02

    // Walker stick figure (pivot at feet; body up; legs/arms swing).
    const walker = walkerRef.current
    if (walker) {
      walker.position.set(0, walkerY, walkerZ)
      walker.scale.setScalar(scale)
    }
    const limbGeometry = limbGeometryRef.current
    if (limbGeometry) {
      const gait = Math.sin(p * 50) * (Math.PI / 6)
      const arm = Math.cos(p * 50) * (Math.PI / 8)
      const lx = Math.sin(gait) * LIMB
      const ax = Math.sin(arm) * LIMB * 0.8
      const shoulderY = TORSO * 0.8
      const handY = shoulderY - LIMB * 0.7
      const limbAttr = limbGeometry.attributes.position as THREE.BufferAttribute
      limbAttr.setXYZ(0, 0, 0, 0) // spine
      limbAttr.setXYZ(1, 0, TORSO, 0)
      limbAttr.setXYZ(2, 0, 0, 0) // leg A
      limbAttr.setXYZ(3, lx, -LIMB, 0)
      limbAttr.setXYZ(4, 0, 0, 0) // leg B
      limbAttr.setXYZ(5, -lx, -LIMB, 0)
      limbAttr.setXYZ(6, 0, shoulderY, 0) // arm A
      limbAttr.setXYZ(7, ax, handY, 0)
      limbAttr.setXYZ(8, 0, shoulderY, 0) // arm B
      limbAttr.setXYZ(9, -ax, handY, 0)
      limbAttr.needsUpdate = true
    }
  })

  return (
    <group>
      {/* Growing blue nebula glow centered on the walker */}
      <mesh ref={nebulaRef} visible={false}>
        <ringGeometry args={[0, 1, 48]} />
        <meshBasicMaterial
          color="#2a3666"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Perspective path of stars narrowing into the distance */}
      <points ref={pathRef} frustumCulled={false}>
        <bufferGeometry ref={starGeometryRef}>
          <bufferAttribute attach="attributes-position" args={[STAR_POSITIONS, 3]} />
          <bufferAttribute attach="attributes-color" args={[STAR_COLORS, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.16} vertexColors transparent opacity={0.95} sizeAttenuation toneMapped={false} />
      </points>

      {/* Stick-figure walker: shrinks and recedes as it ascends the path.
          Inner offset lifts the leg tips (y=-1) to the group origin so the feet
          stay planted at walkerY (>= FLOOR_Y) at any scale, clear of the copy zone. */}
      <group ref={walkerRef}>
        <group position={[0, 1, 0]}>
          <mesh position={[0, 1.5 + 0.4, 0]}>
            <sphereGeometry args={[0.32, 16, 16]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          <lineSegments frustumCulled={false}>
            <bufferGeometry ref={limbGeometryRef}>
              <bufferAttribute attach="attributes-position" args={[LIMB_POSITIONS, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.95} toneMapped={false} />
          </lineSegments>
        </group>
      </group>
    </group>
  )
}
