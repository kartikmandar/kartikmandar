// src/components/CosmicJourney3D/scenes/MassivePath.tsx
'use client'

// A massive star's life and ending (P4 in the stellar opening spec), drawn in
// the opening's disk frame like SunPath. The star's point of light is
// OpeningStage's, following the same pure schedule (massivePath); this adds
// the red supergiant, cut open to show its nested burning shells out to iron,
// the iron core falling in, the stalled shock and the neutrinos that revive it,
// the supernova's shock running out past the camera, and the pulsar's beams.
// Always mounted, so Precompile covers it; hidden unless this path is playing.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { journeyFrame } from '../store'
import { handoffPresence } from '../openingScroll'
import { PALETTE, GLOW, hdr, setHdr } from '../art/palette'
import { NOISE_GLSL, useDisposable } from '../art/materials'
import { GlowSprite } from '../art/GlowSprite'
import { ease, limitRamp } from '../art/anim'
import { readCapture } from '../capture'
import { createMassivePath, massivePath, pathProgress, SUPERGIANT_KELVIN } from '../pathStage'
import { pathForMass, starStore } from '../starChoice'
import { blackbodyRgb, surfaceTemperature } from '../starLook'

const LAYER_COUNT = 7

const CUTAWAY_VERT = /* glsl */ `
  varying vec3 vLocal;
  void main() {
    vLocal = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
// One unit sphere, cut open analytically: each pixel's ray is traced in the
// sphere's own frame. Outside the cut octant it shades the surface; inside, it
// finds where the ray leaves the octant through one of its three flat faces and
// colours that point by the shell its radius falls in, as a textbook cutaway.
const CUTAWAY_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform vec3 uCamera;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uCut;
  uniform float uTime;
  uniform float uShock;
  uniform float uShockGlow;
  uniform float uNeutrinos;
  uniform vec3 uShockColor;
  uniform vec3 uNeutrinoColor;
  uniform float uRadii[${LAYER_COUNT}];
  uniform vec3 uColors[${LAYER_COUNT}];
  varying vec3 vLocal;
  bool inCut(vec3 p) { return uCut > 0.5 && p.x > 0.0 && p.y > 0.0 && p.z > 0.0; }
  vec3 shellColor(float r) {
    vec3 col = uColors[0];
    float edge = 1.0;
    for (int i = 1; i < ${LAYER_COUNT}; i++) {
      if (r < uRadii[i]) { col = uColors[i]; edge = uRadii[i]; }
    }
    // A thin dark line where one shell meets the next, as in a diagram.
    float line = 0.0;
    for (int i = 1; i < ${LAYER_COUNT}; i++) line = max(line, 1.0 - smoothstep(0.0, 0.012, abs(r - uRadii[i])) * step(0.001, uRadii[i]));
    col *= 1.0 - 0.7 * line;
    // The bounce shock, stalled just outside the collapsed core, and the neutrinos heating it from inside.
    float shock = (1.0 - smoothstep(0.0, 0.025, abs(r - uShock))) * step(0.001, uShock);
    col += uShockColor * shock * uShockGlow + uNeutrinoColor * (1.0 - smoothstep(0.0, uShock + 0.001, r)) * uNeutrinos;
    return col;
  }
  void main() {
    vec3 ro = uCamera;
    vec3 rd = normalize(vLocal - uCamera);
    // Entry into the unit sphere.
    float b = dot(ro, rd);
    float c = dot(ro, ro) - 1.0;
    float h = b * b - c;
    if (h < 0.0) discard;
    float t0 = -b - sqrt(h);
    vec3 p = ro + rd * t0;
    if (!inCut(p)) {
      float mu = max(dot(p, -rd), 0.0);
      // A supergiant's few huge convection cells, and a darker limb.
      float cells = fbm(p * 2.2 + vec3(0.0, uTime * 0.03, uTime * 0.02));
      vec3 col = uColor * (0.72 + 0.5 * smoothstep(0.35, 0.75, cells)) * (0.35 + 0.65 * pow(mu, 0.6));
      // Tone mapping greys out a cool star's colour; push it back.
      col = mix(vec3(dot(col, vec3(0.2126, 0.7152, 0.0722))), col, 2.4);
      gl_FragColor = vec4(max(col, 0.0), uOpacity);
      return;
    }
    // Inside the cut: leave the octant through the first of its faces x = 0, y = 0 or z = 0.
    float tExit = 1e9;
    float face = 0.0;
    if (rd.x < 0.0) { float t = -ro.x / rd.x; if (t < tExit) { tExit = t; face = 0.85; } }
    if (rd.y < 0.0) { float t = -ro.y / rd.y; if (t < tExit) { tExit = t; face = 1.0; } }
    if (rd.z < 0.0) { float t = -ro.z / rd.z; if (t < tExit) { tExit = t; face = 0.7; } }
    vec3 q = ro + rd * tExit;
    float r = length(q);
    if (r >= 1.0) discard;
    gl_FragColor = vec4(shellColor(r) * face, uOpacity);
  }
`

