// src/components/CosmicJourney3D/scenes/Beat_Comet.tsx
'use client'

// Beat 2 · Hands-On Exploration (Act I, spark).
// Night camp at Sariska: a dark sky with a faint Milky Way, a hint of the
// horizon and a small tent glowing from inside. Beside the tent sits the club's
// dry-ice comet, shedding cold vapour that sinks and curls. As the beat holds,
// the lump rises into the sky and its vapour organises into a real comet's two
// tails, both pointing away from the (set) sun: a straight blue ion tail and a
// broader, curved, dusty tail.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { createRimMaterial, getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { NOISE_GLSL } from '../art/glsl'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, seeded } from '../art/anim'

// ---- Layout -----------------------------------------------------------------

const TENT = new THREE.Vector3(-2.45, -0.72, -0.4)
/** The dry-ice comet starts beside the tent and rises into the sky. */
const HEAD_START = new THREE.Vector3(-1.55, -0.42, -0.2)
const HEAD_MID = new THREE.Vector3(-0.6, 1.7, -1.2)
const HEAD_END = new THREE.Vector3(1.75, 1.35, -2.4)
/** The sun has set to the lower right; both tails point away from it. */
const ANTI_SUN = new THREE.Vector3(-1, 0.48, -0.36).normalize()
/** Dust lags the comet's motion, so its tail curves off the ion tail. */
const DUST_CURVE = new THREE.Vector3(0.25, -0.92, 0.1).normalize()
const ION_LENGTH = 4.6
const DUST_LENGTH = 3.6
const DUST_BEND = 0.95
const HORIZON_Z = -3.6

const ionLabelPos: [number, number, number] = [
  HEAD_END.x + ANTI_SUN.x * 3.7, HEAD_END.y + ANTI_SUN.y * 3.7 + 0.28, HEAD_END.z + ANTI_SUN.z * 3.7,
]
const dustLabelPos: [number, number, number] = [
  HEAD_END.x + ANTI_SUN.x * 2.6 + DUST_CURVE.x * DUST_BEND * 0.55,
  HEAD_END.y + ANTI_SUN.y * 2.6 + DUST_CURVE.y * DUST_BEND * 0.55 - 0.3,
  HEAD_END.z + ANTI_SUN.z * 2.6 + DUST_CURVE.z * DUST_BEND * 0.55,
]

function horizonPoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const n = 90
  for (let i = 0; i <= n; i++) {
    const x = -8 + (16 * i) / n
    // the Aravalli hills: low, soft ridges
    const y = -0.78 + 0.22 * Math.exp(-((x + 4.2) ** 2) / 3.2) + 0.32 * Math.exp(-((x - 3.6) ** 2) / 5)
      + 0.05 * Math.sin(x * 2.3) + 0.03 * Math.sin(x * 5.1 + 1.0)
    pts.push(new THREE.Vector3(x, y, HORIZON_Z))
  }
  return pts
}

/** A ridge tent in wire: two A-frames, a ridge pole, base edges and a door flap. */
function tentPoints(): THREE.Vector3[] {
  const w = 0.42
  const h = 0.5
  const d = 0.62
  const v = (x: number, y: number, z: number) => new THREE.Vector3(TENT.x + x, TENT.y + y, TENT.z + z)
  const front = [v(-w, 0, d / 2), v(0, h, d / 2), v(w, 0, d / 2)]
  const back = [v(-w, 0, -d / 2), v(0, h, -d / 2), v(w, 0, -d / 2)]
  return [
    front[0]!, front[1]!, front[1]!, front[2]!,
    back[0]!, back[1]!, back[1]!, back[2]!,
    front[1]!, back[1]!,
    front[0]!, back[0]!, front[2]!, back[2]!,
    // door flap, folded open
    v(0, h, d / 2), v(0.12, 0.02, d / 2 + 0.06),
    v(0.12, 0.02, d / 2 + 0.06), v(0.22, 0, d / 2),
  ]
}

// ---- Shaders -------------------------------------------------------------------

