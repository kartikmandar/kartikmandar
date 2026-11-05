// src/components/CosmicJourney3D/scenes/FirstStarsPath.tsx
'use client'

// A first star's life and ending (P6 in the stellar opening spec), drawn in the
// opening's disk frame like the other paths, following the same pure schedule
// (firstStarsPath). A huge blue star, cut open to show its oxygen core (the same
// analytic cutaway as MassivePath and RedDwarfPath); light turning into pairs in
// the core; the core falling in; oxygen igniting all at once from the centre;
// then a debris shell running out past the camera, leaving nothing behind.
// The sparse early sky is Environment's, which reads skyDensity.
// Always mounted, so Precompile covers it; hidden unless this path is playing.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { journeyFrame } from '../store'
import { PALETTE, hdr, setHdr } from '../art/palette'
import { NOISE_GLSL, useDisposable } from '../art/materials'
import { ease } from '../art/anim'
import { createFirstStarsPath, FIRST_STAR_CORE, firstStarsPath, pathProgress } from '../pathStage'
import { pathForMass, starStore } from '../starChoice'
import { blackbodyRgb, surfaceTemperature } from '../starLook'
import { SHOCK_FRAG, SHOCK_VERT } from './MassivePath'

const BODY_VERT = /* glsl */ `
  varying vec3 vLocal;
  void main() {
    vLocal = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
// The ray is traced in the sphere's own frame. Outside the cut octant it shades
// the hot surface; inside, it colours the cut faces by radius: the envelope, the
// helium mantle and the huge oxygen core, with the pairs sparkling in the core
// and the oxygen burning front running out from its centre.
const BODY_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform vec3 uCamera;
  uniform vec3 uColor;
  uniform vec3 uEnvelope;
  uniform vec3 uMantle;
  uniform vec3 uCoreColor;
  uniform vec3 uPairColor;
  uniform vec3 uBurnColor;
  uniform float uCore;
  uniform float uMantleEdge;
  uniform float uPairs;
  uniform float uBurn;
  uniform float uOpacity;
  uniform float uCut;
  uniform float uTime;
  varying vec3 vLocal;
  bool inCut(vec3 p) { return uCut > 0.5 && p.x > 0.0 && p.y > 0.0 && p.z > 0.0; }
  void main() {
    vec3 ro = uCamera;
    vec3 rd = normalize(vLocal - uCamera);
    float b = dot(ro, rd);
    float c = dot(ro, ro) - 1.0;
    float h = b * b - c;
    if (h < 0.0) discard;
    vec3 p = ro + rd * (-b - sqrt(h));
    if (!inCut(p)) {
      float mu = max(dot(p, -rd), 0.0);
      // Small, fine granulation on a hot surface, and a darker limb.
      float cells = fbm(p * 5.0 + vec3(0.0, uTime * 0.05, uTime * 0.04));
      vec3 col = uColor * (0.88 + 0.22 * smoothstep(0.35, 0.75, cells)) * (0.45 + 0.55 * pow(mu, 0.5));
      // Tone mapping whitens a hot star's colour; push it back.
      col = mix(vec3(dot(col, vec3(0.2126, 0.7152, 0.0722))), col, 2.0);
      gl_FragColor = vec4(max(col, 0.0), uOpacity);
      return;
    }
    float tExit = 1e9;
    float face = 0.0;
    if (rd.x < 0.0) { float t = -ro.x / rd.x; if (t < tExit) { tExit = t; face = 0.85; } }
    if (rd.y < 0.0) { float t = -ro.y / rd.y; if (t < tExit) { tExit = t; face = 1.0; } }
    if (rd.z < 0.0) { float t = -ro.z / rd.z; if (t < tExit) { tExit = t; face = 0.7; } }
    vec3 q = ro + rd * tExit;
    float r = length(q);
    if (r >= 1.0) discard;
    vec3 col = r < uCore ? uCoreColor : r < uMantleEdge ? uMantle : uEnvelope;
    // A thin dark line where one layer meets the next, as in a diagram.
    float line = max(1.0 - smoothstep(0.0, 0.012, abs(r - uCore)), 1.0 - smoothstep(0.0, 0.012, abs(r - uMantleEdge)));
    col *= 1.0 - 0.7 * line;
    // Light turning into electron-positron pairs: a fine, restless sparkle through the core.
    float sparkle = smoothstep(0.55, 0.75, fbm(q * 22.0 + vec3(uTime * 0.9, -uTime * 0.7, uTime * 0.5)));
    col += uPairColor * sparkle * uPairs * (1.0 - smoothstep(uCore * 0.85, uCore, r));
    // Oxygen ignites all at once: a burning front from the centre of the core outward.
    float front = uBurn * uCore;
    col += uBurnColor * (1.0 - smoothstep(front * 0.7, front + 0.001, r)) * step(0.001, uBurn);
    gl_FragColor = vec4(col * face, uOpacity);
  }
`

const _color = new THREE.Color()
const _rgb = { r: 1, g: 1, b: 1 }
const _parentQuat = new THREE.Quaternion()
const _scale = new THREE.Vector3()
const _center = new THREE.Vector3()
const STELLAR_BLUE = new THREE.Color(PALETTE.stellarBlue)
/** The helium mantle's outer edge, as a fraction of the star's radius. */
const MANTLE_EDGE = 0.66

