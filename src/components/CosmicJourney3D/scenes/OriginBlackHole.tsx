// src/components/CosmicJourney3D/scenes/OriginBlackHole.tsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { SceneProps } from '../types'

// Stand-in origin black hole: dark sphere + emissive accretion ring.
// Phase 1 replaces the internals with the ported blackhole.frag.ts raymarch shader.
export default function OriginBlackHole({ clock, reducedMotion }: SceneProps) {
  const ring = useRef<THREE.Mesh>(null)
  useFrame(() => {
    if (ring.current && !reducedMotion) ring.current.rotation.z = clock * 0.3
  })
  return (
    <group>
      <mesh>
        <sphereGeometry args={[1.6, 48, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[2.6, 0.5, 24, 120]} />
        <meshBasicMaterial color="#f59e0b" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={6} color="#ffd9a0" distance={40} />
    </group>
  )
}
