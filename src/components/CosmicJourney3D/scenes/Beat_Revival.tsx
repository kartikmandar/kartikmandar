// src/components/CosmicJourney3D/scenes/Beat_Revival.tsx
'use client'

// Beat 24 · Reviving Old Code (Act IV, widening).
// An old desktop interface made of light hangs in the void: dusty, flickering,
// its panels knocked slightly out of true. Panel by panel a bright rebuild line
// sweeps across each one and it snaps into a crisp, gold-edged layout. In the
// main plot panel a noisy pulsar light curve, too long for the old window,
// phase-folds cycle by cycle into a clean pulse profile that keeps beating.

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { NOISE_GLSL } from '../art/glsl'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, ramp, seeded } from '../art/anim'

const WINDOW_Z = -1.2

// The window layout (world units at the station). kind: 0 title bar, 1 text rows,
// 2 plot panel (faint grid), 3 bar chart. Rebuilt in array order; the plot panel goes last.
const PANELS = [
  { x0: -4.3, x1: 1.3, y0: 2.6, y1: 2.95, kind: 0 },
  { x0: -4.3, x1: -3.05, y0: -0.7, y1: 2.5, kind: 1 },
  { x0: -2.95, x1: -0.9, y0: -0.7, y1: 0.35, kind: 3 },
  { x0: -0.8, x1: 1.3, y0: -0.7, y1: 0.35, kind: 1 },
  { x0: -2.95, x1: 1.3, y0: 0.45, y1: 2.5, kind: 2 },
] as const
const PANEL_STEP = 0.17
const PANEL_SPAN = 0.16
const MAIN_PANEL_DELAY = (PANELS.length - 1) * PANEL_STEP

// Light curve: a long noisy tape over CYCLES pulses that folds onto one cycle.
const CYCLES = 7
const TAPE_X0 = -2.75
const TAPE_LENGTH = 7.0
const FOLD_WIDTH = 3.85
const CURVE_BASE = 0.75
const CURVE_AMP = 1.4
const CURVE_Z = WINDOW_Z + 0.06
const PEAK_PHASE = 0.3

function profile(phase: number): number {
  const a = (phase - PEAK_PHASE) / 0.06
  const b = (phase - 0.72) / 0.08
  return Math.exp(-a * a) + 0.35 * Math.exp(-b * b)
}

const PANEL_VERT = /* glsl */ `
  attribute vec2 aSize;
  attribute vec4 aOld;
  attribute float aDelay;
  attribute float aKind;
  attribute float aSeed;
  uniform float uRebuild;
  varying vec2 vUv;
  varying vec2 vSize;
  varying float vSweep;
  varying float vKind;
  varying float vSeed;
  void main() {
    vUv = uv;
    vSize = aSize;
    vKind = aKind;
    vSeed = aSeed;
    float tr = clamp((uRebuild - aDelay) / ${PANEL_SPAN.toFixed(3)}, 0.0, 1.0);
    vSweep = tr;
    float lit = tr * tr * (3.0 - 2.0 * tr);
    vec4 world = vec4(position, 1.0);
    #ifdef USE_INSTANCING
      world = instanceMatrix * world;
      vec3 centre = instanceMatrix[3].xyz;
    #else
      vec3 centre = vec3(0.0);
    #endif
    // Old state: knocked out of true (tilted and offset); it snaps square as it rebuilds.
    vec3 d = world.xyz - centre;
    float a = aOld.w * (1.0 - lit);
    d.xy = mat2(cos(a), sin(a), -sin(a), cos(a)) * d.xy;
    world.xyz = centre + d + aOld.xyz * (1.0 - lit);
    gl_Position = projectionMatrix * modelViewMatrix * world;
  }
`

