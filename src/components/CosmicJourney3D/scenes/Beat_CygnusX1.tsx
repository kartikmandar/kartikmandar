// src/components/CosmicJourney3D/scenes/Beat_CygnusX1.tsx
'use client'

// Beat 19 · Cygnus X-1 in ApJ (reference beat, Phase 1 art bible).
// The black hole and its blue supergiant companion (HDE 226868), made of light.
// Gas streams from the star into a turbulent accretion disk; as the source
// softens, the disk's inner edge slides inward (about 5.5 → 2 Rg, the paper's
// truncation result) while the hard-state corona above it fades and flickers.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { createRimMaterial, getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { NOISE_GLSL } from '../art/glsl'
import { GlowSprite } from '../art/GlowSprite'
import { Label } from '../art/Label'
import { ease, seeded } from '../art/anim'

// One gravitational radius in world units; the disk spans ~24 Rg.
const RG = 0.1
const R_IN_START = 5.5
const R_IN_END = 2.0
const DISK_OUTER = 2.4
const BH = new THREE.Vector3(1.15, 0.75, 0)
const STAR = new THREE.Vector3(-3.0, 1.55, -1.8)
const STAR_RADIUS = 0.85
// Disk orientation: ~70° inclination, slight roll; the stream lands on its outer rim.
const DISK_ROTATION = new THREE.Euler(-Math.PI / 2 + 0.38, 0, 0.16)

const DISK_VERT = /* glsl */ `
  varying vec2 vXY;
  void main() {
    vXY = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Temperature falls outward (T ~ r^-3/4); Keplerian shear (w ~ r^-3/2) drags the
// turbulence; one side is Doppler-boosted; a hot rim marks the inner edge.
const DISK_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform float uTime;
  uniform float uInner;
  uniform float uOuter;
  uniform float uOpacity;
  uniform vec3 uHot;
  uniform vec3 uWarm;
  uniform vec3 uCool;
  varying vec2 vXY;
  void main() {
    float r = length(vXY);
    if (r < uInner * 0.92) discard;
    float omega = 0.55 * pow(max(r, 0.05) / uInner, -1.5);
    float a = uTime * omega;
    vec2 q = mat2(cos(a), -sin(a), sin(a), cos(a)) * vXY;
    float turb = fbm(vec3(q * 3.2, uTime * 0.06));
    float streaks = fbm(vec3(q * vec2(7.0, 7.0) / max(r, 0.2), 1.7));
    float temp = pow(uInner / r, 0.75);
    vec3 col = mix(uCool, uWarm, smoothstep(0.15, 0.55, temp));
    col = mix(col, uHot, smoothstep(0.6, 0.95, temp));
    float lum = temp * (0.55 + 0.75 * turb) * (0.8 + 0.4 * streaks);
    // Doppler boost on the approaching side
    float theta = atan(vXY.y, vXY.x);
    lum *= 0.75 + 0.45 * (0.5 + 0.5 * sin(theta + 0.6));
    // hot inner rim + soft inner falloff
    float rim = exp(-pow((r - uInner) / (0.045 + 0.04 * uInner), 2.0));
    lum += rim * 1.4;
    float inner = smoothstep(uInner * 0.92, uInner * 1.04, r);
    float outer = 1.0 - smoothstep(uOuter * 0.62, uOuter, r);
    gl_FragColor = vec4(col * lum * inner * outer * uOpacity, 1.0);
  }
`

const RING_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float ring = exp(-pow((r - 0.62) / 0.05, 2.0)) + 0.35 * exp(-pow((r - 0.62) / 0.16, 2.0));
    gl_FragColor = vec4(uColor * ring * uOpacity, 1.0);
  }
