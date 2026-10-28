// src/components/CosmicJourney3D/scenes/Beat_Instruments.tsx
'use client'

// Beat 22 · Learning the Instruments (Act IV, widening).
// The Green Bank Telescope, made of light: an offset-Gregorian reflector (an
// off-axis section of a paraboloid, its feed arm rising from the low edge to a
// subreflector clear of the beam) on a wheel-and-track alidade. It tilts from
// the horizon up to a source in the sky. As it locks on, the Act I refractor
// briefly reappears as a blue ghost, aimed at the same star, then fades.

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { createRimMaterial, getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, pulse, ramp, seeded } from '../art/anim'

// ---------------------------------------------------------------------------
// Static layout
// ---------------------------------------------------------------------------

const GROUND_Y = -1.15
const GBT_BASE = new THREE.Vector3(0.9, GROUND_Y, -1.7)
const AXLE_H = 1.75
const AXLE_WORLD = GBT_BASE.clone().add(new THREE.Vector3(0, AXLE_H, 0))
const TOWER_X = 1.15

// Offset paraboloid: aperture radius R centred YO off the parent axis, focal length F.
const DISH_R = 0.95
const DISH_YO = 1.05
const DISH_F = 1.2
/** Paraboloid vertex in the elevation frame (axle at the origin, boresight +Z). */
const VERTEX = new THREE.Vector3(0, -DISH_YO, 0.1)
const APERTURE_Z = VERTEX.z + (DISH_YO * DISH_YO) / (4 * DISH_F)
const SUBREFLECTOR = new THREE.Vector3(0, VERTEX.y - 0.12, VERTEX.z + DISH_F + 0.32)

/** A point on the reflector from aperture-plane polar coordinates (rr from the aperture centre). */
function surface(out: THREE.Vector3, rr: number, theta: number): THREE.Vector3 {
  const x = Math.cos(theta) * rr
  const y = DISH_YO + Math.sin(theta) * rr
  return out.set(VERTEX.x + x, VERTEX.y + y, VERTEX.z + (x * x + y * y) / (4 * DISH_F))
}

// Where the dish ends up pointing: a source up and to the left.
const NOMINAL_TARGET = new THREE.Vector3(-2.55, 3.25, 0.0)
const TO_TARGET = NOMINAL_TARGET.clone().sub(AXLE_WORLD)
const BEAM_LENGTH = TO_TARGET.length() - APERTURE_Z
const AZIMUTH = Math.atan2(TO_TARGET.x, TO_TARGET.z)
const EL_END = Math.asin(TO_TARGET.y / TO_TARGET.length())
const EL_START = 0.05
const TARGET = AXLE_WORLD.clone().add(
  new THREE.Vector3(0, 0, APERTURE_Z + BEAM_LENGTH).applyEuler(new THREE.Euler(-EL_END, AZIMUTH, 0, 'YXZ')),
)

function ring(pts: THREE.Vector3[], center: THREE.Vector3, radius: number, n: number, plane: 'xz' | 'xy'): void {
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2
    const a1 = ((i + 1) / n) * Math.PI * 2
    if (plane === 'xz') {
      pts.push(new THREE.Vector3(center.x + Math.cos(a0) * radius, center.y, center.z + Math.sin(a0) * radius))
      pts.push(new THREE.Vector3(center.x + Math.cos(a1) * radius, center.y, center.z + Math.sin(a1) * radius))
    } else {
      pts.push(new THREE.Vector3(center.x + Math.cos(a0) * radius, center.y + Math.sin(a0) * radius, center.z))
      pts.push(new THREE.Vector3(center.x + Math.cos(a1) * radius, center.y + Math.sin(a1) * radius, center.z))
    }
  }
}

