// src/components/CosmicJourney3D/scenes/Beat_FocusLens.tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat, type BeatHandle } from '../store'

// Acceptance: a vignette/tunnel closes in while a stick-figure astronomer
// (arm up, with a small telescope appearing past 50%) sharpens into focus in
// a sky-blue glow. Mirrors drawFocusingLens: astronomer fades/scales after 40%,
// telescope past the half-way mark, lens vignette tightens with progress.

// Stick figure in the original's local pixel frame (centered, y-down).
// Re-centered to the scene origin and scaled into the ~9x6 local space.
const FIG_SCALE = 0.055
const fp = (x: number, y: number): [number, number, number] => [x * FIG_SCALE, -y * FIG_SCALE, 0]
// Lift applied post-scale (as a group position) so feet clear the reserved
// overlay band (y > -1.5) while the raised arm reaches up toward the stars.
// Figure spans ~pixel y [-52..+40] -> world height ~5.1 at FIG_SCALE; this
// offset re-centers it so the body fills Y in [-1.5, 4] across the scale ramp.
const FIG_Y_OFFSET = 1.0

// Body/arms/legs as line segment pairs (arm up-left toward the stars).
const FIGURE: ReadonlyArray<readonly [[number, number], [number, number]]> = [
  [[0, -28], [0, 15]], // spine
  [[0, -15], [-20, -35]], // left arm raised to the sky
  [[0, -15], [18, -8]], // right arm
  [[0, 15], [-12, 40]], // left leg
  [[0, 15], [12, 40]], // right leg
]
// Telescope tube + tripod, revealed past the half-way mark.
const TELESCOPE: ReadonlyArray<readonly [[number, number], [number, number]]> = [
  [[25, -25], [40, -40]], // tube
  [[25, -8], [20, 10]], // tripod left
  [[25, -8], [30, 10]], // tripod center-ish
  [[25, -8], [25, 10]], // tripod center
]

const seg = (pairs: ReadonlyArray<readonly [[number, number], [number, number]]>) => {
  const arr: number[] = []
  for (const [a, b] of pairs) {
    const p1 = fp(a[0], a[1])
    const p2 = fp(b[0], b[1])
    arr.push(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2])
  }
  return new Float32Array(arr)
}

// Lens vignette: a tunnel of dark rings that tighten toward center as we focus.
const RINGS = 6
const RING_SEGMENTS = 64
const RING_COS = new Float32Array(RING_SEGMENTS + 1)
const RING_SIN = new Float32Array(RING_SEGMENTS + 1)
for (let i = 0; i <= RING_SEGMENTS; i++) {
  RING_COS[i] = Math.cos((i / RING_SEGMENTS) * Math.PI * 2)
  RING_SIN[i] = Math.sin((i / RING_SEGMENTS) * Math.PI * 2)
}

interface VignetteRingProps {
  ringIndex: number
  beat: BeatHandle
}