const PLANE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// The night sky above Sariska: a faint diagonal Milky Way band with dust lanes,
// and a little airglow just above the horizon.
const SKY_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform vec3 uBand;
  uniform vec3 uGlow;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec2 q = (vUv - 0.5) * vec2(16.0, 9.0);
    float along = dot(q, normalize(vec2(1.0, 0.55)));
    float across = dot(q, normalize(vec2(-0.55, 1.0))) - 0.8;
    float band = exp(-across * across / 2.2);
    vec3 col = vec3(0.0);
    if (band > 0.02) {
      float n = fbm(vec3(along * 0.55, across * 0.9, 1.3));
      float lane = smoothstep(0.42, 0.62, fbm(vec3(along * 0.9, across * 2.4, 4.1)));
      col += uBand * band * (0.35 + 0.9 * n) * (1.0 - 0.55 * lane);
    }
    float air = exp(-max(vUv.y - 0.12, 0.0) * 9.0) * smoothstep(0.0, 0.12, vUv.y);
    col += uGlow * air;
    float edge = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x) * smoothstep(1.0, 0.85, vUv.y);
    gl_FragColor = vec4(col * edge * uOpacity, 1.0);
  }
`

// Comet particles, in the head's local frame. Each one is either a vapour wisp
// (sinks and curls, like CO2 fog) or a tail particle; uMorph blends between them.
// aKind: 0 = ion tail, 1 = dust tail.
const COMET_VERT = /* glsl */ `
  attribute float aSeed;
  attribute float aKind;
  attribute vec3 aJitter;
  uniform float uTime;
  uniform float uMorph;
  uniform float uStretch;
  uniform vec3 uAnti;
  uniform vec3 uCurve;
  uniform float uSize;
  varying float vAge;
  varying float vKind;
  void main() {
    float rate = mix(0.16, 0.07, aKind);
    float age = fract(aSeed + uTime * rate);
    vAge = age;
    vKind = aKind;
    // vapour: spreads out, sinks, and curls
    float swirl = uTime * 0.6 + aSeed * 30.0;
    vec3 vap = normalize(aJitter + vec3(0.0, 0.001, 0.0)) * age * 0.55;
    vap += vec3(sin(swirl), 0.0, cos(swirl)) * 0.08 * age;
    vap.y -= 0.38 * age * age;
    // tails: ion is long, straight and narrow; dust is shorter, broad and curved
    float len = mix(${ION_LENGTH.toFixed(2)}, ${DUST_LENGTH.toFixed(2)}, aKind) * uStretch;
    vec3 tail = uAnti * age * len;
    tail += uCurve * aKind * age * age * ${DUST_BEND.toFixed(2)};
    tail += aJitter * mix(0.02 + 0.05 * age, 0.05 + 0.24 * age, aKind);
    vec3 p = mix(vap, tail, uMorph);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float grow = mix(1.0 + age, 1.0 + 1.6 * age, uMorph);
    gl_PointSize = uSize * (0.55 + 0.7 * fract(aSeed * 7.31)) * grow / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const COMET_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uVapour;
  uniform vec3 uIon;
  uniform vec3 uDust;
  uniform float uMorph;
  uniform float uOpacity;
  varying float vAge;
  varying float vKind;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    float fade = smoothstep(0.0, 0.06, vAge) * (1.0 - vAge) * (1.0 - vAge);
    vec3 tailCol = mix(uIon, uDust, vKind);
    vec3 col = mix(uVapour, tailCol, uMorph);
    gl_FragColor = vec4(col * a * fade * uOpacity, 1.0);
  }
`

const STAR_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  varying float vTwinkle;
  void main() {
    vTwinkle = 0.7 + 0.3 * sin(uTime * (0.6 + aSeed * 1.9) + aSeed * 50.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (0.4 + 1.2 * aSeed * aSeed) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const STAR_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vTwinkle;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    gl_FragColor = vec4(uColor * a * vTwinkle * uOpacity, 1.0);
  }
`

// ---- Scratch -------------------------------------------------------------------

const _head = new THREE.Vector3()

/** Quadratic bezier through the three head waypoints, written into `out`. */
function headAt(out: THREE.Vector3, s: number): THREE.Vector3 {
  const u = 1 - s
  return out.copy(HEAD_START).multiplyScalar(u * u).addScaledVector(HEAD_MID, 2 * u * s).addScaledVector(HEAD_END, s * s)
}

type Fadeable = THREE.Mesh & { fillOpacity: number }

