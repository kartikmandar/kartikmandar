// src/components/CosmicJourney3D/scenes/Beat_Reconcile.tsx
'use client'

// Beat 25 · Systems That Can't Make Things Up (Act IV, widening).
// Left: a bank statement made of light unrolls from its roll as a ribbon of
// number-like glyph bars (no real text). Centre: the running-balance residual
// draws on as a nervous line, then snaps flat to zero and an equals sign glows;
// the statement's balance column turns gold row by row as it is verified.
// Right: report pages are swept by a scan beam; figures lift off the pages with
// small page-number tags and settle above them. Behind, a GPU monolith sits
// inside a sealed ring with a small lock: the models are self-hosted.

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { createRimMaterial, setUniform, useDisposable } from '../art/materials'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, pulse, ramp, seeded } from '../art/anim'

// Statement ribbon: hangs from a roll at the top left and curves toward the camera.
const RIBBON_X = -2.85
const RIBBON_W = 1.7
const RIBBON_TOP = 3.22
const RIBBON_DROP = 3.9
const RIBBON_Z0 = -2.6
const RIBBON_DZ = 2.6
const RIBBON_LEN = 4.7
const ROW_PITCH = 0.14

// Residual trace.
const RES_X0 = -1.7
const RES_X1 = 0.65
const RES_Y = 1.75
const RES_Z = -0.8
const RES_AMP = 0.3

// Pages, figures, monolith.
const PAGE_W = 0.9
const PAGE_H = 1.2
const PAGES = [
  new THREE.Vector3(1.75, 0.7, -0.7),
  new THREE.Vector3(2.5, 0.78, -1.1),
  new THREE.Vector3(3.25, 0.86, -1.5),
] as const
const PAGE_SCAN_STEP = 0.25
const PAGE_SCAN_SPAN = 0.5
const FIGURE_ROWS = [2, 5, 8] as const
const PAGE_ROW_PITCH = 0.1
const PAGE_TOP_PAD = 0.1
const FIGURE_COUNT = PAGES.length * FIGURE_ROWS.length
const MONOLITH = new THREE.Vector3(3.55, 0.6, -3.6)
const SEAL_Y = 0.9
const SEAL_RADIUS = 0.78
const LOCK = new THREE.Vector3(MONOLITH.x, SEAL_Y, MONOLITH.z + SEAL_RADIUS + 0.04)

const RIBBON_VERT = /* glsl */ `
  varying vec2 vUv;
  varying float vS;
  void main() {
    vUv = uv;
    float s = 1.0 - uv.y;
    vS = s;
    vec3 p = vec3(
      ${RIBBON_X.toFixed(2)} + (uv.x - 0.5) * ${RIBBON_W.toFixed(2)} + 0.18 * sin(s * 3.5),
      ${RIBBON_TOP.toFixed(2)} - ${RIBBON_DROP.toFixed(2)} * s,
      ${RIBBON_Z0.toFixed(2)} + ${RIBBON_DZ.toFixed(2)} * s * s
    );
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

// Paper coordinate q runs from the free end, so the rows travel down as the
// statement unrolls. Rows: date, description, amount, running balance.
const RIBBON_FRAG = /* glsl */ `
  uniform float uUnroll;
  uniform float uVerified;
  uniform float uOpacity;
  uniform vec3 uEdge;
  uniform vec3 uInk;
  uniform vec3 uGold;
  uniform vec3 uHot;
  varying vec2 vUv;
  varying float vS;
  float h11(float n) { return fract(sin(n * 12.9898) * 43758.5453); }
  float span(float x, float a, float b) { return step(a, x) * step(x, b); }
  void main() {
    if (vS > uUnroll) discard;
    float q = (uUnroll - vS) * ${RIBBON_LEN.toFixed(2)};
    float wx = vUv.x * ${RIBBON_W.toFixed(2)};
    float d = min(wx, ${RIBBON_W.toFixed(2)} - wx);
    float edge = 1.0 - smoothstep(0.0, 0.008 + fwidth(d) * 1.2, d);
    float freeEnd = 1.0 - smoothstep(0.0, 0.014 + fwidth(q) * 1.2, q);

    float rq = (q - 0.08) / ${ROW_PITCH.toFixed(2)};
    float row = floor(rq);
    float fy = fract(rq);
    float band = smoothstep(0.34, 0.38, fy) * (1.0 - smoothstep(0.62, 0.66, fy)) * step(0.08, q);
    float cells = step(0.24, fract(wx / 0.048));
    float x = vUv.x;
    float date = span(x, 0.05, 0.15);
    float desc = span(x, 0.2, 0.32 + 0.22 * h11(row * 2.3 + 0.7));
    float amount = span(x, 0.72 - (0.06 + 0.08 * h11(row * 5.1 + 1.3)), 0.72);
    float balance = span(x, 0.95 - (0.11 + 0.04 * h11(row * 3.7 + 2.9)), 0.95);
    float ink = (date * 0.6 + desc + amount) * band * cells;
    float bal = balance * band * cells;
    float verified = step(row + 0.5, uVerified);

    vec3 col = uEdge * (edge + 0.035) + uHot * freeEnd * 0.25;
    col += uInk * ink + mix(uInk, uGold, verified) * bal;
    // the newest paper, near the roll, fades into it
    col *= smoothstep(0.0, 0.05, vS) * 0.85 + 0.15;
    gl_FragColor = vec4(col * uOpacity, 1.0);
  }
