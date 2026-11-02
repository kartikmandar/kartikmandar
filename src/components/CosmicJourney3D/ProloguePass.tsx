// src/components/CosmicJourney3D/ProloguePass.tsx
'use client'

// The supernova → black hole prologue as a pass inside the journey's own canvas
// (one WebGL context). It raymarches the black hole shader in QuasarBackground/engine
// from a virtual camera that dollies in across the prologue, then dives at the
// photon ring while the frame swells with light and dissolves into the flight
// (see prologueDive.ts).
//
// The raymarch renders into its own HDR render target, which works as a
// resolution governor without ever resizing the canvas (canvas resizes were the
// old two-context flicker). The target is drawn fullscreen behind the flight and
// graded by the shared post stack.

import { useEffect, useMemo, useRef } from 'react'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { bakeBackgroundCubemap } from '@/components/QuasarBackground/engine/background'
import { derivePhaseUniforms } from '@/components/QuasarBackground/engine/phaseUniforms'
import { buildBlackholeFrag, FULLSCREEN_VERT } from '@/components/QuasarBackground/engine/shaders/blackhole.frag'
import { CONSTANTS, Phase } from '@/components/QuasarBackground/engine/types'
import type { QualityTier } from './types'
import { journeyFrame } from './store'
import { phaseStateFromProgress } from './prologuePhase'
import { diveState, prologueScale } from './prologueDive'
import { useDisposable } from './art/materials'
import { diskFrame } from './art/diskFrame'

/** Where the dive aims, in r_s: the top of the photon ring as seen along the dolly. */
const DIVE_TARGET = new THREE.Vector3(0, 1.9, 0)
/** How far short of the ring the dive stops (r_s); stays well outside the horizon. */
const DIVE_STANDOFF = 0.9

const MAX_STEPS: Record<QualityTier, number> = { high: 128, low: 96, mobile: 56 }