/** Reflector wireframe: aperture rings and spokes on the off-axis paraboloid. */
const DISH_LINES: THREE.Vector3[] = (() => {
  const pts: THREE.Vector3[] = []
  for (let k = 1; k <= 4; k++) {
    const rr = (k / 4) * DISH_R
    const n = 24 + k * 12
    for (let i = 0; i < n; i++) {
      pts.push(surface(new THREE.Vector3(), rr, (i / n) * Math.PI * 2))
      pts.push(surface(new THREE.Vector3(), rr, ((i + 1) / n) * Math.PI * 2))
    }
  }
  const spokes = 16
  for (let s = 0; s < spokes; s++) {
    const theta = (s / spokes) * Math.PI * 2
    for (let i = 0; i < 6; i++) {
      pts.push(surface(new THREE.Vector3(), (i / 6) * DISH_R, theta))
      pts.push(surface(new THREE.Vector3(), ((i + 1) / 6) * DISH_R, theta))
    }
  }
  return pts
})()

/** Feed arm (a two-rail truss from the low edge) and the subreflector ring. */
const ARM_LINES: THREE.Vector3[] = (() => {
  const pts: THREE.Vector3[] = []
  const foot = surface(new THREE.Vector3(), DISH_R, -Math.PI / 2)
  const rails = [-0.09, 0.09]
  const steps = 6
  for (const dx of rails) {
    for (let i = 0; i < steps; i++) {
      const a = foot.clone().lerp(SUBREFLECTOR, i / steps)
      const b = foot.clone().lerp(SUBREFLECTOR, (i + 1) / steps)
      const w0 = dx * (1 - 0.5 * (i / steps))
      const w1 = dx * (1 - 0.5 * ((i + 1) / steps))
      pts.push(a.setX(w0), b.setX(w1))
    }
  }
  for (let i = 0; i < steps; i++) {
    const a = foot.clone().lerp(SUBREFLECTOR, i / steps)
    const b = foot.clone().lerp(SUBREFLECTOR, (i + 1) / steps)
    const w0 = 0.09 * (1 - 0.5 * (i / steps))
    const w1 = 0.09 * (1 - 0.5 * ((i + 1) / steps))
    pts.push(a.clone().setX(-w0), b.clone().setX(w1))
  }
  // Subreflector: a small ring facing back down at the main reflector.
  ring(pts, SUBREFLECTOR, 0.2, 28, 'xy')
  // Backup structure: rim to the elevation axle ends.
  const rimTop = surface(new THREE.Vector3(), DISH_R, Math.PI / 2)
  const rimLeft = surface(new THREE.Vector3(), DISH_R, Math.PI)
  const rimRight = surface(new THREE.Vector3(), DISH_R, 0)
  for (const side of [-1, 1]) {
    const end = new THREE.Vector3(side * TOWER_X, 0, 0)
    pts.push(end.clone(), side < 0 ? rimLeft.clone() : rimRight.clone())
    pts.push(end.clone(), rimTop.clone())
    pts.push(end.clone(), foot.clone())
  }
  pts.push(new THREE.Vector3(-TOWER_X, 0, 0), new THREE.Vector3(TOWER_X, 0, 0))
  return pts
})()

/** Wheel-and-track alidade (yaw frame, ground at y = 0). */
const ALIDADE_LINES: THREE.Vector3[] = (() => {
  const pts: THREE.Vector3[] = []
  const seg = (a: [number, number, number], b: [number, number, number]) => pts.push(new THREE.Vector3(...a), new THREE.Vector3(...b))
  const d = 0.75
  for (const x of [-TOWER_X, TOWER_X]) {
    seg([x, 0.04, -d], [x, AXLE_H, 0])
    seg([x, 0.04, d], [x, AXLE_H, 0])
    seg([x, 0.04, -d], [x, 0.04, d])
    seg([x, 0.62, -d * 0.65], [x, 0.62, d * 0.65])
    seg([x, 0.04, -d], [x, 0.62, d * 0.65])
    seg([x, 0.04, d], [x, 0.62, -d * 0.65])
  }
  for (const z of [-d, d]) seg([-TOWER_X, 0.04, z], [TOWER_X, 0.04, z])
  seg([-TOWER_X, 0.62, 0], [TOWER_X, 0.62, 0])
  return pts
})()

