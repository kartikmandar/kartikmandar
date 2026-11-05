// src/components/CosmicJourney3D/scenes/SunPath.tsx
'use client'

// The Sun's life and ending (P3 in the stellar opening spec), drawn inside the
// opening's tilted frame so it shares the star's place and the planets' plane.
// The star itself (its point of light, colour and planets) is OpeningStage's,
// following the same pure schedule (sunPath); this adds what only this path has:
// the giant's churning surface, the helium flash deep in the core, and the shed
// shells that the bare core lights up as a planetary nebula.
// Always mounted, so Precompile covers it; hidden unless the Sun's path is playing.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { journeyFrame } from '../store'
import { handoffPresence } from '../openingScroll'
import { PALETTE, GLOW, hdr, setHdr } from '../art/palette'
import { getGlowTexture, NOISE_GLSL, useDisposable } from '../art/materials'
import { createSunPath, pathProgress, sunPath } from '../pathStage'
import { limitRamp } from '../art/anim'
import { readCapture } from '../capture'
import { pathForMass, starStore } from '../starChoice'
import { blackbodyRgb } from '../starLook'

const BODY_VERT = /* glsl */ `
  varying vec3 vObjectNormal;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vObjectNormal = normal;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
const BODY_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uSaturation;
  varying vec3 vObjectNormal;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float mu = max(dot(normalize(vNormal), normalize(vView)), 0.0);
    // A giant's convection cells are huge: a few dozen cover the whole star, slowly churning.
    float cells = fbm(vObjectNormal * 2.6 + vec3(0.0, uTime * 0.04, uTime * 0.025));
    float granules = 0.72 + 0.5 * smoothstep(0.35, 0.75, cells);
    // Limb darkening: the edge is cooler and dimmer than the middle.
    float limb = 0.35 + 0.65 * pow(mu, 0.6);
    vec3 col = uColor * granules * limb;
    // Tone mapping greys out a cool star's colour; push it back so a red giant reads red.
    col = mix(vec3(dot(col, vec3(0.2126, 0.7152, 0.0722))), col, uSaturation);
    gl_FragColor = vec4(max(col, 0.0), uOpacity * smoothstep(0.0, 0.08, mu));
  }
`

const NEBULA_VERT = BODY_VERT
const NEBULA_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform vec3 uDust;
  uniform vec3 uGlow;
  uniform float uIonized;
  uniform float uBright;
  uniform float uSeed;
  uniform float uTime;
  varying vec3 vObjectNormal;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float facing = abs(dot(normalize(vNormal), normalize(vView)));
    // A thin shell is brightest where the line of sight runs along it, at its rim, and faint across its face.
    // A thin shell is brightest where the line of sight runs along it: at its rim. Its face stays dark,
    // because AgX shows even small values as mid-grey, and six faces (front and back of three shells) stack up.
    float rim = 1.4 * pow(1.0 - facing, 4.5);
    float knots = fbm(vObjectNormal * 3.2 + uSeed * 7.0 + vec3(uTime * 0.01));
    float filaments = 0.35 + 0.95 * smoothstep(0.3, 0.7, knots);
    // Shed gas glows faintly with reflected starlight, then brightly once the bare core ionizes it.
    vec3 col = mix(uDust, uGlow, uIonized) * rim * filaments * uBright;
    gl_FragColor = vec4(col, 1.0);
  }
