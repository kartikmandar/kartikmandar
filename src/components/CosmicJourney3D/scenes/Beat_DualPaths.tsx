// src/components/CosmicJourney3D/scenes/Beat_DualPaths.tsx
'use client'

// Beat 10 · Dual Pathways (Act II, course correction).
// Two light paths fork from one bright point. The left one climbs to a phone made
// of light whose glass streams accelerometer and gyro traces sampled at 100 Hz
// (Sysmatics Lab). The right one becomes a shimmering protein ribbon (molecular
// dynamics for iGEM) that coils up and away to a gold medal glint hanging over a
// Paris skyline drawn in hairlines.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { createHoloMaterial, createRimMaterial, setUniform, useDisposable } from '../art/materials'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, seeded } from '../art/anim'

type Curve3 = readonly [THREE.Vector3, THREE.Vector3, THREE.Vector3]

const FORK = new THREE.Vector3(0, -0.72, 0.4)
// Phone: centre, size and yaw (turned a little toward the middle of the frame).
const PHONE = new THREE.Vector3(-2.65, 1.3, -1.0)
const PHONE_W = 1.0
const PHONE_H = 1.9
const PHONE_YAW = 0.32
const LEFT_PATH: Curve3 = [FORK, new THREE.Vector3(-1.7, -0.75, 0.0), new THREE.Vector3(-2.52, 0.3, -0.92)]
// Right path runs into the protein ribbon's first residue.
const RIBBON_START = new THREE.Vector3(1.25, 0.25, -0.7)
const RIGHT_PATH: Curve3 = [FORK, new THREE.Vector3(1.1, -0.7, 0.1), RIBBON_START]
const MEDAL = new THREE.Vector3(3.25, 3.0, -4.0)
const SKYLINE_ORIGIN = new THREE.Vector3(2.7, -0.55, -4.4)

function bezier(out: THREE.Vector3, c: Curve3, t: number): THREE.Vector3 {
  const u = 1 - t
  return out.copy(c[0]).multiplyScalar(u * u).addScaledVector(c[1], 2 * u * t).addScaledVector(c[2], t * t)
}

function sampleCurve(c: Curve3, n: number): THREE.Vector3[] {
  return Array.from({ length: n + 1 }, (_, i) => bezier(new THREE.Vector3(), c, i / n))
}

// Phone body: rounded rectangle in the phone's local XY plane.
function phoneOutline(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const hw = PHONE_W / 2
  const hh = PHONE_H / 2
  const r = 0.14
  const corners: Array<[number, number, number]> = [[hw - r, hh - r, 0], [-hw + r, hh - r, 0.5], [-hw + r, -hh + r, 1], [hw - r, -hh + r, 1.5]]
  for (const [cx, cy, start] of corners) {
    for (let i = 0; i <= 8; i++) {
      const a = (start + (i / 8) * 0.5) * Math.PI
      pts.push(new THREE.Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0))
    }
  }
  pts.push(pts[0]!.clone())
  return pts
}

// Speaker slot, camera ring and home bar (segments).
function phoneDetails(): THREE.Vector3[] {
  const hh = PHONE_H / 2
  const pts: THREE.Vector3[] = [
    new THREE.Vector3(-0.12, hh - 0.1, 0.002), new THREE.Vector3(0.12, hh - 0.1, 0.002),
    new THREE.Vector3(-0.16, -hh + 0.08, 0.002), new THREE.Vector3(0.16, -hh + 0.08, 0.002),
  ]
  for (let i = 0; i < 12; i++) {
    const a0 = (i / 12) * Math.PI * 2
    const a1 = ((i + 1) / 12) * Math.PI * 2
    pts.push(new THREE.Vector3(0.24 + Math.cos(a0) * 0.025, hh - 0.1 + Math.sin(a0) * 0.025, 0.002))
    pts.push(new THREE.Vector3(0.24 + Math.cos(a1) * 0.025, hh - 0.1 + Math.sin(a1) * 0.025, 0.002))
  }
  return pts
}

