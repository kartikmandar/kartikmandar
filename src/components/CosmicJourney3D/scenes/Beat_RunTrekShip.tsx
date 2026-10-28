// src/components/CosmicJourney3D/scenes/Beat_RunTrekShip.tsx
'use client'

// Beat 27 · Run, Trek, Ship (Act IV, widening).
// The broken shuttlecock arc from beat 11 hangs in the dark and finally
// completes. Its light then folds, piece by piece, into a tournament bracket
// tree (a winner's path lights up through it), and the bracket settles into a
// mountain ridgeline with a high pass, fainter ranges behind and contour lines
// on its face. A lone runner's light trail switchbacks up to the pass. Last,
// a quiet "ship" moment: a small ember launch light lifts off the ridge and
// heads away into the dark, toward the next act.
//
// One fat-line mesh carries the arc, the bracket and the ridge: each of its
// segments knows its endpoints in all three shapes and morphs on the GPU.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { setUniform, useDisposable } from '../art/materials'
import { GlowSprite } from '../art/GlowSprite'
import { LightLine, setLineOpacity, setLineReveal, type LightLineObject } from '../art/LightLine'
import { Label } from '../art/Label'
import { ease, pulse, ramp, seeded } from '../art/anim'

const SEGMENTS = 96
const SHAPE_Z = -1.6
const RIDGE_Z = -2.4

// The clear: a high badminton arc (quadratic Bezier).
const ARC = [
  new THREE.Vector3(-3.8, -0.4, SHAPE_Z),
  new THREE.Vector3(0, 5.4, SHAPE_Z - 0.8),
  new THREE.Vector3(3.8, -0.2, SHAPE_Z),
] as const
const ARC_BROKEN_AT = 0.6

// Ridgeline keyframes (x, y): a first peak, the high pass (a saddle), the summit.
const RIDGE_KEYS: ReadonlyArray<readonly [number, number]> = [
  [-4.5, 0.2], [-3.6, 1.0], [-2.9, 2.1], [-2.5, 2.55], [-1.9, 2.05], [-1.3, 2.3],
  [-0.6, 1.85], [0.2, 2.6], [0.9, 3.35], [1.6, 2.7], [2.3, 2.95], [3.1, 2.0], [3.8, 1.3], [4.5, 0.6],
]
const PASS = new THREE.Vector3(-0.6, 1.85, RIDGE_Z)

// Launch: a small light leaving the pass, up and away into -z.
const LAUNCH = [PASS, new THREE.Vector3(-0.5, 3.8, -3.8), new THREE.Vector3(0.9, 3.7, -7.5)] as const

function bezier(out: THREE.Vector3, p: readonly [THREE.Vector3, THREE.Vector3, THREE.Vector3], t: number): THREE.Vector3 {
  const u = 1 - t
  return out
    .copy(p[0]).multiplyScalar(u * u)
    .addScaledVector(p[1], 2 * u * t)
    .addScaledVector(p[2], t * t)
}

function ridgeY(x: number): number {
  for (let i = 0; i < RIDGE_KEYS.length - 1; i++) {
    const [x0, y0] = RIDGE_KEYS[i]!
    const [x1, y1] = RIDGE_KEYS[i + 1]!
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
  }
  return RIDGE_KEYS[RIDGE_KEYS.length - 1]![1]
}

function ridgePoints(n: number, z: number, scaleX = 1, liftY = 0, scaleY = 1, jag = 0.06, channel = 60): THREE.Vector3[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = -4.5 + (9 * i) / n
    const y = -0.6 + (ridgeY(x) + 0.6) * scaleY + liftY + (i > 0 && i < n ? (seeded(i, channel) - 0.5) * jag : 0)
    return new THREE.Vector3(x * scaleX, y, z)
  })
}

interface Piece {
  a: THREE.Vector3
  b: THREE.Vector3
  win: number
}

