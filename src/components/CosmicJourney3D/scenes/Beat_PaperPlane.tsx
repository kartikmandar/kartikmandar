// src/components/CosmicJourney3D/scenes/Beat_PaperPlane.tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'

// Acceptance: reproduces drawPublicationFlight. A research paper (arXiv:2506.02130
// + fftvis title) folds into a paper airplane and flies off; its trajectory splits
// into two trails toward destination stars "U of Toronto" and "IIT Indore (SKA)".
// Three phases mirror the 2D source: paper (0-0.2), fold (0.2-0.4), flight (0.4-1).

// Map the original 2D [0..1] layout into the XY plane. Width spans ~9 units; the
// vertical band is lifted (+0.8) so destination stars/labels stay above the
// overlay copy reserved below local Y = -1.5.
const Y_LIFT = 0.8
const toX = (u: number) => (u - 0.5) * 9
const toY = (v: number) => (0.5 - v) * 5 + Y_LIFT

// Paper-airplane silhouette (drawPaperPlane), normalized to ~unit size in XY.
const PLANE_PTS = [
  [0, 1], [0.9, -0.4], [0, -0.2], [-0.9, -0.4],
] as const
const PLANE_POS = (() => {
  const arr: number[] = []
  const tri = [0, 1, 2, 0, 2, 3]
  for (const idx of tri) {
    const p = PLANE_PTS[idx]!
    arr.push(p[0] * 0.7, p[1] * 0.9, 0)
  }
  return new Float32Array(arr)
})()

// Destinations: U of Toronto (yellow) at 0.25,0.4 — IIT Indore (indigo) at 0.75,0.6.
const DEST1 = new THREE.Vector3(toX(0.25), toY(0.4), 0)
const DEST2 = new THREE.Vector3(toX(0.75), toY(0.6), 0)
const START = new THREE.Vector3(0, Y_LIFT, 0)
const PLANE_END = new THREE.Vector3(toX(0.82), toY(0.28), 0)

type TextMesh = THREE.Mesh & { fillOpacity: number }
type BasicMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>

const RULE_COUNT = 4

