// src/components/CosmicJourney3D/scenes/Beat_DualPaths.tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'

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

type TextMesh = THREE.Mesh & { fillOpacity: number }
type MaterialSlots = { current: Array<THREE.Material | null> }

function setSlotOpacity(slots: MaterialSlots, count: number, opacity: number): void {
  for (let i = 0; i < count; i++) {
    const material = slots.current[i]
    if (material) material.opacity = opacity
  }
}

export default function Beat_DualPaths({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)

  const rootRef = useRef<THREE.Group>(null)
  const branchRef = useRef<THREE.Mesh>(null)
  const techLineRef = useRef<THREE.LineSegments>(null)
  const bioLineRef = useRef<THREE.LineSegments>(null)
  const phoneRef = useRef<THREE.Group>(null)
  const phoneMaterials = useRef<Array<THREE.Material | null>>([])
  const eecsRef = useRef<TextMesh>(null)
  const dnaRef = useRef<THREE.Group>(null)
  const helixSpinRef = useRef<THREE.Group>(null)
  const dnaMaterials = useRef<Array<THREE.Material | null>>([])
  const igemRef = useRef<TextMesh>(null)
  const arcRef = useRef<THREE.LineSegments>(null)

  // Path lines start as zero-length (branch -> branch); only the tip vertex moves.
  const techLine = useMemo(
    () => new Float32Array([BRANCH.x, BRANCH.y, BRANCH.z, BRANCH.x, BRANCH.y, BRANCH.z]),
    [],
  )
  const bioLine = useMemo(
    () => new Float32Array([BRANCH.x, BRANCH.y, BRANCH.z, BRANCH.x, BRANCH.y, BRANCH.z]),
    [],
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

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = beat.clock

    // Original speeds path progress up 3x; bio lags slightly behind tech.
    const pathProgress = Math.min(1, p * 3)
    const techPath = pathProgress
    const bioPath = Math.min(1, Math.max(0, pathProgress - 0.1))
    const branchAlpha = Math.min(1, p * 2)
    const arcAlpha = Math.max(0, (p - 0.8) / 0.2)

    const root = rootRef.current
    if (root) root.position.y = reducedMotion ? 0 : Math.sin(t * 0.6) * 0.04

    const branch = branchRef.current
    if (branch) (branch.material as THREE.MeshBasicMaterial).opacity = branchAlpha

    const techLineObject = techLineRef.current
    if (techLineObject) {
      techLineObject.visible = techPath > 0
      const attribute = techLineObject.geometry.attributes.position as THREE.BufferAttribute
      attribute.setXYZ(
        1,
        BRANCH.x + (TECH_END.x - BRANCH.x) * techPath,
        BRANCH.y + (TECH_END.y - BRANCH.y) * techPath,
        BRANCH.z + (TECH_END.z - BRANCH.z) * techPath,
      )
      attribute.needsUpdate = true
      ;(techLineObject.material as THREE.LineBasicMaterial).opacity = 0.85 * techPath
    }

    const bioLineObject = bioLineRef.current
    if (bioLineObject) {
      bioLineObject.visible = bioPath > 0
      const attribute = bioLineObject.geometry.attributes.position as THREE.BufferAttribute
      attribute.setXYZ(
        1,
        BRANCH.x + (BIO_END.x - BRANCH.x) * bioPath,
        BRANCH.y + (BIO_END.y - BRANCH.y) * bioPath,
        BRANCH.z + (BIO_END.z - BRANCH.z) * bioPath,
      )
      attribute.needsUpdate = true
      ;(bioLineObject.material as THREE.LineBasicMaterial).opacity = 0.85 * bioPath
    }

    const phoneAlpha = Math.max(0, (techPath - 0.5) / 0.5)
    const dnaAlpha = Math.max(0, (bioPath - 0.5) / 0.5)

    if (phoneRef.current) phoneRef.current.visible = phoneAlpha > 0
    setSlotOpacity(phoneMaterials, 6, phoneAlpha)
    if (eecsRef.current) eecsRef.current.fillOpacity = phoneAlpha

    if (dnaRef.current) dnaRef.current.visible = dnaAlpha > 0
    if (helixSpinRef.current) helixSpinRef.current.rotation.y = reducedMotion ? 0 : t * 0.5
    const strandA = dnaMaterials.current[0]
    const strandB = dnaMaterials.current[1]
    const rungs = dnaMaterials.current[2]
    if (strandA) strandA.opacity = dnaAlpha
    if (strandB) strandB.opacity = dnaAlpha
    if (rungs) rungs.opacity = 0.7 * dnaAlpha
    if (igemRef.current) igemRef.current.fillOpacity = dnaAlpha

    const arcObject = arcRef.current
    if (arcObject) {
      arcObject.visible = arcAlpha > 0
      ;(arcObject.material as THREE.LineBasicMaterial).opacity = 0.6 * arcAlpha
    }
  })

  return (
    <group ref={rootRef}>
      {/* Branch point */}
      <mesh ref={branchRef} position={BRANCH}>
        <sphereGeometry args={[0.28, 20, 20]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} toneMapped={false} />
      </mesh>

      {/* Tech path (blue) */}
      <lineSegments ref={techLineRef} visible={false} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[techLine, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={TECH_BLUE} transparent opacity={0} toneMapped={false} />
      </lineSegments>

      {/* Bio path (green) */}
      <lineSegments ref={bioLineRef} visible={false} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[bioLine, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={BIO_GREEN} transparent opacity={0} toneMapped={false} />
      </lineSegments>

      {/* Phone-with-signal-bars at the EECS / tech endpoint */}
      <group ref={phoneRef} position={TECH_END} visible={false}>
        <mesh>
          <boxGeometry args={[0.88, 1.62, 0.12]} />
          <meshBasicMaterial ref={(m) => { phoneMaterials.current[0] = m }} color={TECH_BLUE} transparent opacity={0} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.06, 0.08]}>
          <planeGeometry args={[0.65, 1.18]} />
          <meshBasicMaterial ref={(m) => { phoneMaterials.current[1] = m }} color="#0a0f1f" transparent opacity={0} toneMapped={false} />
        </mesh>
        {/* Four ascending signal bars */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`bar${i}`} position={[-0.22 + i * 0.15, -0.06 + i * 0.075, 0.1]}>
            <boxGeometry args={[0.09, 0.15 + i * 0.15, 0.02]} />
            <meshBasicMaterial ref={(m) => { phoneMaterials.current[2 + i] = m }} color={SIGNAL_GREEN} transparent opacity={0} toneMapped={false} />
          </mesh>
        ))}
        <Text ref={eecsRef} position={[0, -1.18, 0]} fontSize={0.4} color="#dbeafe" anchorX="center" anchorY="top" fillOpacity={0}>
          EECS
        </Text>
      </group>

      {/* DNA double-helix at the iGEM / bio endpoint */}
      <group ref={dnaRef} position={[BIO_END.x, BIO_END.y + 0.2, BIO_END.z]} visible={false}>
        <group ref={helixSpinRef}>
          <line>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[helix.strandA, 3]} />
            </bufferGeometry>
            <lineBasicMaterial ref={(m) => { dnaMaterials.current[0] = m }} color={BIO_GREEN} transparent opacity={0} toneMapped={false} />
          </line>
          <line>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[helix.strandB, 3]} />
            </bufferGeometry>
            <lineBasicMaterial ref={(m) => { dnaMaterials.current[1] = m }} color="#86efac" transparent opacity={0} toneMapped={false} />
          </line>
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[helix.rungs, 3]} />
            </bufferGeometry>
            <lineBasicMaterial ref={(m) => { dnaMaterials.current[2] = m }} color={BIO_GREEN} transparent opacity={0} toneMapped={false} />
          </lineSegments>
        </group>
        <Text ref={igemRef} position={[0, -1.78, 0]} fontSize={0.4} color="#dcfce7" anchorX="center" anchorY="top" fillOpacity={0}>
          iGEM
        </Text>
      </group>

      {/* Faint connecting arc, late reveal */}
      <lineSegments ref={arcRef} visible={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[arc, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={ARC_PURPLE} transparent opacity={0} toneMapped={false} />
      </lineSegments>
    </group>
  )
}