// An 8-entrant bracket drawn as a tree growing upward to the champion.
// Bars are split at their centres so the winner's half can be marked.
function bracketPieces(): Piece[] {
  const base: Piece[] = []
  const seg = (ax: number, ay: number, bx: number, by: number, win: number) =>
    base.push({ a: new THREE.Vector3(ax, ay, SHAPE_Z), b: new THREE.Vector3(bx, by, SHAPE_Z), win })
  const levels = [-0.5, 0.5, 1.5, 2.5]
  const winner = 5
  let xs = Array.from({ length: 8 }, (_, i) => -3.5 + i)
  let winIdx = winner
  for (let i = 0; i < 8; i++) seg(xs[i]!, levels[0]!, xs[i]!, levels[1]!, i === winner ? 1 : 0)
  for (let level = 1; level < levels.length; level++) {
    const y = levels[level]!
    const next: number[] = []
    for (let k = 0; k < xs.length; k += 2) {
      const c = (xs[k]! + xs[k + 1]!) / 2
      const pair = k / 2
      const winPair = Math.floor(winIdx / 2) === pair
      seg(xs[k]!, y, c, y, winPair && winIdx % 2 === 0 ? 1 : 0)
      seg(xs[k + 1]!, y, c, y, winPair && winIdx % 2 === 1 ? 1 : 0)
      const top = level + 1 < levels.length ? levels[level + 1]! : 3.2
      seg(c, y, c, top, winPair ? 1 : 0)
      next.push(c)
    }
    xs = next
    winIdx = Math.floor(winIdx / 2)
  }
  // Subdivide into SEGMENTS pieces by length, then order by x so the tree maps onto the ridge.
  const lengths = base.map((s) => s.a.distanceTo(s.b))
  const total = lengths.reduce((sum, l) => sum + l, 0)
  const counts = lengths.map((l) => Math.max(1, Math.round((l / total) * SEGMENTS)))
  let diff = SEGMENTS - counts.reduce((sum, c) => sum + c, 0)
  while (diff !== 0) {
    let longest = 0
    for (let i = 1; i < counts.length; i++) if (lengths[i]! / counts[i]! > lengths[longest]! / counts[longest]!) longest = i
    if (diff < 0) {
      let most = 0
      for (let i = 1; i < counts.length; i++) if (counts[i]! > counts[most]!) most = i
      counts[most]! -= 1
      diff += 1
    } else {
      counts[longest]! += 1
      diff -= 1
    }
  }
  const pieces: Piece[] = []
  base.forEach((s, i) => {
    const n = counts[i]!
    for (let k = 0; k < n; k++) {
      pieces.push({ a: s.a.clone().lerp(s.b, k / n), b: s.a.clone().lerp(s.b, (k + 1) / n), win: s.win })
    }
  })
  pieces.sort((p, q) => (p.a.x + p.b.x) - (q.a.x + q.b.x) || (p.a.y + p.b.y) - (q.a.y + q.b.y))
  return pieces
}

