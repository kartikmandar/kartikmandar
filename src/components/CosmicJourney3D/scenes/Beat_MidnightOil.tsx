// src/components/CosmicJourney3D/scenes/Beat_MidnightOil.tsx
'use client'

// Beat 14 · Doubling Down (Act III, ignition).
// A night timelapse at a desk. An architect's lamp made of light burns the whole
// night through, pouring a warm cone onto a laptop, while the sky's stars wheel
// slowly about the pole and the horizon passes from dusk to the first blue of
// dawn. From the laptop a commit graph grows like a vine: across the desk, up
// and around the pedestal of a radio dish silhouette, and round the dish's rim,
// with feature branches leaving and merging back, each commit popping into light.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { createHoloMaterial, createRimMaterial, getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, seeded } from '../art/anim'

const DESK_Y = -0.75
const GROUND_Y = -0.9
// Lamp (Anglepoise): base, elbow, head; it aims at the laptop.
const LAMP_BASE = new THREE.Vector3(-3.1, DESK_Y, -0.9)
const LAMP_ELBOW = new THREE.Vector3(-3.4, 0.75, -1.0)
const LAMP_HEAD = new THREE.Vector3(-2.0, 1.35, -0.8)
const POOL = new THREE.Vector3(-1.25, DESK_Y, -0.45)
const SHADE_LEN = 0.42
// Laptop on the desk.
const LAPTOP = new THREE.Vector3(-1.0, DESK_Y, -0.55)
const LAPTOP_W = 1.0
const LAPTOP_D = 0.65
const SCREEN_TILT = 0.3
// Radio dish silhouette: pedestal axis and an up-tilted paraboloid.
const DISH_X = 2.3
const DISH_Z = -2.2
const PEDESTAL_TOP = 0.75
const DISH_VERTEX = new THREE.Vector3(DISH_X, 1.05, DISH_Z)
const DISH_AXIS = new THREE.Vector3(-0.45, 0.8, 0.55).normalize()
const DISH_R = 1.2
const DISH_F = 0.55
// The pole the sky wheels around (tilted, up and back).
const POLE = new THREE.Vector3(0.25, 0.85, -0.45).normalize()
const SKY_CENTER = new THREE.Vector3(0, 0, -6)

// Dish basis vectors (perpendicular to the axis).
const DISH_B1 = new THREE.Vector3().crossVectors(DISH_AXIS, new THREE.Vector3(0, 0, 1)).normalize()
const DISH_B2 = new THREE.Vector3().crossVectors(DISH_AXIS, DISH_B1).normalize()

function dishPoint(r: number, phi: number): THREE.Vector3 {
  return DISH_VERTEX.clone()
    .addScaledVector(DISH_AXIS, (r * r) / (4 * DISH_F))
    .addScaledVector(DISH_B1, r * Math.cos(phi))
    .addScaledVector(DISH_B2, r * Math.sin(phi))
}

