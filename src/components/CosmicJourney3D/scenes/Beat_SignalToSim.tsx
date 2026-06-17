// src/components/CosmicJourney3D/scenes/Beat_SignalToSim.tsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { SceneProps } from '../types'

// Acceptance (mirrors drawSignalToSimulation): a noisy radio waveform at top that
// resolves as signal locks; an array of radio dishes fades in; glowing green
// baselines connect every pair of dishes; a bottom plot where a noisy curve
// resolves into a clean green sine (RRIViz).

// Map the original 2D [0..1] layout into the XY plane of this beat's local space.
const toX = (u: number) => (u - 0.5) * 10
const toY = (v: number) => (0.5 - v) * 7

// Fixed dish layout (x, y) sampled from the original's generateAntennaPositions range.
const DISHES = [
  [0.18, 0.34], [0.37, 0.26], [0.52, 0.45], [0.68, 0.3], [0.84, 0.4],
] as const

// Deterministic pseudo-noise so renders stay stable (no Date.now / Math.random).
const noise = (i: number) => Math.sin(i * 12.9898) * 43758.5453 % 1

export default function Beat_SignalToSim({ localProgress, clock, reducedMotion }: SceneProps) {
  const t = reducedMotion ? 0 : clock
  const signal = Math.min(1, localProgress / 0.4)
  const dishAlpha = Math.min(1, localProgress / 0.4)
  const baseline = Math.max(0, (localProgress - 0.2) / 0.5)
  const plot = Math.max(0, (localProgress - 0.5) / 0.5)

  const dishPts = useMemo(
    () => DISHES.map(([u, v]) => new THREE.Vector3(toX(u), toY(v), 0)),
    [],
  )

  // Top noisy radio waveform — amplitude collapses toward a clean line as signal locks.
  const wavePositions = useMemo(() => {
    const N = 120
    const arr = new Float32Array(N * 3)
    const noiseAmp = (1 - signal) * 0.9
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1)
      const x = toX(u)
      const y = 2.7 + Math.sin(u * 22 + t * 2) * 0.18 + noise(i + 1) * noiseAmp
      arr[i * 3] = x
      arr[i * 3 + 1] = y
      arr[i * 3 + 2] = 0
    }
    return arr
  }, [signal, t])

  // Green baselines between every pair of dishes (animated reveal).
  const baselinePositions = useMemo(() => {
    const arr: number[] = []
    let edge = 0
    const total = (DISHES.length * (DISHES.length - 1)) / 2
    for (let i = 0; i < dishPts.length; i++) {
      const a = dishPts[i]!
      for (let j = i + 1; j < dishPts.length; j++) {
        const b = dishPts[j]!
        if (baseline * total > edge) {
          const k = Math.min(1, baseline * total - edge)
          const mid = a.clone().lerp(b, k)
          arr.push(a.x, a.y, a.z, mid.x, mid.y, mid.z)
        }
        edge++
      }
    }
    return new Float32Array(arr)
  }, [baseline, dishPts])

  // Bottom plot: a noisy white curve resolving into a clean green sine.
  const PLOT_W = 6
  const PLOT_X = -PLOT_W / 2
  const PLOT_Y = -2.6
  const noisyCurve = useMemo(() => {
    const N = 100
    const arr = new Float32Array(N * 3)
    const shown = Math.floor(plot * N)
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1)
      const drawn = i < shown
      arr[i * 3] = PLOT_X + u * PLOT_W
      arr[i * 3 + 1] = PLOT_Y + (drawn ? noise(i + 7) * 0.6 : 0)
      arr[i * 3 + 2] = 0
    }
    return arr
  }, [plot, PLOT_X, PLOT_Y])
  const sineCurve = useMemo(() => {
    const N = 100
    const arr = new Float32Array(N * 3)
    const reach = plot
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1)
      const on = u <= reach
      arr[i * 3] = PLOT_X + u * PLOT_W
      arr[i * 3 + 1] = PLOT_Y + (on ? Math.sin(u * Math.PI * 4) * 0.5 : 0)
      arr[i * 3 + 2] = 0.01
    }
    return arr
  }, [plot, PLOT_X, PLOT_Y])

  return (
    <group>
      {/* Top noisy radio waveform */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[wavePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" transparent opacity={1 - signal * 0.8} toneMapped={false} />
      </line>

      {/* Radio dish array — parabolic cones on a post, fading in */}
      {dishPts.map((p, i) => (
        <group key={`d${i}`} position={p} rotation={[0, t * 0.15 + i, -Math.PI / 8]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.32, 0.28, 24, 1, true]} />
            <meshBasicMaterial color="#cbd5e1" transparent opacity={dishAlpha} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#93c5fd" transparent opacity={dishAlpha} toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
            <meshBasicMaterial color="#64748b" transparent opacity={dishAlpha} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Glowing green baselines between every pair of dishes */}
      {baselinePositions.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[baselinePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#4ade80" transparent opacity={0.5 * baseline} toneMapped={false} />
        </lineSegments>
      )}

      {/* Bottom plot frame */}
      {plot > 0 && (
        <group>
          <mesh position={[0, PLOT_Y, -0.02]}>
            <planeGeometry args={[PLOT_W + 0.4, 1.6]} />
            <meshBasicMaterial color="#0f172a" transparent opacity={0.35 * plot} toneMapped={false} />
          </mesh>
          <line>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[noisyCurve, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.25 * plot} toneMapped={false} />
          </line>
          <line>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[sineCurve, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color="#4ade80" transparent opacity={plot} toneMapped={false} />
          </line>
          <Text
            position={[PLOT_X + PLOT_W - 0.1, PLOT_Y + 0.9, 0.05]}
            fontSize={0.4}
            color="#4ade80"
            anchorX="right"
            anchorY="middle"
            fillOpacity={plot}
          >
            RRIViz
          </Text>
        </group>
      )}
    </group>
  )
}
