// src/components/CosmicJourney3D/scenes/Beat_ExitFork.tsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'

// Acceptance (mirrors drawDivergingPaths): a thick indigo path rises to a fork;
// the original BS-MS continuation fades to a dashed ghost line going straight up
// while a new glowing yellow branch veers upper-right; a white traveler dot walks
// up and takes the new branch.

// Map the original 2D [0..1] layout into the XY plane of this beat's local space.
// Vertical span compressed and lifted so the whole fork sits above the overlay
// reserved zone (local Y >= -1.5) while still filling a ~9x6 frame; horizontal
// span widened so the diverging branches read clearly.
const toPos = (px: number, py: number) =>
  new THREE.Vector3((px - 0.5) * 9, 0.75 + (0.5 - py) * 5, 0)

const BOTTOM = toPos(0.5, 1.0) // path origin
const FORK = toPos(0.5, 0.5) // the fork point
const GHOST_TOP = toPos(0.5, 0.0) // faded straight-up continuation
const BRANCH_END = toPos(0.85, 0.05) // new yellow path veering upper-right

const BOTTOM_MID = BOTTOM.clone().lerp(FORK, 0.5)
const BRANCH_DX = BRANCH_END.x - FORK.x
const BRANCH_DY = BRANCH_END.y - FORK.y
const BRANCH_LENGTH = FORK.distanceTo(BRANCH_END)
const BRANCH_ROTATION = Math.atan2(BRANCH_DY, BRANCH_DX) - Math.PI / 2

const INDIGO = '#a5b4fc'
const YELLOW = '#fde047'

type TextMesh = THREE.Mesh & { fillOpacity: number }

// Dashed ghost continuation: short segments fading out as the choice is made.
const GHOST_POSITIONS = (() => {
  const arr: number[] = []
  const segs = 7
  for (let i = 0; i < segs; i += 1) {
    const a = FORK.clone().lerp(GHOST_TOP, i / segs)
    const b = FORK.clone().lerp(GHOST_TOP, (i + 0.55) / segs)
    arr.push(a.x, a.y, a.z, b.x, b.y, b.z)
  }
  return new Float32Array(arr)
})()

export default function Beat_ExitFork({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const driftGroupRef = useRef<THREE.Group>(null)
  const ghostRef = useRef<THREE.LineSegments>(null)
  const branchGroupRef = useRef<THREE.Group>(null)
  const travelerRef = useRef<THREE.Group>(null)
  const exitLabelRef = useRef<TextMesh>(null)
  const branchLabelRef = useRef<TextMesh>(null)

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = beat.clock

    // Gentle ambient drift (held when reduced motion is requested).
    const driftGroup = driftGroupRef.current
    if (driftGroup) driftGroup.position.y = reducedMotion ? 0 : Math.sin(t * 0.6) * 0.04

    const ghost = ghostRef.current
    if (ghost) {
      const ghostAlpha = Math.max(0, 1 - Math.max(0, (p - 0.4) / 0.4)) * 0.7
      ghost.visible = ghostAlpha > 0.01
      ;(ghost.material as THREE.LineBasicMaterial).opacity = ghostAlpha
    }

    // New glowing branch grows from the fork toward upper-right.
    const branch = branchGroupRef.current
    if (branch) {
      const branchGrow = Math.max(0, (p - 0.3) / 0.7)
      branch.visible = branchGrow > 0
      branch.position.set(
        FORK.x + BRANCH_DX * branchGrow * 0.5,
        FORK.y + BRANCH_DY * branchGrow * 0.5,
        FORK.z,
      )
      branch.scale.y = BRANCH_LENGTH * branchGrow
    }

    // Traveler: walks up the indigo path to the fork, then along the new branch.
    const traveler = travelerRef.current
    if (traveler) {
      if (p < 0.5) {
        const k = p / 0.5
        traveler.position.set(
          BOTTOM.x + (FORK.x - BOTTOM.x) * k,
          BOTTOM.y + (FORK.y - BOTTOM.y) * k,
          BOTTOM.z + (FORK.z - BOTTOM.z) * k,
        )
      } else {
        const k = (p - 0.5) / 0.5
        traveler.position.set(FORK.x + BRANCH_DX * k, FORK.y + BRANCH_DY * k, FORK.z)
      }
    }

    // Labels fade in near the fork once the choice is underway.
    const labelAlpha = Math.max(0, Math.min(1, (p - 0.4) / 0.3))
    const exitLabel = exitLabelRef.current
    if (exitLabel) {
      exitLabel.visible = labelAlpha > 0.01
      exitLabel.fillOpacity = labelAlpha
    }
    const branchLabel = branchLabelRef.current
    if (branchLabel) {
      branchLabel.visible = labelAlpha > 0.01
      branchLabel.fillOpacity = labelAlpha
    }
  })

  return (
    <group ref={driftGroupRef}>
      {/* Thick indigo BS-MS path rising from the bottom to the fork. */}
      <mesh position={BOTTOM_MID}>
        <cylinderGeometry args={[0.16, 0.16, FORK.distanceTo(BOTTOM), 12]} />
        <meshBasicMaterial color={INDIGO} toneMapped={false} />
      </mesh>

      {/* Dashed ghost continuation straight up, fading as the choice is made. */}
      <lineSegments ref={ghostRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[GHOST_POSITIONS, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={INDIGO} transparent opacity={0.7} toneMapped={false} />
      </lineSegments>

      {/* New glowing yellow branch veering upper-right (core + soft glow halo). Unit-height cylinders, length via scale.y. */}
      <group ref={branchGroupRef} visible={false} rotation={[0, 0, BRANCH_ROTATION]} scale={[1, 0, 1]}>
        <mesh>
          <cylinderGeometry args={[0.14, 0.14, 1, 12]} />
          <meshBasicMaterial color={YELLOW} toneMapped={false} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 1, 12]} />
          <meshBasicMaterial color={YELLOW} transparent opacity={0.18} toneMapped={false} />
        </mesh>
      </group>

      {/* Fork node marker. */}
      <mesh position={FORK}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial color={INDIGO} toneMapped={false} />
      </mesh>

      {/* White traveler dot with a soft halo. */}
      <group ref={travelerRef} position={BOTTOM}>
        <mesh>
          <sphereGeometry args={[0.2, 20, 20]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.25} toneMapped={false} />
        </mesh>
      </group>

      {/* "BS Exit" beside the faded straight-up ghost continuation. */}
      <Text
        ref={exitLabelRef}
        visible={false}
        position={[GHOST_TOP.x - 0.45, GHOST_TOP.y - 0.6, 0]}
        anchorX="right"
        anchorY="middle"
        fontSize={0.4}
        color="#cbd5f5"
        outlineWidth={0.012}
        outlineColor="#000000"
        fillOpacity={0}
      >
        BS Exit
      </Text>
      {/* "BS-MS" beside the new glowing yellow branch. */}
      <Text
        ref={branchLabelRef}
        visible={false}
        position={[BRANCH_END.x + 0.4, BRANCH_END.y, 0]}
        anchorX="left"
        anchorY="middle"
        fontSize={0.45}
        color={YELLOW}
        outlineWidth={0.012}
        outlineColor="#000000"
        fillOpacity={0}
      >
        BS-MS
      </Text>
    </group>
  )
}
