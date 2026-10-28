// src/components/CosmicJourney3D/scenes/Beat_Trajectory.tsx
'use client'

// Beat 3 · A Future Decided (Act I, spark).
// A star map made of light: a polar navigation grid on the floor, a small
// rim-lit Earth, and a distant star far up and away. A faint dashed course is
// already plotted between them; a pen of light traces it from Earth to the
// star, dropping waypoint ticks to the map as it goes. When it arrives the
// course flashes and locks: a reticle snaps shut around the star, and from then
// on small pulses of light travel the locked line.

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
import { ease, pulse, seeded } from '../art/anim'

// ---- Layout -----------------------------------------------------------------

const EARTH = new THREE.Vector3(-3.0, -0.25, -0.6)
const EARTH_R = 0.36
const STAR = new THREE.Vector3(3.2, 2.85, -4.6)
const MAP_Y = -0.98
const MAP_CENTER = new THREE.Vector3(0.2, MAP_Y, -2.2)
const WAYPOINTS = [0.18, 0.36, 0.54, 0.72, 0.88]
const SAMPLES = 160

/** The plotted course: leaves Earth upward, bends across the map, climbs to the star. */
const COURSE = new THREE.CubicBezierCurve3(
  new THREE.Vector3(EARTH.x + EARTH_R * 0.62, EARTH.y + EARTH_R * 0.78, EARTH.z),
  new THREE.Vector3(-1.4, 2.3, -0.7),
  new THREE.Vector3(1.0, 0.7, -3.4),
  STAR.clone(),
)

/** Reticle: four corner brackets in the star's local (camera-facing) plane. */
function reticlePoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const r = 0.42
  const k = 0.15
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      pts.push(new THREE.Vector3(sx * r, sy * r, 0), new THREE.Vector3(sx * (r - k), sy * r, 0))
      pts.push(new THREE.Vector3(sx * r, sy * r, 0), new THREE.Vector3(sx * r, sy * (r - k), 0))
    }
  }
  return pts
}

/** Earth's tilted equator. */
function equatorPoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const tilt = 0.41 // 23.4 degrees
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2
    const x = Math.cos(a) * EARTH_R * 1.01
    const z = Math.sin(a) * EARTH_R * 1.01
    pts.push(new THREE.Vector3(EARTH.x + x * Math.cos(tilt), EARTH.y + x * Math.sin(tilt), EARTH.z + z))
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

// Polar navigation grid: range rings and bearing spokes, revealed from the centre.
const MAP_FRAG = /* glsl */ `
  uniform float uReveal;
  uniform vec3 uColor;
  varying vec2 vUv;
  float ringLine(float v, float spacing) {
    float g = abs(fract(v / spacing - 0.5) - 0.5) * spacing;
    return 1.0 - smoothstep(0.0, fwidth(v) * 1.3, g);
  }
  void main() {
    vec2 q = (vUv - 0.5) * 16.0;
    float r = length(q);
    float ang = atan(q.y, q.x) / 6.28318 * 24.0;
    float rings = ringLine(r, 1.1);
    float spokes = ringLine(ang, 1.0) * smoothstep(0.6, 1.4, r);
    float ticks = ringLine(ang * 5.0, 1.0) * ringLine(r, 1.1);
    float fade = smoothstep(7.8, 2.0, r);
    float reveal = smoothstep(uReveal * 9.0, uReveal * 9.0 - 1.5, r);
    float g = rings * 0.8 + spokes * 0.45 + ticks * 0.6;
    gl_FragColor = vec4(uColor * g * fade * reveal, 1.0);
  }
`

const POINT_VERT = /* glsl */ `
  attribute float aDelay;
  attribute float aSeed;
  uniform float uDraw;
  uniform float uTime;
  uniform float uSize;
  varying float vLit;
  varying float vTwinkle;
  void main() {
    vLit = smoothstep(aDelay, aDelay + 0.04, uDraw);
    vTwinkle = 0.75 + 0.25 * sin(uTime * (0.7 + aSeed * 1.5) + aSeed * 40.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (0.45 + aSeed) * vLit / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const POINT_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vLit;
  varying float vTwinkle;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    gl_FragColor = vec4(uColor * a * vLit * vTwinkle * uOpacity, 1.0);
  }
`

function pointMaterial(color: THREE.Color, size: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uColor: { value: color },
      uDraw: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: size },
      uOpacity: { value: 0 },
    },
    vertexShader: POINT_VERT,
    fragmentShader: POINT_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  })
}

// ---- Scratch -------------------------------------------------------------------

const _pen = new THREE.Vector3()