/** Burning shells inside the supergiant, outermost first, as fractions of its radius. Not to scale: the real core is far smaller. */
// LAYER_COUNT above must match.
const LAYERS: { fraction: number; color: string; strength: number }[] = [
  { fraction: 1, color: PALETTE.hydrogen, strength: 0.32 }, // hydrogen envelope
  { fraction: 0.44, color: PALETTE.starGold, strength: 0.45 }, // helium
  { fraction: 0.32, color: PALETTE.ember, strength: 0.5 }, // carbon
  { fraction: 0.23, color: PALETTE.emberDeep, strength: 0.6 }, // neon
  { fraction: 0.16, color: PALETTE.stellarBlue, strength: 0.55 }, // oxygen
  { fraction: 0.1, color: PALETTE.signal, strength: 0.6 }, // silicon
  { fraction: 0.055, color: PALETTE.nearWhite, strength: 0.45 }, // iron
]
const IRON = LAYERS.length - 1
const SILICON = LAYERS.length - 2

// The supernova's shock, drawn as a camera-facing disc: a thin shell seen from
// outside is a ring, brightest at its limb, with knots of debris round it.
export const SHOCK_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
export const SHOCK_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform vec3 uColor;
  uniform float uBright;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv * 2.0 - 1.0;
    float d = length(c);
    if (d > 1.0) discard;
    // A thin shell's light piles up toward its limb.
    float limb = exp(-pow((d - 0.95) / 0.04, 2.0)) + 0.05 * smoothstep(0.6, 0.97, d);
    float angle = atan(c.y, c.x);
    float knots = fbm(vec3(cos(angle) * 3.0, sin(angle) * 3.0, d * 3.0 + uTime * 0.02));
    float filaments = 0.35 + smoothstep(0.32, 0.72, knots);
    gl_FragColor = vec4(uColor * limb * filaments * uBright, 1.0);
  }
`

const BEAM_LENGTH = 6
/** The beams leave along the magnetic axis, tilted from the spin axis, so they sweep round as it spins. */
const MAGNETIC_TILT = 0.6

const BEAM_VERT = /* glsl */ `
  varying float vAlong;
  varying float vEdge;
  void main() {
    vAlong = clamp(position.y / ${BEAM_LENGTH.toFixed(1)}, 0.0, 1.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normal);
    vEdge = abs(dot(n, normalize(-mv.xyz)));
    gl_Position = projectionMatrix * mv;
  }
`
const BEAM_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uBright;
  varying float vAlong;
  varying float vEdge;
  void main() {
    // Brightest along the axis and near the star, fading outward.
    float core = pow(vEdge, 2.0);
    gl_FragColor = vec4(uColor * core * pow(1.0 - vAlong, 1.6) * uBright, 1.0);
  }
`
function beamGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.CylinderGeometry(0.015, 0.26, BEAM_LENGTH, 32, 1, true)
  geometry.translate(0, BEAM_LENGTH / 2, 0)
  return geometry
}

const _color = new THREE.Color()
const _rgb = { r: 1, g: 1, b: 1 }
const _parentQuat = new THREE.Quaternion()
const _scale = new THREE.Vector3()
const _center = new THREE.Vector3()