export default function Beat_PaperPlane({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)

  const paperGroupRef = useRef<THREE.Group>(null)
  const sheetRef = useRef<BasicMesh>(null)
  const arxivRef = useRef<TextMesh>(null)
  const titleRef = useRef<TextMesh>(null)
  const authorsRef = useRef<TextMesh>(null)
  const ruleRefs = useRef<Array<BasicMesh | null>>([])
  const planeGroupRef = useRef<THREE.Group>(null)
  const planeMeshRef = useRef<BasicMesh>(null)
  const trailGroupRef = useRef<THREE.Group>(null)
  const trail1Ref = useRef<THREE.LineSegments>(null)
  const trail2Ref = useRef<THREE.LineSegments>(null)
  const dest1GroupRef = useRef<THREE.Group>(null)
  const dest1SphereRef = useRef<BasicMesh>(null)
  const dest1TextRef = useRef<TextMesh>(null)
  const dest2GroupRef = useRef<THREE.Group>(null)
  const dest2SphereRef = useRef<BasicMesh>(null)
  const dest2TextRef = useRef<TextMesh>(null)

  // Two split trails from START toward each destination (fixed 2-vertex line segments; end vertex moves).
  const trail1Positions = useMemo(() => new Float32Array([START.x, START.y, 0, START.x, START.y, 0]), [])
  const trail2Positions = useMemo(() => new Float32Array([START.x, START.y, 0, START.x, START.y, 0]), [])

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = beat.clock

    const paper = Math.min(1, p / 0.2)
    const fold = Math.min(1, Math.max(0, (p - 0.2) / 0.2))
    const flight = Math.max(0, (p - 0.4) / 0.6)
    const split = Math.min(1, Math.max(0, (flight - 0.1) / 0.4))
    const destAlpha = Math.min(1, split * 2)
    const drift = reducedMotion ? 0 : Math.sin(t * 0.6) * 0.12

    // Phase 1: the research paper sheet.
    const paperGroup = paperGroupRef.current
    if (paperGroup) {
      paperGroup.visible = paper > 0 && fold < 1
      paperGroup.position.y = Y_LIFT + drift
      paperGroup.scale.y = 1 - fold
      const alpha = paper * (1 - fold)
      if (sheetRef.current) sheetRef.current.material.opacity = alpha
      if (arxivRef.current) arxivRef.current.fillOpacity = alpha
      if (titleRef.current) titleRef.current.fillOpacity = alpha
      if (authorsRef.current) authorsRef.current.fillOpacity = alpha * 0.9
      for (let i = 0; i < RULE_COUNT; i += 1) {
        const rule = ruleRefs.current[i]
        if (rule) rule.material.opacity = alpha * 0.5
      }
    }

    // Plane: scale up from the fold, lift off & travel during flight, gently bank.
    const planeGroup = planeGroupRef.current
    if (planeGroup) {
      const planeT = Math.min(flight, 0.8) / 0.8
      const planeScale = (0.6 + fold * 0.4) * 1.8
      const planeAlpha = flight > 0 ? Math.max(0.3, 1 - flight * 0.7) : fold * 0.9
      planeGroup.visible = (fold > 0 || flight > 0) && planeAlpha > 0
      planeGroup.position.set(
        START.x + (PLANE_END.x - START.x) * planeT,
        START.y + (PLANE_END.y - START.y) * planeT + drift,
        0,
      )
      planeGroup.rotation.z = -Math.PI / 8 + drift * 0.3
      planeGroup.scale.setScalar(planeScale)
      if (planeMeshRef.current) planeMeshRef.current.material.opacity = planeAlpha
    }

    // Two split trails toward the destination stars.
    const trailGroup = trailGroupRef.current
    if (trailGroup) {
      trailGroup.visible = split > 0
      const trailAlpha = Math.max(0.3, 1 - flight * 0.5)
      const trail1 = trail1Ref.current
      if (trail1) {
        const attribute1 = trail1.geometry.attributes.position!
        const array1 = attribute1.array as Float32Array
        array1[3] = START.x + (DEST1.x - START.x) * split
        array1[4] = START.y + (DEST1.y - START.y) * split
        attribute1.needsUpdate = true
        ;(trail1.material as THREE.LineBasicMaterial).opacity = trailAlpha
      }
      const trail2 = trail2Ref.current
      if (trail2) {
        const attribute2 = trail2.geometry.attributes.position!
        const array2 = attribute2.array as Float32Array
        array2[3] = START.x + (DEST2.x - START.x) * split
        array2[4] = START.y + (DEST2.y - START.y) * split
        attribute2.needsUpdate = true
        ;(trail2.material as THREE.LineBasicMaterial).opacity = trailAlpha
      }
    }

    // Destination stars.
    const showDest = destAlpha > 0
    if (dest1GroupRef.current) dest1GroupRef.current.visible = showDest
    if (dest2GroupRef.current) dest2GroupRef.current.visible = showDest
    if (dest1SphereRef.current) dest1SphereRef.current.material.opacity = destAlpha
    if (dest2SphereRef.current) dest2SphereRef.current.material.opacity = destAlpha
    if (dest1TextRef.current) dest1TextRef.current.fillOpacity = destAlpha
    if (dest2TextRef.current) dest2TextRef.current.fillOpacity = destAlpha
  })

  return (
    <group>
      {/* Phase 1: the research paper sheet with header / title / abstract rules. */}
      <group ref={paperGroupRef} visible={false} position={[0, Y_LIFT, 0]}>
        <mesh ref={sheetRef}>
          <planeGeometry args={[4.4, 3.2]} />
          <meshBasicMaterial color="#f0f0f0" transparent opacity={0} toneMapped={false} />
        </mesh>
        <Text ref={arxivRef} position={[0, 1.15, 0.02]} fontSize={0.34} color="#1e1e1e" anchorX="center" anchorY="middle" fillOpacity={0}>
          arXiv:2506.02130
        </Text>
        <Text ref={titleRef} position={[0, 0.5, 0.02]} fontSize={0.24} color="#1e1e1e" anchorX="center" anchorY="middle" maxWidth={4} textAlign="center" fillOpacity={0}>
          fftvis: A Non-Uniform Fast Fourier Transform Based Interferometric Visibility Simulator
        </Text>
        <Text ref={authorsRef} position={[0, -0.4, 0.02]} fontSize={0.16} color="#323232" anchorX="center" anchorY="middle" fillOpacity={0}>
          T.A. Cox, S.G. Murray, A.R. Parsons, J.S. Dillon, K. Mandar, et al.
        </Text>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={`ab${i}`}
            ref={(node: BasicMesh | null) => {
              ruleRefs.current[i] = node
            }}
            position={[0, -0.82 - i * 0.24, 0.01]}
          >
            <planeGeometry args={[3.4 - i * 0.3, 0.04]} />
            <meshBasicMaterial color="#323232" transparent opacity={0} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* Phases 2-3: the folded paper airplane lifting off and flying. */}
      <group ref={planeGroupRef} visible={false} position={[START.x, START.y, 0]} rotation={[0, 0, -Math.PI / 8]} scale={1.08}>
        <mesh ref={planeMeshRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[PLANE_POS, 3]} />
          </bufferGeometry>
          <meshBasicMaterial color="#f0f0f0" transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      </group>

      {/* Two split trails toward the destination stars. */}
      <group ref={trailGroupRef} visible={false}>
        <lineSegments ref={trail1Ref}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[trail1Positions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#ffffff" transparent opacity={1} toneMapped={false} />
        </lineSegments>
        <lineSegments ref={trail2Ref}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[trail2Positions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#ffffff" transparent opacity={1} toneMapped={false} />
        </lineSegments>
      </group>

      {/* Destination star 1: U of Toronto (yellow). */}
      <group ref={dest1GroupRef} visible={false} position={[DEST1.x, DEST1.y, 0]}>
        <mesh ref={dest1SphereRef}>
          <sphereGeometry args={[0.36, 16, 16]} />
          <meshBasicMaterial color="#fde047" transparent opacity={0} toneMapped={false} />
        </mesh>
        <Text ref={dest1TextRef} position={[0, 0.62, 0]} fontSize={0.38} color="#fde047" anchorX="center" anchorY="middle" fillOpacity={0}>
          U of Toronto
        </Text>
      </group>

      {/* Destination star 2: IIT Indore (SKA) (indigo). */}
      <group ref={dest2GroupRef} visible={false} position={[DEST2.x, DEST2.y, 0]}>
        <mesh ref={dest2SphereRef}>
          <sphereGeometry args={[0.36, 16, 16]} />
          <meshBasicMaterial color="#a5b4fc" transparent opacity={0} toneMapped={false} />
        </mesh>
        <Text ref={dest2TextRef} position={[0, 0.62, 0]} fontSize={0.38} color="#a5b4fc" anchorX="center" anchorY="middle" fillOpacity={0}>
          IIT Indore (SKA)
        </Text>
      </group>
    </group>
  )
}
