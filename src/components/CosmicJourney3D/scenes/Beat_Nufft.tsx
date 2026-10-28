// src/components/CosmicJourney3D/scenes/Beat_Nufft.tsx
'use client'

// Beat 18 · First Publication & New Horizons (Act III, ignition).
// A non-uniform FFT made of light. Visibilities lie scattered along the
// elliptical uv tracks an interferometer traces as the Earth turns. One by one
// they hop onto a regular grid (gridding), the occupied cells brighten with the
// weight they collect, and a bright bar sweeps the grid (the FFT). Light then
// carries the result across to a journal page made of light, which settles into
// place with the dirty image as its figure, and a small gold seal.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, pulse, seeded } from '../art/anim'

// The uv plane, tipped back like a light table.
const UV_POSITION = new THREE.Vector3(-1.45, 1.0, -1.7)
const UV_ROTATION = new THREE.Euler(-0.5, 0.22, 0)
const CELLS = 12
const CELL = 0.24
const HALF = (CELLS * CELL) / 2
const TRACK_ASPECT = 0.62
const SAMPLES_PER_ARC = 5

// The page: where it rests, and where it falls from.
const PAGE_W = 1.7
const PAGE_H = 2.2
const PAGE_REST = new THREE.Vector3(2.35, 1.3, -1.1)
const PAGE_REST_ROT = new THREE.Euler(-0.04, -0.34, 0.0)
const PAGE_FROM = new THREE.Vector3(2.9, 4.2, -2.8)
const PAGE_FROM_ROT = new THREE.Euler(0.7, -1.0, 0.3)
// The figure box on the page, in page uv.
const FIG = { u0: 0.53, u1: 0.92, v0: 0.33, v1: 0.56 }
const FROZEN_T = 5.0

const SAMPLE_VERT = /* glsl */ `
  attribute vec2 aTrack;
  attribute vec3 aTo;
  attribute float aDelay;
  uniform float uSnap;
  uniform float uRot;
  uniform float uSize;
  uniform float uAspect;
  varying float vK;
  void main() {
    float k = smoothstep(aDelay, aDelay + 0.55, uSnap);
    vK = k;
    // before gridding, each sample slides a little along its uv track (Earth rotation)
    float phi = aTrack.y + uRot * (1.0 - k);
    vec3 start = vec3(aTrack.x * cos(phi), aTrack.x * sin(phi) * uAspect, 0.0);
    vec3 p = mix(start, aTo, k);
    p.z += sin(k * 3.14159) * 0.22;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (1.0 - 0.35 * k) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const SAMPLE_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uFrom;
  uniform vec3 uTo;
  uniform float uOpacity;
  varying float vK;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    // bright while in flight, quieter once its weight has joined the grid cell
    float lum = 1.0 - 0.55 * smoothstep(0.85, 1.0, vK);
    gl_FragColor = vec4(mix(uFrom, uTo, vK) * a * lum * uOpacity, 1.0);
  }
`

const CELL_VERT = /* glsl */ `
  attribute float aWeight;
  attribute float aDelay;
  uniform float uGrid;
  uniform float uSweep;
  uniform float uSize;
  varying float vLum;
  void main() {
    float fill = smoothstep(aDelay + 0.3, aDelay + 0.6, uGrid);
    // the FFT sweep lights each cell as it passes
    float swept = exp(-pow((position.x - uSweep) / 0.18, 2.0));
    vLum = fill * (0.35 + 0.65 * aWeight) * (1.0 + 1.4 * swept);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (0.55 + 0.6 * sqrt(aWeight)) * fill / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const CELL_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  varying float vLum;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    gl_FragColor = vec4(uColor * a * vLum, 1.0);
  }
`