// Dish silhouette: rim, an inner ring, ribs, feed legs, pedestal truss and yoke.
function dishPoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const seg = (a: THREE.Vector3, b: THREE.Vector3) => pts.push(a, b)
  for (const [r, n] of [[DISH_R, 64], [DISH_R * 0.55, 40]] as const) {
    for (let i = 0; i < n; i++) seg(dishPoint(r, (i / n) * Math.PI * 2), dishPoint(r, ((i + 1) / n) * Math.PI * 2))
  }
  for (let k = 0; k < 8; k++) {
    const phi = (k / 8) * Math.PI * 2
    for (let i = 0; i < 6; i++) seg(dishPoint((i / 6) * DISH_R, phi), dishPoint(((i + 1) / 6) * DISH_R, phi))
  }
  const focus = DISH_VERTEX.clone().addScaledVector(DISH_AXIS, DISH_F)
  for (let k = 0; k < 3; k++) seg(dishPoint(DISH_R * 0.98, (k / 3) * Math.PI * 2 + 0.5), focus)
  // pedestal: tapered truss with cross braces
  const at = (x: number, y: number) => new THREE.Vector3(DISH_X + x, y, DISH_Z)
  const levels = 5
  const halfAt = (f: number) => 0.28 - 0.17 * f
  for (let i = 0; i < levels; i++) {
    const f0 = i / levels
    const f1 = (i + 1) / levels
    const y0 = GROUND_Y + (PEDESTAL_TOP - GROUND_Y) * f0
    const y1 = GROUND_Y + (PEDESTAL_TOP - GROUND_Y) * f1
    seg(at(-halfAt(f0), y0), at(-halfAt(f1), y1))
    seg(at(halfAt(f0), y0), at(halfAt(f1), y1))
    seg(at(-halfAt(f0), y0), at(halfAt(f1), y1))
    seg(at(halfAt(f0), y0), at(-halfAt(f1), y1))
  }
  seg(at(-0.5, GROUND_Y), at(0.5, GROUND_Y))
  // yoke up to the dish
  seg(at(-halfAt(1), PEDESTAL_TOP), DISH_VERTEX.clone().addScaledVector(DISH_B1, -0.18))
  seg(at(halfAt(1), PEDESTAL_TOP), DISH_VERTEX.clone().addScaledVector(DISH_B1, 0.18))
  return pts
}

// Lamp: arms, a spring along each arm, the base disc.
function lampPoints(): { arms: THREE.Vector3[]; detail: THREE.Vector3[] } {
  const arms = [LAMP_BASE.clone().setY(DESK_Y + 0.06), LAMP_ELBOW, LAMP_HEAD]
  const detail: THREE.Vector3[] = []
  const seg = (a: THREE.Vector3, b: THREE.Vector3) => detail.push(a, b)
  for (let i = 0; i < 32; i++) {
    const a0 = (i / 32) * Math.PI * 2
    const a1 = ((i + 1) / 32) * Math.PI * 2
    seg(
      new THREE.Vector3(LAMP_BASE.x + Math.cos(a0) * 0.32, DESK_Y + 0.01, LAMP_BASE.z + Math.sin(a0) * 0.22),
      new THREE.Vector3(LAMP_BASE.x + Math.cos(a1) * 0.32, DESK_Y + 0.01, LAMP_BASE.z + Math.sin(a1) * 0.22),
    )
  }
  // zig-zag springs running alongside each arm
  const spring = (a: THREE.Vector3, b: THREE.Vector3, side: THREE.Vector3) => {
    const coils = 14
    let prev = a.clone().lerp(b, 0.2).addScaledVector(side, 0.06)
    for (let i = 1; i <= coils; i++) {
      const f = 0.2 + (0.4 * i) / coils
      const next = a.clone().lerp(b, f).addScaledVector(side, i % 2 === 0 ? 0.06 : 0.1)
      seg(prev, next)
      prev = next
    }
  }
  spring(arms[0]!, LAMP_ELBOW, new THREE.Vector3(1, 0.1, 0).normalize())
  spring(LAMP_ELBOW, LAMP_HEAD, new THREE.Vector3(0, 1, 0))
  return { arms, detail }
}

// Laptop: base outline and the screen frame (segments).
function laptopPoints(): THREE.Vector3[] {
  const hw = LAPTOP_W / 2
  const hd = LAPTOP_D / 2
  const y = DESK_Y + 0.01
  const c = LAPTOP
  const corners = [
    new THREE.Vector3(c.x - hw, y, c.z + hd), new THREE.Vector3(c.x + hw, y, c.z + hd),
    new THREE.Vector3(c.x + hw, y, c.z - hd), new THREE.Vector3(c.x - hw, y, c.z - hd),
  ]
  const top = (v: THREE.Vector3) => v.clone().add(new THREE.Vector3(0, Math.cos(SCREEN_TILT) * 0.62, -Math.sin(SCREEN_TILT) * 0.62))
  const pts: THREE.Vector3[] = []
  for (let i = 0; i < 4; i++) pts.push(corners[i]!, corners[(i + 1) % 4]!)
  pts.push(corners[3]!, top(corners[3]!), corners[2]!, top(corners[2]!), top(corners[3]!), top(corners[2]!))
  // keyboard hint
  for (let r = 0; r < 3; r++) {
    const z = c.z - hd + 0.15 + r * 0.09
    pts.push(new THREE.Vector3(c.x - hw + 0.12, y, z), new THREE.Vector3(c.x + hw - 0.12, y, z))
  }
  return pts
}

