// src/components/CosmicJourney3D/scenes/Beat_Upstream.tsx
'use client'

// Beat 21 · Fixing the Tools Everyone Uses (Act IV, widening).
// Upstream work, made of light. A celestial sphere hangs behind; a ribbon of
// light sweeps along the declination strip HERA sees (hera_strip), and the sky
// itself shimmers in four Stokes tints (I, Q, U, V: the polarized sky added to
// matvis). In front, pull-request branches flow like a river delta into one
// trunk that brightens toward v1.0, with commits travelling along them.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { NOISE_GLSL } from '../art/glsl'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, ramp, seeded } from '../art/anim'

// ---------------------------------------------------------------------------
// Static layout
// ---------------------------------------------------------------------------

const SKY_CENTER = new THREE.Vector3(-2.0, 2.15, -4.2)
const SKY_RADIUS = 1.9
/** Tilt the celestial pole away from the camera so the southern strip arcs across the sphere's face. */
const SKY_TILT = new THREE.Euler(-0.55, 0, 0.3)
/** HERA sits at latitude -30.7 deg: the strip it sees is centred on that declination. */
const HERA_DEC = (-30.7 * Math.PI) / 180
const STRIP_HALF = (5.5 * Math.PI) / 180
const STRIP_THETA_START = Math.PI / 2 - HERA_DEC - STRIP_HALF

// The trunk: from the merge point, up and to the right, ending at v1.0.
const TRUNK = [new THREE.Vector3(-0.3, -0.35, 0.1), new THREE.Vector3(1.7, -0.25, -0.3), new THREE.Vector3(3.55, 1.3, -1.4)] as const
const BRANCHES = 9
const HOT_FROM = 0.55

function quad(out: THREE.Vector3, p: readonly [THREE.Vector3, THREE.Vector3, THREE.Vector3], t: number): THREE.Vector3 {
  const u = 1 - t
  return out.copy(p[0]).multiplyScalar(u * u).addScaledVector(p[1], 2 * u * t).addScaledVector(p[2], t * t)
}

function quadTangent(out: THREE.Vector3, p: readonly [THREE.Vector3, THREE.Vector3, THREE.Vector3], t: number): THREE.Vector3 {
  const u = 1 - t
  return out.copy(p[1]).sub(p[0]).multiplyScalar(2 * u).addScaledVector(p[2], 2 * t).addScaledVector(p[1], -2 * t)
}

function cubic(out: THREE.Vector3, p: readonly THREE.Vector3[], t: number): THREE.Vector3 {
  const u = 1 - t
  return out.copy(p[0]!).multiplyScalar(u * u * u)
    .addScaledVector(p[1]!, 3 * u * u * t)
    .addScaledVector(p[2]!, 3 * u * t * t)
    .addScaledVector(p[3]!, t * t * t)
}

interface Branch {
  ctrl: THREE.Vector3[]
  join: number
  delay: number
}

/** Pull-request branches fanned out to the left, each joining the trunk a little further along. */
const BRANCH_DATA: Branch[] = Array.from({ length: BRANCHES }, (_, i) => {
  const a = Math.PI * (0.6 + 0.55 * (i / (BRANCHES - 1)))
  const start = new THREE.Vector3(
    TRUNK[0].x + Math.cos(a) * 3.4 + (seeded(i, 1) - 0.5) * 0.3,
    TRUNK[0].y + 0.2 + Math.sin(a) * 0.8,
    TRUNK[0].z + (seeded(i, 2) - 0.5) * 2.2,
  )
  const join = 0.02 + 0.3 * seeded(i, 3)
  const end = quad(new THREE.Vector3(), TRUNK, join)
  const tangent = quadTangent(new THREE.Vector3(), TRUNK, join).normalize()
  const c1 = start.clone().add(new THREE.Vector3(0.9 + 0.4 * seeded(i, 4), (seeded(i, 5) - 0.5) * 0.3, 0.15))
  const c2 = end.clone().addScaledVector(tangent, -1.1 - 0.4 * seeded(i, 6))
  return { ctrl: [start, c1, c2, end], join, delay: 0.1 + 0.26 * seeded(i, 7) }
})

const SKY_TILT_QUAT = new THREE.Quaternion().setFromEuler(SKY_TILT)

// ---------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------