const PLANE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Six sensor traces (accelerometer x/y/z, gyro x/y/z) streaming right to left,
// sampled at 100 Hz: a hairline through discrete sample dots, with a write head.
const WAVE_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform float uOpacity;
  uniform vec3 uAcc;
  uniform vec3 uGyro;
  uniform vec3 uHead;
  varying vec2 vUv;
  const float SAMPLES = 46.0;
  float signal(float x, float k) {
    float s = x * 9.0 + uTime * 1.6;
    return 0.55 * sin(s + k * 2.1) * sin(s * 0.37 + k)
      + 0.25 * sin(s * 2.7 + k * 4.3)
      + 0.12 * sin(s * 6.1 + k * 1.7);
  }
  float trace(vec2 uv, float center, float amp, float k) {
    float f = center + amp * signal(uv.x, k);
    float d = uv.y - f;
    float line = 1.0 - smoothstep(0.0, 1.4, abs(d) / max(fwidth(d), 1e-4));
    float xs = (floor(uv.x * SAMPLES) + 0.5) / SAMPLES;
    float fs = center + amp * signal(xs, k);
    vec2 dp = (uv - vec2(xs, fs)) * vec2(SAMPLES, 46.0);
    float pip = exp(-dot(dp, dp) * 6.0);
    return line * 0.55 + pip;
  }
  void main() {
    vec2 uv = vec2((vUv.x - 0.07) / 0.86, (vUv.y - 0.06) / 0.86);
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
    float head = uReveal;
    float shown = 1.0 - smoothstep(head - 0.005, head, uv.x);
    vec3 col = vec3(0.0);
    col += uAcc * trace(uv, 0.86, 0.045, 0.0);
    col += uAcc * 0.8 * trace(uv, 0.74, 0.04, 1.0);
    col += uAcc * 0.65 * trace(uv, 0.62, 0.05, 2.0);
    col += uGyro * trace(uv, 0.4, 0.04, 3.0);
    col += uGyro * 0.8 * trace(uv, 0.28, 0.035, 4.0);
    col += uGyro * 0.65 * trace(uv, 0.16, 0.045, 5.0);
    // faint separators between the accelerometer and gyro bands
    float sep = (1.0 - smoothstep(0.0, 1.2, abs(uv.y - 0.51) / max(fwidth(uv.y), 1e-4))) * 0.12;
    col += uAcc * sep;
    col *= shown;
    // write head: a thin bright scan line where new samples arrive
    float scan = (1.0 - smoothstep(0.0, 1.6, abs(uv.x - head) / max(fwidth(uv.x), 1e-4))) * step(uReveal, 0.999);
    col += uHead * scan * 0.6;
    gl_FragColor = vec4(col * uOpacity, 1.0);
  }