`

// The residual as a world-width hairline whose wiggle collapses to zero.
const RESIDUAL_VERT = /* glsl */ `
  uniform float uSnap;
  varying vec2 vUv;
  float res(float u) {
    float env = smoothstep(0.0, 0.08, u);
    return env * (0.5 * sin(u * 9.0 + 1.3) + 0.25 * sin(u * 23.0 + 0.2) + 0.4 * sin(u * 4.1));
  }
  float dres(float u) {
    float env = smoothstep(0.0, 0.08, u);
    return env * (4.5 * cos(u * 9.0 + 1.3) + 5.75 * cos(u * 23.0 + 0.2) + 1.64 * cos(u * 4.1));
  }
  void main() {
    vUv = uv;
    float u = uv.x;
    float k = ${RES_AMP.toFixed(2)} * (1.0 - uSnap);
    float width = ${(RES_X1 - RES_X0).toFixed(3)};
    vec2 c = vec2(${RES_X0.toFixed(2)} + u * width, ${RES_Y.toFixed(2)} + k * res(u));
    vec2 n = normalize(vec2(-k * dres(u) / width, 1.0));
    c += n * (uv.y - 0.5) * 0.05;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(c, ${RES_Z.toFixed(2)}, 1.0);
  }
`

const RESIDUAL_FRAG = /* glsl */ `
  uniform float uDraw;
  uniform float uSnap;
  uniform float uOpacity;
  uniform vec3 uWiggle;
  uniform vec3 uZero;
  uniform vec3 uHot;
  varying vec2 vUv;
  void main() {
    if (vUv.x > uDraw) discard;
    float core = exp(-pow((vUv.y - 0.5) / 0.2, 2.0));
    vec3 col = mix(uWiggle, uZero, uSnap) * core;
    // the pen tip while it draws
    float tip = exp(-pow((vUv.x - uDraw) / 0.012, 2.0)) * (1.0 - step(0.999, uDraw));
    col += uHot * tip * core;
    gl_FragColor = vec4(col * uOpacity, 1.0);
  }
`

const PAGE_VERT = /* glsl */ `
  attribute float aDelay;
  attribute float aSeed;
  uniform float uScan;
  varying vec2 vUv;
  varying float vScan;
  varying float vSeed;
  void main() {
    vUv = uv;
    vSeed = aSeed;
    vScan = clamp((uScan - aDelay) / ${PAGE_SCAN_SPAN.toFixed(2)}, 0.0, 1.0);
    vec4 p = vec4(position, 1.0);
    #ifdef USE_INSTANCING
      p = instanceMatrix * p;
    #endif
    gl_Position = projectionMatrix * modelViewMatrix * p;
  }
