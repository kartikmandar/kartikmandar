// src/components/CosmicJourney3D/scenes/Beat_Slingshot.tsx
'use client'

import { useMemo, useRef, type Ref } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'

// Acceptance: a small planet orbits a yellow sun, follows a transfer trajectory
// across to a larger blue-indigo sun, settling into a new wider orbit; dotted
// orbit guides fade out / fade in (mirrors drawSlingshot).

// Map the original 2D [0..1] layout into the XY plane of this beat's local space.
// Widen the X span and lift slightly so the two suns and transfer arc fill the
// ~9-wide x 6-tall framing without the subject reading small or low.
const SPAN_X = 11
const SPAN_Y = 7
const Y_LIFT = 0.55 // nudge composition up so content centers above the overlay band
const toPos = (nx: number, ny: number) =>
  new THREE.Vector3((nx - 0.5) * SPAN_X, (0.5 - ny) * SPAN_Y + Y_LIFT, 0)

const SUN1 = toPos(0.25, 0.5) // small yellow sun (left)
const SUN2 = toPos(0.75, 0.5) // larger blue-indigo sun (right)
const ORBIT1 = SPAN_Y * 0.14 // tight starting orbit (radius in local units)
const ORBIT2 = SPAN_Y * 0.24 // wider destination orbit
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

// Writes the transfer-curve point at t into `out` (no allocation).
const bezierInto = (t: number, out: THREE.Vector3) => {
  const u = 1 - t
  return out.set(
    u * u * T_START.x + 2 * u * t * T_CTRL.x + t * t * T_END.x,
    u * u * T_START.y + 2 * u * t * T_CTRL.y + t * t * T_END.y,
    0,
  )
}

// `visible` is a THREE prop that the SVG-typed `line` JSX element does not declare.
const HIDDEN_PROPS = { visible: false } as object

const scratchPoint = new THREE.Vector3()

