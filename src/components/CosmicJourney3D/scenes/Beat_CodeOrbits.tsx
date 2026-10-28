// src/components/CosmicJourney3D/scenes/Beat_CodeOrbits.tsx
'use client'

// Beat 6 · A New System (Act II, course-correction).
// A laptop made of light floats in space: hairline chassis, holographic glass
// screen, lines of code typing themselves on. The code then streams out of the
// screen as glyph-like particles that arc across to a young star and settle as
// beads on its orbits; the orbit lines draw on behind them and small planets
// condense, so the code literally becomes the new planetary system.

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { createHoloMaterial, createRimMaterial, getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { ease, ramp, seeded } from '../art/anim'

// Laptop: floats left of centre, turned toward the new system.
const LAPTOP_POS = new THREE.Vector3(-2.35, -0.35, -0.2)
const LAPTOP_YAW = 0.5
const BASE_W = 1.9
const BASE_D = 1.25
const BASE_H = 0.06
const SCREEN_W = 1.9
const SCREEN_H = 1.2
const SCREEN_TILT = 0.22 // leaned back from vertical

// The new system: centre and orbit plane (opened toward the camera).
const SYSTEM = new THREE.Vector3(1.55, 1.25, -2.6)
const SYSTEM_TILT = new THREE.Euler(0.5, 0, -0.12)
const ORBITS = [0.75, 1.2, 1.7, 2.25] as const
const PLANET_PHASE = [0.4, 2.3, 4.4, 1.2] as const

const CODE_ROWS = 9

/** Angular speed of an orbit (Kepler: w ~ r^-3/2), radians per second. */
const omega = (r: number) => 0.32 * Math.pow(r / ORBITS[0], -1.5)

// Laptop-local → scene transform of the screen's surface (screen-local XY, z out).
function screenMatrix(): THREE.Matrix4 {
  return new THREE.Matrix4()
    .makeTranslation(LAPTOP_POS.x, LAPTOP_POS.y, LAPTOP_POS.z)
    .multiply(new THREE.Matrix4().makeRotationY(LAPTOP_YAW))
    .multiply(new THREE.Matrix4().makeTranslation(0, BASE_H / 2, -BASE_D / 2))
    .multiply(new THREE.Matrix4().makeRotationX(-SCREEN_TILT))
    .multiply(new THREE.Matrix4().makeTranslation(0, SCREEN_H / 2, 0))
}

function boxEdges(w: number, h: number, d: number): THREE.Vector3[] {
  const x = w / 2
  const y = h / 2
  const z = d / 2
  const c = [
    [-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z],
    [-x, y, -z], [x, y, -z], [x, y, z], [-x, y, z],
  ].map(([a, b, cc]) => new THREE.Vector3(a, b, cc))
  const e = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]
  return e.flatMap(([a, b]) => [c[a!]!, c[b!]!])
}

// Keyboard: a hairline grid inset on the deck, plus the trackpad.
function keyboardPoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const y = BASE_H / 2 + 0.002
  const x0 = -0.78
  const x1 = 0.78
  const z0 = -0.55
  const z1 = -0.05
  for (let r = 0; r <= 4; r++) {
    const z = z0 + ((z1 - z0) * r) / 4
    pts.push(new THREE.Vector3(x0, y, z), new THREE.Vector3(x1, y, z))
  }
  for (let c = 0; c <= 12; c++) {
    const x = x0 + ((x1 - x0) * c) / 12
    pts.push(new THREE.Vector3(x, y, z0), new THREE.Vector3(x, y, z1))
  }
  const tp = [[-0.32, 0.12], [0.32, 0.12], [0.32, 0.5], [-0.32, 0.5]] as const
  for (let i = 0; i < 4; i++) {
    const a = tp[i]!
    const b = tp[(i + 1) % 4]!
    pts.push(new THREE.Vector3(a[0], y, a[1]), new THREE.Vector3(b[0], y, b[1]))
  }
  return pts
}

