// src/components/CosmicJourney3D/scenes/Beat_ThreeSuns.tsx
'use client'

// Beat 9 · Finding My Sun (Act II, course correction).
// Three faint suns (Physics, Maths, Data) trace a three-body figure-eight in a
// tilted orbital plane. During the hold the Physics sun drifts to the centre and
// ignites into the system's star; the other two lose their own glow, settle onto
// calm circular orbits and are lit by it, and a faint dust disk fills the system.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr, setHdr } from '../art/palette'
import { getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { NOISE_GLSL } from '../art/glsl'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, pulse, seeded } from '../art/anim'

// Orbital plane: centred above the stage, tilted ~57 degrees away from the camera.
const CENTER = new THREE.Vector3(0, 1.25, -1.6)
const AXIS_U = new THREE.Vector3(1, 0, 0)
const AXIS_V = new THREE.Vector3(0, Math.cos(1.0), -Math.sin(1.0))
// Figure-eight (Lissajous approximation of the Chenciner-Montgomery choreography).
const EIGHT_A = 2.2
const EIGHT_B = 1.5
// Final orbits of the two bodies that settle into the sun's light.
const ORBIT_MATHS = 1.45
const ORBIT_DATA = 2.4

const SUN_START_RADIUS = 0.15
const SUN_END_RADIUS = 0.3
const PLANET_RADIUS = [0.12, 0.1] as const

function planePoint(out: THREE.Vector3, u: number, v: number): THREE.Vector3 {
  return out.copy(CENTER).addScaledVector(AXIS_U, u).addScaledVector(AXIS_V, v)
}

function eightPoint(out: THREE.Vector3, theta: number): THREE.Vector3 {
  return planePoint(out, EIGHT_A * Math.sin(theta), EIGHT_B * 0.5 * Math.sin(2 * theta))
}

function eightCurve(n: number): THREE.Vector3[] {
  return Array.from({ length: n + 1 }, (_, i) => eightPoint(new THREE.Vector3(), (i / n) * Math.PI * 2))
}

function orbitCurve(radius: number, n: number): THREE.Vector3[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return planePoint(new THREE.Vector3(), radius * Math.cos(a), radius * Math.sin(a))
  })
}

// A body that can be a faint sun (rim only) or a planet lit by the sun (uLit).
const BODY_VERT = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPosW;
  varying vec3 vView;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vPosW = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 mv = viewMatrix * world;
    vView = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const BODY_FRAG = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uRim;
  uniform vec3 uSunColor;
  uniform vec3 uSunPos;
  uniform float uLit;
  uniform float uPower;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  varying vec3 vView;
  void main() {
    vec3 n = normalize(vNormalW);
    float fres = pow(1.0 - clamp(abs(dot(n, vView)), 0.0, 1.0), uPower);
    vec3 toSun = normalize(uSunPos - vPosW);
    float day = max(dot(n, toSun), 0.0);
    // terminator-hugging rim: the lit limb glows hotter than the night side
    float limb = fres * (0.25 + 0.75 * smoothstep(-0.2, 0.6, dot(n, toSun)));
    vec3 col = uBase + uRim * mix(fres, limb, uLit) + uSunColor * day * uLit;
    gl_FragColor = vec4(col, 1.0);
  }
`

const PLANE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Soft corona with slow streamers for the ignited sun.
const CORONA_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform vec3 uColor;
  uniform vec3 uCore;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec2 q = (vUv - 0.5) * 2.0;
    float r = length(q);
    float a = atan(q.y, q.x);
    float streak = fbm(vec3(cos(a) * 2.2, sin(a) * 2.2, uTime * 0.05 + r * 0.6));
    float halo = exp(-r * 4.2) * (0.55 + 0.9 * streak);
    float core = exp(-r * r * 60.0);
    float edge = 1.0 - smoothstep(0.7, 1.0, r);
    vec3 col = (uColor * halo + uCore * core) * edge * uOpacity;
    gl_FragColor = vec4(col, 1.0);
  }
`