// Even-arc-length resample of a polyline.
function resample(src: THREE.Vector3[], n: number): THREE.Vector3[] {
  const cum = [0]
  for (let i = 1; i < src.length; i++) cum.push(cum[i - 1]! + src[i]!.distanceTo(src[i - 1]!))
  const total = cum[cum.length - 1]!
  const out: THREE.Vector3[] = []
  let j = 1
  for (let i = 0; i <= n; i++) {
    const d = (i / n) * total
    while (j < src.length - 1 && cum[j]! < d) j++
    const span = cum[j]! - cum[j - 1]! || 1
    out.push(src[j - 1]!.clone().lerp(src[j]!, (d - cum[j - 1]!) / span))
  }
  return out
}

interface Vine {
  main: THREE.Vector3[]
  branches: THREE.Vector3[]
  /** Main-path parameter at which each branch segment starts (ascending). */
  branchS: Float32Array
  nodes: { position: Float32Array; delay: Float32Array; kind: Float32Array }
}

// The commit graph: main runs desk -> pedestal helix -> along a rib -> around the rim.
function vine(): Vine {
  const raw: THREE.Vector3[] = []
  const phi0 = (3 * Math.PI) / 4
  const helixR = (f: number) => 0.36 - 0.18 * f
  const lead = new THREE.CatmullRomCurve3([
    new THREE.Vector3(LAPTOP.x + LAPTOP_W / 2 + 0.05, DESK_Y + 0.02, LAPTOP.z - 0.05),
    new THREE.Vector3(0.25, DESK_Y + 0.01, -1.05),
    new THREE.Vector3(1.25, GROUND_Y + 0.06, -1.65),
    new THREE.Vector3(DISH_X + helixR(0) * Math.cos(phi0), GROUND_Y + 0.04, DISH_Z + helixR(0) * Math.sin(phi0)),
  ])
  raw.push(...lead.getPoints(60))
  const turns = 2.3
  for (let j = 1; j <= 160; j++) {
    const f = j / 160
    const phi = phi0 - f * Math.PI * 2 * turns
    raw.push(new THREE.Vector3(
      DISH_X + helixR(f) * Math.cos(phi),
      GROUND_Y + 0.04 + (PEDESTAL_TOP - GROUND_Y - 0.04) * f,
      DISH_Z + helixR(f) * Math.sin(phi),
    ))
  }
  // up the yoke to the vertex, out along a rib, then around the rim
  const ribPhi = Math.PI * 1.15
  raw.push(DISH_VERTEX.clone().addScaledVector(DISH_AXIS, 0.05))
  for (let i = 1; i <= 24; i++) raw.push(dishPoint((i / 24) * DISH_R * 0.99, ribPhi).addScaledVector(DISH_AXIS, 0.03))
  for (let i = 1; i <= 120; i++) raw.push(dishPoint(DISH_R * 0.99, ribPhi + (i / 120) * Math.PI * 2 * 0.92).addScaledVector(DISH_AXIS, 0.03))

  const n = 520
  const main = resample(raw, n)
  const up = new THREE.Vector3(0, 1, 0)
  const tangent = new THREE.Vector3()
  const outward = (i: number, out: THREE.Vector3) => {
    tangent.subVectors(main[Math.min(n, i + 1)]!, main[Math.max(0, i - 1)]!).normalize()
    out.crossVectors(tangent, up)
    if (out.lengthSq() < 1e-4) out.crossVectors(tangent, DISH_AXIS)
    return out.normalize()
  }

  // Feature branches: leave main at sA, run alongside, merge back at sB.
  const branches: THREE.Vector3[] = []
  const branchS: number[] = []
  const nodePos: number[] = []
  const nodeDelay: number[] = []
  const nodeKind: number[] = []
  const starts = [0.07, 0.16, 0.25, 0.34, 0.43, 0.52, 0.61, 0.7, 0.79, 0.88]
  const dir = new THREE.Vector3()
  starts.forEach((sA, b) => {
    const len = 0.035 + 0.03 * seeded(b, 61)
    const amp = (0.1 + 0.07 * seeded(b, 62)) * (b % 2 === 0 ? 1 : -1)
    const steps = 12
    let prev: THREE.Vector3 | null = null
    for (let k = 0; k <= steps; k++) {
      const s = sA + (k / steps) * len
      const i = Math.round(s * n)
      const lift = Math.sin((Math.PI * k) / steps)
      const pt = main[i]!.clone().addScaledVector(outward(i, dir), amp * lift)
      if (prev) {
        branches.push(prev, pt)
        branchS.push(sA + ((k - 1) / steps) * len)
      }
      prev = pt
      if (k === steps / 2) {
        nodePos.push(pt.x, pt.y, pt.z)
        nodeDelay.push(s)
        nodeKind.push(1)
      }
    }
  })
  // Commits on main.
  const commits = 44
  for (let c = 1; c <= commits; c++) {
    const s = c / (commits + 1)
    const pt = main[Math.round(s * n)]!
    nodePos.push(pt.x, pt.y, pt.z)
    nodeDelay.push(s)
    nodeKind.push(0)
  }
  return {
    main,
    branches,
    branchS: Float32Array.from(branchS),
    nodes: { position: Float32Array.from(nodePos), delay: Float32Array.from(nodeDelay), kind: Float32Array.from(nodeKind) },
  }
}

