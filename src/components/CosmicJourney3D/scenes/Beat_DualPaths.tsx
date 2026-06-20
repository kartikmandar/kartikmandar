// src/components/CosmicJourney3D/scenes/Beat_DualPaths.tsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { SceneProps } from '../types'

// Acceptance: two diverging glowing paths from a branch point — a blue tech path
// ending in a phone-with-signal-bars (EECS) and a green bio path ending in a DNA
// double-helix (iGEM); a faint connecting arc appears later. Mirrors
// drawInternshipPathways: branch at center-bottom, tech up-left, bio up-right.

// Map the original 2D [0..1] layout into this beat's local XY space, sized to
// fill the head-on ~9x6 frame and lifted so the branch clears the overlay zone
// (everything stays above local Y = -1.5).
const X_SPAN = 13 // wider V so the two endpoints fill the horizontal frame
const Y_SPAN = 6.4
const Y_OFFSET = 1.0 // lift the whole layout up out of the reserved bottom band
const toPos = (px: number, py: number) =>
  new THREE.Vector3((px - 0.5) * X_SPAN, (0.5 - py) * Y_SPAN + Y_OFFSET, 0)

const BRANCH = toPos(0.5, 0.8) // (0, -0.92, 0) — above the overlay floor
const TECH_END = toPos(0.2, 0.3) // up-left  (-3.9, 2.28, 0)
const BIO_END = toPos(0.8, 0.3) // up-right (3.9, 2.28, 0)

const TECH_BLUE = '#3b82f6'
const BIO_GREEN = '#22c55e'
const SIGNAL_GREEN = '#22c55e'
const ARC_PURPLE = '#8a2be2'

