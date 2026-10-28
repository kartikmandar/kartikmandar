// src/components/CosmicJourney3D/FinaleConstellation.tsx
'use client'

// The finale's pull-back: the whole journey, in miniature, as one constellation.
// Every beat becomes a star coloured by its act (cold → ember), joined in story
// order by a line of light that draws on as the camera arrives at the nebula.
// The last star (now) pulses ember. It floats above the end card.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BEATS } from './registry'
import { CONSTELLATION_CENTER, NEBULA_ANCHOR } from './beatsMeta'
import { journeyFrame } from './store'
import { ACT_GRADE, GLOW, PALETTE, hdr } from './art/palette'
import { getGlowTexture, useDisposable } from './art/materials'
import { LightLine, setLineReveal, setLineOpacity, type LightLineObject } from './art/LightLine'
import { GlowSprite } from './art/GlowSprite'
import { ease } from './art/anim'

/** Width of the miniature constellation in world units. */
const WIDTH = 8.4

/** Lays the stations out left → right in story order, keeping their gentle wander. */
export function constellationPoints(anchors: ReadonlyArray<readonly [number, number, number]>, width = WIDTH): Array<[number, number, number]> {
  if (anchors.length === 0) return []
  const zs = anchors.map((a) => a[2])
  const zStart = Math.max(...zs)
  const zEnd = Math.min(...zs)
  const span = zStart - zEnd || 1
  return anchors.map(([x, y, z]) => [
    ((zStart - z) / span - 0.5) * width,
    (x / 6) * 0.9 + (y / 2.5) * 0.45,
    0,
  ])
}

const STAR_VERT = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  uniform float uScale;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`
const STAR_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  varying vec3 vColor;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    gl_FragColor = vec4(vColor * a * uOpacity, 1.0);
  }
`

export function FinaleConstellation() {
  const groupRef = useRef<THREE.Group>(null)
  const starsRef = useRef<THREE.Points>(null)
  const lineRef = useRef<LightLineObject>(null)
  const nowRef = useRef<THREE.Sprite>(null)
  const last = BEATS.length - 1

  const points = useMemo(() => constellationPoints(BEATS.map((b) => b.meta.anchor.position)), [])
  // Face the nebula camera.
  const rotation = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(...CONSTELLATION_CENTER)
    o.lookAt(...NEBULA_ANCHOR.position)
    return o.rotation.clone()
  }, [])

  const starGeo = useDisposable(() => {
    const pos = new Float32Array(points.length * 3)
    const col = new Float32Array(points.length * 3)
    const size = new Float32Array(points.length)
    points.forEach((p, i) => {
      pos.set(p, i * 3)
      const c = hdr(ACT_GRADE[BEATS[i]!.act].accent, i === last ? GLOW.hot : 1.6)
      col.set([c.r, c.g, c.b], i * 3)
      size[i] = i === last ? 70 : 38
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    return g
  }, [points, last])
  const starMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: { uMap: { value: getGlowTexture() }, uOpacity: { value: 0 }, uScale: { value: 1 } },
    vertexShader: STAR_VERT,
    fragmentShader: STAR_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    const f = journeyFrame
    const local = f.activeIndex === last ? (f.local[last] ?? 0) : 0
    const show = ease(local, 0.82, 0.95)
    group.visible = show > 0.001
    if (!group.visible) return
    const stars = starsRef.current
    if (stars) (stars.material as THREE.ShaderMaterial).uniforms.uOpacity!.value = show
    setLineReveal(lineRef.current, ease(local, 0.85, 0.98))
    setLineOpacity(lineRef.current, 0.85 * show)
    const now = nowRef.current
    if (now) {
      const beatPulse = 0.75 + 0.25 * Math.sin(f.clock * 2.2)
      ;(now.material as THREE.SpriteMaterial).opacity = show * beatPulse
    }
  })

  const lastPoint = points[last] ?? [0, 0, 0]

  return (
    <group ref={groupRef} position={CONSTELLATION_CENTER} rotation={rotation} visible={false}>
      <LightLine ref={lineRef} points={points} color={PALETTE.nearWhite} intensity={0.8} width={0.018} opacity={0} />
      <points ref={starsRef} geometry={starGeo} material={starMat} frustumCulled={false} />
      <GlowSprite ref={nowRef} position={lastPoint} color={PALETTE.ember} intensity={GLOW.hot} size={1.4} opacity={0} />
    </group>
  )
}
