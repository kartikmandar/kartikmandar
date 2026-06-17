// src/components/CosmicJourney3D/scenes/Beat_FocusLens.tsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { SceneProps } from '../types'

// Acceptance: a vignette/tunnel closes in while a stick-figure astronomer
// (arm up, with a small telescope appearing past 50%) sharpens into focus in
// a sky-blue glow. Mirrors drawFocusingLens: astronomer fades/scales after 40%,
// telescope past the half-way mark, lens vignette tightens with progress.

// Stick figure in the original's local pixel frame (centered, y-down).
// Re-centered to the scene origin and scaled into the ~10x7 local space.
const FIG_SCALE = 0.06
const fp = (x: number, y: number): [number, number, number] => [x * FIG_SCALE, -y * FIG_SCALE, 0]

// Body/arms/legs as line segment pairs (arm up-left toward the stars).
const FIGURE: ReadonlyArray<readonly [[number, number], [number, number]]> = [
  [[0, -28], [0, 15]], // spine
  [[0, -15], [-20, -35]], // left arm raised to the sky
  [[0, -15], [18, -8]], // right arm
  [[0, 15], [-12, 40]], // left leg
  [[0, 15], [12, 40]], // right leg
]
// Telescope tube + tripod, revealed past the half-way mark.
const TELESCOPE: ReadonlyArray<readonly [[number, number], [number, number]]> = [
  [[25, -25], [40, -40]], // tube
  [[25, -8], [20, 10]], // tripod left
  [[25, -8], [30, 10]], // tripod center-ish
  [[25, -8], [25, 10]], // tripod center
]

const seg = (pairs: ReadonlyArray<readonly [[number, number], [number, number]]>) => {
  const arr: number[] = []
  for (const [a, b] of pairs) {
    const p1 = fp(a[0], a[1])
    const p2 = fp(b[0], b[1])
    arr.push(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2])
  }
  return new Float32Array(arr)
}

export default function Beat_FocusLens({ localProgress, clock, reducedMotion }: SceneProps) {
  // Astronomer comes into focus after 40%, identical to the 2D metaphor.
  const sharpness = Math.max(0, (localProgress - 0.4) / 0.6)
  const scale = 1 + sharpness * 3
  const showScope = localProgress > 0.5

  const bodyPos = useMemo(() => seg(FIGURE), [])
  const scopePos = useMemo(() => seg(TELESCOPE), [])

  // Lens vignette: a tunnel of dark rings that tighten toward center as we focus.
  const RINGS = 6
  const close = Math.min(localProgress, 0.85) // matches lensRadius shrink
  const sway = reducedMotion ? 0 : Math.sin(clock * 0.5) * 0.04

  return (
    <group>
      {/* Sky-blue focus glow behind the astronomer (filled disc via ring 0..r) */}
      <mesh position={[0, 0, -0.5]} scale={scale}>
        <ringGeometry args={[0, 3.6, 48]} />
        <meshBasicMaterial color="#87ceeb" transparent opacity={sharpness * 0.3} toneMapped={false} />
      </mesh>

      {/* Astronomer, scaling and brightening into focus */}
      {sharpness > 0 && (
        <group scale={[scale, scale, scale]} rotation={[0, 0, sway]}>
          {/* Head */}
          <mesh position={fp(0, -40)}>
            <torusGeometry args={[12 * FIG_SCALE, 1.4 * FIG_SCALE, 8, 24]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={sharpness} toneMapped={false} />
          </mesh>
          {/* Limbs */}
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[bodyPos, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={sharpness} toneMapped={false} />
          </lineSegments>
          {/* Telescope appears past the half-way mark */}
          {showScope && (
            <lineSegments>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[scopePos, 3]} />
              </bufferGeometry>
              <lineBasicMaterial color="#c8c8c8" transparent opacity={sharpness} toneMapped={false} />
            </lineSegments>
          )}
        </group>
      )}

      {/* Vignette / focusing-lens tunnel closing in around the figure */}
      {Array.from({ length: RINGS }, (_, i) => {
        const k = i / (RINGS - 1) // 0 = outermost, 1 = innermost
        // Outer radius starts wide; rings march inward as `close` grows.
        const outer = (1 - close * 0.9) * (6.2 - k * 4.6) + 0.6
        const inner = outer - 0.55
        if (inner <= 0) return null
        return (
          <mesh key={`v${i}`} position={[0, 0, 0.4 + i * 0.02]}>
            <ringGeometry args={[inner, outer, 64]} />
            <meshBasicMaterial
              color="#000000"
              transparent
              opacity={0.18 + k * 0.5 + close * 0.25}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </group>
  )
}
