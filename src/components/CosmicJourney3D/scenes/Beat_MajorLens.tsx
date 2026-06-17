// src/components/CosmicJourney3D/scenes/Beat_MajorLens.tsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { SceneProps } from '../types'

// Acceptance: three labeled orbs (Maths, Physics, Data Sci) left-to-right; a focus
// point sweeps across them so each blurs/sharpens in turn (blur emulated via
// scale/opacity), while a focus ring expands from center (mirrors drawMajorChoiceLens).
const ORBS = [
  { name: 'Maths', pos: [0.2, 0.5] },
  { name: 'Physics', pos: [0.5, 0.5] },
  { name: 'Data Sci', pos: [0.8, 0.5] },
] as const

// Map the original 2D [0..1] layout into the XY plane of this beat's local space.
const toPos = (p: readonly [number, number]) =>
  new THREE.Vector3((p[0] - 0.5) * 10, (0.5 - p[1]) * 7, 0)

export default function Beat_MajorLens({ localProgress, clock, reducedMotion }: SceneProps) {
  const orbPts = useMemo(() => ORBS.map((o) => toPos(o.pos)), [])
  const drift = reducedMotion ? 0 : Math.sin(clock * 0.6) * 0.12

  // Focus ring grows from center, capped (original: 0.2*min * min(1, progress*4)).
  const ringRadius = 2.0 * Math.min(1, localProgress * 4)

  return (
    <group>
      {ORBS.map((orb, i) => {
        const center = orbPts[i]
        if (!center) return null
        // focusPoint per orb (0.2, 0.5, 0.8) — same cadence as the 2D source.
        const focusPoint = 0.2 + i * 0.3
        const dist = Math.abs(localProgress - focusPoint)
        // In focus -> sharp/bright/full size; out of focus -> dim/shrunk (blur proxy).
        const focus = Math.max(0, 1 - dist * 2)
        const alpha = Math.max(0.1, focus)
        const sharp = 0.6 + focus * 0.4 // 0.6..1.0 scale stands in for blur
        const wobble = reducedMotion ? 0 : Math.sin(clock * 0.9 + i) * 0.05
        const y = center.y + drift * (i % 2 === 0 ? 1 : -1)

        return (
          <group key={orb.name} position={[center.x, y, center.z]}>
            {/* Soft halo — fattens & dims when the orb is out of focus. */}
            <mesh scale={sharp * (1.7 - focus * 0.3)}>
              <sphereGeometry args={[1.0, 24, 24]} />
              <meshBasicMaterial
                color="#cbd5f5"
                transparent
                opacity={alpha * 0.18}
                toneMapped={false}
              />
            </mesh>
            {/* Core orb. */}
            <mesh scale={sharp + wobble}>
              <sphereGeometry args={[0.9, 32, 32]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={alpha}
                toneMapped={false}
              />
            </mesh>
            {/* Label floats above the orb (original drew text at y - 50). */}
            <Text
              position={[0, 1.9, 0.1]}
              fontSize={0.62}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              fillOpacity={alpha}
              outlineWidth={0.012}
              outlineColor="#1e1b4b"
            >
              {orb.name}
            </Text>
          </group>
        )
      })}

      {/* Expanding focus ring at composition center. */}
      {ringRadius > 0.001 && (
        <mesh position={[0, 0, 0.05]} rotation={[0, 0, reducedMotion ? 0 : clock * 0.25]}>
          <ringGeometry args={[Math.max(0.001, ringRadius - 0.06), ringRadius, 64]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  )
}
