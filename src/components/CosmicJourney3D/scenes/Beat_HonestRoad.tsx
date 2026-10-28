// src/components/CosmicJourney3D/scenes/Beat_HonestRoad.tsx
'use client'

// Beat 26 · The Honest Consultant (Act IV, widening).
// A road made of light runs from the viewer into the dark and branches, then
// branches again, toward nine beacons: abstract universities, pillars of light
// of different heights. Small lights travel the roads. Claim cards float above
// the junctions; one by one, thin citation threads run from each claim back to
// the beacon it came from, and that source flares as the thread lands.
// No logos or brand marks: every institution is the same anonymous beacon.

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { createRimMaterial, getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { LightLine, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, seeded } from '../art/anim'

// ---- The road tree: root -> one fork -> three junctions -> nine beacons ----
const ROOT = new THREE.Vector3(0, -0.9, 1.6)
const FORK = new THREE.Vector3(0, -0.75, -0.5)
const JUNCTIONS = [
  new THREE.Vector3(-2.6, -0.6, -2.4),
  new THREE.Vector3(0, -0.58, -2.7),
  new THREE.Vector3(2.6, -0.6, -2.4),
] as const
const LEAF_COUNT = 9
const LEAVES = Array.from({ length: LEAF_COUNT }, (_, j) =>
  new THREE.Vector3(-4 + j, -0.4, -4.4 - 0.35 * seeded(j, 40)))
const BEACON_TOPS = LEAVES.map((leaf, j) => new THREE.Vector3(leaf.x, 1.3 + 1.5 * seeded(j, 41), leaf.z))

// Claims and the beacons (sources) they cite.
const CLAIM_SOURCES = [0, 2, 3, 5, 6, 8] as const
const CLAIM_W = 0.62
const CLAIM_H = 0.26
const CLAIMS = CLAIM_SOURCES.map((_, k) =>
  new THREE.Vector3(-3.4 + k * 1.36, 2.75 + 0.35 * seeded(k, 42), -1.3 - 0.5 * seeded(k, 43)))
const THREAD_SAMPLES = 28
const PILLAR_STEPS = 12
const SOURCE_LABEL_BEACON = 5

interface Edge {
  from: THREE.Vector3
  to: THREE.Vector3
  w0: number
  w1: number
  /** Distance along the road from the root at `from`. */
  d0: number
}

function edgeCurve(e: { from: THREE.Vector3; to: THREE.Vector3 }): THREE.CubicBezierCurve3 {
  // Every edge leaves and arrives heading into -z, so the branches join smoothly.
  const dz = Math.abs(e.to.z - e.from.z) * 0.45
  return new THREE.CubicBezierCurve3(
    e.from.clone(),
    e.from.clone().add(new THREE.Vector3(0, 0, -dz)),
    e.to.clone().add(new THREE.Vector3(0, 0, dz)),
    e.to.clone(),
  )
}

function buildTree() {
  const trunk: Edge = { from: ROOT, to: FORK, w0: 0.55, w1: 0.48, d0: 0 }
  const trunkLen = edgeCurve(trunk).getLength()
  const mids: Edge[] = JUNCTIONS.map((j) => ({ from: FORK, to: j, w0: 0.42, w1: 0.34, d0: trunkLen }))
  const midLens = mids.map((e) => edgeCurve(e).getLength())
  const leaves: Edge[] = LEAVES.map((leaf, j) => {
    const g = Math.floor(j / 3)
    return { from: JUNCTIONS[g]!, to: leaf, w0: 0.3, w1: 0.2, d0: trunkLen + midLens[g]! }
  })
  const leafDist = leaves.map((e) => e.d0 + edgeCurve(e).getLength())
  return { edges: [trunk, ...mids, ...leaves], leafDist, maxDist: Math.max(...leafDist) }
}

// One strip per edge, merged: aU = distance from the root, aV = -1..1 across.
function roadGeometry(edges: Edge[]): THREE.BufferGeometry {
  const n = 40
  const pos: number[] = []
  const au: number[] = []
  const av: number[] = []
  const idx: number[] = []
  const tangent = new THREE.Vector3()
  const perp = new THREE.Vector3()
  const up = new THREE.Vector3(0, 1, 0)
  const point = new THREE.Vector3()
  const prev = new THREE.Vector3()
  for (const e of edges) {
    const curve = edgeCurve(e)
    const base = pos.length / 3
    let dist = e.d0
    for (let i = 0; i <= n; i++) {
      const t = i / n
      curve.getPoint(t, point)
      if (i > 0) dist += point.distanceTo(prev)
      prev.copy(point)
      curve.getTangent(t, tangent)
      perp.crossVectors(tangent, up).normalize()
      const half = (e.w0 + (e.w1 - e.w0) * t) / 2
      pos.push(point.x + perp.x * half, point.y, point.z + perp.z * half)
      pos.push(point.x - perp.x * half, point.y, point.z - perp.z * half)
      au.push(dist, dist)
      av.push(-1, 1)
      if (i < n) {
        const a = base + i * 2
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
      }
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('aU', new THREE.Float32BufferAttribute(au, 1))
  g.setAttribute('aV', new THREE.Float32BufferAttribute(av, 1))
  g.setIndex(idx)
  return g
}

// Each leaf's full route (root -> fork -> junction -> beacon), resampled evenly.
const ROUTE_SAMPLES = 64
function buildRoutes(edges: Edge[]): { routes: Float32Array; lengths: Float32Array } {
  const routes = new Float32Array(LEAF_COUNT * ROUTE_SAMPLES * 3)
  const lengths = new Float32Array(LEAF_COUNT)
  for (let j = 0; j < LEAF_COUNT; j++) {
    const g = Math.floor(j / 3)
    const path = new THREE.CurvePath<THREE.Vector3>()
    path.add(edgeCurve(edges[0]!))
    path.add(edgeCurve(edges[1 + g]!))
    path.add(edgeCurve(edges[4 + j]!))
    lengths[j] = path.getLength()
    const pts = path.getSpacedPoints(ROUTE_SAMPLES - 1)
    for (let i = 0; i < ROUTE_SAMPLES; i++) {
      const o = (j * ROUTE_SAMPLES + i) * 3
      routes[o] = pts[i]!.x
      routes[o + 1] = pts[i]!.y
      routes[o + 2] = pts[i]!.z
    }
  }
  return { routes, lengths }
}

const ROAD_VERT = /* glsl */ `
  attribute float aU;
  attribute float aV;
  varying float vU;
  varying float vV;
  void main() {
    vU = aU;
    vV = aV;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Faint surface, two crisp rails, and soft chevrons of light moving outward.
const ROAD_FRAG = /* glsl */ `
  uniform float uGrow;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uRail;
  uniform vec3 uFill;
  uniform vec3 uHot;
  varying float vU;
  varying float vV;
  void main() {
    if (vU > uGrow) discard;
    float edgeDist = 1.0 - abs(vV);
    float rail = 1.0 - smoothstep(0.0, 0.05 + fwidth(vV) * 1.5, edgeDist);
    float fill = 0.06 * (1.0 - vV * vV);
    float chevron = fract(vU * 1.6 - abs(vV) * 0.25 - uTime * 0.35);
    float glide = smoothstep(0.0, 0.08, chevron) * (1.0 - smoothstep(0.08, 0.22, chevron)) * (1.0 - abs(vV)) * 0.18;
    float tip = exp(-pow((vU - uGrow) / 0.08, 2.0));
    // fade the near end into the scrim
    float near = smoothstep(0.0, 1.2, vU) * 0.7 + 0.3;
    vec3 col = (uRail * rail + uFill * (fill + glide)) * near + uHot * tip * (rail + 0.3);
    gl_FragColor = vec4(col * uOpacity, 1.0);
  }
`

const HALO_VERT = /* glsl */ `
  attribute float aDelay;
  attribute float aSource;
  uniform float uReveal;
  uniform float uSourced;
  uniform float uSize;
  varying float vLit;
  varying float vSource;
  void main() {
    vLit = smoothstep(aDelay, aDelay + 0.08, uReveal);
    vSource = aSource * uSourced;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * vLit * (1.0 + 0.6 * vSource) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const HALO_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uBase;
  uniform vec3 uHot;
  varying float vLit;
  varying float vSource;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    gl_FragColor = vec4((uBase * vLit + uHot * vSource) * a, 1.0);
  }
`

const CARD_VERT = /* glsl */ `
  attribute float aDelay;
  uniform float uShow;
  varying vec2 vUv;
  varying float vShow;
  void main() {
    vUv = uv;
    vShow = smoothstep(aDelay, aDelay + 0.25, uShow);
    vec4 p = vec4(position, 1.0);
    #ifdef USE_INSTANCING
      p = instanceMatrix * p;
    #endif
    p.y += (1.0 - vShow) * -0.15;
    gl_Position = projectionMatrix * modelViewMatrix * p;
  }
`

// Claim card: holo outline, two glyph rows, and a check mark once it is sourced.
const CARD_FRAG = /* glsl */ `
  uniform float uTied;
  uniform vec3 uEdge;
  uniform vec3 uInk;
  uniform vec3 uCheck;
  varying vec2 vUv;
  varying float vShow;
  float seg(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }
  void main() {
    if (vShow < 0.001) discard;
    vec2 size = vec2(${CLAIM_W.toFixed(2)}, ${CLAIM_H.toFixed(2)});
    vec2 w = vUv * size;
    vec2 e2 = min(w, size - w);
    float d = min(e2.x, e2.y);
    float edge = 1.0 - smoothstep(0.0, 0.006 + fwidth(d) * 1.2, d);
    float cells = step(0.24, fract(w.x / 0.045));
    float row1 = step(0.06, w.x) * step(w.x, 0.42) * step(0.15, w.y) * step(w.y, 0.19);
    float row2 = step(0.06, w.x) * step(w.x, 0.3) * step(0.07, w.y) * step(w.y, 0.11);
    float ink = (row1 + row2) * cells;
    float cd = min(seg(w, vec2(0.49, 0.13), vec2(0.515, 0.095)), seg(w, vec2(0.515, 0.095), vec2(0.565, 0.17)));
    float check = (1.0 - smoothstep(0.006, 0.006 + fwidth(cd) * 1.5, cd)) * uTied;
    vec3 col = uEdge * (edge + 0.04) + uInk * ink + uCheck * check;
    gl_FragColor = vec4(col * vShow, 1.0);
  }
`

const FLOW_VERT = /* glsl */ `
  attribute float aAlpha;
  uniform float uSize;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const FLOW_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    if (vAlpha < 0.002) discard;
    float a = texture2D(uMap, gl_PointCoord).a;
    gl_FragColor = vec4(uColor * a * vAlpha, 1.0);
  }
`

function flowGeometry(count: number): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry()
  const position = new THREE.BufferAttribute(new Float32Array(count * 3), 3)
  position.setUsage(THREE.DynamicDrawUsage)
  const alpha = new THREE.BufferAttribute(new Float32Array(count), 1)
  alpha.setUsage(THREE.DynamicDrawUsage)
  g.setAttribute('position', position)
  g.setAttribute('aAlpha', alpha)
  return g
}

type TextMesh = THREE.Mesh & { fillOpacity: number }

export default function Beat_HonestRoad({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const roadRef = useRef<THREE.Mesh>(null)
  const pillarsRef = useRef<LightLineObject>(null)
  const topsRef = useRef<THREE.InstancedMesh>(null)
  const halosRef = useRef<THREE.Points>(null)
  const cardsRef = useRef<THREE.InstancedMesh>(null)
  const threadsRef = useRef<LightLineObject>(null)
  const flowRef = useRef<THREE.Points>(null)
  const labelRef = useRef<TextMesh>(null)

  const tier = quality === 'high' ? 1 : quality === 'low' ? 0.5 : 0.25
  const flowCount = Math.round(260 * tier)

  const tree = useMemo(() => buildTree(), [])
  const route = useMemo(() => buildRoutes(tree.edges), [tree])
  const flowSeeds = useMemo(() => {
    const s = new Float32Array(flowCount * 3)
    for (let i = 0; i < flowCount; i++) {
      s[i * 3] = seeded(i, 50)
      s[i * 3 + 1] = (seeded(i, 51) - 0.5) * 2
      s[i * 3 + 2] = 0.8 + 0.4 * seeded(i, 52)
    }
    return s
  }, [flowCount])

  const roadGeo = useDisposable(() => roadGeometry(tree.edges), [tree])
  const roadMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uGrow: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uRail: { value: hdr(PALETTE.starGold, GLOW.base) },
      uFill: { value: hdr(PALETTE.starGold, 1.4) },
      uHot: { value: hdr(PALETTE.nearWhite, GLOW.hero) },
    },
    vertexShader: ROAD_VERT,
    fragmentShader: ROAD_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  }))

  // Beacon tops: rim-lit octahedra that light when the road reaches them.
  const topGeo = useDisposable(() => {
    const g = new THREE.OctahedronGeometry(0.13, 0)
    const delay = new Float32Array(LEAF_COUNT)
    for (let j = 0; j < LEAF_COUNT; j++) delay[j] = Math.min(0.88, tree.leafDist[j]! / tree.maxDist - 0.06)
    g.setAttribute('aDelay', new THREE.InstancedBufferAttribute(delay, 1))
    return g
  }, [tree])
  const topMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.starGold, 0.12),
    rim: hdr(PALETTE.nearWhite, 1.6),
    power: 1.8,
    instancedReveal: true,
  }))

  useLayoutEffect(() => {
    const mesh = topsRef.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    BEACON_TOPS.forEach((top, j) => {
      m.makeRotationY(0.4 + j * 0.7)
      m.setPosition(top.x, top.y, top.z)
      mesh.setMatrixAt(j, m)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [])

  const haloGeo = useDisposable(() => {
    const pos = new Float32Array(LEAF_COUNT * 3)
    const delay = new Float32Array(LEAF_COUNT)
    const source = new Float32Array(LEAF_COUNT)
    BEACON_TOPS.forEach((top, j) => {
      pos[j * 3] = top.x
      pos[j * 3 + 1] = top.y
      pos[j * 3 + 2] = top.z
      delay[j] = Math.min(0.88, tree.leafDist[j]! / tree.maxDist - 0.06)
      source[j] = (CLAIM_SOURCES as readonly number[]).includes(j) ? 1 : 0
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1))
    g.setAttribute('aSource', new THREE.BufferAttribute(source, 1))
    return g
  }, [tree])
  const haloMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uReveal: { value: 0 },
      uSourced: { value: 0 },
      uSize: { value: 120 },
      uBase: { value: hdr(PALETTE.starGold, GLOW.base) },
      uHot: { value: hdr(PALETTE.nearWhite, GLOW.hot) },
    },
    vertexShader: HALO_VERT,
    fragmentShader: HALO_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  // Pillars, split into steps ordered by height so all of them rise together.
  const pillars = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let s = 0; s < PILLAR_STEPS; s++) {
      for (let j = 0; j < LEAF_COUNT; j++) {
        const leaf = LEAVES[j]!
        const top = BEACON_TOPS[j]!
        const y0 = leaf.y + ((top.y - 0.13 - leaf.y) * s) / PILLAR_STEPS
        const y1 = leaf.y + ((top.y - 0.13 - leaf.y) * (s + 1)) / PILLAR_STEPS
        pts.push(new THREE.Vector3(leaf.x, y0, leaf.z), new THREE.Vector3(leaf.x, y1, leaf.z))
      }
    }
    return pts
  }, [])

  // Citation threads, interleaved by sample so they all draw on at once.
  const threads = useMemo(() => {
    const curves = CLAIMS.map((claim, k) => {
      const from = new THREE.Vector3(claim.x, claim.y - CLAIM_H / 2, claim.z)
      const to = BEACON_TOPS[CLAIM_SOURCES[k]!]!
      const mid = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 0.55, 0))
      return new THREE.QuadraticBezierCurve3(from, mid, to.clone())
    })
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < THREAD_SAMPLES; i++) {
      for (const curve of curves) {
        pts.push(curve.getPoint(i / THREAD_SAMPLES), curve.getPoint((i + 1) / THREAD_SAMPLES))
      }
    }
    return pts
  }, [])

  const cardGeo = useDisposable(() => {
    const g = new THREE.PlaneGeometry(CLAIM_W, CLAIM_H)
    const delay = new Float32Array(CLAIMS.length)
    for (let k = 0; k < CLAIMS.length; k++) delay[k] = (k / CLAIMS.length) * 0.6
    g.setAttribute('aDelay', new THREE.InstancedBufferAttribute(delay, 1))
    return g
  })
  const cardMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uShow: { value: 0 },
      uTied: { value: 0 },
      uEdge: { value: hdr(PALETTE.nearWhite, 0.6) },
      uInk: { value: hdr(PALETTE.nearWhite, 0.45) },
      uCheck: { value: hdr(PALETTE.starGold, GLOW.hero) },
    },
    vertexShader: CARD_VERT,
    fragmentShader: CARD_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  }))

  useLayoutEffect(() => {
    const mesh = cardsRef.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    CLAIMS.forEach((claim, k) => {
      // turn each card slightly toward the camera
      m.makeRotationY(-claim.x * 0.06)
      m.setPosition(claim.x, claim.y, claim.z)
      mesh.setMatrixAt(k, m)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [])

  const flowGeo = useDisposable(() => flowGeometry(flowCount), [flowCount])
  const flowMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uSize: { value: 26 },
      uColor: { value: hdr(PALETTE.starGold, 1.5) },
    },
    vertexShader: FLOW_VERT,
    fragmentShader: FLOW_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock
    const appear = ease(p, 0.0, 0.12)

    // 1 · the road grows and branches; beacons light as it reaches them
    const growFrac = 0.08 + 0.92 * ease(p, 0.1, 0.46)
    const grow = growFrac * (tree.maxDist + 0.2)
    const road = roadRef.current
    setUniform(road, 'uGrow', grow)
    setUniform(road, 'uTime', t)
    setUniform(road, 'uOpacity', appear)
    const halos = halosRef.current
    setUniform(halos, 'uReveal', grow / tree.maxDist)
    setUniform(topsRef.current, 'uReveal', grow / tree.maxDist)
    setLineReveal(pillarsRef.current, ease(p, 0.36, 0.54))

    // 2 · claims appear, then citation threads tie each one to its source
    setUniform(cardsRef.current, 'uShow', ease(p, 0.4, 0.56))
    setLineReveal(threadsRef.current, ease(p, 0.54, 0.7))
    const tied = ease(p, 0.68, 0.74)
    setUniform(cardsRef.current, 'uTied', tied)
    const settle = 1 - 0.55 * ease(p, 0.74, 0.86)
    setUniform(halos, 'uSourced', tied * settle * (reducedMotion ? 1 : 0.92 + 0.08 * Math.sin(t * 1.4)))

    // travellers on the roads, only where the road already exists
    const flow = flowRef.current
    if (flow) {
      const position = flow.geometry.getAttribute('position') as THREE.BufferAttribute
      const alpha = flow.geometry.getAttribute('aAlpha') as THREE.BufferAttribute
      const posArr = position.array as Float32Array
      const alphaArr = alpha.array as Float32Array
      const on = ease(p, 0.2, 0.4)
      for (let i = 0; i < flowCount; i++) {
        const leaf = i % LEAF_COUNT
        const len = route.lengths[leaf]!
        const u = (flowSeeds[i * 3]! + (t * 0.32 * flowSeeds[i * 3 + 2]!) / len) % 1
        const f = u * (ROUTE_SAMPLES - 1)
        const i0 = Math.floor(f)
        const i1 = Math.min(ROUTE_SAMPLES - 1, i0 + 1)
        const k = f - i0
        const a = (leaf * ROUTE_SAMPLES + i0) * 3
        const b = (leaf * ROUTE_SAMPLES + i1) * 3
        // lateral offset across the road, narrowing as the roads narrow
        const lateral = flowSeeds[i * 3 + 1]! * (0.18 - 0.1 * u)
        posArr[i * 3] = route.routes[a]! + (route.routes[b]! - route.routes[a]!) * k + lateral
        posArr[i * 3 + 1] = route.routes[a + 1]! + (route.routes[b + 1]! - route.routes[a + 1]!) * k + 0.03
        posArr[i * 3 + 2] = route.routes[a + 2]! + (route.routes[b + 2]! - route.routes[a + 2]!) * k
        const reached = u * len < grow ? 1 : 0
        alphaArr[i] = reached * on * Math.sin(Math.PI * u) * (u * len > 0.6 ? 1 : 0)
      }
      position.needsUpdate = true
      alpha.needsUpdate = true
    }

    if (labelRef.current) labelRef.current.fillOpacity = ease(p, 0.72, 0.82) * 0.8
  })

  const labelTop = BEACON_TOPS[SOURCE_LABEL_BEACON]!

  return (
    <group>
      <mesh ref={roadRef} geometry={roadGeo} material={roadMat} frustumCulled={false} />
      <points ref={flowRef} geometry={flowGeo} material={flowMat} frustumCulled={false} />

      <LightLine ref={pillarsRef} points={pillars} segments color={PALETTE.starGold} intensity={GLOW.base} width={0.016} />
      <instancedMesh ref={topsRef} args={[topGeo, topMat, LEAF_COUNT]} frustumCulled={false} />
      <points ref={halosRef} geometry={haloGeo} material={haloMat} frustumCulled={false} />

      <instancedMesh ref={cardsRef} args={[cardGeo, cardMat, CLAIMS.length]} frustumCulled={false} />
      <LightLine ref={threadsRef} points={threads} segments color={PALETTE.stellarBlue} intensity={1.3} width={0.009} />

      <Label ref={labelRef} position={[labelTop.x + 0.22, labelTop.y + 0.02, labelTop.z]} anchorX="left" color={PALETTE.nearWhite} intensity={0.9} opacity={0}>
        Source
      </Label>
    </group>
  )
}
