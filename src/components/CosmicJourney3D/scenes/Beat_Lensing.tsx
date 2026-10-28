// src/components/CosmicJourney3D/scenes/Beat_Lensing.tsx
'use client'

// Beat 17 · GSoC 2025: ML for Science (Act III, ignition). The interactive beat.
// A field of faint background galaxies is lensed, live in a shader, by a point
// mass (thin-lens deflection beta = theta - thetaE^2 (theta - L) / |theta - L|^2).
// As the mass switches on, the bright source behind it smears into an Einstein
// ring with one bright arc. On fine-pointer devices the lens follows the cursor
// (damped, within bounds); otherwise it drifts slowly. A cutout reticle rides
// with the lens, and Rubin-style multi-band cutout tiles peel off it, pass
// through two glowing gates and feed a neural-net lattice whose activation wave
// ends on one gold output node.

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr, setHdr } from '../art/palette'
import { getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { INSTANCED_VERTEX_GLSL, NOISE_GLSL } from '../art/glsl'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, seeded } from '../art/anim'

// Lens plane (world units == plane units, so the shader works in scene scale).
const LENS_PLANE = new THREE.Vector3(-1.25, 1.35, -2.2)
const PLANE_SIZE = 4.4
const THETA_E = 0.62
// Bright background source, in plane coordinates, and where the lens rests.
const SOURCE = new THREE.Vector2(0.02, 0.06)
const LENS_REST = new THREE.Vector2(0.1, -0.02)
// The lens may be dragged within this radius of the plane centre.
const LENS_BOUND = 1.1
const FROZEN_T = 9.0

// Cutout flow: reticle on the lens, two gates, then the lattice input.
const CUTOUTS = 6
const BANDS = 3
const FLOW = 0.07
const GATE_A = new THREE.Vector3(1.3, 1.6, -1.9)
const GATE_B = new THREE.Vector3(1.88, 1.45, -1.9)
const GATE_SIZE = 0.62
const LAYERS = [5, 6, 4, 2] as const
const LAYER_X = [2.48, 3.08, 3.66, 4.2] as const
const LATTICE_Y = 1.4
const LATTICE_Z = -1.9
const NODE_SPACING = 0.42
const LATTICE_IN = new THREE.Vector3(LAYER_X[0] - 0.05, LATTICE_Y, LATTICE_Z)

