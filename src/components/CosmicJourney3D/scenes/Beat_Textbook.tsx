// src/components/CosmicJourney3D/scenes/Beat_Textbook.tsx
'use client'

// Beat 1 · The Spark: NAO (Act I, spark).
// An open Olympiad textbook made of light lies beside a small glowing figure.
// Its pages peel off one by one, swing up out of the book and fly into place as
// the tiles of a star chart; as each page settles, its printed lines morph into
// the chart's RA/Dec grid. Then constellation lines ignite outward from the
// figure, star by star, until the sky around the child is drawn in.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { createRimMaterial, getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, ramp, seeded } from '../art/anim'

// ---- Layout -----------------------------------------------------------------

const PAGES = 6
const COLS = 3
const ROWS = 2
/** Book page size (portrait) and chart tile size (landscape). */
const PAGE_W = 1.1
const PAGE_H = 1.45
const TILE_W = 2.2
const TILE_H = 1.8
/** Star chart: 3 x 2 tiles centred behind the book. */
const CHART_W = TILE_W * COLS
const CHART_H = TILE_H * ROWS
const CHART_X0 = -CHART_W / 2
const CHART_Y0 = -0.05
const CHART_Z = -2.6

/** The open book lies tilted back toward the camera. */
const BOOK_POS = new THREE.Vector3(0.75, -0.62, 0.35)
const BOOK_TILT = -1.05
const QBOOK = new THREE.Quaternion().setFromEuler(new THREE.Euler(BOOK_TILT, 0, 0))
const IDENTITY = new THREE.Quaternion()
const AXIS_Y = new THREE.Vector3(0, 1, 0)

/** The child: a small figure standing beside the book, looking up. */
const FIGURE = new THREE.Vector3(-0.95, -0.86, 0.55)
/** Where the figure's head lands on the chart plane (chart-normalised), the ignition origin. */
const IGNITE_ORIGIN = new THREE.Vector2(0.3, -0.2)

/** Each page's peel start (p). Top page first. */
const peelStart = (i: number) => 0.15 + i * 0.045

// ---- Constellations (chart-normalised coordinates) ------------------------------

type Pt = readonly [number, number]
const CONSTELLATIONS: ReadonlyArray<ReadonlyArray<readonly [Pt, Pt]>> = [
  // Orion
  [
    [[0.62, 0.68], [0.74, 0.66]], [[0.62, 0.68], [0.66, 0.5]], [[0.74, 0.66], [0.7, 0.46]],
    [[0.66, 0.5], [0.68, 0.48]], [[0.68, 0.48], [0.7, 0.46]], [[0.66, 0.5], [0.63, 0.3]], [[0.7, 0.46], [0.76, 0.32]],
  ],
  // Cassiopeia
  [[[0.1, 0.82], [0.16, 0.9]], [[0.16, 0.9], [0.22, 0.8]], [[0.22, 0.8], [0.28, 0.88]], [[0.28, 0.88], [0.34, 0.8]]],
  // The Plough
  [
    [[0.7, 0.92], [0.76, 0.9]], [[0.76, 0.9], [0.82, 0.86]], [[0.82, 0.86], [0.88, 0.8]],
    [[0.88, 0.8], [0.96, 0.82]], [[0.96, 0.82], [0.95, 0.72]], [[0.95, 0.72], [0.88, 0.7]], [[0.88, 0.7], [0.88, 0.8]],
  ],
  // Leo
  [
    [[0.18, 0.52], [0.22, 0.57]], [[0.22, 0.57], [0.27, 0.55]], [[0.27, 0.55], [0.28, 0.46]],
    [[0.28, 0.46], [0.24, 0.4]], [[0.28, 0.46], [0.38, 0.44]], [[0.38, 0.44], [0.42, 0.36]], [[0.42, 0.36], [0.24, 0.4]],
  ],
  // Cygnus: a quiet nod to the black hole that comes much later.
  [[[0.5, 0.86], [0.5, 0.74]], [[0.5, 0.74], [0.5, 0.6]], [[0.43, 0.76], [0.5, 0.74]], [[0.5, 0.74], [0.57, 0.72]]],
]
const CYGNUS_LABEL: Pt = [0.5, 0.56]