export default function Beat_Slingshot({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const sun1Ref = useRef<THREE.Group>(null)
  const sun2Ref = useRef<THREE.Group>(null)
  const sun2CoreRef = useRef<THREE.Mesh>(null)
  const sun2GlowRef = useRef<THREE.Mesh>(null)
  const orbit1Ref = useRef<THREE.Points>(null)
  const transferRef = useRef<THREE.Line>(null)
  const orbit2Ref = useRef<THREE.Points>(null)
  const planetRef = useRef<THREE.Group>(null)
  const planetCoreRef = useRef<THREE.Mesh>(null)

  const orbit1Buf = useMemo(() => ringPositions(SUN1.x, SUN1.y, ORBIT1), [])
  const orbit2Buf = useMemo(() => ringPositions(SUN2.x, SUN2.y, ORBIT2), [])
  const transferBuf = useMemo(() => {
    const seg = 64
    const arr = new Float32Array((seg + 1) * 3)
    const pt = new THREE.Vector3()
    for (let i = 0; i <= seg; i++) {
      bezierInto(i / seg, pt)
      arr[i * 3] = pt.x
      arr[i * 3 + 1] = pt.y
      arr[i * 3 + 2] = 0
    }
    return arr
  }, [])

  useFrame(() => {
    if (!beat.near) return
    const p = THREE.MathUtils.clamp(beat.local, 0, 1)
    const ambient = reducedMotion ? 0 : beat.clock

    // Guide opacities (matching the canvas alpha curves).
    const sun2Alpha = Math.min(1, p * 1.5)
    const orbit1Alpha = p < 0.4 ? 0.5 : Math.max(0, 0.5 - (p - 0.4) * 2)
    const transferAlpha = p >= 0.3 && p <= 0.8
      ? p < 0.4 ? (p - 0.3) / 0.1 : p > 0.7 ? (0.8 - p) / 0.1 : 1
      : 0
    const orbit2Alpha = p < 0.6 ? 0 : Math.min(0.5, (p - 0.6) * 2.5)

    if (sun1Ref.current) sun1Ref.current.rotation.z = ambient * 0.15
    if (sun2Ref.current) sun2Ref.current.rotation.z = -ambient * 0.1
    if (sun2CoreRef.current) (sun2CoreRef.current.material as THREE.MeshBasicMaterial).opacity = sun2Alpha
    if (sun2GlowRef.current) (sun2GlowRef.current.material as THREE.MeshBasicMaterial).opacity = sun2Alpha * 0.25

    const orbit1 = orbit1Ref.current
    if (orbit1) {
      orbit1.visible = orbit1Alpha > 0
      ;(orbit1.material as THREE.PointsMaterial).opacity = orbit1Alpha
    }
    const transfer = transferRef.current
    if (transfer) {
      transfer.visible = transferAlpha > 0
      ;(transfer.material as THREE.LineBasicMaterial).opacity = transferAlpha * 0.6
    }
    const orbit2 = orbit2Ref.current
    if (orbit2) {
      orbit2.visible = orbit2Alpha > 0
      ;(orbit2.material as THREE.PointsMaterial).opacity = orbit2Alpha
    }

    // Planet position across the three phases.
    const planet = planetRef.current
    if (planet) {
      if (p < 0.4) {
        const angle = 2 * Math.PI * (p / 0.4) + Math.PI
        planet.position.set(SUN1.x + Math.cos(angle) * ORBIT1, SUN1.y + Math.sin(angle) * ORBIT1, 0)
      } else if (p < 0.7) {
        planet.position.copy(bezierInto((p - 0.4) / 0.3, scratchPoint))
      } else {
        const angle = 2 * Math.PI * ((p - 0.7) / 0.3) - Math.PI / 2
        planet.position.set(SUN2.x + Math.cos(angle) * ORBIT2, SUN2.y + Math.sin(angle) * ORBIT2, 0)
      }
    }
    if (planetCoreRef.current) planetCoreRef.current.rotation.y = ambient * 0.6
  })

  return (
    <group>
      {/* Yellow source sun */}
      <group ref={sun1Ref} position={SUN1}>
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
      <group ref={sun2Ref} position={SUN2}>
        <mesh ref={sun2CoreRef}>
          <sphereGeometry args={[0.95, 28, 28]} />
          <meshBasicMaterial color="#a5b4fc" transparent opacity={0} toneMapped={false} />
        </mesh>
        <mesh ref={sun2GlowRef}>
          <sphereGeometry args={[1.35, 28, 28]} />
          <meshBasicMaterial color="#4f46e5" transparent opacity={0} toneMapped={false} />
        </mesh>
      </group>

      {/* Dotted starting orbit guide (fades out as planet leaves) */}
      <points ref={orbit1Ref}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[orbit1Buf, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#fde047" size={0.08} sizeAttenuation transparent opacity={0.5} toneMapped={false} />
      </points>

      {/* Transfer trajectory, visible during the slingshot */}
      {/* JSX `line` is typed as SVG; the ref receives a THREE.Line at runtime. */}
      <line ref={transferRef as unknown as Ref<SVGLineElement>} {...HIDDEN_PROPS}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[transferBuf, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#a5b4fc" transparent opacity={0} toneMapped={false} />
      </line>

      {/* Dotted wider destination orbit (fades in as planet arrives) */}
      <points ref={orbit2Ref} visible={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[orbit2Buf, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#a5b4fc" size={0.09} sizeAttenuation transparent opacity={0} toneMapped={false} />
      </points>

      {/* The travelling planet */}
      <group ref={planetRef} position={[T_START.x, T_START.y, 0]}>
        <mesh ref={planetCoreRef}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshBasicMaterial color="#a5b4fc" transparent opacity={0.3} toneMapped={false} />
        </mesh>
      </group>

      <Text position={[0, -1.25, 0]} fontSize={0.42} color="#a5b4fc" anchorX="center" anchorY="middle">
        gravitational slingshot
      </Text>
    </group>
  )
}
