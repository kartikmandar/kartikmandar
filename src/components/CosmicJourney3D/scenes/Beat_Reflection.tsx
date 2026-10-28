// src/components/CosmicJourney3D/scenes/Beat_Reflection.tsx
'use client'

// Beat 23 · From Timing to Spectra (Act IV, widening).
// Reflection spectroscopy, made of light. A hot coronal point hangs above the
// black hole (the lamppost). Its light rains down onto the accretion disk,
// bounces off, and streams across to a spectrum drawn in light beside it: a
// falling power law in which the iron-line hump at 6.4 keV (broadened, with a
// red wing) and the Compton hump rise as the reflected light arrives. Light
// echoes ripple outward across the disk on the clock (reverberation).

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { createHoloMaterial, getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { NOISE_GLSL } from '../art/glsl'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, ramp, seeded } from '../art/anim'

// ---------------------------------------------------------------------------
// Static layout
// ---------------------------------------------------------------------------

const BH = new THREE.Vector3(-1.75, 0.75, -1.0)
const DISK_INNER = 0.2
const DISK_OUTER = 2.0
const DISK_ROTATION = new THREE.Euler(-Math.PI / 2 + 0.55, 0, 0.1)
const DISK_NORMAL = new THREE.Vector3(0, 0, 1).applyEuler(DISK_ROTATION)
const CORONA = BH.clone().addScaledVector(DISK_NORMAL, 0.62)
const SHADOW_R = 0.13

// Spectrum panel (faces the camera).
const PANEL_CENTER = new THREE.Vector3(2.35, 1.3, -1.0)
const PANEL_W = 3.2
const PANEL_H = 2.1
const PLOT_X0 = 0.1
const PLOT_XW = 0.85
const PLOT_Y0 = 0.14
const PLOT_YH = 0.76
/** NuSTAR band, 3 to 79 keV, on a log axis. */
const LOG_E0 = Math.log10(3)
const LOG_SPAN = Math.log10(79) - LOG_E0
const X_FE = (Math.log10(6.4) - LOG_E0) / LOG_SPAN
const FE_PEAK_Y = 0.62 - 0.38 * X_FE + 0.34

function panelPoint(out: THREE.Vector3, X: number, Y: number): THREE.Vector3 {
  const u = PLOT_X0 + PLOT_XW * X
  const v = PLOT_Y0 + PLOT_YH * Y
  return out.set(PANEL_CENTER.x + (u - 0.5) * PANEL_W, PANEL_CENTER.y + (v - 0.5) * PANEL_H, PANEL_CENTER.z + 0.02)
}

/** Where the reflected light lands: the top of the iron line. */
const FE_POINT = panelPoint(new THREE.Vector3(), X_FE, FE_PEAK_Y - 0.06)
const FE_LABEL = panelPoint(new THREE.Vector3(), X_FE + 0.17, FE_PEAK_Y + 0.13)

function diskPoint(out: THREE.Vector3, r: number, a: number): THREE.Vector3 {
  return out.set(Math.cos(a) * r, Math.sin(a) * r, 0).applyEuler(DISK_ROTATION).add(BH)
}

/** Six illustrative rays: corona to disk, then off the disk to the iron line. */
const RAY_LINES: THREE.Vector3[] = (() => {
  const pts: THREE.Vector3[] = []
  const hits: Array<[number, number]> = [[0.75, -1.3], [1.35, -0.7], [0.55, -0.35], [1.6, -1.9], [1.05, 0.15], [0.9, -2.4]]
  for (const [r, a] of hits) {
    const hit = diskPoint(new THREE.Vector3(), r, a)
    pts.push(CORONA.clone(), hit.clone(), hit.clone(), FE_POINT.clone())
  }
  return pts
})()

// ---------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------