// Code on the screen: indented rows of short "token" dashes (no real glyphs).
function codePoints(): { points: THREE.Vector3[]; rowEnds: number[] } {
  const pts: THREE.Vector3[] = []
  const rowEnds: number[] = []
  const indent = [0, 1, 2, 2, 3, 2, 1, 1, 0]
  const left = -SCREEN_W / 2 + 0.16
  const top = SCREEN_H / 2 - 0.17
  for (let r = 0; r < CODE_ROWS; r++) {
    const y = top - r * 0.105
    let x = left + indent[r]! * 0.12
    const tokens = 2 + Math.floor(seeded(r, 21) * 4)
    for (let k = 0; k < tokens; k++) {
      const len = 0.06 + seeded(r * 7 + k, 22) * 0.22
      if (x + len > SCREEN_W / 2 - 0.15) break
      pts.push(new THREE.Vector3(x, y, 0.01), new THREE.Vector3(x + len, y, 0.01))
      x += len + 0.05
    }
    rowEnds.push(pts.length / 2)
  }
  return { points: pts, rowEnds }
}

function circlePoints(radius: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= 160; i++) {
    const a = (i / 160) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
  }
  return pts
}

// Code particles: born on the screen, pushed out along its normal, arcing over to
// a slot on an orbit that keeps turning. Positions are computed on the GPU.
const CODE_VERT = /* glsl */ `
  attribute vec3 aStart;
  attribute vec3 aSlot; // orbit radius, phase, angular speed
  attribute float aDelay;
  attribute float aSeed;
  uniform float uFlow;
  uniform float uTime;
  uniform float uSize;
  uniform vec3 uCenter;
  uniform vec3 uNormal;
  uniform mat3 uTilt;
  varying float vSettle;
  varying float vAlive;
  varying float vSeed;
  void main() {
    float s = smoothstep(aDelay, aDelay + 0.28, uFlow);
    vSettle = smoothstep(0.75, 1.0, s);
    vAlive = smoothstep(aDelay - 0.015, aDelay + 0.01, uFlow);
    vSeed = aSeed;
    float ang = aSlot.y + aSlot.z * uTime;
    vec3 target = uCenter + uTilt * vec3(cos(ang) * aSlot.x, 0.0, sin(ang) * aSlot.x);
    vec3 p1 = aStart + uNormal * 1.3 + vec3(0.0, 0.9 + aSeed * 0.6, 0.0);
    float u = 1.0 - s;
    vec3 p = u * u * aStart + 2.0 * u * s * p1 + s * s * target;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * mix(1.0, 0.7, vSettle) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

// In flight a particle is a tiny procedural glyph (a 3x5 cell pattern hashed per
// particle); as it settles it melts into a round bead of light.
const CODE_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uGlyph;
  uniform vec3 uBead;
  uniform float uOpacity;
  varying float vSettle;
  varying float vAlive;
  varying float vSeed;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
  void main() {
    vec2 uv = gl_PointCoord;
    vec2 g = (uv - vec2(0.2, 0.1)) / vec2(0.6, 0.8);
    float glyph = 0.0;
    if (g.x >= 0.0 && g.x < 1.0 && g.y >= 0.0 && g.y < 1.0) {
      vec2 cell = floor(g * vec2(3.0, 5.0));
      vec2 f = fract(g * vec2(3.0, 5.0));
      float on = step(0.48, hash(cell + vSeed * 97.0));
      float inset = step(0.12, f.x) * step(f.x, 0.88) * step(0.1, f.y) * step(f.y, 0.9);
      glyph = on * inset;
    }
    float bead = texture2D(uMap, uv).a;
    vec3 col = mix(uGlyph * glyph, uBead * bead, vSettle);
    gl_FragColor = vec4(col * vAlive * uOpacity, 1.0);
  }
`

