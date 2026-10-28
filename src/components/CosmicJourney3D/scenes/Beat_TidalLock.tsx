// src/components/CosmicJourney3D/scenes/Beat_TidalLock.tsx
'use client'

// Beat 7 · Fixated on Physics (Act II, course-correction).
// A planet circles a dim host star on a temporary (dashed) orbit. Far off, a bright
// "Physics" star burns. The planet's face is marked by rings of light; it swings
// once, settles, and from then on stays turned toward the Physics star wherever it
// is on its orbit, as if tidally locked to it. A sharp terminator divides the lit
// face from the night side, and a faint dashed line of sight ties the two together.
// On departure the temporary orbit fades and the line of sight brightens.

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
import { ease, seeded } from '../art/anim'

const HOME = new THREE.Vector3(-1.5, 0.45, -2.0)
const HOME_RADIUS = 0.22
const PHYSICS = new THREE.Vector3(3.3, 2.85, -4.8)
const ORBIT_A = 2.15
const ORBIT_B = 1.45
const ORBIT_TILT = new THREE.Euler(0.36, 0, 0.08)
const PLANET_RADIUS = 0.46

const PLANET_VERT = /* glsl */ `
  varying vec3 vObjN;
  varying vec3 vWorldN;
  varying vec3 vView;
  void main() {
    vObjN = normal;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldN = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

// Day side lit by the Physics star, a hot hairline terminator, a rim-lit night
// side, and the locked face: concentric rings and a bright sub-stellar point
// around the planet's local +Z (which lookAt keeps aimed at the star).
const PLANET_FRAG = /* glsl */ `
  uniform vec3 uLightDir;
  uniform vec3 uDay;
  uniform vec3 uNight;
  uniform vec3 uTerm;
  uniform vec3 uFace;
  uniform float uLock;
  uniform float uOpacity;
  varying vec3 vObjN;
  varying vec3 vWorldN;
  varying vec3 vView;
  void main() {
    vec3 n = normalize(vWorldN);
    vec3 on = normalize(vObjN);
    float lit = dot(n, normalize(uLightDir));
    float day = smoothstep(-0.03, 0.45, lit);
    float term = exp(-pow(lit / 0.04, 2.0)) * 0.9 + exp(-pow(lit / 0.14, 2.0)) * 0.2;
    float fres = pow(1.0 - clamp(abs(dot(n, normalize(vView))), 0.0, 1.0), 2.4);

    // Planet-fixed graticule around the face axis (+Z).
    float theta = acos(clamp(on.z, -1.0, 1.0));
    float phi = atan(on.y, on.x);
    float lat = abs(fract(theta * 6.0 / 3.14159265 + 0.5) - 0.5);
    float lon = abs(fract(phi * 8.0 / 6.2831853 + 0.5) - 0.5);
    float grid = (1.0 - smoothstep(0.0, 0.035, lat)) + (1.0 - smoothstep(0.0, 0.025, lon)) * smoothstep(0.15, 0.5, theta);

    // The locked face.
    float rings = exp(-pow((theta - 0.36) / 0.022, 2.0)) + 0.7 * exp(-pow((theta - 0.7) / 0.018, 2.0));
    float spot = pow(max(on.z, 0.0), 30.0);

    vec3 col = uNight * (0.05 + 0.9 * fres) * (1.0 - day * 0.6);
    col += uDay * day * (0.18 + 0.55 * fres + 0.12 * grid);
    col += uNight * grid * 0.12 * (1.0 - day);
    col += uTerm * term;
    col += uFace * (rings * 0.9 + spot * 1.4) * uLock * (0.35 + 0.65 * day);
    gl_FragColor = vec4(col * uOpacity, 1.0);
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

function orbitPoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= 192; i++) {
    const a = (i / 192) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * ORBIT_A, 0, Math.sin(a) * ORBIT_B).applyEuler(ORBIT_TILT).add(HOME))
  }
  return pts
}

// Diffraction spikes for the Physics star (segments, centred on the origin).
function spikePoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const arms = [[1.25, 0], [0, 1.25], [0.55, 0.55], [-0.55, 0.55]] as const
  for (const [x, y] of arms) pts.push(new THREE.Vector3(-x, -y, 0), new THREE.Vector3(x, y, 0))
  return pts
}