// Dust disk: Keplerian particles in the orbital plane, positioned on the GPU.
const DUST_VERT = /* glsl */ `
  attribute float aRadius;
  attribute float aAngle;
  attribute float aLift;
  uniform float uTime;
  uniform float uSize;
  uniform vec3 uCenter;
  uniform vec3 uU;
  uniform vec3 uV;
  uniform vec3 uN;
  varying float vFade;
  void main() {
    float omega = 0.22 * pow(aRadius / 1.4, -1.5);
    float a = aAngle + uTime * omega;
    vec3 p = uCenter + uU * cos(a) * aRadius + uV * sin(a) * aRadius + uN * aLift;
    vFade = smoothstep(0.55, 0.9, aRadius) * (1.0 - smoothstep(2.6, 3.1, aRadius));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const DUST_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    gl_FragColor = vec4(uColor * a * vFade * uOpacity, 1.0);
  }
`

function dustGeometry(count: number): THREE.BufferGeometry {
  const radius = new Float32Array(count)
  const angle = new Float32Array(count)
  const lift = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    radius[i] = 0.6 + 2.5 * Math.sqrt(seeded(i, 11))
    angle[i] = seeded(i, 12) * Math.PI * 2
    lift[i] = (seeded(i, 13) - 0.5) * 0.12
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  g.setAttribute('aRadius', new THREE.BufferAttribute(radius, 1))
  g.setAttribute('aAngle', new THREE.BufferAttribute(angle, 1))
  g.setAttribute('aLift', new THREE.BufferAttribute(lift, 1))
  return g
}

function bodyMaterial(base: THREE.Color, rim: THREE.Color): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uBase: { value: base.clone() },
      uRim: { value: rim.clone() },
      uSunColor: { value: hdr(PALETTE.starGold, 1.3) },
      uSunPos: { value: new THREE.Vector3() },
      uLit: { value: 0 },
      uPower: { value: 2.2 },
    },
    vertexShader: BODY_VERT,
    fragmentShader: BODY_FRAG,
  })
}

// Module-level scratch (no allocation in useFrame).
const _eight = new THREE.Vector3()
const _final = new THREE.Vector3()
const _pos = new THREE.Vector3()
const _sunWorld = new THREE.Vector3()
const NORMAL = new THREE.Vector3().crossVectors(AXIS_U, AXIS_V).normalize()
const SUN_RIM_START = hdr(PALETTE.nearWhite, 1.1)
const SUN_RIM_END = hdr(PALETTE.starGold, GLOW.hot)
const SUN_BASE_START = hdr(PALETTE.stellarBlue, 0.08)
const SUN_BASE_END = hdr(PALETTE.starGold, 1.6)
const PLANET_RIM = [hdr(PALETTE.stellarBlue, 1.2), hdr(PALETTE.signal, 1.2)] as const
const PLANET_BASE = [hdr(PALETTE.stellarBlue, 0.06), hdr(PALETTE.signal, 0.06)] as const
const LABEL_LIFT = 0.42

type TextMesh = THREE.Mesh & { fillOpacity: number }
interface BodyUniforms {
  uBase: { value: THREE.Color }
  uRim: { value: THREE.Color }
  uSunPos: { value: THREE.Vector3 }
  uLit: { value: number }
}

