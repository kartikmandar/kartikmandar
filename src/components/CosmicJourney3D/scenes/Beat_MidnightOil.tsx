// src/components/CosmicJourney3D/scenes/Beat_MidnightOil.tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'

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

type TextMesh = THREE.Mesh & { fillOpacity: number }

// Scratch colour for the day->night lerp (module-level, mutated in place).
const scratchSky = new THREE.Color()

// Bar geometry (centered on the origin, two stacked tracks filling the frame).
const BAR_W = 8.0
const BAR_H = 0.9
const COLLEGE_Y = 0.85
const RRI_Y = -0.35
const COLLEGE_FILL = BAR_W * 0.6

export default function Beat_MidnightOil({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)

  const skyRef = useRef<THREE.Mesh>(null)
  const starsRef = useRef<THREE.Points>(null)
  const sunRef = useRef<THREE.Group>(null)
  const sunDiscRef = useRef<THREE.Mesh>(null)
  const sunRingRef = useRef<THREE.Mesh>(null)
  const moonRef = useRef<THREE.Group>(null)
  const moonDiscRef = useRef<THREE.Mesh>(null)
  const moonShadowRef = useRef<THREE.Mesh>(null)
  const collegeTrackRef = useRef<THREE.Mesh>(null)
  const collegeFillRef = useRef<THREE.Mesh>(null)
  const collegeTextRef = useRef<TextMesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  const starPositions = useMemo(() => {
    const arr = new Float32Array(STAR_SEEDS.length * 3)
    STAR_SEEDS.forEach((s, i) => {
      arr[i * 3] = X(s[0])
      arr[i * 3 + 1] = Y(s[1]) + 0.4
      arr[i * 3 + 2] = -0.5
    })
    return arr
  }, [])

  useFrame(() => {
    if (!beat.near) return
    const p = THREE.MathUtils.clamp(beat.local, 0, 1)
    const drift = reducedMotion ? 0 : beat.clock

    // Day fades to night over the first two-thirds of the beat.
    const dayAmount = 1 - Math.min(1, p * 1.5)
    scratchSky.copy(NIGHT).lerp(DAY, dayAmount)

    const sky = skyRef.current
    if (sky) (sky.material as THREE.MeshBasicMaterial).color.copy(scratchSky)

    // Sun sets / moon rises: both arc left->right across the upper sky with progress.
    const travelX = THREE.MathUtils.lerp(-4.2, 4.2, p)
    const arcY = 3.0 + Math.sin(p * Math.PI) * 0.7

    const stars = starsRef.current
    if (stars) {
      stars.visible = dayAmount < 1
      ;(stars.material as THREE.PointsMaterial).opacity = (1 - dayAmount) * 0.9
    }

    const sun = sunRef.current
    if (sun) {
      sun.visible = dayAmount > 0
      sun.position.set(travelX, arcY, 0)
    }
    const sunDisc = sunDiscRef.current
    if (sunDisc) (sunDisc.material as THREE.MeshBasicMaterial).opacity = dayAmount
    const sunRing = sunRingRef.current
    if (sunRing) {
      sunRing.rotation.z = drift * 0.2
      ;(sunRing.material as THREE.MeshBasicMaterial).opacity = dayAmount * 0.4
    }

    const moon = moonRef.current
    if (moon) {
      moon.visible = dayAmount < 1
      moon.position.set(travelX, arcY, 0)
    }
    const moonDisc = moonDiscRef.current
    if (moonDisc) (moonDisc.material as THREE.MeshBasicMaterial).opacity = 1 - dayAmount
    const moonShadow = moonShadowRef.current
    if (moonShadow) {
      const material = moonShadow.material as THREE.MeshBasicMaterial
      material.color.copy(scratchSky)
      material.opacity = 1 - dayAmount
    }

    const collegeAlpha = p > 0.4 ? Math.max(0, 1 - (p - 0.4) * 2) : 1
    const collegeTrack = collegeTrackRef.current
    if (collegeTrack) (collegeTrack.material as THREE.MeshBasicMaterial).opacity = collegeAlpha * 0.5 + 0.1
    const collegeFill = collegeFillRef.current
    if (collegeFill) (collegeFill.material as THREE.MeshBasicMaterial).opacity = collegeAlpha
    if (collegeTextRef.current) collegeTextRef.current.fillOpacity = collegeAlpha

    const rriGlow = p > 0.5 ? (p - 0.5) * 2 : 0 // 0..1 glow intensity
    const glow = glowRef.current
    if (glow) {
      glow.visible = rriGlow > 0
      glow.scale.set(1 + rriGlow * 0.25, 1 + rriGlow * 0.7, 1)
      ;(glow.material as THREE.MeshBasicMaterial).opacity = rriGlow * 0.5
    }
  })

  return (
    <group>
      {/* Sky backdrop: a large plane tinted day->night. */}
      <mesh ref={skyRef} position={[0, 0, -2]}>
        <planeGeometry args={[12, 8]} />
        <meshBasicMaterial color={DAY} toneMapped={false} />
      </mesh>

      {/* Stars, fading in as night falls. */}
      <points ref={starsRef} visible={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.12} color="#ffffff" transparent opacity={0} toneMapped={false} />
      </points>

      {/* Sun: yellow, glows while day lasts. */}
      <group ref={sunRef} position={[-4.2, 3.0, 0]}>
        <mesh ref={sunDiscRef}>
          <sphereGeometry args={[0.45, 24, 24]} />
          <meshBasicMaterial color="#fde047" transparent opacity={1} toneMapped={false} />
        </mesh>
        <mesh ref={sunRingRef}>
          <ringGeometry args={[0.55, 0.85, 32]} />
          <meshBasicMaterial color="#facc15" transparent opacity={0.4} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Moon: pale disc with a crescent shadow, fades in with night. */}
      <group ref={moonRef} position={[-4.2, 3.0, 0]} visible={false}>
        <mesh ref={moonDiscRef}>
          <sphereGeometry args={[0.45, 24, 24]} />
          <meshBasicMaterial color="#f0f0f0" transparent opacity={0} toneMapped={false} />
        </mesh>
        <mesh ref={moonShadowRef} position={[-0.16, 0.07, 0.05]}>
          <sphereGeometry args={[0.38, 24, 24]} />
          <meshBasicMaterial color={DAY} transparent opacity={0} toneMapped={false} />
        </mesh>
      </group>

      {/* College bar: dark track + yellow fill, both fade after progress 0.4. */}
      <group position={[0, COLLEGE_Y, 0]}>
        <mesh ref={collegeTrackRef}>
          <planeGeometry args={[BAR_W, BAR_H]} />
          <meshBasicMaterial color="#1e293b" transparent opacity={0.6} toneMapped={false} />
        </mesh>
        <mesh ref={collegeFillRef} position={[-(BAR_W - COLLEGE_FILL) / 2, 0, 0.01]}>
          <planeGeometry args={[COLLEGE_FILL, BAR_H]} />
          <meshBasicMaterial color="#fde047" transparent opacity={1} toneMapped={false} />
        </mesh>
        <Text ref={collegeTextRef} position={[-BAR_W / 2 + 0.25, 0, 0.02]} fontSize={0.4} color="#0b1220" anchorX="left" anchorY="middle" fillOpacity={1}>
          College
        </Text>
      </group>

      {/* RRIViz bar: dark track + full green fill that gains an intense glow. */}
      <group position={[0, RRI_Y, 0]}>
        <mesh>
          <planeGeometry args={[BAR_W, BAR_H]} />
          <meshBasicMaterial color="#1e293b" transparent opacity={0.6} toneMapped={false} />
        </mesh>
        <mesh ref={glowRef} position={[0, 0, 0.005]} visible={false}>
          <planeGeometry args={[BAR_W, BAR_H]} />
          <meshBasicMaterial color="#4ade80" transparent opacity={0} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[BAR_W, BAR_H]} />
          <meshBasicMaterial color="#4ade80" toneMapped={false} />
        </mesh>
        <Text position={[-BAR_W / 2 + 0.25, 0, 0.02]} fontSize={0.4} color="#03200f" anchorX="left" anchorY="middle">
          RRIVis
        </Text>
      </group>
    </group>
  )
}
