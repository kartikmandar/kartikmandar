// src/components/CosmicJourney3D/scenes/Beat_Slingshot.tsx
'use client'

// Beat 8 · Orbital Correction (Act II, course-correction).
// A gravity assist, made of light. A probe comes in from the left on a straight
// course, falls toward a rim-lit planet, whips around periapsis (fast, as Kepler
// demands: the motion is timed by the hyperbolic mean anomaly) and leaves on a new
// heading. The old course stays behind as a faint dashed ghost. Beside it, the
// velocity triangle draws on: v in, v out, and the change between them, the
// delta-v, as one glowing gold arrow.

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
import { ease, pulse, ramp, seeded } from '../art/anim'

const PLANET = new THREE.Vector3(0.2, 0.75, -1.5)
const PLANET_RADIUS = 0.68

// Flyby hyperbola in the planet frame: eccentricity, periapsis radius, and the
// hyperbolic-anomaly range drawn (incoming arm is a little longer).
const ECC = 1.35
const R_PERI = 1.05
const SEMI = R_PERI / (ECC - 1)
const F_IN = -1.18
const F_OUT = 1.07
const SAMPLES = 180
// Orientation: rotate within the plane (incoming from the left), then tilt the
// plane so the outgoing arm climbs away into depth.
const IN_PLANE_ROT = -1.087
const PLANE_TILT = -0.6

// Velocity triangle: common origin and arrow length.
const TRI_ORIGIN = new THREE.Vector3(2.75, -0.1, -0.1)
const TRI_LENGTH = 1.1
const VIEW_DIR = new THREE.Vector3(0, 0.2, 1).normalize()

interface Flyby {
  points: THREE.Vector3[]
  /** Normalised time of flight (0..1) at each sample. */
  times: Float32Array
  vIn: THREE.Vector3
  vOut: THREE.Vector3
  periTime: number
}

function flyby(): Flyby {
  const m = new THREE.Matrix4()
    .makeTranslation(PLANET.x, PLANET.y, PLANET.z)
    .multiply(new THREE.Matrix4().makeRotationX(PLANE_TILT))
    .multiply(new THREE.Matrix4().makeRotationZ(IN_PLANE_ROT))
  const b = SEMI * Math.sqrt(ECC * ECC - 1)
  const meanAt = (f: number) => ECC * Math.sinh(f) - f
  const m0 = meanAt(F_IN)
  const m1 = meanAt(F_OUT)
  const points: THREE.Vector3[] = []
  const times = new Float32Array(SAMPLES + 1)
  for (let i = 0; i <= SAMPLES; i++) {
    const f = F_IN + ((F_OUT - F_IN) * i) / SAMPLES
    points.push(new THREE.Vector3(SEMI * (ECC - Math.cosh(f)), b * Math.sinh(f), 0).applyMatrix4(m))
    times[i] = (meanAt(f) - m0) / (m1 - m0)
  }
  const vIn = new THREE.Vector3().subVectors(points[1]!, points[0]!).normalize()
  const vOut = new THREE.Vector3().subVectors(points[SAMPLES]!, points[SAMPLES - 1]!).normalize()
  return { points, times, vIn, vOut, periTime: -m0 / (m1 - m0) }
}

function linePoints(from: THREE.Vector3, to: THREE.Vector3, n = 24): THREE.Vector3[] {
  return Array.from({ length: n + 1 }, (_, i) => new THREE.Vector3().lerpVectors(from, to, i / n))
}

function arrowHead(from: THREE.Vector3, tip: THREE.Vector3, size: number): THREE.Vector3[] {
  const d = new THREE.Vector3().subVectors(tip, from).normalize()
  const w = new THREE.Vector3().crossVectors(d, VIEW_DIR).normalize()
  const back = tip.clone().addScaledVector(d, -size)
  return [
    back.clone().addScaledVector(w, size * 0.55), tip.clone(),
    back.clone().addScaledVector(w, -size * 0.55), tip.clone(),
  ]
}

function ringPoints(radius: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0))
  }
  return pts
}

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
const _pos = new THREE.Vector3()

/** Draws an arrow group (children: shaft, head) on: shaft first, then the head. */
function revealArrow(group: THREE.Group | null, p: number, start: number, span: number, opacity: number): void {
  if (!group) return
  const shaft = group.children[0] as LightLineObject
  const head = group.children[1] as LightLineObject
  setLineReveal(shaft, ease(p, start, start + span))
  setLineOpacity(shaft, ramp(p, start, start + 0.01) * opacity)
  setLineOpacity(head, ease(p, start + span - 0.02, start + span + 0.03) * opacity)
}