export default function Beat_ThreeSuns({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  // Index 0 is Physics (becomes the sun), 1 Maths, 2 Data.
  const sunRef = useRef<THREE.Mesh>(null)
  const mathsRef = useRef<THREE.Mesh>(null)
  const dataRef = useRef<THREE.Mesh>(null)
  const sunGlowRef = useRef<THREE.Sprite>(null)
  const mathsGlowRef = useRef<THREE.Sprite>(null)
  const dataGlowRef = useRef<THREE.Sprite>(null)
  const sunLabelRef = useRef<TextMesh>(null)
  const mathsLabelRef = useRef<TextMesh>(null)
  const dataLabelRef = useRef<TextMesh>(null)
  const coronaRef = useRef<THREE.Mesh>(null)
  const coronaGroupRef = useRef<THREE.Group>(null)
  const flareRef = useRef<THREE.Sprite>(null)
  const eightRef = useRef<LightLineObject>(null)
  const orbitMathsRef = useRef<LightLineObject>(null)
  const orbitDataRef = useRef<LightLineObject>(null)
  const dustRef = useRef<THREE.Points>(null)

  const eight = useMemo(() => eightCurve(160), [])
  const orbitMaths = useMemo(() => orbitCurve(ORBIT_MATHS, 128), [])
  const orbitData = useMemo(() => orbitCurve(ORBIT_DATA, 160), [])

  const sunMat = useDisposable(() => bodyMaterial(SUN_BASE_START, SUN_RIM_START))
  const mathsMat = useDisposable(() => bodyMaterial(PLANET_BASE[0], hdr(PALETTE.stellarBlue, 1.1)))
  const dataMat = useDisposable(() => bodyMaterial(PLANET_BASE[1], hdr(PALETTE.signal, 1.1)))
  const sphereGeo = useDisposable(() => new THREE.SphereGeometry(1, 40, 40))

  const coronaMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: hdr(PALETTE.starGold, GLOW.hero) },
      uCore: { value: hdr(PALETTE.nearWhite, GLOW.hot) },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
    },
    vertexShader: PLANE_VERT,
    fragmentShader: CORONA_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))

  const dustCount = quality === 'mobile' ? 100 : quality === 'low' ? 200 : 400
  const dustGeo = useDisposable(() => dustGeometry(dustCount), [dustCount])
  const dustMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uColor: { value: hdr(PALETTE.signal, 0.75) },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 15 },
      uCenter: { value: CENTER.clone() },
      uU: { value: AXIS_U.clone() },
      uV: { value: AXIS_V.clone() },
      uN: { value: NORMAL.clone() },
    },
    vertexShader: DUST_VERT,
    fragmentShader: DUST_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock

    const appear = ease(p, 0.0, 0.18)
    // Hold: the dance (0.15-0.42), then the choice (0.4-0.66), then the calm system.
    const settle = ease(p, 0.4, 0.66)
    const ignite = ease(p, 0.44, 0.7)
    const theta = 0.35 + t * 0.28 + p * 3.2

    // Figure-eight trail fades as the choreography gives way.
    setLineOpacity(eightRef.current, appear * (1 - settle) * 0.55)
    setLineReveal(orbitMathsRef.current, ease(p, 0.5, 0.74))
    setLineReveal(orbitDataRef.current, ease(p, 0.54, 0.8))

    // Sun: drift from its figure-eight slot to the centre, grow and ignite.
    eightPoint(_eight, theta)
    _pos.lerpVectors(_eight, CENTER, settle)
    const sun = sunRef.current
    if (sun) {
      sun.position.copy(_pos)
      const r = SUN_START_RADIUS + (SUN_END_RADIUS - SUN_START_RADIUS) * ignite
      sun.scale.setScalar(r)
      const u = (sun.material as THREE.ShaderMaterial).uniforms as unknown as BodyUniforms
      u.uRim.value.lerpColors(SUN_RIM_START, SUN_RIM_END, ignite)
      u.uBase.value.lerpColors(SUN_BASE_START, SUN_BASE_END, ignite * ignite)
    }
    _sunWorld.copy(_pos)
    if (sun?.parent) sun.parent.localToWorld(_sunWorld)
    const sunGlow = sunGlowRef.current
    if (sunGlow) {
      sunGlow.position.copy(_pos)
      ;(sunGlow.material as THREE.SpriteMaterial).opacity = appear * (0.35 + 0.45 * ignite)
      const s = 0.9 + 2.6 * ignite
      sunGlow.scale.set(s, s, 1)
    }
    const coronaGroup = coronaGroupRef.current
    if (coronaGroup) coronaGroup.position.copy(_pos)
    setUniform(coronaRef.current, 'uOpacity', ignite)
    setUniform(coronaRef.current, 'uTime', t)
    const flare = flareRef.current
    if (flare) {
      const f = pulse(p, 0.5, 0.74)
      flare.position.copy(_pos)
      ;(flare.material as THREE.SpriteMaterial).opacity = f * 0.55
      const s = 1.5 + 5.5 * ease(p, 0.5, 0.74)
      flare.scale.set(s, s, 1)
    }
    const sunLabel = sunLabelRef.current
    if (sunLabel) {
      sunLabel.position.copy(_pos)
      sunLabel.position.y += LABEL_LIFT + 0.25 * ignite
      sunLabel.fillOpacity = ease(p, 0.16, 0.28) * 0.85
    }

    // Maths and Data: figure-eight slots, then circular orbits lit by the sun.
    for (let i = 1; i < 3; i++) {
      eightPoint(_eight, theta + (i * Math.PI * 2) / 3)
      const radius = i === 1 ? ORBIT_MATHS : ORBIT_DATA
      const omega = i === 1 ? 0.24 : 0.13
      const phase = (i === 1 ? 2.3 : 4.4) + t * omega + p * 1.2
      planePoint(_final, radius * Math.cos(phase), radius * Math.sin(phase))
      _pos.lerpVectors(_eight, _final, settle)
      const body = (i === 1 ? mathsRef.current : dataRef.current)
      if (body) {
        body.position.copy(_pos)
        body.scale.setScalar(SUN_START_RADIUS + ((i === 1 ? PLANET_RADIUS[0] : PLANET_RADIUS[1]) - SUN_START_RADIUS) * settle)
        const u = (body.material as THREE.ShaderMaterial).uniforms as unknown as BodyUniforms
        u.uLit.value = settle
        u.uSunPos.value.copy(_sunWorld)
        setHdr(u.uRim.value, i === 1 ? PLANET_RIM[0] : PLANET_RIM[1], 1 - 0.45 * settle)
      }
      const glow = (i === 1 ? mathsGlowRef.current : dataGlowRef.current)
      if (glow) {
        glow.position.copy(_pos)
        ;(glow.material as THREE.SpriteMaterial).opacity = appear * 0.4 * (1 - 0.8 * settle)
      }
      const label = (i === 1 ? mathsLabelRef.current : dataLabelRef.current)
      if (label) {
        label.position.copy(_pos)
        label.position.y += LABEL_LIFT - 0.12 * settle
        label.fillOpacity = ease(p, 0.18, 0.3) * (0.8 - 0.4 * settle)
      }
    }

    setUniform(dustRef.current, 'uTime', t + p * 6)
    setUniform(dustRef.current, 'uOpacity', ease(p, 0.56, 0.84))
  })

  return (
    <group>
      <LightLine ref={eightRef} points={eight} color={PALETTE.stellarBlue} intensity={GLOW.base} width={0.01} opacity={0} />
      <LightLine ref={orbitMathsRef} points={orbitMaths} color={PALETTE.stellarBlue} intensity={0.6} width={0.009} />
      <LightLine ref={orbitDataRef} points={orbitData} color={PALETTE.signal} intensity={0.6} width={0.009} />

      <points ref={dustRef} geometry={dustGeo} material={dustMat} frustumCulled={false} />

      <mesh ref={sunRef} geometry={sphereGeo} material={sunMat} />
      <mesh ref={mathsRef} geometry={sphereGeo} material={mathsMat} />
      <mesh ref={dataRef} geometry={sphereGeo} material={dataMat} />

      <GlowSprite ref={sunGlowRef} color={PALETTE.starGold} intensity={GLOW.hero} size={1} opacity={0} />
      <GlowSprite ref={mathsGlowRef} color={PALETTE.stellarBlue} intensity={1.4} size={0.9} opacity={0} />
      <GlowSprite ref={dataGlowRef} color={PALETTE.signal} intensity={1.4} size={0.9} opacity={0} />

      <group ref={coronaGroupRef}>
        <Billboard>
          <mesh ref={coronaRef} material={coronaMat}>
            <planeGeometry args={[2.6, 2.6]} />
          </mesh>
        </Billboard>
      </group>
      <GlowSprite ref={flareRef} color={PALETTE.starGold} intensity={GLOW.hero} size={1} opacity={0} />

      <Label ref={sunLabelRef} color={PALETTE.starGold} opacity={0}>Physics</Label>
      <Label ref={mathsLabelRef} color={PALETTE.stellarBlue} opacity={0}>Maths</Label>
      <Label ref={dataLabelRef} color={PALETTE.signal} opacity={0}>Data</Label>
    </group>
  )
}
