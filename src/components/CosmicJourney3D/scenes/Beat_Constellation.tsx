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
const toPos = (p: readonly [number, number]) =>
  new THREE.Vector3((p[0] - 0.5) * 10, (0.5 - p[1]) * 7, 0)

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
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      ))}
      {engPts.map((p, i) => (
        <mesh key={`e${i}`} position={p}>
          <sphereGeometry args={[0.1, 12, 12]} />
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