export default function Beat_Slingshot({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const trailRef = useRef<LightLineObject>(null)
  const ghostRef = useRef<LightLineObject>(null)
  const probeRef = useRef<THREE.Group>(null)
  const probeHaloRef = useRef<THREE.Sprite>(null)
  const periFlashRef = useRef<THREE.Sprite>(null)
  const planetRef = useRef<THREE.Group>(null)
  const wellsRef = useRef<THREE.Group>(null)
  const atmosphereRef = useRef<THREE.Sprite>(null)
  const vInRef = useRef<THREE.Group>(null)
  const vOutRef = useRef<THREE.Group>(null)
  const dvRef = useRef<THREE.Group>(null)
  const dvTipRef = useRef<THREE.Sprite>(null)
  const dustRef = useRef<THREE.Points>(null)
  const labelRef = useRef<THREE.Mesh & { fillOpacity: number }>(null)

  const path = useMemo(() => flyby(), [])
  const ghost = useMemo(() => linePoints(path.points[0]!, path.points[0]!.clone().addScaledVector(path.vIn, 6.5), 40), [path])
  const periapsis = useMemo(() => {
    let best = 0
    for (let i = 0; i <= SAMPLES; i++) if (path.points[i]!.distanceTo(PLANET) < path.points[best]!.distanceTo(PLANET)) best = i
    return path.points[best]!.clone()
  }, [path])

  // Velocity triangle (planet frame: |v in| = |v out|, so it is isosceles).
  const triangle = useMemo(() => {
    const tipIn = TRI_ORIGIN.clone().addScaledVector(path.vIn, TRI_LENGTH)
    const tipOut = TRI_ORIGIN.clone().addScaledVector(path.vOut, TRI_LENGTH)
    // The delta-v arrow stops a little short of v out's tip so the heads do not merge.
    const dvTip = tipIn.clone().lerp(tipOut, 0.94)
    return {
      vIn: { shaft: linePoints(TRI_ORIGIN, tipIn), head: arrowHead(TRI_ORIGIN, tipIn, 0.12) },
      vOut: { shaft: linePoints(TRI_ORIGIN, tipOut), head: arrowHead(TRI_ORIGIN, tipOut, 0.12) },
      dv: { shaft: linePoints(tipIn, dvTip), head: arrowHead(tipIn, dvTip, 0.2) },
      dvTip,
      labelAt: [TRI_ORIGIN.x + 0.45, TRI_ORIGIN.y - 0.38, TRI_ORIGIN.z] as [number, number, number],
    }
  }, [path])

  const wells = useMemo(() => [1.05, 1.45, 1.95].map(ringPoints), [])
  const equator = useMemo(() => ringPoints(1.12), [])

  const planetMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.signal, 0.07),
    rim: hdr(PALETTE.signal, 1.7),
    power: 2.2,
  }))

  const dustCount = quality === 'mobile' ? 100 : quality === 'low' ? 200 : 400
  const dustGeo = useDisposable(() => {
    const pos = new Float32Array(dustCount * 3)
    const seed = new Float32Array(dustCount)
    for (let i = 0; i < dustCount; i++) {
      pos[i * 3] = (seeded(i, 61) - 0.5) * 11
      pos[i * 3 + 1] = -1.2 + seeded(i, 62) * 5.2
      pos[i * 3 + 2] = -6.5 + seeded(i, 63) * 6.5
      seed[i] = seeded(i, 64)
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

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock
    const appear = ease(p, 0.0, 0.18)

    setUniform(dustRef.current, 'uTime', t)
    setUniform(dustRef.current, 'uOpacity', appear)

    // Planet and its gravity wells.
    const planet = planetRef.current
    if (planet) planet.rotation.y = 0.3 + t * 0.05
    const wellsGroup = wellsRef.current
    if (wellsGroup) {
      for (let i = 0; i < wellsGroup.children.length; i++) {
        const ring = wellsGroup.children[i] as LightLineObject
        setLineReveal(ring, ease(p, 0.02 + i * 0.04, 0.2 + i * 0.04))
        setLineOpacity(ring, 0.55 * appear * (1 - 0.4 * ease(p, 0.7, 0.95)))
      }
    }
    const atmosphere = atmosphereRef.current
    if (atmosphere) (atmosphere.material as THREE.SpriteMaterial).opacity = appear * 0.6

    // The flyby, timed by mean anomaly so the probe whips through periapsis.
    const tau = ramp(p, 0.1, 0.8)
    let i = 0
    while (i < SAMPLES - 1 && path.times[i + 1]! < tau) i++
    const t0 = path.times[i]!
    const t1 = path.times[i + 1]!
    const frac = t1 > t0 ? Math.max(0, Math.min(1, (tau - t0) / (t1 - t0))) : 0
    _pos.lerpVectors(path.points[i]!, path.points[i + 1]!, frac)
    // After the drawn arc it coasts on along its new heading.
    const coast = ramp(p, 0.8, 1.0)
    _pos.addScaledVector(path.vOut, coast * 2.2)

    setLineReveal(trailRef.current, (i + frac) / SAMPLES)
    setLineOpacity(trailRef.current, ease(p, 0.08, 0.14) * (1 - 0.4 * ease(p, 0.75, 1.0)))

    const probe = probeRef.current
    if (probe) {
      probe.visible = p > 0.08
      probe.position.copy(_pos)
    }
    const halo = probeHaloRef.current
    if (halo) {
      // Brightest at periapsis, when it is moving fastest.
      const boost = pulse(tau, path.periTime - 0.14, path.periTime + 0.14)
      const s = 0.55 + 0.45 * boost
      halo.scale.set(s, s, 1)
      ;(halo.material as THREE.SpriteMaterial).opacity = ease(p, 0.08, 0.14) * (1 - 0.6 * coast)
    }
    const flash = periFlashRef.current
    if (flash) {
      const f = pulse(tau, path.periTime - 0.06, path.periTime + 0.12)
      ;(flash.material as THREE.SpriteMaterial).opacity = f * 0.7
      const s = 0.5 + 0.9 * f
      flash.scale.set(s, s, 1)
    }

    // The course it would have kept: appears once the bend is visible.
    setLineReveal(ghostRef.current, ease(p, 0.45, 0.66))
    setLineOpacity(ghostRef.current, 0.5 * ease(p, 0.45, 0.5))

    // Velocity triangle: v in, v out, then the delta-v arrow.
    revealArrow(vInRef.current, p, 0.3, 0.1, 0.8)
    revealArrow(vOutRef.current, p, 0.56, 0.1, 0.8)
    revealArrow(dvRef.current, p, 0.64, 0.16, 1)
    const dvTip = dvTipRef.current
    if (dvTip) {
      const on = ease(p, 0.76, 0.84)
      const breathe = 0.85 + 0.15 * Math.sin(t * 1.6)
      ;(dvTip.material as THREE.SpriteMaterial).opacity = on * breathe
    }
    if (labelRef.current) labelRef.current.fillOpacity = ease(p, 0.78, 0.88) * 0.85
  })

  return (
    <group>
      <points ref={dustRef} geometry={dustGeo} material={dustMat} frustumCulled={false} />

      {/* The planet: rim-lit body, equatorial hairline, gravity wells in the flyby plane */}
      <group ref={planetRef} position={PLANET}>
        <mesh material={planetMat}>
          <sphereGeometry args={[PLANET_RADIUS, 56, 56]} />
        </mesh>
        <group rotation={[Math.PI / 2 - 0.35, 0, 0.2]}>
          <LightLine points={equator} color={PALETTE.signal} intensity={GLOW.base} width={0.01} opacity={0.6} />
        </group>
      </group>
      <GlowSprite ref={atmosphereRef} position={[PLANET.x, PLANET.y, PLANET.z]} color={PALETTE.signal} intensity={GLOW.base} size={2.4} opacity={0} />
      <group ref={wellsRef} position={PLANET} rotation={[PLANE_TILT, 0, 0]}>
        {wells.map((pts, i) => (
          <LightLine key={i} points={pts} color={PALETTE.signal} intensity={0.6} width={0.009} opacity={0} dashed dashSize={0.05} gapSize={0.07} />
        ))}
      </group>

      {/* The old course, and the new one */}
      <LightLine ref={ghostRef} points={ghost} color={PALETTE.stellarBlue} intensity={GLOW.base} width={0.012} opacity={0} dashed dashSize={0.08} gapSize={0.09} />
      <LightLine ref={trailRef} points={path.points} color={PALETTE.signal} intensity={GLOW.hero} width={0.026} opacity={0} />

      <GlowSprite ref={periFlashRef} position={[periapsis.x, periapsis.y, periapsis.z]} color={PALETTE.signal} intensity={GLOW.hero} size={1} opacity={0} />

      <group ref={probeRef} visible={false}>
        <GlowSprite ref={probeHaloRef} color={PALETTE.nearWhite} intensity={GLOW.hot} size={1} opacity={0} />
        <GlowSprite color={PALETTE.signal} intensity={GLOW.base} size={1.1} opacity={0.5} />
      </group>

      {/* Velocity triangle: v in and v out quiet, delta-v glowing */}
      <group ref={vInRef}>
        <LightLine points={triangle.vIn.shaft} color={PALETTE.stellarBlue} intensity={GLOW.base} width={0.014} opacity={0} />
        <LightLine points={triangle.vIn.head} segments color={PALETTE.stellarBlue} intensity={GLOW.base} width={0.014} opacity={0} />
      </group>
      <group ref={vOutRef}>
        <LightLine points={triangle.vOut.shaft} color={PALETTE.signal} intensity={GLOW.base} width={0.014} opacity={0} />
        <LightLine points={triangle.vOut.head} segments color={PALETTE.signal} intensity={GLOW.base} width={0.014} opacity={0} />
      </group>
      <group ref={dvRef}>
        <LightLine points={triangle.dv.shaft} color={PALETTE.starGold} intensity={GLOW.hero} width={0.034} opacity={0} />
        <LightLine points={triangle.dv.head} segments color={PALETTE.starGold} intensity={GLOW.hero} width={0.034} opacity={0} />
      </group>
      <GlowSprite ref={dvTipRef} position={[triangle.dvTip.x, triangle.dvTip.y, triangle.dvTip.z]} color={PALETTE.starGold} intensity={GLOW.hero} size={0.7} opacity={0} />

      <Label preserveCase ref={labelRef} position={triangle.labelAt} color={PALETTE.starGold} opacity={0}>
        delta v
      </Label>
    </group>
  )
}