const SPHERE_VERT = /* glsl */ `
  varying vec3 vObjDir;
  varying vec3 vNormalV;
  varying vec3 vView;
  varying vec2 vUv;
  void main() {
    vObjDir = normalize(position);
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormalV = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

// Celestial sphere: a faint RA/Dec graticule and a polarized sky. Total intensity
// I is a soft haze; the linear polarization (Q, U) shares one fraction P but its
// angle chi drifts, so Q and U trade places (the shimmer); V is rare and patchy.
const SKY_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform float uGrid;
  uniform float uStokes;
  uniform float uTime;
  uniform vec3 uGridColor;
  uniform vec3 uRimColor;
  uniform vec3 uI;
  uniform vec3 uQ;
  uniform vec3 uU;
  uniform vec3 uV;
  varying vec3 vObjDir;
  varying vec3 vNormalV;
  varying vec3 vView;
  const float PI = 3.14159265;
  float grid(float v, float spacing) {
    float x = v / spacing;
    float w = min(fwidth(x), 0.3);
    float g = abs(fract(x - 0.5) - 0.5) / max(w, 1e-4);
    return 1.0 - clamp(g, 0.0, 1.0);
  }
  void main() {
    vec3 d = normalize(vObjDir);
    float dec = asin(clamp(d.y, -1.0, 1.0));
    float ra = atan(d.z, d.x) + PI;
    float poleFade = 1.0 - smoothstep(1.2, 1.5, abs(dec));
    float lines = max(grid(dec, PI / 12.0), grid(ra, PI / 6.0) * poleFade);

    float I = smoothstep(0.3, 0.8, fbm(d * 2.2 + 1.3));
    float P = smoothstep(0.42, 0.78, fbm(d * 3.1 + 7.0));
    float chi = fbm(d * 1.7 + 2.0) * 2.0 * PI + uTime * 0.22;
    float Q = P * cos(2.0 * chi);
    float U = P * sin(2.0 * chi);
    float V = smoothstep(0.64, 0.82, fbm(d * 4.3 + 11.0)) * (0.6 + 0.4 * sin(uTime * 0.5 + d.x * 6.0));

    float fres = pow(1.0 - clamp(abs(dot(normalize(vNormalV), vView)), 0.0, 1.0), 2.2);
    vec3 col = uGridColor * lines * uGrid + uRimColor * fres * uGrid;
    col += (uI * I * 0.1 + uQ * abs(Q) * 0.36 + uU * abs(U) * 0.36 + uV * V * 0.3) * uStokes;
    gl_FragColor = vec4(col, 1.0);
  }
`

// The hera_strip ribbon: a declination band drawn on along right ascension, with
// hairline edges, faint sources inside and a hot leading edge.
const STRIP_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform float uSweep;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform vec3 uLead;
  varying vec2 vUv;
  void main() {
    float x = vUv.x;
    float behind = 1.0 - smoothstep(uSweep - 0.004, uSweep, x);
    float lead = exp(-pow((uSweep - x) / 0.012, 2.0)) * step(x, uSweep + 0.02) * (1.0 - smoothstep(0.98, 1.04, uSweep));
    float edgeW = fwidth(vUv.y) * 1.6;
    float edges = 1.0 - smoothstep(0.0, edgeW, min(vUv.y, 1.0 - vUv.y));
    vec2 cell = floor(vec2(x * 220.0, vUv.y * 9.0));
    float h = hash13(vec3(cell, 4.0));
    vec2 f = fract(vec2(x * 220.0, vUv.y * 9.0)) - 0.5;
    float src = step(0.9, h) * exp(-dot(f, f) * 30.0);
    float body = 0.12 + 0.55 * edges + 0.9 * src;
    vec3 col = uColor * body * behind + uLead * lead;
    gl_FragColor = vec4(col * uOpacity, 1.0);
  }