const chartWorld = (u: number, v: number, out: THREE.Vector3) =>
  out.set(CHART_X0 + u * CHART_W, CHART_Y0 + v * CHART_H, CHART_Z + 0.03)

interface ChartStars {
  linePoints: THREE.Vector3[]
  nodes: Float32Array
  nodeDelay: Float32Array
}

/** Sorts every constellation segment by distance from the figure, so the reveal ignites outward. */
function buildConstellations(): ChartStars {
  const segs: Array<{ a: Pt; b: Pt; d: number }> = []
  for (const c of CONSTELLATIONS) {
    for (const [a, b] of c) {
      const mx = (a[0] + b[0]) / 2 - IGNITE_ORIGIN.x
      const my = (a[1] + b[1]) / 2 - IGNITE_ORIGIN.y
      segs.push({ a, b, d: Math.hypot(mx, my) })
    }
  }
  segs.sort((s, t) => s.d - t.d)
  const linePoints: THREE.Vector3[] = []
  const delays = new Map<string, { pt: Pt; delay: number }>()
  segs.forEach((s, i) => {
    linePoints.push(chartWorld(s.a[0], s.a[1], new THREE.Vector3()), chartWorld(s.b[0], s.b[1], new THREE.Vector3()))
    const f = i / segs.length
    for (const pt of [s.a, s.b]) {
      const key = `${pt[0]},${pt[1]}`
      const prev = delays.get(key)
      if (!prev || f < prev.delay) delays.set(key, { pt, delay: f })
    }
  })
  const entries = [...delays.values()]
  const nodes = new Float32Array(entries.length * 3)
  const nodeDelay = new Float32Array(entries.length)
  const v = new THREE.Vector3()
  entries.forEach((e, i) => {
    chartWorld(e.pt[0], e.pt[1], v)
    nodes[i * 3] = v.x
    nodes[i * 3 + 1] = v.y
    nodes[i * 3 + 2] = v.z + 0.01
    nodeDelay[i] = e.delay
  })
  return { linePoints, nodes, nodeDelay }
}

/** Open-book outline in book-local space (pages in XY, normal +Z, spine on Y). */
function bookOutline(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const seg = (ax: number, ay: number, az: number, bx: number, by: number, bz: number) =>
    pts.push(new THREE.Vector3(ax, ay, az), new THREE.Vector3(bx, by, bz))
  const h = PAGE_H / 2
  // left page (already read) and right page block
  seg(-PAGE_W, -h, 0, 0, -h, 0)
  seg(-PAGE_W, h, 0, 0, h, 0)
  seg(-PAGE_W, -h, 0, -PAGE_W, h, 0)
  seg(PAGE_W, -h, 0, PAGE_W, h, 0)
  seg(0, -h, 0, PAGE_W, -h, 0)
  seg(0, h, 0, PAGE_W, h, 0)
  // spine
  seg(0, -h - 0.04, -0.02, 0, h + 0.04, -0.02)
  // page-block thickness under the right page
  seg(PAGE_W, -h, 0, PAGE_W, -h, -0.06)
  seg(PAGE_W, h, 0, PAGE_W, h, -0.06)
  seg(PAGE_W, -h, -0.06, PAGE_W, h, -0.06)
  // a few printed lines on the left page
  for (let k = 0; k < 6; k++) {
    const y = h - 0.3 - k * 0.17
    const len = 0.45 + 0.4 * seeded(k, 11)
    seg(-PAGE_W + 0.14, y, 0.002, -PAGE_W + 0.14 + len * (PAGE_W - 0.28), y, 0.002)
  }
  return pts
}

// ---- Shaders -------------------------------------------------------------------

// Page sheets (instanced): book text and a diagram when in the book, the star
// chart's grid (in chart space, continuous across tiles) once a page has landed.
const PAGE_VERT = /* glsl */ `
  attribute vec2 aTile;
  attribute float aDelay;
  uniform float uP;
  varying vec2 vUv;
  varying vec2 vChart;
  varying float vMorph;
  varying float vSeed;
  void main() {
    vUv = uv;
    vChart = (aTile + uv) / vec2(${COLS}.0, ${ROWS}.0);
    vMorph = smoothstep(aDelay, aDelay + 0.08, uP);
    vSeed = aTile.x * 7.0 + aTile.y * 3.0;
    vec4 local = vec4(position, 1.0);
    #ifdef USE_INSTANCING
      local = instanceMatrix * local;
    #endif
    gl_Position = projectionMatrix * modelViewMatrix * local;
  }
`