`

// Report page: glyph rows; the figure rows hold a brighter amount that leaves an
// empty outlined slot once the scan beam has passed and the figure has lifted.
const PAGE_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uEdge;
  uniform vec3 uInk;
  uniform vec3 uFigure;
  uniform vec3 uBeam;
  varying vec2 vUv;
  varying float vScan;
  varying float vSeed;
  float h11(float n) { return fract(sin(n * 12.9898) * 43758.5453); }
  void main() {
    vec2 w = vUv * vec2(${PAGE_W.toFixed(2)}, ${PAGE_H.toFixed(2)});
    vec2 e2 = min(w, vec2(${PAGE_W.toFixed(2)}, ${PAGE_H.toFixed(2)}) - w);
    float d = min(e2.x, e2.y);
    float edge = 1.0 - smoothstep(0.0, 0.007 + fwidth(d) * 1.2, d);

    float top = ${PAGE_H.toFixed(2)} - w.y - ${PAGE_TOP_PAD.toFixed(2)};
    float row = floor(top / ${PAGE_ROW_PITCH.toFixed(2)});
    float fy = fract(top / ${PAGE_ROW_PITCH.toFixed(2)});
    float band = step(0.36, fy) * step(fy, 0.64) * step(0.0, top) * step(0.08, w.y);
    float cells = step(0.24, fract(w.x / 0.04));
    float x = vUv.x;
    float isFigure = (1.0 - step(0.5, abs(row - 2.0))) + (1.0 - step(0.5, abs(row - 5.0))) + (1.0 - step(0.5, abs(row - 8.0)));
    float textLen = 0.12 + 0.3 * h11(row * 1.9 + vSeed * 11.0);
    float text = step(0.08, x) * step(x, 0.08 + textLen);
    float amount = step(0.62, x) * step(x, 0.82);
    // beam position in the same "from the top" coordinate
    float beamTop = vScan * ${PAGE_H.toFixed(2)};
    float passed = step(top + ${(PAGE_ROW_PITCH * 0.5).toFixed(2)}, beamTop);
    float ink = text * band * cells + amount * band * cells * (1.0 - isFigure);
    float fig = amount * band * cells * isFigure * (1.0 - passed);
    // empty slot left behind by a lifted figure
    float slotBox = step(0.6, x) * step(x, 0.84) * step(0.26, fy) * step(fy, 0.74) * isFigure * passed * step(0.0, top);
    float slotEdge = slotBox * (1.0 - step(0.62, x) * step(x, 0.82) * step(0.34, fy) * step(fy, 0.66));

    float beam = exp(-pow((top - beamTop) / 0.02, 2.0)) * sin(3.14159 * vScan);
    vec3 col = uEdge * (edge + 0.03) + uInk * ink + uFigure * fig + uEdge * slotEdge * 0.6;
    col += uBeam * beam;
    gl_FragColor = vec4(col * uOpacity, 1.0);
  }
`

// Figures (kind 0) and their page tags (kind 1). aState: x visible, y arrived.
const CHIP_VERT = /* glsl */ `
  attribute float aKind;
  attribute float aPage;
  attribute vec2 aState;
  varying vec2 vUv;
  varying float vKind;
  varying float vPage;
  varying vec2 vState;
  varying vec2 vScale;
  void main() {
    vUv = uv;
    vKind = aKind;
    vPage = aPage;
    vState = aState;
    vec4 p = vec4(position, 1.0);
    #ifdef USE_INSTANCING
      p = instanceMatrix * p;
      vScale = vec2(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz));
    #else
      vScale = vec2(1.0);
    #endif
    gl_Position = projectionMatrix * modelViewMatrix * p;
  }
`

const CHIP_FRAG = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uInk;
  uniform vec3 uGold;
  varying vec2 vUv;
  varying float vKind;
  varying float vPage;
  varying vec2 vState;
  varying vec2 vScale;
  void main() {
    if (vState.x < 0.001) discard;
    vec2 w = vUv * vScale;
    vec2 e2 = min(w, vScale - w);
    float d = min(e2.x, e2.y);
    float edge = 1.0 - smoothstep(0.0, 0.006 + fwidth(d) * 1.2, d);
    vec3 col;
    if (vKind < 0.5) {
      float cells = step(0.24, fract(w.x / 0.045)) * step(0.28, vUv.y) * step(vUv.y, 0.72);
      col = mix(uInk, uGold, vState.y) * cells + uGold * edge * 0.25 * vState.y;
    } else {
      // tag: outlined chip with one dot per page number
      float dots = 0.0;
      for (int i = 0; i < 3; i++) {
        float fi = float(i);
        float on = step(fi + 0.5, vPage + 1.0);
        vec2 c = vec2(vScale.x * 0.5 + (fi - vPage * 0.5) * 0.035, vScale.y * 0.5);
        dots += on * (1.0 - smoothstep(0.009, 0.014, length(w - c)));
      }
      col = uGold * (edge * 0.9 + dots * 1.2);
    }
    gl_FragColor = vec4(col * vState.x * uOpacity, 1.0);
  }