export function FirstStarsPath({ reducedMotion }: { reducedMotion: boolean }) {
  const state = useMemo(() => createFirstStarsPath(), [])
  const rootRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)
  const shellRef = useRef<THREE.Mesh>(null)

  const bodyMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uCamera: { value: new THREE.Vector3() },
      uColor: { value: new THREE.Color() },
      uEnvelope: { value: hdr(PALETTE.hydrogen, 0.3) },
      uMantle: { value: hdr(PALETTE.starGold, 0.42) },
      uCoreColor: { value: hdr(PALETTE.stellarBlue, 0.5) },
      uPairColor: { value: hdr(PALETTE.nearWhite, 1.1) },
      uBurnColor: { value: hdr(PALETTE.starGold, 1.6) },
      uCore: { value: FIRST_STAR_CORE },
      uMantleEdge: { value: MANTLE_EDGE },
      uPairs: { value: 0 },
      uBurn: { value: 0 },
      uOpacity: { value: 1 },
      uCut: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: BODY_VERT,
    fragmentShader: BODY_FRAG,
    transparent: true,
  }), [])
  const shellMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color() }, uBright: { value: 0 }, uTime: { value: 0 } },
    vertexShader: SHOCK_VERT,
    fragmentShader: SHOCK_FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  }), [])
  // Hot gold as it breaks out, cooling to rose as the oxygen-rich debris spreads.
  const shellHot = useMemo(() => new THREE.Color(PALETTE.starGold), [])
  const shellCool = useMemo(() => new THREE.Color(PALETTE.hydrogen), [])

  useFrame(({ camera }) => {
    const f = journeyFrame
    const root = rootRef.current
    if (!root) return
    const t = pathProgress(f.opening)
    const mass = starStore.getState().mass
    root.visible = f.warmup || (t > 0 && f.handoff < 1 && pathForMass(mass) === 'first-stars')
    if (!root.visible) return
    const time = reducedMotion ? 0 : f.clock
    const s = firstStarsPath(t, time, state, surfaceTemperature(mass))
    const presence = 1 - ease(f.handoff, 0.2, 0.85)

    const body = bodyRef.current
    if (body) {
      body.visible = s.bodyOpacity > 0.001 && s.body > 0.002
      body.scale.setScalar(Math.max(0.001, s.body))
      const uniforms = (body.material as THREE.ShaderMaterial).uniforms
      body.updateWorldMatrix(true, false)
      body.worldToLocal((uniforms.uCamera!.value as THREE.Vector3).copy(camera.position))
      // A blackbody this hot is nearly white, and tone mapping whitens it further: lean it toward the palette's blue.
      blackbodyRgb(s.temperature, _rgb)
      _color.setRGB(_rgb.r, _rgb.g, _rgb.b).lerp(STELLAR_BLUE, 0.7)
      // Bright enough to bloom softly: a star, not a moon.
      setHdr(uniforms.uColor!.value as THREE.Color, _color, 1.25)
      // The core falls in once the pressure drops; the mantle sags after it.
      uniforms.uCore!.value = FIRST_STAR_CORE * (1 - 0.3 * s.coreFall)
      uniforms.uMantleEdge!.value = MANTLE_EDGE * (1 - 0.1 * s.coreFall)
      uniforms.uPairs!.value = s.pairs
      uniforms.uBurn!.value = s.ignite
      uniforms.uCut!.value = s.cutaway > 0.5 ? 1 : 0
      uniforms.uOpacity!.value = s.bodyOpacity * presence
      uniforms.uTime!.value = time
    }
    const shell = shellRef.current
    if (shell && shell.parent) {
      shell.visible = s.blast > 0 && s.blastGlow > 0.001
      // Face the camera: undo the parents' rotation, then take the camera's.
      shell.parent.getWorldQuaternion(_parentQuat)
      shell.quaternion.copy(_parentQuat.invert()).multiply(camera.quaternion)
      shell.scale.setScalar(Math.max(0.001, 2 * s.blast))
      shell.getWorldScale(_scale)
      shell.getWorldPosition(_center)
      // It sweeps past the camera: fade it as it gets there, rather than fill the screen.
      const nearCamera = 1 - ease((_scale.x * 0.5) / camera.position.distanceTo(_center), 0.55, 0.95)
      const uniforms = (shell.material as THREE.ShaderMaterial).uniforms
      _color.copy(shellHot).lerp(shellCool, Math.min(1, s.blast / 10))
      setHdr(uniforms.uColor!.value as THREE.Color, _color, 1.0)
      uniforms.uBright!.value = s.blastGlow * nearCamera * presence
      uniforms.uTime!.value = time
    }
  })

  return (
    <group ref={rootRef} visible={false}>
      <mesh ref={bodyRef} material={bodyMat} renderOrder={4} visible={false}>
        <sphereGeometry args={[1, 64, 48]} />
      </mesh>
      <mesh ref={shellRef} material={shellMat} renderOrder={6} visible={false}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </group>
  )
}