const PAGE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uGrid;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec2 vChart;
  varying float vMorph;
  varying float vSeed;
  float h11(float n) { return fract(sin(n * 91.345) * 43758.5453); }
  float gridLine(float v, float spacing) {
    float g = abs(fract(v / spacing - 0.5) - 0.5) * spacing;
    return 1.0 - smoothstep(0.0, fwidth(v) * 1.3, g);
  }
  void main() {
    vec2 e = min(vUv, 1.0 - vUv);
    float edge = 1.0 - smoothstep(0.0, 0.014, min(e.x, e.y));

    // Book: printed lines in the lower half, a planet diagram up top.
    float row = vUv.y * 18.0;
    float ri = floor(row);
    float len = 0.35 + 0.55 * h11(ri + vSeed * 13.0);
    float text = (1.0 - smoothstep(0.06, 0.13, abs(fract(row) - 0.5)))
      * step(0.12, vUv.x) * step(vUv.x, 0.12 + 0.76 * len)
      * step(0.08, vUv.y) * step(vUv.y, 0.56);
    vec2 c = (vUv - vec2(0.5, 0.76)) * vec2(1.0, 1.32);
    float rc = length(c);
    float diagram = exp(-pow((rc - 0.11) / 0.008, 2.0)) + 0.6 * exp(-pow((length(c * vec2(1.0, 3.2)) - 0.2) / 0.008, 2.0));
    float book = text * 0.45 + diagram * 0.8;

    // Chart: RA meridians + Dec parallels, and the ecliptic as a dashed curve.
    vec2 cp = vChart * vec2(12.0, 6.0);
    float grid = max(gridLine(cp.x, 1.0), gridLine(cp.y, 1.0));
    float ecl = 0.5 + 0.2 * sin(vChart.x * 6.2832 + 0.6);
    float eclLine = (1.0 - smoothstep(0.0, fwidth(vChart.y) * 1.6, abs(vChart.y - ecl)))
      * step(0.5, fract(vChart.x * 40.0));

    float scan = 0.5 + 0.5 * sin(vUv.y * 140.0 - uTime * 2.0);
    vec3 col = uColor * (edge * mix(1.0, 0.22, vMorph) + book * (1.0 - vMorph) + (0.04 + 0.025 * scan) * (1.0 - 0.6 * vMorph));
    col += uGrid * (grid * 0.55 + eclLine * 1.1) * vMorph;
    gl_FragColor = vec4(col * uOpacity, 1.0);
  }