`

// Protein cartoon ribbon. Bright edges and a faint fill, with a slow shimmer
// travelling along the chain; drawn on from the N-terminus with uReveal.
const RIBBON_VERT = /* glsl */ `
  attribute float aS;
  attribute float aSide;
  varying float vS;
  varying float vSide;
  void main() {
    vS = aS;
    vSide = aSide;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const RIBBON_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform vec3 uCool;
  uniform vec3 uWarm;
  uniform vec3 uGold;
  varying float vS;
  varying float vSide;
  void main() {
    float shown = 1.0 - smoothstep(uReveal - 0.02, uReveal, vS);
    if (shown <= 0.0) discard;
    float edge = pow(abs(vSide), 10.0);
    float fill = 0.12;
    float wave = fract(vS * 2.5 - uTime * 0.12);
    float shimmer = exp(-pow((wave - 0.5) * 9.0, 2.0));
    vec3 tint = mix(uCool, uWarm, smoothstep(0.1, 0.7, vS));
    tint = mix(tint, uGold, smoothstep(0.86, 1.0, vS));
    vec3 col = tint * (fill + edge * 0.85 + shimmer * (0.25 + 0.9 * edge));
    // a hot tip where the chain is being drawn
    col += uWarm * exp(-pow((vS - uReveal) * 60.0, 2.0)) * 1.5 * step(uReveal, 0.999);
    gl_FragColor = vec4(col * shown, 1.0);
  }
`

// Backbone with helix / sheet / loop regions, as a flat ribbon mesh.
function ribbonGeometry(): THREE.BufferGeometry {
  const backbone = new THREE.CatmullRomCurve3([
    RIBBON_START,
    new THREE.Vector3(1.85, 0.55, -1.15),
    new THREE.Vector3(1.75, 1.15, -1.75),
    new THREE.Vector3(2.35, 1.45, -2.25),
    new THREE.Vector3(2.2, 2.0, -2.8),
    new THREE.Vector3(2.85, 2.45, -3.45),
    new THREE.Vector3(MEDAL.x - 0.12, MEDAL.y - 0.3, MEDAL.z + 0.15),
  ], false, 'centripetal')
  const n = 420
  const frames = backbone.computeFrenetFrames(n, false)
  const smooth = (x: number, a: number, b: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)
  }
  const band = (s: number, a: number, b: number) => smooth(s, a, a + 0.03) * (1 - smooth(s, b - 0.03, b))
  const helix = (s: number) => Math.max(band(s, 0.1, 0.4), band(s, 0.74, 0.93))
  const sheet = (s: number) => band(s, 0.47, 0.68)

  const centers: THREE.Vector3[] = []
  const radial: THREE.Vector3[] = []
  for (let i = 0; i <= n; i++) {
    const s = i / n
    const c = backbone.getPointAt(s)
    const N = frames.normals[i]!
    const B = frames.binormals[i]!
    const phi = s * Math.PI * 2 * 15
    const rad = new THREE.Vector3().addScaledVector(N, Math.cos(phi)).addScaledVector(B, Math.sin(phi))
    c.addScaledVector(rad, 0.13 * helix(s))
    // beta-sheet pleat
    c.addScaledVector(B, 0.035 * Math.sin(s * Math.PI * 2 * 22) * sheet(s))
    centers.push(c)
    radial.push(rad)
  }

  const positions = new Float32Array((n + 1) * 2 * 3)
  const along = new Float32Array((n + 1) * 2)
  const side = new Float32Array((n + 1) * 2)
  const tangent = new THREE.Vector3()
  const across = new THREE.Vector3()
  const helixAcross = new THREE.Vector3()
  for (let i = 0; i <= n; i++) {
    const s = i / n
    const h = helix(s)
    const sh = sheet(s)
    const prev = centers[Math.max(0, i - 1)]!
    const next = centers[Math.min(n, i + 1)]!
    tangent.subVectors(next, prev).normalize()
    helixAcross.crossVectors(radial[i]!, tangent).normalize()
    across.copy(frames.normals[i]!).lerp(helixAcross, h).normalize()
    // widths: thin coil, broad helix, broad sheet ending in an arrowhead
    const arrow = s > 0.62 && s < 0.68 ? 1 + 0.6 * (1 - (s - 0.62) / 0.06) : 1
    const width = 0.025 + 0.085 * h + 0.11 * sh * arrow
    const c = centers[i]!
    for (let k = 0; k < 2; k++) {
      const sign = k === 0 ? -1 : 1
      const o = (i * 2 + k) * 3
      positions[o] = c.x + across.x * width * sign
      positions[o + 1] = c.y + across.y * width * sign
      positions[o + 2] = c.z + across.z * width * sign
      along[i * 2 + k] = s
      side[i * 2 + k] = sign
    }
  }
  const indices: number[] = []
  for (let i = 0; i < n; i++) {
    const a = i * 2
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  g.setAttribute('aS', new THREE.BufferAttribute(along, 1))
  g.setAttribute('aSide', new THREE.BufferAttribute(side, 1))
  g.setIndex(indices)
  return g
}

// Paris in hairlines (segments, local to SKYLINE_ORIGIN): Haussmann blocks with
// mansard roofs, a dome, and the Eiffel Tower.
function skylinePoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const seg = (x0: number, y0: number, x1: number, y1: number, z = 0) => pts.push(new THREE.Vector3(x0, y0, z), new THREE.Vector3(x1, y1, z))
  seg(-2.1, 0, 2.2, 0)
  // Haussmann blocks: walls, cornice, mansard, chimneys
  const blocks: Array<[number, number, number]> = [[-2.0, 0.55, 0.62], [-1.38, 0.5, 0.7], [-0.68, 0.45, 0.58], [1.05, 0.55, 0.64], [1.6, 0.5, 0.5]]
  blocks.forEach(([x, w, h], i) => {
    const z = -0.15 - 0.1 * seeded(i, 21)
    seg(x, 0, x, h, z)
    seg(x + w, 0, x + w, h, z)
    seg(x - 0.03, h, x + w + 0.03, h, z)
    seg(x, h, x + 0.08, h + 0.2, z)
    seg(x + w, h, x + w - 0.08, h + 0.2, z)
    seg(x + 0.08, h + 0.2, x + w - 0.08, h + 0.2, z)
    const cx = x + w * (0.3 + 0.4 * seeded(i, 22))
    seg(cx, h + 0.2, cx, h + 0.29, z)
    seg(cx + 0.05, h + 0.2, cx + 0.05, h + 0.29, z)
    // two rows of window ticks
    for (let r = 0; r < 2; r++) {
      const wy = h * (0.35 + 0.3 * r)
      for (let wx = x + 0.08; wx < x + w - 0.06; wx += 0.11) seg(wx, wy, wx + 0.04, wy, z)
    }
  })
  // dome on a drum, with a lantern
  const dx = -0.02
  const dz = -0.35
  seg(dx - 0.3, 0, dx - 0.3, 0.75, dz)
  seg(dx + 0.3, 0, dx + 0.3, 0.75, dz)
  seg(dx - 0.34, 0.75, dx + 0.34, 0.75, dz)
  for (let i = 0; i < 16; i++) {
    const a0 = (i / 16) * Math.PI
    const a1 = ((i + 1) / 16) * Math.PI
    seg(dx + Math.cos(a0) * 0.28, 0.75 + Math.sin(a0) * 0.36, dx + Math.cos(a1) * 0.28, 0.75 + Math.sin(a1) * 0.36, dz)
  }
  seg(dx, 1.11, dx, 1.32, dz)
  seg(dx - 0.04, 1.2, dx + 0.04, 1.2, dz)
  // Eiffel Tower, bottom-up so it builds as it reveals
  const ex = MEDAL.x - SKYLINE_ORIGIN.x
  const top = 2.75
  const half = (y: number) => 0.045 + 0.5 * Math.pow(1 - y / top, 2.3)
  const steps = 14
  for (let i = 0; i < steps; i++) {
    const y0 = (i / steps) * top
    const y1 = ((i + 1) / steps) * top
    seg(ex - half(y0), y0, ex - half(y1), y1)
    seg(ex + half(y0), y0, ex + half(y1), y1)
    if (i > 0 && i < steps - 1) {
      seg(ex - half(y0), y0, ex + half(y1), y1)
      seg(ex + half(y0), y0, ex - half(y1), y1)
    }
  }
  for (let i = 0; i < 12; i++) {
    const a0 = (i / 12) * Math.PI
    const a1 = ((i + 1) / 12) * Math.PI
    seg(ex + Math.cos(a0) * 0.33, Math.sin(a0) * 0.3, ex + Math.cos(a1) * 0.33, Math.sin(a1) * 0.3)
  }
  for (const y of [0.5, 1.2, 2.25]) seg(ex - half(y) - 0.06, y, ex + half(y) + 0.06, y)
  seg(ex, top, ex, top + 0.3)
  return pts
}

// Four-point star glint (segments around the origin).
function glintPoints(): THREE.Vector3[] {
  return [
    new THREE.Vector3(-0.55, 0, 0), new THREE.Vector3(0.55, 0, 0),
    new THREE.Vector3(0, -0.42, 0), new THREE.Vector3(0, 0.42, 0),
    new THREE.Vector3(-0.16, -0.16, 0), new THREE.Vector3(0.16, 0.16, 0),
    new THREE.Vector3(-0.16, 0.16, 0), new THREE.Vector3(0.16, -0.16, 0),
  ]
}

// Module-level scratch.
const _pos = new THREE.Vector3()

type TextMesh = THREE.Mesh & { fillOpacity: number }

export default function Beat_DualPaths({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const forkRef = useRef<THREE.Sprite>(null)
  const leftRef = useRef<LightLineObject>(null)
  const rightRef = useRef<LightLineObject>(null)
  const leftHeadRef = useRef<THREE.Sprite>(null)
  const rightHeadRef = useRef<THREE.Sprite>(null)
  const phoneRef = useRef<THREE.Group>(null)
  const outlineRef = useRef<LightLineObject>(null)
  const detailsRef = useRef<LightLineObject>(null)
  const screenRef = useRef<THREE.Mesh>(null)
  const waveRef = useRef<THREE.Mesh>(null)
  const ribbonRef = useRef<THREE.Mesh>(null)
  const ribbonGroupRef = useRef<THREE.Group>(null)
  const skylineRef = useRef<LightLineObject>(null)
  const medalRef = useRef<THREE.Group>(null)
  const medalBodyRef = useRef<THREE.Mesh>(null)
  const strapRef = useRef<LightLineObject>(null)
  const medalGlowRef = useRef<THREE.Sprite>(null)
  const glintRef = useRef<THREE.Group>(null)
  const glintLineRef = useRef<LightLineObject>(null)
  const sensorLabelRef = useRef<TextMesh>(null)
  const igemLabelRef = useRef<TextMesh>(null)

  const left = useMemo(() => sampleCurve(LEFT_PATH, 64), [])
  const right = useMemo(() => sampleCurve(RIGHT_PATH, 64), [])
  const outline = useMemo(() => phoneOutline(), [])
  const details = useMemo(() => phoneDetails(), [])
  const skyline = useMemo(() => skylinePoints(), [])
  const glint = useMemo(() => glintPoints(), [])
  const medalStrap = useMemo(() => [
    new THREE.Vector3(-0.17, 0.42, 0), new THREE.Vector3(0, 0.15, 0), new THREE.Vector3(0.17, 0.42, 0),
  ], [])

  const screenMat = useDisposable(() => createHoloMaterial(hdr(PALETTE.signal, 0.9)))
  const waveMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uOpacity: { value: 0 },
      uAcc: { value: hdr(PALETTE.signal, 1.5) },
      uGyro: { value: hdr(PALETTE.stellarBlue, 1.3) },
      uHead: { value: hdr(PALETTE.nearWhite, GLOW.hero) },
    },
    vertexShader: PLANE_VERT,
    fragmentShader: WAVE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))
  const ribbonGeo = useDisposable(ribbonGeometry)
  const ribbonMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uCool: { value: hdr(PALETTE.stellarBlue, 1.2) },
      uWarm: { value: hdr(PALETTE.signal, 1.5) },
      uGold: { value: hdr(PALETTE.starGold, 1.6) },
    },
    vertexShader: RIBBON_VERT,
    fragmentShader: RIBBON_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  }))
  const medalMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.starGold, 0.25),
    rim: hdr(PALETTE.starGold, GLOW.hero),
    power: 1.6,
    additive: true,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock

    const forkGlow = forkRef.current
    if (forkGlow) (forkGlow.material as THREE.SpriteMaterial).opacity = 0.3 + 0.6 * ease(p, 0.02, 0.18)

    // 1 · the fork: both paths draw on, each led by a travelling spark
    const leftDraw = ease(p, 0.1, 0.32)
    const rightDraw = ease(p, 0.14, 0.36)
    setLineReveal(leftRef.current, leftDraw)
    setLineReveal(rightRef.current, rightDraw)
    const leftHead = leftHeadRef.current
    if (leftHead) {
      bezier(_pos, LEFT_PATH, leftDraw)
      leftHead.position.copy(_pos)
      ;(leftHead.material as THREE.SpriteMaterial).opacity = leftDraw > 0.001 ? 0.9 * (1 - ease(p, 0.32, 0.42)) : 0
    }
    const rightHead = rightHeadRef.current
    if (rightHead) {
      bezier(_pos, RIGHT_PATH, rightDraw)
      rightHead.position.copy(_pos)
      ;(rightHead.material as THREE.SpriteMaterial).opacity = rightDraw > 0.001 ? 0.9 * (1 - ease(p, 0.36, 0.44)) : 0
    }

    // 2a · the phone lights up and starts logging
    const phoneOn = ease(p, 0.26, 0.4)
    setLineOpacity(outlineRef.current, phoneOn)
    setLineOpacity(detailsRef.current, phoneOn * 0.8)
    setUniform(screenRef.current, 'uOpacity', phoneOn)
    setUniform(screenRef.current, 'uTime', t)
    setUniform(waveRef.current, 'uOpacity', phoneOn)
    setUniform(waveRef.current, 'uReveal', ease(p, 0.32, 0.56))
    setUniform(waveRef.current, 'uTime', t + p * 4)
    const phone = phoneRef.current
    if (phone) phone.position.y = PHONE.y + Math.sin(t * 0.5) * 0.03

    // 2b · the protein chain folds on, shimmering
    setUniform(ribbonRef.current, 'uReveal', ease(p, 0.3, 0.62))
    setUniform(ribbonRef.current, 'uTime', t + p * 3)
    const ribbonGroup = ribbonGroupRef.current
    if (ribbonGroup) ribbonGroup.position.y = Math.sin(t * 0.4 + 1.3) * 0.025

    // 3 · Paris draws in, then the medal glints above it
    setLineReveal(skylineRef.current, ease(p, 0.4, 0.64))
    const medalOn = ease(p, 0.58, 0.72)
    const medal = medalRef.current
    if (medal) {
      medal.visible = medalOn > 0.001
      medal.rotation.y = Math.sin(t * 0.6) * 0.35
    }
    setUniform(medalBodyRef.current, 'uOpacity', medalOn)
    setLineOpacity(strapRef.current, medalOn * 0.7)
    const medalGlow = medalGlowRef.current
    if (medalGlow) (medalGlow.material as THREE.SpriteMaterial).opacity = medalOn * 0.85
    const glintGroup = glintRef.current
    if (glintGroup) {
      // a slow sparkle: mostly resting, swelling every few seconds
      const sparkle = 0.55 + 0.45 * Math.pow(0.5 + 0.5 * Math.sin(t * 0.9), 6)
      const s = medalOn * (0.6 + 0.5 * sparkle)
      glintGroup.scale.set(s, s, s)
      glintGroup.rotation.z = 0.12 * Math.sin(t * 0.3)
    }
    setLineOpacity(glintLineRef.current, medalOn)

    if (sensorLabelRef.current) sensorLabelRef.current.fillOpacity = ease(p, 0.36, 0.48) * 0.8
    if (igemLabelRef.current) igemLabelRef.current.fillOpacity = ease(p, 0.64, 0.76) * 0.8
  })

  return (
    <group>
      <GlowSprite ref={forkRef} position={[FORK.x, FORK.y, FORK.z]} color={PALETTE.nearWhite} intensity={GLOW.hero} size={0.7} opacity={0.3} />
      <LightLine ref={leftRef} points={left} color={PALETTE.signal} intensity={1.4} width={0.022} />
      <LightLine ref={rightRef} points={right} color={PALETTE.stellarBlue} intensity={1.4} width={0.022} />
      <GlowSprite ref={leftHeadRef} color={PALETTE.signal} intensity={GLOW.hero} size={0.45} opacity={0} />
      <GlowSprite ref={rightHeadRef} color={PALETTE.stellarBlue} intensity={GLOW.hero} size={0.45} opacity={0} />

      {/* Sysmatics: a phone made of light, logging its sensors */}
      <group ref={phoneRef} position={PHONE} rotation={[0, PHONE_YAW, 0]}>
        <LightLine ref={outlineRef} points={outline} color={PALETTE.nearWhite} intensity={1.2} width={0.016} opacity={0} />
        <LightLine ref={detailsRef} points={details} segments color={PALETTE.nearWhite} intensity={GLOW.base} width={0.01} opacity={0} />
        <mesh ref={screenRef} material={screenMat}>
          <planeGeometry args={[PHONE_W - 0.1, PHONE_H - 0.3]} />
        </mesh>
        <mesh ref={waveRef} material={waveMat} position={[0, 0, 0.004]}>
          <planeGeometry args={[PHONE_W - 0.1, PHONE_H - 0.3]} />
        </mesh>
      </group>

      {/* iGEM: molecular dynamics, a protein ribbon */}
      <group ref={ribbonGroupRef}>
        <mesh ref={ribbonRef} geometry={ribbonGeo} material={ribbonMat} frustumCulled={false} />
      </group>

      <group position={SKYLINE_ORIGIN}>
        <LightLine ref={skylineRef} points={skyline} segments color={PALETTE.nearWhite} intensity={0.6} width={0.011} />
      </group>

      <group ref={medalRef} position={MEDAL} visible={false}>
        <mesh ref={medalBodyRef} material={medalMat}>
          <torusGeometry args={[0.13, 0.03, 16, 48]} />
        </mesh>
        <LightLine ref={strapRef} points={medalStrap} color={PALETTE.starGold} intensity={GLOW.base} width={0.012} />
      </group>
      <GlowSprite ref={medalGlowRef} position={[MEDAL.x, MEDAL.y, MEDAL.z]} color={PALETTE.starGold} intensity={GLOW.hot} size={0.9} opacity={0} />
      <group ref={glintRef} position={MEDAL} scale={0}>
        <LightLine ref={glintLineRef} points={glint} segments color={PALETTE.starGold} intensity={GLOW.hero} width={0.012} opacity={0} />
      </group>

      <Label ref={sensorLabelRef} position={[PHONE.x, PHONE.y + PHONE_H / 2 + 0.32, PHONE.z]} color={PALETTE.signal} opacity={0}>
        Sysmatics · 100 Hz
      </Label>
      <Label ref={igemLabelRef} position={[MEDAL.x - 0.15, MEDAL.y + 0.62, MEDAL.z]} color={PALETTE.starGold} opacity={0}>
        iGEM · Gold
      </Label>
    </group>
  )
}