const PLANE_VERT = /* glsl */ `
  varying vec2 vPos;
  void main() {
    vPos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Thin-lens point mass over a procedural source plane.
const LENS_FRAG = /* glsl */ `
  ${NOISE_GLSL}
  uniform vec2 uLens;
  uniform vec2 uSource;
  uniform float uThetaE;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uSrcColor;
  uniform vec3 uArcColor;
  uniform vec3 uFieldA;
  uniform vec3 uFieldB;
  uniform vec3 uLensColor;
  varying vec2 vPos;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  // Sparse faint galaxies: one small elliptical blob in some cells of a grid.
  vec3 field(vec2 b) {
    vec2 g = b * 2.4;
    vec2 cell = floor(g);
    vec2 f = fract(g) - 0.5;
    float h = hash12(cell);
    if (h < 0.42) return vec3(0.0);
    vec2 off = vec2(hash12(cell + 7.1), hash12(cell + 3.7)) - 0.5;
    float ang = hash12(cell + 1.3) * 6.2831;
    vec2 q = f - off * 0.5;
    q = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * q;
    q *= vec2(1.0, 1.6 + 1.4 * hash12(cell + 9.9));
    float size = 0.05 + 0.07 * hash12(cell + 5.5);
    float blob = exp(-dot(q, q) / (size * size));
    return mix(uFieldA, uFieldB, hash12(cell + 2.2)) * blob * (0.35 + 0.65 * h);
  }

  void main() {
    vec2 th = vPos;
    vec2 d = th - uLens;
    float r2 = max(dot(d, d), 1e-4);
    // point-mass deflection: alpha = thetaE^2 * d / |d|^2
    vec2 beta = th - uThetaE * uThetaE * d / r2;

    // the bright source: a small, knotty spiral, slowly turning
    vec2 q = beta - uSource;
    float a = uTime * 0.03;
    q = mat2(cos(a), -sin(a), sin(a), cos(a)) * q;
    vec2 qe = q * vec2(1.0, 1.45);
    float rad = length(qe);
    float spiral = 0.6 + 0.4 * sin(atan(qe.y, qe.x) * 2.0 - log(rad + 0.02) * 4.0);
    float knots = fbm(vec3(q * 14.0, 0.7));
    float src = exp(-rad * rad / 0.022) * (0.55 + 0.55 * spiral * knots) + exp(-rad * rad / 0.003) * 0.6;
    // stretched images are the bright arc: tint the most magnified light cyan
    float mu = 1.0 / max(abs(1.0 - pow(uThetaE * uThetaE / r2, 2.0)), 0.05);
    vec3 col = mix(uSrcColor, uArcColor, smoothstep(2.0, 8.0, mu)) * src;

    col += field(beta);
    // faint diffuse light of the deep field
    col += uFieldA * smoothstep(0.55, 0.85, fbm(vec3(beta * 1.6, 3.0))) * 0.05;

    // the lensing galaxy itself (foreground, unlensed)
    vec2 dl = d * vec2(1.0, 1.3);
    col += uLensColor * (exp(-dot(dl, dl) / 0.012) + exp(-dot(dl, dl) / 0.12) * 0.12) * smoothstep(0.0, 0.25, uThetaE);
    // a whisper of the critical curve
    float rr = sqrt(r2);
    col += uArcColor * exp(-pow((rr - uThetaE) / 0.01, 2.0)) * 0.06;

    // round, soft-edged window into the deep field
    float vig = 1.0 - smoothstep(1.55, 2.15, length(vPos));
    gl_FragColor = vec4(col * vig * uOpacity, 1.0);
  }
`

// A multi-band cutout tile: a tiny lensed ring in one band, with a glowing frame.
const TILE_VERT = /* glsl */ `
  ${INSTANCED_VERTEX_GLSL}
  attribute float aBand;
  varying vec2 vUv;
  varying vec3 vTint;
  varying float vBand;
  void main() {
    vUv = uv;
    vBand = aBand;
    vTint = vec3(1.0);
    #ifdef USE_INSTANCING_COLOR
      vTint = instanceColor;
    #endif
    gl_Position = projectionMatrix * modelViewMatrix * instancedPosition(position);
  }
`

const TILE_FRAG = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vTint;
  varying float vBand;
  void main() {
    vec2 c = vUv - 0.5;
    float r = length(c);
    float width = 0.025 + 0.012 * vBand;
    float arc = 0.45 + 0.55 * pow(0.5 + 0.5 * cos(atan(c.y, c.x) - 0.9), 2.0);
    float ring = exp(-pow((r - 0.2) / width, 2.0)) * arc;
    float core = exp(-r * r / 0.003);
    vec2 e = min(vUv, 1.0 - vUv);
    float edge = 1.0 - smoothstep(0.0, 0.04, min(e.x, e.y));
    vec3 col = vTint * (0.05 + edge * 0.9 + ring * 1.1 + core * 0.7);
    gl_FragColor = vec4(col, 1.0);
  }
`

const NODE_VERT = /* glsl */ `
  attribute float aLayer;
  attribute float aWinner;
  uniform float uWave;
  uniform float uSize;
  varying float vAct;
  varying float vWinner;
  void main() {
    float dl = aLayer - uWave;
    vAct = exp(-dl * dl * 3.0);
    vWinner = aWinner;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (1.0 + 0.6 * vAct) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const NODE_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uBase;
  uniform vec3 uHot;
  uniform vec3 uWin;
  uniform float uOpacity;
  uniform float uWinGlow;
  varying float vAct;
  varying float vWinner;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    vec3 col = mix(uBase, uHot, vAct);
    col = mix(col, uWin * (0.4 + 0.6 * uWinGlow + 0.5 * vAct), vWinner);
    gl_FragColor = vec4(col * a * uOpacity, 1.0);
  }
`

