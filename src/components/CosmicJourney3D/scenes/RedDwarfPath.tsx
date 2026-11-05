// src/components/CosmicJourney3D/scenes/RedDwarfPath.tsx
'use client'

// A red dwarf's life and predicted ending (P2 in the stellar opening spec),
// drawn in the opening's disk frame like the other paths, following the same
// pure schedule (redDwarfPath). The star's surface is one sphere, cut open
// analytically for line 13 to show convection churning all the way to the
// centre (MassivePath uses the same trick for its shells). For line 15 its
// predicted future, a blue dwarf and then a helium white dwarf, is drawn
// ghosted, with a dashed outline: no red dwarf has died yet.
// Always mounted, so Precompile covers it; hidden unless this path is playing.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { journeyFrame } from '../store'
import { PALETTE, hdr, setHdr } from '../art/palette'
import { NOISE_GLSL, useDisposable } from '../art/materials'
import { ease } from '../art/anim'
import { createRedDwarfPath, pathProgress, redDwarfPath } from '../pathStage'
import { pathForMass, starStore } from '../starChoice'
import { blackbodyRgb, surfaceTemperature } from '../starLook'

const BODY_VERT = /* glsl */ `
  varying vec3 vLocal;
  void main() {
    vLocal = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
// The ray is traced in the sphere's own frame. Outside the cut octant it shades
// the mottled surface; inside, it finds where the ray leaves the octant through
// one of its flat faces and draws convection there: rising hot cells and sinking
// cool lanes, as large as the star itself, moving all the way down to the centre.
const BODY_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform vec3 uCamera;
  uniform vec3 uColor;
  uniform vec3 uHot;
  uniform vec3 uCool;
  uniform float uOpacity;
  uniform float uCut;
  uniform float uGhost;
  uniform float uTime;
  varying vec3 vLocal;
  bool inCut(vec3 p) { return uCut > 0.5 && p.x > 0.0 && p.y > 0.0 && p.z > 0.0; }
  vec3 ghosted(vec3 col) {
    // A prediction, not an observation: drawn faded and partly greyed.
    return mix(col, vec3(dot(col, vec3(0.2126, 0.7152, 0.0722))), 0.45 * uGhost);
  }
  void main() {
    vec3 ro = uCamera;
    vec3 rd = normalize(vLocal - uCamera);
    float b = dot(ro, rd);
    float c = dot(ro, ro) - 1.0;
    float h = b * b - c;
    if (h < 0.0) discard;
    vec3 p = ro + rd * (-b - sqrt(h));
    float alpha = uOpacity * (1.0 - 0.45 * uGhost);
    if (!inCut(p)) {
      float mu = max(dot(p, -rd), 0.0);
      // Mottled with convection cells breaking the surface, and a darker limb.
      float cells = fbm(p * 3.4 + vec3(0.0, uTime * 0.05, uTime * 0.03));
      vec3 col = uColor * (0.7 + 0.55 * smoothstep(0.35, 0.75, cells)) * (0.35 + 0.65 * pow(mu, 0.6));
      // Tone mapping greys out a cool star's colour; push it back.
      col = mix(vec3(dot(col, vec3(0.2126, 0.7152, 0.0722))), col, 2.4);
      gl_FragColor = vec4(ghosted(max(col, 0.0)), alpha);
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
    // Convection loops: a flow pattern that drifts along each loop over time.
    vec3 flow = q * 2.6 + vec3(sin(r * 6.0 - uTime * 0.6), cos(r * 5.0 - uTime * 0.5), uTime * 0.12);
    float churn = smoothstep(0.3, 0.75, fbm(flow));
    // Hotter toward the centre; the churning reaches it (unlike the Sun, whose inner part is still).
    vec3 col = mix(uCool, uHot, churn) * (0.55 + 0.45 * (1.0 - r));
    gl_FragColor = vec4(ghosted(col * face), alpha);
  }
`

function dashedCircle(segments: number): THREE.BufferGeometry {
  const points: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0))
  }
  return new THREE.BufferGeometry().setFromPoints(points)
}