const PANEL_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uOld;
  uniform vec3 uNew;
  uniform vec3 uInk;
  uniform vec3 uHot;
  varying vec2 vUv;
  varying vec2 vSize;
  varying float vSweep;
  varying float vKind;
  varying float vSeed;

  float h11(float n) { return fract(sin(n * 12.9898) * 43758.5453); }

  // Rows of glyph bars: fake text, no real characters.
  float glyphRows(vec2 w, float soft) {
    float top = vSize.y - w.y - 0.1;
    float row = floor(top / 0.16);
    float fy = fract(top / 0.16);
    float len = 0.25 + 0.6 * h11(row * 3.1 + vSeed * 17.0);
    float x = (w.x - 0.1) / max(vSize.x - 0.2, 0.01);
    float inRow = smoothstep(0.32 - soft, 0.32, fy) * (1.0 - smoothstep(0.6, 0.6 + soft, fy));
    float inLen = step(0.0, x) * (1.0 - smoothstep(len - soft, len, x));
    float cells = step(0.24, fract(w.x / 0.055));
    return inRow * inLen * cells * step(0.0, top) * step(0.1, w.y);
  }

  float barChart(vec2 w, float soft) {
    float x = w.x - 0.12;
    float col = floor(x / 0.16);
    float h = (0.2 + 0.7 * h11(col * 1.7 + vSeed * 9.0)) * (vSize.y - 0.22);
    float inCol = step(0.0, x) * step(fract(x / 0.16), 0.55) * step(x, vSize.x - 0.24);
    return inCol * (1.0 - smoothstep(h - soft, h, w.y - 0.1)) * step(0.1, w.y);
  }

  float grid(vec2 w) {
    vec2 g = abs(fract(w / 0.4 - 0.5) - 0.5) * 0.4;
    vec2 aa = fwidth(w) * 1.2;
    vec2 l = 1.0 - smoothstep(vec2(0.0), aa, g);
    return max(l.x, l.y);
  }

  void main() {
    vec2 w = vUv * vSize;
    vec2 e2 = min(w, vSize - w);
    float d = min(e2.x, e2.y);
    float aa = fwidth(d) * 1.2;

    // crisp new frame vs the dusty, broken old one
    float edgeNew = 1.0 - smoothstep(0.0, 0.01 + aa, d);
    float broken = step(0.42, vnoise(vec3(w * 5.0, vSeed * 7.0)));
    float edgeOld = (1.0 - smoothstep(0.0, 0.035 + aa, d)) * broken;

    // stepped flicker with occasional dropouts
    float fl = h11(floor(uTime * 9.0) + vSeed * 31.0);
    float flick = (0.5 + 0.5 * fl) * step(0.12, h11(floor(uTime * 3.0) * 1.7 + vSeed * 5.0));
    float dust = fbm(vec3(w * 3.5, vSeed * 3.0 + uTime * 0.03));

    float rebuilt = smoothstep(vSweep + 0.02, vSweep - 0.02, vUv.x);
    float soft = mix(0.14, 0.02, rebuilt);
    float ink = 0.0;
    if (vKind < 0.5) {
      // window controls: three dots at the right of the title bar
      vec2 c = vec2(vSize.x - 0.14, vSize.y * 0.5);
      for (int i = 0; i < 3; i++) {
        float r = length(w - c - vec2(-float(i) * 0.13, 0.0));
        ink += 1.0 - smoothstep(0.03, 0.03 + soft, r);
      }
    } else if (vKind < 1.5) {
      ink = glyphRows(w, soft);
    } else if (vKind < 2.5) {
      ink = grid(w) * 0.3 * rebuilt;
    } else {
      ink = barChart(w, soft);
    }

    vec3 oldCol = uOld * (edgeOld * 1.2 + 0.06 + dust * 0.16 + ink * 0.55) * flick;
    vec3 newCol = uNew * (edgeNew + 0.035) + uInk * ink * 0.6;
    vec3 col = mix(oldCol, newCol, rebuilt);
    // the rebuild line sweeping across the panel
    float sweep = exp(-pow((vUv.x - vSweep) / 0.012, 2.0)) * sin(3.14159 * vSweep);
    col += uHot * sweep * 0.5;
    gl_FragColor = vec4(col * uOpacity, 1.0);
  }
