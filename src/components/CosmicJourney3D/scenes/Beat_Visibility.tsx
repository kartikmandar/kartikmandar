// src/components/CosmicJourney3D/scenes/Beat_Visibility.tsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { SceneProps } from '../types'

// Acceptance: a radio-interferometry plot with labeled axes "LST (Time)" x
// "Visibility Amplitude"; a green visibility curve oscillates and draws in
// left-to-right with localProgress (mirrors drawRadioInterferometry).

// Plot extent in local space: 10 (x) by 7 (y), centered at origin, z ~ 0.
const PLOT_W = 10
const PLOT_H = 7
const X0 = -PLOT_W / 2 // left axis x
const Y0 = -PLOT_H / 2 // bottom axis y

// Map normalized [0..1] plot coords (origin bottom-left) into local space.
const toPlot = (nx: number, ny: number) =>
  new THREE.Vector3(X0 + nx * PLOT_W, Y0 + ny * PLOT_H, 0)

// Pre-sampled normalized visibility data: a decaying, oscillating fringe
// pattern (radio-interferometry visibility amplitude vs LST), y in [0..1].
const SAMPLES = 160
const VIS = Array.from({ length: SAMPLES }, (_, i) => {
  const x = i / (SAMPLES - 1)
  const envelope = 0.5 + 0.45 * Math.exp(-2.2 * x)
  const fringe = Math.sin(x * Math.PI * 7) * Math.cos(x * Math.PI * 2.3)
  return { x, y: 0.5 + envelope * fringe * 0.5 }
})

export default function Beat_Visibility({ localProgress, clock, reducedMotion }: SceneProps) {
  // Gentle ambient drift of the whole plot, held when reducedMotion.
  const driftY = reducedMotion ? 0 : Math.sin(clock * 0.4) * 0.06
  const ambient = reducedMotion ? 0 : clock

  // L-shaped axes (left vertical + bottom horizontal), as a line strip.
  const axisPositions = useMemo(() => {
    const top = toPlot(0, 1)
    const corner = toPlot(0, 0)
    const right = toPlot(1, 0)
    return new Float32Array([
      top.x, top.y, top.z,
      corner.x, corner.y, corner.z,
      right.x, right.y, right.z,
    ])
  }, [])

  // Faint horizontal gridlines for the scientific-plot feel.
  const gridPositions = useMemo(() => {
    const arr: number[] = []
    for (let g = 1; g <= 4; g++) {
      const ny = g / 5
      const a = toPlot(0, ny)
      const b = toPlot(1, ny)
      arr.push(a.x, a.y, a.z, b.x, b.y, b.z)
    }
    return new Float32Array(arr)
  }, [])

  // Curve drawn left-to-right: reveal points up to localProgress, with a
  // small ambient breathing of the fringe amplitude when motion is allowed.
  const curvePositions = useMemo(() => {
    const pointsToDraw = Math.max(1, Math.floor(localProgress * SAMPLES))
    const arr: number[] = []
    for (let i = 0; i < pointsToDraw; i++) {
      const point = VIS[i]
      if (!point) continue
      const wobble = reducedMotion
        ? 0
        : Math.sin(ambient * 1.5 + point.x * 6) * 0.012
      const p = toPlot(point.x, THREE.MathUtils.clamp(point.y + wobble, 0, 1))
      arr.push(p.x, p.y, p.z)
    }
    return new Float32Array(arr)
  }, [localProgress, ambient, reducedMotion])

  // Leading marker that rides the tip of the drawn curve.
  const tip = useMemo(() => {
    const idx = THREE.MathUtils.clamp(
      Math.floor(localProgress * SAMPLES) - 1,
      0,
      SAMPLES - 1,
    )
    const point = VIS[idx]!
    return toPlot(point.x, point.y)
  }, [localProgress])

  const tipVisible = localProgress > 0.001 && localProgress < 0.999

  return (
    <group position={[0, driftY, 0]}>
      {/* Faint backing panel for the plot area */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[PLOT_W + 1.2, PLOT_H + 1.6]} />
        <meshBasicMaterial color="#0a1018" transparent opacity={0.55} toneMapped={false} />
      </mesh>

      {/* Gridlines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[gridPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.12} toneMapped={false} />
      </lineSegments>

      {/* L-shaped axes */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[axisPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.5} toneMapped={false} />
      </line>

      {/* Green visibility curve, revealed left-to-right by localProgress */}
      {curvePositions.length >= 6 && (
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[curvePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#4ade80" transparent opacity={0.95} toneMapped={false} />
        </line>
      )}

      {/* Leading marker at the curve tip */}
      {tipVisible && (
        <mesh position={tip}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#4ade80" toneMapped={false} />
        </mesh>
      )}

      {/* Axis labels */}
      <Text
        position={[0, Y0 - 0.7, 0]}
        fontSize={0.42}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.75}
      >
        LST (Time)
      </Text>
      <Text
        position={[X0 - 0.7, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        fontSize={0.42}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.75}
      >
        Visibility Amplitude
      </Text>
    </group>
  )
}
