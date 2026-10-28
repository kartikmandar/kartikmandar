// src/components/CosmicJourney3D/scenes/Beat_Dashboard.tsx
'use client'

// Beat 13 · GSoC & Open Source (Act III, ignition).
// Stingray's quicklook, made of light. X-ray photons rain down in arrival order and
// pile into time bins, so a light curve (with a flare) builds left to right. The
// curve then lifts and folds up into a floating holographic panel, and two more
// panels hinge open beside it like a triptych: a power spectrum with a QPO peak,
// and a dynamical-spectrum heat strip where that QPO wanders in frequency.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { createHoloMaterial, getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { NOISE_GLSL } from '../art/glsl'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, pulse, seeded } from '../art/anim'

// Light-curve panel, in its own local frame (also the frame photons land in).
const LC_W = 3.0
const LC_H = 1.8
const PLOT_X = 1.3
const PLOT_Y = 0.68
const BINS = 96
// Assembly pose (photons land at this size, big and low) and the floating pose.
const ASSEMBLY_POS = new THREE.Vector3(0, 0.9, 0.2)
const ASSEMBLY_SCALE = 2.45
const PANEL_POS = new THREE.Vector3(0, 1.6, -1.4)
// Side panels hinge on the centre panel's edges.
const SIDE_W = 2.4
const SIDE_H = 1.6
const SIDE_OPEN = 0.38
const SIDE_CLOSED = Math.PI * 0.94
const RAIN_TOP = 4.6

// Deterministic count rate: a weak QPO-like wobble, a fast-rise slow-decay flare
// and Poisson-ish scatter. Returns 0..1 per bin.
function lightCurveRates(): Float32Array {
  const rates = new Float32Array(BINS)
  let max = 0
  for (let i = 0; i < BINS; i++) {
    const u = (i + 0.5) / BINS
    const flare = u < 0.6 ? Math.exp(-(((u - 0.6) / 0.03) ** 2)) : Math.exp(-(u - 0.6) / 0.11)
    const r = 0.36 + 0.1 * Math.sin(u * Math.PI * 2 * 7.5 + 0.6) + 0.5 * flare + 0.08 * (seeded(i, 31) - 0.5)
    rates[i] = r
    if (r > max) max = r
  }
  for (let i = 0; i < BINS; i++) rates[i] = rates[i]! / max
  return rates
}

const binX = (i: number) => -PLOT_X + ((i + 0.5) / BINS) * PLOT_X * 2
const rateY = (r: number) => -PLOT_Y + 0.08 + r * (PLOT_Y * 2 - 0.2)

function axesPoints(w: number, h: number): THREE.Vector3[] {
  return [
    new THREE.Vector3(-w, -h, 0), new THREE.Vector3(w, -h, 0),
    new THREE.Vector3(-w, -h, 0), new THREE.Vector3(-w, h, 0),
    // a few ticks on each axis
    ...[-0.5, 0, 0.5].flatMap((f) => [new THREE.Vector3(w * f, -h, 0), new THREE.Vector3(w * f, -h - 0.04, 0)]),
    ...[-0.4, 0.2, 0.8].flatMap((f) => [new THREE.Vector3(-w, h * f, 0), new THREE.Vector3(-w - 0.04, h * f, 0)]),
  ]
}

// Power spectrum on log-log axes: red noise, a QPO Lorentzian, a white-noise floor.
const PSD_X = 0.98
const PSD_Y = 0.6
const QPO_F = 0.58
function powerSpectrum(): { points: THREE.Vector3[]; peak: THREE.Vector3 } {
  const n = 120
  const pts: THREE.Vector3[] = []
  let peak = new THREE.Vector3()
  let best = -Infinity
  for (let i = 0; i <= n; i++) {
    const u = i / n
    const red = 1.05 * Math.pow(1 - u, 1.3)
    const qpo = 0.42 / (1 + ((u - QPO_F) / 0.035) ** 2)
    const floor = 0.08
    const scatter = 0.06 * (seeded(i, 41) - 0.5) * (0.4 + u)
    const y = -PSD_Y + (PSD_Y * 2) * Math.min(1, Math.max(0, red * 0.75 + qpo + floor + scatter))
    const v = new THREE.Vector3(-PSD_X + u * PSD_X * 2, y, 0.004)
    pts.push(v)
    if (u > 0.45 && u < 0.7 && y > best) {
      best = y
      peak = v
    }
  }
  return { points: pts, peak: peak.clone() }
}