/** Ground: the circular track and a faint horizon. */
const GROUND_LINES: THREE.Vector3[] = (() => {
  const pts: THREE.Vector3[] = []
  ring(pts, new THREE.Vector3(GBT_BASE.x, GROUND_Y, GBT_BASE.z), 1.4, 64, 'xz')
  ring(pts, new THREE.Vector3(GBT_BASE.x, GROUND_Y, GBT_BASE.z), 1.3, 64, 'xz')
  pts.push(new THREE.Vector3(-7, GROUND_Y, -4.5), new THREE.Vector3(7, GROUND_Y, -4.5))
  return pts
})()

/** Elevation-frame boresight from the aperture centre to the source. */
const BEAM_POINTS = [new THREE.Vector3(0, 0, APERTURE_Z), new THREE.Vector3(0, 0, APERTURE_Z + BEAM_LENGTH)]

// The Act I refractor, as a ghost: tube along +Z, aimed at the same source.
const REFRACTOR_PIVOT = new THREE.Vector3(3.2, -0.2, -0.5)
const REFRACTOR_QUAT = new THREE.Quaternion().setFromUnitVectors(
  new THREE.Vector3(0, 0, 1),
  TARGET.clone().sub(REFRACTOR_PIVOT).normalize(),
)
const TUBE_LINES: THREE.Vector3[] = (() => {
  const pts: THREE.Vector3[] = []
  const back = -0.6
  const front = 0.95
  ring(pts, new THREE.Vector3(0, 0, back), 0.07, 20, 'xy')
  ring(pts, new THREE.Vector3(0, 0, 0.1), 0.085, 20, 'xy')
  ring(pts, new THREE.Vector3(0, 0, front), 0.1, 24, 'xy')
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * 0.07, Math.sin(a) * 0.07, back), new THREE.Vector3(Math.cos(a) * 0.1, Math.sin(a) * 0.1, front))
  }
  // eyepiece
  pts.push(new THREE.Vector3(0, 0, back), new THREE.Vector3(0, -0.04, back - 0.22))
  return pts
})()
const TRIPOD_LINES: THREE.Vector3[] = (() => {
  const pts: THREE.Vector3[] = []
  const hub = REFRACTOR_PIVOT.clone().add(new THREE.Vector3(0, -0.12, 0))
  pts.push(REFRACTOR_PIVOT.clone(), hub.clone())
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5
    pts.push(hub.clone(), new THREE.Vector3(hub.x + Math.cos(a) * 0.55, GROUND_Y + 0.05, hub.z + Math.sin(a) * 0.55))
  }
  return pts
})()
const REFRACTOR_SIGHT = [
  REFRACTOR_PIVOT.clone().addScaledVector(TARGET.clone().sub(REFRACTOR_PIVOT).normalize(), 1.0),
  TARGET.clone(),
]

// ---------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------