function morphGeometry(): THREE.InstancedBufferGeometry {
  const arc = Array.from({ length: SEGMENTS + 1 }, (_, i) => bezier(new THREE.Vector3(), ARC, i / SEGMENTS))
  const ridge = ridgePoints(SEGMENTS, RIDGE_Z)
  const bracket = bracketPieces()
  const a0 = new Float32Array(SEGMENTS * 3)
  const a1 = new Float32Array(SEGMENTS * 3)
  const b0 = new Float32Array(SEGMENTS * 3)
  const b1 = new Float32Array(SEGMENTS * 3)
  const c0 = new Float32Array(SEGMENTS * 3)
  const c1 = new Float32Array(SEGMENTS * 3)
  const order = new Float32Array(SEGMENTS)
  const win = new Float32Array(SEGMENTS)
  for (let i = 0; i < SEGMENTS; i++) {
    arc[i]!.toArray(a0, i * 3)
    arc[i + 1]!.toArray(a1, i * 3)
    bracket[i]!.a.toArray(b0, i * 3)
    bracket[i]!.b.toArray(b1, i * 3)
    ridge[i]!.toArray(c0, i * 3)
    ridge[i + 1]!.toArray(c1, i * 3)
    order[i] = i / SEGMENTS
    win[i] = bracket[i]!.win
  }
  const g = new THREE.InstancedBufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, -1, 0, 1, -1, 0, 0, 1, 0, 1, 1, 0]), 3))
  g.setIndex([0, 1, 2, 2, 1, 3])
  g.setAttribute('aA0', new THREE.InstancedBufferAttribute(a0, 3))
  g.setAttribute('aA1', new THREE.InstancedBufferAttribute(a1, 3))
  g.setAttribute('aB0', new THREE.InstancedBufferAttribute(b0, 3))
  g.setAttribute('aB1', new THREE.InstancedBufferAttribute(b1, 3))
  g.setAttribute('aC0', new THREE.InstancedBufferAttribute(c0, 3))
  g.setAttribute('aC1', new THREE.InstancedBufferAttribute(c1, 3))
  g.setAttribute('aOrder', new THREE.InstancedBufferAttribute(order, 1))
  g.setAttribute('aWin', new THREE.InstancedBufferAttribute(win, 1))
  g.instanceCount = SEGMENTS
  return g
}

// World-width line segments expanded in view space; endpoints morph arc -> bracket -> ridge.
const MORPH_VERT = /* glsl */ `
  attribute vec3 aA0;
  attribute vec3 aA1;
  attribute vec3 aB0;
  attribute vec3 aB1;
  attribute vec3 aC0;
  attribute vec3 aC1;
  attribute float aOrder;
  attribute float aWin;
  uniform float uM1;
  uniform float uM2;
  uniform float uWidth;
  varying float vAcross;
  varying float vOrder;
  varying float vWin;
  vec3 shape(vec3 a, vec3 b, vec3 c, float m1, float m2) {
    vec3 p = mix(mix(a, b, m1), c, m2);
    float lift = sin(3.14159 * m1) + sin(3.14159 * m2);
    p.y += lift * 0.22;
    p.z += lift * 0.3;
    return p;
  }
  void main() {
    // the fold travels left to right across the pieces
    float st = aOrder * 0.45;
    float m1 = smoothstep(st, st + 0.55, uM1);
    float m2 = smoothstep(st, st + 0.55, uM2);
    vec4 v0 = modelViewMatrix * vec4(shape(aA0, aB0, aC0, m1, m2), 1.0);
    vec4 v1 = modelViewMatrix * vec4(shape(aA1, aB1, aC1, m1, m2), 1.0);
    vec2 d = v1.xy - v0.xy;
    float len = length(d);
    vec2 dir = len > 1e-5 ? d / len : vec2(1.0, 0.0);
    vec2 n = vec2(-dir.y, dir.x);
    vec4 v = mix(v0, v1, position.x);
    v.xy += n * position.y * uWidth * 0.5 + dir * (position.x * 2.0 - 1.0) * uWidth * 0.35;
    vAcross = position.y;
    vOrder = aOrder;
    vWin = aWin;
    gl_Position = projectionMatrix * v;
  }
`

const MORPH_FRAG = /* glsl */ `
  uniform float uDraw;
  uniform float uOpacity;
  uniform float uWinOn;
  uniform vec3 uBase;
  uniform vec3 uWin;
  varying float vAcross;
  varying float vOrder;
  varying float vWin;
  void main() {
    if (vOrder >= uDraw) discard;
    float core = exp(-vAcross * vAcross * 2.5);
    vec3 col = uBase * core + uWin * vWin * uWinOn * core;
    gl_FragColor = vec4(col * uOpacity, 1.0);
  }
`

// Module-level scratch: no allocation inside useFrame.
const _pos = new THREE.Vector3()

type TextMesh = THREE.Mesh & { fillOpacity: number }