`

const STAR_VERT = /* glsl */ `
  attribute float aDelay;
  attribute float aSeed;
  uniform float uIgnite;
  uniform float uTime;
  uniform float uSize;
  varying float vLit;
  varying float vTwinkle;
  void main() {
    vLit = smoothstep(aDelay, aDelay + 0.08, uIgnite);
    vTwinkle = 0.75 + 0.25 * sin(uTime * (0.8 + aSeed * 1.7) + aSeed * 40.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (0.55 + 0.9 * aSeed) * (1.0 + 0.6 * vLit) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const STAR_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uBase;
  uniform float uOpacity;
  varying float vLit;
  varying float vTwinkle;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    gl_FragColor = vec4(uColor * a * (uBase + vLit) * vTwinkle * uOpacity, 1.0);
  }
`

function starMaterial(color: THREE.Color, size: number, base: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uColor: { value: color },
      uIgnite: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: size },
      uBase: { value: base },
      uOpacity: { value: 0 },
    },
    vertexShader: STAR_VERT,
    fragmentShader: STAR_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  })
}

// ---- Scratch (no allocation in useFrame) -------------------------------------------

const _peel = new THREE.Vector3()
const _tile = new THREE.Vector3()
const _q = new THREE.Quaternion()
const _obj = new THREE.Object3D()

type Fadeable = THREE.Mesh & { fillOpacity: number }

export default function Beat_Textbook({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const pagesRef = useRef<THREE.InstancedMesh>(null)
  const bookRef = useRef<LightLineObject>(null)
  const linesRef = useRef<LightLineObject>(null)
  const nodesRef = useRef<THREE.Points>(null)
  const fieldRef = useRef<THREE.Points>(null)
  const figureGlowRef = useRef<THREE.Sprite>(null)
  const figureRef = useRef<THREE.Group>(null)
  const labelRef = useRef<Fadeable>(null)

  const stars = useMemo(() => buildConstellations(), [])
  const book = useMemo(() => bookOutline(), [])
  const labelPos = useMemo<[number, number, number]>(() => {
    const v = chartWorld(CYGNUS_LABEL[0], CYGNUS_LABEL[1], new THREE.Vector3())
    return [v.x, v.y - 0.12, v.z + 0.05]
  }, [])

  // One instanced quad per page; per-instance chart tile and morph delay.
  const pageGeo = useDisposable(() => {
    const g = new THREE.PlaneGeometry(1, 1)
    const tile = new Float32Array(PAGES * 2)
    const delay = new Float32Array(PAGES)
    for (let i = 0; i < PAGES; i++) {
      tile[i * 2] = i % COLS
      tile[i * 2 + 1] = ROWS - 1 - Math.floor(i / COLS)
      delay[i] = peelStart(i) + 0.17
    }
    g.setAttribute('aTile', new THREE.InstancedBufferAttribute(tile, 2))
    g.setAttribute('aDelay', new THREE.InstancedBufferAttribute(delay, 1))
    return g
  })
  const pageMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: hdr(PALETTE.stellarBlue, GLOW.base) },
      uGrid: { value: hdr(PALETTE.stellarBlue, 0.32) },
      uTime: { value: 0 },
      uP: { value: 0 },
      uOpacity: { value: 0 },
    },
    vertexShader: PAGE_VERT,
    fragmentShader: PAGE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  }))

  const nodeGeo = useDisposable(() => {
    const g = new THREE.BufferGeometry()
    const n = stars.nodeDelay.length
    const seed = new Float32Array(n)
    for (let i = 0; i < n; i++) seed[i] = 0.6 + 0.4 * seeded(i, 3)
    g.setAttribute('position', new THREE.BufferAttribute(stars.nodes, 3))
    g.setAttribute('aDelay', new THREE.BufferAttribute(stars.nodeDelay, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [stars])
  const nodeMat = useDisposable(() => starMaterial(hdr(PALETTE.nearWhite, GLOW.hero), 64, 0.18))

  // Background chart stars, printed faintly on the chart.
  const fieldCount = quality === 'mobile' ? 90 : quality === 'low' ? 170 : 340
  const fieldGeo = useDisposable(() => {
    const pos = new Float32Array(fieldCount * 3)
    const delay = new Float32Array(fieldCount)
    const seed = new Float32Array(fieldCount)
    const v = new THREE.Vector3()
    for (let i = 0; i < fieldCount; i++) {
      chartWorld(seeded(i, 1), seeded(i, 2), v)
      pos[i * 3] = v.x
      pos[i * 3 + 1] = v.y
      pos[i * 3 + 2] = v.z - 0.01
      delay[i] = 2 // never "ignites": stays at its base level
      seed[i] = Math.pow(seeded(i, 4), 2.2)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [fieldCount])
  const fieldMat = useDisposable(() => starMaterial(hdr(PALETTE.stellarBlue, 1.0), 30, 0.55))

  const figureMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.stellarBlue, 0.12),
    rim: hdr(PALETTE.nearWhite, GLOW.hero),
    power: 1.8,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock

    const appear = ease(p, 0.0, 0.14)
    setLineOpacity(bookRef.current, appear * 0.9)

    // 1 · pages peel off the book and fly up into the chart
    const pages = pagesRef.current
    if (pages) {
      setUniform(pages, 'uP', p)
      setUniform(pages, 'uTime', t)
      setUniform(pages, 'uOpacity', appear)
      for (let i = 0; i < PAGES; i++) {
        const s = peelStart(i)
        const flip = ease(p, s, s + 0.1)
        const fly = ease(p, s + 0.05, s + 0.22)
        const theta = flip * 0.62 * Math.PI
        // hinge on the spine (book-local Y), lifting out of the page toward +Z
        _peel.set((PAGE_W / 2) * Math.cos(theta), 0, (PAGE_W / 2) * Math.sin(theta) + (PAGES - i) * 0.005)
          .applyQuaternion(QBOOK).add(BOOK_POS)
        _q.setFromAxisAngle(AXIS_Y, -theta).premultiply(QBOOK)
        const col = i % COLS
        const row = Math.floor(i / COLS)
        _tile.set(CHART_X0 + (col + 0.5) * TILE_W, CHART_Y0 + (ROWS - 1 - row + 0.5) * TILE_H, CHART_Z)
        _obj.position.lerpVectors(_peel, _tile, fly)
        _obj.position.y += Math.sin(Math.PI * fly) * 0.55
        _obj.quaternion.slerpQuaternions(_q, IDENTITY, fly)
        _obj.scale.set(PAGE_W + (TILE_W - PAGE_W) * fly, PAGE_H + (TILE_H - PAGE_H) * fly, 1)
        _obj.updateMatrix()
        pages.setMatrixAt(i, _obj.matrix)
      }
      pages.instanceMatrix.needsUpdate = true
    }

    // 2 · the chart's stars, then constellations igniting outward from the figure
    const chart = ease(p, 0.36, 0.56)
    const ignite = ease(p, 0.48, 0.76)
    setUniform(fieldRef.current, 'uOpacity', chart)
    setUniform(fieldRef.current, 'uTime', t)
    setUniform(nodesRef.current, 'uOpacity', chart)
    setUniform(nodesRef.current, 'uIgnite', ignite)
    setUniform(nodesRef.current, 'uTime', t)
    setLineReveal(linesRef.current, ignite)

    // 3 · the child: present from the start, glowing brighter as the sky lights up
    const glow = figureGlowRef.current
    if (glow) {
      const breathe = 0.92 + 0.08 * Math.sin(t * 1.4)
      ;(glow.material as THREE.SpriteMaterial).opacity = appear * (0.45 + 0.55 * ignite) * breathe
      const s = 1.0 + 0.5 * ignite + 0.15 * ease(p, 0.85, 1)
      glow.scale.set(s, s, 1)
    }
    const figure = figureRef.current
    if (figure) figure.rotation.x = -0.12 * ramp(p, 0.3, 0.6)

    if (labelRef.current) labelRef.current.fillOpacity = ease(p, 0.7, 0.8) * 0.7
  })

  return (
    <group>
      {/* The open textbook */}
      <group position={BOOK_POS} rotation={[BOOK_TILT, 0, 0]}>
        <LightLine ref={bookRef} points={book} segments color={PALETTE.stellarBlue} intensity={GLOW.base} width={0.012} opacity={0} />
      </group>

      {/* Pages of light: book sheets that become the star chart's tiles */}
      <instancedMesh ref={pagesRef} args={[pageGeo, pageMat, PAGES]} frustumCulled={false} />

      {/* Chart stars and the constellations */}
      <points ref={fieldRef} geometry={fieldGeo} material={fieldMat} frustumCulled={false} />
      <LightLine ref={linesRef} points={stars.linePoints} segments color={PALETTE.stellarBlue} intensity={1.7} width={0.016} />
      <points ref={nodesRef} geometry={nodeGeo} material={nodeMat} frustumCulled={false} />

      {/* The small glowing figure */}
      <group ref={figureRef} position={FIGURE}>
        <mesh position={[0, 0.25, 0]} material={figureMat}>
          <capsuleGeometry args={[0.085, 0.26, 6, 16]} />
        </mesh>
        <mesh position={[0, 0.56, 0]} material={figureMat}>
          <sphereGeometry args={[0.08, 24, 24]} />
        </mesh>
      </group>
      <GlowSprite ref={figureGlowRef} position={[FIGURE.x, FIGURE.y + 0.42, FIGURE.z]} color={PALETTE.stellarBlue} intensity={GLOW.hero} size={1} opacity={0} />

      <Label ref={labelRef} position={labelPos} color={PALETTE.stellarBlue} opacity={0}>Cygnus</Label>
    </group>
  )
}
