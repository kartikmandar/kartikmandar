// src/components/CosmicJourney3D/scenes/Beat_JournalClub.tsx
'use client'

// Beat 15 · Starting a Journal Club (Act III, ignition).
// Friday nights, one paper, whoever showed up: a ring of small seated figures
// made of light gathers, one by one, around a campfire of light. Sparks rise
// from the fire, and a few of them unfold into pages of light (papers) that
// spiral up and settle into a slow orbit above the circle. The seat facing the
// camera is left open.

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr, setHdr } from '../art/palette'
import { createRimMaterial, getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { INSTANCED_VERTEX_GLSL, NOISE_GLSL } from '../art/glsl'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, seeded } from '../art/anim'

// The circle sits on a floor of light a little below the stage centre.
const CENTER = new THREE.Vector3(0, -0.72, -1.6)
const CIRCLE_RADIUS = 1.85
const FIGURES = 9
// Leave the seat facing the camera open (and the fire unblocked): figures span this arc.
const OPEN_SEAT = 0.8
const FIRE_BASE_Y = CENTER.y + 0.06
const FIRE_TOP_Y = CENTER.y + 0.95
const PAGES = 9
const ORBIT_RADIUS = 2.55
const ORBIT_Y = 1.85
// Camera station in scene-local space (pages turn to face it).
const CAMERA_LOCAL = new THREE.Vector3(0, 1.5, 7)
// Frozen clock for reduced motion: a pleasant mid-flicker frame.
const FROZEN_T = 7.3

interface Seat {
  angle: number
  scale: number
}

function seats(): Seat[] {
  const out: Seat[] = []
  const span = Math.PI * 2 - OPEN_SEAT * 2
  for (let i = 0; i < FIGURES; i++) {
    const even = OPEN_SEAT + (span * (i + 0.5)) / FIGURES
    out.push({ angle: even + (seeded(i, 1) - 0.5) * 0.22, scale: 0.88 + seeded(i, 2) * 0.24 })
  }
  return out
}

// A seated, cross-legged silhouette, revolved around Y (head is a separate instance).
function torsoGeometry(): THREE.LatheGeometry {
  const profile: Array<[number, number]> = [
    [0.0, 0.0], [0.25, 0.0], [0.28, 0.05], [0.22, 0.11], [0.15, 0.18],
    [0.155, 0.3], [0.15, 0.4], [0.11, 0.47], [0.05, 0.5], [0.0, 0.505],
  ]
  return new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 24)
}

function circlePoints(radius: number, y: number, n: number): THREE.Vector3[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return new THREE.Vector3(CENTER.x + Math.sin(a) * radius, y, CENTER.z + Math.cos(a) * radius)
  })
}

// Three crossed logs of the fire, as hairline segments.
function logPoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI + 0.3
    const dx = Math.cos(a) * 0.36
    const dz = Math.sin(a) * 0.36
    pts.push(
      new THREE.Vector3(CENTER.x - dx, CENTER.y + 0.02, CENTER.z - dz),
      new THREE.Vector3(CENTER.x + dx, CENTER.y + 0.12, CENTER.z + dz),
    )
  }
  return pts
}

const PLANE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Flame made of light: a noise-licked tongue, hot white-gold core, ember edges.
const FIRE_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform float uTime;
  uniform float uIgnite;
  uniform vec3 uHot;
  uniform vec3 uWarm;
  uniform vec3 uEdge;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    float x = uv.x - 0.5;
    float y = uv.y;
    float n = fbm(vec3(x * 3.6, y * 2.4 - uTime * 1.35, uTime * 0.21));
    float n2 = fbm(vec3(x * 7.0 + 3.1, y * 4.5 - uTime * 2.1, 1.7));
    // tongue width narrows with height; noise sways and splits it
    float width = 0.34 * (1.0 - y) * (0.75 + 0.5 * n) + 0.015;
    float sway = (n - 0.5) * 0.28 * y + (n2 - 0.5) * 0.08 * y;
    float d = abs(x + sway);
    float body = 1.0 - smoothstep(width * 0.35, width, d);
    float height = smoothstep(0.95, 0.2, y + (n2 - 0.4) * 0.35);
    float flame = body * height * smoothstep(0.0, 0.06, y) * uIgnite;
    float core = pow(flame, 3.0);
    vec3 col = uEdge * flame * 0.5 + uWarm * pow(flame, 1.6) * 0.6 + uHot * core * 0.55;
    gl_FragColor = vec4(col, 1.0);
  }
