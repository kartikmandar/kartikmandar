// src/components/CosmicJourney3D/scenes/OriginBlackHole.tsx
'use client'

// A raymarched Schwarzschild black hole as a bounded world-space impostor.
// Once the black hole opening (removed 2026-11-04); now the very massive path's
// ending. Rays start on a bounding sphere (or at the camera when inside it);
// escaped rays add nothing so the scene's own sky shows through, captured rays
// cast the shadow. Its centre is read from where it is mounted, so it can sit
// inside a translated group (never a rotated or scaled one: it works in world units).

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { buildBlackholeFrag, IMPOSTOR_VERT } from '@/components/QuasarBackground/engine/shaders/blackhole.frag'
import { Phase } from '@/components/QuasarBackground/engine/types'
import { journeyFrame } from '../store'
import { useDisposable } from '../art/materials'
import { diskFrame } from '../art/diskFrame'

/** World units per Schwarzschild radius: the disk (3–14 r_s) spans ~2 world units. */
export const ORIGIN_BH_SCALE = 0.15
/** Bounding radius in r_s: holds the disk and the inner jets. */
const BOUND_RS = 18
/**
 * March steps. One value for every tier: a material that changed with the tier
 * could be disposed while Precompile's compileAsync waits on it, leaving the
 * loader stuck (found in Phase 2). It is small on screen, so this is cheap.
 */
const MAX_STEPS = 56

/** What the black hole shows this frame: how visible it is, and how brightly gas falling onto it glows. */
export interface BlackHoleLook {
  opacity: number
  /** 0..1: lights the inner disk, the photon ring and faint jets. */
  infall: number
}

const _local = new THREE.Vector3()
const _center = new THREE.Vector3()

export default function OriginBlackHole({ look }: { look: () => BlackHoleLook }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const camera = useThree((s) => s.camera)

  const material = useDisposable(() => new THREE.ShaderMaterial({
    vertexShader: IMPOSTOR_VERT,
    fragmentShader: buildBlackholeFrag({ variant: 'impostor', maxSteps: MAX_STEPS, escapeRadius: BOUND_RS }),
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
      uCenter: { value: new THREE.Vector3() },
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
  }), [])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const f = journeyFrame
    const { opacity, infall } = look()
    mesh.visible = opacity > 0.001 || f.warmup
    if (!mesh.visible) return
    const u = (mesh.material as THREE.ShaderMaterial).uniforms
    mesh.getWorldPosition(_center)
    ;(u.uCenter!.value as THREE.Vector3).copy(_center)
    u.uTime!.value = f.clock
    u.uOpacity!.value = opacity
    u.uIgnition!.value = infall
    // Disk exposure dims with camera distance in r_s (frame-independent length).
    _local.copy(camera.position).sub(_center).divideScalar(ORIGIN_BH_SCALE)
    ;(u.uCamPos!.value as THREE.Vector3).copy(_local)
  })

  return (
    <mesh ref={meshRef} material={material} frustumCulled={false} renderOrder={-10} visible={false}>
      <sphereGeometry args={[BOUND_RS * ORIGIN_BH_SCALE, 48, 32]} />
    </mesh>
  )
}