`

/** Shed shells, innermost first: oxygen glows teal-blue close to the hot core, hydrogen red further out. */
const SHELLS: { base: number; stretch: number; color: string; strength: number; seed: number }[] = [
  { base: 1.0, stretch: 1.0, color: PALETTE.signal, strength: 0.9, seed: 0.13 },
  { base: 1.3, stretch: 1.12, color: PALETTE.stellarBlue, strength: 0.4, seed: 0.51 },
  { base: 1.65, stretch: 1.28, color: PALETTE.hydrogen, strength: 0.85, seed: 0.87 },
]
/** How far the shells drift out by the end of the path, as a multiple of their starting size. */
const DRIFT = 2.2

const _color = new THREE.Color()
const _rgb = { r: 1, g: 1, b: 1 }

export function SunPath({ reducedMotion }: { reducedMotion: boolean }) {
  const state = useMemo(() => createSunPath(), [])
  const rootRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)
  const flashRef = useRef<THREE.Sprite>(null)
  const shellRefs = useRef<(THREE.Mesh | null)[]>([])
  const flashColor = useMemo(() => new THREE.Color(PALETTE.starGold), [])

  const bodyMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color() }, uOpacity: { value: 0 }, uTime: { value: 0 }, uSaturation: { value: 2.4 } },
    vertexShader: BODY_VERT,
    fragmentShader: BODY_FRAG,
    transparent: true,
  }), [])
  const shellMats = useDisposable(() => {
    const materials = SHELLS.map((shell) => new THREE.ShaderMaterial({
      uniforms: {
        uDust: { value: hdr(PALETTE.emberDeep, 0.22) },
        uGlow: { value: hdr(shell.color, shell.strength) },
        uIonized: { value: 0 },
        uBright: { value: 0 },
        uSeed: { value: shell.seed },
        uTime: { value: 0 },
      },
      vertexShader: NEBULA_VERT,
      fragmentShader: NEBULA_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }))
    return { materials, dispose: () => materials.forEach((material) => material.dispose()) }
  }, [])

  /** The helium flash as drawn: NaN until the path is on screen. */
  const flash = useRef(NaN)

  useFrame(() => {
    const f = journeyFrame
    const root = rootRef.current
    if (!root) return
    const t = pathProgress(f.opening)
    root.visible = f.warmup || (t > 0 && f.handoff < 1 && pathForMass(starStore.getState().mass) === 'sun')
    if (!root.visible) {
      flash.current = NaN
      return
    }
    const time = reducedMotion ? 0 : f.clock
    const s = sunPath(t, time, state)
    const presence = handoffPresence(f.handoff)

    const body = bodyRef.current
    if (body) {
      body.visible = s.bodyOpacity > 0.001
      body.scale.setScalar(Math.max(0.001, s.body))
      const uniforms = (body.material as THREE.ShaderMaterial).uniforms
      blackbodyRgb(s.temperature, _rgb)
      // Drawn at a modest exposure, so a red giant stays red after tone mapping.
      setHdr(uniforms.uColor!.value as THREE.Color, _color.setRGB(_rgb.r, _rgb.g, _rgb.b), 0.95)
      uniforms.uOpacity!.value = s.bodyOpacity * presence
      uniforms.uTime!.value = time
    }
    if (flashRef.current) {
      // Seen through the giant, faint: the flash happens deep inside and doesn't reach the surface.
      const material = flashRef.current.material as THREE.SpriteMaterial
      setHdr(material.color, flashColor, GLOW.hero)
      // It ramps over at least 300 ms, however fast the scroll.
      flash.current = limitRamp(flash.current, s.flash, f.warmup || readCapture().enabled ? 0 : f.dt)
      material.opacity = 0.55 * flash.current * presence
    }
    shellRefs.current.forEach((shell, i) => {
      if (!shell) return
      const spec = SHELLS[i]!
      const size = spec.base * (0.9 + DRIFT * s.expansion)
      shell.scale.set(size, size * spec.stretch, size)
      shell.visible = s.shed > 0.001
      const uniforms = (shell.material as THREE.ShaderMaterial).uniforms
      uniforms.uIonized!.value = s.ionized
      // Dim reflected light while shed, then the nebula's own glow, which fades after about ten thousand years.
      uniforms.uBright!.value = (0.35 * s.shed * (1 - s.ionized) + s.nebula) * presence
      uniforms.uTime!.value = time
    })
  })

  return (
    <group ref={rootRef} visible={false}>
      <mesh ref={bodyRef} material={bodyMat} renderOrder={4}>
        <sphereGeometry args={[1, 64, 48]} />
      </mesh>
      <sprite ref={flashRef} scale={[0.5, 0.5, 1]} renderOrder={6}>
        <spriteMaterial map={getGlowTexture()} transparent opacity={0} depthTest={false} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </sprite>
      {SHELLS.map((shell, i) => (
        <mesh key={i} ref={(mesh) => { shellRefs.current[i] = mesh }} material={shellMats.materials[i]} renderOrder={6} visible={false}>
          <icosahedronGeometry args={[1, 5]} />
        </mesh>
      ))}
    </group>
  )
}