const DISK_VERT = /* glsl */ `
  varying vec2 vXY;
  void main() {
    vXY = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Thermal disk lit by a lamppost: emissivity ~ h / (h^2 + r^2)^1.5, Keplerian
// shear in the turbulence, and reverberation echoes rippling outward.
const DISK_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform float uTime;
  uniform float uInner;
  uniform float uOuter;
  uniform float uOpacity;
  uniform float uLit;
  uniform float uHeight;
  uniform vec3 uHot;
  uniform vec3 uWarm;
  uniform vec3 uCool;
  uniform vec3 uEcho;
  varying vec2 vXY;
  void main() {
    float r = length(vXY);
    if (r < uInner * 0.9) discard;
    float omega = 0.5 * pow(max(r, 0.05) / uInner, -1.5);
    float a = uTime * omega;
    vec2 q = mat2(cos(a), -sin(a), sin(a), cos(a)) * vXY;
    float turb = fbm(vec3(q * 3.0, uTime * 0.05));
    float temp = pow(uInner / r, 0.75);
    vec3 col = mix(uCool, uWarm, smoothstep(0.12, 0.5, temp));
    col = mix(col, uHot, smoothstep(0.6, 0.95, temp));
    float lum = temp * (0.45 + 0.7 * turb) * 0.7;
    float h = uHeight;
    float lamp = h / pow(h * h + r * r, 1.5) * h * h;
    float echo = 0.0;
    for (int k = 0; k < 3; k++) {
      float rk = uInner + fract(uTime * 0.16 + float(k) / 3.0) * (uOuter - uInner);
      echo += exp(-pow((r - rk) / 0.05, 2.0)) * (1.0 - rk / uOuter);
    }
    vec3 reflected = uWarm * lamp * 0.9 + uEcho * echo * (0.4 + 0.6 * turb);
    float inner = smoothstep(uInner * 0.9, uInner * 1.05, r);
    float outer = 1.0 - smoothstep(uOuter * 0.6, uOuter, r);
    gl_FragColor = vec4((col * lum + reflected * uLit) * inner * outer * uOpacity, 1.0);
  }
`

const PLANE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const RING_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float ring = exp(-pow((r - 0.62) / 0.05, 2.0)) + 0.35 * exp(-pow((r - 0.62) / 0.16, 2.0));
    gl_FragColor = vec4(uColor * ring * uOpacity, 1.0);
  }
`

// The spectrum in light: E F(E) on log-log axes over 3 to 79 keV. A falling
// continuum, then (with uHump) a relativistically broadened Fe K line at 6.4 keV
// (long red wing, sharp blue edge) and a broad Compton hump near 20 to 30 keV.
const PLOT_FRAG = /* glsl */ `
  uniform float uDraw;
  uniform float uHump;
  uniform float uOpacity;
  uniform vec2 uSize;
  uniform vec3 uAxis;
  uniform vec3 uCurve;
  uniform vec3 uIron;
  varying vec2 vUv;
  const float XFE = ${X_FE.toFixed(4)};
  float continuum(float X) { return 0.62 - 0.38 * X; }
  float ironLine(float X) {
    float s = X < XFE ? 0.075 : 0.022;
    return 0.34 * exp(-pow((X - XFE) / s, 2.0));
  }
  float compton(float X) { return 0.13 * exp(-pow((X - 0.66) / 0.16, 2.0)); }
  float model(float X) { return continuum(X) + uHump * (ironLine(X) + compton(X)); }
  float hash11(float n) { return fract(sin(n * 91.345) * 47453.5453); }
  void main() {
    float X = (vUv.x - ${PLOT_X0.toFixed(3)}) / ${PLOT_XW.toFixed(3)};
    float Y = (vUv.y - ${PLOT_Y0.toFixed(3)}) / ${PLOT_YH.toFixed(3)};
    float inX = step(0.0, X) * step(X, 1.0);
    float drawn = inX * (1.0 - smoothstep(uDraw - 0.01, uDraw, X));

    // axes and log ticks (3, 5, 10, 20, 50 keV)
    float px = fwidth(vUv.x);
    float py = fwidth(vUv.y);
    float axisX = (1.0 - smoothstep(0.0, py * 1.2, abs(Y * ${PLOT_YH.toFixed(3)}))) * step(-0.01, X) * step(X, 1.02);
    float axisY = (1.0 - smoothstep(0.0, px * 1.2, abs(X * ${PLOT_XW.toFixed(3)}))) * step(-0.01, Y) * step(Y, 1.02);
    float ticks = 0.0;
    float tx[5];
    tx[0] = 0.0; tx[1] = 0.1561; tx[2] = 0.3682; tx[3] = 0.5800; tx[4] = 0.8605;
    for (int i = 0; i < 5; i++) {
      ticks += (1.0 - smoothstep(0.0, px * 1.2, abs((X - tx[i]) * ${PLOT_XW.toFixed(3)}))) * step(-0.035, Y) * step(Y, 0.0);
    }
    vec3 col = uAxis * max(max(axisX, axisY), ticks);

    // the model curve
    float g = Y - model(X);
    float w = fwidth(g);
    float curve = 1.0 - smoothstep(0.0, w * 1.6, abs(g));
    float glow = exp(-pow(g / (w * 7.0 + 1e-4), 2.0)) * 0.35;
    float fe = clamp(ironLine(X) / 0.34, 0.0, 1.0) * uHump;
    vec3 curveCol = mix(uCurve, uIron, fe);
    col += curveCol * (curve + glow) * drawn;

    // faint fill under the curve, and the bare continuum as a dashed guide
    col += mix(uCurve, uIron, fe) * 0.05 * step(0.0, Y) * step(g, 0.0) * drawn;
    float gc = Y - continuum(X);
    float dash = step(0.5, fract(X * 46.0));
    col += uCurve * 0.35 * (1.0 - smoothstep(0.0, fwidth(gc) * 1.2, abs(gc))) * dash * uHump * drawn;

    // the 6.4 keV marker rises with the line
    float mark = (1.0 - smoothstep(0.0, px * 1.0, abs((X - XFE) * ${PLOT_XW.toFixed(3)}))) * step(0.0, Y) * step(Y, model(XFE) - 0.03);
    col += uIron * 0.22 * mark * step(0.5, fract(Y * 30.0)) * uHump;

    // NuSTAR-like data points scattered about the model
    float n = 56.0;
    float k = floor(X * n);
    float xk = (k + 0.5) / n;
    float yk = model(xk) + (hash11(k) - 0.5) * 0.035;
    vec2 dp = vec2((X - xk) * ${PLOT_XW.toFixed(3)}, (Y - yk) * ${PLOT_YH.toFixed(3)}) * uSize;
    float dotv = exp(-dot(dp, dp) / 0.00045) * inX * step(xk, uDraw);
    col += mix(uCurve, uIron, clamp(ironLine(xk) / 0.34, 0.0, 1.0) * uHump) * dotv * 0.8;

    gl_FragColor = vec4(col * uOpacity, 1.0);
  }