`

// Commits flowing: down a branch, then along the trunk from its join to v1.0.
const FLOW_VERT = /* glsl */ `
  attribute float aSeed;
  attribute float aBranch;
  attribute vec3 aJitter;
  uniform vec3 uB0[${BRANCHES}];
  uniform vec3 uB1[${BRANCHES}];
  uniform vec3 uB2[${BRANCHES}];
  uniform vec3 uB3[${BRANCHES}];
  uniform float uJoin[${BRANCHES}];
  uniform vec3 uT0;
  uniform vec3 uT1;
  uniform vec3 uT2;
  uniform float uTime;
  uniform float uSize;
  varying float vTrunk;
  varying float vFade;
  void main() {
    float u = fract(aSeed + uTime * 0.05);
    vec3 b0 = uB0[0]; vec3 b1 = uB1[0]; vec3 b2 = uB2[0]; vec3 b3 = uB3[0]; float join = uJoin[0];
    for (int i = 1; i < ${BRANCHES}; i++) {
      if (abs(aBranch - float(i)) < 0.5) { b0 = uB0[i]; b1 = uB1[i]; b2 = uB2[i]; b3 = uB3[i]; join = uJoin[i]; }
    }
    vec3 p;
    float split = 0.55;
    if (u < split) {
      float t = u / split;
      float w = 1.0 - t;
      p = w * w * w * b0 + 3.0 * w * w * t * b1 + 3.0 * w * t * t * b2 + t * t * t * b3;
      vTrunk = 0.0;
    } else {
      float t = mix(join, 1.0, (u - split) / (1.0 - split));
      float w = 1.0 - t;
      p = w * w * uT0 + 2.0 * w * t * uT1 + t * t * uT2;
      vTrunk = t;
    }
    p += aJitter * 0.025;
    vFade = smoothstep(0.0, 0.06, u) * (1.0 - smoothstep(0.95, 1.0, u));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.6 + 0.8 * fract(aSeed * 9.7)) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const FLOW_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uBranchColor;
  uniform vec3 uTrunkColor;
  uniform float uOpacity;
  varying float vTrunk;
  varying float vFade;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    vec3 col = vTrunk > 0.0 ? uTrunkColor * (0.6 + 0.9 * vTrunk) : uBranchColor;
    gl_FragColor = vec4(col * a * vFade * uOpacity, 1.0);
  }
