// src/components/CosmicJourney3D/scenes/Beat_Eclipse.tsx
'use client'

// Beat 4 · Forging My Own Path (Act I, spark).
// Oman, December 2019. A home-built refractor drawn in light-wire stands on a
// dune crest, aimed at the rising sun. The Moon slides across until it sits
// almost centred: annularity, the ring of fire. The ring is drawn with the same
// profile as the black hole photon rings (a thin hot line over a soft halo,
// brighter on one side, with a faint higher-order echo outside it), so it rhymes
// with the opening and sets up the finale, where this ring aligns over the
// photon ring. On departure the echo ring brightens: a hint of what it becomes.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, seeded } from '../art/anim'

// ---- Layout -----------------------------------------------------------------

const SUN = new THREE.Vector3(1.9, 2.55, -4.4)
const SUN_R = 0.78
/** The eclipse plane spans this many solar radii (leaves room for the halo). */
const SPAN = 5.0
const MOON_R = 0.94
const MOON_START = new THREE.Vector2(1.25, 0.6)
const MOON_END = new THREE.Vector2(0.05, -0.035)

/** Telescope: tube centre on the mount, aimed at the sun. */
const MOUNT = new THREE.Vector3(-1.65, 0.22, -0.45)
const AIM = SUN.clone().sub(MOUNT).normalize()
const TUBE_Q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), AIM)
const TUBE_HALF = 0.88
const TUBE_R = 0.085
const OBJECTIVE = MOUNT.clone().addScaledVector(AIM, TUBE_HALF + 0.22)

/** Dune surface height: a crest under the telescope, ripples across the sand. */
function duneY(x: number, z: number): number {
  return -1.0 + 0.3 * Math.exp(-((x + 1.6) ** 2) / 7) * Math.exp(-((z + 0.5) ** 2) / 4)
    + 0.09 * Math.sin(0.55 * x + 0.8 * z) + 0.05 * Math.sin(1.3 * x - 0.4 * z + 1.2)
}

/** Telescope in light-wire: tube, dew shield, focuser, finder, mount and tripod. */
function telescopePoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  // local frame: tube along +Y, centred at the mount
  const local = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(TUBE_Q).add(MOUNT)
  const ring = (y: number, r: number, n = 24, ox = 0, oz = 0) => {
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2
      const a1 = ((i + 1) / n) * Math.PI * 2
      pts.push(local(ox + Math.cos(a0) * r, y, oz + Math.sin(a0) * r), local(ox + Math.cos(a1) * r, y, oz + Math.sin(a1) * r))
    }
  }
  const strut = (y0: number, y1: number, r: number, k = 6, ox = 0, oz = 0) => {
    for (let i = 0; i < k; i++) {
      const a = (i / k) * Math.PI * 2 + 0.3
      pts.push(local(ox + Math.cos(a) * r, y0, oz + Math.sin(a) * r), local(ox + Math.cos(a) * r, y1, oz + Math.sin(a) * r))
    }
  }
  // main tube with a couple of bands
  ring(-TUBE_HALF, TUBE_R)
  ring(-0.2, TUBE_R)
  ring(0.35, TUBE_R)
  ring(TUBE_HALF, TUBE_R)
  strut(-TUBE_HALF, TUBE_HALF, TUBE_R)
  // dew shield, slightly wider, out past the objective
  ring(TUBE_HALF, TUBE_R * 1.22)
  ring(TUBE_HALF + 0.24, TUBE_R * 1.22)
  strut(TUBE_HALF, TUBE_HALF + 0.24, TUBE_R * 1.22, 8)
  // focuser and star diagonal with eyepiece
  ring(-TUBE_HALF - 0.16, TUBE_R * 0.42, 14)
  strut(-TUBE_HALF - 0.16, -TUBE_HALF, TUBE_R * 0.42, 4)
  pts.push(local(0, -TUBE_HALF - 0.16, 0), local(0.0, -TUBE_HALF - 0.24, 0.1))
  pts.push(local(0.0, -TUBE_HALF - 0.24, 0.1), local(0.0, -TUBE_HALF - 0.24, 0.22))
  // finder scope, riding on the tube
  const fx = TUBE_R + 0.06
  ring(0.0, 0.025, 10, fx, 0)
  ring(0.38, 0.025, 10, fx, 0)
  strut(0.0, 0.38, 0.025, 3, fx, 0)
  pts.push(local(TUBE_R, 0.08, 0), local(fx - 0.025, 0.08, 0))
  pts.push(local(TUBE_R, 0.3, 0), local(fx - 0.025, 0.3, 0))
  // mount head and pier, then the tripod legs down to the sand
  const head = MOUNT.clone().add(new THREE.Vector3(0, -0.2, 0))
  pts.push(MOUNT.clone().addScaledVector(AIM, -0.05).add(new THREE.Vector3(0, -TUBE_R, 0)), head)
  const feet: Array<[number, number]> = [[-2.15, -0.15], [-1.2, -0.1], [-1.7, -1.05]]
  for (const [x, z] of feet) {
    const foot = new THREE.Vector3(x, duneY(x, z), z)
    pts.push(head, foot)
    // a spreader brace one third down
    pts.push(head.clone().lerp(foot, 0.62), new THREE.Vector3(MOUNT.x, head.y - 0.42, MOUNT.z - 0.3))
  }
  return pts
}

