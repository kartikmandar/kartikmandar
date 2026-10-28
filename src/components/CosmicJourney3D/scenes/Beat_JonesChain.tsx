// src/components/CosmicJourney3D/scenes/Beat_JonesChain.tsx
'use client'

// Beat 20 · RRIVis Grows Up: RadioSim (Act IV, widening).
// The measurement equation, made of light. A radio wavefront leaves a HEALPix
// sky that tessellates and lights up cell by cell, then passes through a stack
// of glass Jones plates (K, E, G, B, D, P). Each plate kinks its path a little
// and tints it, until it lands on a dish and becomes a visibility: a phasor
// whose arm turns slowly on the clock.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { createHoloMaterial, createRimMaterial, getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { NOISE_GLSL } from '../art/glsl'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, pulse, ramp, seeded } from '../art/anim'

// ---------------------------------------------------------------------------
// Static layout (module level: computed once, never mutated)
// ---------------------------------------------------------------------------

const UP = new THREE.Vector3(0, 1, 0)
const Z_AXIS = new THREE.Vector3(0, 0, 1)

const SKY_CENTER = new THREE.Vector3(-3.0, 2.3, -4.5)
const SKY_RADIUS = 1.35
const HEALPIX_NSIDE = 4
const DISH_POS = new THREE.Vector3(2.65, 0.0, 0.3)
const DISH_RADIUS = 0.6
const DISH_FOCAL = 0.3

/** Sky to dish: the line of sight the chain sits on. */
const AXIS = DISH_POS.clone().sub(SKY_CENTER).normalize()
const NEG_AXIS = AXIS.clone().negate()
const SIDE = new THREE.Vector3().crossVectors(AXIS, UP).normalize()
const UPV = new THREE.Vector3().crossVectors(SIDE, AXIS).normalize()
const SOURCE = SKY_CENTER.clone().addScaledVector(AXIS, SKY_RADIUS + 0.04)
const SPAN = SOURCE.distanceTo(DISH_POS)

const PLATES = [
  { letter: 'K', color: PALETTE.signal },
  { letter: 'E', color: PALETTE.stellarBlue },
  { letter: 'G', color: PALETTE.starGold },
  { letter: 'B', color: PALETTE.starGold },
  { letter: 'D', color: PALETTE.stellarBlue },
  { letter: 'P', color: PALETTE.nearWhite },
] as const

const PLATE_W = 1.05
const PLATE_H = 1.35

const PLATE_CENTERS = PLATES.map((_, i) => SOURCE.clone().addScaledVector(AXIS, SPAN * (0.17 + i * 0.125)))

/** Each plate faces the sky, with a small seeded roll so the stack reads as hand-placed glass. */
const PLATE_QUATS = PLATES.map((_, i) => {
  const basis = new THREE.Matrix4().makeBasis(SIDE, UPV, NEG_AXIS)
  const q = new THREE.Quaternion().setFromRotationMatrix(basis)
  return q.multiply(new THREE.Quaternion().setFromAxisAngle(Z_AXIS, (seeded(i, 21) - 0.5) * 0.22))
})

const LABEL_POSITIONS = PLATE_CENTERS.map((c) => {
  const v = c.clone().addScaledVector(UPV, PLATE_H * 0.5 + 0.2)
  return [v.x, v.y, v.z] as [number, number, number]
})

/**
 * The signal's path: sky, then a kinked crossing at each plate (the Jones term
 * bends it a little), then the dish surface.
 */
const PATH: THREE.Vector3[] = [
  SOURCE.clone(),
  ...PLATE_CENTERS.map((c, i) => c.clone()
    .addScaledVector(SIDE, (seeded(i, 11) - 0.5) * 0.3)
    .addScaledVector(UPV, (seeded(i, 12) - 0.5) * 0.24)),
  DISH_POS.clone().addScaledVector(NEG_AXIS, 0.06),
]
const SEGMENTS = PATH.length - 1

