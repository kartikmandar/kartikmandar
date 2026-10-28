// src/components/CosmicJourney3D/scenes/Beat_Comet.tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'

// Acceptance (mirrors drawBuildAComet): particles stream inward from a far ring
// and accrete onto a growing rocky nucleus at origin (done by localProgress 0.4);
// then near the sun (off to the +X side) the nucleus grows a glowing blue coma,
// a curved dust tail, and a straight ion tail — both pointing away from the sun.
const PARTICLE_COUNT = 70
// Nucleus sits slightly right of origin so the long tail streaming to -X stays
// balanced and in-frame rather than running off the left edge.
const NUCLEUS = new THREE.Vector3(0.6, 0.6, 0)
// Sun direction: original places sun far to the right, so tails point to -X (away from sun).
const AWAY = new THREE.Vector3(-1, 0.18, 0).normalize()

interface Seed {
  start: THREE.Vector3
  distFactor: number
  blue: boolean
}

export default function Beat_Comet({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const rootRef = useRef<THREE.Group>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const pointsGeometryRef = useRef<THREE.BufferGeometry>(null)
  const pointsMatRef = useRef<THREE.PointsMaterial>(null)
  const tailGroupRef = useRef<THREE.Group>(null)
  const ionRef = useRef<THREE.Mesh>(null)
  const ionMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const dustRef = useRef<THREE.Mesh>(null)
  const dustMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const comaRef = useRef<THREE.Mesh>(null)
  const comaMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const nucleusRef = useRef<THREE.Mesh>(null)
  const nucleusWireRef = useRef<THREE.Mesh>(null)

  const seeds = useMemo<Seed[]>(() => {
    const out: Seed[] = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + (i % 3) * 0.7
      const radius = 3.4 + ((i * 2.39) % 1) * 1.2
      out.push({
        start: new THREE.Vector3(
          NUCLEUS.x + Math.cos(angle) * radius,
          NUCLEUS.y + Math.sin(angle) * radius * 0.62,
          ((i % 5) - 2) * 0.15,
        ),
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

  // Initial positions (progress 0); rewritten in place every frame.
  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const s = seeds[i]!
      arr[i * 3] = s.start.x
      arr[i * 3 + 1] = s.start.y
      arr[i * 3 + 2] = s.start.z
    }
    return arr
  }, [seeds])

  // Orientation that points the tails away from the sun.
  const tailQuat = useMemo(() => {
    const q = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(1, 0, 0), AWAY)
    return q
  }, [])

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = beat.clock
    const acc = Math.min(1, p / 0.4)
    const nucleusSize = 0.35 + 0.85 * acc
    const sublimation = Math.max(0, (p - 0.4) / 0.6)
    const comaSize = nucleusSize + 1.6 * sublimation
    const tailLen = 6 * sublimation
    const particleAlpha = Math.max(0, 1 - acc * 0.85)

    // Clock adds gentle ambient drift (held when reducedMotion).
    const drift = reducedMotion ? 0 : Math.sin(t * 0.6) * 0.05
    const ambientRot = reducedMotion ? 0 : Math.sin(t * 0.15) * 0.04
    if (rootRef.current) rootRef.current.rotation.z = ambientRot

    // Streaming / accreting particles
    const points = pointsRef.current
    const geometry = pointsGeometryRef.current
    if (points && geometry) {
      points.visible = particleAlpha > 0.01
      if (pointsMatRef.current) pointsMatRef.current.opacity = particleAlpha
      const attribute = geometry.attributes.position as THREE.BufferAttribute
      const arr = attribute.array as Float32Array
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const s = seeds[i]!
        const travel = acc * (1 - s.distFactor)
        arr[i * 3] = s.start.x + (NUCLEUS.x - s.start.x) * travel + drift
        arr[i * 3 + 1] = s.start.y + (NUCLEUS.y - s.start.y) * travel
        arr[i * 3 + 2] = s.start.z + (NUCLEUS.z - s.start.z) * travel
      }
      attribute.needsUpdate = true
    }

    // Tails + coma: rendered near the sun (sublimation phase)
    const showTails = sublimation > 0.01
    if (tailGroupRef.current) tailGroupRef.current.visible = showTails
    if (comaRef.current) {
      comaRef.current.visible = showTails
      comaRef.current.scale.setScalar(comaSize)
    }
    if (comaMatRef.current) comaMatRef.current.opacity = 0.32 * sublimation
    if (ionRef.current) {
      ionRef.current.position.x = tailLen * 0.6
      ionRef.current.scale.y = tailLen * 1.2
    }
    if (ionMatRef.current) ionMatRef.current.opacity = 0.4 * sublimation
    if (dustRef.current) {
      dustRef.current.position.x = tailLen * 0.45
      dustRef.current.position.y = -0.35 * sublimation
      dustRef.current.scale.y = tailLen
    }
    if (dustMatRef.current) dustMatRef.current.opacity = 0.28 * sublimation

    // Rocky nucleus, grows during accretion
    if (nucleusRef.current) nucleusRef.current.scale.setScalar(nucleusSize)
    if (nucleusWireRef.current) nucleusWireRef.current.scale.setScalar(nucleusSize * 1.04)
  })

  return (
    <group ref={rootRef}>
      {/* Streaming / accreting particles */}
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry ref={pointsGeometryRef}>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={pointsMatRef} size={0.14} vertexColors transparent opacity={1} sizeAttenuation toneMapped={false} />
      </points>

      {/* Comet body (nucleus, coma, tails) sits at the accretion point */}
      <group position={NUCLEUS.toArray()}>
        {/* Tails: unit-height cones, stretched along their axis to the tail length */}
        <group ref={tailGroupRef} quaternion={tailQuat} visible={false}>
          {/* Straight ion tail — narrow cone pointing straight away from the sun */}
          <mesh ref={ionRef} position={[0, 0, -0.05]} rotation={[0, 0, -Math.PI / 2]} scale={[1, 0.0001, 1]}>
            <coneGeometry args={[0.18, 1, 12, 1, true]} />
            <meshBasicMaterial ref={ionMatRef} color="#aac8ff" transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
          {/* Curved dust tail — wider, offset and angled to read as curved */}
          <mesh ref={dustRef} position={[0, 0, 0.05]} rotation={[0, 0, -Math.PI / 2 - 0.22]} scale={[1, 0.0001, 1]}>
            <coneGeometry args={[0.4, 1, 16, 1, true]} />
            <meshBasicMaterial ref={dustMatRef} color="#f0f0dc" transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        </group>

        {/* Glowing blue coma halo around the nucleus */}
        <mesh ref={comaRef} visible={false}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshBasicMaterial ref={comaMatRef} color="#b4dcff" transparent opacity={0} side={THREE.BackSide} toneMapped={false} />
        </mesh>

        {/* Rocky nucleus, grows during accretion */}
        <mesh ref={nucleusRef} scale={0.35}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#8a847e" toneMapped={false} />
        </mesh>
        <mesh ref={nucleusWireRef} scale={0.35 * 1.04}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#55504b" wireframe transparent opacity={0.5} toneMapped={false} />
        </mesh>
      </group>

      <Text position={[0.6, 2.2, 0]} fontSize={0.45} color="#cbd5e1" anchorX="center" anchorY="bottom">
        Build a comet
      </Text>
    </group>
  )
}
