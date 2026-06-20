// src/components/CosmicJourney3D/scenes/Beat_PaperPlane.tsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { SceneProps } from '../types'

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

export default function Beat_PaperPlane({ localProgress, clock, reducedMotion }: SceneProps) {
  const paper = Math.min(1, localProgress / 0.2)
  const fold = Math.min(1, Math.max(0, (localProgress - 0.2) / 0.2))
  const flight = Math.max(0, (localProgress - 0.4) / 0.6)
  const split = Math.min(1, Math.max(0, (flight - 0.1) / 0.4))
  const destAlpha = Math.min(1, split * 2)
  const drift = reducedMotion ? 0 : Math.sin(clock * 0.6) * 0.12

  // Two split trails from START toward each destination (drawn as line segments).
  const trail1 = useMemo(() => {
    const m = START.clone().lerp(DEST1, split)
    return new Float32Array([START.x, START.y, 0, m.x, m.y, 0])
  }, [split])
  const trail2 = useMemo(() => {
    const m = START.clone().lerp(DEST2, split)
    return new Float32Array([START.x, START.y, 0, m.x, m.y, 0])
  }, [split])

  // Plane: scale up from the fold, lift off & travel during flight, gently bank.
  const planeT = Math.min(flight, 0.8) / 0.8
  const planePos = START.clone().lerp(PLANE_END, planeT)
  const planeScale = (0.6 + fold * 0.4) * 1.8
  const planeAlpha = flight > 0 ? Math.max(0.3, 1 - flight * 0.7) : fold * 0.9
  const trailAlpha = Math.max(0.3, 1 - flight * 0.5)

  return (
    <group>
      {/* Phase 1: the research paper sheet with header / title / abstract rules. */}
      {paper > 0 && fold < 1 && (
        <group position={[0, Y_LIFT + drift, 0]} scale={[1, 1 - fold, 1]}>
          <mesh>
            <planeGeometry args={[4.4, 3.2]} />
            <meshBasicMaterial color="#f0f0f0" transparent opacity={paper * (1 - fold)} toneMapped={false} />
          </mesh>
          <Text position={[0, 1.15, 0.02]} fontSize={0.34} color="#1e1e1e" anchorX="center" anchorY="middle" fillOpacity={paper * (1 - fold)}>
            arXiv:2506.02130
          </Text>
          <Text position={[0, 0.5, 0.02]} fontSize={0.24} color="#1e1e1e" anchorX="center" anchorY="middle" maxWidth={4} textAlign="center" fillOpacity={paper * (1 - fold)}>
            fftvis: A Non-Uniform Fast Fourier Transform Based Interferometric Visibility Simulator
          </Text>
          <Text position={[0, -0.4, 0.02]} fontSize={0.16} color="#323232" anchorX="center" anchorY="middle" fillOpacity={paper * (1 - fold) * 0.9}>
            T.A. Cox, S.G. Murray, A.R. Parsons, J.S. Dillon, K. Mandar, et al.
          </Text>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={`ab${i}`} position={[0, -0.82 - i * 0.24, 0.01]}>
              <planeGeometry args={[3.4 - i * 0.3, 0.04]} />
              <meshBasicMaterial color="#323232" transparent opacity={paper * (1 - fold) * 0.5} toneMapped={false} />
            </mesh>
          ))}
        </group>
      )}

      {/* Phases 2-3: the folded paper airplane lifting off and flying. */}
      {(fold > 0 || flight > 0) && planeAlpha > 0 && (
        <group position={[planePos.x, planePos.y + drift, 0]} rotation={[0, 0, -Math.PI / 8 + drift * 0.3]} scale={planeScale}>
          <mesh>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[PLANE_POS, 3]} />
            </bufferGeometry>
            <meshBasicMaterial color="#f0f0f0" transparent opacity={planeAlpha} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        </group>
      )}

      {/* Two split trails toward the destination stars. */}
      {split > 0 && (
        <group>
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[trail1, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={trailAlpha} toneMapped={false} />
          </lineSegments>
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[trail2, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={trailAlpha} toneMapped={false} />
          </lineSegments>
        </group>
      )}

      {/* Destination star 1: U of Toronto (yellow). */}
      {destAlpha > 0 && (
        <group position={[DEST1.x, DEST1.y, 0]}>
          <mesh>
            <sphereGeometry args={[0.36, 16, 16]} />
            <meshBasicMaterial color="#fde047" transparent opacity={destAlpha} toneMapped={false} />
          </mesh>
          <Text position={[0, 0.62, 0]} fontSize={0.38} color="#fde047" anchorX="center" anchorY="middle" fillOpacity={destAlpha}>
            U of Toronto
          </Text>
        </group>
      )}

      {/* Destination star 2: IIT Indore (SKA) (indigo). */}
      {destAlpha > 0 && (
        <group position={[DEST2.x, DEST2.y, 0]}>
          <mesh>
            <sphereGeometry args={[0.36, 16, 16]} />
            <meshBasicMaterial color="#a5b4fc" transparent opacity={destAlpha} toneMapped={false} />
          </mesh>
          <Text position={[0, 0.62, 0]} fontSize={0.38} color="#a5b4fc" anchorX="center" anchorY="middle" fillOpacity={destAlpha}>
            IIT Indore (SKA)
          </Text>
        </group>
      )}
    </group>
  )
}