// Module-level scratch: no allocation inside useFrame.
const _planet = new THREE.Vector3()
const _planetWorld = new THREE.Vector3()
const _physWorld = new THREE.Vector3()
const _dir = new THREE.Vector3()
const _local = new THREE.Vector3()
const _tilt = new THREE.Matrix4().makeRotationFromEuler(ORBIT_TILT)

export default function Beat_TidalLock({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const planetRef = useRef<THREE.Mesh>(null)
  const faceGlowRef = useRef<THREE.Sprite>(null)
  const orbitRef = useRef<LightLineObject>(null)
  const sightRef = useRef<THREE.Group>(null)
  const sightLineRef = useRef<LightLineObject>(null)
  const physRef = useRef<THREE.Group>(null)
  const physCoreRef = useRef<THREE.Sprite>(null)
  const physHaloRef = useRef<THREE.Sprite>(null)
  const spikesRef = useRef<LightLineObject>(null)
  const homeGlowRef = useRef<THREE.Sprite>(null)
  const dustRef = useRef<THREE.Points>(null)
  const labelRef = useRef<THREE.Mesh & { fillOpacity: number }>(null)

  const orbit = useMemo(() => orbitPoints(), [])
  const spikes = useMemo(() => spikePoints(), [])
  const sight = useMemo(() => [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1)], [])

  const planetMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uLightDir: { value: new THREE.Vector3(1, 1, -1).normalize() },
      uDay: { value: hdr(PALETTE.signal, 1.25) },
      uNight: { value: hdr(PALETTE.stellarBlue, 0.55) },
      uTerm: { value: hdr(PALETTE.nearWhite, GLOW.hero) },
      uFace: { value: hdr(PALETTE.nearWhite, GLOW.hero) },
      uLock: { value: 0 },
      uOpacity: { value: 0 },
    },
    vertexShader: PLANET_VERT,
    fragmentShader: PLANET_FRAG,
  }))
  const homeMat = useDisposable(() => createRimMaterial({
    base: hdr(PALETTE.stellarBlue, 0.3),
    rim: hdr(PALETTE.stellarBlue, 1.2),
    power: 1.8,
  }))

  const dustCount = quality === 'mobile' ? 100 : quality === 'low' ? 200 : 400
  const dustGeo = useDisposable(() => {
    const pos = new Float32Array(dustCount * 3)
    const seed = new Float32Array(dustCount)
    for (let i = 0; i < dustCount; i++) {
      pos[i * 3] = (seeded(i, 51) - 0.5) * 11
      pos[i * 3 + 1] = -1.2 + seeded(i, 52) * 5.2
      pos[i * 3 + 2] = -6.5 + seeded(i, 53) * 6.5
      seed[i] = seeded(i, 54)
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

    const appear = ease(p, 0.0, 0.2)
    // The fixation: the face swings round and settles into lock during the hold.
    const lock = ease(p, 0.18, 0.46)
    const depart = ease(p, 0.85, 1.0)

    setUniform(dustRef.current, 'uTime', t)
    setUniform(dustRef.current, 'uOpacity', appear)

    // Physics star: present from the start, brightening as the gaze fixes on it.
    const fix = ease(p, 0.1, 0.6)
    const core = physCoreRef.current
    if (core) {
      const s = 0.7 + 0.45 * fix + 0.2 * depart
      core.scale.set(s, s, 1)
      ;(core.material as THREE.SpriteMaterial).opacity = 0.55 + 0.45 * fix
    }
    const halo = physHaloRef.current
    if (halo) {
      const breathe = 0.92 + 0.08 * Math.sin(t * 0.7)
      ;(halo.material as THREE.SpriteMaterial).opacity = (0.3 + 0.5 * fix + 0.2 * depart) * breathe
    }
    setLineOpacity(spikesRef.current, (0.35 + 0.65 * fix) * appear)
    const phys = physRef.current
    if (phys) phys.rotation.z = 0.12 + t * 0.01

    const homeGlow = homeGlowRef.current
    if (homeGlow) (homeGlow.material as THREE.SpriteMaterial).opacity = appear * (0.75 - 0.35 * depart)

    // The temporary orbit: dashed, quiet, fading as the planet's attention leaves it.
    setLineReveal(orbitRef.current, ease(p, 0.02, 0.24))
    setLineOpacity(orbitRef.current, 0.7 * appear * (1 - 0.8 * depart))

    // Planet position on the orbit's front arc, left to right through the hold.
    const ang = 2.55 - 1.75 * ease(p, 0.05, 1.0) - t * 0.02
    _local.set(Math.cos(ang) * ORBIT_A, 0, Math.sin(ang) * ORBIT_B).applyMatrix4(_tilt)
    _planet.copy(_local).add(HOME)

    const planet = planetRef.current
    const physObj = physRef.current
    if (planet && physObj) {
      planet.position.copy(_planet)
      physObj.getWorldPosition(_physWorld)
      planet.getWorldPosition(_planetWorld)
      // Face (+Z) toward the Physics star; before lock it is still turning.
      planet.lookAt(_physWorld)
      planet.rotateY((1 - lock) * (1.9 + t * 0.35))
      planet.rotateX((1 - lock) * 0.35)
      _dir.subVectors(_physWorld, _planetWorld).normalize()
      const mat = planet.material as THREE.ShaderMaterial
      mat.uniforms.uLightDir!.value.copy(_dir)
      setUniform(planet, 'uLock', lock)
      setUniform(planet, 'uOpacity', ease(p, 0.02, 0.18))

      const face = faceGlowRef.current
      if (face) {
        // Sub-stellar glow sits on the surface where the face points.
        face.position.copy(_planet).addScaledVector(_dir, PLANET_RADIUS * 1.02)
        ;(face.material as THREE.SpriteMaterial).opacity = lock * (0.6 + 0.25 * depart)
      }

      const sightGroup = sightRef.current
      if (sightGroup) {
        sightGroup.position.copy(_planet)
        sightGroup.lookAt(_physWorld)
        const dist = _planet.distanceTo(PHYSICS)
        sightGroup.scale.set(1, 1, dist)
      }
    }
    setLineReveal(sightLineRef.current, ease(p, 0.36, 0.58))
    setLineOpacity(sightLineRef.current, ease(p, 0.36, 0.42) * (0.55 + 0.45 * depart))

    if (labelRef.current) labelRef.current.fillOpacity = ease(p, 0.3, 0.45) * 0.8
  })

  return (
    <group>
      <points ref={dustRef} geometry={dustGeo} material={dustMat} frustumCulled={false} />

      {/* The temporary home: a dim host star and its dashed orbit */}
      <mesh position={HOME} material={homeMat}>
        <sphereGeometry args={[HOME_RADIUS, 32, 32]} />
      </mesh>
      <GlowSprite ref={homeGlowRef} position={[HOME.x, HOME.y, HOME.z]} color={PALETTE.stellarBlue} intensity={1.3} size={1.5} opacity={0} />
      <LightLine ref={orbitRef} points={orbit} color={PALETTE.stellarBlue} intensity={GLOW.base} width={0.014} opacity={0} dashed dashSize={0.09} gapSize={0.08} />

      {/* The Physics star */}
      <group ref={physRef} position={PHYSICS}>
        <GlowSprite ref={physHaloRef} color={PALETTE.signal} intensity={GLOW.hero} size={4.2} opacity={0} />
        <GlowSprite ref={physCoreRef} color={PALETTE.nearWhite} intensity={GLOW.hot} size={1} opacity={0} />
        <LightLine ref={spikesRef} points={spikes} segments color={PALETTE.nearWhite} intensity={GLOW.hero} width={0.012} opacity={0} />
      </group>

      {/* The planet, its locked face and its line of sight */}
      <mesh ref={planetRef} material={planetMat}>
        <sphereGeometry args={[PLANET_RADIUS, 64, 48]} />
      </mesh>
      <GlowSprite ref={faceGlowRef} color={PALETTE.signal} intensity={GLOW.hero} size={0.55} opacity={0} />
      <group ref={sightRef}>
        <LightLine ref={sightLineRef} points={sight} color={PALETTE.signal} intensity={1.3} width={0.012} opacity={0} dashed dashSize={0.012} gapSize={0.016} />
      </group>

      <Label ref={labelRef} position={[PHYSICS.x - 0.2, PHYSICS.y + 0.95, PHYSICS.z]} color={PALETTE.nearWhite} opacity={0}>
        Physics
      </Label>
    </group>
  )
}