/** Normalised cumulative arc length at each path node. */
const CUM: number[] = (() => {
  const out = [0]
  let total = 0
  for (let i = 1; i < PATH.length; i++) {
    total += PATH[i]!.distanceTo(PATH[i - 1]!)
    out.push(total)
  }
  return out.map((v) => v / total)
})()

/** Wave colour on each segment: sky light, then tinted by every plate it has crossed. */
const TINTS: THREE.Color[] = (() => {
  const out = [new THREE.Color(PALETTE.stellarBlue).lerp(new THREE.Color(PALETTE.nearWhite), 0.4)]
  for (let i = 0; i < PLATES.length; i++) {
    out.push(out[i]!.clone().lerp(new THREE.Color(PLATES[i]!.color), 0.55))
  }
  return out
})()

function resamplePath(n: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let k = 0; k <= n; k++) pts.push(pathAt(new THREE.Vector3(), k / n))
  return pts
}

function segmentAt(s: number): number {
  for (let i = 0; i < SEGMENTS; i++) if (s < CUM[i + 1]!) return i
  return SEGMENTS - 1
}

function pathAt(out: THREE.Vector3, s: number): THREE.Vector3 {
  const i = segmentAt(s)
  const f = (s - CUM[i]!) / (CUM[i + 1]! - CUM[i]! || 1)
  return out.lerpVectors(PATH[i]!, PATH[i + 1]!, Math.min(1, Math.max(0, f)))
}

// Dish: paraboloid opening toward the sky, with three feed legs to the focus.
const DISH_QUAT = new THREE.Quaternion().setFromUnitVectors(UP, NEG_AXIS)
const FEED_POS = DISH_POS.clone().addScaledVector(NEG_AXIS, DISH_FOCAL)
const FEED_LEGS: THREE.Vector3[] = (() => {
  const pts: THREE.Vector3[] = []
  const rimY = (DISH_RADIUS * DISH_RADIUS) / (4 * DISH_FOCAL)
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.4
    const rim = new THREE.Vector3(Math.cos(a) * DISH_RADIUS, rimY, Math.sin(a) * DISH_RADIUS)
      .applyQuaternion(DISH_QUAT).add(DISH_POS)
    pts.push(rim, FEED_POS.clone())
  }
  return pts
})()

// Visibility phasor above the dish (amplitude and phase), in the camera-facing plane.
const PHASOR_CENTER = new THREE.Vector3(DISH_POS.x + 0.2, DISH_POS.y + 1.55, DISH_POS.z - 0.2)
const PHASOR_R = 0.34
const PHASOR_RING = Array.from({ length: 65 }, (_, i) => {
  const a = (i / 64) * Math.PI * 2
  return new THREE.Vector3(Math.cos(a) * PHASOR_R, Math.sin(a) * PHASOR_R, 0)
})
const PHASOR_AXES = [
  new THREE.Vector3(-PHASOR_R * 1.25, 0, 0), new THREE.Vector3(PHASOR_R * 1.25, 0, 0),
  new THREE.Vector3(0, -PHASOR_R * 1.25, 0), new THREE.Vector3(0, PHASOR_R * 1.25, 0),
]
const PHASOR_ARM = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(PHASOR_R, 0, 0)]

// Module-level scratch (no allocation inside useFrame).
const _pos = new THREE.Vector3()
const _dirA = new THREE.Vector3()
const _dirB = new THREE.Vector3()
const _color = new THREE.Color()

// ---------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------

