// src/components/CosmicJourney3D/scenes/Beat_Portal.tsx
'use client'

// Beat 28 · The Door That Opened (Act V, ember).
// After the long dark stretch a pinprick of light widens into a single portal.
// Through it a 21cmFAST-style lightcone pours toward the camera: a stack of
// disc slices of the neutral-hydrogen cosmic web, each slice later in cosmic
// time than the one behind it, so the ionized bubbles (dark, with gold rims)
// grow as the slices approach. Light particles stream along the same cone.

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { NOISE_GLSL } from '../art/glsl'
import { GlowSprite } from '../art/GlowSprite'
import { Label } from '../art/Label'
import { ease, seeded } from '../art/anim'

// The portal sits deep in the stage; the lightcone fans out toward the camera.
const PORTAL = new THREE.Vector3(0, 1.3, -3.6)
const CONE_END = new THREE.Vector3(0, 0.95, 0.9)
const PORTAL_PLANE = 4.4
// Ring radius as a fraction of the plane's half-size (world radius = 0.78 * 2.2).
const RING_FRACTION = 0.78
const CONE_R0 = 1.45
const CONE_R1 = 2.35

const PLANE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// The portal: a hot hairline ring with a soft halo, faint rays outside it and a
// dim ember interior. uOpen scales the ring from a point to full size.
const RING_FRAG = /* glsl */ `
  uniform vec3 uRim;
  uniform vec3 uHalo;
  uniform float uOpen;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec2 q = vUv - 0.5;
    float r = length(q) * 2.0;
    float R = max(uOpen * ${RING_FRACTION.toFixed(2)}, 0.001);
    float dr = r - R;
    float ring = exp(-(dr * dr) / (0.011 * 0.011));
    float halo = exp(-(dr * dr) / (0.075 * 0.075)) * 0.32;
    float a = atan(q.y, q.x);
    float rays = pow(0.5 + 0.5 * cos(a * 26.0 + uTime * 0.12), 14.0) * 0.5
               + pow(0.5 + 0.5 * cos(a * 11.0 - uTime * 0.07 + 1.3), 10.0) * 0.35;
    rays *= smoothstep(R, R + 0.03, r) * exp(-(r - R) * 9.0) * step(0.02, uOpen);
    float inner = (1.0 - smoothstep(R * 0.5, R, r)) * 0.05;
    float outer = 1.0 - smoothstep(0.92, 1.0, r);
    vec3 col = uRim * ring + uHalo * (halo + rays * 0.4 + inner);
    gl_FragColor = vec4(col * outer * uOpacity, 1.0);
  }
`

// Lightcone slices. Each instance is a disc whose place along the cone comes
// from fract(aSlice + uFlow): 0 at the portal, 1 near the camera. Slices carry
// the 21-cm brightness field: ridged-noise filaments of neutral hydrogen, with
// ionized bubbles carved out where a smooth source field crosses a threshold
// that falls as the slice gets later (closer) and as uIonize rises.
const SLICE_VERT = /* glsl */ `
  attribute float aSlice;
  uniform float uFlow;
  uniform vec3 uFrom;
  uniform vec3 uTo;
  uniform float uR0;
  uniform float uR1;
  varying vec2 vUv;
  varying float vS;
  varying float vSeed;
  void main() {
    float raw = aSlice + uFlow;
    float s = fract(raw);
    vS = s;
    vSeed = aSlice * 7.31 + floor(raw) * 3.17;
    vUv = uv;
    float r = mix(uR0, uR1, s * s * (3.0 - 2.0 * s));
    vec3 c = mix(uFrom, uTo, s);
    vec3 p = c + vec3(position.xy * 2.0 * r, 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const SLICE_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform float uOpacity;
  uniform float uIonize;
  uniform vec3 uWeb;
  uniform vec3 uWebHot;
  uniform vec3 uRim;
  varying vec2 vUv;
  varying float vS;
  varying float vSeed;
  void main() {
    vec2 q = vUv - 0.5;
    float rr = length(q) * 2.0;
    if (rr > 1.0) discard;
    float edge = 1.0 - smoothstep(0.62, 1.0, rr);
    vec2 x = q * 3.4;
    vec3 P = vec3(x, vSeed);
    float n1 = vnoise(P * 2.3);
    float n2 = vnoise(P * 5.1 + 3.7);
    float web = pow(1.0 - abs(2.0 * n1 - 1.0), 7.0) + 0.55 * pow(1.0 - abs(2.0 * n2 - 1.0), 9.0);
    float density = vnoise(P * 1.2 + 7.0);
    // reionization: bubbles open around the brightest sources and grow with time
    float src = vnoise(vec3(x * 1.35, vSeed * 0.5 + 11.0));
    float xi = clamp(uIonize * (0.3 + 0.7 * vS), 0.0, 1.0);
    float thr = 0.86 - 0.5 * xi;
    float bubble = smoothstep(thr - 0.025, thr + 0.025, src);
    float ds = (src - thr) / 0.02;
    float rim = exp(-ds * ds) * smoothstep(0.02, 0.12, xi);
    vec3 col = mix(uWeb, uWebHot, clamp(web, 0.0, 1.0)) * (0.12 + 0.95 * web) * (0.45 + 0.9 * density) * (1.0 - bubble);
    col += uRim * rim * 0.55;
    float fade = smoothstep(0.0, 0.14, vS) * (1.0 - smoothstep(0.72, 1.0, vS));
    gl_FragColor = vec4(col * edge * fade * uOpacity, 1.0);
  }
`

