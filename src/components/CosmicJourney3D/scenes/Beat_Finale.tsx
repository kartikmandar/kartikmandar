// src/components/CosmicJourney3D/scenes/Beat_Finale.tsx
'use client'

// Beat 31 · The Journey Continues (the bookend).
// The neutral-hydrogen web of the early Universe glows faintly; small first stars
// light up in it, and an ionized bubble grows around each one, eating the web as
// it goes (reionization). The story ends with the first stars lighting the
// Universe, as it began with one star. The merged light tightens into a ring of
// light, and the Oman eclipse ring
// from Act I slides into perfect alignment over it. As the camera departs, a
// single 21-cm pulse rings outward. The constellation of the whole journey and
// the end card take over from there (FinaleConstellation + Overlay).

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
import { PALETTE, GLOW, hdr } from '../art/palette'
import { getGlowTexture, setUniform, useDisposable } from '../art/materials'
import { GlowSprite } from '../art/GlowSprite'
import { ease, pulse, seeded } from '../art/anim'

const BUBBLES = 5
const RING_CENTER = new THREE.Vector3(0, 1.3, -1.2)

const WEB_VERT = /* glsl */ `
  attribute float aSeed;
  uniform vec4 uBubbles[${BUBBLES}];
  uniform float uSize;
  uniform float uTime;
  uniform float uReveal;
  varying float vNeutral;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.25 + aSeed * 6.28) * 0.03;
    // ionized inside any bubble: the web disappears where the bubbles have grown
    float neutral = 1.0;
    for (int i = 0; i < ${BUBBLES}; i++) {
      float d = distance(p, uBubbles[i].xyz);
      neutral *= smoothstep(uBubbles[i].w * 0.85, uBubbles[i].w * 1.08, d);
    }
    vNeutral = neutral * uReveal * (0.55 + 0.45 * fract(aSeed * 7.31));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const WEB_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  varying float vNeutral;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    gl_FragColor = vec4(uColor * a * vNeutral, 1.0);
  }
`

// Ionized bubble: a soft fresnel shell, hot at the rim.
const BUBBLE_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const BUBBLE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.4);
    gl_FragColor = vec4(uColor * (0.05 + fres) * uOpacity, 1.0);
  }
`

const PLANE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Photon ring (thin, hot) or eclipse annulus (dark disc with a ring of fire).
const RING_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uRadius;
  uniform float uWidth;
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    // squares written out: pow() is undefined for a negative base on some GPUs
    float a = (r - uRadius) / uWidth;
    float b = a * 0.25;
    float ring = exp(-a * a) + 0.3 * exp(-b * b);
    gl_FragColor = vec4(uColor * ring * uOpacity, 1.0);
  }
`

// The 21-cm pulse: one expanding ring of light.
const PULSE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPhase;
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float d = (r - uPhase) / 0.015;
    float front = exp(-d * d);
    gl_FragColor = vec4(uColor * front * (1.0 - uPhase), 1.0);
  }