const SPHERE_VERT = /* glsl */ `
  varying vec3 vObjDir;
  varying vec3 vNormalV;
  varying vec3 vView;
  void main() {
    vObjDir = normalize(position);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormalV = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

// HEALPix-like tessellation (RING-scheme cell coordinates from ang2pix): in the
// equatorial belt cell edges are lines of constant N(0.5 + tt -+ 0.75 z); in the
// polar caps they follow tp * N sqrt(3(1 - |z|)). Cells light up in a seeded order.
const SPHERE_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform float uNside;
  uniform float uLines;
  uniform float uReveal;
  uniform float uTime;
  uniform vec3 uLineColor;
  uniform vec3 uCellA;
  uniform vec3 uCellB;
  uniform vec3 uRimColor;
  varying vec3 vObjDir;
  varying vec3 vNormalV;
  varying vec3 vView;
  const float PI = 3.14159265;
  void main() {
    vec3 d = normalize(vObjDir);
    float z = d.y;
    float phi = atan(d.z, d.x);
    if (phi < 0.0) phi += 2.0 * PI;
    float tt = phi / (0.5 * PI);
    float N = uNside;
    vec2 ab;
    float face = 0.0;
    if (abs(z) <= 2.0 / 3.0) {
      ab = vec2(N * (0.5 + tt - 0.75 * z), N * (0.5 + tt + 0.75 * z));
    } else {
      float tp = fract(tt);
      float tmp = N * sqrt(3.0 * (1.0 - abs(z)));
      ab = vec2(tp * tmp, (1.0 - tp) * tmp);
      face = floor(tt) + (z > 0.0 ? 11.0 : 23.0);
    }
    // Cap the derivative so the atan seam and the cap/belt hand-over never draw a false edge.
    vec2 w = min(fwidth(ab), vec2(0.35)) * 1.1;
    vec2 g = abs(fract(ab - 0.5) - 0.5) / max(w, vec2(1e-4));
    float line = 1.0 - clamp(min(g.x, g.y), 0.0, 1.0);

    vec2 cell = floor(ab);
    float h = hash13(vec3(cell, face));
    float lit = smoothstep(h, h + 0.1, uReveal * 1.1);
    float sky = 0.35 + 0.65 * smoothstep(0.35, 0.75, fbm(d * 2.4 + 3.1));
    float shimmer = 0.75 + 0.25 * sin(uTime * 0.7 + h * 40.0);
    vec3 cellCol = mix(uCellA, uCellB, hash13(vec3(cell, face + 5.0)));

    float fres = pow(1.0 - clamp(abs(dot(normalize(vNormalV), vView)), 0.0, 1.0), 2.4);
    vec3 col = uLineColor * line * uLines;
    col += cellCol * lit * sky * shimmer * 0.32;
    col += uLineColor * line * lit * 0.6;
    col += uRimColor * fres * uLines;
    gl_FragColor = vec4(col, 1.0);
  }
`

const PLANE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// The wavefront: a bright crest ring, rippling interior and a soft core.
const WAVE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 q = vUv * 2.0 - 1.0;
    float r = length(q);
    float disk = 1.0 - smoothstep(0.55, 1.0, r);
    float crest = exp(-pow((r - 0.8) / 0.055, 2.0));
    float ripples = pow(0.5 + 0.5 * cos(r * 24.0 - uTime * 4.0), 6.0) * (1.0 - smoothstep(0.2, 0.95, r));
    float core = exp(-r * r * 7.0);
    float v = crest * 1.15 + ripples * 0.3 + core * 0.55 + disk * 0.06;
    gl_FragColor = vec4(uColor * v * uOpacity, 1.0);
  }
