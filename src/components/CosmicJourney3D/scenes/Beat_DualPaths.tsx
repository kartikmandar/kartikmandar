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

// Map the original 2D [0..1] layout into this beat's local XY space (10 x 7).
const toPos = (px: number, py: number) =>
  new THREE.Vector3((px - 0.5) * 10, (0.5 - py) * 7, 0)

const BRANCH = toPos(0.5, 0.8) // (0, -2.1, 0)
const TECH_END = toPos(0.2, 0.3) // up-left  (-3, 1.4, 0)
const BIO_END = toPos(0.8, 0.3) // up-right (3, 1.4, 0)

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
    const H = 2.6
    const R = 0.45
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

  // Faint dashed connecting arc above the branch point (drawn as a polyline).
  const arc = useMemo(() => {
    const SEG = 40
    const cy = BRANCH.y + 3.4
    const radius = 3.4
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
            <boxGeometry args={[0.7, 1.3, 0.12]} />
            <meshBasicMaterial color={TECH_BLUE} transparent opacity={phoneAlpha} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.05, 0.08]}>
            <planeGeometry args={[0.52, 0.95]} />
            <meshBasicMaterial color="#0a0f1f" transparent opacity={phoneAlpha} toneMapped={false} />
          </mesh>
          {/* Four ascending signal bars */}
          {[0, 1, 2, 3].map((i) => (
            <mesh key={`bar${i}`} position={[-0.18 + i * 0.12, -0.05 + i * 0.06, 0.1]}>
              <boxGeometry args={[0.07, 0.12 + i * 0.12, 0.02]} />
              <meshBasicMaterial color={SIGNAL_GREEN} transparent opacity={phoneAlpha} toneMapped={false} />
            </mesh>
          ))}
          <Text position={[0, -1.0, 0]} fontSize={0.32} color="#ffffff" anchorX="center" anchorY="top" fillOpacity={phoneAlpha}>
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
          <Text position={[0, -1.7, 0]} fontSize={0.32} color="#ffffff" anchorX="center" anchorY="top" fillOpacity={dnaAlpha}>
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