export default function Beat_RunTrekShip({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const morphRef = useRef<THREE.Mesh>(null)
  const shuttleRef = useRef<THREE.Sprite>(null)
  const rangesRef = useRef<LightLineObject>(null)
  const contoursRef = useRef<LightLineObject>(null)
  const trailRef = useRef<LightLineObject>(null)
  const runnerRef = useRef<THREE.Sprite>(null)
  const passRef = useRef<THREE.Sprite>(null)
  const launchRef = useRef<LightLineObject>(null)
  const launchHeadRef = useRef<THREE.Sprite>(null)
  const labelRef = useRef<TextMesh>(null)

  const morphGeo = useDisposable(morphGeometry)
  const morphMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uM1: { value: 0 },
      uM2: { value: 0 },
      uDraw: { value: ARC_BROKEN_AT },
      uWidth: { value: 0.034 },
      uOpacity: { value: 0 },
      uWinOn: { value: 0 },
      uBase: { value: hdr(PALETTE.starGold, 1.15) },
      uWin: { value: hdr(PALETTE.nearWhite, GLOW.hero) },
    },
    vertexShader: MORPH_VERT,
    fragmentShader: MORPH_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  }))

  // Fainter ranges behind the ridge.
  const ranges = useMemo(() => {
    const far1 = ridgePoints(64, -4.2, 1.15, -0.35, 1.05, 0.12, 61)
    const far2 = ridgePoints(48, -5.6, 1.3, -0.55, 0.9, 0.16, 62).map((v) => v.setX(-v.x))
    const pts: THREE.Vector3[] = []
    for (const line of [far1, far2]) for (let i = 0; i < line.length - 1; i++) pts.push(line[i]!, line[i + 1]!)
    return pts
  }, [])

  // Contours on the mountain's face, stepping down and toward the camera.
  const contours = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let k = 1; k <= 3; k++) {
      const line = ridgePoints(56, RIDGE_Z + 0.55 * k, 1 - 0.06 * k, 0, 1 - 0.27 * k, 0.05, 63 + k)
      for (let i = 0; i < line.length - 1; i++) pts.push(line[i]!, line[i + 1]!)
    }
    return pts
  }, [])

  // The runner's switchbacks from the valley up to the pass.
  const trail = useMemo(() => {
    const n = 140
    return Array.from({ length: n + 1 }, (_, i) => {
      const s = i / n
      return new THREE.Vector3(
        PASS.x - 1.0 * (1 - s) + 0.55 * Math.sin(s * Math.PI * 4.5) * (1 - 0.7 * s),
        -0.4 + (PASS.y + 0.4) * Math.pow(s, 1.1),
        -0.6 + (PASS.z + 0.6) * s,
      )
    })
  }, [])
  const trailFlat = useMemo(() => {
    const out = new Float32Array(trail.length * 3)
    trail.forEach((v, i) => v.toArray(out, i * 3))
    return out
  }, [trail])

  const launch = useMemo(() => Array.from({ length: 61 }, (_, i) => bezier(new THREE.Vector3(), LAUNCH, i / 60)), [])

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = reducedMotion ? 0 : beat.clock
    const appear = ease(p, 0.0, 0.12)

    // 1 · the broken arc completes
    const complete = ease(p, 0.14, 0.26)
    const draw = ARC_BROKEN_AT + (1 - ARC_BROKEN_AT) * complete
    const morph = morphRef.current
    setUniform(morph, 'uDraw', draw + 0.0001)
    setUniform(morph, 'uOpacity', appear)
    const shuttle = shuttleRef.current
    if (shuttle) {
      // a faint flicker at the broken end, then the head of the completing arc
      const waiting = 1 - ramp(p, 0.12, 0.16)
      const flicker = reducedMotion ? 1 : 0.7 + 0.3 * Math.sin(t * 5.3) * Math.sin(t * 3.1 + 0.7)
      bezier(_pos, ARC, draw)
      shuttle.position.copy(_pos)
      const travelling = complete > 0 && complete < 1 ? 1 : 0
      const landing = pulse(p, 0.24, 0.32)
      ;(shuttle.material as THREE.SpriteMaterial).opacity = appear * (waiting * 0.5 * flicker + travelling * 0.9 + landing)
      const s = 0.45 + 0.5 * landing
      shuttle.scale.set(s, s, 1)
    }

    // 2 · arc into bracket, the winner's path, then 3 · bracket into ridge
    setUniform(morph, 'uM1', ease(p, 0.28, 0.42))
    setUniform(morph, 'uWinOn', ease(p, 0.4, 0.46) * (1 - ease(p, 0.52, 0.6)))
    setUniform(morph, 'uM2', ease(p, 0.5, 0.64))
    const mountain = ease(p, 0.56, 0.7)
    setLineOpacity(rangesRef.current, mountain * 0.8)
    setLineOpacity(contoursRef.current, mountain * 0.7)

    // 4 · the runner climbs the switchbacks to the pass
    const climb = ease(p, 0.6, 0.78)
    setLineReveal(trailRef.current, climb)
    const runner = runnerRef.current
    if (runner) {
      const f = climb * (trail.length - 1)
      const i0 = Math.min(trail.length - 2, Math.floor(f))
      const k = f - i0
      const o = i0 * 3
      runner.position.set(
        trailFlat[o]! + (trailFlat[o + 3]! - trailFlat[o]!) * k,
        trailFlat[o + 1]! + (trailFlat[o + 4]! - trailFlat[o + 1]!) * k + 0.03,
        trailFlat[o + 2]! + (trailFlat[o + 5]! - trailFlat[o + 2]!) * k,
      )
      ;(runner.material as THREE.SpriteMaterial).opacity = ease(p, 0.58, 0.62) * (1 - ease(p, 0.78, 0.84) * 0.7)
    }
    const pass = passRef.current
    if (pass) (pass.material as THREE.SpriteMaterial).opacity = ease(p, 0.76, 0.8) * (0.45 + 0.4 * pulse(p, 0.76, 0.86))

    // 5 · ship: a small launch light leaves the ridge
    const lift = ease(p, 0.78, 1.0)
    setLineReveal(launchRef.current, lift)
    setLineOpacity(launchRef.current, p > 0.78 ? 0.85 : 0)
    const head = launchHeadRef.current
    if (head) {
      bezier(_pos, LAUNCH, lift)
      head.position.copy(_pos)
      ;(head.material as THREE.SpriteMaterial).opacity = ease(p, 0.78, 0.81)
    }

    if (labelRef.current) labelRef.current.fillOpacity = ease(p, 0.7, 0.8) * 0.8
  })

  return (
    <group>
      <LightLine ref={rangesRef} points={ranges} segments color={PALETTE.stellarBlue} intensity={GLOW.dim} width={0.012} opacity={0} />
      <LightLine ref={contoursRef} points={contours} segments color={PALETTE.starGold} intensity={0.3} width={0.01} opacity={0} />

      <mesh ref={morphRef} geometry={morphGeo} material={morphMat} frustumCulled={false} />
      <GlowSprite ref={shuttleRef} color={PALETTE.starGold} intensity={GLOW.hero} size={0.45} opacity={0} />

      <LightLine ref={trailRef} points={trail} color={PALETTE.starGold} intensity={GLOW.hero} width={0.02} />
      <GlowSprite ref={runnerRef} color={PALETTE.nearWhite} intensity={GLOW.hot} size={0.32} opacity={0} />
      <GlowSprite ref={passRef} position={[PASS.x, PASS.y + 0.04, PASS.z]} color={PALETTE.starGold} intensity={GLOW.hero} size={0.9} opacity={0} />

      <LightLine ref={launchRef} points={launch} color={PALETTE.ember} intensity={1.6} width={0.012} opacity={0} />
      <GlowSprite ref={launchHeadRef} color={PALETTE.ember} intensity={GLOW.hot} size={0.4} opacity={0} />

      <Label ref={labelRef} position={[PASS.x, PASS.y + 0.42, PASS.z]} color={PALETTE.starGold} opacity={0}>
        Rupin · Hampta
      </Label>
    </group>
  )
}
