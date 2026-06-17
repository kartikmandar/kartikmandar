// src/components/CosmicJourney3D/scenes/Beat_ExitFork.tsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { SceneProps } from '../types'

// Acceptance (mirrors drawDivergingPaths): a thick indigo path rises to a fork;
// the original BS-MS continuation fades to a dashed ghost line going straight up
// while a new glowing yellow branch veers upper-right; a white traveler dot walks
// up and takes the new branch.

// Map the original 2D [0..1] layout into the XY plane of this beat's local space.
const toPos = (px: number, py: number) =>
  new THREE.Vector3((px - 0.5) * 10, (0.5 - py) * 7, 0)

const BOTTOM = toPos(0.5, 1.0) // path origin
const FORK = toPos(0.5, 0.5) // the fork point
const GHOST_TOP = toPos(0.5, 0.0) // faded straight-up continuation
const BRANCH_END = toPos(0.8, 0.1) // new yellow path veering upper-right

const INDIGO = '#a5b4fc'
const YELLOW = '#fde047'

export default function Beat_ExitFork({ localProgress, clock, reducedMotion }: SceneProps) {
  // Gentle ambient drift (held when reduced motion is requested).
  const drift = reducedMotion ? 0 : Math.sin(clock * 0.6) * 0.04

  // Dashed ghost continuation: short segments fading out as the choice is made.
  const ghostPositions = useMemo(() => {
    const arr: number[] = []
    const segs = 7
    for (let i = 0; i < segs; i += 1) {
      const a = FORK.clone().lerp(GHOST_TOP, i / segs)
      const b = FORK.clone().lerp(GHOST_TOP, (i + 0.55) / segs)
      arr.push(a.x, a.y, a.z, b.x, b.y, b.z)
    }
    return new Float32Array(arr)
  }, [])
  const ghostAlpha = Math.max(0, 1 - Math.max(0, (localProgress - 0.4) / 0.4)) * 0.7

  // New glowing branch grows from the fork toward upper-right.
  const branchGrow = Math.max(0, (localProgress - 0.3) / 0.7)
  const branchTip = useMemo(
    () => FORK.clone().lerp(BRANCH_END, branchGrow),
    [branchGrow],
  )

  // Traveler: walks up the indigo path to the fork, then along the new branch.
  const traveler = useMemo(() => {
    if (localProgress < 0.5) {
      return BOTTOM.clone().lerp(FORK, localProgress / 0.5)
    }
    return FORK.clone().lerp(BRANCH_END, (localProgress - 0.5) / 0.5)
  }, [localProgress])

  const labelAlpha = Math.max(0, Math.min(1, (localProgress - 0.4) / 0.3))

  return (
    <group position={[0, drift, 0]}>
      {/* Thick indigo BS-MS path rising from the bottom to the fork. */}
      <mesh position={BOTTOM.clone().lerp(FORK, 0.5)}>
        <cylinderGeometry args={[0.16, 0.16, FORK.distanceTo(BOTTOM), 12]} />
        <meshBasicMaterial color={INDIGO} toneMapped={false} />
      </mesh>

      {/* Dashed ghost continuation straight up, fading as the choice is made. */}
      {ghostAlpha > 0.01 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[ghostPositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={INDIGO} transparent opacity={ghostAlpha} toneMapped={false} />
        </lineSegments>
      )}

      {/* New glowing yellow branch veering upper-right (core + soft glow halo). */}
      {branchGrow > 0 && (
        <group
          position={FORK.clone().lerp(branchTip, 0.5)}
          rotation={[0, 0, Math.atan2(branchTip.y - FORK.y, branchTip.x - FORK.x) - Math.PI / 2]}
        >
          <mesh>
            <cylinderGeometry args={[0.14, 0.14, FORK.distanceTo(branchTip), 12]} />
            <meshBasicMaterial color={YELLOW} toneMapped={false} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, FORK.distanceTo(branchTip), 12]} />
            <meshBasicMaterial color={YELLOW} transparent opacity={0.18} toneMapped={false} />
          </mesh>
        </group>
      )}

      {/* Fork node marker. */}
      <mesh position={FORK}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial color={INDIGO} toneMapped={false} />
      </mesh>

      {/* White traveler dot with a soft halo. */}
      <group position={traveler}>
        <mesh>
          <sphereGeometry args={[0.2, 20, 20]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.25} toneMapped={false} />
        </mesh>
      </group>

      {/* Labels fade in near the fork once the choice is underway. */}
      {labelAlpha > 0.01 && (
        <>
          <Text
            position={[FORK.x - 0.6, FORK.y + 0.1, 0]}
            anchorX="right"
            anchorY="middle"
            fontSize={0.45}
            color="#ffffff"
            fillOpacity={labelAlpha}
          >
            BS Exit
          </Text>
          <Text
            position={[FORK.x + 0.6, FORK.y - 0.9, 0]}
            anchorX="left"
            anchorY="middle"
            fontSize={0.45}
            color={YELLOW}
            fillOpacity={labelAlpha}
          >
            BS-MS
          </Text>
        </>
      )}
    </group>
  )
}
