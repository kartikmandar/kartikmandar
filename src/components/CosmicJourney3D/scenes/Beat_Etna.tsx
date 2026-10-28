// src/components/CosmicJourney3D/scenes/Beat_Etna.tsx
'use client'

// Beat 29 · Landing Under Etna (Act V, ember).
// A globe made of light turns until India and the Mediterranean face us, and an
// ember arc flies the great circle from Delhi to Catania. Then the Catania night
// takes over: Etna's broad silhouette is drawn with a thin lava-ember rim under
// a field of stars, a faint plume rises from the summit, and at its foot a small
// campfire circle lights up, echoing the journal club (beat 15).

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { createRimMaterial, getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, seeded } from '../art/anim'

const DEG = Math.PI / 180

// Globe (upper left of the stage).
const GLOBE = new THREE.Vector3(-2.75, 2.25, -2.7)
const GLOBE_R = 1.12
const GLOBE_TILT = 0.5
// Approximate city coordinates (lat, lon in degrees).
const DELHI: [number, number] = [28.6, 77.2]
const CATANIA: [number, number] = [37.5, 15.1]
// Longitude that faces the camera during the hold (between the two cities).
const FACE_LON = 46 * DEG
const ARC_SAMPLES = 72

// Etna (right of the stage, far back) and the campfire at its foot.
const ETNA_Z = -4.4
const ETNA_PEAK_X = 1.5
const ETNA_PEAK_Y = 1.75
const ETNA_BASE_Y = -1.9
const SUMMIT = new THREE.Vector3(ETNA_PEAK_X, ETNA_PEAK_Y + 0.02, ETNA_Z)
const FIRE = new THREE.Vector3(-0.9, -0.62, -0.9)
const FIRE_R = 0.42
const SEATS = 7

/** Unit-sphere point for (lat, lon): lon 0 faces +z, north is +y. */
function latLon(out: THREE.Vector3, lat: number, lon: number): THREE.Vector3 {
  const la = lat * DEG
  const lo = lon * DEG
  return out.set(Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo))
}

/** Graticule (meridians every 30 deg, parallels every 30 deg) as line segments. */
function graticulePoints(radius: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const seg = 64
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  for (let lon = 0; lon < 180; lon += 30) {
    for (let i = 0; i < seg; i++) {
      const la0 = -90 + (i / seg) * 360
      const la1 = -90 + ((i + 1) / seg) * 360
      // full great circle through the poles: walk latitude past 90 onto the far meridian
      const p0 = la0 <= 90 ? latLon(a, la0, lon) : latLon(a, 180 - la0, lon + 180)
      const p1 = la1 <= 90 ? latLon(b, la1, lon) : latLon(b, 180 - la1, lon + 180)
      pts.push(p0.clone().multiplyScalar(radius), p1.clone().multiplyScalar(radius))
    }
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let i = 0; i < seg; i++) {
      pts.push(
        latLon(a, lat, (i / seg) * 360).clone().multiplyScalar(radius),
        latLon(b, lat, ((i + 1) / seg) * 360).clone().multiplyScalar(radius),
      )
    }
  }
  return pts
}

/** Great-circle flight path lifted off the surface, as a flat xyz array and point list. */
function arcPath(radius: number): { points: THREE.Vector3[]; flat: Float32Array } {
  const a = latLon(new THREE.Vector3(), DELHI[0], DELHI[1])
  const b = latLon(new THREE.Vector3(), CATANIA[0], CATANIA[1])
  const omega = a.angleTo(b)
  const points: THREE.Vector3[] = []
  const flat = new Float32Array((ARC_SAMPLES + 1) * 3)
  for (let i = 0; i <= ARC_SAMPLES; i++) {
    const t = i / ARC_SAMPLES
    const wa = Math.sin((1 - t) * omega) / Math.sin(omega)
    const wb = Math.sin(t * omega) / Math.sin(omega)
    const p = new THREE.Vector3().addScaledVector(a, wa).addScaledVector(b, wb)
    p.multiplyScalar(radius * (1.005 + 0.2 * Math.sin(Math.PI * t)))
    points.push(p)
    flat[i * 3] = p.x
    flat[i * 3 + 1] = p.y
    flat[i * 3 + 2] = p.z
  }
  return { points, flat }
}