const PLANE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Photons: each falls from above its time bin, in arrival order, and lands on the
// light curve with a brief flash. Positions computed on the GPU in the panel frame.
const PHOTON_VERT = /* glsl */ `
  attribute vec3 aTarget;
  attribute float aStartY;
  attribute float aDelay;
  attribute float aSeed;
  uniform float uFall;
  uniform float uSize;
  varying float vFalling;
  varying float vFlash;
  varying float vLanded;
  void main() {
    float q = clamp((uFall - aDelay) / 0.16, 0.0, 1.0);
    float landed = clamp((uFall - aDelay - 0.16) / 0.06, 0.0, 1.0);
    vec3 p = aTarget;
    p.y = mix(aStartY, aTarget.y, q * q);
    p.x += (1.0 - q) * (aSeed - 0.5) * 0.12;
    vFalling = step(0.0001, q) * (1.0 - step(1.0, q));
    vLanded = step(1.0, q);
    vFlash = vLanded * (1.0 - landed);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.7 + 0.6 * aSeed) * (1.0 + 1.6 * vFlash) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const PHOTON_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uFallColor;
  uniform vec3 uLandColor;
  uniform vec3 uFlashColor;
  uniform float uOpacity;
  varying float vFalling;
  varying float vFlash;
  varying float vLanded;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    vec3 col = uFallColor * vFalling + uLandColor * vLanded * (1.0 - vFlash) + uFlashColor * vFlash;
    gl_FragColor = vec4(col * a * uOpacity, 1.0);
  }
`

// Dynamical power spectrum: time along x, frequency along y. A QPO track wanders
// in frequency over a red-noise floor; colours climb void, blue, cyan, gold, white.
const HEAT_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform float uTime;
  uniform float uReveal;
  uniform float uOpacity;
  uniform vec3 uLow;
  uniform vec3 uMid;
  uniform vec3 uHigh;
  uniform vec3 uHot;
  varying vec2 vUv;
  void main() {
    float cols = floor(vUv.x * 48.0) / 48.0;
    float rows = floor(vUv.y * 20.0) / 20.0;
    float txs = cols * 6.0 + uTime * 0.25;
    float track = 0.55 + 0.12 * sin(txs * 0.9) + 0.06 * sin(txs * 2.3 + 1.0);
    float qpo = exp(-pow((rows - track) / 0.07, 2.0)) * (0.65 + 0.5 * vnoise(vec3(txs * 1.7, 0.0, 3.0)));
    float red = 0.55 * exp(-rows * 4.5);
    float speckle = 0.22 * hash13(vec3(floor(vUv.x * 48.0) + floor(uTime * 0.25 * 8.0), floor(vUv.y * 20.0), 7.0));
    float v = clamp(qpo + red + speckle, 0.0, 1.4);
    vec3 col = mix(uLow * 0.0, uLow, smoothstep(0.05, 0.35, v));
    col = mix(col, uMid, smoothstep(0.3, 0.65, v));
    col = mix(col, uHigh, smoothstep(0.6, 0.95, v));
    col = mix(col, uHot, smoothstep(0.95, 1.3, v));
    // thin dark gaps between cells keep it a strip of light, not a flat fill
    vec2 cell = fract(vUv * vec2(48.0, 20.0));
    float gap = smoothstep(0.0, 0.12, cell.x) * smoothstep(0.0, 0.12, cell.y);
    float shown = 1.0 - smoothstep(uReveal - 0.02, uReveal, vUv.x);
    gl_FragColor = vec4(col * gap * shown * uOpacity, 1.0);
  }