const PLANE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Commit nodes pop into light as the vine reaches them.
const NODE_VERT = /* glsl */ `
  attribute float aDelay;
  attribute float aKind;
  uniform float uGrow;
  uniform float uSize;
  varying float vLit;
  varying float vPop;
  varying float vKind;
  void main() {
    vLit = smoothstep(aDelay, aDelay + 0.006, uGrow);
    vPop = vLit * exp(-pow((uGrow - aDelay) / 0.025, 2.0));
    vKind = aKind;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * vLit * (1.0 + 1.8 * vPop) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const NODE_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uMain;
  uniform vec3 uBranch;
  uniform vec3 uPop;
  varying float vLit;
  varying float vPop;
  varying float vKind;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    vec3 col = mix(uMain, uBranch, vKind) + uPop * vPop;
    gl_FragColor = vec4(col * a * vLit, 1.0);
  }
`

// Stars on a dome, wheeling about the pole (rotation applied to the parent group).
const STAR_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  varying float vSeed;
  varying float vTw;
  void main() {
    vSeed = aSeed;
    vTw = 0.8 + 0.2 * sin(uTime * (0.6 + aSeed * 1.4) + aSeed * 40.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (0.5 + 1.2 * aSeed * aSeed) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const STAR_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uCold;
  uniform vec3 uWarm;
  uniform float uOpacity;
  varying float vSeed;
  varying float vTw;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    vec3 col = mix(uCold, uWarm, step(0.85, fract(vSeed * 7.31)));
    gl_FragColor = vec4(col * a * vTw * (0.35 + 0.75 * vSeed) * uOpacity, 1.0);
  }
`

// Horizon glow: the timelapse's dusk-to-dawn grade, low and faint.
const HORIZON_FRAG = /* glsl */ `
  uniform vec3 uDusk;
  uniform vec3 uDawn;
  uniform float uDuskAmt;
  uniform float uDawnAmt;
  varying vec2 vUv;
  void main() {
    float glow = exp(-vUv.y * 5.0) * smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
    vec3 col = (uDusk * uDuskAmt + uDawn * uDawnAmt) * glow;
    gl_FragColor = vec4(col, 1.0);
  }
`

// The lamp's beam: brightest near the shade, soft at its edges (view-facing core).
const BEAM_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const BEAM_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float facing = pow(abs(dot(normalize(vNormal), normalize(vView))), 1.6);
    float along = mix(0.35, 1.0, vUv.y);
    gl_FragColor = vec4(uColor * facing * along * uOpacity, 1.0);
  }
`

const POOL_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec2 q = (vUv - 0.5) * 2.0;
    float r = length(q);
    float pool = exp(-r * r * 3.5) * (1.0 - smoothstep(0.85, 1.0, r));
    gl_FragColor = vec4(uColor * pool * uOpacity, 1.0);
  }