const PAGE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// A journal page made of light: masthead, title, authors, abstract, two columns,
// and a figure box holding the dirty image (a beam with sidelobes and two sources).
const PAGE_FRAG = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uMast;
  uniform vec3 uFig;
  uniform float uOpacity;
  uniform float uFigure;
  uniform float uTime;
  uniform vec4 uFigBox;
  varying vec2 vUv;
  float hash(float n) { return fract(sin(n) * 43758.5453); }
  float band(float v, float a, float b) { return step(a, v) * step(v, b); }
  float textRows(vec2 uv, float x0, float x1, float y0, float y1, float rows, float seed) {
    float r = (uv.y - y0) / (y1 - y0) * rows;
    float row = floor(r);
    float f = fract(r);
    float inRow = smoothstep(0.3, 0.4, f) * (1.0 - smoothstep(0.6, 0.7, f));
    float last = step(rows - 1.0, row);
    float len = mix(0.92 + 0.08 * hash(row + seed), 0.35 + 0.4 * hash(row * 3.1 + seed), last);
    return inRow * band(uv.x, x0, x0 + (x1 - x0) * len) * band(uv.y, y0, y1);
  }
  void main() {
    vec2 uv = vUv;
    vec2 e = min(uv, 1.0 - uv);
    float edge = 1.0 - smoothstep(0.0, 0.012, min(e.x, e.y));
    float fill = 0.045 + 0.02 * (0.5 + 0.5 * sin(uv.y * 160.0 - uTime * 1.5));

    float mast = band(uv.y, 0.925, 0.94) * band(uv.x, 0.08, 0.92);
    float title = band(uv.y, 0.855, 0.875) * band(uv.x, 0.12, 0.88) + band(uv.y, 0.825, 0.845) * band(uv.x, 0.22, 0.78);
    float authors = band(uv.y, 0.785, 0.797) * band(uv.x, 0.26, 0.74) * step(0.25, fract(uv.x * 9.0));
    float abs1 = textRows(uv, 0.14, 0.86, 0.62, 0.75, 6.0, 1.0);
    float left = textRows(uv, 0.08, 0.47, 0.07, 0.57, 20.0, 7.0);
    float right = textRows(uv, 0.53, 0.92, 0.07, 0.3, 9.0, 13.0);

    // figure: the dirty image
    vec2 fc = (uv - uFigBox.xy) / (uFigBox.zw - uFigBox.xy);
    float inFig = band(fc.x, 0.0, 1.0) * band(fc.y, 0.0, 1.0);
    vec2 c = (fc - 0.5) * vec2(2.0, 1.2);
    float r = length(c);
    float beam = exp(-r * r * 40.0) + 0.22 * max(0.0, cos(r * 22.0)) * exp(-r * 3.0);
    vec2 c2 = c - vec2(0.45, 0.2);
    beam += 0.5 * exp(-dot(c2, c2) * 70.0);
    vec2 fe = min(fc, 1.0 - fc);
    float frame = inFig * (1.0 - smoothstep(0.0, 0.03, min(fe.x, fe.y)));
    float fig = inFig * beam * uFigure;

    vec3 col = uInk * (fill + edge * 1.1 + title * 0.75 + authors * 0.4 + (abs1 + left + right) * 0.32)
      + uMast * mast * 1.0
      + uFig * (fig * 1.3 + frame * 0.45);
    gl_FragColor = vec4(col * uOpacity, 1.0);
  }
