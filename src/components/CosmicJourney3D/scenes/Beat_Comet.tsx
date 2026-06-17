// src/components/CosmicJourney3D/scenes/Beat_Comet.tsx
'use client'

import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { SceneProps } from '../types'

// Acceptance (mirrors drawBuildAComet): particles stream inward from a far ring
// and accrete onto a growing rocky nucleus at origin (done by localProgress 0.4);
// then near the sun (off to the +X side) the nucleus grows a glowing blue coma,
// a curved dust tail, and a straight ion tail — both pointing away from the sun.
const PARTICLE_COUNT = 70
const NUCLEUS = new THREE.Vector3(0, 0, 0)
// Sun direction: original places sun far to the right, so tails point to -X (away from sun).
const AWAY = new THREE.Vector3(-1, 0.18, 0).normalize()

interface Seed {
  start: THREE.Vector3
  distFactor: number
  blue: boolean
}

export default function Beat_Comet({ localProgress, clock, reducedMotion }: SceneProps) {
  const seeds = useMemo<Seed[]>(() => {
    const out: Seed[] = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + (i % 3) * 0.7
      const radius = 6 + ((i * 2.39) % 1) * 2
      out.push({
        start: new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.7, ((i % 5) - 2) * 0.15),
        distFactor: (i * 0.61) % 1,
        blue: i % 3 === 0,
      })
    }
    return out
  }, [])

  // Static colour buffer for the streaming particles.
  const colors = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    seeds.forEach((s, i) => {
      arr[i * 3] = s.blue ? 0.7 : 0.86
      arr[i * 3 + 1] = s.blue ? 0.78 : 0.86
      arr[i * 3 + 2] = 1.0
    })
    return arr
  }, [seeds])

  const acc = Math.min(1, localProgress / 0.4)
  const nucleusSize = 0.35 + 0.85 * acc
  const sublimation = Math.max(0, (localProgress - 0.4) / 0.6)
  const comaSize = nucleusSize + 1.6 * sublimation
  const tailLen = 7 * sublimation
  const particleAlpha = Math.max(0, 1 - acc * 0.85)

  // Particle positions stream inward from localProgress; clock adds gentle ambient
  // drift (held when reducedMotion). Rebuilt via useMemo (no buffer mutation).
  const drift = reducedMotion ? 0 : Math.sin(clock * 0.6) * 0.05
  const ambientRot = reducedMotion ? 0 : Math.sin(clock * 0.15) * 0.04
  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const s = seeds[i]!
      const travel = acc * (1 - s.distFactor)
      arr[i * 3] = s.start.x + (NUCLEUS.x - s.start.x) * travel + drift
      arr[i * 3 + 1] = s.start.y + (NUCLEUS.y - s.start.y) * travel
      arr[i * 3 + 2] = s.start.z + (NUCLEUS.z - s.start.z) * travel
    }
    return arr
  }, [seeds, acc, drift])

  // Orientation that points the tails away from the sun.
  const tailQuat = useMemo(() => {
    const q = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(1, 0, 0), AWAY)
    return q
  }, [])

  return (
    <group rotation={[0, 0, ambientRot]}>
      {/* Streaming / accreting particles */}
      {particleAlpha > 0.01 && (
        <points>
          <bufferGeometry key={positions.length}>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[colors, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.14} vertexColors transparent opacity={particleAlpha} sizeAttenuation toneMapped={false} />
        </points>
      )}

      {/* Tails + coma: rendered near the sun (sublimation phase) */}
      {sublimation > 0.01 && (
        <group quaternion={tailQuat}>
          {/* Straight ion tail — narrow cone pointing straight away from the sun */}
          <mesh position={[tailLen * 0.6, 0, -0.05]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.18, tailLen * 1.2, 12, 1, true]} />
            <meshBasicMaterial color="#aac8ff" transparent opacity={0.4 * sublimation} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
          {/* Curved dust tail — wider, offset and angled to read as curved */}
          <mesh position={[tailLen * 0.45, -0.35 * sublimation, 0.05]} rotation={[0, 0, -Math.PI / 2 - 0.22]}>
            <coneGeometry args={[0.4, tailLen, 16, 1, true]} />
            <meshBasicMaterial color="#f0f0dc" transparent opacity={0.28 * sublimation} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        </group>
      )}

      {/* Glowing blue coma halo around the nucleus */}
      {sublimation > 0.01 && (
        <mesh>
          <sphereGeometry args={[comaSize, 24, 24]} />
          <meshBasicMaterial color="#b4dcff" transparent opacity={0.32 * sublimation} side={THREE.BackSide} toneMapped={false} />
        </mesh>
      )}

      {/* Rocky nucleus, grows during accretion */}
      <mesh>
        <icosahedronGeometry args={[nucleusSize, 1]} />
        <meshBasicMaterial color="#8a847e" toneMapped={false} />
      </mesh>
      <mesh scale={1.04}>
        <icosahedronGeometry args={[nucleusSize, 1]} />
        <meshBasicMaterial color="#55504b" wireframe transparent opacity={0.5} toneMapped={false} />
      </mesh>

      <Text position={[0, -3, 0]} fontSize={0.42} color="#cbd5e1" anchorX="center" anchorY="middle">
        Build a comet
      </Text>
    </group>
  )
}