/** Dune transects: lines of constant z across the sand, as contour hairlines. */
function dunePoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const zs = [0.5, -0.5, -1.5, -2.6, -3.8]
  for (const z of zs) {
    const n = 70
    for (let i = 0; i < n; i++) {
      const x0 = -6 + (12 * i) / n
      const x1 = -6 + (12 * (i + 1)) / n
      pts.push(new THREE.Vector3(x0, duneY(x0, z), z), new THREE.Vector3(x1, duneY(x1, z), z))
    }
  }
  return pts
}

/** The dune's crest line, running along the ridge under the tripod. */
function crestPoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= 60; i++) {
    const z = 1.0 - (5.2 * i) / 60
    const x = -1.6 + 0.35 * Math.sin(z * 0.9)
    pts.push(new THREE.Vector3(x, duneY(x, z) + 0.005, z))
  }
  return pts
}

// ---- Shaders -------------------------------------------------------------------

const PLANE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// The eclipse in units of the solar radius. The lit part is sun-minus-moon; at
// annularity the ring gets the photon-ring profile (thin hot line + soft halo),
// a beamed side, and a faint outer echo ring like a higher-order image.
const ECLIPSE_FRAG = /* glsl */ `
  uniform vec2 uMoon;
  uniform float uMoonR;
  uniform float uRing;
  uniform float uEcho;
  uniform float uOpacity;
  uniform vec3 uSun;
  uniform vec3 uHot;
  uniform vec3 uHalo;
  varying vec2 vUv;
  void main() {
    vec2 q = (vUv - 0.5) * ${SPAN.toFixed(1)};
    float r = length(q);
    float aa = fwidth(r) * 1.2;
    float sun = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, r);
    float dm = length(q - uMoon);
    float moon = 1.0 - smoothstep(uMoonR - aa, uMoonR + aa, dm);
    float lit = sun * (1.0 - moon);
    // gentle limb darkening on the photosphere
    float limb = 0.55 + 0.45 * sqrt(max(0.0, 1.0 - r * r));
    vec3 col = uSun * lit * limb;

    // photon-ring profile, centred on the limb
    float theta = atan(q.y, q.x);
    float beam = 0.7 + 0.3 * (0.5 + 0.5 * sin(theta + 2.4));
    float line = exp(-pow((r - 0.985) / 0.03, 2.0)) + 0.35 * exp(-pow((r - 0.985) / 0.11, 2.0));
    col += uHot * line * beam * uRing * (1.0 - 0.85 * moon);

    // higher-order echo, just outside
    float echo = exp(-pow((r - 1.11) / 0.012, 2.0));
    col += uHot * echo * beam * uEcho * 0.35;

    // soft halo: ember, falling off with radius; grows with annularity
    float halo = exp(-max(r - 1.0, 0.0) * 2.6) * smoothstep(0.92, 1.05, r);
    col += uHalo * halo * (0.35 + 0.65 * uRing);

    float edge = 1.0 - smoothstep(0.82 * ${(SPAN / 2).toFixed(2)}, ${(SPAN / 2).toFixed(2)}, r);
    gl_FragColor = vec4(col * edge * uOpacity, 1.0);
  }
`