`

function pageGeometry(): THREE.PlaneGeometry {
  const g = new THREE.PlaneGeometry(PAGE_W, PAGE_H)
  const delay = new Float32Array(PAGES.length)
  const seed = new Float32Array(PAGES.length)
  for (let i = 0; i < PAGES.length; i++) {
    delay[i] = i * PAGE_SCAN_STEP
    seed[i] = seeded(i, 31)
  }
  g.setAttribute('aDelay', new THREE.InstancedBufferAttribute(delay, 1))
  g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 1))
  return g
}

function chipGeometry(): THREE.PlaneGeometry {
  const g = new THREE.PlaneGeometry(1, 1)
  const n = FIGURE_COUNT * 2
  const kind = new Float32Array(n)
  const page = new Float32Array(n)
  for (let i = 0; i < FIGURE_COUNT; i++) {
    kind[i] = 0
    kind[FIGURE_COUNT + i] = 1
    page[i] = Math.floor(i / FIGURE_ROWS.length)
    page[FIGURE_COUNT + i] = page[i]!
  }
  g.setAttribute('aKind', new THREE.InstancedBufferAttribute(kind, 1))
  g.setAttribute('aPage', new THREE.InstancedBufferAttribute(page, 1))
  const state = new THREE.InstancedBufferAttribute(new Float32Array(n * 2), 2)
  state.setUsage(THREE.DynamicDrawUsage)
  g.setAttribute('aState', state)
  return g
}

// Padlock in local space: body outline (segments). The shackle is a separate arc.
function lockBodyPoints(): THREE.Vector3[] {
  const w = 0.12
  const h = 0.1
  return [
    new THREE.Vector3(-w, -h, 0), new THREE.Vector3(w, -h, 0),
    new THREE.Vector3(w, -h, 0), new THREE.Vector3(w, h, 0),
    new THREE.Vector3(w, h, 0), new THREE.Vector3(-w, h, 0),
    new THREE.Vector3(-w, h, 0), new THREE.Vector3(-w, -h, 0),
    // keyhole
    new THREE.Vector3(0, 0.03, 0), new THREE.Vector3(0, -0.05, 0),
  ]
}

function shacklePoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const r = 0.075
  pts.push(new THREE.Vector3(-r, 0.1, 0))
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI - (i / 16) * Math.PI
    pts.push(new THREE.Vector3(Math.cos(a) * r, 0.18 + Math.sin(a) * r, 0))
  }
  pts.push(new THREE.Vector3(r, 0.1, 0))
  return pts
}

// Module-level scratch: no allocation inside useFrame.
const _obj = new THREE.Object3D()
const _pos = new THREE.Vector3()

type TextMesh = THREE.Mesh & { fillOpacity: number }

export default function Beat_Reconcile({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const ribbonRef = useRef<THREE.Mesh>(null)
  const residualRef = useRef<THREE.Mesh>(null)
  const zeroAxisRef = useRef<LightLineObject>(null)
  const equalsRef = useRef<LightLineObject>(null)
  const equalsGlowRef = useRef<THREE.Sprite>(null)
  const pagesRef = useRef<THREE.InstancedMesh>(null)
  const chipsRef = useRef<THREE.InstancedMesh>(null)
  const rackRef = useRef<LightLineObject>(null)
  const sealRef = useRef<LightLineObject>(null)
  const lockRef = useRef<THREE.Group>(null)
  const shackleRef = useRef<THREE.Group>(null)
  const lockGlowRef = useRef<THREE.Sprite>(null)
  const residualLabelRef = useRef<TextMesh>(null)
  const hostLabelRef = useRef<TextMesh>(null)

  const ribbonGeo = useDisposable(() => new THREE.PlaneGeometry(1, 1, 1, 120))
  const ribbonMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uUnroll: { value: 0 },
      uVerified: { value: 0 },
      uOpacity: { value: 0 },
      uEdge: { value: hdr(PALETTE.starGold, GLOW.base) },
      uInk: { value: hdr(PALETTE.nearWhite, 0.42) },
      uGold: { value: hdr(PALETTE.starGold, 1.3) },
      uHot: { value: hdr(PALETTE.nearWhite, GLOW.hero) },
    },
    vertexShader: RIBBON_VERT,
    fragmentShader: RIBBON_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  }))
  const rollMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.starGold, 0.06),
    rim: hdr(PALETTE.starGold, 1.4),
    power: 2.2,
  }))

  const residualGeo = useDisposable(() => new THREE.PlaneGeometry(1, 1, 200, 1))
  const residualMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uDraw: { value: 0 },
      uSnap: { value: 0 },
      uOpacity: { value: 0 },
      uWiggle: { value: hdr(PALETTE.nearWhite, GLOW.base) },
      uZero: { value: hdr(PALETTE.starGold, GLOW.hero) },
      uHot: { value: hdr(PALETTE.nearWhite, GLOW.hot) },
    },
    vertexShader: RESIDUAL_VERT,
    fragmentShader: RESIDUAL_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  }))

  const pageGeo = useDisposable(pageGeometry)
  const pageMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uScan: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uEdge: { value: hdr(PALETTE.starGold, 0.7) },
      uInk: { value: hdr(PALETTE.nearWhite, 0.3) },
      uFigure: { value: hdr(PALETTE.nearWhite, 0.85) },
      uBeam: { value: hdr(PALETTE.signal, 1.6) },
    },
    vertexShader: PAGE_VERT,
    fragmentShader: PAGE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  }))

  const chipGeo = useDisposable(chipGeometry)
  const chipMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uOpacity: { value: 1 },
      uInk: { value: hdr(PALETTE.nearWhite, 0.85) },
      uGold: { value: hdr(PALETTE.starGold, 1.35) },
    },
    vertexShader: CHIP_VERT,
    fragmentShader: CHIP_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  }))

  const monolithMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.nearWhite, 0.03),
    rim: hdr(PALETTE.starGold, 1.1),
    power: 2.4,
  }))

  useLayoutEffect(() => {
    const mesh = pagesRef.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    PAGES.forEach((page, i) => {
      m.makeTranslation(page.x, page.y, page.z)
      mesh.setMatrixAt(i, m)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [])

  // Where each figure starts (its row on its page) and where it settles above.
  const figurePaths = useMemo(() => {
    const out = new Float32Array(FIGURE_COUNT * 7)
    for (let i = 0; i < FIGURE_COUNT; i++) {
      const pageIndex = Math.floor(i / FIGURE_ROWS.length)
      const rowSlot = i % FIGURE_ROWS.length
      const row = FIGURE_ROWS[rowSlot]!
      const page = PAGES[pageIndex]!
      const fromTop = PAGE_TOP_PAD + (row + 0.5) * PAGE_ROW_PITCH
      const o = i * 7
      out[o] = page.x + (0.72 - 0.5) * PAGE_W
      out[o + 1] = page.y + PAGE_H / 2 - fromTop
      out[o + 2] = page.z + 0.03
      out[o + 3] = 1.65 + pageIndex * 0.72
      out[o + 4] = 2.2 + rowSlot * 0.3
      out[o + 5] = -0.9
      // the scan reaches this row at uScan = page delay + span * (row depth on the page)
      out[o + 6] = pageIndex * PAGE_SCAN_STEP + PAGE_SCAN_SPAN * ((fromTop + PAGE_ROW_PITCH * 0.5) / PAGE_H)
    }
    return out
  }, [])

  const zeroAxis = useMemo(() => [new THREE.Vector3(RES_X0, RES_Y, RES_Z - 0.01), new THREE.Vector3(RES_X1, RES_Y, RES_Z - 0.01)], [])
  const equals = useMemo(() => [
    new THREE.Vector3(RES_X1 + 0.17, RES_Y + 0.065, RES_Z), new THREE.Vector3(RES_X1 + 0.47, RES_Y + 0.065, RES_Z),
    new THREE.Vector3(RES_X1 + 0.17, RES_Y - 0.065, RES_Z), new THREE.Vector3(RES_X1 + 0.47, RES_Y - 0.065, RES_Z),
  ], [])

  // Rack lines across the monolith's front face.
  const rack = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const z = MONOLITH.z + 0.31
    for (let i = 0; i < 9; i++) {
      const y = MONOLITH.y - 1.4 + i * 0.35
      pts.push(new THREE.Vector3(MONOLITH.x - 0.34, y, z), new THREE.Vector3(MONOLITH.x + 0.34, y, z))
    }
    return pts
  }, [])

  // The seal ring around the monolith, starting at its front (where the lock sits).
  const seal = useMemo(() => {
    const n = 96
    return Array.from({ length: n + 1 }, (_, i) => {
      const a = (i / n) * Math.PI * 2
      return new THREE.Vector3(MONOLITH.x + Math.sin(a) * SEAL_RADIUS, SEAL_Y, MONOLITH.z + Math.cos(a) * SEAL_RADIUS)
    })
  }, [])

  const lockBody = useMemo(() => lockBodyPoints(), [])
  const shackle = useMemo(() => shacklePoints(), [])

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock
    const appear = ease(p, 0.0, 0.15)

    // 1 · the statement unrolls; the residual draws on behind it
    const unroll = 0.06 + 0.94 * ease(p, 0.1, 0.5)
    const ribbon = ribbonRef.current
    setUniform(ribbon, 'uUnroll', unroll)
    setUniform(ribbon, 'uOpacity', appear)
    const rows = (unroll * RIBBON_LEN) / ROW_PITCH
    setUniform(ribbon, 'uVerified', ease(p, 0.52, 0.72) * rows)

    const residual = residualRef.current
    setUniform(residual, 'uDraw', ease(p, 0.16, 0.5))
    // 2 · it snaps to zero residual
    const snap = ease(p, 0.5, 0.57)
    setUniform(residual, 'uSnap', snap)
    setUniform(residual, 'uOpacity', appear)
    setLineOpacity(zeroAxisRef.current, ease(p, 0.14, 0.3) * 0.7 * (1 - 0.6 * snap))

    const equalsOn = ease(p, 0.56, 0.62)
    setLineOpacity(equalsRef.current, equalsOn)
    const eqGlow = equalsGlowRef.current
    if (eqGlow) {
      const breathe = reducedMotion ? 0 : 0.08 * Math.sin(t * 1.3)
      ;(eqGlow.material as THREE.SpriteMaterial).opacity = equalsOn * (0.45 + 0.5 * pulse(p, 0.56, 0.74) + breathe)
    }

    // 3 · the pages are read: scan beam, then figures lift off with page tags
    const scan = ramp(p, 0.26, 0.74) * 1.4
    const pages = pagesRef.current
    setUniform(pages, 'uScan', scan)
    setUniform(pages, 'uOpacity', appear)

    const chips = chipsRef.current
    if (chips) {
      const state = chips.geometry.getAttribute('aState') as THREE.InstancedBufferAttribute
      const arr = state.array as Float32Array
      for (let i = 0; i < FIGURE_COUNT; i++) {
        const o = i * 7
        const start = figurePaths[o + 6]!
        const lift = ease(scan, start, start + 0.32)
        const bob = reducedMotion ? 0 : Math.sin(t * 0.8 + i * 1.7) * 0.015 * lift
        _pos.set(
          figurePaths[o]! + (figurePaths[o + 3]! - figurePaths[o]!) * lift,
          figurePaths[o + 1]! + (figurePaths[o + 4]! - figurePaths[o + 1]!) * lift + Math.sin(Math.PI * lift) * 0.25 + bob,
          figurePaths[o + 2]! + (figurePaths[o + 5]! - figurePaths[o + 2]!) * lift + Math.sin(Math.PI * lift) * 0.4,
        )
        const visible = scan > start ? 1 : 0
        const arrived = ease(lift, 0.75, 1.0)
        // figure
        const figW = 0.18 + 0.2 * lift
        _obj.position.copy(_pos)
        _obj.rotation.set(0, 0, 0)
        _obj.scale.set(figW, 0.07, 1)
        _obj.updateMatrix()
        chips.setMatrixAt(i, _obj.matrix)
        arr[i * 2] = visible
        arr[i * 2 + 1] = arrived
        // its page tag, riding at the figure's left end
        const tagScale = 0.11 * ease(lift, 0.1, 0.5)
        _obj.position.set(_pos.x - figW / 2 - 0.1, _pos.y, _pos.z)
        _obj.scale.set(Math.max(tagScale, 0.0001) * 1.45, Math.max(tagScale, 0.0001), 1)
        _obj.updateMatrix()
        chips.setMatrixAt(FIGURE_COUNT + i, _obj.matrix)
        arr[(FIGURE_COUNT + i) * 2] = visible * ease(lift, 0.1, 0.5)
        arr[(FIGURE_COUNT + i) * 2 + 1] = 1
      }
      chips.instanceMatrix.needsUpdate = true
      state.needsUpdate = true
    }

    // 4 · self-hosted: the seal closes around the monolith and the lock clicks shut
    setLineOpacity(rackRef.current, appear * 0.8)
    setLineReveal(sealRef.current, ease(p, 0.6, 0.72))
    const close = ease(p, 0.7, 0.76)
    if (lockRef.current) lockRef.current.visible = p > 0.62
    if (shackleRef.current) shackleRef.current.position.y = 0.07 * (1 - close)
    const lockGlow = lockGlowRef.current
    if (lockGlow) (lockGlow.material as THREE.SpriteMaterial).opacity = close * (0.5 + 0.4 * pulse(p, 0.72, 0.84))

    if (residualLabelRef.current) residualLabelRef.current.fillOpacity = ease(p, 0.6, 0.7) * 0.85
    if (hostLabelRef.current) hostLabelRef.current.fillOpacity = ease(p, 0.74, 0.82) * 0.75
  })

  return (
    <group>
      {/* The statement: roll and ribbon */}
      <mesh position={[RIBBON_X, RIBBON_TOP + 0.06, RIBBON_Z0 - 0.02]} rotation={[0, 0, Math.PI / 2]} material={rollMat}>
        <cylinderGeometry args={[0.08, 0.08, RIBBON_W + 0.14, 24, 1, true]} />
      </mesh>
      <mesh ref={ribbonRef} geometry={ribbonGeo} material={ribbonMat} frustumCulled={false} />

      {/* Running-balance residual, zero axis and the equals sign */}
      <LightLine ref={zeroAxisRef} points={zeroAxis} color={PALETTE.nearWhite} intensity={GLOW.dim} width={0.01} dashed dashSize={0.06} gapSize={0.05} opacity={0} />
      <mesh ref={residualRef} geometry={residualGeo} material={residualMat} frustumCulled={false} />
      <LightLine ref={equalsRef} points={equals} segments color={PALETTE.starGold} intensity={GLOW.hero} width={0.03} opacity={0} />
      <GlowSprite ref={equalsGlowRef} position={[RES_X1 + 0.32, RES_Y, RES_Z - 0.02]} color={PALETTE.starGold} intensity={GLOW.hero} size={0.95} opacity={0} />

      {/* Pages being read, and the cited figures lifting off them */}
      <instancedMesh ref={pagesRef} args={[pageGeo, pageMat, PAGES.length]} frustumCulled={false} />
      <instancedMesh ref={chipsRef} args={[chipGeo, chipMat, FIGURE_COUNT * 2]} frustumCulled={false} />

      {/* Self-hosted: the GPU monolith inside a sealed ring with a lock */}
      <mesh position={MONOLITH} material={monolithMat}>
        <boxGeometry args={[0.85, 3.2, 0.6]} />
      </mesh>
      <LightLine ref={rackRef} points={rack} segments color={PALETTE.nearWhite} intensity={GLOW.dim} width={0.01} opacity={0} />
      <LightLine ref={sealRef} points={seal} color={PALETTE.starGold} intensity={GLOW.base} width={0.014} />
      <group ref={lockRef} position={LOCK} visible={false}>
        <LightLine points={lockBody} segments color={PALETTE.starGold} intensity={GLOW.hero} width={0.016} />
        <group ref={shackleRef}>
          <LightLine points={shackle} color={PALETTE.starGold} intensity={GLOW.hero} width={0.016} />
        </group>
        <GlowSprite ref={lockGlowRef} color={PALETTE.starGold} intensity={GLOW.hero} size={0.8} opacity={0} />
      </group>

      <Label ref={residualLabelRef} position={[RES_X0, RES_Y + 0.5, RES_Z]} anchorX="left" color={PALETTE.starGold} opacity={0}>
        Residual 0.00
      </Label>
      <Label ref={hostLabelRef} position={[LOCK.x, LOCK.y - 0.32, LOCK.z]} color={PALETTE.nearWhite} intensity={0.9} opacity={0}>
        Self-hosted
      </Label>
    </group>
  )
}
