// src/components/CosmicJourney3D/scenes/Beat_EorWedge.tsx
'use client'

// Beat 30 · What I'm Working On (Act V, ember).
// A holographic 2D power spectrum in the (k_perp, k_par) plane, with axes made of
// light. The smooth-spectrum foregrounds fill a glowing wedge below the horizon
// line. A low-rank systematics model then peels translucent layers off the wedge
// one mode at a time; each lifts off toward the viewer and fades, the wedge
// dims, and above the horizon a quiet, faintly mottled EoR window is left.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { createHoloMaterial, setUniform, useDisposable } from '../art/materials'
import { NOISE_GLSL } from '../art/glsl'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease } from '../art/anim'

// Plot frame (group-local units). The axes' origin sits at the lower left.
const PLOT_W = 5.2
const PLOT_H = 3.1
const ORIGIN_X = -PLOT_W / 2
const ORIGIN_Y = -1.5
const PLOT_CY = ORIGIN_Y + PLOT_H / 2
// Horizon line in plot units (0..1 on both axes): k_par = SLOPE * k_perp + BUFFER.
const HORIZON_SLOPE = 0.85
const HORIZON_BUFFER = 0.08
const LAYERS = 4
// Where the whole plot hangs in the station, turned slightly so the peel reads in depth.
const PLOT_POSITION = new THREE.Vector3(0.1, 1.05, -1.6)
const PLOT_ROTATION = new THREE.Euler(-0.05, -0.16, 0)

const PLANE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// The power spectrum. uv is (k_perp, k_par) in plot units.
const SPECTRUM_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform float uDraw;
  uniform float uFg;
  uniform float uEor;
  uniform float uTime;
  uniform vec3 uFgHot;
  uniform vec3 uFgWarm;
  uniform vec3 uEorColor;
  uniform vec3 uGrid;
  varying vec2 vUv;
  float gridLine(float v, float spacing) {
    float g = abs(fract(v / spacing - 0.5) - 0.5) * spacing;
    return 1.0 - smoothstep(0.0, fwidth(v) * 1.2, g);
  }
  void main() {
    vec2 k = vUv;
    float horizon = ${HORIZON_BUFFER.toFixed(3)} + ${HORIZON_SLOPE.toFixed(3)} * k.x;
    float d = k.y - horizon;
    // foregrounds: spectrally smooth, so they pile up at low k_par and stay below the horizon
    float inside = 1.0 - smoothstep(-0.01, 0.05, d);
    float leak = exp(-max(d, 0.0) * 24.0) * 0.22;
    float streak = 0.72 + 0.28 * vnoise(vec3(k.x * 30.0, k.y * 5.0, 1.7));
    float fg = (inside * (0.22 + 0.95 * exp(-k.y * 3.2)) + leak) * streak;
    float dh = d / 0.012;
    fg += exp(-dh * dh) * 0.45 * step(0.0, k.x);
    vec3 col = mix(uFgWarm, uFgHot, clamp(fg * fg, 0.0, 1.0)) * fg * uFg;
    // the EoR window: a faint, isotropic, mottled signal above the horizon
    float win = smoothstep(0.03, 0.12, d) * smoothstep(0.02, 0.08, k.x) * (1.0 - smoothstep(0.9, 1.0, k.y));
    float eor = (0.5 + 0.5 * vnoise(vec3(k * vec2(13.0, 8.0), uTime * 0.05))) * exp(-length(k) * 1.1);
    col += uEorColor * eor * win * uEor;
    float grid = max(gridLine(k.x, 0.2), gridLine(k.y, 0.2));
    col += uGrid * grid;
    // drawn in radially from the origin
    float reveal = smoothstep(uDraw * 1.6, uDraw * 1.6 - 0.18, length(k));
    gl_FragColor = vec4(col * reveal, 1.0);
  }
