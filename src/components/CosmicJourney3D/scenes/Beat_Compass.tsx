// src/components/CosmicJourney3D/scenes/Beat_Compass.tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { SceneProps } from '../types'

// Acceptance: a compass rose whose red needle swings from North and locks onto a
// glowing Physics star (which grows on the right) with a slight tremble.
// Mirrors drawUnwaveringCompass: rose at 2D (0.4,0.5), star at (0.85,0.5),
// needle North -> star, swing done by progress 0.5, tremble ~sin(t)*0.02*progress.

// Place the rose and star straddling the origin so the subject fills the frame
// (rose on the left, star on the right), both on the horizontal midline (z~0).
const COMPASS = new THREE.Vector3(-3.1, 0.4, 0) // rose center
const STAR = new THREE.Vector3(3.4, 0.4, 0) // Physics star
const ROSE_R = 1.85 // compass radius in local units
const NEEDLE_LEN = ROSE_R * 0.85

// North in this frame is +Y (up). Target points from rose toward the star.
const NORTH_ANGLE = Math.PI / 2
const TARGET_ANGLE = Math.atan2(STAR.y - COMPASS.y, STAR.x - COMPASS.x)

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export default function Beat_Compass({ localProgress, clock, reducedMotion }: SceneProps) {
  const needleRef = useRef<THREE.Group>(null)
  const roseRef = useRef<THREE.Group>(null)

  // Cardinal tick marks around the rose (N/E/S/W + diagonals).
  const tickPositions = useMemo(() => {
    const arr: number[] = []
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      const inner = i % 2 === 0 ? ROSE_R * 0.78 : ROSE_R * 0.88
      arr.push(
        Math.cos(a) * inner, Math.sin(a) * inner, 0,
        Math.cos(a) * ROSE_R, Math.sin(a) * ROSE_R, 0,
      )
    }
    return new Float32Array(arr)
  }, [])

  // Star grows and brightens with progress; swing completes by progress 0.5.
  const starScale = Math.max(0.001, localProgress)
  const starAlpha = localProgress
  const swing = Math.min(1, localProgress * 2)

  useFrame(() => {
    const tremble = reducedMotion ? 0 : Math.sin(clock * 20) * 0.02 * localProgress
    const angle = lerp(NORTH_ANGLE, TARGET_ANGLE, swing) + tremble
    // Three-space rotation: angle measured from +X, needle starts modelled along +X.
    if (needleRef.current) needleRef.current.rotation.z = angle
    if (roseRef.current) roseRef.current.rotation.z = reducedMotion ? 0 : Math.sin(clock * 0.3) * 0.04
  })

  return (
    <group>
      {/* Compass rose: translucent disk + rim ring + cardinal ticks */}
      <group ref={roseRef} position={COMPASS}>
        <mesh>
          <circleGeometry args={[ROSE_R, 48]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.08} toneMapped={false} />
        </mesh>
        <mesh>
          <ringGeometry args={[ROSE_R * 0.98, ROSE_R, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} toneMapped={false} />
        </mesh>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[tickPositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#ffffff" transparent opacity={0.4} toneMapped={false} />
        </lineSegments>
        <Text position={[0, ROSE_R + 0.55, 0]} fontSize={0.4} color="#e2e8f0" anchorX="center" anchorY="bottom">
          Economic Sciences
        </Text>
      </group>

      {/* Red compass needle pivoting at the rose center */}
      <group ref={needleRef} position={COMPASS}>
        {/* shaft along +X */}
        <mesh position={[NEEDLE_LEN * 0.5, 0, 0.02]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, NEEDLE_LEN, 8]} />
          <meshBasicMaterial color="#f87171" toneMapped={false} />
        </mesh>
        {/* arrowhead at the tip */}
        <mesh position={[NEEDLE_LEN + 0.12, 0, 0.02]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.16, 0.4, 12]} />
          <meshBasicMaterial color="#f87171" toneMapped={false} />
        </mesh>
        {/* hub */}
        <mesh position={[0, 0, 0.03]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#fca5a5" toneMapped={false} />
        </mesh>
      </group>

      {/* Physics star on the right: indigo halo + white core, grows in */}
      {starAlpha > 0.001 && (
        <group position={STAR}>
          <group scale={starScale}>
            <mesh>
              <sphereGeometry args={[0.9, 24, 24]} />
              <meshBasicMaterial color="#a5b4fc" transparent opacity={starAlpha * 0.35} toneMapped={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.5, 24, 24]} />
              <meshBasicMaterial color="#a5b4fc" transparent opacity={starAlpha * 0.7} toneMapped={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.28, 20, 20]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={starAlpha} toneMapped={false} />
            </mesh>
          </group>
          <Text position={[0, 1.5, 0]} fontSize={0.45} color="#c7d2fe" anchorX="center" anchorY="bottom" fillOpacity={starAlpha} outlineWidth={0.012} outlineColor="#1e1b4b">
            Physics
          </Text>
        </group>
      )}
    </group>
  )
}