function VignetteRing({ ringIndex, beat }: VignetteRingProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const geometryRef = useRef<THREE.RingGeometry>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)
  const k = ringIndex / (RINGS - 1) // 0 = outermost, 1 = innermost

  useFrame(() => {
    if (!beat.near) return
    const close = Math.min(beat.local, 0.85) // matches lensRadius shrink
    // Outer radius starts wide; rings march inward as `close` grows.
    const outer = (1 - close * 0.9) * (6.2 - k * 4.6) + 0.6
    const inner = outer - 0.55
    const mesh = meshRef.current
    const geometry = geometryRef.current
    if (!mesh || !geometry) return
    mesh.visible = inner > 0
    if (inner <= 0) return
    // RingGeometry layout (1 phi segment): vertices [0..N] inner ring, [N+1..2N+1] outer ring.
    const attribute = geometry.attributes.position as THREE.BufferAttribute
    const arr = attribute.array as Float32Array
    const stride = RING_SEGMENTS + 1
    for (let i = 0; i <= RING_SEGMENTS; i++) {
      arr[i * 3] = RING_COS[i]! * inner
      arr[i * 3 + 1] = RING_SIN[i]! * inner
      arr[(stride + i) * 3] = RING_COS[i]! * outer
      arr[(stride + i) * 3 + 1] = RING_SIN[i]! * outer
    }
    attribute.needsUpdate = true
    if (materialRef.current) materialRef.current.opacity = 0.18 + k * 0.5 + close * 0.25
  })

  return (
    <mesh ref={meshRef} position={[0, FIG_Y_OFFSET, 0.4 + ringIndex * 0.02]} frustumCulled={false}>
      <ringGeometry ref={geometryRef} args={[0.5, 1, RING_SEGMENTS]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#000000"
        transparent
        opacity={0.18 + k * 0.5}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default function Beat_FocusLens({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const glowRef = useRef<THREE.Mesh>(null)
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const figureRef = useRef<THREE.Group>(null)
  const headMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const bodyMatRef = useRef<THREE.LineBasicMaterial>(null)
  const scopeRef = useRef<THREE.LineSegments>(null)
  const scopeMatRef = useRef<THREE.LineBasicMaterial>(null)

  const bodyPos = useMemo(() => seg(FIGURE), [])
  const scopePos = useMemo(() => seg(TELESCOPE), [])

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    // Astronomer comes into focus after 40%, identical to the 2D metaphor.
    const sharpness = Math.max(0, (p - 0.4) / 0.6)
    // Gentle settle-in so the figure fills ~6 tall without bursting the frame.
    const scale = 0.78 + sharpness * 0.22
    const sway = reducedMotion ? 0 : Math.sin(beat.clock * 0.5) * 0.04

    if (glowRef.current) glowRef.current.scale.setScalar(scale)
    if (glowMatRef.current) glowMatRef.current.opacity = sharpness * 0.3
    const figure = figureRef.current
    if (figure) {
      figure.visible = sharpness > 0
      figure.scale.setScalar(scale)
      figure.rotation.z = sway
    }
    if (headMatRef.current) headMatRef.current.opacity = sharpness
    if (bodyMatRef.current) bodyMatRef.current.opacity = sharpness
    if (scopeRef.current) scopeRef.current.visible = p > 0.5
    if (scopeMatRef.current) scopeMatRef.current.opacity = sharpness
  })

  return (
    <group>
      {/* Sky-blue focus glow behind the astronomer (filled disc via ring 0..r) */}
      <mesh ref={glowRef} position={[0, FIG_Y_OFFSET, -0.5]} scale={0.78}>
        <ringGeometry args={[0, 3.2, 48]} />
        <meshBasicMaterial ref={glowMatRef} color="#87ceeb" transparent opacity={0} toneMapped={false} />
      </mesh>

      {/* Astronomer, scaling and brightening into focus */}
      <group ref={figureRef} position={[0, FIG_Y_OFFSET, 0]} scale={[0.78, 0.78, 0.78]} visible={false}>
        {/* Head */}
        <mesh position={fp(0, -40)}>
          <torusGeometry args={[12 * FIG_SCALE, 1.4 * FIG_SCALE, 8, 24]} />
          <meshBasicMaterial ref={headMatRef} color="#ffffff" transparent opacity={0} toneMapped={false} />
        </mesh>
        {/* Limbs */}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[bodyPos, 3]} />
          </bufferGeometry>
          <lineBasicMaterial ref={bodyMatRef} color="#ffffff" transparent opacity={0} toneMapped={false} />
        </lineSegments>
        {/* Telescope appears past the half-way mark */}
        <lineSegments ref={scopeRef} visible={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[scopePos, 3]} />
          </bufferGeometry>
          <lineBasicMaterial ref={scopeMatRef} color="#c8c8c8" transparent opacity={0} toneMapped={false} />
        </lineSegments>
      </group>

      {/* Vignette / focusing-lens tunnel closing in around the figure */}
      {Array.from({ length: RINGS }, (_, i) => (
        <VignetteRing key={`v${i}`} ringIndex={i} beat={beat} />
      ))}
    </group>
  )
}
