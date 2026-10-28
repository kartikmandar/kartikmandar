// src/components/CosmicJourney3D/scenes/Beat_HeraArray.tsx
'use client'

// Beat 12 · First Foray into Research (reference beat, Phase 1 art bible).
// HERA on the Karoo plain, made of light: a hex-packed array of zenith-pointing
// dishes lights up from the core outward, baselines draw between dish pairs,
// interference fringes sweep the sky above, and where they cross the faint red
// 21-cm haze they "sample" it. Everything animates through uniforms/refs.

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { createRimMaterial, getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { NOISE_GLSL } from '../art/glsl'
import { LightLine, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, ramp } from '../art/anim'

// Array layout: hex rings 0..4 → 61 dishes (HERA's core is hex-packed and drift-scans at zenith).
const RINGS = 4
const SPACING = 0.62
const DISH_RADIUS = 0.27
const ARRAY_CENTER = new THREE.Vector3(0, -1.25, -1.2)
const GROUND_Y = -1.42
const SKY_RADIUS = 18

interface Dish {
  x: number
  z: number
  ring: number
}

function hexArray(): Dish[] {
  const dishes: Dish[] = []
  for (let q = -RINGS; q <= RINGS; q++) {
    for (let r = -RINGS; r <= RINGS; r++) {
      const s = -q - r
      const ring = Math.max(Math.abs(q), Math.abs(r), Math.abs(s))
      if (ring > RINGS) continue
      dishes.push({ x: SPACING * (q + r / 2), z: SPACING * (r * Math.sqrt(3) / 2), ring })
    }
  }
  return dishes
}

// Paraboloid dish profile (open bowl), revolved around Y.
function dishGeometry(): THREE.LatheGeometry {
  const focal = 0.13
  const pts: THREE.Vector2[] = []
  for (let i = 0; i <= 10; i++) {
    const r = (i / 10) * DISH_RADIUS
    pts.push(new THREE.Vector2(r, (r * r) / (4 * focal)))
  }
  return new THREE.LatheGeometry(pts, 28)
}

const PLANE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const DOME_VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// The sky as the array sees it, in direction cosines (l, m): three baselines'
// fringe patterns sweep across (Earth rotation) over faint 21-cm haze; where a
// bright fringe crosses the haze it lights up ("sampling" the signal).
const DOME_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform float uTime;
  uniform float uPhase;
  uniform float uFringe;
  uniform float uHaze;
  uniform vec3 uFringeColor;
  uniform vec3 uHazeColor;
  varying vec3 vDir;
  void main() {
    vec2 lm = vDir.xz;
    float alt = vDir.y;
    // geometry ends at alt ~0.22: fade fully in above it so no edge is ever visible
    float mask = smoothstep(0.3, 0.62, alt) * (1.0 - 0.45 * smoothstep(0.8, 1.0, alt));
    float f1 = cos(dot(lm, vec2(1.0, 0.28)) * 92.0 - uPhase * 1.0);
    float f2 = cos(dot(lm, vec2(-0.45, 1.0)) * 118.0 - uPhase * 1.27);
    float f3 = cos(dot(lm, vec2(0.8, -0.65)) * 76.0 - uPhase * 0.83);
    float lines = pow(0.5 + 0.5 * f1, 40.0) + 0.7 * pow(0.5 + 0.5 * f2, 40.0) + 0.55 * pow(0.5 + 0.5 * f3, 40.0);
    // fringes fade toward the edge of the primary beam (zenith-centred)
    lines *= smoothstep(0.35, 0.95, alt);
    float haze = smoothstep(0.42, 0.9, fbm(vec3(lm * 4.2, uTime * 0.035)));
    vec3 col = uFringeColor * lines * uFringe * 0.22;
    col += uHazeColor * haze * uHaze * 0.16;
    col += mix(uHazeColor, vec3(1.0), 0.4) * lines * haze * uHaze * uFringe * 1.8;
    gl_FragColor = vec4(col * mask, 1.0);
  }
`

const GROUND_FRAG = /* glsl */ `
  uniform float uReveal;
  uniform vec3 uColor;
  varying vec2 vUv;
  float gridLine(float v, float spacing) {
    float g = abs(fract(v / spacing - 0.5) - 0.5) * spacing;
    float w = fwidth(v) * 1.2;
    return 1.0 - smoothstep(0.0, w, g);
  }
  void main() {
    vec2 p = (vUv - 0.5) * vec2(24.0, 16.0);
    float g = max(gridLine(p.x, 0.62), gridLine(p.y, 0.62));
    float fade = smoothstep(7.5, 1.5, length(p * vec2(0.75, 1.0)));
    float reveal = smoothstep(uReveal * 10.0, uReveal * 10.0 - 2.0, length(p));
    gl_FragColor = vec4(uColor * g * fade * reveal, 1.0);
  }
`

const FEED_VERT = /* glsl */ `
  attribute float aDelay;
  uniform float uReveal;
  uniform float uSize;
  varying float vLit;
  void main() {
    vLit = smoothstep(aDelay, aDelay + 0.12, uReveal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * vLit / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const FEED_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  varying float vLit;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    gl_FragColor = vec4(uColor * a * vLit, 1.0);
  }
`

export default function Beat_HeraArray({ index }: BeatSceneProps) {
  const beat = useBeat(index)
  const dishesRef = useRef<THREE.InstancedMesh>(null)
  const baselinesRef = useRef<LightLineObject>(null)
  const labelRef = useRef<THREE.Mesh & { fillOpacity: number }>(null)
  const groundRef = useRef<THREE.Mesh>(null)
  const feedsRef = useRef<THREE.Points>(null)
  const skyRef = useRef<THREE.Mesh>(null)

  const dishes = useMemo(() => hexArray(), [])
  const maxRing = RINGS

  const dishGeo = useDisposable(dishGeometry)
  const dishMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.signal, 0.05),
    rim: hdr(PALETTE.signal, 1.5),
    power: 2.8,
    instancedReveal: true,
  }))

  // Per-dish reveal delay: core first, then ring by ring (0..0.85 of uReveal).
  useLayoutEffect(() => {
    const mesh = dishesRef.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    const delays = new Float32Array(dishes.length)
    dishes.forEach((d, i) => {
      m.makeTranslation(ARRAY_CENTER.x + d.x, ARRAY_CENTER.y, ARRAY_CENTER.z + d.z)
      mesh.setMatrixAt(i, m)
      delays[i] = (d.ring / maxRing) * 0.85
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.geometry.setAttribute('aDelay', new THREE.InstancedBufferAttribute(delays, 1))
  }, [dishes, maxRing])

  // Feed points at each dish's focal point.
  const feedGeo = useDisposable(() => {
    const pos = new Float32Array(dishes.length * 3)
    const delay = new Float32Array(dishes.length)
    dishes.forEach((d, i) => {
      pos[i * 3] = ARRAY_CENTER.x + d.x
      pos[i * 3 + 1] = ARRAY_CENTER.y + 0.13
      pos[i * 3 + 2] = ARRAY_CENTER.z + d.z
      delay[i] = (d.ring / maxRing) * 0.85
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1))
    return g
  }, [dishes])
  const feedMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uColor: { value: hdr(PALETTE.nearWhite, GLOW.hero) },
      uReveal: { value: 0 },
      uSize: { value: 46 },
    },
    vertexShader: FEED_VERT,
    fragmentShader: FEED_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))

  // Baselines between dish pairs, drawn on one by one.
  const baselinePoints = useMemo(() => {
    const at = (q: number, r: number) =>
      new THREE.Vector3(ARRAY_CENTER.x + SPACING * (q + r / 2), ARRAY_CENTER.y + 0.14, ARRAY_CENTER.z + SPACING * (r * Math.sqrt(3) / 2))
    const pairs: Array<[[number, number], [number, number]]> = [
      [[0, 0], [4, 0]], [[0, 0], [-4, 4]], [[0, 0], [0, -4]],
      [[-2, 0], [2, 2]], [[3, -3], [-1, 3]], [[-4, 1], [1, -4]],
    ]
    return pairs.flatMap(([a, b]) => [at(a[0], a[1]), at(b[0], b[1])])
  }, [])

  const groundMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: { uReveal: { value: 0 }, uColor: { value: hdr(PALETTE.signal, 0.13) } },
    vertexShader: PLANE_VERT,
    fragmentShader: GROUND_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))

  const skyMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPhase: { value: 0 },
      uFringe: { value: 0 },
      uHaze: { value: 0 },
      uFringeColor: { value: hdr(PALETTE.signal, GLOW.hero) },
      uHazeColor: { value: hdr(PALETTE.hydrogen, 1.4) },
    },
    vertexShader: DOME_VERT,
    fragmentShader: DOME_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    fog: false,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = beat.clock
    setUniform(groundRef.current, 'uReveal', ease(p, 0.0, 0.3))
    const reveal = ramp(p, 0.04, 0.38)
    setUniform(dishesRef.current, 'uReveal', reveal)
    setUniform(feedsRef.current, 'uReveal', reveal)
    setLineReveal(baselinesRef.current, ease(p, 0.22, 0.46))
    const sky = skyRef.current
    setUniform(sky, 'uTime', t)
    // Earth rotation sweeps the fringes; scroll adds a gentle push.
    setUniform(sky, 'uPhase', t * 0.55 + p * 5.0)
    setUniform(sky, 'uFringe', ease(p, 0.3, 0.55))
    setUniform(sky, 'uHaze', ease(p, 0.4, 0.62))
    if (labelRef.current) labelRef.current.fillOpacity = ease(p, 0.45, 0.6) * 0.85
  })

  return (
    <group>
      {/* Karoo plain: fine light grid expanding from the array */}
      <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND_Y, -3]} material={groundMat} frustumCulled={false}>
        <planeGeometry args={[24, 16]} />
      </mesh>

      <instancedMesh ref={dishesRef} args={[dishGeo, dishMat, dishes.length]} frustumCulled={false} />
      <points ref={feedsRef} geometry={feedGeo} material={feedMat} frustumCulled={false} />

      <LightLine ref={baselinesRef} points={baselinePoints} segments color={PALETTE.signal} intensity={GLOW.hero} width={0.014} />

      {/* The array's sky: fringes over 21-cm haze, on a dome centred on the array */}
      <mesh ref={skyRef} position={ARRAY_CENTER} material={skyMat} frustumCulled={false}>
        <sphereGeometry args={[SKY_RADIUS, 64, 24, 0, Math.PI * 2, 0, 1.35]} />
      </mesh>

      <Label ref={labelRef} position={[-3.6, 3.1, -3.4]} anchorX="left" color={PALETTE.signal} opacity={0}>
        HERA · Karoo · 21 cm
      </Label>
    </group>
  )
}
