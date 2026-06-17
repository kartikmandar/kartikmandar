// src/components/CosmicJourney3D/scenes/Beat_MidnightOil.tsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { SceneProps } from '../types'

// Acceptance: sky transitions day->night as a sun sets and a moon rises crossing
// the sky; a yellow "College" bar fades while a green "RRIViz" bar gains an
// intense glow (mirrors drawBurningMidnightOil).

// Map the original 2D [0..1] layout into the XY plane (10 x 7 extent, z near 0).
const X = (u: number) => (u - 0.5) * 10
const Y = (v: number) => (0.5 - v) * 7

// Day sky color (sky-blue) and night sky color, lerped by dayAmount.
const DAY = new THREE.Color(135 / 255, 206 / 255, 209 / 255)
const NIGHT = new THREE.Color(12 / 255, 10 / 255, 26 / 255)

// Background gradient stars (fixed scatter, revealed as night falls).
const STAR_SEEDS = [
  [0.08, 0.1], [0.2, 0.05], [0.33, 0.18], [0.47, 0.08], [0.62, 0.14],
  [0.74, 0.06], [0.88, 0.16], [0.15, 0.28], [0.55, 0.24], [0.82, 0.3],
  [0.05, 0.4], [0.92, 0.42], [0.4, 0.35], [0.68, 0.38], [0.28, 0.45],
] as const

export default function Beat_MidnightOil({ localProgress, clock, reducedMotion }: SceneProps) {
  const p = THREE.MathUtils.clamp(localProgress, 0, 1)
  const drift = reducedMotion ? 0 : clock

  // Day fades to night over the first two-thirds of the beat.
  const dayAmount = 1 - Math.min(1, p * 1.5)
  const skyColor = useMemo(() => NIGHT.clone().lerp(DAY, dayAmount), [dayAmount])

  // Sun sets / moon rises: both arc left->right across the upper sky with progress.
  const travelX = X(p)
  const arcY = Y(0.15) - Math.sin(p * Math.PI) * 0.6 // gentle setting/rising arc
  const sunMoonPos = new THREE.Vector3(travelX, arcY, 0)

  // Bar geometry (centered, two stacked tracks near mid-screen).
  const barW = 6.0
  const barH = 0.7
  const collegeY = Y(0.49)
  const rriY = Y(0.42)

  const collegeAlpha = p > 0.4 ? Math.max(0, 1 - (p - 0.4) * 2) : 1
  const collegeFill = barW * 0.6
  const rriGlow = p > 0.5 ? (p - 0.5) * 2 : 0 // 0..1 glow intensity

  const starPositions = useMemo(() => {
    const arr = new Float32Array(STAR_SEEDS.length * 3)
    STAR_SEEDS.forEach((s, i) => {
      arr[i * 3] = X(s[0])
      arr[i * 3 + 1] = Y(s[1]) + 0.4
      arr[i * 3 + 2] = -0.5
    })
    return arr
  }, [])

  return (
    <group>
      {/* Sky backdrop: a large plane tinted day->night. */}
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[12, 8]} />
        <meshBasicMaterial color={skyColor} toneMapped={false} />
      </mesh>

      {/* Stars, fading in as night falls. */}
      {dayAmount < 1 && (
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.12}
            color="#ffffff"
            transparent
            opacity={(1 - dayAmount) * 0.9}
            toneMapped={false}
          />
        </points>
      )}

      {/* Sun: yellow, glows while day lasts. */}
      {dayAmount > 0 && (
        <group position={sunMoonPos}>
          <mesh>
            <sphereGeometry args={[0.45, 24, 24]} />
            <meshBasicMaterial color="#fde047" transparent opacity={dayAmount} toneMapped={false} />
          </mesh>
          <mesh rotation={[0, 0, drift * 0.2]}>
            <ringGeometry args={[0.55, 0.85, 32]} />
            <meshBasicMaterial color="#facc15" transparent opacity={dayAmount * 0.4} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* Moon: pale disc with a crescent shadow, fades in with night. */}
      {dayAmount < 1 && (
        <group position={sunMoonPos}>
          <mesh>
            <sphereGeometry args={[0.45, 24, 24]} />
            <meshBasicMaterial color="#f0f0f0" transparent opacity={1 - dayAmount} toneMapped={false} />
          </mesh>
          <mesh position={[-0.16, 0.07, 0.05]}>
            <sphereGeometry args={[0.38, 24, 24]} />
            <meshBasicMaterial color={skyColor} transparent opacity={1 - dayAmount} toneMapped={false} />
          </mesh>
        </group>
      )}

      {/* College bar: dark track + yellow fill, both fade after progress 0.4. */}
      <group position={[0, collegeY, 0]}>
        <mesh>
          <planeGeometry args={[barW, barH]} />
          <meshBasicMaterial color="#1e293b" transparent opacity={collegeAlpha * 0.5 + 0.1} toneMapped={false} />
        </mesh>
        <mesh position={[-(barW - collegeFill) / 2, 0, 0.01]}>
          <planeGeometry args={[collegeFill, barH]} />
          <meshBasicMaterial color="#fde047" transparent opacity={collegeAlpha} toneMapped={false} />
        </mesh>
        <Text position={[0, 0, 0.02]} fontSize={0.32} color="#ffffff" anchorX="center" anchorY="middle" fillOpacity={collegeAlpha}>
          College
        </Text>
      </group>

      {/* RRIViz bar: dark track + full green fill that gains an intense glow. */}
      <group position={[0, rriY, 0]}>
        <mesh>
          <planeGeometry args={[barW, barH]} />
          <meshBasicMaterial color="#1e293b" transparent opacity={0.6} toneMapped={false} />
        </mesh>
        {rriGlow > 0 && (
          <mesh position={[0, 0, 0.005]} scale={[1 + rriGlow * 0.25, 1 + rriGlow * 0.7, 1]}>
            <planeGeometry args={[barW, barH]} />
            <meshBasicMaterial color="#4ade80" transparent opacity={rriGlow * 0.5} toneMapped={false} />
          </mesh>
        )}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[barW, barH]} />
          <meshBasicMaterial color="#4ade80" toneMapped={false} />
        </mesh>
        <Text position={[0, 0, 0.02]} fontSize={0.32} color="#03200f" anchorX="center" anchorY="middle">
          RRIViz
        </Text>
      </group>
    </group>
  )
}
