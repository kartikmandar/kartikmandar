// src/components/CosmicJourney3D/scenes/Beat_Constellation.tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'

// Acceptance: engineering cluster fades; Gemini named stars light; indigo lines
// connect, completing by localProgress ~0.4 (mirrors drawConstellations).
const RESEARCH = [
  [0.4, 0.25], [0.25, 0.3], [0.55, 0.45], [0.45, 0.65], [0.3, 0.8],
  [0.85, 0.6], [0.89, 0.68], [0.93, 0.75], [0.6, 0.35], [0.2, 0.5],
] as const
const LINES = [[1, 3], [3, 4], [0, 2], [2, 4], [0, 8], [1, 9], [2, 5], [5, 6], [6, 7]] as const
const ENGINEERING = [[0.75, 0.3], [0.7, 0.5], [0.6, 0.55], [0.65, 0.7], [0.75, 0.8]] as const

// Map the original 2D [0..1] layout into the XY plane of this beat's local space.
// The raw data clusters around (0.565, 0.525) and spans ~0.73 x 0.55, skewed
// right and dipping below the overlay band. Recenter on that centroid and scale
// to fill ~9 wide x 6 tall, lifting Y so all content sits inside [-1.5, 4].
const DATA_CX = 0.565
const DATA_CY = 0.525
const SPREAD_X = 11.5 // (p[0]-cx) in [-0.365, 0.365] -> X in [-4.2, 4.2]
const SPREAD_Y = 9.5 // (cy-p[1]) in [-0.275, 0.275] -> Y offset +/-2.6
const Y_LIFT = 1.2 // shift up into the [-1.5, 4] band
const toPos = (p: readonly [number, number]) =>
  new THREE.Vector3(
    (p[0] - DATA_CX) * SPREAD_X,
    (DATA_CY - p[1]) * SPREAD_Y + Y_LIFT,
    0,
  )

export default function Beat_Constellation({ index }: BeatSceneProps) {
  const beat = useBeat(index)
  const researchPts = useMemo(() => RESEARCH.map(toPos), [])
  const engPts = useMemo(() => ENGINEERING.map(toPos), [])
  // Fixed-size line buffer: 2 vertices per constellation line, revealed via drawRange.
  const linePositions = useMemo(() => new Float32Array(LINES.length * 6), [])
  const lineGeometryRef = useRef<THREE.BufferGeometry>(null)
  const engMaterialsRef = useRef<Array<THREE.MeshBasicMaterial | null>>([])

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const lineDone = Math.min(1, p / 0.4)
    const engAlpha = Math.max(0, 1 - p * 2.5)

    const engMaterials = engMaterialsRef.current
    for (let i = 0; i < engMaterials.length; i++) {
      const material = engMaterials[i]
      if (material) material.opacity = engAlpha
    }

    const geometry = lineGeometryRef.current
    if (!geometry) return
    const lineArray = geometry.attributes.position!.array as Float32Array
    let segmentCount = 0
    for (let i = 0; i < LINES.length; i++) {
      if (!(lineDone * LINES.length > i)) continue
      const line = LINES[i]!
      const t = Math.min(1, lineDone * LINES.length - i)
      const p1 = researchPts[line[0]]!
      const p2 = researchPts[line[1]]!
      const o = segmentCount * 6
      lineArray[o] = p1.x
      lineArray[o + 1] = p1.y
      lineArray[o + 2] = p1.z
      lineArray[o + 3] = p1.x + (p2.x - p1.x) * t
      lineArray[o + 4] = p1.y + (p2.y - p1.y) * t
      lineArray[o + 5] = p1.z + (p2.z - p1.z) * t
      segmentCount++
    }
    geometry.attributes.position!.needsUpdate = true
    geometry.setDrawRange(0, segmentCount * 2)
  })

  return (
    <group>
      {researchPts.map((p, i) => (
        <mesh key={`r${i}`} position={p}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      ))}
      {engPts.map((p, i) => (
        <mesh key={`e${i}`} position={p}>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshBasicMaterial
            ref={(material) => {
              engMaterialsRef.current[i] = material
            }}
            color="#ffffff"
            transparent
            opacity={1}
            toneMapped={false}
          />
        </mesh>
      ))}
      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={lineGeometryRef} drawRange={{ start: 0, count: 0 }}>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#a5b4fc" transparent opacity={0.85} toneMapped={false} />
      </lineSegments>
    </group>
  )
}