export default function Beat_DualPaths({ localProgress, clock, reducedMotion }: SceneProps) {
  // Original speeds path progress up 3x; bio lags slightly behind tech.
  const pathProgress = Math.min(1, localProgress * 3)
  const techPath = pathProgress
  const bioPath = Math.min(1, Math.max(0, pathProgress - 0.1))
  const branchAlpha = Math.min(1, localProgress * 2)
  const arcAlpha = Math.max(0, (localProgress - 0.8) / 0.2)
  const drift = reducedMotion ? 0 : Math.sin(clock * 0.6) * 0.04

  // Current growing endpoints of each path.
  const techTip = useMemo(
    () => BRANCH.clone().lerp(TECH_END, techPath),
    [techPath],
  )
  const bioTip = useMemo(
    () => BRANCH.clone().lerp(BIO_END, bioPath),
    [bioPath],
  )

  const techLine = useMemo(
    () => new Float32Array([BRANCH.x, BRANCH.y, BRANCH.z, techTip.x, techTip.y, techTip.z]),
    [techTip],
  )
  const bioLine = useMemo(
    () => new Float32Array([BRANCH.x, BRANCH.y, BRANCH.z, bioTip.x, bioTip.y, bioTip.z]),
    [bioTip],
  )

  // DNA double helix: two phase-shifted sine strands + cross-rungs (iGEM end).
  const helix = useMemo(() => {
    const SEG = 48
    const H = 2.8
    const R = 0.6
    const turns = Math.PI * 4
    const strandA: number[] = []
    const strandB: number[] = []
    const rungs: number[] = []
    for (let i = 0; i < SEG; i++) {
      const t = i / (SEG - 1)
      const angle = t * turns
      const y = -H / 2 + t * H
      strandA.push(Math.cos(angle) * R, y, Math.sin(angle) * R)
      strandB.push(Math.cos(angle + Math.PI) * R, y, Math.sin(angle + Math.PI) * R)
      if (i % 6 === 0) {
        rungs.push(Math.cos(angle) * R, y, Math.sin(angle) * R)
        rungs.push(Math.cos(angle + Math.PI) * R, y, Math.sin(angle + Math.PI) * R)
      }
    }
    return {
      strandA: new Float32Array(strandA),
      strandB: new Float32Array(strandB),
      rungs: new Float32Array(rungs),
    }
  }, [])

  // Faint dashed connecting arc bridging the two endpoints (drawn as a polyline).
  // Center/radius tuned so the arc peaks below the Y=4 frame top.
  const arc = useMemo(() => {
    const SEG = 40
    const cy = BRANCH.y + 1.6 // peak ~Y 3.7, well under the frame top
    const radius = 2.2
    const pts: number[] = []
    for (let i = 0; i < SEG; i++) {
      if (i % 2 === 1) continue // dashed look: skip every other segment
      const a0 = Math.PI / 6 + (i / SEG) * (Math.PI * 5 / 6 - Math.PI / 6)
      const a1 = Math.PI / 6 + ((i + 1) / SEG) * (Math.PI * 5 / 6 - Math.PI / 6)
      pts.push(Math.cos(a0) * radius, cy + Math.sin(a0) * radius, 0)
      pts.push(Math.cos(a1) * radius, cy + Math.sin(a1) * radius, 0)
    }
    return new Float32Array(pts)
  }, [])

  const phoneAlpha = Math.max(0, (techPath - 0.5) / 0.5)
  const dnaAlpha = Math.max(0, (bioPath - 0.5) / 0.5)
  const helixSpin = reducedMotion ? 0 : clock * 0.5

  return (
    <group position={[0, drift, 0]}>
      {/* Branch point */}
      <mesh position={BRANCH}>
        <sphereGeometry args={[0.28, 20, 20]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={branchAlpha} toneMapped={false} />
      </mesh>

      {/* Tech path (blue) */}
      {techPath > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[techLine, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={TECH_BLUE} transparent opacity={0.85 * techPath} toneMapped={false} />
        </lineSegments>
      )}

      {/* Bio path (green) */}
      {bioPath > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[bioLine, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={BIO_GREEN} transparent opacity={0.85 * bioPath} toneMapped={false} />
        </lineSegments>
      )}

      {/* Phone-with-signal-bars at the EECS / tech endpoint */}
      {phoneAlpha > 0 && (
        <group position={TECH_END}>
          <mesh>
            <boxGeometry args={[0.88, 1.62, 0.12]} />
            <meshBasicMaterial color={TECH_BLUE} transparent opacity={phoneAlpha} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.06, 0.08]}>
            <planeGeometry args={[0.65, 1.18]} />
            <meshBasicMaterial color="#0a0f1f" transparent opacity={phoneAlpha} toneMapped={false} />
          </mesh>
          {/* Four ascending signal bars */}
          {[0, 1, 2, 3].map((i) => (
            <mesh key={`bar${i}`} position={[-0.22 + i * 0.15, -0.06 + i * 0.075, 0.1]}>
              <boxGeometry args={[0.09, 0.15 + i * 0.15, 0.02]} />
              <meshBasicMaterial color={SIGNAL_GREEN} transparent opacity={phoneAlpha} toneMapped={false} />
            </mesh>
          ))}
          <Text position={[0, -1.18, 0]} fontSize={0.4} color="#dbeafe" anchorX="center" anchorY="top" fillOpacity={phoneAlpha}>
            EECS
          </Text>
        </group>
      )}

      {/* DNA double-helix at the iGEM / bio endpoint */}
      {dnaAlpha > 0 && (
        <group position={[BIO_END.x, BIO_END.y + 0.2, BIO_END.z]}>
          <group rotation={[0, helixSpin, 0]}>
            <line>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[helix.strandA, 3]} />
              </bufferGeometry>
              <lineBasicMaterial color={BIO_GREEN} transparent opacity={dnaAlpha} toneMapped={false} />
            </line>
            <line>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[helix.strandB, 3]} />
              </bufferGeometry>
              <lineBasicMaterial color="#86efac" transparent opacity={dnaAlpha} toneMapped={false} />
            </line>
            <lineSegments>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[helix.rungs, 3]} />
              </bufferGeometry>
              <lineBasicMaterial color={BIO_GREEN} transparent opacity={0.7 * dnaAlpha} toneMapped={false} />
            </lineSegments>
          </group>
          <Text position={[0, -1.78, 0]} fontSize={0.4} color="#dcfce7" anchorX="center" anchorY="top" fillOpacity={dnaAlpha}>
            iGEM
          </Text>
        </group>
      )}

      {/* Faint connecting arc, late reveal */}
      {arcAlpha > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[arc, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={ARC_PURPLE} transparent opacity={0.6 * arcAlpha} toneMapped={false} />
        </lineSegments>
      )}
    </group>
  )
}