type Fadeable = THREE.Mesh & { fillOpacity: number }

export default function Beat_Trajectory({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const mapRef = useRef<THREE.Mesh>(null)
  const fieldRef = useRef<THREE.Points>(null)
  const plannedRef = useRef<LightLineObject>(null)
  const courseRef = useRef<LightLineObject>(null)
  const lockGlowRef = useRef<LightLineObject>(null)
  const dropsRef = useRef<LightLineObject>(null)
  const ticksRef = useRef<THREE.Points>(null)
  const penRef = useRef<THREE.Sprite>(null)
  const travellerRef = useRef<THREE.Sprite>(null)
  const earthRef = useRef<THREE.Group>(null)
  const equatorRef = useRef<LightLineObject>(null)
  const starCoreRef = useRef<THREE.Sprite>(null)
  const starHaloRef = useRef<THREE.Sprite>(null)
  const reticleRef = useRef<THREE.Group>(null)
  const reticleLineRef = useRef<LightLineObject>(null)
  const labelRef = useRef<Fadeable>(null)

  const course = useMemo(() => COURSE.getPoints(SAMPLES), [])
  const reticle = useMemo(() => reticlePoints(), [])
  const equator = useMemo(() => equatorPoints(), [])

  // Waypoint drop lines (course down to the map) and their tick marks.
  const drops = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (const s of WAYPOINTS) {
      const a = COURSE.getPoint(s)
      pts.push(a, new THREE.Vector3(a.x, MAP_Y + 0.01, a.z))
    }
    return pts
  }, [])
  const tickGeo = useDisposable(() => {
    const n = WAYPOINTS.length * 2
    const pos = new Float32Array(n * 3)
    const delay = new Float32Array(n)
    const seed = new Float32Array(n)
    WAYPOINTS.forEach((s, i) => {
      const a = COURSE.getPoint(s)
      pos.set([a.x, a.y, a.z, a.x, MAP_Y + 0.01, a.z], i * 6)
      delay[i * 2] = s
      delay[i * 2 + 1] = s + 0.03
      seed[i * 2] = 0.55
      seed[i * 2 + 1] = 0.35
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  })
  const tickMat = useDisposable(() => pointMaterial(hdr(PALETTE.nearWhite, 1.5), 60))

  // A sparse field of stars on the map's sky.
  const fieldCount = quality === 'mobile' ? 80 : quality === 'low' ? 150 : 300
  const fieldGeo = useDisposable(() => {
    const pos = new Float32Array(fieldCount * 3)
    const delay = new Float32Array(fieldCount)
    const seed = new Float32Array(fieldCount)
    for (let i = 0; i < fieldCount; i++) {
      pos[i * 3] = (seeded(i, 1) - 0.5) * 14
      pos[i * 3 + 1] = -0.6 + seeded(i, 2) * 5.4
      pos[i * 3 + 2] = -5 - seeded(i, 3) * 1.5
      delay[i] = -1
      seed[i] = Math.pow(seeded(i, 4), 2.0)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [fieldCount])
  const fieldMat = useDisposable(() => pointMaterial(hdr(PALETTE.stellarBlue, 0.75), 34))

  const mapMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: { uReveal: { value: 0 }, uColor: { value: hdr(PALETTE.stellarBlue, 0.2) } },
    vertexShader: PLANE_VERT,
    fragmentShader: MAP_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  const earthMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.stellarBlue, 0.14),
    rim: hdr(PALETTE.stellarBlue, GLOW.hero),
    power: 2.4,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock

    const appear = ease(p, 0.0, 0.16)
    setUniform(mapRef.current, 'uReveal', ease(p, 0.0, 0.3))
    setUniform(fieldRef.current, 'uOpacity', appear)
    setUniform(fieldRef.current, 'uTime', t)
    setUniform(fieldRef.current, 'uDraw', 1)
    setLineOpacity(equatorRef.current, appear * 0.7)
    const earth = earthRef.current
    if (earth) earth.rotation.y = t * 0.15

    // The plotted (dashed) course is there from the start; the pen traces it.
    setLineOpacity(plannedRef.current, ease(p, 0.06, 0.2) * 0.5 * (1 - 0.6 * ease(p, 0.56, 0.66)))
    const draw = ease(p, 0.18, 0.56)
    setLineReveal(courseRef.current, draw)
    setLineReveal(dropsRef.current, draw)
    setUniform(ticksRef.current, 'uDraw', draw)
    setUniform(ticksRef.current, 'uOpacity', 1)

    const pen = penRef.current
    if (pen) {
      COURSE.getPoint(draw, _pen)
      pen.position.copy(_pen)
      ;(pen.material as THREE.SpriteMaterial).opacity = draw > 0.001 ? 1 - ease(p, 0.55, 0.62) : 0
    }

    // Lock: a flash along the course, the reticle snaps shut, the star flares.
    const lock = ease(p, 0.56, 0.66)
    const flash = pulse(p, 0.55, 0.68)
    setLineOpacity(lockGlowRef.current, flash * 0.9 + lock * 0.22)
    const reticle = reticleRef.current
    if (reticle) {
      const s = 2.4 - 1.4 * lock
      reticle.scale.set(s, s, s)
      reticle.rotation.z = (1 - lock) * (Math.PI / 4)
    }
    setLineOpacity(reticleLineRef.current, ease(p, 0.5, 0.6) * (0.85 + 0.15 * flash))
    const core = starCoreRef.current
    if (core) {
      ;(core.material as THREE.SpriteMaterial).opacity = appear * (0.55 + 0.45 * lock)
      const s = 0.55 + 0.25 * lock + 0.35 * flash
      core.scale.set(s, s, 1)
    }
    const halo = starHaloRef.current
    if (halo) (halo.material as THREE.SpriteMaterial).opacity = appear * (0.3 + 0.4 * lock)

    // Once locked, small pulses ride the course from Earth to the star.
    const traveller = travellerRef.current
    if (traveller) {
      const s = reducedMotion ? 0.5 : (t * 0.11) % 1
      COURSE.getPoint(s, _pen)
      traveller.position.copy(_pen)
      ;(traveller.material as THREE.SpriteMaterial).opacity = lock * Math.sin(Math.PI * s) * 0.85
    }

    if (labelRef.current) labelRef.current.fillOpacity = ease(p, 0.64, 0.74) * 0.8
  })

  return (
    <group>
      {/* The star map */}
      <mesh ref={mapRef} position={MAP_CENTER} rotation={[-Math.PI / 2, 0, 0]} material={mapMat} frustumCulled={false}>
        <planeGeometry args={[16, 16]} />
      </mesh>
      <points ref={fieldRef} geometry={fieldGeo} material={fieldMat} frustumCulled={false} />

      {/* Earth */}
      <group ref={earthRef} position={EARTH}>
        <mesh material={earthMat}>
          <sphereGeometry args={[EARTH_R, 48, 48]} />
        </mesh>
      </group>
      <LightLine ref={equatorRef} points={equator} color={PALETTE.stellarBlue} intensity={GLOW.base} width={0.008} opacity={0} />
      <GlowSprite position={[EARTH.x, EARTH.y, EARTH.z]} color={PALETTE.stellarBlue} intensity={1.1} size={1.7} opacity={0.5} />

      {/* The distant star */}
      <GlowSprite ref={starHaloRef} position={[STAR.x, STAR.y, STAR.z]} color={PALETTE.stellarBlue} intensity={1.2} size={2.6} opacity={0} />
      <GlowSprite ref={starCoreRef} position={[STAR.x, STAR.y, STAR.z]} color={PALETTE.starGold} intensity={GLOW.hot} size={0.6} opacity={0} />
      <group ref={reticleRef} position={STAR}>
        <LightLine ref={reticleLineRef} points={reticle} segments color={PALETTE.nearWhite} intensity={1.3} width={0.014} opacity={0} />
      </group>

      {/* The course: plotted (dashed), traced (solid), locked (glow) */}
      <LightLine ref={plannedRef} points={course} color={PALETTE.stellarBlue} intensity={GLOW.dim * 2} width={0.012} dashed dashSize={0.09} gapSize={0.09} opacity={0} />
      <LightLine ref={courseRef} points={course} color={PALETTE.stellarBlue} intensity={GLOW.hero} width={0.024} />
      <LightLine ref={lockGlowRef} points={course} color={PALETTE.nearWhite} intensity={1.6} width={0.06} opacity={0} />
      <LightLine ref={dropsRef} points={drops} segments color={PALETTE.stellarBlue} intensity={0.6} width={0.008} />
      <points ref={ticksRef} geometry={tickGeo} material={tickMat} frustumCulled={false} />

      <GlowSprite ref={penRef} color={PALETTE.nearWhite} intensity={GLOW.hot} size={0.45} opacity={0} />
      <GlowSprite ref={travellerRef} color={PALETTE.nearWhite} intensity={GLOW.hero} size={0.32} opacity={0} />

      <Label ref={labelRef} position={[STAR.x - 0.1, STAR.y - 0.72, STAR.z]} color={PALETTE.nearWhite} opacity={0}>Course locked</Label>
    </group>
  )
}