`

function webGeometry(count: number): THREE.BufferGeometry {
  // A filamentary web: points clustered along random segments between nodes.
  const nodes: THREE.Vector3[] = []
  for (let i = 0; i < 26; i++) {
    nodes.push(new THREE.Vector3((seeded(i, 1) - 0.5) * 9.5, -0.3 + seeded(i, 2) * 4.0, -4.5 + seeded(i, 3) * 4.2))
  }
  const pos = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const a = nodes[Math.floor(seeded(i, 4) * nodes.length)]!
    const b = nodes[Math.floor(seeded(i, 5) * nodes.length)]!
    const t = seeded(i, 6)
    const j = 0.12
    pos[i * 3] = a.x + (b.x - a.x) * t + (seeded(i, 7) - 0.5) * j
    pos[i * 3 + 1] = a.y + (b.y - a.y) * t + (seeded(i, 8) - 0.5) * j
    pos[i * 3 + 2] = a.z + (b.z - a.z) * t + (seeded(i, 9) - 0.5) * j
    seed[i] = seeded(i, 10)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  return g
}

// Bubble centres and their final radii (scene space). They overlap as they grow.
const BUBBLE_SITES: Array<[number, number, number, number]> = [
  [-2.6, 1.6, -2.2, 2.0],
  [2.4, 2.1, -2.8, 1.9],
  [0.2, 0.6, -1.4, 1.6],
  [-0.8, 2.9, -3.4, 1.8],
  [3.1, 0.4, -1.8, 1.5],
]

export default function Beat_Finale({ index, quality }: BeatSceneProps) {
  const beat = useBeat(index)
  const webRef = useRef<THREE.Points>(null)
  const bubbleRefs = useRef<Array<THREE.Mesh | null>>([])
  const photonRef = useRef<THREE.Mesh>(null)
  const eclipseRef = useRef<THREE.Group>(null)
  const eclipseRingRef = useRef<THREE.Mesh>(null)
  const shadowRef = useRef<THREE.Mesh>(null)
  const pulseRef = useRef<THREE.Mesh>(null)
  const alignGlowRef = useRef<THREE.Sprite>(null)
  const starRefs = useRef<Array<THREE.Sprite | null>>([])

  const count = quality === 'mobile' ? 900 : quality === 'low' ? 1800 : 3600
  const webGeo = useDisposable(() => webGeometry(count), [count])
  const webMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uBubbles: { value: BUBBLE_SITES.map(([x, y, z]) => new THREE.Vector4(x, y, z, 0)) },
      uSize: { value: 26 },
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uMap: { value: getGlowTexture() },
      uColor: { value: hdr(PALETTE.hydrogen, 1.1) },
    },
    vertexShader: WEB_VERT,
    fragmentShader: WEB_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))

  // one material per bubble so each can fade on its own schedule
  const bubbleMats = useDisposable(() => {
    const list = BUBBLE_SITES.map(() => new THREE.ShaderMaterial({
      uniforms: { uColor: { value: hdr(PALETTE.ember, GLOW.hero) }, uOpacity: { value: 0 } },
      vertexShader: BUBBLE_VERT,
      fragmentShader: BUBBLE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }))
    return { list, dispose: () => list.forEach((m) => m.dispose()) }
  })

  const ringMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: hdr(PALETTE.starGold, GLOW.hot) },
      uOpacity: { value: 0 },
      uRadius: { value: 0.62 },
      uWidth: { value: 0.035 },
    },
    vertexShader: PLANE_VERT,
    fragmentShader: RING_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))
  const eclipseMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: hdr(PALETTE.ember, GLOW.hero) },
      uOpacity: { value: 0 },
      uRadius: { value: 0.78 },
      uWidth: { value: 0.05 },
    },
    vertexShader: PLANE_VERT,
    fragmentShader: RING_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))
  const pulseMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: { uColor: { value: hdr(PALETTE.hydrogen, GLOW.hero) }, uPhase: { value: 0 } },
    vertexShader: PLANE_VERT,
    fragmentShader: PULSE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = beat.clock

    // 1 · the web, then reionization: bubbles grow and merge (hold: 0.15 → 0.55)
    const web = webRef.current
    const grow = ease(p, 0.18, 0.55)
    if (web) {
      const u = (web.material as THREE.ShaderMaterial).uniforms
      u.uTime!.value = t
      u.uReveal!.value = ease(p, 0.0, 0.2) * (1 - ease(p, 0.6, 0.75))
      const sites = u.uBubbles!.value as THREE.Vector4[]
      for (let i = 0; i < BUBBLES; i++) sites[i]!.w = BUBBLE_SITES[i]![3] * ease(p, 0.18 + i * 0.05, 0.5 + i * 0.03)
    }

    // 0 · a small first star lights up at the heart of each bubble, just before it grows (0.1 → 0.3),
    // as a slow ramp, never a flash. Each rides with its bubble and fades into the ring.
    for (let i = 0; i < BUBBLES; i++) {
      const star = starRefs.current[i]
      if (!star) continue
      const lit = ease(p, 0.1 + i * 0.04, 0.2 + i * 0.04)
      const [x, y, z] = BUBBLE_SITES[i]!
      const converging = ease(p, 0.5, 0.72)
      star.position.set(x + (RING_CENTER.x - x) * converging, y + (RING_CENTER.y - y) * converging, z + (RING_CENTER.z - z) * converging)
      star.visible = lit > 0.001
      ;(star.material as THREE.SpriteMaterial).opacity = lit * (1 - ease(p, 0.6, 0.7))
      // A faint twinkle once it is burning.
      star.scale.setScalar(0.34 * (0.6 + 0.4 * lit) * (1 + 0.06 * Math.sin(t * 1.7 + i * 2.1)))
    }

    // 2 · the bubbles converge on one point and tighten into the photon ring (0.5 → 0.72)
    const converge = ease(p, 0.5, 0.72)
    for (let i = 0; i < BUBBLES; i++) {
      const mesh = bubbleRefs.current[i]
      if (!mesh) continue
      const [x, y, z, r] = BUBBLE_SITES[i]!
      const radius = r * ease(p, 0.18 + i * 0.05, 0.5 + i * 0.03) * (1 - 0.85 * converge)
      mesh.visible = radius > 0.01
      mesh.position.set(x + (RING_CENTER.x - x) * converge, y + (RING_CENTER.y - y) * converge, z + (RING_CENTER.z - z) * converge)
      mesh.scale.setScalar(Math.max(0.001, radius))
      setUniform(mesh, 'uOpacity', 0.55 * grow * (1 - ease(p, 0.66, 0.74)))
    }
    setUniform(photonRef.current, 'uOpacity', ease(p, 0.62, 0.74) * (1 - 0.4 * ease(p, 0.9, 1)))
    if (shadowRef.current) shadowRef.current.visible = p > 0.62

    // 3 · the eclipse ring from Act I slides into alignment over it (0.68 → 0.82)
    const slide = ease(p, 0.68, 0.82)
    const eclipse = eclipseRef.current
    if (eclipse) {
      eclipse.position.set(RING_CENTER.x - 5.5 * (1 - slide), RING_CENTER.y + 0.6 * (1 - slide), RING_CENTER.z)
      eclipse.visible = p > 0.66
    }
    setUniform(eclipseRingRef.current, 'uOpacity', ease(p, 0.66, 0.72))
    const align = alignGlowRef.current
    if (align) (align.material as THREE.SpriteMaterial).opacity = pulse(p, 0.78, 0.9) * 0.9

    // 4 · departing: one 21-cm pulse rings outward (0.84 → 1)
    const pulseMesh = pulseRef.current
    if (pulseMesh) {
      const phase = ease(p, 0.84, 1)
      pulseMesh.visible = phase > 0 && phase < 1
      setUniform(pulseMesh, 'uPhase', phase)
    }
  })

  return (
    <group>
      <points ref={webRef} geometry={webGeo} material={webMat} frustumCulled={false} />

      {BUBBLE_SITES.map((site, i) => (
        <mesh
          key={i}
          ref={(m) => {
            bubbleRefs.current[i] = m
          }}
          position={[site[0], site[1], site[2]]}
          material={bubbleMats.list[i]}
          visible={false}
        >
          <sphereGeometry args={[1, 40, 24]} />
        </mesh>
      ))}

      {/* the first stars: small and blue-white, each at the heart of its bubble */}
      {BUBBLE_SITES.map((site, i) => (
        <GlowSprite
          key={`star-${i}`}
          ref={(s) => {
            starRefs.current[i] = s
          }}
          position={[site[0], site[1], site[2]]}
          color={PALETTE.stellarBlue}
          intensity={GLOW.hero}
          size={0.34}
          opacity={0}
        />
      ))}

      <group position={RING_CENTER}>
        {/* the shadow inside the photon ring */}
        <mesh ref={shadowRef} visible={false} renderOrder={-1}>
          <circleGeometry args={[0.42, 48]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <Billboard>
          <mesh ref={photonRef} material={ringMat}>
            <planeGeometry args={[1.6, 1.6]} />
          </mesh>
        </Billboard>
      </group>

      {/* the Oman annular eclipse: a dark disc inside a ring of fire */}
      <group ref={eclipseRef} visible={false}>
        <mesh position={[0, 0, 0.02]} renderOrder={-1}>
          <circleGeometry args={[0.5, 48]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.6} depthWrite={false} />
        </mesh>
        <mesh ref={eclipseRingRef} material={eclipseMat} position={[0, 0, 0.03]}>
          <planeGeometry args={[1.6, 1.6]} />
        </mesh>
      </group>

      <GlowSprite ref={alignGlowRef} position={[RING_CENTER.x, RING_CENTER.y, RING_CENTER.z + 0.1]} color={PALETTE.starGold} intensity={GLOW.hero} size={2.6} opacity={0} />

      <mesh ref={pulseRef} position={RING_CENTER} material={pulseMat} visible={false}>
        <planeGeometry args={[9, 9]} />
      </mesh>
    </group>
  )
}