`

// Photons: corona to a point on the disk, then off the disk to the iron line.
const PHOTON_VERT = /* glsl */ `
  attribute float aSeed;
  attribute vec3 aHit;
  attribute vec3 aJitter;
  uniform vec3 uCorona;
  uniform vec3 uTarget;
  uniform float uTime;
  uniform float uSize;
  varying float vOut;
  varying float vFade;
  varying float vBounce;
  void main() {
    float u = fract(aSeed + uTime * 0.11);
    float split = 0.4;
    vec3 p;
    if (u < split) {
      p = mix(uCorona, aHit, u / split);
      vOut = 0.0;
    } else {
      float t = (u - split) / (1.0 - split);
      p = mix(aHit, uTarget + aJitter * 0.12, t);
      p += aJitter * 0.18 * sin(3.14159 * t);
      vOut = 1.0;
    }
    vBounce = exp(-pow((u - split) / 0.025, 2.0));
    vFade = smoothstep(0.0, 0.05, u) * (1.0 - smoothstep(0.9, 1.0, u));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.55 + 0.8 * fract(aSeed * 11.3)) * (1.0 + 1.5 * vBounce) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const PHOTON_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uPrimary;
  uniform vec3 uReflected;
  uniform float uOpacity;
  varying float vOut;
  varying float vFade;
  varying float vBounce;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    vec3 col = mix(uPrimary, uReflected, vOut) * (1.0 + 1.2 * vBounce);
    gl_FragColor = vec4(col * a * vFade * uOpacity, 1.0);
  }