// Light pouring out of the portal along the cone (positions on the GPU).
const POUR_VERT = /* glsl */ `
  attribute float aSeed;
  attribute vec2 aDisk;
  uniform float uFlow;
  uniform vec3 uFrom;
  uniform vec3 uTo;
  uniform float uR0;
  uniform float uR1;
  uniform float uSize;
  varying float vS;
  void main() {
    float s = fract(aSeed + uFlow * 1.7);
    vS = s;
    float r = mix(uR0 * 0.85, uR1 * 1.05, s);
    vec3 p = mix(uFrom, uTo, s) + vec3(aDisk * r, 0.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.55 + 0.9 * fract(aSeed * 17.3)) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const POUR_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uFar;
  uniform vec3 uNear;
  uniform float uOpacity;
  varying float vS;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    float fade = smoothstep(0.0, 0.1, vS) * (1.0 - smoothstep(0.7, 1.0, vS));
    gl_FragColor = vec4(mix(uFar, uNear, vS) * a * fade * uOpacity, 1.0);
  }
`

function sliceGeometry(count: number): THREE.PlaneGeometry {
  const g = new THREE.PlaneGeometry(1, 1)
  const slice = new Float32Array(count)
  for (let i = 0; i < count; i++) slice[i] = i / count
  g.setAttribute('aSlice', new THREE.InstancedBufferAttribute(slice, 1))
  return g
}

