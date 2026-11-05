// src/components/CosmicJourney3D/scenes/BrownDwarfPath.tsx
'use client'

// A brown dwarf's life (P1 in the stellar opening spec), drawn in the opening's
// disk frame like the other paths, following the same pure schedule
// (brownDwarfPath). The cheapest path: one small sphere with banded clouds, a
// faint deuterium glow from deep inside, then a long cooling to nearly black.
// Always mounted, so Precompile covers it; hidden unless this path is playing.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { journeyFrame } from '../store'
import { handoffPresence } from '../openingScroll'
import { PALETTE, setHdr } from '../art/palette'
import { NOISE_GLSL, useDisposable } from '../art/materials'
import { brownDwarfPath, createBrownDwarfPath, pathProgress } from '../pathStage'
import { pathForMass, starStore } from '../starChoice'
import { blackbodyRgb } from '../starLook'

const BODY_VERT = /* glsl */ `
  varying vec3 vLocal;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vLocal = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
// Fast-spinning, so its clouds lie in bands along its equator, like Jupiter's.
// Its own heat lights it from inside: a darker limb, and a faint glow from the
// core while deuterium burns, which fades as it cools.
const BODY_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform vec3 uColor;
  uniform vec3 uCore;
  uniform float uDeuterium;
  uniform float uOpacity;
  uniform float uTime;
  varying vec3 vLocal;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float mu = max(dot(normalize(vNormal), normalize(vView)), 0.0);
    // Turn the pattern about the spin axis (the disk's normal), faster near the equator.
    float lat = vLocal.y;
    float spin = uTime * (0.06 + 0.04 * (1.0 - abs(lat)));
    float c = cos(spin), s = sin(spin);
    vec3 q = vec3(c * vLocal.x - s * vLocal.z, lat, s * vLocal.x + c * vLocal.z);
    float bands = 0.5 + 0.5 * sin(lat * 13.0 + 2.2 * fbm(q * 2.4));
    float storms = fbm(q * vec3(5.0, 14.0, 5.0));
    float cloud = mix(bands, storms, 0.35);
    // Muted bands: its own heat, not sunlight, lights the clouds, so they show less contrast than a planet's.
    vec3 col = uColor * (0.78 + 0.32 * smoothstep(0.25, 0.85, cloud)) * (0.3 + 0.7 * pow(mu, 0.7));
    // Deuterium burning deep inside: a faint warmth through the middle of the disk, never a flash.
    col += uCore * uDeuterium * pow(mu, 2.0) * (0.85 + 0.15 * sin(uTime * 0.8));
    // Tone mapping greys out a dim, cool colour; push it back.
    col = mix(vec3(dot(col, vec3(0.2126, 0.7152, 0.0722))), col, 1.8);
    gl_FragColor = vec4(max(col, 0.0), uOpacity);
  }
`

/**
 * Brown dwarfs look magenta rather than brown: sodium and potassium in their
 * air absorb the yellow and green. The cooler it gets, the more it leans that way.
 */
const MAGENTA = new THREE.Color('#9e2f6e')
const _color = new THREE.Color()
const _core = new THREE.Color(PALETTE.hydrogen)
const _rgb = { r: 1, g: 1, b: 1 }

export function BrownDwarfPath({ reducedMotion }: { reducedMotion: boolean }) {
  const state = useMemo(() => createBrownDwarfPath(), [])
  const rootRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)

  const bodyMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color() },
      uCore: { value: new THREE.Color() },
      uDeuterium: { value: 0 },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: BODY_VERT,
    fragmentShader: BODY_FRAG,
    transparent: true,
  }), [])

  useFrame(() => {
    const f = journeyFrame
    const root = rootRef.current
    if (!root) return
    const t = pathProgress(f.opening)
    root.visible = f.warmup || (t > 0 && f.handoff < 1 && pathForMass(starStore.getState().mass) === 'brown-dwarf')
    if (!root.visible) return
    const time = reducedMotion ? 0 : f.clock
    const s = brownDwarfPath(t, time, state)
    const presence = handoffPresence(f.handoff)

    const body = bodyRef.current
    if (!body) return
    body.visible = s.bodyOpacity > 0.001
    body.scale.setScalar(s.body)
    const uniforms = (body.material as THREE.ShaderMaterial).uniforms
    blackbodyRgb(s.temperature, _rgb)
    _color.setRGB(_rgb.r, _rgb.g, _rgb.b).lerp(MAGENTA, 0.6 + 0.3 * s.cooling)
    // Dim from the start, and nearly black by the end: its light moves into the infrared as it cools.
    setHdr(uniforms.uColor!.value as THREE.Color, _color, 0.42 * (1 - 0.85 * s.cooling))
    setHdr(uniforms.uCore!.value as THREE.Color, _core, 0.3)
    uniforms.uDeuterium!.value = s.deuterium
    uniforms.uOpacity!.value = s.bodyOpacity * presence
    uniforms.uTime!.value = time
  })

  return (
    <group ref={rootRef} visible={false}>
      <mesh ref={bodyRef} material={bodyMat} renderOrder={4} visible={false}>
        <sphereGeometry args={[1, 64, 48]} />
      </mesh>
    </group>
  )
}