`

const CURVE_VERT = /* glsl */ `
  attribute float aTime;
  attribute float aNoise;
  attribute float aSeed;
  uniform float uFold;
  uniform float uTime;
  uniform float uOld;
  uniform float uSize;
  varying float vFold;
  float profile(float ph) {
    float a = (ph - ${PEAK_PHASE.toFixed(2)}) / 0.06;
    float b = (ph - 0.72) / 0.08;
    return exp(-a * a) + 0.35 * exp(-b * b);
  }
  void main() {
    float cyc = aTime * ${CYCLES.toFixed(1)};
    float ph = fract(cyc);
    // cycles fold onto the first one in turn
    float k = floor(cyc) / ${CYCLES.toFixed(1)};
    float f = smoothstep(k * 0.55, k * 0.55 + 0.45, uFold);
    float clean = profile(ph);
    float yTape = ${CURVE_BASE.toFixed(2)} + ${CURVE_AMP.toFixed(2)} * (0.5 * clean + 0.3 * aNoise);
    float yFold = ${CURVE_BASE.toFixed(2)} + ${CURVE_AMP.toFixed(2)} * (clean + 0.05 * aNoise);
    float jit = (fract(sin(aSeed * 91.7 + floor(uTime * 8.0) * 13.1) * 4375.5) - 0.5) * 0.06 * uOld;
    vec3 p = vec3(
      mix(${TAPE_X0.toFixed(2)} + aTime * ${TAPE_LENGTH.toFixed(2)}, ${TAPE_X0.toFixed(2)} + ph * ${FOLD_WIDTH.toFixed(2)}, f),
      mix(yTape, yFold, f) + jit + sin(3.14159 * f) * 0.22,
      ${CURVE_Z.toFixed(2)} + sin(3.14159 * f) * 0.3
    );
    vFold = f;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.7 + 0.6 * fract(aSeed * 7.31)) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const CURVE_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uOldColor;
  uniform vec3 uNewColor;
  uniform float uOpacity;
  varying float vFold;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    gl_FragColor = vec4(mix(uOldColor, uNewColor, vFold) * a * uOpacity, 1.0);
  }
`

// Dust motes drifting up past the old window; they thin out as it is rebuilt.
const DUST_VERT = /* glsl */ `
  attribute vec3 aSeed;
  uniform float uTime;
  uniform float uSize;
  varying float vFade;
  void main() {
    float rise = fract(aSeed.y + uTime * (0.012 + 0.01 * aSeed.z));
    vec3 p = vec3(
      -4.4 + aSeed.x * 6.0 + sin(uTime * 0.2 + aSeed.z * 6.28) * 0.12,
      -0.8 + rise * 4.0,
      ${WINDOW_Z.toFixed(2)} - 0.6 + aSeed.z * 1.4
    );
    vFade = sin(3.14159 * rise);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.5 + aSeed.z) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const DUST_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    gl_FragColor = vec4(uColor * a * vFade * uOpacity, 1.0);
  }