function pourGeometry(count: number): THREE.BufferGeometry {
  const seed = new Float32Array(count)
  const disk = new Float32Array(count * 2)
  for (let i = 0; i < count; i++) {
    seed[i] = seeded(i, 0)
    // uniform in the unit disk, biased slightly toward the cone's edge (a shell of light)
    const radius = Math.sqrt(0.15 + 0.85 * seeded(i, 1))
    const angle = seeded(i, 2) * Math.PI * 2
    disk[i * 2] = Math.cos(angle) * radius
    disk[i * 2 + 1] = Math.sin(angle) * radius
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  g.setAttribute('aDisk', new THREE.BufferAttribute(disk, 2))
  return g
}

export default function Beat_Portal({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const ringRef = useRef<THREE.Mesh>(null)
  const slicesRef = useRef<THREE.InstancedMesh>(null)
  const pourRef = useRef<THREE.Points>(null)
  const seedRef = useRef<THREE.Sprite>(null)
  const coreRef = useRef<THREE.Sprite>(null)
  const labelRef = useRef<THREE.Mesh & { fillOpacity: number }>(null)

  const sliceCount = quality === 'mobile' ? 4 : quality === 'low' ? 5 : 7
  const pourCount = quality === 'mobile' ? 100 : quality === 'low' ? 200 : 400

  const ringMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uRim: { value: hdr(PALETTE.ember, GLOW.hot) },
      uHalo: { value: hdr(PALETTE.ember, GLOW.hero) },
      uOpen: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 1 },
    },
    vertexShader: PLANE_VERT,
    fragmentShader: RING_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  const sliceGeo = useDisposable(() => sliceGeometry(sliceCount), [sliceCount])
  const sliceMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uFlow: { value: 0 },
      uFrom: { value: PORTAL.clone() },
      uTo: { value: CONE_END.clone() },
      uR0: { value: CONE_R0 },
      uR1: { value: CONE_R1 },
      uOpacity: { value: 0 },
      uIonize: { value: 0 },
      uWeb: { value: hdr(PALETTE.emberDeep, 0.3) },
      uWebHot: { value: hdr(PALETTE.hydrogen, 0.85) },
      uRim: { value: hdr(PALETTE.starGold, 1.3) },
    },
    vertexShader: SLICE_VERT,
    fragmentShader: SLICE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  }))

  const pourGeo = useDisposable(() => pourGeometry(pourCount), [pourCount])
  const pourMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uFlow: { value: 0 },
      uFrom: { value: PORTAL.clone() },
      uTo: { value: CONE_END.clone() },
      uR0: { value: CONE_R0 },
      uR1: { value: CONE_R1 },
      uSize: { value: 30 },
      uFar: { value: hdr(PALETTE.hydrogen, 1.1) },
      uNear: { value: hdr(PALETTE.starGold, 1.4) },
      uOpacity: { value: 0 },
    },
    vertexShader: POUR_VERT,
    fragmentShader: POUR_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock

    // 1 · the dark stretch: a single pinprick, then 2 · the door opens.
    const open = ease(p, 0.14, 0.38) * (1 + 0.12 * ease(p, 0.85, 1.0))
    const ring = ringRef.current
    setUniform(ring, 'uOpen', open)
    setUniform(ring, 'uTime', t)

    const seed = seedRef.current
    if (seed) {
      const glow = ease(p, 0.0, 0.12) * (1 - ease(p, 0.2, 0.36))
      ;(seed.material as THREE.SpriteMaterial).opacity = glow
      const s = 0.35 + 0.5 * ease(p, 0.06, 0.2)
      seed.scale.set(s, s, 1)
    }
    const core = coreRef.current
    if (core) (core.material as THREE.SpriteMaterial).opacity = 0.55 * ease(p, 0.2, 0.42)

    // 3 · the lightcone pours toward the camera; bubbles grow as it does.
    const flow = t * 0.045 + p * 0.55
    const pour = ease(p, 0.26, 0.5)
    const slices = slicesRef.current
    setUniform(slices, 'uFlow', flow)
    setUniform(slices, 'uOpacity', pour)
    setUniform(slices, 'uIonize', 0.15 + 0.85 * ease(p, 0.34, 0.82))
    setUniform(pourRef.current, 'uFlow', flow)
    setUniform(pourRef.current, 'uOpacity', ease(p, 0.24, 0.46))

    if (labelRef.current) labelRef.current.fillOpacity = ease(p, 0.5, 0.64) * (1 - ease(p, 0.86, 0.98)) * 0.75
  })

  return (
    <group>
      {/* The pinprick in the dark that becomes the door */}
      <GlowSprite ref={seedRef} position={[PORTAL.x, PORTAL.y, PORTAL.z]} color={PALETTE.nearWhite} intensity={GLOW.hot} size={0.35} opacity={0} />
      <GlowSprite ref={coreRef} position={[PORTAL.x, PORTAL.y, PORTAL.z - 0.2]} color={PALETTE.ember} intensity={1.2} size={3.4} opacity={0} />

      {/* The portal ring */}
      <mesh ref={ringRef} position={PORTAL} material={ringMat} frustumCulled={false}>
        <planeGeometry args={[PORTAL_PLANE, PORTAL_PLANE]} />
      </mesh>

      {/* The 21-cm lightcone: slices of the hydrogen web with growing ionized bubbles */}
      <instancedMesh ref={slicesRef} args={[sliceGeo, sliceMat, sliceCount]} frustumCulled={false} />
      <points ref={pourRef} geometry={pourGeo} material={pourMat} frustumCulled={false} />

      <Label preserveCase ref={labelRef} position={[-4.1, 3.25, -3.4]} anchorX="left" color={PALETTE.ember} intensity={1.0} opacity={0}>
        21cmFAST · lightcone
      </Label>
    </group>
  )
}