export function MassivePath({ reducedMotion }: { reducedMotion: boolean }) {
  const state = useMemo(() => createMassivePath(), [])
  const rootRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)
  const shockRef = useRef<THREE.Mesh>(null)
  const neutrinoRef = useRef<THREE.Sprite>(null)
  const spinRef = useRef<THREE.Group>(null)
  const beamRef = useRef<THREE.Mesh>(null)

  const bodyMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uCamera: { value: new THREE.Vector3() },
      uColor: { value: new THREE.Color() },
      uOpacity: { value: 1 },
      uCut: { value: 0 },
      uTime: { value: 0 },
      uShock: { value: 0 },
      uShockGlow: { value: 0 },
      uNeutrinos: { value: 0 },
      uShockColor: { value: hdr(PALETTE.starGold, 1.2) },
      uNeutrinoColor: { value: hdr(PALETTE.signal, 0.35) },
      uRadii: { value: LAYERS.map((layer) => layer.fraction) },
      uColors: { value: LAYERS.map((layer) => hdr(layer.color, layer.strength)) },
    },
    vertexShader: CUTAWAY_VERT,
    fragmentShader: CUTAWAY_FRAG,
    transparent: true,
  }), [])
  const shockMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color() }, uBright: { value: 0 }, uTime: { value: 0 } },
    vertexShader: SHOCK_VERT,
    fragmentShader: SHOCK_FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  }), [])
  const beamGeo = useDisposable(() => beamGeometry(), [])
  const beamMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: { uColor: { value: hdr(PALETTE.stellarBlue, 0.6) }, uBright: { value: 0 } },
    vertexShader: BEAM_VERT,
    fragmentShader: BEAM_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  }), [])
  const shockHot = useMemo(() => new THREE.Color(PALETTE.starGold), [])
  const shockCool = useMemo(() => new THREE.Color(PALETTE.ember), [])

  /** The shock's glow as drawn: NaN until the path is on screen. */
  const shockGlow = useRef(NaN)

  useFrame(({ camera }) => {
    const f = journeyFrame
    const root = rootRef.current
    if (!root) return
    const t = pathProgress(f.opening)
    const mass = starStore.getState().mass
    root.visible = f.warmup || (t > 0 && f.handoff < 1 && pathForMass(mass) === 'massive')
    if (!root.visible) {
      shockGlow.current = NaN
      return
    }
    const time = reducedMotion ? 0 : f.clock
    const s = massivePath(t, time, state, surfaceTemperature(mass))
    const presence = handoffPresence(f.handoff)
    // The explosion's light ramps over at least 300 ms, however fast the scroll.
    const glow = shockGlow.current = limitRamp(shockGlow.current, s.shockGlow, f.warmup || readCapture().enabled ? 0 : f.dt)

    const body = bodyRef.current
    if (body) {
      body.visible = s.bodyOpacity > 0.001 && s.body > 0.002
      body.scale.setScalar(Math.max(0.001, s.body))
      const uniforms = (body.material as THREE.ShaderMaterial).uniforms
      // The ray is traced in the sphere's own frame: hand it the camera there.
      body.updateWorldMatrix(true, false)
      body.worldToLocal((uniforms.uCamera!.value as THREE.Vector3).copy(camera.position))
      const radii = uniforms.uRadii!.value as number[]
      LAYERS.forEach((layer, i) => {
        if (i === 0) return
        // Heavier elements burn later, deeper in: each shell appears in turn, the iron core last.
        let radius = layer.fraction * ease(s.layers, (i - 1) / IRON, i / IRON)
        if (i === IRON) radius *= 1 - s.collapse
        if (i === SILICON) radius *= 1 - 0.35 * s.collapse
        radii[i] = radius
      })
      uniforms.uCut!.value = s.cutaway > 0.5 ? 1 : 0
      uniforms.uOpacity!.value = s.bodyOpacity * presence
      uniforms.uTime!.value = time
      // Inside the star the shock shows on the cut faces; once it is outside, the shock shell takes over.
      uniforms.uShock!.value = s.shock < s.body ? s.shock / Math.max(0.001, s.body) : 0
      uniforms.uShockGlow!.value = glow
      uniforms.uNeutrinos!.value = s.neutrinos
      // The envelope keeps its colour until the shock reaches it.
      blackbodyRgb(SUPERGIANT_KELVIN, _rgb)
      setHdr(uniforms.uColor!.value as THREE.Color, _color.setRGB(_rgb.r, _rgb.g, _rgb.b), 0.95)
    }
    const shock = shockRef.current
    // Only once it is outside the star: inside, the cut faces show it.
    if (shock && shock.parent) {
      shock.visible = s.shock > s.body * 0.9 && glow > 0.001
      // Face the camera: undo the parents' rotation, then take the camera's.
      shock.parent.getWorldQuaternion(_parentQuat)
      shock.quaternion.copy(_parentQuat.invert()).multiply(camera.quaternion)
      shock.scale.setScalar(Math.max(0.001, 2 * s.shock))
      shock.getWorldScale(_scale)
      const worldRadius = _scale.x * 0.5
      shock.getWorldPosition(_center)
      // It sweeps past the camera: fade it as it gets there, rather than fill the screen.
      const nearCamera = 1 - ease(worldRadius / camera.position.distanceTo(_center), 0.55, 0.95)
      const uniforms = (shock.material as THREE.ShaderMaterial).uniforms
      // Hot as it breaks out, cooling to ember as it spreads.
      _color.copy(shockHot).lerp(shockCool, Math.min(1, s.shock / 10))
      setHdr(uniforms.uColor!.value as THREE.Color, _color, 0.9)
      uniforms.uBright!.value = glow * nearCamera * presence
      uniforms.uTime!.value = time
    }
    if (neutrinoRef.current) {
      ;(neutrinoRef.current.material as THREE.SpriteMaterial).opacity = 0.7 * s.neutrinos * presence
    }
    if (spinRef.current) {
      spinRef.current.visible = s.pulsar > 0.001
      spinRef.current.rotation.y = time * 1.4
    }
    // Both beams share one material.
    if (beamRef.current) (beamRef.current.material as THREE.ShaderMaterial).uniforms.uBright!.value = s.pulsar * presence
  })

  return (
    <group ref={rootRef} visible={false}>
      <mesh ref={bodyRef} material={bodyMat} renderOrder={4} visible={false}>
        <sphereGeometry args={[1, 64, 48]} />
      </mesh>
      <mesh ref={shockRef} material={shockMat} renderOrder={6} visible={false}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      {/* Neutrinos stream out of the new neutron star, heating the stalled shock from behind. */}
      <GlowSprite ref={neutrinoRef} color={PALETTE.signal} intensity={GLOW.base} size={1.2} opacity={0} />
      <group ref={spinRef} visible={false}>
        <group rotation={[0, 0, MAGNETIC_TILT]}>
          {[0, Math.PI].map((angle) => (
            <mesh key={angle} ref={angle === 0 ? beamRef : undefined} geometry={beamGeo} material={beamMat} rotation={[0, 0, angle]} renderOrder={6} />
          ))}
        </group>
      </group>
    </group>
  )
}