`

// Ambient signal stream: particles ride the kinked path, tinted per segment,
// only behind the wavefront (uReach), so the established beam keeps flowing.
const STREAM_VERT = /* glsl */ `
  attribute float aSeed;
  attribute vec3 aJitter;
  uniform vec3 uPath[${PATH.length}];
  uniform float uCum[${PATH.length}];
  uniform vec3 uTint[${SEGMENTS}];
  uniform float uTime;
  uniform float uReach;
  uniform float uSize;
  varying vec3 vColor;
  varying float vFade;
  void main() {
    float s = fract(aSeed + uTime * 0.04);
    vec3 p = uPath[${SEGMENTS}];
    vec3 c = uTint[${SEGMENTS - 1}];
    for (int i = 0; i < ${SEGMENTS}; i++) {
      if (s >= uCum[i] && s < uCum[i + 1]) {
        float f = (s - uCum[i]) / max(uCum[i + 1] - uCum[i], 1e-4);
        p = mix(uPath[i], uPath[i + 1], f);
        c = uTint[i];
      }
    }
    p += aJitter * (0.08 * (1.0 - 0.75 * s));
    vColor = c;
    vFade = smoothstep(0.0, 0.05, s) * (1.0 - smoothstep(0.93, 1.0, s)) * (1.0 - smoothstep(uReach - 0.03, uReach, s));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.55 + 0.9 * fract(aSeed * 17.3)) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const STREAM_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform float uGain;
  varying vec3 vColor;
  varying float vFade;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    gl_FragColor = vec4(vColor * uGain * a * vFade * uOpacity, 1.0);
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

function dishGeometry(): THREE.LatheGeometry {
  const pts: THREE.Vector2[] = []
  for (let i = 0; i <= 12; i++) {
    const r = (i / 12) * DISH_RADIUS
    pts.push(new THREE.Vector2(r, (r * r) / (4 * DISH_FOCAL)))
  }
  return new THREE.LatheGeometry(pts, 40)
}

type FadingText = THREE.Mesh & { fillOpacity: number }

// ---------------------------------------------------------------------------