`

function flowGeometry(count: number): THREE.BufferGeometry {
  const seed = new Float32Array(count)
  const branch = new Float32Array(count)
  const jitter = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    seed[i] = seeded(i, 0)
    branch[i] = i % BRANCHES
    jitter[i * 3] = (seeded(i, 1) - 0.5) * 2
    jitter[i * 3 + 1] = (seeded(i, 2) - 0.5) * 2
    jitter[i * 3 + 2] = (seeded(i, 3) - 0.5) * 2
  }
  const g = new THREE.BufferGeometry()
  // Positions are computed in the shader; a zeroed attribute satisfies three.
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  g.setAttribute('aBranch', new THREE.BufferAttribute(branch, 1))
  g.setAttribute('aJitter', new THREE.BufferAttribute(jitter, 3))
  return g
}

type FadingText = THREE.Mesh & { fillOpacity: number }

// ---------------------------------------------------------------------------

export default function Beat_Upstream({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const driftRef = useRef<THREE.Group>(null)
  const skyRef = useRef<THREE.Mesh>(null)
  const stripRef = useRef<THREE.Mesh>(null)
  const branchesRef = useRef<THREE.Group>(null)
  const trunkRef = useRef<LightLineObject>(null)
  const hotRef = useRef<LightLineObject>(null)
  const flowRef = useRef<THREE.Points>(null)
  const releaseRef = useRef<THREE.Sprite>(null)
  const labelRef = useRef<FadingText>(null)

  const branchPoints = useMemo(() => BRANCH_DATA.map((b) =>
    Array.from({ length: 49 }, (_, k) => cubic(new THREE.Vector3(), b.ctrl, k / 48))), [])
  const trunkPoints = useMemo(() => Array.from({ length: 81 }, (_, k) => quad(new THREE.Vector3(), TRUNK, k / 80)), [])
  const hotPoints = useMemo(() => Array.from({ length: 41 }, (_, k) =>
    quad(new THREE.Vector3(), TRUNK, HOT_FROM + (1 - HOT_FROM) * (k / 40))), [])

  const skyMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uGrid: { value: 0 },
      uStokes: { value: 0 },
      uTime: { value: 0 },
      uGridColor: { value: hdr(PALETTE.nearWhite, 0.3) },
      uRimColor: { value: hdr(PALETTE.starGold, 0.55) },
      uI: { value: hdr(PALETTE.nearWhite, GLOW.base) },
      uQ: { value: hdr(PALETTE.starGold, GLOW.base) },
      uU: { value: hdr(PALETTE.stellarBlue, GLOW.base) },
      uV: { value: hdr(PALETTE.signal, GLOW.base) },
    },
    vertexShader: SPHERE_VERT,
    fragmentShader: SKY_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  const stripMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uSweep: { value: 0 },
      uOpacity: { value: 0 },
      uColor: { value: hdr(PALETTE.starGold, 1.1) },
      uLead: { value: hdr(PALETTE.nearWhite, GLOW.hot) },
    },
    vertexShader: SPHERE_VERT,
    fragmentShader: STRIP_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  const particleCount = quality === 'mobile' ? 100 : quality === 'low' ? 200 : 400
  const flowGeo = useDisposable(() => flowGeometry(particleCount), [particleCount])
  const flowMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uB0: { value: BRANCH_DATA.map((b) => b.ctrl[0]!.clone()) },
      uB1: { value: BRANCH_DATA.map((b) => b.ctrl[1]!.clone()) },
      uB2: { value: BRANCH_DATA.map((b) => b.ctrl[2]!.clone()) },
      uB3: { value: BRANCH_DATA.map((b) => b.ctrl[3]!.clone()) },
      uJoin: { value: BRANCH_DATA.map((b) => b.join) },
      uT0: { value: TRUNK[0].clone() },
      uT1: { value: TRUNK[1].clone() },
      uT2: { value: TRUNK[2].clone() },
      uTime: { value: 0 },
      uSize: { value: 26 },
      uMap: { value: getGlowTexture() },
      uBranchColor: { value: hdr(PALETTE.stellarBlue, 1.2) },
      uTrunkColor: { value: hdr(PALETTE.starGold, 1.3) },
      uOpacity: { value: 0 },
    },
    vertexShader: FLOW_VERT,
    fragmentShader: FLOW_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock

    // Sky: graticule on arrival, the strip sweeps through the hold, then Stokes shimmer.
    const drift = driftRef.current
    if (drift) drift.rotation.y = t * 0.03
    const sky = skyRef.current
    setUniform(sky, 'uGrid', ease(p, 0.0, 0.2))
    setUniform(sky, 'uStokes', ease(p, 0.36, 0.66))
    setUniform(sky, 'uTime', t)
    const strip = stripRef.current
    setUniform(strip, 'uSweep', ease(p, 0.08, 0.5) * 1.06)
    setUniform(strip, 'uOpacity', ease(p, 0.06, 0.14))

    // The delta: branches draw on in a staggered order, then merge into the trunk.
    const branches = branchesRef.current
    if (branches) {
      for (let i = 0; i < BRANCHES; i++) {
        const d = BRANCH_DATA[i]!.delay
        setLineReveal(branches.children[i] as LightLineObject, ease(p, d, d + 0.2))
      }
    }
    setLineReveal(trunkRef.current, ease(p, 0.3, 0.62))
    setLineReveal(hotRef.current, ease(p, 0.52, 0.72))
    setLineOpacity(hotRef.current, ramp(p, 0.52, 0.56))

    const flow = flowRef.current
    setUniform(flow, 'uTime', t)
    setUniform(flow, 'uOpacity', ease(p, 0.4, 0.62))

    const release = releaseRef.current
    if (release) {
      const on = ease(p, 0.6, 0.72)
      const breathe = 0.85 + 0.15 * Math.sin(t * 1.3)
      ;(release.material as THREE.SpriteMaterial).opacity = on * breathe
      const s = 0.5 + 0.5 * on
      release.scale.set(s, s, 1)
    }
    if (labelRef.current) labelRef.current.fillOpacity = ease(p, 0.64, 0.76) * 0.9
  })

  return (
    <group>
      {/* Celestial sphere, tilted, drifting about its pole */}
      <group position={SKY_CENTER} quaternion={SKY_TILT_QUAT}>
        <group ref={driftRef}>
          <mesh ref={skyRef} material={skyMat} frustumCulled={false}>
            <sphereGeometry args={[SKY_RADIUS, 96, 64]} />
          </mesh>
          <mesh ref={stripRef} material={stripMat} frustumCulled={false}>
            <sphereGeometry args={[SKY_RADIUS * 1.012, 160, 2, 0, Math.PI * 2, STRIP_THETA_START, STRIP_HALF * 2]} />
          </mesh>
        </group>
      </group>

      {/* Pull-request branches: a delta flowing into one trunk */}
      <group ref={branchesRef}>
        {branchPoints.map((pts, i) => (
          <LightLine key={i} points={pts} color={PALETTE.stellarBlue} intensity={GLOW.base} width={0.011} />
        ))}
      </group>
      <LightLine ref={trunkRef} points={trunkPoints} color={PALETTE.starGold} intensity={1.1} width={0.026} />
      <LightLine ref={hotRef} points={hotPoints} color={PALETTE.starGold} intensity={GLOW.hero} width={0.034} opacity={0} />
      <points ref={flowRef} geometry={flowGeo} material={flowMat} frustumCulled={false} />

      <GlowSprite ref={releaseRef} position={[TRUNK[2].x, TRUNK[2].y, TRUNK[2].z]} color={PALETTE.starGold} intensity={GLOW.hot} size={1} opacity={0} />
      <Label preserveCase ref={labelRef} position={[TRUNK[2].x + 0.05, TRUNK[2].y + 0.42, TRUNK[2].z]} size="body" color={PALETTE.starGold} intensity={1.4} opacity={0}>
        v1.0
      </Label>
    </group>
  )
}