const STAR_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  varying float vTwinkle;
  void main() {
    vTwinkle = 0.55 + 0.45 * sin(uTime * (0.6 + 1.4 * aSeed) + aSeed * 40.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (0.4 + 0.9 * fract(aSeed * 7.31)) / -mv.z;
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

function starGeometry(count: number): THREE.BufferGeometry {
  const pos = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (seeded(i, 1) - 0.5) * 14
    pos[i * 3 + 1] = 0.2 + seeded(i, 2) * 5.6
    pos[i * 3 + 2] = -4.5 - seeded(i, 3) * 3
    seed[i] = seeded(i, 4)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  return g
}

/** Faint rim-lit reflector body (off-axis paraboloid patch). */
function reflectorGeometry(): THREE.BufferGeometry {
  const radial = 12
  const around = 48
  const pos: number[] = []
  const idx: number[] = []
  const v = new THREE.Vector3()
  for (let r = 0; r <= radial; r++) {
    for (let a = 0; a <= around; a++) {
      surface(v, (r / radial) * DISH_R, (a / around) * Math.PI * 2)
      pos.push(v.x, v.y, v.z)
    }
  }
  for (let r = 0; r < radial; r++) {
    for (let a = 0; a < around; a++) {
      const i0 = r * (around + 1) + a
      const i1 = i0 + around + 1
      idx.push(i0, i1, i0 + 1, i0 + 1, i1, i1 + 1)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

type FadingText = THREE.Mesh & { fillOpacity: number }

// ---------------------------------------------------------------------------

export default function Beat_Instruments({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const groundRef = useRef<LightLineObject>(null)
  const alidadeRef = useRef<LightLineObject>(null)
  const elevationRef = useRef<THREE.Group>(null)
  const reflectorRef = useRef<THREE.Mesh>(null)
  const dishRef = useRef<LightLineObject>(null)
  const armRef = useRef<LightLineObject>(null)
  const subGlowRef = useRef<THREE.Sprite>(null)
  const beamRef = useRef<LightLineObject>(null)
  const targetRef = useRef<THREE.Sprite>(null)
  const starsRef = useRef<THREE.Points>(null)
  const ghostRef = useRef<THREE.Group>(null)
  const tubeRef = useRef<LightLineObject>(null)
  const tripodRef = useRef<LightLineObject>(null)
  const sightRef = useRef<LightLineObject>(null)
  const lensRef = useRef<THREE.Sprite>(null)
  const labelRef = useRef<FadingText>(null)

  const reflectorGeo = useDisposable(reflectorGeometry)
  const reflectorMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.starGold, 0.05),
    rim: hdr(PALETTE.starGold, 1.2),
    power: 2.2,
    additive: true,
  }))

  const starCount = quality === 'mobile' ? 90 : quality === 'low' ? 180 : 360
  const starGeo = useDisposable(() => starGeometry(starCount), [starCount])
  const starMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 22 },
      uMap: { value: getGlowTexture() },
      uColor: { value: hdr(PALETTE.nearWhite, 0.8) },
      uOpacity: { value: 0 },
    },
    vertexShader: STAR_VERT,
    fragmentShader: STAR_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock

    setUniform(starsRef.current, 'uTime', t)
    setUniform(starsRef.current, 'uOpacity', ease(p, 0.0, 0.2))

    // Build on arrival: ground, alidade, reflector draw in.
    setLineOpacity(groundRef.current, ease(p, 0.0, 0.14) * 0.7)
    setLineReveal(alidadeRef.current, ease(p, 0.02, 0.22))
    setLineReveal(dishRef.current, ease(p, 0.05, 0.3))
    setLineReveal(armRef.current, ease(p, 0.12, 0.32))
    setUniform(reflectorRef.current, 'uOpacity', ease(p, 0.1, 0.3))

    // The tilt: horizon to source through the hold, with a slow breathing track.
    const tilt = ease(p, 0.18, 0.6)
    const elevation = elevationRef.current
    if (elevation) elevation.rotation.x = -(EL_START + (EL_END - EL_START) * tilt) - 0.006 * Math.sin(t * 0.4) * tilt

    const lock = ease(p, 0.58, 0.7)
    setLineReveal(beamRef.current, ease(p, 0.58, 0.72))
    setLineOpacity(beamRef.current, ramp(p, 0.58, 0.6) * 0.85)
    const sub = subGlowRef.current
    if (sub) (sub.material as THREE.SpriteMaterial).opacity = 0.2 * ease(p, 0.15, 0.3) + 0.8 * lock * (0.85 + 0.15 * Math.sin(t * 1.7))
    const target = targetRef.current
    if (target) {
      ;(target.material as THREE.SpriteMaterial).opacity = 0.35 * ease(p, 0.1, 0.25) + 0.65 * lock
      const s = 0.55 + 0.35 * lock
      target.scale.set(s, s, 1)
    }

    // The ghost of the Act I refractor: in as the dish settles, gone before departure.
    const ghost = pulse(p, 0.4, 0.84) * (0.88 + 0.12 * Math.sin(t * 2.3))
    const g = ghostRef.current
    if (g) {
      g.visible = ghost > 0.002
      g.position.y = 0.12 * ramp(p, 0.4, 0.84)
    }
    setLineOpacity(tubeRef.current, ghost * 0.6)
    setLineOpacity(tripodRef.current, ghost * 0.45)
    setLineOpacity(sightRef.current, ghost * 0.35 * lock)
    const lens = lensRef.current
    if (lens) (lens.material as THREE.SpriteMaterial).opacity = ghost * 0.7

    if (labelRef.current) labelRef.current.fillOpacity = ease(p, 0.3, 0.45) * 0.8
  })

  return (
    <group>
      <points ref={starsRef} geometry={starGeo} material={starMat} frustumCulled={false} />
      <GlowSprite ref={targetRef} position={[TARGET.x, TARGET.y, TARGET.z]} color={PALETTE.starGold} intensity={GLOW.hero} size={0.55} opacity={0} />

      <LightLine ref={groundRef} points={GROUND_LINES} segments color={PALETTE.nearWhite} intensity={GLOW.dim} width={0.01} opacity={0} />

      {/* The Green Bank Telescope: alidade (yaw), then the elevation frame */}
      <group position={GBT_BASE} rotation={[0, AZIMUTH, 0]}>
        <LightLine ref={alidadeRef} points={ALIDADE_LINES} segments color={PALETTE.nearWhite} intensity={GLOW.base} width={0.014} />
        <group ref={elevationRef} position={[0, AXLE_H, 0]} rotation={[-EL_START, 0, 0]}>
          <mesh ref={reflectorRef} geometry={reflectorGeo} material={reflectorMat} />
          <LightLine ref={dishRef} points={DISH_LINES} segments color={PALETTE.starGold} intensity={1.15} width={0.011} />
          <LightLine ref={armRef} points={ARM_LINES} segments color={PALETTE.nearWhite} intensity={GLOW.base} width={0.012} />
          <GlowSprite ref={subGlowRef} position={[SUBREFLECTOR.x, SUBREFLECTOR.y, SUBREFLECTOR.z]} color={PALETTE.starGold} intensity={GLOW.hero} size={0.5} opacity={0} />
          <LightLine ref={beamRef} points={BEAM_POINTS} color={PALETTE.starGold} intensity={1.4} width={0.014} dashed dashSize={0.12} gapSize={0.09} opacity={0} />
        </group>
      </group>

      {/* The Act I refractor, as a ghost */}
      <group ref={ghostRef} visible={false}>
        <group position={REFRACTOR_PIVOT} quaternion={REFRACTOR_QUAT}>
          <LightLine ref={tubeRef} points={TUBE_LINES} segments color={PALETTE.stellarBlue} intensity={GLOW.base} width={0.012} opacity={0} />
          <GlowSprite ref={lensRef} position={[0, 0, 0.95]} color={PALETTE.stellarBlue} intensity={1.6} size={0.45} opacity={0} />
        </group>
        <LightLine ref={tripodRef} points={TRIPOD_LINES} segments color={PALETTE.stellarBlue} intensity={GLOW.base} width={0.01} opacity={0} />
        <LightLine ref={sightRef} points={REFRACTOR_SIGHT} color={PALETTE.stellarBlue} intensity={GLOW.base} width={0.008} dashed dashSize={0.08} gapSize={0.12} opacity={0} />
      </group>

      <Label ref={labelRef} position={[GBT_BASE.x + 1.55, GROUND_Y + 0.35, GBT_BASE.z + 0.2]} anchorX="left" color={PALETTE.starGold} opacity={0}>
        GBT · Green Bank
      </Label>
    </group>
  )
}