export default function Beat_JonesChain({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const sphereRef = useRef<THREE.Mesh>(null)
  const platesRef = useRef<THREE.Group>(null)
  const lettersRef = useRef<THREE.Group>(null)
  const rayRef = useRef<LightLineObject>(null)
  const waveRef = useRef<THREE.Mesh>(null)
  const streamRef = useRef<THREE.Points>(null)
  const sourceGlowRef = useRef<THREE.Sprite>(null)
  const dishRef = useRef<THREE.Mesh>(null)
  const legsRef = useRef<LightLineObject>(null)
  const feedGlowRef = useRef<THREE.Sprite>(null)
  const ringRef = useRef<LightLineObject>(null)
  const axesRef = useRef<LightLineObject>(null)
  const armGroupRef = useRef<THREE.Group>(null)
  const armRef = useRef<LightLineObject>(null)
  const tipRef = useRef<THREE.Sprite>(null)

  const rayPoints = useMemo(() => resamplePath(160), [])

  const sphereMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uNside: { value: HEALPIX_NSIDE },
      uLines: { value: 0 },
      uReveal: { value: 0 },
      uTime: { value: 0 },
      uLineColor: { value: hdr(PALETTE.starGold, 0.55) },
      uCellA: { value: hdr(PALETTE.starGold, GLOW.base) },
      uCellB: { value: hdr(PALETTE.stellarBlue, GLOW.base) },
      uRimColor: { value: hdr(PALETTE.stellarBlue, 0.6) },
    },
    vertexShader: SPHERE_VERT,
    fragmentShader: SPHERE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  // One holo glass material per plate (each carries its own tint).
  const plateMats = useDisposable(() => {
    const mats = PLATES.map((pl) => createHoloMaterial(hdr(pl.color, GLOW.base)))
    return { mats, dispose: () => mats.forEach((m) => m.dispose()) }
  })

  const waveMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: TINTS[0]!.clone() },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: PLANE_VERT,
    fragmentShader: WAVE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  }))

  const particleCount = quality === 'mobile' ? 100 : quality === 'low' ? 200 : 400
  const streamGeo = useDisposable(() => streamGeometry(particleCount), [particleCount])
  const streamMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uPath: { value: PATH.map((v) => v.clone()) },
      uCum: { value: CUM.slice() },
      uTint: { value: TINTS.slice(0, SEGMENTS).map((c) => new THREE.Vector3(c.r, c.g, c.b)) },
      uTime: { value: 0 },
      uReach: { value: 0 },
      uSize: { value: 30 },
      uMap: { value: getGlowTexture() },
      uOpacity: { value: 0 },
      uGain: { value: 1.25 },
    },
    vertexShader: STREAM_VERT,
    fragmentShader: STREAM_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))

  const dishGeo = useDisposable(dishGeometry)
  const dishMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.starGold, 0.06),
    rim: hdr(PALETTE.starGold, 1.5),
    power: 2.4,
    additive: true,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock

    // HEALPix sky: tessellation draws in on arrival, cells light through the hold.
    const sphere = sphereRef.current
    setUniform(sphere, 'uLines', ease(p, 0.0, 0.18))
    setUniform(sphere, 'uReveal', ease(p, 0.06, 0.62))
    setUniform(sphere, 'uTime', t)
    if (sphere) sphere.rotation.y = t * 0.03

    // The wavefront's journey (scroll-driven), then the visibility.
    const s = ease(p, 0.2, 0.62)
    const seg = segmentAt(s)
    const f = ramp(s, CUM[seg]!, CUM[seg + 1]!)

    const wave = waveRef.current
    if (wave) {
      const live = ramp(p, 0.16, 0.22) * (1 - ramp(s, 0.95, 1))
      wave.visible = live > 0.001
      pathAt(_pos, s)
      wave.position.copy(_pos)
      _dirB.subVectors(PATH[seg + 1]!, PATH[seg]!).normalize()
      if (seg > 0) {
        _dirA.subVectors(PATH[seg]!, PATH[seg - 1]!).normalize()
        _dirB.lerp(_dirA, 1 - ease(f, 0, 0.3)).normalize()
      }
      wave.quaternion.setFromUnitVectors(Z_AXIS, _dirB)
      const scale = 1.45 - 0.9 * s
      wave.scale.set(scale, scale, 1)
      const material = wave.material as THREE.ShaderMaterial
      _color.copy(TINTS[Math.max(seg - 1, 0)]!).lerp(TINTS[seg]!, seg > 0 ? ease(f, 0, 0.35) : 1)
      material.uniforms.uColor!.value.copy(_color).multiplyScalar(GLOW.hero)
      material.uniforms.uOpacity!.value = live
      material.uniforms.uTime!.value = t
    }
    setLineReveal(rayRef.current, s)
    setLineOpacity(rayRef.current, 0.85 * ramp(p, 0.18, 0.24))

    const stream = streamRef.current
    setUniform(stream, 'uTime', t)
    setUniform(stream, 'uReach', s)
    setUniform(stream, 'uOpacity', ease(p, 0.26, 0.45))

    const sourceGlow = sourceGlowRef.current
    if (sourceGlow) (sourceGlow.material as THREE.SpriteMaterial).opacity = ease(p, 0.08, 0.2) * (0.45 + 0.55 * pulse(p, 0.14, 0.3))

    // Jones plates: fade in staggered, flash as the wave crosses, stay a touch brighter after.
    const plates = platesRef.current
    const letters = lettersRef.current
    for (let i = 0; i < PLATES.length; i++) {
      const node = CUM[i + 1]!
      const d = (s - node) / 0.03
      const flash = p > 0.18 ? Math.exp(-d * d) : 0
      const passed = ramp(s, node, node + 0.06)
      const appear = ease(p, 0.02 + i * 0.03, 0.14 + i * 0.03)
      if (plates) {
        const plate = plates.children[i] as THREE.Mesh | undefined
        setUniform(plate, 'uOpacity', appear * (0.5 + 0.3 * passed + 1.4 * flash))
        setUniform(plate, 'uTime', t)
      }
      const letter = letters?.children[i] as FadingText | undefined
      if (letter) letter.fillOpacity = appear * (0.55 + 0.25 * passed + 0.2 * flash)
    }

    // Landing: the dish lights, the feed flares, the visibility phasor draws in.
    setUniform(dishRef.current, 'uOpacity', ease(p, 0.04, 0.2) * (0.7 + 0.3 * ramp(p, 0.58, 0.66)))
    setLineOpacity(legsRef.current, ease(p, 0.06, 0.2) * 0.8)
    const feed = feedGlowRef.current
    if (feed) {
      const flare = pulse(p, 0.58, 0.8)
      ;(feed.material as THREE.SpriteMaterial).opacity = 0.15 * ease(p, 0.1, 0.2) + 0.5 * ease(p, 0.6, 0.68) + 0.5 * flare
      const sc = 0.55 + 0.6 * flare
      feed.scale.set(sc, sc, 1)
    }
    setLineReveal(ringRef.current, ease(p, 0.62, 0.74))
    setLineOpacity(axesRef.current, ease(p, 0.62, 0.72) * 0.6)
    const armIn = ease(p, 0.68, 0.76)
    setLineOpacity(armRef.current, armIn)
    const tip = tipRef.current
    if (tip) (tip.material as THREE.SpriteMaterial).opacity = armIn
    const arm = armGroupRef.current
    if (arm) arm.rotation.z = 0.7 + t * 0.35 + 1.4 * ease(p, 0.68, 0.84)
  })

  return (
    <group>
      {/* HEALPix sky the signal leaves */}
      <mesh ref={sphereRef} position={SKY_CENTER} material={sphereMat} frustumCulled={false}>
        <sphereGeometry args={[SKY_RADIUS, 96, 64]} />
      </mesh>
      <GlowSprite ref={sourceGlowRef} position={[SOURCE.x, SOURCE.y, SOURCE.z]} color={PALETTE.starGold} intensity={GLOW.hero} size={0.9} opacity={0} />

      {/* Jones plates */}
      <group ref={platesRef}>
        {PLATES.map((pl, i) => (
          <mesh key={pl.letter + i} position={PLATE_CENTERS[i]} quaternion={PLATE_QUATS[i]} material={plateMats.mats[i]}>
            <planeGeometry args={[PLATE_W, PLATE_H]} />
          </mesh>
        ))}
      </group>
      <group ref={lettersRef}>
        {PLATES.map((pl, i) => (
          <Label key={pl.letter + i} position={LABEL_POSITIONS[i]} size="body" color={pl.color} opacity={0}>
            {pl.letter}
          </Label>
        ))}
      </group>

      {/* The signal: path, wavefront and stream */}
      <LightLine ref={rayRef} points={rayPoints} color={PALETTE.starGold} intensity={GLOW.base} width={0.012} opacity={0} />
      <mesh ref={waveRef} material={waveMat} visible={false} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <points ref={streamRef} geometry={streamGeo} material={streamMat} frustumCulled={false} />

      {/* The dish */}
      <mesh ref={dishRef} position={DISH_POS} quaternion={DISH_QUAT} geometry={dishGeo} material={dishMat} />
      <LightLine ref={legsRef} points={FEED_LEGS} segments color={PALETTE.nearWhite} intensity={GLOW.base} width={0.01} opacity={0} />
      <GlowSprite ref={feedGlowRef} position={[FEED_POS.x, FEED_POS.y, FEED_POS.z]} color={PALETTE.starGold} intensity={GLOW.hot} size={0.55} opacity={0} />

      {/* The visibility: a phasor (amplitude and phase) */}
      <group position={PHASOR_CENTER}>
        <LightLine ref={axesRef} points={PHASOR_AXES} segments color={PALETTE.nearWhite} intensity={GLOW.dim} width={0.008} opacity={0} />
        <LightLine ref={ringRef} points={PHASOR_RING} color={PALETTE.starGold} intensity={GLOW.base} width={0.014} />
        <group ref={armGroupRef}>
          <LightLine ref={armRef} points={PHASOR_ARM} color={PALETTE.starGold} intensity={GLOW.hero} width={0.02} opacity={0} />
          <GlowSprite ref={tipRef} position={[PHASOR_R, 0, 0]} color={PALETTE.nearWhite} intensity={GLOW.hero} size={0.32} opacity={0} />
        </group>
      </group>
    </group>
  )
}