const _color = new THREE.Color()
const _rgb = { r: 1, g: 1, b: 1 }
const _parentQuat = new THREE.Quaternion()
const EMBER_DEEP = new THREE.Color(PALETTE.emberDeep)

export function RedDwarfPath({ reducedMotion }: { reducedMotion: boolean }) {
  const state = useMemo(() => createRedDwarfPath(), [])
  const rootRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)
  const outlineRef = useRef<THREE.LineLoop>(null)

  const bodyMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uCamera: { value: new THREE.Vector3() },
      uColor: { value: new THREE.Color() },
      uHot: { value: hdr(PALETTE.ember, 0.8) },
      uCool: { value: hdr(PALETTE.emberDeep, 0.25) },
      uOpacity: { value: 1 },
      uCut: { value: 0 },
      uGhost: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: BODY_VERT,
    fragmentShader: BODY_FRAG,
    transparent: true,
  }), [])
  const outlineGeo = useDisposable(() => {
    const geometry = dashedCircle(96)
    // A Line needs these for LineDashedMaterial's dashes.
    new THREE.Line(geometry).computeLineDistances()
    return geometry
  }, [])
  const outlineMat = useDisposable(() => new THREE.LineDashedMaterial({
    color: hdr(PALETTE.nearWhite, 0.55),
    dashSize: 0.12,
    gapSize: 0.1,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    fog: false,
  }), [])

  useFrame(({ camera }) => {
    const f = journeyFrame
    const root = rootRef.current
    if (!root) return
    const t = pathProgress(f.opening)
    const mass = starStore.getState().mass
    root.visible = f.warmup || (t > 0 && f.handoff < 1 && pathForMass(mass) === 'red-dwarf')
    if (!root.visible) return
    const time = reducedMotion ? 0 : f.clock
    const s = redDwarfPath(t, time, state, surfaceTemperature(mass))
    const presence = 1 - ease(f.handoff, 0.2, 0.85)

    const body = bodyRef.current
    if (body) {
      body.visible = s.bodyOpacity > 0.001
      body.scale.setScalar(Math.max(0.001, s.body))
      const uniforms = (body.material as THREE.ShaderMaterial).uniforms
      body.updateWorldMatrix(true, false)
      body.worldToLocal((uniforms.uCamera!.value as THREE.Vector3).copy(camera.position))
      blackbodyRgb(s.temperature, _rgb)
      // A 3,100 K blackbody is orange, and AgX pushes it toward gold. Lean it toward deep ember, as red
      // dwarfs are conventionally shown, except for the hotter predicted future. Drawn dim for the same reason.
      _color.setRGB(_rgb.r, _rgb.g, _rgb.b).lerp(EMBER_DEEP, 0.6 * (1 - s.ghost))
      setHdr(uniforms.uColor!.value as THREE.Color, _color, 0.6)
      uniforms.uCut!.value = s.cutaway > 0.5 ? 1 : 0
      uniforms.uGhost!.value = s.ghost
      uniforms.uOpacity!.value = s.bodyOpacity * presence
      uniforms.uTime!.value = time
    }
    const outline = outlineRef.current
    if (outline && outline.parent) {
      outline.visible = s.ghost > 0.001
      // Face the camera: undo the parents' rotation, then take the camera's.
      outline.parent.getWorldQuaternion(_parentQuat)
      outline.quaternion.copy(_parentQuat.invert()).multiply(camera.quaternion)
      // Never smaller than a readable ring, even round a tiny white dwarf.
      outline.scale.setScalar(Math.max(0.42, s.body * 1.35 + 0.04))
      ;(outline.material as THREE.LineDashedMaterial).opacity = s.ghost * presence
    }
  })

  return (
    <group ref={rootRef} visible={false}>
      <mesh ref={bodyRef} material={bodyMat} renderOrder={4} visible={false}>
        <sphereGeometry args={[1, 64, 48]} />
      </mesh>
      {/* The dashed outline marks the prediction: no red dwarf has reached this yet. */}
      <lineLoop ref={outlineRef} geometry={outlineGeo} material={outlineMat} renderOrder={6} visible={false} />
    </group>
  )
}