`

// Firelight pooled on the floor: a warm radial falloff that breathes with the flame.
const FLOOR_FRAG = /* glsl */ `
  uniform float uGlow;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float pool = exp(-r * r * 5.5) * 0.9 + exp(-r * r * 1.6) * 0.18;
    gl_FragColor = vec4(uColor * pool * uGlow * (1.0 - smoothstep(0.85, 1.0, r)), 1.0);
  }
`

const SPARK_VERT = /* glsl */ `
  attribute float aSeed;
  attribute vec3 aJitter;
  uniform float uTime;
  uniform float uSize;
  uniform vec3 uOrigin;
  varying float vLife;
  void main() {
    float speed = 0.13 + 0.09 * fract(aSeed * 7.31);
    float life = fract(aSeed + uTime * speed);
    vLife = life;
    float ang = aSeed * 6.2831 + life * (1.6 + aJitter.x * 2.2);
    float rad = 0.06 + life * (0.25 + 0.55 * abs(aJitter.y));
    float rise = life * (1.7 + 1.3 * abs(aJitter.z)) + life * life * 0.5;
    vec3 p = uOrigin + vec3(cos(ang) * rad, rise, sin(ang) * rad);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (1.0 - 0.55 * life) * (0.6 + 0.8 * fract(aSeed * 13.7)) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const SPARK_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uHot;
  uniform vec3 uCool;
  uniform float uOpacity;
  varying float vLife;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    float fade = smoothstep(0.0, 0.05, vLife) * (1.0 - smoothstep(0.45, 1.0, vLife));
    vec3 col = mix(uHot, uCool, smoothstep(0.05, 0.5, vLife));
    gl_FragColor = vec4(col * a * fade * uOpacity, 1.0);
  }
`

// A page of light: glowing edge, a title bar, and ragged lines of text.
// Per-page brightness and tint arrive through instanceColor.
const PAGE_VERT = /* glsl */ `
  ${INSTANCED_VERTEX_GLSL}
  attribute float aSeed;
  varying vec2 vUv;
  varying vec3 vTint;
  varying float vSeed;
  void main() {
    vUv = uv;
    vSeed = aSeed;
    vTint = vec3(1.0);
    #ifdef USE_INSTANCING_COLOR
      vTint = instanceColor;
    #endif
    gl_Position = projectionMatrix * modelViewMatrix * instancedPosition(position);
  }
`

const PAGE_FRAG = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vTint;
  varying float vSeed;
  float hash(float n) { return fract(sin(n) * 43758.5453); }
  void main() {
    vec2 uv = vUv;
    vec2 e = min(uv, 1.0 - uv);
    float edge = 1.0 - smoothstep(0.0, 0.035, min(e.x, e.y));
    float rows = uv.y * 15.0;
    float row = floor(rows);
    float f = fract(rows);
    float inRow = smoothstep(0.32, 0.42, f) * (1.0 - smoothstep(0.58, 0.68, f));
    float len = 0.45 + 0.45 * hash(row * 12.9898 + vSeed * 78.233);
    float text = inRow * step(0.14, uv.x) * step(uv.x, 0.14 + len * 0.72) * step(0.1, uv.y) * step(uv.y, 0.74);
    float title = step(0.82, uv.y) * step(uv.y, 0.89) * step(0.14, uv.x) * step(uv.x, 0.72);
    float fill = 0.07;
    vec3 col = vTint * (fill + edge * 1.25 + text * 0.4 + title * 0.85);
    gl_FragColor = vec4(col, 1.0);
  }
`

function sparkGeometry(count: number): THREE.BufferGeometry {
  const seed = new Float32Array(count)
  const jitter = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    seed[i] = seeded(i, 10)
    jitter[i * 3] = seeded(i, 11) - 0.5
    jitter[i * 3 + 1] = seeded(i, 12) - 0.5
    jitter[i * 3 + 2] = seeded(i, 13) - 0.5
  }
  const g = new THREE.BufferGeometry()
  // Positions are computed in the shader; a zeroed attribute satisfies three.
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  g.setAttribute('aJitter', new THREE.BufferAttribute(jitter, 3))
  return g
}