`

const PLANE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Mass transfer: particles ride a quadratic Bezier from the star's L1 side to the
// disk's outer rim; position is computed on the GPU from a per-particle seed.
const STREAM_VERT = /* glsl */ `
  attribute float aSeed;
  attribute vec3 aJitter;
  uniform float uTime;
  uniform vec3 uP0;
  uniform vec3 uP1;
  uniform vec3 uP2;
  uniform float uSize;
  varying float vT;
  void main() {
    float t = fract(aSeed + uTime * 0.07);
    vT = t;
    float u = 1.0 - t;
    vec3 p = u * u * uP0 + 2.0 * u * t * uP1 + t * t * uP2;
    p += aJitter * (0.04 + 0.22 * t * (1.0 - t));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.6 + 0.8 * fract(aSeed * 13.7)) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const STREAM_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uFrom;
  uniform vec3 uTo;
  uniform float uOpacity;
  varying float vT;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    float fade = smoothstep(0.0, 0.12, vT) * (1.0 - smoothstep(0.85, 1.0, vT));
    gl_FragColor = vec4(mix(uFrom, uTo, vT) * a * fade * uOpacity, 1.0);
  }
`

function streamGeometry(count: number): THREE.BufferGeometry {
  const seed = new Float32Array(count)
  const jitter = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    seed[i] = seeded(i, 0)
    jitter[i * 3] = (seeded(i, 1) - 0.5) * 2
    jitter[i * 3 + 1] = (seeded(i, 2) - 0.5) * 2
    jitter[i * 3 + 2] = (seeded(i, 3) - 0.5) * 2
  }
  const g = new THREE.BufferGeometry()
  // Positions are computed in the shader; a zeroed attribute satisfies three.
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  g.setAttribute('aJitter', new THREE.BufferAttribute(jitter, 3))
  return g
}

export default function Beat_CygnusX1({ index, quality }: BeatSceneProps) {
  const beat = useBeat(index)
  const diskRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const streamRef = useRef<THREE.Points>(null)
  const starRef = useRef<THREE.Mesh>(null)
  const starGlowRef = useRef<THREE.Sprite>(null)
  const coronaRef = useRef<THREE.Sprite>(null)
  const rinRef = useRef<THREE.Mesh & { text: string; sync: () => void; fillOpacity: number }>(null)
  const namesRef = useRef<THREE.Group>(null)
  const lastRinTenths = useRef(-1)

  // Where the stream lands: a point on the disk's outer rim, in scene space.
  const streamEnd = useMemo(() => {
    const local = new THREE.Vector3(-DISK_OUTER * 0.78, -DISK_OUTER * 0.32, 0).applyEuler(DISK_ROTATION)
    return local.add(BH)
  }, [])
  const streamStart = useMemo(() => STAR.clone().add(new THREE.Vector3(STAR_RADIUS * 0.82, -0.12, 0.28)), [])
  const streamControl = useMemo(() => new THREE.Vector3(-0.9, 1.75, -0.2), [])

  const diskMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uInner: { value: R_IN_START * RG },
      uOuter: { value: DISK_OUTER },
      uOpacity: { value: 0 },
      uHot: { value: hdr(PALETTE.nearWhite, GLOW.hot) },
      uWarm: { value: hdr(PALETTE.ember, GLOW.hero) },
      uCool: { value: hdr(PALETTE.emberDeep, 0.6) },
    },
    vertexShader: DISK_VERT,
    fragmentShader: DISK_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  }))

  const ringMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: { uColor: { value: hdr(PALETTE.starGold, GLOW.hot) }, uOpacity: { value: 0 } },
    vertexShader: PLANE_VERT,
    fragmentShader: RING_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))

  const streamGeo = useDisposable(() => streamGeometry(quality === 'mobile' ? 160 : 420), [quality])
  const streamMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uP0: { value: streamStart.clone() },
      uP1: { value: streamControl.clone() },
      uP2: { value: streamEnd.clone() },
      uSize: { value: 34 },
      uMap: { value: getGlowTexture() },
      uFrom: { value: hdr(PALETTE.stellarBlue, 1.6) },
      uTo: { value: hdr(PALETTE.ember, GLOW.hero) },
      uOpacity: { value: 0 },
    },
    vertexShader: STREAM_VERT,
    fragmentShader: STREAM_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [streamStart, streamControl, streamEnd])

  const starMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.stellarBlue, 0.55),
    rim: hdr(PALETTE.nearWhite, GLOW.hero),
    power: 1.5,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = beat.clock
    const appear = ease(p, 0.0, 0.28)
    // The paper's result, staged: the inner edge moves in as the state softens.
    const slide = ease(p, 0.3, 0.78)
    const rinRg = R_IN_START + (R_IN_END - R_IN_START) * slide

    const disk = diskRef.current
    setUniform(disk, 'uTime', t)
    setUniform(disk, 'uInner', rinRg * RG)
    setUniform(disk, 'uOpacity', appear)
    setUniform(ringRef.current, 'uOpacity', appear)
    setUniform(streamRef.current, 'uTime', t)
    setUniform(streamRef.current, 'uOpacity', ease(p, 0.1, 0.35))

    const starGlow = starGlowRef.current
    if (starGlow) (starGlow.material as THREE.SpriteMaterial).opacity = 0.35 + 0.65 * appear

    // Hard-state corona: strong and flickering early, fading as the disk moves in.
    const corona = coronaRef.current
    if (corona) {
      const flicker = 0.82 + 0.18 * Math.sin(t * 13.1) * Math.sin(t * 7.3 + 1.1)
      const strength = appear * (1 - 0.7 * slide) * flicker
      ;(corona.material as THREE.SpriteMaterial).opacity = strength
      const s = 0.9 + 0.5 * (1 - slide)
      corona.scale.set(s, s, 1)
    }

    const rin = rinRef.current
    if (rin) {
      rin.fillOpacity = ease(p, 0.26, 0.4) * 0.9
      // Rebuild the string only when the displayed tenth changes (no per-frame allocation).
      const tenths = Math.round(rinRg * 10)
      if (tenths !== lastRinTenths.current) {
        lastRinTenths.current = tenths
        rin.text = `R IN  ${(tenths / 10).toFixed(1)} RG`
        rin.sync()
      }
    }
    const names = namesRef.current
    if (names) {
      const fade = ease(p, 0.12, 0.3) * 0.7
      for (let i = 0; i < names.children.length; i++) {
        ;(names.children[i] as THREE.Mesh & { fillOpacity: number }).fillOpacity = fade
      }
    }
  })

  return (
    <group>
      {/* Companion: HDE 226868, a blue supergiant */}
      <mesh ref={starRef} position={STAR} material={starMat}>
        <sphereGeometry args={[STAR_RADIUS, 48, 48]} />
      </mesh>
      <GlowSprite ref={starGlowRef} position={[STAR.x, STAR.y, STAR.z]} color={PALETTE.stellarBlue} intensity={1.8} size={5.2} opacity={0.35} />

      {/* Mass transfer stream */}
      <points ref={streamRef} geometry={streamGeo} material={streamMat} frustumCulled={false} />

      {/* Black hole: shadow, photon ring, accretion disk, corona */}
      <group position={BH}>
        <mesh renderOrder={-1}>
          <sphereGeometry args={[1.25 * RG, 32, 32]} />
          <meshBasicMaterial color="#000000" fog={false} />
        </mesh>
        <Billboard>
          <mesh ref={ringRef} material={ringMat}>
            <planeGeometry args={[0.5, 0.5]} />
          </mesh>
        </Billboard>
        <mesh ref={diskRef} rotation={DISK_ROTATION} material={diskMat} frustumCulled={false}>
          <ringGeometry args={[R_IN_END * RG * 0.9, DISK_OUTER, 160, 1]} />
        </mesh>
        <GlowSprite ref={coronaRef} position={[0, 0.12, 0]} color={PALETTE.stellarBlue} intensity={GLOW.hero} size={1.2} opacity={0} />
      </group>

      <group ref={namesRef}>
        <Label position={[BH.x, BH.y + 1.05, BH.z]} color={PALETTE.starGold} opacity={0}>Cygnus X-1</Label>
        <Label position={[STAR.x, STAR.y + 1.25, STAR.z]} color={PALETTE.stellarBlue} opacity={0}>HDE 226868</Label>
      </group>
      <Label ref={rinRef} position={[BH.x + 1.55, BH.y - 0.55, BH.z + 0.4]} anchorX="left" size="body" color={PALETTE.ember} intensity={1.4} opacity={0}>
        R in  5.5 Rg
      </Label>
    </group>
  )
}