const DUST_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  varying float vTwinkle;
  void main() {
    vTwinkle = 0.55 + 0.45 * sin(uTime * (0.5 + aSeed * 1.2) + aSeed * 40.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (0.5 + aSeed) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`
const DUST_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vTwinkle;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    gl_FragColor = vec4(uColor * a * vTwinkle * uOpacity, 1.0);
  }
`

// Module-level scratch: no allocation inside useFrame.
const _obj = new THREE.Object3D()
const _local = new THREE.Vector3()
const TILT_MATRIX = new THREE.Matrix4().makeRotationFromEuler(SYSTEM_TILT)

export default function Beat_CodeOrbits({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const chassisRef = useRef<THREE.Group>(null)
  const screenRef = useRef<THREE.Mesh>(null)
  const codeRef = useRef<LightLineObject>(null)
  const caretRef = useRef<THREE.Sprite>(null)
  const screenGlowRef = useRef<THREE.Sprite>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const orbitsRef = useRef<THREE.Group>(null)
  const planetsRef = useRef<THREE.InstancedMesh>(null)
  const sunGlowRef = useRef<THREE.Sprite>(null)
  const sunRef = useRef<THREE.Mesh>(null)
  const dustRef = useRef<THREE.Points>(null)

  const base = useMemo(() => boxEdges(BASE_W, BASE_H, BASE_D), [])
  const keyboard = useMemo(() => keyboardPoints(), [])
  const code = useMemo(() => codePoints(), [])
  const orbitLines = useMemo(() => ORBITS.map((r) => circlePoints(r)), [])

  const count = quality === 'mobile' ? 100 : quality === 'low' ? 200 : 400

  const codeGeo = useDisposable(() => {
    const m = screenMatrix()
    const start = new Float32Array(count * 3)
    const slot = new Float32Array(count * 3)
    const delay = new Float32Array(count)
    const seed = new Float32Array(count)
    const v = new THREE.Vector3()
    for (let i = 0; i < count; i++) {
      // Born on a code row (rows emit top to bottom, like a file being run).
      const row = Math.floor(seeded(i, 31) * CODE_ROWS)
      v.set(
        -SCREEN_W / 2 + 0.16 + seeded(i, 32) * (SCREEN_W - 0.4),
        SCREEN_H / 2 - 0.17 - row * 0.105,
        0.02,
      ).applyMatrix4(m)
      start[i * 3] = v.x
      start[i * 3 + 1] = v.y
      start[i * 3 + 2] = v.z
      const orbit = i % ORBITS.length
      const r = ORBITS[orbit]!
      slot[i * 3] = r * (1 + (seeded(i, 33) - 0.5) * 0.02)
      slot[i * 3 + 1] = seeded(i, 34) * Math.PI * 2
      slot[i * 3 + 2] = omega(r)
      // Inner orbits fill first; a little scatter keeps the stream continuous.
      delay[i] = orbit * 0.13 + seeded(i, 35) * 0.25
      seed[i] = seeded(i, 36)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    g.setAttribute('aStart', new THREE.BufferAttribute(start, 3))
    g.setAttribute('aSlot', new THREE.BufferAttribute(slot, 3))
    g.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [count])

  const codeMat = useDisposable(() => {
    const normal = new THREE.Vector3(0, 0, 1).transformDirection(screenMatrix())
    return new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: getGlowTexture() },
        uFlow: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: 52 },
        uCenter: { value: SYSTEM.clone() },
        uNormal: { value: normal },
        uTilt: { value: new THREE.Matrix3().setFromMatrix4(TILT_MATRIX) },
        uGlyph: { value: hdr(PALETTE.signal, GLOW.hero) },
        uBead: { value: hdr(PALETTE.signal, 1.4) },
        uOpacity: { value: 1 },
      },
      vertexShader: CODE_VERT,
      fragmentShader: CODE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    })
  })

  const dustCount = Math.round(count * 0.5)
  const dustGeo = useDisposable(() => {
    const pos = new Float32Array(dustCount * 3)
    const seed = new Float32Array(dustCount)
    for (let i = 0; i < dustCount; i++) {
      pos[i * 3] = (seeded(i, 41) - 0.5) * 11
      pos[i * 3 + 1] = -1.2 + seeded(i, 42) * 5.2
      pos[i * 3 + 2] = -6 + seeded(i, 43) * 6
      seed[i] = seeded(i, 44)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [dustCount])
  const dustMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uColor: { value: hdr(PALETTE.stellarBlue, GLOW.dim) },
      uTime: { value: 0 },
      uSize: { value: 20 },
      uOpacity: { value: 0 },
    },
    vertexShader: DUST_VERT,
    fragmentShader: DUST_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  const screenMat = useDisposable(() => createHoloMaterial(hdr(PALETTE.signal, 1.1)))
  const sunMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.signal, 0.4),
    rim: hdr(PALETTE.nearWhite, GLOW.hero),
    power: 1.6,
  }))
  const planetGeo = useDisposable(() => new THREE.SphereGeometry(1, 24, 24))
  const planetMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.signal, 0.08),
    rim: hdr(PALETTE.signal, 1.6),
    power: 2.4,
  }))

  // Planets start collapsed until their orbit has formed.
  useLayoutEffect(() => {
    const mesh = planetsRef.current
    if (!mesh) return
    const m = new THREE.Matrix4().makeScale(0, 0, 0)
    for (let i = 0; i < ORBITS.length; i++) mesh.setMatrixAt(i, m)
    mesh.instanceMatrix.needsUpdate = true
  }, [])

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock

    // 1 · the laptop materialises and floats
    const appear = ease(p, 0.0, 0.18)
    const chassis = chassisRef.current
    if (chassis) {
      chassis.position.set(LAPTOP_POS.x, LAPTOP_POS.y + Math.sin(t * 0.5) * 0.04, LAPTOP_POS.z)
      chassis.rotation.set(0, LAPTOP_YAW + Math.sin(t * 0.23) * 0.02, 0)
      chassis.visible = appear > 0.001
      for (let i = 0; i < 2; i++) setLineOpacity(chassis.children[i] as LightLineObject, appear * (i === 0 ? 1 : 0.7))
    }
    setUniform(screenRef.current, 'uTime', t)
    setUniform(screenRef.current, 'uOpacity', ease(p, 0.04, 0.2))

    // 2 · code types itself on, row by row
    const typed = ramp(p, 0.1, 0.42)
    setLineReveal(codeRef.current, typed)
    setLineOpacity(codeRef.current, appear * (1 - 0.45 * ease(p, 0.6, 0.85)))
    const caret = caretRef.current
    if (caret) {
      const segs = code.points.length / 2
      const shown = Math.round(segs * typed)
      let row = 0
      while (row < CODE_ROWS - 1 && code.rowEnds[row]! <= shown) row++
      const y = SCREEN_H / 2 - 0.17 - row * 0.105
      const lastSeg = Math.max(0, Math.min(segs - 1, shown - 1))
      const x = shown > 0 && (row === 0 || code.rowEnds[row - 1]! < shown) ? code.points[lastSeg * 2 + 1]!.x + 0.05 : -SCREEN_W / 2 + 0.16
      caret.position.set(x, y, 0.02)
      const blink = reducedMotion ? 1 : 0.5 + 0.5 * Math.sign(Math.sin(t * 5.5))
      ;(caret.material as THREE.SpriteMaterial).opacity = appear * (0.35 + 0.65 * blink)
    }
    const screenGlow = screenGlowRef.current
    if (screenGlow) (screenGlow.material as THREE.SpriteMaterial).opacity = appear * (0.25 + 0.35 * ease(p, 0.22, 0.4))

    // 3 · code streams out and becomes the system
    const flow = ramp(p, 0.2, 0.84)
    const particles = particlesRef.current
    setUniform(particles, 'uFlow', flow)
    setUniform(particles, 'uTime', t)

    const orbits = orbitsRef.current
    if (orbits) {
      for (let i = 0; i < orbits.children.length; i++) {
        const line = orbits.children[i] as LightLineObject
        // An orbit draws on as its code arrives.
        const start = 0.32 + i * 0.1
        setLineReveal(line, ease(p, start, start + 0.22))
        setLineOpacity(line, ramp(p, start, start + 0.03))
      }
    }

    const sunAppear = ease(p, 0.24, 0.45)
    if (sunRef.current) {
      const s = 0.2 * sunAppear + 0.001
      sunRef.current.scale.set(s, s, s)
    }
    const sunGlow = sunGlowRef.current
    if (sunGlow) (sunGlow.material as THREE.SpriteMaterial).opacity = sunAppear * (0.85 + 0.15 * Math.sin(t * 0.9))

    const planets = planetsRef.current
    if (planets) {
      for (let i = 0; i < ORBITS.length; i++) {
        const r = ORBITS[i]!
        const form = ease(p, 0.5 + i * 0.07, 0.66 + i * 0.07)
        const ang = PLANET_PHASE[i]! + omega(r) * t + p * 0.6
        _local.set(Math.cos(ang) * r, 0, Math.sin(ang) * r).applyMatrix4(TILT_MATRIX).add(SYSTEM)
        _obj.position.copy(_local)
        const size = (0.06 + 0.025 * i) * form + 0.0001
        _obj.scale.set(size, size, size)
        _obj.updateMatrix()
        planets.setMatrixAt(i, _obj.matrix)
      }
      planets.instanceMatrix.needsUpdate = true
    }

    setUniform(dustRef.current, 'uTime', t)
    setUniform(dustRef.current, 'uOpacity', appear)
  })

  return (
    <group>
      <points ref={dustRef} geometry={dustGeo} material={dustMat} frustumCulled={false} />

      {/* The laptop of light */}
      <group ref={chassisRef} position={LAPTOP_POS} rotation={[0, LAPTOP_YAW, 0]} visible={false}>
        <LightLine points={base} segments color={PALETTE.signal} intensity={GLOW.base} width={0.014} opacity={0} />
        <LightLine points={keyboard} segments color={PALETTE.signal} intensity={GLOW.dim} width={0.008} opacity={0} />
        <group position={[0, BASE_H / 2, -BASE_D / 2]} rotation={[-SCREEN_TILT, 0, 0]}>
          <group position={[0, SCREEN_H / 2, 0]}>
            <mesh ref={screenRef} material={screenMat}>
              <planeGeometry args={[SCREEN_W, SCREEN_H]} />
            </mesh>
            <LightLine ref={codeRef} points={code.points} segments color={PALETTE.signal} intensity={1.5} width={0.022} opacity={0} />
            <GlowSprite ref={caretRef} color={PALETTE.nearWhite} intensity={GLOW.hero} size={0.12} opacity={0} />
            <GlowSprite ref={screenGlowRef} position={[0, 0, 0.25]} color={PALETTE.signal} intensity={GLOW.base} size={2.6} opacity={0} />
          </group>
        </group>
      </group>

      {/* Code in flight: glyphs that become orbit beads */}
      <points ref={particlesRef} geometry={codeGeo} material={codeMat} frustumCulled={false} />

      {/* The new planetary system */}
      <mesh ref={sunRef} position={SYSTEM} material={sunMat} scale={0.001}>
        <sphereGeometry args={[1, 40, 40]} />
      </mesh>
      <GlowSprite ref={sunGlowRef} position={[SYSTEM.x, SYSTEM.y, SYSTEM.z]} color={PALETTE.signal} intensity={GLOW.hero} size={1.6} opacity={0} />
      <group ref={orbitsRef} position={SYSTEM} rotation={SYSTEM_TILT}>
        {orbitLines.map((pts, i) => (
          <LightLine key={i} points={pts} color={PALETTE.signal} intensity={i === 1 ? 1.4 : GLOW.base} width={0.012} opacity={0} />
        ))}
      </group>
      <instancedMesh ref={planetsRef} args={[planetGeo, planetMat, ORBITS.length]} frustumCulled={false} />
    </group>
  )
}