/** Etna's profile: a broad shield-like stratovolcano with a small summit crater notch. */
function etnaHeight(x: number): number {
  const d = x - ETNA_PEAK_X
  const broad = Math.exp(-((d / 3.1) ** 2))
  const cone = Math.exp(-((d / 1.25) ** 2))
  const h = ETNA_BASE_Y + (ETNA_PEAK_Y - ETNA_BASE_Y) * (0.62 * broad + 0.38 * cone)
  // crater notch and a secondary shoulder (the summit's lumpy skyline)
  const notch = -0.07 * Math.exp(-(((d - 0.05) / 0.09) ** 2))
  const shoulder = 0.1 * Math.exp(-(((d + 0.75) / 0.35) ** 2))
  return h + notch + shoulder
}

function etnaProfile(x0: number, x1: number, n: number): THREE.Vector3[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / n
    return new THREE.Vector3(x, etnaHeight(x), ETNA_Z)
  })
}

/** Filled silhouette (occluder) under the profile. */
function etnaFillGeometry(): THREE.BufferGeometry {
  const n = 120
  const x0 = -8
  const x1 = 9
  const pos = new Float32Array((n + 1) * 2 * 3)
  const idx: number[] = []
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n
    const o = i * 6
    pos[o] = x
    pos[o + 1] = etnaHeight(x) - 0.006
    pos[o + 2] = ETNA_Z - 0.02
    pos[o + 3] = x
    pos[o + 4] = -4
    pos[o + 5] = ETNA_Z - 0.02
    if (i < n) {
      const a = i * 2
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setIndex(idx)
  return g
}

const STAR_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  varying float vTw;
  varying float vSeed;
  void main() {
    vSeed = aSeed;
    vTw = 0.7 + 0.3 * sin(uTime * (0.6 + aSeed * 1.4) + aSeed * 40.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float big = step(0.93, aSeed);
    gl_PointSize = uSize * (0.45 + 0.5 * fract(aSeed * 31.7) + big * 0.9) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const STAR_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uCool;
  uniform vec3 uWarm;
  uniform float uOpacity;
  varying float vTw;
  varying float vSeed;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    vec3 col = mix(uCool, uWarm, step(0.7, fract(vSeed * 7.3)));
    gl_FragColor = vec4(col * a * vTw * uOpacity, 1.0);
  }
`

// Sparks and a faint plume: particles rise from a source, drift and fade.
const RISE_VERT = /* glsl */ `
  attribute float aSeed;
  attribute vec2 aOff;
  uniform float uTime;
  uniform float uHeight;
  uniform float uSpread;
  uniform float uSpeed;
  uniform float uDrift;
  uniform float uSize;
  varying float vT;
  void main() {
    float t = fract(aSeed + uTime * uSpeed);
    vT = t;
    vec3 p = position;
    p.y += t * uHeight;
    p.x += aOff.x * uSpread * (0.3 + t) + uDrift * t * t;
    p.z += aOff.y * uSpread * (0.3 + t);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.6 + 0.8 * fract(aSeed * 11.3)) * (1.0 - 0.5 * t) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const RISE_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uHot;
  uniform vec3 uCool;
  uniform float uOpacity;
  varying float vT;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    float fade = smoothstep(0.0, 0.08, vT) * (1.0 - smoothstep(0.45, 1.0, vT));
    gl_FragColor = vec4(mix(uHot, uCool, vT) * a * fade * uOpacity, 1.0);
  }
`

function starGeometry(count: number): THREE.BufferGeometry {
  const pos = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (seeded(i, 1) - 0.5) * 18
    pos[i * 3 + 1] = -0.6 + seeded(i, 2) * 6.6
    pos[i * 3 + 2] = -5.0 - seeded(i, 3) * 1.6
    seed[i] = seeded(i, 4)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  return g
}

function riseGeometry(count: number, origin: THREE.Vector3, spawn: number): THREE.BufferGeometry {
  const pos = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  const off = new Float32Array(count * 2)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = origin.x + (seeded(i, 5) - 0.5) * spawn
    pos[i * 3 + 1] = origin.y
    pos[i * 3 + 2] = origin.z + (seeded(i, 6) - 0.5) * spawn
    seed[i] = seeded(i, 7)
    off[i * 2] = seeded(i, 8) - 0.5
    off[i * 2 + 1] = seeded(i, 9) - 0.5
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  g.setAttribute('aOff', new THREE.BufferAttribute(off, 2))
  return g
}

function riseMaterial(hot: THREE.Color, cool: THREE.Color, height: number, spread: number, speed: number, drift: number, size: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uTime: { value: 0 },
      uHeight: { value: height },
      uSpread: { value: spread },
      uSpeed: { value: speed },
      uDrift: { value: drift },
      uSize: { value: size },
      uHot: { value: hot },
      uCool: { value: cool },
      uOpacity: { value: 0 },
    },
    vertexShader: RISE_VERT,
    fragmentShader: RISE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  })
}

// Module-level scratch: no allocation inside useFrame.
const _head = new THREE.Vector3()

export default function Beat_Etna({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const spinRef = useRef<THREE.Group>(null)
  const globeRef = useRef<THREE.Mesh>(null)
  const gratRef = useRef<LightLineObject>(null)
  const arcRef = useRef<LightLineObject>(null)
  const headRef = useRef<THREE.Sprite>(null)
  const delhiRef = useRef<THREE.Sprite>(null)
  const cataniaRef = useRef<THREE.Sprite>(null)
  const starsRef = useRef<THREE.Points>(null)
  const flankRef = useRef<LightLineObject>(null)
  const crestRef = useRef<LightLineObject>(null)
  const craterRef = useRef<THREE.Sprite>(null)
  const plumeRef = useRef<THREE.Points>(null)
  const fireRef = useRef<THREE.Sprite>(null)
  const fireRingRef = useRef<LightLineObject>(null)
  const seatsRef = useRef<THREE.InstancedMesh>(null)
  const sparksRef = useRef<THREE.Points>(null)
  const routeLabelRef = useRef<THREE.Mesh & { fillOpacity: number }>(null)
  const etnaLabelRef = useRef<THREE.Mesh & { fillOpacity: number }>(null)

  const scale = quality === 'mobile' ? 0.25 : quality === 'low' ? 0.5 : 1
  const starCount = Math.round(260 * scale)
  const plumeCount = Math.round(90 * scale)
  const sparkCount = Math.round(50 * scale)

  const graticule = useMemo(() => graticulePoints(GLOBE_R), [])
  const arc = useMemo(() => arcPath(GLOBE_R), [])
  const delhiPos = useMemo(() => latLon(new THREE.Vector3(), DELHI[0], DELHI[1]).multiplyScalar(GLOBE_R * 1.01), [])
  const cataniaPos = useMemo(() => latLon(new THREE.Vector3(), CATANIA[0], CATANIA[1]).multiplyScalar(GLOBE_R * 1.01), [])

  // Etna: full flank profile (ember-deep) and the summit crest (hot ember).
  const flank = useMemo(() => etnaProfile(-8, 9, 170), [])
  const crest = useMemo(() => etnaProfile(ETNA_PEAK_X - 1.15, ETNA_PEAK_X + 1.15, 60), [])

  const fireRing = useMemo(() => Array.from({ length: 65 }, (_, i) => {
    const a = (i / 64) * Math.PI * 2
    return new THREE.Vector3(FIRE.x + Math.cos(a) * FIRE_R, FIRE.y - 0.08, FIRE.z + Math.sin(a) * FIRE_R)
  }), [])

  const globeMat = useDisposable(() => {
    // Opaque-looking body that still fades in: blended, but it writes depth so the
    // far side of the graticule stays hidden behind it.
    const m = createRimMaterial({
      base: hdr(PALETTE.emberDeep, 0.03),
      rim: hdr(PALETTE.starGold, 1.2),
      power: 2.6,
    })
    m.transparent = true
    m.uniforms.uOpacity!.value = 0
    return m
  })
  const etnaFillGeo = useDisposable(etnaFillGeometry)

  const starGeo = useDisposable(() => starGeometry(starCount), [starCount])
  const starMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uTime: { value: 0 },
      uSize: { value: 30 },
      uCool: { value: hdr(PALETTE.nearWhite, 0.8) },
      uWarm: { value: hdr(PALETTE.starGold, 0.9) },
      uOpacity: { value: 0 },
    },
    vertexShader: STAR_VERT,
    fragmentShader: STAR_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  const plumeGeo = useDisposable(() => riseGeometry(plumeCount, SUMMIT, 0.18), [plumeCount])
  const plumeMat = useDisposable(() => riseMaterial(hdr(PALETTE.ember, 1.1), hdr(PALETTE.nearWhite, 0.18), 1.7, 0.6, 0.035, 1.1, 46))
  const sparkGeo = useDisposable(() => riseGeometry(sparkCount, FIRE, 0.12), [sparkCount])
  const sparkMat = useDisposable(() => riseMaterial(hdr(PALETTE.ember, GLOW.hero), hdr(PALETTE.starGold, 0.6), 1.1, 0.22, 0.16, 0.12, 18))

  const seatGeo = useDisposable(() => new THREE.SphereGeometry(0.055, 16, 12))
  const seatMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.starGold, 0.2),
    rim: hdr(PALETTE.starGold, 1.6),
    power: 1.6,
    additive: true,
  }))
  const seatMatrices = useMemo(() => {
    const m = new THREE.Matrix4()
    return Array.from({ length: SEATS }, (_, i) => {
      // leave a gap facing the camera, like an open circle with a place to join
      const a = Math.PI / 2 + 0.55 + (i / (SEATS - 1)) * (Math.PI * 2 - 1.1)
      return m.makeTranslation(FIRE.x + Math.cos(a) * FIRE_R, FIRE.y + 0.02, FIRE.z + Math.sin(a) * FIRE_R).clone()
    })
  }, [])

  useLayoutEffect(() => {
    const mesh = seatsRef.current
    if (!mesh) return
    for (let i = 0; i < SEATS; i++) mesh.setMatrixAt(i, seatMatrices[i]!)
    mesh.instanceMatrix.needsUpdate = true
  }, [seatMatrices])

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock

    // 1 · the globe turns into place, then drifts gently.
    const settle = ease(p, 0.0, 0.24)
    const spin = spinRef.current
    if (spin) spin.rotation.y = -FACE_LON + (1 - settle) * 1.6 + Math.sin(t * 0.07) * 0.06
    const globeIn = ease(p, 0.0, 0.16)
    // the globe dims a little once we have landed, handing focus to Etna
    const globeLevel = globeIn * (1 - 0.45 * ease(p, 0.55, 0.8))
    setUniform(globeRef.current, 'uOpacity', globeLevel)
    setLineOpacity(gratRef.current, globeLevel * 0.55)

    // 2 · the flight: Delhi to Catania
    const fly = ease(p, 0.2, 0.46)
    setLineReveal(arcRef.current, fly)
    setLineOpacity(arcRef.current, globeIn * (1 - 0.4 * ease(p, 0.6, 0.85)))
    const head = headRef.current
    if (head) {
      const f = fly * ARC_SAMPLES
      const i0 = Math.min(ARC_SAMPLES - 1, Math.floor(f))
      const k = f - i0
      _head.set(arc.flat[i0 * 3]!, arc.flat[i0 * 3 + 1]!, arc.flat[i0 * 3 + 2]!)
      _head.x += (arc.flat[i0 * 3 + 3]! - _head.x) * k
      _head.y += (arc.flat[i0 * 3 + 4]! - _head.y) * k
      _head.z += (arc.flat[i0 * 3 + 5]! - _head.z) * k
      head.position.copy(_head)
      ;(head.material as THREE.SpriteMaterial).opacity = ease(p, 0.18, 0.22) * (1 - ease(p, 0.45, 0.5))
    }
    const delhi = delhiRef.current
    if (delhi) (delhi.material as THREE.SpriteMaterial).opacity = ease(p, 0.1, 0.2) * 0.8 * globeLevel
    const catania = cataniaRef.current
    if (catania) {
      const landed = ease(p, 0.44, 0.5)
      const flash = Math.sin(Math.PI * Math.min(1, Math.max(0, (p - 0.44) / 0.12)))
      ;(catania.material as THREE.SpriteMaterial).opacity = landed * (0.7 + 0.3 * flash) * (1 - 0.3 * ease(p, 0.6, 0.85))
      const s = 0.4 + 0.5 * flash
      catania.scale.set(s, s, 1)
    }

    // 3 · Catania night: stars, then Etna's ember rim, then its plume.
    setUniform(starsRef.current, 'uTime', t)
    setUniform(starsRef.current, 'uOpacity', ease(p, 0.06, 0.36))
    setLineReveal(flankRef.current, ease(p, 0.36, 0.62))
    setLineOpacity(flankRef.current, ease(p, 0.34, 0.4))
    setLineReveal(crestRef.current, ease(p, 0.5, 0.66))
    setLineOpacity(crestRef.current, ease(p, 0.48, 0.52))
    const crater = craterRef.current
    if (crater) {
      const breathe = 0.85 + 0.15 * Math.sin(t * 0.9) * Math.sin(t * 0.37 + 0.6)
      ;(crater.material as THREE.SpriteMaterial).opacity = ease(p, 0.56, 0.7) * breathe
    }
    setUniform(plumeRef.current, 'uTime', t)
    setUniform(plumeRef.current, 'uOpacity', ease(p, 0.6, 0.76))

    // 4 · the campfire circle: same habit, new island.
    const fire = fireRef.current
    if (fire) {
      const flicker = 0.85 + 0.15 * Math.sin(t * 7.1) * Math.sin(t * 4.3 + 0.8)
      ;(fire.material as THREE.SpriteMaterial).opacity = ease(p, 0.62, 0.74) * flicker
    }
    setLineReveal(fireRingRef.current, ease(p, 0.64, 0.78))
    setUniform(seatsRef.current, 'uOpacity', ease(p, 0.68, 0.8))
    setUniform(sparksRef.current, 'uTime', t)
    setUniform(sparksRef.current, 'uOpacity', ease(p, 0.66, 0.78))

    if (routeLabelRef.current) routeLabelRef.current.fillOpacity = ease(p, 0.3, 0.42) * (1 - 0.5 * ease(p, 0.6, 0.8)) * 0.75
    if (etnaLabelRef.current) etnaLabelRef.current.fillOpacity = ease(p, 0.62, 0.74) * 0.75
  })

  return (
    <group>
      {/* Catania night sky */}
      <points ref={starsRef} geometry={starGeo} material={starMat} frustumCulled={false} />

      {/* Globe of light, tilted to show the northern hemisphere */}
      <group position={GLOBE} rotation={[GLOBE_TILT, 0, 0]}>
        <group ref={spinRef} rotation={[0, -FACE_LON + 1.6, 0]}>
          <mesh ref={globeRef} material={globeMat} renderOrder={-1}>
            <sphereGeometry args={[GLOBE_R * 0.985, 48, 32]} />
          </mesh>
          <LightLine ref={gratRef} points={graticule} segments color={PALETTE.starGold} intensity={GLOW.dim} width={0.008} opacity={0} />
          <LightLine ref={arcRef} points={arc.points} color={PALETTE.ember} intensity={GLOW.hero} width={0.026} />
          <GlowSprite ref={delhiRef} position={[delhiPos.x, delhiPos.y, delhiPos.z]} color={PALETTE.starGold} intensity={GLOW.hero} size={0.32} opacity={0} />
          <GlowSprite ref={cataniaRef} position={[cataniaPos.x, cataniaPos.y, cataniaPos.z]} color={PALETTE.ember} intensity={GLOW.hot} size={0.4} opacity={0} />
          <GlowSprite ref={headRef} color={PALETTE.nearWhite} intensity={GLOW.hot} size={0.3} opacity={0} />
        </group>
      </group>

      {/* Etna: dark occluding body, ember-deep flank line, hot crest */}
      <mesh geometry={etnaFillGeo} renderOrder={-1}>
        <meshBasicMaterial color={PALETTE.void} />
      </mesh>
      <LightLine ref={flankRef} points={flank} color={PALETTE.emberDeep} intensity={GLOW.base} width={0.016} opacity={0} />
      <LightLine ref={crestRef} points={crest} color={PALETTE.ember} intensity={GLOW.hero} width={0.022} opacity={0} />
      <GlowSprite ref={craterRef} position={[SUMMIT.x, SUMMIT.y + 0.04, SUMMIT.z + 0.05]} color={PALETTE.ember} intensity={1.6} size={1.1} opacity={0} />
      <points ref={plumeRef} geometry={plumeGeo} material={plumeMat} frustumCulled={false} />

      {/* The campfire circle at Etna's foot */}
      <GlowSprite ref={fireRef} position={[FIRE.x, FIRE.y + 0.08, FIRE.z]} color={PALETTE.ember} intensity={GLOW.hot} size={0.55} opacity={0} />
      <LightLine ref={fireRingRef} points={fireRing} color={PALETTE.starGold} intensity={GLOW.base} width={0.01} />
      <instancedMesh ref={seatsRef} args={[seatGeo, seatMat, SEATS]} frustumCulled={false} />
      <points ref={sparksRef} geometry={sparkGeo} material={sparkMat} frustumCulled={false} />

      <Label ref={routeLabelRef} position={[GLOBE.x, GLOBE.y - GLOBE_R - 0.42, GLOBE.z]} color={PALETTE.starGold} opacity={0}>
        Delhi · Catania
      </Label>
      <Label ref={etnaLabelRef} position={[SUMMIT.x + 0.95, SUMMIT.y + 0.55, SUMMIT.z]} anchorX="left" color={PALETTE.ember} opacity={0}>
        Etna
      </Label>
    </group>
  )
}