`

function starGeometry(count: number): THREE.BufferGeometry {
  const pos = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    // mostly the upper sky; positions are relative to the rotating group
    const u = seeded(i, 71) * 1.2 - 0.2
    const a = seeded(i, 72) * Math.PI * 2
    const s = Math.sqrt(1 - u * u)
    const r = 17 + seeded(i, 73) * 4
    pos[i * 3] = s * Math.cos(a) * r
    pos[i * 3 + 1] = u * r
    pos[i * 3 + 2] = s * Math.sin(a) * r
    seed[i] = seeded(i, 74)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  return g
}

// Module-level scratch.
const _quat = new THREE.Quaternion()
const _pos = new THREE.Vector3()
const _shadeDir = new THREE.Vector3().subVectors(POOL, LAMP_HEAD).normalize()
const SHADE_QUAT = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), _shadeDir)
const SHADE_CENTER = LAMP_HEAD.clone().addScaledVector(_shadeDir, SHADE_LEN / 2)
const SHADE_MOUTH = LAMP_HEAD.clone().addScaledVector(_shadeDir, SHADE_LEN)
const BULB = LAMP_HEAD.clone().addScaledVector(_shadeDir, SHADE_LEN * 0.72)
const BEAM_LEN = SHADE_MOUTH.distanceTo(POOL)
const BEAM_CENTER = SHADE_MOUTH.clone().addScaledVector(_shadeDir, BEAM_LEN / 2)
const DISH_FOCUS = DISH_VERTEX.clone().addScaledVector(DISH_AXIS, DISH_F)
const DISH_TOP = dishPoint(DISH_R, Math.PI / 2)

type TextMesh = THREE.Mesh & { fillOpacity: number }

export default function Beat_MidnightOil({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const starsRef = useRef<THREE.Points>(null)
  const skyRef = useRef<THREE.Group>(null)
  const horizonRef = useRef<THREE.Mesh>(null)
  const bulbRef = useRef<THREE.Sprite>(null)
  const haloRef = useRef<THREE.Sprite>(null)
  const beamRef = useRef<THREE.Mesh>(null)
  const poolRef = useRef<THREE.Mesh>(null)
  const screenRef = useRef<THREE.Mesh>(null)
  const dishRef = useRef<LightLineObject>(null)
  const mainRef = useRef<LightLineObject>(null)
  const branchRef = useRef<LightLineObject>(null)
  const nodesRef = useRef<THREE.Points>(null)
  const headRef = useRef<THREE.Sprite>(null)
  const labelRef = useRef<TextMesh>(null)

  const dish = useMemo(() => dishPoints(), [])
  const lamp = useMemo(() => lampPoints(), [])
  const laptop = useMemo(() => laptopPoints(), [])
  const graph = useMemo(() => vine(), [])
  const desk = useMemo(() => [
    new THREE.Vector3(-4.4, DESK_Y, 0.3), new THREE.Vector3(0.7, DESK_Y, 0.3),
    new THREE.Vector3(-4.2, DESK_Y, -1.7), new THREE.Vector3(0.5, DESK_Y, -1.7),
    new THREE.Vector3(0.7, DESK_Y, 0.3), new THREE.Vector3(0.5, DESK_Y, -1.7),
  ], [])

  const starCount = quality === 'mobile' ? 100 : quality === 'low' ? 200 : 400
  const starGeo = useDisposable(() => starGeometry(starCount), [starCount])
  const starMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uTime: { value: 0 },
      uSize: { value: 120 },
      uOpacity: { value: 0 },
      uCold: { value: hdr(PALETTE.stellarBlue, 1.0) },
      uWarm: { value: hdr(PALETTE.starGold, 1.0) },
    },
    vertexShader: STAR_VERT,
    fragmentShader: STAR_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))
  const horizonMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uDusk: { value: hdr(PALETTE.emberDeep, 0.3) },
      uDawn: { value: hdr(PALETTE.stellarBlue, 0.32) },
      uDuskAmt: { value: 1 },
      uDawnAmt: { value: 0 },
    },
    vertexShader: PLANE_VERT,
    fragmentShader: HORIZON_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))
  const shadeMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.starGold, 0.12),
    rim: hdr(PALETTE.starGold, GLOW.hero),
    power: 1.8,
    additive: true,
  }))
  const beamMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: { uColor: { value: hdr(PALETTE.starGold, 0.32) }, uOpacity: { value: 1 } },
    vertexShader: BEAM_VERT,
    fragmentShader: BEAM_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  }))
  const poolMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: { uColor: { value: hdr(PALETTE.starGold, 0.55) }, uOpacity: { value: 1 } },
    vertexShader: PLANE_VERT,
    fragmentShader: POOL_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))
  const screenMat = useDisposable(() => createHoloMaterial(hdr(PALETTE.signal, 0.7)))
  const nodeGeo = useDisposable(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(graph.nodes.position, 3))
    g.setAttribute('aDelay', new THREE.BufferAttribute(graph.nodes.delay, 1))
    g.setAttribute('aKind', new THREE.BufferAttribute(graph.nodes.kind, 1))
    return g
  }, [graph])
  const nodeMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uGrow: { value: 0 },
      uSize: { value: 30 },
      uMain: { value: hdr(PALETTE.signal, 1.2) },
      uBranch: { value: hdr(PALETTE.starGold, 1.4) },
      uPop: { value: hdr(PALETTE.nearWhite, GLOW.hero) },
    },
    vertexShader: NODE_VERT,
    fragmentShader: NODE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const clock = beat.clock
    const t = reducedMotion ? 0 : clock

    // The night passes: the sky wheels mostly with scroll (the timelapse), a touch with time.
    const night = ease(p, 0.0, 1.0)
    const sky = skyRef.current
    if (sky) {
      _quat.setFromAxisAngle(POLE, -0.15 - night * 0.55 - t * 0.006)
      sky.quaternion.copy(_quat)
    }
    setUniform(starsRef.current, 'uTime', t)
    setUniform(starsRef.current, 'uOpacity', ease(p, 0.0, 0.2) * (1 - 0.5 * ease(p, 0.82, 1.0)))
    setUniform(horizonRef.current, 'uDuskAmt', 1 - ease(p, 0.05, 0.35))
    setUniform(horizonRef.current, 'uDawnAmt', ease(p, 0.72, 1.0))

    // The lamp burns all night, breathing slowly.
    const breathe = 0.93 + 0.07 * Math.sin(t * 0.7)
    const lampOn = ease(p, 0.0, 0.12)
    const bulb = bulbRef.current
    if (bulb) (bulb.material as THREE.SpriteMaterial).opacity = lampOn * breathe
    const halo = haloRef.current
    if (halo) (halo.material as THREE.SpriteMaterial).opacity = lampOn * breathe * 0.55
    setUniform(beamRef.current, 'uOpacity', lampOn * breathe)
    setUniform(poolRef.current, 'uOpacity', lampOn * breathe)
    setUniform(screenRef.current, 'uOpacity', lampOn)
    setUniform(screenRef.current, 'uTime', t)
    setLineOpacity(dishRef.current, ease(p, 0.04, 0.2))

    // The commit graph grows through the hold.
    const grow = ease(p, 0.17, 0.8)
    setLineReveal(mainRef.current, grow)
    const branchS = graph.branchS
    let shown = 0
    while (shown < branchS.length && branchS[shown]! <= grow) shown++
    setLineReveal(branchRef.current, shown / branchS.length)
    setUniform(nodesRef.current, 'uGrow', grow)
    const head = headRef.current
    if (head) {
      const main = graph.main
      const f = grow * (main.length - 1)
      const i = Math.min(main.length - 2, Math.floor(f))
      _pos.lerpVectors(main[i]!, main[i + 1]!, f - i)
      head.position.copy(_pos)
      ;(head.material as THREE.SpriteMaterial).opacity = grow > 0.001 ? 0.9 * (1 - 0.6 * ease(p, 0.8, 0.9)) : 0
    }
    if (labelRef.current) labelRef.current.fillOpacity = ease(p, 0.7, 0.82) * 0.8
  })

  return (
    <group>
      {/* Night sky, wheeling about the pole; the horizon goes dusk to dawn */}
      <group ref={skyRef} position={SKY_CENTER}>
        <points ref={starsRef} geometry={starGeo} material={starMat} frustumCulled={false} />
      </group>
      <mesh ref={horizonRef} material={horizonMat} position={[0, 1.6, -11]}>
        <planeGeometry args={[30, 8]} />
      </mesh>

      {/* Desk, laptop */}
      <LightLine points={desk} segments color={PALETTE.nearWhite} intensity={GLOW.dim} width={0.01} />
      <LightLine points={laptop} segments color={PALETTE.nearWhite} intensity={0.7} width={0.01} />
      <mesh
        ref={screenRef}
        material={screenMat}
        position={[LAPTOP.x, DESK_Y + Math.cos(SCREEN_TILT) * 0.31, LAPTOP.z - LAPTOP_D / 2 - Math.sin(SCREEN_TILT) * 0.31]}
        rotation={[-SCREEN_TILT, 0, 0]}
      >
        <planeGeometry args={[LAPTOP_W - 0.08, 0.56]} />
      </mesh>

      {/* The lamp, made of light */}
      <LightLine points={lamp.arms} color={PALETTE.nearWhite} intensity={GLOW.base} width={0.02} />
      <LightLine points={lamp.detail} segments color={PALETTE.nearWhite} intensity={0.6} width={0.009} />
      <mesh position={SHADE_CENTER} quaternion={SHADE_QUAT} material={shadeMat}>
        <coneGeometry args={[0.3, SHADE_LEN, 40, 1, true]} />
      </mesh>
      <GlowSprite ref={haloRef} position={[BULB.x, BULB.y, BULB.z]} color={PALETTE.starGold} intensity={GLOW.hero} size={1.6} opacity={0} />
      <GlowSprite ref={bulbRef} position={[BULB.x, BULB.y, BULB.z]} color={PALETTE.ember} intensity={GLOW.hot} size={0.42} opacity={0} />
      <mesh ref={beamRef} position={BEAM_CENTER} quaternion={SHADE_QUAT} material={beamMat}>
        <coneGeometry args={[0.95, BEAM_LEN, 48, 1, true]} />
      </mesh>
      <mesh ref={poolRef} material={poolMat} position={[POOL.x, DESK_Y + 0.005, POOL.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 1.7]} />
      </mesh>

      {/* Radio dish silhouette */}
      <LightLine ref={dishRef} points={dish} segments color={PALETTE.stellarBlue} intensity={0.55} width={0.011} opacity={0} />
      <GlowSprite position={[DISH_FOCUS.x, DISH_FOCUS.y, DISH_FOCUS.z]} color={PALETTE.stellarBlue} intensity={1.2} size={0.3} opacity={0.5} />

      {/* The commit graph, growing like a vine */}
      <LightLine ref={mainRef} points={graph.main} color={PALETTE.signal} intensity={1.6} width={0.016} />
      <LightLine ref={branchRef} points={graph.branches} segments color={PALETTE.starGold} intensity={1.1} width={0.01} />
      <points ref={nodesRef} geometry={nodeGeo} material={nodeMat} frustumCulled={false} />
      <GlowSprite ref={headRef} color={PALETTE.signal} intensity={GLOW.hero} size={0.5} opacity={0} />

      <Label ref={labelRef} position={[DISH_TOP.x, DISH_TOP.y + 0.35, DISH_TOP.z]} color={PALETTE.signal} opacity={0}>
        RRIVis
      </Label>
    </group>
  )
}