`

function photonGeometry(count: number, rates: Float32Array): THREE.BufferGeometry {
  // Sample bins in proportion to their count rate (deterministic inverse CDF).
  const cdf = new Float32Array(BINS)
  let sum = 0
  for (let i = 0; i < BINS; i++) {
    sum += rates[i]!
    cdf[i] = sum
  }
  const target = new Float32Array(count * 3)
  const startY = new Float32Array(count)
  const delay = new Float32Array(count)
  const seed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const pick = ((i + seeded(i, 51)) / count) * sum
    let b = 0
    while (b < BINS - 1 && cdf[b]! < pick) b++
    const u = (b + 0.5) / BINS
    const x = binX(b) + (seeded(i, 52) - 0.5) * ((PLOT_X * 2) / BINS)
    const y = rateY(rates[b]!) - 0.05 * seeded(i, 53) * seeded(i, 54)
    target[i * 3] = x
    target[i * 3 + 1] = y
    target[i * 3 + 2] = (seeded(i, 55) - 0.5) * 0.04
    // the rain starts above the frame, in the panel's (assembly-scaled) frame
    startY[i] = (RAIN_TOP + seeded(i, 56) * 1.4 - ASSEMBLY_POS.y) / ASSEMBLY_SCALE
    delay[i] = u * 0.72 + seeded(i, 57) * 0.1
    seed[i] = seeded(i, 58)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  g.setAttribute('aTarget', new THREE.BufferAttribute(target, 3))
  g.setAttribute('aStartY', new THREE.BufferAttribute(startY, 1))
  g.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  return g
}

type TextMesh = THREE.Mesh & { fillOpacity: number }

export default function Beat_Dashboard({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const lcGroupRef = useRef<THREE.Group>(null)
  const photonsRef = useRef<THREE.Points>(null)
  const curveRef = useRef<LightLineObject>(null)
  const lcAxesRef = useRef<LightLineObject>(null)
  const lcPanelRef = useRef<THREE.Mesh>(null)
  const flareRef = useRef<THREE.Sprite>(null)
  const leftHingeRef = useRef<THREE.Group>(null)
  const rightHingeRef = useRef<THREE.Group>(null)
  const leftPanelRef = useRef<THREE.Mesh>(null)
  const rightPanelRef = useRef<THREE.Mesh>(null)
  const psdRef = useRef<LightLineObject>(null)
  const psdAxesRef = useRef<LightLineObject>(null)
  const qpoRef = useRef<THREE.Sprite>(null)
  const heatRef = useRef<THREE.Mesh>(null)
  const heatAxesRef = useRef<LightLineObject>(null)
  const lcLabelRef = useRef<TextMesh>(null)
  const psdLabelRef = useRef<TextMesh>(null)
  const heatLabelRef = useRef<TextMesh>(null)

  const rates = useMemo(() => lightCurveRates(), [])
  const curve = useMemo(() => Array.from({ length: BINS }, (_, i) => new THREE.Vector3(binX(i), rateY(rates[i]!), 0.01)), [rates])
  const flarePeak = useMemo(() => {
    let best = 0
    for (let i = 1; i < BINS; i++) if (rates[i]! > rates[best]!) best = i
    return [binX(best), rateY(rates[best]!), 0.02] as [number, number, number]
  }, [rates])
  const lcAxes = useMemo(() => axesPoints(PLOT_X + 0.02, PLOT_Y + 0.02), [])
  const psd = useMemo(() => powerSpectrum(), [])
  const psdAxes = useMemo(() => axesPoints(PSD_X + 0.02, PSD_Y + 0.02), [])
  const heatAxes = useMemo(() => axesPoints(1.0, 0.52), [])

  const photonCount = quality === 'mobile' ? 100 : quality === 'low' ? 200 : 400
  const photonGeo = useDisposable(() => photonGeometry(photonCount, rates), [photonCount, rates])
  const photonMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uFall: { value: 0 },
      uSize: { value: 40 },
      uOpacity: { value: 1 },
      uFallColor: { value: hdr(PALETTE.nearWhite, 1.3) },
      uLandColor: { value: hdr(PALETTE.signal, GLOW.base) },
      uFlashColor: { value: hdr(PALETTE.nearWhite, GLOW.hero) },
    },
    vertexShader: PHOTON_VERT,
    fragmentShader: PHOTON_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))
  const lcPanelMat = useDisposable(() => createHoloMaterial(hdr(PALETTE.signal, 0.9)))
  const leftPanelMat = useDisposable(() => createHoloMaterial(hdr(PALETTE.signal, 0.8)))
  const rightPanelMat = useDisposable(() => createHoloMaterial(hdr(PALETTE.signal, 0.8)))
  const heatMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uOpacity: { value: 0 },
      uLow: { value: hdr(PALETTE.stellarBlue, 0.3) },
      uMid: { value: hdr(PALETTE.signal, 0.8) },
      uHigh: { value: hdr(PALETTE.starGold, 1.3) },
      uHot: { value: hdr(PALETTE.nearWhite, GLOW.hero) },
    },
    vertexShader: PLANE_VERT,
    fragmentShader: HEAT_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock

    // 1 · photon rain builds the light curve in arrival order (0.06 - 0.46)
    const fall = ease(p, 0.06, 0.46) * 1.02
    setUniform(photonsRef.current, 'uFall', fall)
    setLineReveal(curveRef.current, ease(p, 0.18, 0.47))
    setLineOpacity(lcAxesRef.current, ease(p, 0.1, 0.24) * 0.8)
    const flare = flareRef.current
    if (flare) {
      // the flare peak catches when the curve reaches it, then rests at a glow
      const hit = ease(p, 0.34, 0.4)
      ;(flare.material as THREE.SpriteMaterial).opacity = hit * (0.35 + 0.65 * pulse(p, 0.34, 0.5))
    }

    // 2 · the curve lifts and folds up into the centre panel (0.44 - 0.66)
    const fold = ease(p, 0.44, 0.66)
    const bob = Math.sin(t * 0.45) * 0.04 * fold
    const lc = lcGroupRef.current
    if (lc) {
      lc.position.lerpVectors(ASSEMBLY_POS, PANEL_POS, fold)
      lc.position.y += bob
      const s = ASSEMBLY_SCALE + (1 - ASSEMBLY_SCALE) * fold
      lc.scale.set(s, s, s)
      lc.rotation.x = -0.55 * pulse(fold, 0, 1)
    }
    setUniform(photonsRef.current, 'uSize', 40 * (0.6 + 0.4 * (1 - fold)))
    setUniform(photonsRef.current, 'uOpacity', 1 - 0.7 * fold)
    setUniform(lcPanelRef.current, 'uOpacity', fold)
    setUniform(lcPanelRef.current, 'uTime', t)

    // 3 · the side panels hinge open from behind it (0.56 - 0.8)
    const open = ease(p, 0.56, 0.8)
    const leftHinge = leftHingeRef.current
    if (leftHinge) {
      leftHinge.visible = open > 0.001
      leftHinge.rotation.y = SIDE_CLOSED + (SIDE_OPEN - SIDE_CLOSED) * open
      leftHinge.position.y = PANEL_POS.y + Math.sin(t * 0.45 + 0.8) * 0.04
    }
    const rightHinge = rightHingeRef.current
    if (rightHinge) {
      rightHinge.visible = open > 0.001
      rightHinge.rotation.y = -(SIDE_CLOSED + (SIDE_OPEN - SIDE_CLOSED) * open)
      rightHinge.position.y = PANEL_POS.y + Math.sin(t * 0.45 + 1.9) * 0.04
    }
    setUniform(leftPanelRef.current, 'uOpacity', open)
    setUniform(leftPanelRef.current, 'uTime', t)
    setUniform(rightPanelRef.current, 'uOpacity', open)
    setUniform(rightPanelRef.current, 'uTime', t)
    const plots = ease(p, 0.66, 0.84)
    setLineReveal(psdRef.current, plots)
    setLineOpacity(psdAxesRef.current, open * 0.8)
    setLineOpacity(heatAxesRef.current, open * 0.8)
    const qpo = qpoRef.current
    if (qpo) (qpo.material as THREE.SpriteMaterial).opacity = ease(p, 0.76, 0.84) * (0.75 + 0.25 * Math.sin(t * 1.3))
    setUniform(heatRef.current, 'uOpacity', open)
    setUniform(heatRef.current, 'uReveal', plots * 1.05)
    setUniform(heatRef.current, 'uTime', t + p * 4)

    if (lcLabelRef.current) lcLabelRef.current.fillOpacity = ease(p, 0.64, 0.74) * 0.8
    if (psdLabelRef.current) psdLabelRef.current.fillOpacity = ease(p, 0.7, 0.82) * 0.8
    if (heatLabelRef.current) heatLabelRef.current.fillOpacity = ease(p, 0.72, 0.84) * 0.8
  })

  return (
    <group>
      {/* Light curve: photons, the binned curve, axes and (once folded) its panel */}
      <group ref={lcGroupRef} position={ASSEMBLY_POS} scale={ASSEMBLY_SCALE}>
        <mesh ref={lcPanelRef} material={lcPanelMat} position={[0, 0, -0.02]}>
          <planeGeometry args={[LC_W, LC_H]} />
        </mesh>
        <LightLine ref={lcAxesRef} points={lcAxes} segments color={PALETTE.nearWhite} intensity={0.5} width={0.008} opacity={0} />
        <points ref={photonsRef} geometry={photonGeo} material={photonMat} frustumCulled={false} />
        <LightLine ref={curveRef} points={curve} color={PALETTE.signal} intensity={1.6} width={0.014} />
        <GlowSprite ref={flareRef} position={flarePeak} color={PALETTE.starGold} intensity={GLOW.hero} size={0.45} opacity={0} />
        <Label ref={lcLabelRef} position={[0, LC_H / 2 + 0.2, 0]} color={PALETTE.signal} opacity={0}>Light curve</Label>
      </group>

      {/* Left: power spectrum, hinged on the centre panel's left edge */}
      <group ref={leftHingeRef} position={[PANEL_POS.x - LC_W / 2 - 0.06, PANEL_POS.y, PANEL_POS.z]} visible={false}>
        <group position={[-SIDE_W / 2, 0, 0]}>
          <mesh ref={leftPanelRef} material={leftPanelMat}>
            <planeGeometry args={[SIDE_W, SIDE_H]} />
          </mesh>
          <LightLine ref={psdAxesRef} points={psdAxes} segments color={PALETTE.nearWhite} intensity={0.5} width={0.008} opacity={0} />
          <LightLine ref={psdRef} points={psd.points} color={PALETTE.signal} intensity={1.5} width={0.012} />
          <GlowSprite ref={qpoRef} position={[psd.peak.x, psd.peak.y, 0.02]} color={PALETTE.starGold} intensity={GLOW.hero} size={0.42} opacity={0} />
          <Label ref={psdLabelRef} position={[0, SIDE_H / 2 + 0.2, 0]} color={PALETTE.signal} opacity={0}>Power spectrum</Label>
        </group>
      </group>

      {/* Right: dynamical power spectrum heat strip */}
      <group ref={rightHingeRef} position={[PANEL_POS.x + LC_W / 2 + 0.06, PANEL_POS.y, PANEL_POS.z]} visible={false}>
        <group position={[SIDE_W / 2, 0, 0]}>
          <mesh ref={rightPanelRef} material={rightPanelMat}>
            <planeGeometry args={[SIDE_W, SIDE_H]} />
          </mesh>
          <LightLine ref={heatAxesRef} points={heatAxes} segments color={PALETTE.nearWhite} intensity={0.5} width={0.008} opacity={0} />
          <mesh ref={heatRef} material={heatMat} position={[0, 0, 0.006]}>
            <planeGeometry args={[2.0, 1.04]} />
          </mesh>
          <Label ref={heatLabelRef} position={[0, SIDE_H / 2 + 0.2, 0]} color={PALETTE.signal} opacity={0}>Dynamical spectrum</Label>
        </group>
      </group>
    </group>
  )
}