`

// Model layers: instanced copies of the wedge. Layer i peels when uPeel passes i:
// it hinges up from its bottom edge toward the viewer, drifts up and right, fades.
const LAYER_VERT = /* glsl */ `
  attribute float aLayer;
  uniform float uPeel;
  uniform float uHeight;
  varying vec2 vUv;
  varying float vPeel;
  varying float vLayer;
  void main() {
    vUv = uv;
    float peel = clamp(uPeel - aLayer, 0.0, 1.0);
    float pe = peel * peel * (3.0 - 2.0 * peel);
    vPeel = peel;
    vLayer = aLayer;
    vec3 p = position;
    float yy = p.y + uHeight * 0.5;
    float ang = pe * 0.5;
    p.y = -uHeight * 0.5 + yy * cos(ang);
    p.z = yy * sin(ang) + 0.04 + aLayer * 0.04;
    p += vec3(1.4, 0.8, 0.6) * pe;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const LAYER_FRAG = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uEdge;
  uniform vec3 uFill;
  varying vec2 vUv;
  varying float vPeel;
  varying float vLayer;
  void main() {
    vec2 k = vUv;
    float horizon = ${HORIZON_BUFFER.toFixed(3)} + ${HORIZON_SLOPE.toFixed(3)} * k.x;
    float d = k.y - horizon;
    float mask = 1.0 - smoothstep(-0.006, 0.006, d);
    // each layer is one smooth mode of the foreground: its own k_perp ripple and k_par falloff
    float mode = 0.55 + 0.45 * cos(k.x * (6.0 + vLayer * 7.0) + vLayer * 1.3);
    float fall = exp(-k.y * (2.0 + vLayer * 1.2));
    float fill = mask * mode * fall;
    // glowing outline: the horizon edge and the plot edges inside the wedge
    float dh = d / 0.006;
    float edgeH = exp(-dh * dh);
    vec2 e = min(k, 1.0 - k);
    float edgeB = (1.0 - smoothstep(0.0, 0.006, min(e.x, e.y))) * mask;
    float scan = 0.85 + 0.15 * sin(k.y * 160.0);
    float lift = 0.22 + 0.78 * sin(3.14159 * vPeel);
    float fade = 1.0 - smoothstep(0.55, 1.0, vPeel);
    vec3 col = uFill * fill * scan * 0.55 + uEdge * (edgeH + edgeB) * 0.9;
    gl_FragColor = vec4(col * lift * fade * uOpacity, 1.0);
  }
`

function layerGeometry(): THREE.PlaneGeometry {
  const g = new THREE.PlaneGeometry(PLOT_W, PLOT_H)
  const layer = new Float32Array(LAYERS)
  for (let i = 0; i < LAYERS; i++) layer[i] = i
  g.setAttribute('aLayer', new THREE.InstancedBufferAttribute(layer, 1))
  return g
}

/** Axes, ticks and arrowheads as line segments, in drawing order. */
function axesPoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const seg = (ax: number, ay: number, bx: number, by: number) => pts.push(new THREE.Vector3(ax, ay, 0.02), new THREE.Vector3(bx, by, 0.02))
  const xEnd = ORIGIN_X + PLOT_W + 0.3
  const yEnd = ORIGIN_Y + PLOT_H + 0.3
  seg(ORIGIN_X, ORIGIN_Y, xEnd, ORIGIN_Y)
  seg(ORIGIN_X, ORIGIN_Y, ORIGIN_X, yEnd)
  for (let i = 1; i <= 5; i++) {
    const x = ORIGIN_X + (PLOT_W * i) / 5
    const y = ORIGIN_Y + (PLOT_H * i) / 5
    seg(x, ORIGIN_Y, x, ORIGIN_Y - 0.08)
    seg(ORIGIN_X, y, ORIGIN_X - 0.08, y)
  }
  // arrowheads drawn as chevrons
  seg(xEnd, ORIGIN_Y, xEnd - 0.14, ORIGIN_Y + 0.08)
  seg(xEnd, ORIGIN_Y, xEnd - 0.14, ORIGIN_Y - 0.08)
  seg(ORIGIN_X, yEnd, ORIGIN_X - 0.08, yEnd - 0.14)
  seg(ORIGIN_X, yEnd, ORIGIN_X + 0.08, yEnd - 0.14)
  return pts
}

export default function Beat_EorWedge({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const panelRef = useRef<THREE.Mesh>(null)
  const spectrumRef = useRef<THREE.Mesh>(null)
  const layersRef = useRef<THREE.InstancedMesh>(null)
  const axesRef = useRef<LightLineObject>(null)
  const horizonRef = useRef<LightLineObject>(null)
  const kPerpRef = useRef<THREE.Mesh & { fillOpacity: number }>(null)
  const kParRef = useRef<THREE.Mesh & { fillOpacity: number }>(null)
  const windowRef = useRef<THREE.Mesh & { fillOpacity: number }>(null)

  const axes = useMemo(() => axesPoints(), [])
  const horizon = useMemo(() => {
    const k1 = (1 - HORIZON_BUFFER) / HORIZON_SLOPE
    const end = Math.min(1, k1)
    return [
      new THREE.Vector3(ORIGIN_X, ORIGIN_Y + HORIZON_BUFFER * PLOT_H, 0.03),
      new THREE.Vector3(ORIGIN_X + end * PLOT_W, ORIGIN_Y + (HORIZON_BUFFER + HORIZON_SLOPE * end) * PLOT_H, 0.03),
    ]
  }, [])

  const panelMat = useDisposable(() => {
    const m = createHoloMaterial(hdr(PALETTE.ember, 0.42))
    m.uniforms.uOpacity!.value = 0
    return m
  })

  const spectrumMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uDraw: { value: 0 },
      uFg: { value: 1 },
      uEor: { value: 0 },
      uTime: { value: 0 },
      uFgHot: { value: hdr(PALETTE.ember, GLOW.hero) },
      uFgWarm: { value: hdr(PALETTE.emberDeep, GLOW.base) },
      uEorColor: { value: hdr(PALETTE.hydrogen, 0.6) },
      uGrid: { value: hdr(PALETTE.nearWhite, 0.05) },
    },
    vertexShader: PLANE_VERT,
    fragmentShader: SPECTRUM_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  const layerGeo = useDisposable(layerGeometry)
  const layerMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uPeel: { value: 0 },
      uHeight: { value: PLOT_H },
      uOpacity: { value: 0 },
      uEdge: { value: hdr(PALETTE.starGold, 1.5) },
      uFill: { value: hdr(PALETTE.ember, 0.8) },
    },
    vertexShader: LAYER_VERT,
    fragmentShader: LAYER_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock

    // 1 · the holographic plot and its axes of light
    const panel = panelRef.current
    setUniform(panel, 'uOpacity', ease(p, 0.0, 0.18) * 0.8)
    setUniform(panel, 'uTime', t)
    setLineReveal(axesRef.current, ease(p, 0.06, 0.26))

    // 2 · the foreground wedge fills in from the origin
    const spectrum = spectrumRef.current
    setUniform(spectrum, 'uDraw', ease(p, 0.14, 0.36))
    setUniform(spectrum, 'uTime', t)

    // 3 · the low-rank model peels the wedge, one mode at a time
    const peel = ease(p, 0.36, 0.78) * LAYERS
    const layers = layersRef.current
    setUniform(layers, 'uPeel', peel)
    setUniform(layers, 'uOpacity', ease(p, 0.26, 0.36))
    setUniform(spectrum, 'uFg', 1 - 0.22 * peel)

    // 4 · what is left: a quiet EoR window above the horizon
    setUniform(spectrum, 'uEor', ease(p, 0.5, 0.82))
    setLineReveal(horizonRef.current, ease(p, 0.3, 0.46))
    setLineOpacity(horizonRef.current, ease(p, 0.3, 0.34) * 0.9)

    const axisLabels = ease(p, 0.2, 0.32) * 0.8
    if (kPerpRef.current) kPerpRef.current.fillOpacity = axisLabels
    if (kParRef.current) kParRef.current.fillOpacity = axisLabels
    if (windowRef.current) windowRef.current.fillOpacity = ease(p, 0.7, 0.82) * 0.7
  })

  return (
    <group position={PLOT_POSITION} rotation={PLOT_ROTATION}>
      {/* Holographic glass behind the plot */}
      <mesh ref={panelRef} position={[0, PLOT_CY + 0.05, -0.06]} material={panelMat}>
        <planeGeometry args={[PLOT_W + 0.9, PLOT_H + 0.85]} />
      </mesh>

      {/* The 2D power spectrum: foreground wedge, horizon, EoR window */}
      <mesh ref={spectrumRef} position={[0, PLOT_CY, 0]} material={spectrumMat} frustumCulled={false}>
        <planeGeometry args={[PLOT_W, PLOT_H]} />
      </mesh>

      {/* Low-rank model layers peeling off the wedge */}
      <group position={[0, PLOT_CY, 0]}>
        <instancedMesh ref={layersRef} args={[layerGeo, layerMat, LAYERS]} frustumCulled={false} />
      </group>

      <LightLine ref={axesRef} points={axes} segments color={PALETTE.nearWhite} intensity={GLOW.base} width={0.018} />
      <LightLine ref={horizonRef} points={horizon} color={PALETTE.starGold} intensity={1.4} width={0.016} dashed dashSize={0.12} gapSize={0.08} opacity={0} />

      <Label ref={kPerpRef} position={[ORIGIN_X + PLOT_W + 0.3, ORIGIN_Y - 0.3, 0.02]} anchorX="right" color={PALETTE.nearWhite} intensity={0.9} opacity={0} preserveCase>
        k_perp
      </Label>
      <Label ref={kParRef} position={[ORIGIN_X + 0.2, ORIGIN_Y + PLOT_H + 0.3, 0.02]} anchorX="left" color={PALETTE.nearWhite} intensity={0.9} opacity={0} preserveCase>
        k_par
      </Label>
      <Label ref={windowRef} position={[ORIGIN_X + 0.35, ORIGIN_Y + PLOT_H * 0.78, 0.04]} anchorX="left" color={PALETTE.hydrogen} intensity={1.0} opacity={0}>
        EoR window
      </Label>
    </group>
  )
}
