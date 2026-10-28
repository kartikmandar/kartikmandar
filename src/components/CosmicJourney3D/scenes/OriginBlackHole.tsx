// src/components/CosmicJourney3D/scenes/OriginBlackHole.tsx
'use client'

// The origin black hole: the same raymarched Schwarzschild shader as the
// prologue, as a bounded world-space impostor. Emerging from the photon-ring
// dive, the camera sees it ahead and flies over its disk into the story. Rays
// start on a bounding sphere (or at the camera when inside it); escaped rays add
// nothing so the flight's own sky shows through, captured rays cast the shadow.

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { buildBlackholeFrag, IMPOSTOR_VERT } from '@/components/QuasarBackground/engine/shaders/blackhole.frag'
import { Phase } from '@/components/QuasarBackground/engine/types'
import type { QualityTier } from '../types'
import { journeyFrame } from '../store'
import { useDisposable } from '../art/materials'
import { diskFrame } from '../art/diskFrame'
import { ease } from '../art/anim'

/** World units per Schwarzschild radius: the disk (3–14 r_s) spans ~2 world units. */
export const ORIGIN_BH_SCALE = 0.15
/** Bounding radius in r_s: holds the disk and the inner jets. */
const BOUND_RS = 18
const MAX_STEPS: Record<QualityTier, number> = { high: 72, low: 56, mobile: 40 }

const _local = new THREE.Vector3()

export default function OriginBlackHole({ position, quality }: { position: [number, number, number]; quality: QualityTier }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const camera = useThree((s) => s.camera)
  const center = useMemo(() => new THREE.Vector3(...position), [position])

  const material = useDisposable(() => new THREE.ShaderMaterial({
    vertexShader: IMPOSTOR_VERT,
    fragmentShader: buildBlackholeFrag({ variant: 'impostor', maxSteps: MAX_STEPS[quality], escapeRadius: BOUND_RS }),
    uniforms: {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uCamPos: { value: new THREE.Vector3() },
      uInvProjView: { value: new THREE.Matrix4() },
      uWorldToDisk: { value: diskFrame(new THREE.Matrix3()) },
      uBackground: { value: null },
      uPhase: { value: Phase.QUASAR },
      uProgress: { value: 1 },
      uStarRadius: { value: 0 },
      uShellRadius: { value: 0 },
      uFlash: { value: 0 },
      uLensing: { value: 1 },
      uIgnition: { value: 1 },
      uCenter: { value: center.clone() },
      uScale: { value: ORIGIN_BH_SCALE },
      uOpacity: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    // premultiplied: emission adds, the shadow's alpha occludes what is behind
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    fog: false,
  }), [quality, center])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const f = journeyFrame
    // On screen only from the hand-off until the camera has left for beat 2.
    const opacity = ease(f.crossfade, 0.5, 0.9)
    mesh.visible = (opacity > 0.001 || f.warmup) && f.activeIndex <= 1
    if (lightRef.current) lightRef.current.intensity = 6 * opacity
    if (!mesh.visible) return
    const u = (mesh.material as THREE.ShaderMaterial).uniforms
    u.uTime!.value = f.clock
    u.uOpacity!.value = opacity
    // Disk exposure dims with camera distance in r_s (frame-independent length).
    _local.copy(camera.position).sub(center).divideScalar(ORIGIN_BH_SCALE)
    ;(u.uCamPos!.value as THREE.Vector3).copy(_local)
  })

  return (
    <group position={position}>
      <mesh ref={meshRef} material={material} frustumCulled={false} renderOrder={-10}>
        <sphereGeometry args={[BOUND_RS * ORIGIN_BH_SCALE, 48, 32]} />
      </mesh>
      {/* Warm key light for the first beats' lit materials (as the old stand-in had). */}
      <pointLight ref={lightRef} intensity={0} color="#ffd9a0" distance={40} />
    </group>
  )
}