`

function photonGeometry(count: number): THREE.BufferGeometry {
  const seed = new Float32Array(count)
  const hit = new Float32Array(count * 3)
  const jitter = new Float32Array(count * 3)
  const v = new THREE.Vector3()
  for (let i = 0; i < count; i++) {
    seed[i] = seeded(i, 0)
    // Lamppost illumination is centrally concentrated: bias hits inward.
    const s = seeded(i, 1)
    const r = DISK_INNER * 1.4 + (DISK_OUTER * 0.85 - DISK_INNER * 1.4) * s * s
    diskPoint(v, r, seeded(i, 2) * Math.PI * 2)
    hit[i * 3] = v.x
    hit[i * 3 + 1] = v.y
    hit[i * 3 + 2] = v.z
    jitter[i * 3] = (seeded(i, 3) - 0.5) * 2
    jitter[i * 3 + 1] = (seeded(i, 4) - 0.5) * 2
    jitter[i * 3 + 2] = (seeded(i, 5) - 0.5) * 2
  }
  const g = new THREE.BufferGeometry()
  // Positions are computed in the shader; a zeroed attribute satisfies three.
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  g.setAttribute('aHit', new THREE.BufferAttribute(hit, 3))
  g.setAttribute('aJitter', new THREE.BufferAttribute(jitter, 3))
  return g
}

type FadingText = THREE.Mesh & { fillOpacity: number }

// ---------------------------------------------------------------------------

export default function Beat_Reflection({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const diskRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const coronaRef = useRef<THREE.Sprite>(null)
  const haloRef = useRef<THREE.Sprite>(null)
  const raysRef = useRef<LightLineObject>(null)
  const photonsRef = useRef<THREE.Points>(null)
  const panelRef = useRef<THREE.Mesh>(null)
  const plotRef = useRef<THREE.Mesh>(null)
  const feGlowRef = useRef<THREE.Sprite>(null)
  const labelRef = useRef<FadingText>(null)

  const diskMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uInner: { value: DISK_INNER },
      uOuter: { value: DISK_OUTER },
      uOpacity: { value: 0 },
      uLit: { value: 0 },
      uHeight: { value: 0.62 },
      uHot: { value: hdr(PALETTE.nearWhite, GLOW.hero) },
      uWarm: { value: hdr(PALETTE.starGold, 1.3) },
      uCool: { value: hdr(PALETTE.emberDeep, 0.5) },
      uEcho: { value: hdr(PALETTE.starGold, GLOW.base) },
    },
    vertexShader: DISK_VERT,
    fragmentShader: DISK_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  }))

  const ringMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: { uColor: { value: hdr(PALETTE.starGold, GLOW.hot) }, uOpacity: { value: 0 } },
    vertexShader: PLANE_VERT,
    fragmentShader: RING_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))

  const panelMat = useDisposable(() => createHoloMaterial(hdr(PALETTE.starGold, 0.55)))
  const plotMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uDraw: { value: 0 },
      uHump: { value: 0 },
      uOpacity: { value: 0 },
      uSize: { value: new THREE.Vector2(PANEL_W, PANEL_H) },
      uAxis: { value: hdr(PALETTE.nearWhite, 0.45) },
      uCurve: { value: hdr(PALETTE.starGold, 1.3) },
      uIron: { value: hdr(PALETTE.ember, GLOW.hero) },
    },
    vertexShader: PLANE_VERT,
    fragmentShader: PLOT_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  const photonCount = quality === 'mobile' ? 100 : quality === 'low' ? 200 : 400
  const photonGeo = useDisposable(() => photonGeometry(photonCount), [photonCount])
  const photonMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uCorona: { value: CORONA.clone() },
      uTarget: { value: FE_POINT.clone() },
      uTime: { value: 0 },
      uSize: { value: 24 },
      uMap: { value: getGlowTexture() },
      uPrimary: { value: hdr(PALETTE.nearWhite, 1.3) },
      uReflected: { value: hdr(PALETTE.starGold, 1.2) },
      uOpacity: { value: 0 },
    },
    vertexShader: PHOTON_VERT,
    fragmentShader: PHOTON_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock

    // Arrival: the black hole, its disk and the corona.
    const appear = ease(p, 0.0, 0.22)
    const disk = diskRef.current
    setUniform(disk, 'uTime', t)
    setUniform(disk, 'uOpacity', appear)
    setUniform(disk, 'uLit', ease(p, 0.2, 0.45))
    setUniform(ringRef.current, 'uOpacity', appear)

    const corona = coronaRef.current
    if (corona) {
      const flicker = 0.85 + 0.15 * Math.sin(t * 9.1) * Math.sin(t * 5.3 + 0.7)
      ;(corona.material as THREE.SpriteMaterial).opacity = ease(p, 0.06, 0.2) * flicker
    }
    const halo = haloRef.current
    if (halo) (halo.material as THREE.SpriteMaterial).opacity = ease(p, 0.08, 0.24) * 0.5

    // Hold: rays trace the bounce, photons stream, the spectrum draws, the hump rises.
    setLineReveal(raysRef.current, ease(p, 0.18, 0.42))
    setLineOpacity(raysRef.current, ramp(p, 0.17, 0.2) * (0.6 - 0.25 * ease(p, 0.55, 0.75)))
    setUniform(photonsRef.current, 'uTime', t)
    setUniform(photonsRef.current, 'uOpacity', ease(p, 0.24, 0.44))

    const panelIn = ease(p, 0.16, 0.32)
    setUniform(panelRef.current, 'uOpacity', panelIn * 0.8)
    setUniform(panelRef.current, 'uTime', t)
    const plot = plotRef.current
    setUniform(plot, 'uOpacity', panelIn)
    setUniform(plot, 'uDraw', ease(p, 0.26, 0.5) * 1.01)
    const hump = ease(p, 0.44, 0.74)
    setUniform(plot, 'uHump', hump)

    const fe = feGlowRef.current
    if (fe) {
      ;(fe.material as THREE.SpriteMaterial).opacity = hump * (0.8 + 0.2 * Math.sin(t * 1.6))
      fe.position.y = FE_POINT.y - 0.34 * PLOT_YH * PANEL_H * (1 - hump) * 0.5
    }
    if (labelRef.current) labelRef.current.fillOpacity = ease(p, 0.62, 0.74) * 0.9
  })

  return (
    <group>
      {/* Black hole: shadow, photon ring, lamppost-lit disk */}
      <group position={BH}>
        <mesh renderOrder={-1}>
          <sphereGeometry args={[SHADOW_R, 32, 32]} />
          <meshBasicMaterial color="#000000" fog={false} />
        </mesh>
        <Billboard>
          <mesh ref={ringRef} material={ringMat}>
            <planeGeometry args={[0.44, 0.44]} />
          </mesh>
        </Billboard>
        <mesh ref={diskRef} rotation={DISK_ROTATION} material={diskMat} frustumCulled={false}>
          <ringGeometry args={[DISK_INNER * 0.9, DISK_OUTER, 160, 1]} />
        </mesh>
      </group>

      {/* The corona: a hot point above the hole */}
      <GlowSprite ref={haloRef} position={[CORONA.x, CORONA.y, CORONA.z]} color={PALETTE.stellarBlue} intensity={1.2} size={1.3} opacity={0} />
      <GlowSprite ref={coronaRef} position={[CORONA.x, CORONA.y, CORONA.z]} color={PALETTE.nearWhite} intensity={GLOW.hot} size={0.42} opacity={0} />

      {/* Reflection: rays and photons */}
      <LightLine ref={raysRef} points={RAY_LINES} segments color={PALETTE.starGold} intensity={GLOW.base} width={0.009} opacity={0} />
      <points ref={photonsRef} geometry={photonGeo} material={photonMat} frustumCulled={false} />

      {/* The spectrum, drawn in light on a glass panel */}
      <mesh ref={panelRef} position={PANEL_CENTER} material={panelMat}>
        <planeGeometry args={[PANEL_W, PANEL_H]} />
      </mesh>
      <mesh ref={plotRef} position={[PANEL_CENTER.x, PANEL_CENTER.y, PANEL_CENTER.z + 0.01]} material={plotMat}>
        <planeGeometry args={[PANEL_W, PANEL_H]} />
      </mesh>
      <GlowSprite ref={feGlowRef} position={[FE_POINT.x, FE_POINT.y, FE_POINT.z + 0.02]} color={PALETTE.ember} intensity={GLOW.hero} size={0.5} opacity={0} />

      <Label preserveCase ref={labelRef} position={[FE_LABEL.x, FE_LABEL.y, FE_LABEL.z]} anchorX="left" color={PALETTE.ember} intensity={1.3} opacity={0}>
        Iron · 6.4 keV
      </Label>
    </group>
  )
}