const STAR_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  varying float vTwinkle;
  void main() {
    vTwinkle = 0.7 + 0.3 * sin(uTime * (0.6 + aSeed * 1.8) + aSeed * 50.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (0.4 + 1.1 * aSeed * aSeed) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const STAR_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vTwinkle;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    gl_FragColor = vec4(uColor * a * vTwinkle * uOpacity, 1.0);
  }
`

type Fadeable = THREE.Mesh & { fillOpacity: number }

export default function Beat_Eclipse({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const eclipseRef = useRef<THREE.Mesh>(null)
  const starsRef = useRef<THREE.Points>(null)
  const scopeRef = useRef<LightLineObject>(null)
  const duneRef = useRef<LightLineObject>(null)
  const crestRef = useRef<LightLineObject>(null)
  const sightRef = useRef<LightLineObject>(null)
  const glintRef = useRef<THREE.Sprite>(null)
  const scopeLabelRef = useRef<Fadeable>(null)
  const ringLabelRef = useRef<Fadeable>(null)

  const scope = useMemo(() => telescopePoints(), [])
  const dune = useMemo(() => dunePoints(), [])
  const crest = useMemo(() => crestPoints(), [])
  const sight = useMemo(() => [OBJECTIVE.clone(), SUN.clone().addScaledVector(AIM, -SUN_R * 1.3)], [])

  const eclipseMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMoon: { value: MOON_START.clone() },
      uMoonR: { value: MOON_R },
      uRing: { value: 0 },
      uEcho: { value: 0 },
      uOpacity: { value: 0 },
      uSun: { value: hdr(PALETTE.starGold, GLOW.hero) },
      uHot: { value: hdr(PALETTE.starGold, GLOW.hot) },
      uHalo: { value: hdr(PALETTE.ember, 0.55) },
    },
    vertexShader: PLANE_VERT,
    fragmentShader: ECLIPSE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  // Stars come out as the light dims at annularity; none behind the sun.
  const starCount = quality === 'mobile' ? 60 : quality === 'low' ? 110 : 220
  const starGeo = useDisposable(() => {
    const pos = new Float32Array(starCount * 3)
    const seed = new Float32Array(starCount)
    for (let i = 0; i < starCount; i++) {
      let x = (seeded(i, 1) - 0.5) * 15
      const y = -0.3 + seeded(i, 2) * 5.6
      if (Math.hypot(x - SUN.x * 1.2, y - SUN.y * 1.1) < 1.6) x -= 3.2
      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = -5.2 - seeded(i, 3) * 0.8
      seed[i] = seeded(i, 4)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [starCount])
  const starMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uColor: { value: hdr(PALETTE.nearWhite, 0.85) },
      uTime: { value: 0 },
      uSize: { value: 28 },
      uOpacity: { value: 0 },
    },
    vertexShader: STAR_VERT,
    fragmentShader: STAR_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock

    // Arrive: dune and sun; the refractor draws itself on.
    const appear = ease(p, 0.0, 0.16)
    setLineOpacity(duneRef.current, appear * 0.85)
    setLineReveal(crestRef.current, ease(p, 0.02, 0.24))
    setLineReveal(scopeRef.current, ease(p, 0.05, 0.34))
    setLineOpacity(sightRef.current, ease(p, 0.3, 0.42) * 0.45)

    // Hold: the Moon slides across to annularity; the ring of fire forms.
    const slide = ease(p, 0.14, 0.56)
    const ring = ease(p, 0.46, 0.62)
    const eclipse = eclipseRef.current
    if (eclipse) {
      const m = (eclipse.material as THREE.ShaderMaterial).uniforms.uMoon!.value as THREE.Vector2
      // a very slow residual drift keeps the ring alive on the clock
      const drift = 0.012 * Math.sin(t * 0.25) * ring
      m.set(
        MOON_START.x + (MOON_END.x - MOON_START.x) * slide + drift,
        MOON_START.y + (MOON_END.y - MOON_START.y) * slide,
      )
    }
    setUniform(eclipse, 'uOpacity', appear)
    setUniform(eclipse, 'uRing', ring)
    // Depart: the outer echo brightens, a hint of the photon ring to come.
    setUniform(eclipse, 'uEcho', ring * (0.35 + 0.65 * ease(p, 0.82, 1.0)))

    setUniform(starsRef.current, 'uOpacity', ease(p, 0.4, 0.64))
    setUniform(starsRef.current, 'uTime', t)

    const glint = glintRef.current
    if (glint) (glint.material as THREE.SpriteMaterial).opacity = ease(p, 0.25, 0.4) * (0.3 + 0.7 * ring)

    if (scopeLabelRef.current) scopeLabelRef.current.fillOpacity = ease(p, 0.3, 0.42) * 0.7
    if (ringLabelRef.current) ringLabelRef.current.fillOpacity = ease(p, 0.6, 0.72) * 0.75
  })

  return (
    <group>
      {/* Sky and the eclipse */}
      <points ref={starsRef} geometry={starGeo} material={starMat} frustumCulled={false} />
      <Billboard position={SUN}>
        <mesh ref={eclipseRef} material={eclipseMat}>
          <planeGeometry args={[SUN_R * SPAN, SUN_R * SPAN]} />
        </mesh>
      </Billboard>

      {/* The dune */}
      <LightLine ref={duneRef} points={dune} segments color={PALETTE.starGold} intensity={0.3} width={0.01} opacity={0} />
      <LightLine ref={crestRef} points={crest} color={PALETTE.starGold} intensity={0.7} width={0.014} />

      {/* The home-built refractor, in light-wire */}
      <LightLine ref={scopeRef} points={scope} segments color={PALETTE.stellarBlue} intensity={1.5} width={0.011} />
      <GlowSprite ref={glintRef} position={[OBJECTIVE.x, OBJECTIVE.y, OBJECTIVE.z]} color={PALETTE.starGold} intensity={GLOW.hero} size={0.5} opacity={0} />
      <LightLine ref={sightRef} points={sight} color={PALETTE.stellarBlue} intensity={0.6} width={0.008} dashed dashSize={0.08} gapSize={0.12} opacity={0} />

      <Label ref={scopeLabelRef} position={[-3.0, 0.95, MOUNT.z]} color={PALETTE.stellarBlue} opacity={0}>Home-built refractor</Label>
      <Label ref={ringLabelRef} position={[SUN.x, SUN.y - SUN_R * 1.75, SUN.z]} color={PALETTE.starGold} opacity={0}>Annularity</Label>
    </group>
  )
}