// Per-page orbit parameters: home angle, orbit radius, height, birth time, tilt.
function pageSeeds(): Float32Array {
  const s = new Float32Array(PAGES * 5)
  for (let i = 0; i < PAGES; i++) {
    const o = i * 5
    s[o] = (i / PAGES) * Math.PI * 2 + (seeded(i, 21) - 0.5) * 0.4
    s[o + 1] = ORBIT_RADIUS + (seeded(i, 22) - 0.5) * 0.5
    s[o + 2] = ORBIT_Y + (seeded(i, 23) - 0.5) * 0.8
    s[o + 3] = 0.24 + i * 0.042 + seeded(i, 24) * 0.02
    s[o + 4] = (seeded(i, 25) - 0.5) * 0.35
  }
  return s
}

// Module-level scratch: no allocation inside useFrame.
const _obj = new THREE.Object3D()
const _color = new THREE.Color()
const SPARK_TINT = hdr(PALETTE.ember, GLOW.hero)
const PAGE_TINT = hdr(PALETTE.signal, 1.25)
const BLACK = new THREE.Color(0, 0, 0)

export default function Beat_JournalClub({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const torsoRef = useRef<THREE.InstancedMesh>(null)
  const headRef = useRef<THREE.InstancedMesh>(null)
  const fireRef = useRef<THREE.Mesh>(null)
  const coreRef = useRef<THREE.Sprite>(null)
  const floorRef = useRef<THREE.Mesh>(null)
  const sparksRef = useRef<THREE.Points>(null)
  const pagesRef = useRef<THREE.InstancedMesh>(null)
  const pitRef = useRef<LightLineObject>(null)
  const logsRef = useRef<LightLineObject>(null)
  const orbitRef = useRef<LightLineObject>(null)
  const labelRef = useRef<THREE.Mesh & { fillOpacity: number }>(null)

  const seatList = useMemo(() => seats(), [])
  const pageData = useMemo(() => pageSeeds(), [])
  const pit = useMemo(() => circlePoints(0.46, CENTER.y + 0.01, 48), [])
  const logs = useMemo(() => logPoints(), [])
  const orbit = useMemo(() => circlePoints(ORBIT_RADIUS, ORBIT_Y, 96), [])

  const torsoGeo = useDisposable(torsoGeometry)
  const headGeo = useDisposable(() => new THREE.SphereGeometry(0.1, 20, 16))
  // Firelit figures: near-black bodies, warm gold rims.
  const figureMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.emberDeep, 0.05),
    rim: hdr(PALETTE.starGold, 1.45),
    power: 2.2,
    instancedReveal: true,
  }))

  // Place figures facing the fire; each arrives in turn ("whoever showed up").
  useLayoutEffect(() => {
    const torsos = torsoRef.current
    const heads = headRef.current
    if (!torsos || !heads) return
    const obj = new THREE.Object3D()
    const delays = new Float32Array(FIGURES)
    // arrival order: shuffled deterministically around the circle
    const order = seatList.map((_, i) => i).sort((a, b) => seeded(a, 3) - seeded(b, 3))
    order.forEach((seat, rank) => { delays[seat] = (rank / FIGURES) * 0.85 })
    seatList.forEach((s, i) => {
      const x = CENTER.x + Math.sin(s.angle) * CIRCLE_RADIUS
      const z = CENTER.z + Math.cos(s.angle) * CIRCLE_RADIUS
      obj.position.set(x, CENTER.y, z)
      obj.rotation.set(0, s.angle, 0)
      obj.scale.setScalar(s.scale)
      obj.updateMatrix()
      torsos.setMatrixAt(i, obj.matrix)
      // head leans in toward the fire, listening
      const lean = 0.06 * s.scale
      obj.position.set(x - Math.sin(s.angle) * lean, CENTER.y + 0.6 * s.scale, z - Math.cos(s.angle) * lean)
      obj.updateMatrix()
      heads.setMatrixAt(i, obj.matrix)
    })
    torsos.instanceMatrix.needsUpdate = true
    heads.instanceMatrix.needsUpdate = true
    torsos.geometry.setAttribute('aDelay', new THREE.InstancedBufferAttribute(delays, 1))
    heads.geometry.setAttribute('aDelay', new THREE.InstancedBufferAttribute(delays.slice(), 1))
  }, [seatList])

  const fireMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIgnite: { value: 0 },
      uHot: { value: hdr(PALETTE.nearWhite, GLOW.hot) },
      uWarm: { value: hdr(PALETTE.starGold, GLOW.hero) },
      uEdge: { value: hdr(PALETTE.ember, GLOW.hero) },
    },
    vertexShader: PLANE_VERT,
    fragmentShader: FIRE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  const floorMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: { uGlow: { value: 0 }, uColor: { value: hdr(PALETTE.starGold, 0.42) } },
    vertexShader: PLANE_VERT,
    fragmentShader: FLOOR_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  const sparkCount = quality === 'mobile' ? 100 : quality === 'low' ? 200 : 400
  const sparkGeo = useDisposable(() => sparkGeometry(sparkCount), [sparkCount])
  const sparkMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 26 },
      uOrigin: { value: new THREE.Vector3(CENTER.x, FIRE_BASE_Y + 0.25, CENTER.z) },
      uMap: { value: getGlowTexture() },
      uHot: { value: hdr(PALETTE.ember, GLOW.hero) },
      uCool: { value: hdr(PALETTE.starGold, GLOW.base) },
      uOpacity: { value: 0 },
    },
    vertexShader: SPARK_VERT,
    fragmentShader: SPARK_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  const pageGeo = useDisposable(() => {
    const g = new THREE.PlaneGeometry(0.34, 0.44)
    const seed = new Float32Array(PAGES)
    for (let i = 0; i < PAGES; i++) seed[i] = seeded(i, 26) * 10
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 1))
    return g
  })
  const pageMat = useDisposable(() => new THREE.ShaderMaterial({
    vertexShader: PAGE_VERT,
    fragmentShader: PAGE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  }))

  // instanceColor must exist before the first draw so the program compiles with it.
  useLayoutEffect(() => {
    const pages = pagesRef.current
    if (!pages) return
    for (let i = 0; i < PAGES; i++) pages.setColorAt(i, BLACK)
    if (pages.instanceColor) pages.instanceColor.needsUpdate = true
  }, [])

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? FROZEN_T : beat.clock

    // 1 · the fire catches
    const ignite = ease(p, 0.02, 0.2)
    const flicker = reducedMotion ? 1 : 0.88 + 0.12 * Math.sin(t * 9.1) * Math.sin(t * 5.3 + 0.7)
    setUniform(fireRef.current, 'uTime', t)
    setUniform(fireRef.current, 'uIgnite', ignite)
    setUniform(floorRef.current, 'uGlow', ignite * flicker)
    const core = coreRef.current
    if (core) {
      ;(core.material as THREE.SpriteMaterial).opacity = ignite * (0.55 + 0.3 * flicker)
      const s = 1.1 + 0.15 * flicker
      core.scale.set(s, s, 1)
    }
    setLineOpacity(pitRef.current, ease(p, 0.0, 0.14) * 0.9)
    setLineOpacity(logsRef.current, ease(p, 0.0, 0.14))

    // 2 · whoever showed up: figures arrive around the circle
    const gather = ease(p, 0.08, 0.42)
    setUniform(torsoRef.current, 'uReveal', gather)
    setUniform(headRef.current, 'uReveal', gather)

    // 3 · sparks rise
    setUniform(sparksRef.current, 'uTime', t)
    setUniform(sparksRef.current, 'uOpacity', ease(p, 0.1, 0.28))

    // 4 · some sparks become pages and settle into orbit around the circle
    const pages = pagesRef.current
    if (pages) {
      const spin = t * 0.07
      for (let i = 0; i < PAGES; i++) {
        const o = i * 5
        const birth = pageData[o + 3]!
        const k = ease(p, birth, birth + 0.2)
        if (k <= 0) {
          _obj.position.set(CENTER.x, FIRE_TOP_Y, CENTER.z)
          _obj.scale.setScalar(0.0001)
          _obj.updateMatrix()
          pages.setMatrixAt(i, _obj.matrix)
          pages.setColorAt(i, BLACK)
          continue
        }
        // spiral out of the fire's top into the orbit
        const angle = pageData[o]! + spin - (1 - k) * 2.4
        const radius = 0.12 + (pageData[o + 1]! - 0.12) * k
        const bob = reducedMotion ? 0 : Math.sin(t * 0.55 + i * 1.7) * 0.06 * k
        const y = FIRE_TOP_Y + (pageData[o + 2]! - FIRE_TOP_Y) * k + Math.sin(k * Math.PI) * 0.45 + bob
        const x = CENTER.x + Math.sin(angle) * radius
        const z = CENTER.z + Math.cos(angle) * radius
        _obj.position.set(x, y, z)
        // turn to face the camera, with a gentle tumble while rising
        _obj.rotation.set(-0.1 + pageData[o + 4]! * 0.4, Math.atan2(CAMERA_LOCAL.x - x, CAMERA_LOCAL.z - z), pageData[o + 4]! + (1 - k) * 2.6)
        const scale = 0.2 + 0.8 * k
        _obj.scale.set(scale, scale, scale)
        _obj.updateMatrix()
        pages.setMatrixAt(i, _obj.matrix)
        // ember spark that cools into a cyan page
        _color.lerpColors(SPARK_TINT, PAGE_TINT, ease(k, 0.0, 0.6))
        pages.setColorAt(i, setHdr(_color, _color, Math.min(1, k * 1.6)))
      }
      pages.instanceMatrix.needsUpdate = true
      if (pages.instanceColor) pages.instanceColor.needsUpdate = true
    }

    setLineReveal(orbitRef.current, ease(p, 0.3, 0.62))
    setLineOpacity(orbitRef.current, ease(p, 0.3, 0.4) * 0.55)
    if (labelRef.current) labelRef.current.fillOpacity = ease(p, 0.4, 0.55) * 0.8
  })

  return (
    <group>
      {/* Firelight pooled on the floor */}
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[CENTER.x, CENTER.y - 0.005, CENTER.z]} material={floorMat} frustumCulled={false}>
        <planeGeometry args={[6.4, 6.4]} />
      </mesh>

      {/* The fire pit, its logs and the flame */}
      <LightLine ref={pitRef} points={pit} color={PALETTE.starGold} intensity={GLOW.base} width={0.016} opacity={0} />
      <LightLine ref={logsRef} points={logs} segments color={PALETTE.ember} intensity={1.3} width={0.03} opacity={0} />
      <Billboard position={[CENTER.x, FIRE_BASE_Y + 0.62, CENTER.z]} lockX lockZ>
        <mesh ref={fireRef} material={fireMat}>
          <planeGeometry args={[1.15, 1.35]} />
        </mesh>
      </Billboard>
      <GlowSprite ref={coreRef} position={[CENTER.x, FIRE_BASE_Y + 0.22, CENTER.z]} color={PALETTE.ember} intensity={GLOW.hot} size={1.2} opacity={0} />

      {/* The circle */}
      <instancedMesh ref={torsoRef} args={[torsoGeo, figureMat, FIGURES]} frustumCulled={false} />
      <instancedMesh ref={headRef} args={[headGeo, figureMat, FIGURES]} frustumCulled={false} />

      {/* Sparks, and the pages they become */}
      <points ref={sparksRef} geometry={sparkGeo} material={sparkMat} frustumCulled={false} />
      <LightLine ref={orbitRef} points={orbit} color={PALETTE.signal} intensity={GLOW.dim} width={0.01} dashed dashSize={0.12} gapSize={0.14} opacity={0} />
      <instancedMesh ref={pagesRef} args={[pageGeo, pageMat, PAGES]} frustumCulled={false} />

      <Label ref={labelRef} position={[-3.7, 3.25, -3.2]} anchorX="left" color={PALETTE.starGold} opacity={0}>
        Journal Club · Fridays
      </Label>
    </group>
  )
}