`

interface SampleSet {
  geometry: THREE.BufferGeometry
  cells: THREE.BufferGeometry
}

const cellIndex = (v: number) => Math.min(CELLS - 1, Math.max(0, Math.floor(v / CELL + CELLS / 2)))
const cellCenter = (i: number) => (i - CELLS / 2 + 0.5) * CELL

// Visibilities along Earth-rotation uv tracks (each with its conjugate), and the
// grid cells they land in, weighted by how many samples each cell collects.
function buildSamples(count: number): SampleSet {
  const baselines = Math.max(4, Math.round(count / (SAMPLES_PER_ARC * 2)))
  const n = baselines * SAMPLES_PER_ARC * 2
  const track = new Float32Array(n * 2)
  const to = new Float32Array(n * 3)
  const delay = new Float32Array(n)
  const weights = new Float32Array(CELLS * CELLS)
  const firstDelay = new Float32Array(CELLS * CELLS).fill(1)
  let i = 0
  for (let b = 0; b < baselines; b++) {
    const length = 0.22 + Math.sqrt(seeded(b, 1)) * (HALF - 0.3)
    const psi = seeded(b, 2) * Math.PI * 2
    const span = 0.5 + seeded(b, 3) * 0.6
    for (const sign of [1, -1]) {
      for (let s = 0; s < SAMPLES_PER_ARC; s++) {
        const phi = psi + (s / (SAMPLES_PER_ARC - 1) - 0.5) * span + (sign < 0 ? Math.PI : 0)
        const u = length * Math.cos(phi)
        const v = length * Math.sin(phi) * TRACK_ASPECT
        const cx = cellIndex(u)
        const cy = cellIndex(v)
        track[i * 2] = length
        track[i * 2 + 1] = phi
        to[i * 3] = cellCenter(cx)
        to[i * 3 + 1] = cellCenter(cy)
        // grid inward-out: short baselines snap first, with a little scatter
        const d = (length / HALF) * 0.3 + seeded(i, 4) * 0.12
        delay[i] = d
        weights[cy * CELLS + cx]! += 1
        firstDelay[cy * CELLS + cx] = Math.min(firstDelay[cy * CELLS + cx]!, d)
        i++
      }
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
  geometry.setAttribute('aTrack', new THREE.BufferAttribute(track, 2))
  geometry.setAttribute('aTo', new THREE.BufferAttribute(to, 3))
  geometry.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1))

  let maxWeight = 1
  for (let c = 0; c < weights.length; c++) maxWeight = Math.max(maxWeight, weights[c]!)
  const cellPos: number[] = []
  const cellWeight: number[] = []
  const cellDelay: number[] = []
  for (let cy = 0; cy < CELLS; cy++) {
    for (let cx = 0; cx < CELLS; cx++) {
      const w = weights[cy * CELLS + cx]!
      if (w === 0) continue
      cellPos.push(cellCenter(cx), cellCenter(cy), 0)
      cellWeight.push(w / maxWeight)
      cellDelay.push(firstDelay[cy * CELLS + cx]!)
    }
  }
  const cells = new THREE.BufferGeometry()
  cells.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cellPos), 3))
  cells.setAttribute('aWeight', new THREE.BufferAttribute(new Float32Array(cellWeight), 1))
  cells.setAttribute('aDelay', new THREE.BufferAttribute(new Float32Array(cellDelay), 1))
  return { geometry, cells }
}

function gridPoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= CELLS; i++) {
    const c = -HALF + i * CELL
    pts.push(new THREE.Vector3(c, -HALF, 0), new THREE.Vector3(c, HALF, 0))
    pts.push(new THREE.Vector3(-HALF, c, 0), new THREE.Vector3(HALF, c, 0))
  }
  return pts
}

// Light carrying the transform from the grid's corners to the page's figure box.
function projectionPoints(): THREE.Vector3[] {
  const uvMatrix = new THREE.Matrix4().compose(UV_POSITION, new THREE.Quaternion().setFromEuler(UV_ROTATION), new THREE.Vector3(1, 1, 1))
  const pageMatrix = new THREE.Matrix4().compose(PAGE_REST, new THREE.Quaternion().setFromEuler(PAGE_REST_ROT), new THREE.Vector3(1, 1, 1))
  const fx = (u: number) => (u - 0.5) * PAGE_W
  const fy = (v: number) => (v - 0.5) * PAGE_H
  const corners: Array<[[number, number], [number, number]]> = [
    [[HALF, HALF], [fx(FIG.u1), fy(FIG.v1)]],
    [[HALF, -HALF], [fx(FIG.u1), fy(FIG.v0)]],
    [[-HALF, HALF], [fx(FIG.u0), fy(FIG.v1)]],
    [[-HALF, -HALF], [fx(FIG.u0), fy(FIG.v0)]],
  ]
  return corners.flatMap(([[gx, gy], [px, py]]) => [
    new THREE.Vector3(gx, gy, 0).applyMatrix4(uvMatrix),
    new THREE.Vector3(px, py, 0.01).applyMatrix4(pageMatrix),
  ])
}

function circlePoints(radius: number, aspect: number, n: number): THREE.Vector3[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius * aspect, 0)
  })
}

export default function Beat_Nufft({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const samplesRef = useRef<THREE.Points>(null)
  const cellsRef = useRef<THREE.Points>(null)
  const gridRef = useRef<LightLineObject>(null)
  const coverageRef = useRef<LightLineObject>(null)
  const sweepRef = useRef<THREE.Group>(null)
  const sweepLineRef = useRef<LightLineObject>(null)
  const projectionRef = useRef<LightLineObject>(null)
  const pageGroupRef = useRef<THREE.Group>(null)
  const pageRef = useRef<THREE.Mesh>(null)
  const sealRef = useRef<THREE.Sprite>(null)
  const labelRef = useRef<THREE.Mesh & { fillOpacity: number }>(null)

  const sampleCount = quality === 'mobile' ? 100 : quality === 'low' ? 200 : 400
  const samples = useMemo(() => buildSamples(sampleCount), [sampleCount])
  const sampleGeo = useDisposable(() => samples.geometry, [samples])
  const cellGeo = useDisposable(() => samples.cells, [samples])
  const grid = useMemo(() => gridPoints(), [])
  const coverage = useMemo(() => circlePoints(HALF - 0.04, TRACK_ASPECT, 96), [])
  const sweep = useMemo(() => [new THREE.Vector3(0, -HALF, 0.02), new THREE.Vector3(0, HALF, 0.02)], [])
  const projection = useMemo(() => projectionPoints(), [])

  const sampleMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uSnap: { value: 0 },
      uRot: { value: 0 },
      uSize: { value: 30 },
      uAspect: { value: TRACK_ASPECT },
      uFrom: { value: hdr(PALETTE.stellarBlue, 1.5) },
      uTo: { value: hdr(PALETTE.signal, 1.3) },
      uOpacity: { value: 0 },
    },
    vertexShader: SAMPLE_VERT,
    fragmentShader: SAMPLE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  const cellMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uGrid: { value: 0 },
      uSweep: { value: -10 },
      uSize: { value: 70 },
      uColor: { value: hdr(PALETTE.signal, GLOW.hero) },
    },
    vertexShader: CELL_VERT,
    fragmentShader: CELL_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  const pageMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uInk: { value: hdr(PALETTE.nearWhite, GLOW.base) },
      uMast: { value: hdr(PALETTE.starGold, 1.4) },
      uFig: { value: hdr(PALETTE.signal, 1.6) },
      uOpacity: { value: 0 },
      uFigure: { value: 0 },
      uTime: { value: 0 },
      uFigBox: { value: new THREE.Vector4(FIG.u0, FIG.v0, FIG.u1, FIG.v1) },
    },
    vertexShader: PAGE_VERT,
    fragmentShader: PAGE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? FROZEN_T : beat.clock

    // 1 · scattered visibilities on their uv tracks, the grid faint beneath
    const samplesObj = samplesRef.current
    setUniform(samplesObj, 'uOpacity', ease(p, 0.0, 0.14))
    setUniform(samplesObj, 'uRot', reducedMotion ? 0 : Math.sin(t * 0.05) * 0.12)
    setLineOpacity(gridRef.current, ease(p, 0.04, 0.22) * 0.55)
    setLineReveal(coverageRef.current, ease(p, 0.0, 0.2))
    setLineOpacity(coverageRef.current, 0.5 * (1 - 0.6 * ease(p, 0.4, 0.55)))

    // 2 · gridding: samples snap onto the regular grid, inner baselines first
    const snap = ease(p, 0.17, 0.47)
    setUniform(samplesObj, 'uSnap', snap)
    const cellsObj = cellsRef.current
    setUniform(cellsObj, 'uGrid', snap)

    // 3 · the FFT: a bright bar sweeps the grid
    const sweepK = ease(p, 0.46, 0.58)
    const sweepX = -HALF + sweepK * HALF * 2
    setUniform(cellsObj, 'uSweep', sweepK > 0 && sweepK < 1 ? sweepX : -10)
    const sweepGroup = sweepRef.current
    if (sweepGroup) sweepGroup.position.x = sweepX
    setLineOpacity(sweepLineRef.current, pulse(p, 0.45, 0.59))

    // 4 · light carries the result to the page
    setLineReveal(projectionRef.current, ease(p, 0.55, 0.66))
    setLineOpacity(projectionRef.current, ease(p, 0.55, 0.6) * (1 - 0.75 * ease(p, 0.72, 0.84)) * 0.6)

    // 5 · the page settles into place
    const settle = ease(p, 0.5, 0.8)
    const page = pageGroupRef.current
    if (page) {
      page.position.lerpVectors(PAGE_FROM, PAGE_REST, settle)
      const wobble = Math.sin(settle * Math.PI * 2) * (1 - settle) * 0.12
      page.rotation.set(
        PAGE_FROM_ROT.x + (PAGE_REST_ROT.x - PAGE_FROM_ROT.x) * settle,
        PAGE_FROM_ROT.y + (PAGE_REST_ROT.y - PAGE_FROM_ROT.y) * settle,
        PAGE_FROM_ROT.z + (PAGE_REST_ROT.z - PAGE_FROM_ROT.z) * settle + wobble,
      )
      page.visible = p > 0.48
    }
    const pageMesh = pageRef.current
    setUniform(pageMesh, 'uOpacity', ease(p, 0.5, 0.64))
    setUniform(pageMesh, 'uFigure', ease(p, 0.62, 0.76))
    setUniform(pageMesh, 'uTime', t)
    const seal = sealRef.current
    if (seal) {
      const glow = ease(p, 0.74, 0.8) * 0.55 + pulse(p, 0.74, 0.9) * 0.45
      ;(seal.material as THREE.SpriteMaterial).opacity = glow
      const s = 0.35 + 0.25 * pulse(p, 0.74, 0.9)
      seal.scale.set(s, s, 1)
    }

    if (labelRef.current) labelRef.current.fillOpacity = ease(p, 0.2, 0.34) * 0.8
  })

  return (
    <group>
      {/* The uv plane: grid, coverage, samples, gridded cells, FFT sweep */}
      <group position={UV_POSITION} rotation={UV_ROTATION}>
        <LightLine ref={gridRef} points={grid} segments color={PALETTE.signal} intensity={GLOW.dim} width={0.007} opacity={0} />
        <LightLine ref={coverageRef} points={coverage} color={PALETTE.stellarBlue} intensity={GLOW.base} width={0.008} dashed dashSize={0.06} gapSize={0.08} />
        <points ref={samplesRef} geometry={sampleGeo} material={sampleMat} frustumCulled={false} />
        <points ref={cellsRef} geometry={cellGeo} material={cellMat} frustumCulled={false} />
        <group ref={sweepRef} position={[-HALF, 0, 0]}>
          <LightLine ref={sweepLineRef} points={sweep} color={PALETTE.nearWhite} intensity={GLOW.hero} width={0.026} opacity={0} />
        </group>
      </group>

      <LightLine ref={projectionRef} points={projection} segments color={PALETTE.signal} intensity={GLOW.base} width={0.008} opacity={0} />

      {/* The journal page */}
      <group ref={pageGroupRef} position={PAGE_FROM} rotation={PAGE_FROM_ROT} visible={false}>
        <mesh ref={pageRef} material={pageMat}>
          <planeGeometry args={[PAGE_W, PAGE_H]} />
        </mesh>
        <GlowSprite ref={sealRef} position={[PAGE_W * 0.36, PAGE_H * 0.43, 0.03]} color={PALETTE.starGold} intensity={GLOW.hot} size={0.35} opacity={0} />
      </group>

      <Label preserveCase ref={labelRef} position={[UV_POSITION.x, UV_POSITION.y + 2.15, UV_POSITION.z - 0.8]} color={PALETTE.signal} opacity={0}>
        fftvis · NUFFT
      </Label>
    </group>
  )
}