`

function panelGeometry(): THREE.PlaneGeometry {
  const g = new THREE.PlaneGeometry(1, 1)
  const n = PANELS.length
  const size = new Float32Array(n * 2)
  const old = new Float32Array(n * 4)
  const delay = new Float32Array(n)
  const kind = new Float32Array(n)
  const seed = new Float32Array(n)
  PANELS.forEach((panel, i) => {
    size[i * 2] = panel.x1 - panel.x0
    size[i * 2 + 1] = panel.y1 - panel.y0
    old[i * 4] = (seeded(i, 1) - 0.5) * 0.3
    old[i * 4 + 1] = (seeded(i, 2) - 0.5) * 0.22
    old[i * 4 + 2] = (seeded(i, 3) - 0.5) * 0.6
    old[i * 4 + 3] = (seeded(i, 4) - 0.5) * 0.1
    delay[i] = i * PANEL_STEP
    kind[i] = panel.kind
    seed[i] = seeded(i, 5)
  })
  g.setAttribute('aSize', new THREE.InstancedBufferAttribute(size, 2))
  g.setAttribute('aOld', new THREE.InstancedBufferAttribute(old, 4))
  g.setAttribute('aDelay', new THREE.InstancedBufferAttribute(delay, 1))
  g.setAttribute('aKind', new THREE.InstancedBufferAttribute(kind, 1))
  g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 1))
  return g
}

function curveGeometry(count: number): THREE.BufferGeometry {
  const time = new Float32Array(count)
  const noise = new Float32Array(count)
  const seed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    time[i] = (i + 0.5) / count
    // roughly Gaussian photon noise (sum of three uniforms)
    noise[i] = (seeded(i, 11) + seeded(i, 12) + seeded(i, 13) - 1.5) * 1.15
    seed[i] = seeded(i, 14)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  g.setAttribute('aTime', new THREE.BufferAttribute(time, 1))
  g.setAttribute('aNoise', new THREE.BufferAttribute(noise, 1))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  return g
}

function dustGeometry(count: number): THREE.BufferGeometry {
  const s = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    s[i * 3] = seeded(i, 21)
    s[i * 3 + 1] = seeded(i, 22)
    s[i * 3 + 2] = seeded(i, 23)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  g.setAttribute('aSeed', new THREE.BufferAttribute(s, 3))
  return g
}

type TextMesh = THREE.Mesh & { fillOpacity: number }

export default function Beat_Revival({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const panelsRef = useRef<THREE.InstancedMesh>(null)
  const curveRef = useRef<THREE.Points>(null)
  const dustRef = useRef<THREE.Points>(null)
  const profileRef = useRef<LightLineObject>(null)
  const axisRef = useRef<LightLineObject>(null)
  const peakRef = useRef<THREE.Sprite>(null)
  const oldLabelRef = useRef<TextMesh>(null)
  const newLabelRef = useRef<TextMesh>(null)
  const captionRef = useRef<TextMesh>(null)

  const tier = quality === 'high' ? 1 : quality === 'low' ? 0.5 : 0.25
  const curveCount = Math.round(320 * tier)
  const dustCount = Math.round(80 * tier)

  const panelGeo = useDisposable(panelGeometry)
  const panelMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uRebuild: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uOld: { value: hdr(PALETTE.starGold, GLOW.dim) },
      uNew: { value: hdr(PALETTE.starGold, GLOW.base) },
      uInk: { value: hdr(PALETTE.nearWhite, 0.5) },
      uHot: { value: hdr(PALETTE.nearWhite, GLOW.hot) },
    },
    vertexShader: PANEL_VERT,
    fragmentShader: PANEL_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  }))

  useLayoutEffect(() => {
    const mesh = panelsRef.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    PANELS.forEach((panel, i) => {
      m.makeScale(panel.x1 - panel.x0, panel.y1 - panel.y0, 1)
      m.setPosition((panel.x0 + panel.x1) / 2, (panel.y0 + panel.y1) / 2, WINDOW_Z)
      mesh.setMatrixAt(i, m)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [])

  const curveGeo = useDisposable(() => curveGeometry(curveCount), [curveCount])
  const curveMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uFold: { value: 0 },
      uTime: { value: 0 },
      uOld: { value: 1 },
      uSize: { value: 30 },
      uMap: { value: getGlowTexture() },
      uOldColor: { value: hdr(PALETTE.starGold, 0.55) },
      uNewColor: { value: hdr(PALETTE.nearWhite, 0.75) },
      uOpacity: { value: 0 },
    },
    vertexShader: CURVE_VERT,
    fragmentShader: CURVE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  const dustGeo = useDisposable(() => dustGeometry(dustCount), [dustCount])
  const dustMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 22 },
      uMap: { value: getGlowTexture() },
      uColor: { value: hdr(PALETTE.starGold, 0.5) },
      uOpacity: { value: 0 },
    },
    vertexShader: DUST_VERT,
    fragmentShader: DUST_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  // The clean pulse profile, drawn on once the fold lands.
  const profilePoints = useMemo(() => {
    const n = 160
    return Array.from({ length: n + 1 }, (_, i) => {
      const ph = i / n
      return new THREE.Vector3(TAPE_X0 + ph * FOLD_WIDTH, CURVE_BASE + CURVE_AMP * profile(ph), CURVE_Z + 0.02)
    })
  }, [])

  // Phase axis with ticks at 0, 0.25, 0.5, 0.75, 1.
  const axisPoints = useMemo(() => {
    const y = CURVE_BASE - 0.1
    const pts: THREE.Vector3[] = [
      new THREE.Vector3(TAPE_X0, y, CURVE_Z),
      new THREE.Vector3(TAPE_X0 + FOLD_WIDTH, y, CURVE_Z),
    ]
    for (let i = 0; i <= 4; i++) {
      const x = TAPE_X0 + (i / 4) * FOLD_WIDTH
      pts.push(new THREE.Vector3(x, y, CURVE_Z), new THREE.Vector3(x, y - 0.07, CURVE_Z))
    }
    return pts
  }, [])

  const peak: [number, number, number] = [TAPE_X0 + PEAK_PHASE * FOLD_WIDTH, CURVE_BASE + CURVE_AMP * profile(PEAK_PHASE), CURVE_Z + 0.04]

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock

    const appear = ease(p, 0.0, 0.15)
    const rebuild = ramp(p, 0.17, 0.55)
    const panels = panelsRef.current
    setUniform(panels, 'uRebuild', rebuild)
    setUniform(panels, 'uTime', t)
    setUniform(panels, 'uOpacity', appear * (1 - 0.25 * ease(p, 0.88, 1.0)))

    // The main plot panel rebuilds last; the tape stops jittering with it.
    const mainLit = ramp(rebuild, MAIN_PANEL_DELAY, MAIN_PANEL_DELAY + PANEL_SPAN)
    const curve = curveRef.current
    setUniform(curve, 'uTime', t)
    setUniform(curve, 'uOld', 1 - mainLit)
    setUniform(curve, 'uFold', ease(p, 0.5, 0.74))
    setUniform(curve, 'uOpacity', appear * (1 - 0.45 * ease(p, 0.74, 0.84)))

    setUniform(dustRef.current, 'uTime', t)
    setUniform(dustRef.current, 'uOpacity', appear * (1 - 0.85 * ease(p, 0.3, 0.6)))

    setLineOpacity(axisRef.current, ease(mainLit, 0.3, 1.0) * 0.8)
    setLineReveal(profileRef.current, ease(p, 0.68, 0.8))

    // The pulse keeps beating at a steady period once the profile is clean.
    const peakSprite = peakRef.current
    if (peakSprite) {
      const ph = (t / 1.4) % 1
      const beatPulse = reducedMotion ? 0.5 : Math.pow(0.5 + 0.5 * Math.cos(ph * Math.PI * 2), 10)
      const on = ease(p, 0.76, 0.84)
      ;(peakSprite.material as THREE.SpriteMaterial).opacity = on * (0.45 + 0.55 * beatPulse)
      const s = 0.55 + 0.35 * beatPulse
      peakSprite.scale.set(s, s, 1)
    }

    // Title bar: the old version flickers out as the new one settles in.
    const titleLit = ramp(rebuild, 0, PANEL_SPAN)
    const flickHash = Math.sin(Math.floor(t * 9) * 12.9898) * 43758.5453
    const flick = 0.55 + 0.45 * (flickHash - Math.floor(flickHash))
    if (oldLabelRef.current) oldLabelRef.current.fillOpacity = appear * (1 - titleLit) * flick * 0.7
    if (newLabelRef.current) newLabelRef.current.fillOpacity = ease(titleLit, 0.6, 1.0) * 0.85
    if (captionRef.current) captionRef.current.fillOpacity = ease(p, 0.76, 0.86) * 0.7
  })

  return (
    <group>
      <instancedMesh ref={panelsRef} args={[panelGeo, panelMat, PANELS.length]} frustumCulled={false} />
      <points ref={dustRef} geometry={dustGeo} material={dustMat} frustumCulled={false} />
      <points ref={curveRef} geometry={curveGeo} material={curveMat} frustumCulled={false} />

      <LightLine ref={axisRef} points={axisPoints} segments color={PALETTE.nearWhite} intensity={GLOW.dim} width={0.01} opacity={0} />
      <LightLine ref={profileRef} points={profilePoints} color={PALETTE.starGold} intensity={GLOW.hero} width={0.026} />
      <GlowSprite ref={peakRef} position={peak} color={PALETTE.starGold} intensity={GLOW.hero} size={0.7} opacity={0} />

      <Label preserveCase ref={oldLabelRef} position={[-4.12, 2.775, WINDOW_Z + 0.03]} anchorX="left" color={PALETTE.starGold} intensity={0.7} opacity={0}>
        Py 3.5
      </Label>
      <Label preserveCase ref={newLabelRef} position={[-4.12, 2.775, WINDOW_Z + 0.03]} anchorX="left" color={PALETTE.nearWhite} opacity={0}>
        Py 3.13
      </Label>
      <Label ref={captionRef} position={[TAPE_X0 + 0.05, 2.32, WINDOW_Z + 0.03]} anchorX="left" color={PALETTE.starGold} opacity={0}>
        Pulse profile
      </Label>
    </group>
  )
}