interface Node {
  pos: THREE.Vector3
  layer: number
}

function latticeNodes(): Node[] {
  const nodes: Node[] = []
  LAYERS.forEach((count, layer) => {
    for (let i = 0; i < count; i++) {
      const y = LATTICE_Y + (i - (count - 1) / 2) * NODE_SPACING
      nodes.push({ pos: new THREE.Vector3(LAYER_X[layer], y, LATTICE_Z + (seeded(i, layer + 40) - 0.5) * 0.2), layer })
    }
  })
  return nodes
}

function latticeEdges(nodes: Node[]): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let layer = 0; layer < LAYERS.length - 1; layer++) {
    const from = nodes.filter((n) => n.layer === layer)
    const to = nodes.filter((n) => n.layer === layer + 1)
    for (const a of from) for (const b of to) pts.push(a.pos, b.pos)
  }
  return pts
}

function squarePoints(center: THREE.Vector3, size: number): THREE.Vector3[] {
  const h = size / 2
  const c = (x: number, y: number) => new THREE.Vector3(center.x, center.y + y, center.z + x)
  // gates face along the flow (+x), so the square lies in the y-z plane
  return [c(-h, -h), c(h, -h), c(h, -h), c(h, h), c(h, h), c(-h, h), c(-h, h), c(-h, -h)]
}

// Corner brackets of the cutout reticle, centred on the origin (moved with the lens).
function reticlePoints(half: number, arm: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const corner = new THREE.Vector3(sx * half, sy * half, 0)
      pts.push(corner, new THREE.Vector3(sx * (half - arm), sy * half, 0))
      pts.push(corner, new THREE.Vector3(sx * half, sy * (half - arm), 0))
    }
  }
  return pts
}

// Module-level scratch: no allocation inside useFrame.
const _v = new THREE.Vector3()
const _n = new THREE.Vector3()
const _hit = new THREE.Vector3()
const _start = new THREE.Vector3()
const _ctrl = new THREE.Vector3()
const _pos = new THREE.Vector3()
const _ray = new THREE.Ray()
const _plane = new THREE.Plane()
const _obj = new THREE.Object3D()
const _color = new THREE.Color()
const BAND_TINTS = [hdr(PALETTE.stellarBlue, 1.15), hdr(PALETTE.signal, 1.15), hdr(PALETTE.starGold, 1.05)] as const
const BLACK = new THREE.Color(0, 0, 0)

