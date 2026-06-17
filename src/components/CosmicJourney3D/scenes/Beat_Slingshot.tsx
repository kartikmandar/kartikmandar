// src/components/CosmicJourney3D/scenes/Beat_Slingshot.tsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { SceneProps } from '../types'

// Acceptance: a small planet orbits a yellow sun, follows a transfer trajectory
// across to a larger blue-indigo sun, settling into a new wider orbit; dotted
// orbit guides fade out / fade in (mirrors drawSlingshot).

// Map the original 2D [0..1] layout into the XY plane of this beat's local space.
const toPos = (nx: number, ny: number) =>
  new THREE.Vector3((nx - 0.5) * 10, (0.5 - ny) * 7, 0)

const SUN1 = toPos(0.25, 0.5) // small yellow sun (left)
const SUN2 = toPos(0.75, 0.5) // larger blue-indigo sun (right)
const ORBIT1 = 7 * 0.12 // tight starting orbit (radius in local units)
const ORBIT2 = 7 * 0.22 // wider destination orbit
// Quadratic transfer path control points (canvas y flips to 3D up).
const T_START = new THREE.Vector3(SUN1.x - ORBIT1, SUN1.y, 0)
const T_CTRL = toPos(0.5, 0.2)
const T_END = new THREE.Vector3(SUN2.x, SUN2.y + ORBIT2, 0)

const ringPositions = (cx: number, cy: number, r: number, seg = 96) => {
  const arr = new Float32Array(seg * 3)
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2
    arr[i * 3] = cx + Math.cos(a) * r
    arr[i * 3 + 1] = cy + Math.sin(a) * r
    arr[i * 3 + 2] = 0
  }
  return arr
}

const bezier = (t: number) => {
  const u = 1 - t
  return new THREE.Vector3(
    u * u * T_START.x + 2 * u * t * T_CTRL.x + t * t * T_END.x,
    u * u * T_START.y + 2 * u * t * T_CTRL.y + t * t * T_END.y,
    0,
  )
}

export default function Beat_Slingshot({ localProgress, clock, reducedMotion }: SceneProps) {
  const p = THREE.MathUtils.clamp(localProgress, 0, 1)
  const ambient = reducedMotion ? 0 : clock

  const orbit1Buf = useMemo(() => ringPositions(SUN1.x, SUN1.y, ORBIT1), [])
  const orbit2Buf = useMemo(() => ringPositions(SUN2.x, SUN2.y, ORBIT2), [])
  const transferBuf = useMemo(() => {
    const seg = 64
    const arr = new Float32Array((seg + 1) * 3)
    for (let i = 0; i <= seg; i++) {
      const pt = bezier(i / seg)
      arr[i * 3] = pt.x
      arr[i * 3 + 1] = pt.y
      arr[i * 3 + 2] = 0
    }
    return arr
  }, [])

  // Guide opacities (matching the canvas alpha curves).
  const sun2Alpha = Math.min(1, p * 1.5)
  const orbit1Alpha = p < 0.4 ? 0.5 : Math.max(0, 0.5 - (p - 0.4) * 2)
  const transferAlpha = p >= 0.3 && p <= 0.8
    ? p < 0.4 ? (p - 0.3) / 0.1 : p > 0.7 ? (0.8 - p) / 0.1 : 1
    : 0
  const orbit2Alpha = p < 0.6 ? 0 : Math.min(0.5, (p - 0.6) * 2.5)

  // Planet position across the three phases.
  const planetPos = useMemo(() => {
    if (p < 0.4) {
      const angle = 2 * Math.PI * (p / 0.4) + Math.PI
      return new THREE.Vector3(SUN1.x + Math.cos(angle) * ORBIT1, SUN1.y + Math.sin(angle) * ORBIT1, 0)
    }
    if (p < 0.7) {
      return bezier((p - 0.4) / 0.3)
    }
    const angle = 2 * Math.PI * ((p - 0.7) / 0.3) - Math.PI / 2
    return new THREE.Vector3(SUN2.x + Math.cos(angle) * ORBIT2, SUN2.y + Math.sin(angle) * ORBIT2, 0)
  }, [p])

  return (
    <group>
      {/* Yellow source sun */}
      <group position={SUN1} rotation={[0, 0, ambient * 0.15]}>
        <mesh>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshBasicMaterial color="#fde047" toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.85, 24, 24]} />
          <meshBasicMaterial color="#facc15" transparent opacity={0.25} toneMapped={false} />
        </mesh>
      </group>

      {/* Larger blue-indigo destination sun, fades in */}
      <group position={SUN2} rotation={[0, 0, -ambient * 0.1]}>
        <mesh>
          <sphereGeometry args={[0.95, 28, 28]} />
          <meshBasicMaterial color="#a5b4fc" transparent opacity={sun2Alpha} toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.35, 28, 28]} />
          <meshBasicMaterial color="#4f46e5" transparent opacity={sun2Alpha * 0.25} toneMapped={false} />
        </mesh>
      </group>

      {/* Dotted starting orbit guide (fades out as planet leaves) */}
      {orbit1Alpha > 0 && (
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[orbit1Buf, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#fde047" size={0.08} sizeAttenuation transparent opacity={orbit1Alpha} toneMapped={false} />
        </points>
      )}

      {/* Transfer trajectory, visible during the slingshot */}
      {transferAlpha > 0 && (
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[transferBuf, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#a5b4fc" transparent opacity={transferAlpha * 0.6} toneMapped={false} />
        </line>
      )}

      {/* Dotted wider destination orbit (fades in as planet arrives) */}
      {orbit2Alpha > 0 && (
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[orbit2Buf, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#a5b4fc" size={0.09} sizeAttenuation transparent opacity={orbit2Alpha} toneMapped={false} />
        </points>
      )}

      {/* The travelling planet */}
      <group position={planetPos}>
        <mesh rotation={[0, ambient * 0.6, 0]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshBasicMaterial color="#a5b4fc" transparent opacity={0.3} toneMapped={false} />
        </mesh>
      </group>

      <Text position={[0, -3.1, 0]} fontSize={0.42} color="#a5b4fc" anchorX="center" anchorY="middle">
        gravitational slingshot
      </Text>
    </group>
  )
}