const DISPLAY_FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uOpacity;
  uniform float uExposure;
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(texture2D(uTex, vUv).rgb * uExposure, uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

const DISPLAY_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

// Scratch (no allocation per frame).
const _base = new THREE.Vector3()
const _end = new THREE.Vector3()
const _look = new THREE.Vector3()
const _size = new THREE.Vector2()
const ORIGIN = new THREE.Vector3()
const ORTHO = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

export function ProloguePass({ quality, halfFloat }: { quality: QualityTier; halfFloat: boolean }) {
  const gl = useThree((s) => s.gl)
  const marchRef = useRef<THREE.Mesh>(null)
  const displayRef = useRef<THREE.Mesh>(null)
  const targetRef = useRef<THREE.WebGLRenderTarget | null>(null)
  const lastPrologue = useRef(-1)
  const diveRef = useRef(diveState(0))
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const passScene = useMemo(() => new THREE.Scene(), [])

  // The procedural sky, baked once into an HDR cubemap with this canvas's renderer.
  const sky = useMemo(() => bakeBackgroundCubemap(gl, { hdr: true }), [gl])
  useEffect(() => () => sky.dispose(), [sky])
  useEffect(() => () => {
    targetRef.current?.dispose()
    targetRef.current = null
  }, [])

  const marchMaterial = useDisposable(() => new THREE.ShaderMaterial({
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: buildBlackholeFrag({ variant: 'pass', maxSteps: MAX_STEPS[quality] }),
    uniforms: {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uCamPos: { value: new THREE.Vector3() },
      uInvProjView: { value: new THREE.Matrix4() },
      uWorldToDisk: { value: diskFrame(new THREE.Matrix3()) },
      uBackground: { value: sky.texture },
      uPhase: { value: Phase.STAR },
      uProgress: { value: 0 },
      uStarRadius: { value: CONSTANTS.STAR_RADIUS },
      uShellRadius: { value: 0 },
      uFlash: { value: 0 },
      uLensing: { value: 0 },
      uIgnition: { value: 0 },
      // opacity and exposure are applied when the target is displayed
      uOpacity: { value: 1 },
      uExposure: { value: 1 },
    },
    depthTest: false,
    depthWrite: false,
  }), [quality, sky])

  const displayMaterial = useDisposable(() => new THREE.ShaderMaterial({
    vertexShader: DISPLAY_VERT,
    fragmentShader: DISPLAY_FRAG,
    uniforms: { uTex: { value: null }, uOpacity: { value: 1 }, uExposure: { value: 1 } },
    depthTest: false,
    depthWrite: false,
    transparent: true,
  }))

  useFrame(() => {
    const march = marchRef.current
    const display = displayRef.current
    if (!march || !display) return
    const f = journeyFrame
    const dive = diveState(f.crossfade, diveRef.current)
    display.visible = dive.opacity > 0.001
    if (!display.visible) return

    // Resolution governor: full size for the prologue, lower under the dive's swell.
    gl.getDrawingBufferSize(_size)
    const scale = prologueScale(quality, f.crossfade)
    const w = Math.max(1, Math.round(_size.x * scale))
    const h = Math.max(1, Math.round(_size.y * scale))
    let target = targetRef.current
    if (!target) {
      target = new THREE.WebGLRenderTarget(w, h, { type: halfFloat ? THREE.HalfFloatType : THREE.UnsignedByteType, depthBuffer: false })
      targetRef.current = target
    } else if (target.width !== w || target.height !== h) {
      target.setSize(w, h)
    }

    const u = (march.material as THREE.ShaderMaterial).uniforms
    cameraRef.current ??= new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    const camera = cameraRef.current

    // Virtual camera: dolly in across the prologue (40 → 22 r_s, the legacy framing),
    // then dive at the photon ring.
    const dist = CONSTANTS.CAMERA_START_DISTANCE - 18 * f.prologue
    _base.set(0, 8, dist).setLength(dist)
    _end.copy(_base).sub(DIVE_TARGET).setLength(DIVE_STANDOFF).add(DIVE_TARGET)
    camera.position.lerpVectors(_base, _end, dive.dive)
    _look.lerpVectors(ORIGIN, DIVE_TARGET, dive.dive)
    camera.aspect = w / h
    camera.fov = dive.fov
    camera.updateProjectionMatrix()
    camera.lookAt(_look)
    camera.updateMatrixWorld()
    ;(u.uInvProjView!.value as THREE.Matrix4).copy(camera.projectionMatrixInverse).premultiply(camera.matrixWorld)
    ;(u.uResolution!.value as THREE.Vector2).set(w, h)
    ;(u.uCamPos!.value as THREE.Vector3).copy(camera.position)
    u.uTime!.value = f.clock

    // Phase uniforms depend only on prologue progress: recompute when it changes.
    if (f.prologue !== lastPrologue.current) {
      lastPrologue.current = f.prologue
      const state = phaseStateFromProgress(f.prologue)
      const d = derivePhaseUniforms(state)
      u.uPhase!.value = state.phase
      u.uProgress!.value = state.progress
      u.uStarRadius!.value = d.starRadius
      u.uShellRadius!.value = d.shellRadius
      u.uFlash!.value = d.flash
      u.uLensing!.value = d.lensing
      u.uIgnition!.value = d.ignition
    }

    // Raymarch into the target (before the main scene renders this frame).
    const previous = gl.getRenderTarget()
    gl.setRenderTarget(target)
    gl.render(passScene, ORTHO)
    gl.setRenderTarget(previous)

    const du = (display.material as THREE.ShaderMaterial).uniforms
    du.uTex!.value = target.texture
    du.uOpacity!.value = dive.opacity
    du.uExposure!.value = dive.exposure
  })

  return (
    <>
      {createPortal(
        <mesh ref={marchRef} material={marchMaterial} frustumCulled={false}>
          <planeGeometry args={[2, 2]} />
        </mesh>,
        passScene,
      )}
      <mesh ref={displayRef} material={displayMaterial} frustumCulled={false} renderOrder={-1000}>
        <planeGeometry args={[2, 2]} />
      </mesh>
    </>
  )
}
