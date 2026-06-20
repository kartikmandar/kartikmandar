// src/components/CosmicJourney3D/scenes/Beat_Constellation.tsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { SceneProps } from '../types'

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

export default function Beat_Constellation({ localProgress }: SceneProps) {
  const researchPts = useMemo(() => RESEARCH.map(toPos), [])
  const engPts = useMemo(() => ENGINEERING.map(toPos), [])
  const lineDone = Math.min(1, localProgress / 0.4)
  const engAlpha = Math.max(0, 1 - localProgress * 2.5)

  const linePositions = useMemo(() => {
    const arr: number[] = []
    LINES.forEach(([a, b], i) => {
      if (lineDone * LINES.length > i) {
        const t = Math.min(1, lineDone * LINES.length - i)
        const p1 = researchPts[a]
        const p2 = researchPts[b]
        if (!p1 || !p2) return
        const mid = p1.clone().lerp(p2, t)
        arr.push(p1.x, p1.y, p1.z, mid.x, mid.y, mid.z)
      }
    })
    return new Float32Array(arr)
  }, [lineDone, researchPts])

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
          <meshBasicMaterial color="#ffffff" transparent opacity={engAlpha} toneMapped={false} />
        </mesh>
      ))}
      {linePositions.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#a5b4fc" transparent opacity={0.85} toneMapped={false} />
        </lineSegments>
      )}
    </group>
  )
}