export default function Beat_Comet({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const skyRef = useRef<THREE.Mesh>(null)
  const starsRef = useRef<THREE.Points>(null)
  const horizonRef = useRef<LightLineObject>(null)
  const tentRef = useRef<LightLineObject>(null)
  const tentGlowRef = useRef<THREE.Sprite>(null)
  const groundGlowRef = useRef<THREE.Sprite>(null)
  const headRef = useRef<THREE.Group>(null)
  const nucleusRef = useRef<THREE.Mesh>(null)
  const comaRef = useRef<THREE.Sprite>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const ionAxisRef = useRef<LightLineObject>(null)
  const ionLabelRef = useRef<Fadeable>(null)
  const dustLabelRef = useRef<Fadeable>(null)

  const horizon = useMemo(() => horizonPoints(), [])
  const tent = useMemo(() => tentPoints(), [])
  const ionAxis = useMemo(() => [new THREE.Vector3(0, 0, 0), ANTI_SUN.clone().multiplyScalar(ION_LENGTH * 0.8)], [])

  const skyMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uBand: { value: hdr(PALETTE.stellarBlue, 0.16) },
      uGlow: { value: hdr(PALETTE.stellarBlue, 0.1) },
      uOpacity: { value: 0 },
    },
    vertexShader: PLANE_VERT,
    fragmentShader: SKY_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  const starCount = quality === 'mobile' ? 70 : quality === 'low' ? 130 : 260
  const starGeo = useDisposable(() => {
    const pos = new Float32Array(starCount * 3)
    const seed = new Float32Array(starCount)
    for (let i = 0; i < starCount; i++) {
      pos[i * 3] = (seeded(i, 1) - 0.5) * 15
      pos[i * 3 + 1] = -0.4 + seeded(i, 2) * 5.6
      pos[i * 3 + 2] = -4.6 - seeded(i, 3) * 0.8
      seed[i] = seeded(i, 4)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [starCount])
  const starMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uColor: { value: hdr(PALETTE.nearWhite, 0.9) },
      uTime: { value: 0 },
      uSize: { value: 30 },
      uOpacity: { value: 0 },
    },
    vertexShader: STAR_VERT,
    fragmentShader: STAR_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  const cometCount = quality === 'mobile' ? 100 : quality === 'low' ? 200 : 400
  const cometGeo = useDisposable(() => {
    const seed = new Float32Array(cometCount)
    const kind = new Float32Array(cometCount)
    const jitter = new Float32Array(cometCount * 3)
    for (let i = 0; i < cometCount; i++) {
      seed[i] = seeded(i, 10)
      kind[i] = seeded(i, 11) < 0.45 ? 0 : 1
      // roughly isotropic jitter (for the vapour puff and tail width)
      const u = seeded(i, 12) * 2 - 1
      const a = seeded(i, 13) * Math.PI * 2
      const r = Math.sqrt(1 - u * u)
      const m = 0.5 + 0.5 * seeded(i, 14)
      jitter[i * 3] = r * Math.cos(a) * m
      jitter[i * 3 + 1] = u * m
      jitter[i * 3 + 2] = r * Math.sin(a) * m
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cometCount * 3), 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.setAttribute('aKind', new THREE.BufferAttribute(kind, 1))
    g.setAttribute('aJitter', new THREE.BufferAttribute(jitter, 3))
    return g
  }, [cometCount])
  const cometMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uStretch: { value: 1 },
      uAnti: { value: ANTI_SUN.clone() },
      uCurve: { value: DUST_CURVE.clone() },
      uSize: { value: 52 },
      uVapour: { value: hdr(PALETTE.nearWhite, 0.55) },
      uIon: { value: hdr(PALETTE.stellarBlue, 1.6) },
      uDust: { value: hdr(PALETTE.starGold, 0.75) },
      uOpacity: { value: 0 },
    },
    vertexShader: COMET_VERT,
    fragmentShader: COMET_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  const nucleusMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.stellarBlue, 0.1),
    rim: hdr(PALETTE.nearWhite, GLOW.hero),
    power: 2.2,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock

    // Arrive: the camp and the sky are already there.
    const appear = ease(p, 0.0, 0.16)
    setUniform(skyRef.current, 'uOpacity', appear)
    setUniform(starsRef.current, 'uOpacity', appear)
    setUniform(starsRef.current, 'uTime', t)
    setLineOpacity(horizonRef.current, appear * 0.8)
    setLineReveal(tentRef.current, ease(p, 0.02, 0.2))
    const flicker = 0.9 + 0.06 * Math.sin(t * 2.1) + 0.04 * Math.sin(t * 5.3 + 0.7)
    const tentGlow = tentGlowRef.current
    if (tentGlow) (tentGlow.material as THREE.SpriteMaterial).opacity = ease(p, 0.05, 0.2) * flicker
    const groundGlow = groundGlowRef.current
    if (groundGlow) (groundGlow.material as THREE.SpriteMaterial).opacity = ease(p, 0.05, 0.2) * 0.45 * flicker

    // Hold: the lump rises into the sky while its vapour becomes two tails.
    const rise = ease(p, 0.2, 0.55)
    const morph = ease(p, 0.28, 0.6)
    const head = headRef.current
    if (head) {
      headAt(_head, rise)
      // a slow drift once it is up there
      _head.y += 0.04 * Math.sin(t * 0.35) * rise
      head.position.copy(_head)
    }
    const nucleus = nucleusRef.current
    if (nucleus) {
      nucleus.rotation.set(t * 0.21, t * 0.33, 0)
      const s = 1 - 0.45 * morph
      nucleus.scale.set(s, s, s)
    }
    const coma = comaRef.current
    if (coma) {
      ;(coma.material as THREE.SpriteMaterial).opacity = appear * (0.35 + 0.65 * morph)
      const s = 0.5 + 0.7 * morph
      coma.scale.set(s, s, 1)
    }
    const particles = particlesRef.current
    setUniform(particles, 'uTime', t)
    setUniform(particles, 'uMorph', morph)
    setUniform(particles, 'uStretch', 1 + 0.18 * ease(p, 0.85, 1))
    setUniform(particles, 'uOpacity', ease(p, 0.04, 0.18))
    setLineReveal(ionAxisRef.current, ease(p, 0.45, 0.7))
    setLineOpacity(ionAxisRef.current, morph * 0.55)

    const tag = ease(p, 0.6, 0.72) * 0.7
    if (ionLabelRef.current) ionLabelRef.current.fillOpacity = tag
    if (dustLabelRef.current) dustLabelRef.current.fillOpacity = tag
  })

  return (
    <group>
      {/* Sky: Milky Way and stars */}
      <mesh ref={skyRef} position={[0, 1.4, -5.6]} material={skyMat} frustumCulled={false}>
        <planeGeometry args={[16, 9]} />
      </mesh>
      <points ref={starsRef} geometry={starGeo} material={starMat} frustumCulled={false} />

      {/* A hint of the horizon */}
      <LightLine ref={horizonRef} points={horizon} color={PALETTE.stellarBlue} intensity={0.5} width={0.014} opacity={0} />

      {/* The camp tent, lit from inside */}
      <LightLine ref={tentRef} points={tent} segments color={PALETTE.nearWhite} intensity={GLOW.base} width={0.012} />
      <GlowSprite ref={tentGlowRef} position={[TENT.x, TENT.y + 0.2, TENT.z]} color={PALETTE.starGold} intensity={1.6} size={1.1} opacity={0} />
      <GlowSprite ref={groundGlowRef} position={[TENT.x + 0.1, TENT.y + 0.02, TENT.z + 0.45]} color={PALETTE.starGold} intensity={GLOW.base} size={1.6} opacity={0} />

      {/* The comet: dry-ice nucleus, coma, vapour that becomes the tails */}
      <group ref={headRef} position={HEAD_START}>
        <mesh ref={nucleusRef} material={nucleusMat}>
          <icosahedronGeometry args={[0.15, 1]} />
        </mesh>
        <GlowSprite ref={comaRef} color={PALETTE.nearWhite} intensity={GLOW.hero} size={1} opacity={0} />
        <points ref={particlesRef} geometry={cometGeo} material={cometMat} frustumCulled={false} />
        <LightLine ref={ionAxisRef} points={ionAxis} color={PALETTE.stellarBlue} intensity={1.4} width={0.01} opacity={0} />
      </group>

      <Label ref={ionLabelRef} position={ionLabelPos} color={PALETTE.stellarBlue} opacity={0}>Ion tail</Label>
      <Label ref={dustLabelRef} position={dustLabelPos} color={PALETTE.starGold} opacity={0}>Dust tail</Label>
    </group>
  )
}