export default function Beat_Lensing({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const gl = useThree((s) => s.gl)
  const lensRef = useRef<THREE.Mesh>(null)
  const reticleRef = useRef<THREE.Group>(null)
  const reticleLineRef = useRef<LightLineObject>(null)
  const tilesRef = useRef<THREE.InstancedMesh>(null)
  const gateARef = useRef<LightLineObject>(null)
  const gateBRef = useRef<LightLineObject>(null)
  const edgesRef = useRef<LightLineObject>(null)
  const nodesRef = useRef<THREE.Points>(null)
  const labelsRef = useRef<THREE.Group>(null)
  // Pointer state (written by the event listener, read in useFrame).
  const pointerRef = useRef({ x: 0, y: 0, active: false })
  // Damped cursor position in plane coordinates and how much it is in charge.
  const followRef = useRef({ x: LENS_REST.x, y: LENS_REST.y, weight: 0 })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return
    const pointer = pointerRef.current
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      const rect = gl.domElement.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      pointer.active = true
    }
    const onLeave = () => { pointer.active = false }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
    }
  }, [gl])

  const lensMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uLens: { value: LENS_REST.clone() },
      uSource: { value: SOURCE.clone() },
      uThetaE: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uSrcColor: { value: hdr(PALETTE.stellarBlue, 2.0) },
      uArcColor: { value: hdr(PALETTE.signal, 2.6) },
      uFieldA: { value: hdr(PALETTE.stellarBlue, 0.55) },
      uFieldB: { value: hdr(PALETTE.nearWhite, 0.45) },
      uLensColor: { value: hdr(PALETTE.starGold, GLOW.hero) },
    },
    vertexShader: PLANE_VERT,
    fragmentShader: LENS_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  const tileGeo = useDisposable(() => {
    const g = new THREE.PlaneGeometry(0.34, 0.34)
    const band = new Float32Array(CUTOUTS * BANDS)
    for (let i = 0; i < band.length; i++) band[i] = i % BANDS
    g.setAttribute('aBand', new THREE.InstancedBufferAttribute(band, 1))
    return g
  })
  const tileMat = useDisposable(() => new THREE.ShaderMaterial({
    vertexShader: TILE_VERT,
    fragmentShader: TILE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  }))

  const nodes = useMemo(() => latticeNodes(), [])
  const edges = useMemo(() => latticeEdges(nodes), [nodes])
  const gateA = useMemo(() => squarePoints(GATE_A, GATE_SIZE), [])
  const gateB = useMemo(() => squarePoints(GATE_B, GATE_SIZE * 0.85), [])
  const reticle = useMemo(() => reticlePoints(THETA_E * 1.55, 0.22), [])

  const nodeGeo = useDisposable(() => {
    const pos = new Float32Array(nodes.length * 3)
    const layer = new Float32Array(nodes.length)
    const winner = new Float32Array(nodes.length)
    nodes.forEach((n, i) => {
      pos[i * 3] = n.pos.x
      pos[i * 3 + 1] = n.pos.y
      pos[i * 3 + 2] = n.pos.z
      layer[i] = n.layer
    })
    // the upper output node is the "lens found" verdict
    winner[nodes.length - 1] = 1
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aLayer', new THREE.BufferAttribute(layer, 1))
    g.setAttribute('aWinner', new THREE.BufferAttribute(winner, 1))
    return g
  }, [nodes])
  const nodeMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uWave: { value: -2 },
      uSize: { value: 52 },
      uBase: { value: hdr(PALETTE.signal, GLOW.base) },
      uHot: { value: hdr(PALETTE.signal, GLOW.hero) },
      uWin: { value: hdr(PALETTE.starGold, GLOW.hot) },
      uOpacity: { value: 0 },
      uWinGlow: { value: 0 },
    },
    vertexShader: NODE_VERT,
    fragmentShader: NODE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }))

  // instanceColor must exist before the first draw so the program compiles with it.
  useLayoutEffect(() => {
    const tiles = tilesRef.current
    if (!tiles) return
    for (let i = 0; i < CUTOUTS * BANDS; i++) tiles.setColorAt(i, BLACK)
    if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true
  }, [])

  useFrame((state) => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? FROZEN_T : beat.clock
    const dt = Math.min(beat.dt, 0.1)
    const lens = lensRef.current
    if (!lens) return
    const uniforms = (lens.material as THREE.ShaderMaterial).uniforms
    const lensPos = uniforms.uLens!.value as THREE.Vector2

    // 1 · the deep field appears, then the mass switches on and the ring forms
    const appear = ease(p, 0.0, 0.18)
    const mass = ease(p, 0.12, 0.42)
    setUniform(lens, 'uOpacity', appear)
    setUniform(lens, 'uThetaE', THETA_E * mass)
    setUniform(lens, 'uTime', t)

    // 2 · where the lens sits: a slow drift, or the cursor (damped, within bounds)
    const driftX = LENS_REST.x + (reducedMotion ? 0 : Math.sin(t * 0.19) * 0.12)
    const driftY = LENS_REST.y + (reducedMotion ? 0 : Math.sin(t * 0.13 + 1.3) * 0.09)
    const pointer = pointerRef.current
    const follow = followRef.current
    let wantCursor = 0
    if (pointer.active) {
      _v.set(pointer.x, pointer.y, 0.5).unproject(state.camera)
      _ray.origin.setFromMatrixPosition(state.camera.matrixWorld)
      _ray.direction.copy(_v).sub(_ray.origin).normalize()
      _n.set(0, 0, 1).transformDirection(lens.matrixWorld)
      _hit.setFromMatrixPosition(lens.matrixWorld)
      _plane.setFromNormalAndCoplanarPoint(_n, _hit)
      if (_ray.intersectPlane(_plane, _hit)) {
        lens.worldToLocal(_hit)
        const len = Math.hypot(_hit.x, _hit.y)
        const k = len > LENS_BOUND ? LENS_BOUND / len : 1
        const damp = 1 - Math.exp(-dt * 3.5)
        follow.x += (_hit.x * k - follow.x) * damp
        follow.y += (_hit.y * k - follow.y) * damp
        wantCursor = 1
      }
    }
    follow.weight += (wantCursor - follow.weight) * (1 - Math.exp(-dt * 2.5))
    // the cursor only steers during the hold
    const steer = follow.weight * ease(p, 0.14, 0.24) * (1 - ease(p, 0.84, 0.94))
    lensPos.set(driftX + (follow.x - driftX) * steer, driftY + (follow.y - driftY) * steer)

    // 3 · the cutout reticle rides with the lens
    const reticleGroup = reticleRef.current
    if (reticleGroup) reticleGroup.position.set(LENS_PLANE.x + lensPos.x, LENS_PLANE.y + lensPos.y, LENS_PLANE.z + 0.02)
    setLineOpacity(reticleLineRef.current, ease(p, 0.3, 0.42) * 0.9)

    // 4 · multi-band cutouts flow through the gates into the lattice
    const flow = ease(p, 0.36, 0.52)
    let gateAGlow = 0
    let gateBGlow = 0
    const tiles = tilesRef.current
    if (tiles) {
      _start.set(LENS_PLANE.x + lensPos.x + THETA_E * 1.55, LENS_PLANE.y + lensPos.y + THETA_E * 1.55, LENS_PLANE.z + 0.05)
      _ctrl.set(_start.x + 0.75, _start.y + 0.85, _start.z + 0.2)
      for (let c = 0; c < CUTOUTS; c++) {
        const s = (((t * FLOW + c / CUTOUTS) % 1) + 1) % 1
        let spread = 0.05
        let scale = 1
        let fade = 1
        if (s < 0.5) {
          // lift off the reticle and arc over to the first gate
          const u = s / 0.5
          const w = 1 - u
          _pos.copy(_start).multiplyScalar(w * w).addScaledVector(_ctrl, 2 * w * u).addScaledVector(GATE_A, u * u)
          fade = ease(u, 0.0, 0.25)
          scale = 0.6 + 0.4 * ease(u, 0, 0.4)
        } else if (s < 0.75) {
          const u = (s - 0.5) / 0.25
          _pos.lerpVectors(GATE_A, GATE_B, u)
          // inside the gates the bands fan apart
          spread = 0.05 + 0.1 * Math.sin(Math.PI * u)
        } else {
          const u = (s - 0.75) / 0.25
          _pos.lerpVectors(GATE_B, LATTICE_IN, u)
          scale = 1 - 0.75 * u
          fade = 1 - ease(u, 0.55, 1.0)
        }
        gateAGlow = Math.max(gateAGlow, Math.exp(-(((s - 0.5) / 0.05) ** 2)))
        gateBGlow = Math.max(gateBGlow, Math.exp(-(((s - 0.75) / 0.05) ** 2)))
        for (let b = 0; b < BANDS; b++) {
          const i = c * BANDS + b
          _obj.position.set(_pos.x + (b - 1) * spread * 0.6, _pos.y + (b - 1) * spread * 0.6, _pos.z - (b - 1) * spread)
          _obj.rotation.set(0, -0.35, 0)
          _obj.scale.setScalar(scale * flow + 0.0001)
          _obj.updateMatrix()
          tiles.setMatrixAt(i, _obj.matrix)
          tiles.setColorAt(i, setHdr(_color, BAND_TINTS[b]!, fade * flow))
        }
      }
      tiles.instanceMatrix.needsUpdate = true
      if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true
    }
    const gates = ease(p, 0.3, 0.45)
    setLineOpacity(gateARef.current, gates * (0.3 + 0.7 * gateAGlow * flow))
    setLineOpacity(gateBRef.current, gates * (0.3 + 0.7 * gateBGlow * flow))

    // 5 · the lattice draws on, and each arriving cutout sends a wave through it
    setLineReveal(edgesRef.current, ease(p, 0.2, 0.46))
    setLineOpacity(edgesRef.current, ease(p, 0.2, 0.3) * 0.7)
    const nodesObj = nodesRef.current
    setUniform(nodesObj, 'uOpacity', ease(p, 0.22, 0.4))
    const phase = (((t * FLOW * CUTOUTS) % 1) + 1) % 1
    setUniform(nodesObj, 'uWave', flow > 0.01 ? phase * (LAYERS.length + 1.5) - 0.5 : -3)
    setUniform(nodesObj, 'uWinGlow', ease(p, 0.5, 0.66))

    const labels = labelsRef.current
    if (labels) {
      const fade = ease(p, 0.45, 0.6) * 0.8
      for (let i = 0; i < labels.children.length; i++) {
        ;(labels.children[i] as THREE.Mesh & { fillOpacity: number }).fillOpacity = fade
      }
    }
  })

  return (
    <group>
      {/* The lensed deep field */}
      <mesh ref={lensRef} position={LENS_PLANE} material={lensMat} frustumCulled={false}>
        <planeGeometry args={[PLANE_SIZE, PLANE_SIZE]} />
      </mesh>

      {/* Cutout reticle, following the lens */}
      <group ref={reticleRef} position={[LENS_PLANE.x + LENS_REST.x, LENS_PLANE.y + LENS_REST.y, LENS_PLANE.z + 0.02]}>
        <LightLine ref={reticleLineRef} points={reticle} segments color={PALETTE.signal} intensity={1.3} width={0.012} opacity={0} />
      </group>

      {/* Multi-band cutout tiles, the gates, and the lattice */}
      <instancedMesh ref={tilesRef} args={[tileGeo, tileMat, CUTOUTS * BANDS]} frustumCulled={false} />
      <LightLine ref={gateARef} points={gateA} segments color={PALETTE.signal} intensity={GLOW.hero} width={0.018} opacity={0} />
      <LightLine ref={gateBRef} points={gateB} segments color={PALETTE.signal} intensity={GLOW.hero} width={0.018} opacity={0} />
      <LightLine ref={edgesRef} points={edges} segments color={PALETTE.signal} intensity={0.55} width={0.006} opacity={0} />
      <points ref={nodesRef} geometry={nodeGeo} material={nodeMat} frustumCulled={false} />

      <group ref={labelsRef}>
        <Label preserveCase position={[GATE_A.x + 0.3, GATE_A.y + 0.75, GATE_A.z]} color={PALETTE.signal} opacity={0}>Rubin · ugrizy</Label>
        <Label position={[LAYER_X[2], LATTICE_Y + 1.6, LATTICE_Z]} color={PALETTE.starGold} opacity={0}>DeepLense</Label>
      </group>
    </group>
  )
}
