// src/components/CosmicJourney3D/scenes/VeryMassivePath.tsx
'use client'

// A very massive star's life and ending (P5 in the stellar opening spec), drawn
// in the opening's disk frame like SunPath and MassivePath. The star's point of
// light is OpeningStage's, following the same pure schedule (veryMassivePath);
// this adds its wind: gas streaming off the star, faster once it is a bare
// Wolf-Rayet core. When the core falls in, the wind is no longer fed, so its
// last gas keeps flying out as a thinning shell. The black hole itself is
// OriginBlackHole, mounted by OpeningStage outside this tilted, scaled frame.
// Always mounted, so Precompile covers it; hidden unless this path is playing.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { QualityTier } from '../types'
import { journeyFrame } from '../store'
import { PALETTE, hdr } from '../art/palette'
import { getGlowTexture, useDisposable } from '../art/materials'
import { ease, seeded } from '../art/anim'
import { createVeryMassivePath, pathProgress, veryMassivePath } from '../pathStage'
import { pathForMass, starStore } from '../starChoice'
import { readCapture } from '../capture'

const WIND_COUNT: Record<QualityTier, number> = { high: 5000, low: 3000, mobile: 1600 }
/** Where the wind starts (just off the star) and how far a parcel of gas travels before it fades, in disk units. */
const WIND_START = 0.35
const WIND_REACH = 6

const WIND_VERT = /* glsl */ `
  attribute vec3 aDir;
  attribute float aSeed;
  attribute float aSpeed;
  uniform float uClock;
  uniform float uSize;
  uniform float uStop;
  varying float vAlong;
  varying float vShow;
  void main() {
    // Each parcel streams straight out, at its own speed, and fades as it spreads.
    float along = fract(aSeed * 7.31 + uClock * aSpeed);
    vAlong = along;
    // Once the core has fallen in, no new gas leaves: only parcels already further out than the cut-off remain.
    vShow = step(uStop, along);
    vec3 p = aDir * (${WIND_START.toFixed(2)} + along * ${WIND_REACH.toFixed(1)});
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = clamp(uSize * (0.5 + aSeed) / -mv.z, 1.0, 5.0);
    gl_Position = projectionMatrix * mv;
  }
`
const WIND_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uHot;
  uniform vec3 uStrippedColor;
  uniform float uStripped;
  uniform float uOpacity;
  varying float vAlong;
  varying float vShow;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    // A Wolf-Rayet star's wind glows in broad helium and carbon lines: drawn teal-blue.
    vec3 col = mix(uHot, uStrippedColor, uStripped);
    gl_FragColor = vec4(col * a * pow(1.0 - vAlong, 1.6) * uOpacity * vShow, 1.0);
  }
`

function windGeometry(count: number): THREE.BufferGeometry {
  const dirs = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const speeds = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const theta = seeded(i, 1) * Math.PI * 2
    const u = seeded(i, 2) * 2 - 1
    const s = Math.sqrt(1 - u * u)
    dirs.set([Math.cos(theta) * s, u, Math.sin(theta) * s], i * 3)
    seeds[i] = seeded(i, 3)
    // Clumpy winds: parcels move at a spread of speeds.
    speeds[i] = 0.05 + 0.06 * seeded(i, 4)
  }
  const geometry = new THREE.BufferGeometry()
  // Positions are computed in the shader; the attribute only sizes the draw.
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  geometry.setAttribute('aDir', new THREE.BufferAttribute(dirs, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), WIND_START + WIND_REACH)
  return geometry
}

export function VeryMassivePath({ quality, reducedMotion }: { quality: QualityTier; reducedMotion: boolean }) {
  const state = useMemo(() => createVeryMassivePath(), [])
  const windRef = useRef<THREE.Points>(null)
  const windClock = useRef(0)

  const windGeo = useDisposable(() => windGeometry(WIND_COUNT[quality]), [quality])
  // The material never depends on the tier (a tier change mid-precompile would dispose one compileAsync is waiting on).
  const windMat = useDisposable(() => new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: getGlowTexture() },
      uClock: { value: 0 },
      uSize: { value: 42 },
      uStop: { value: 0 },
      uHot: { value: hdr(PALETTE.stellarBlue, 0.8) },
      uStrippedColor: { value: hdr(PALETTE.signal, 0.9) },
      uStripped: { value: 0 },
      uOpacity: { value: 0 },
    },
    vertexShader: WIND_VERT,
    fragmentShader: WIND_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [])

  useFrame(() => {
    const f = journeyFrame
    const wind = windRef.current
    if (!wind) return
    const t = pathProgress(f.opening)
    wind.visible = f.warmup || (t > 0 && f.handoff < 1 && pathForMass(starStore.getState().mass) === 'very-massive')
    if (!wind.visible) return
    const time = reducedMotion ? 0 : f.clock
    const s = veryMassivePath(t, time, state)
    const presence = 1 - ease(f.handoff, 0.2, 0.85)
    // A Wolf-Rayet wind is faster than the star's earlier one. The clock accumulates, so a change of speed never jumps.
    const speed = 1 + 1.5 * s.stripped
    windClock.current = readCapture().enabled ? time * speed : windClock.current + (reducedMotion ? 0 : f.dt * speed)
    const uniforms = (wind.material as THREE.ShaderMaterial).uniforms
    uniforms.uClock!.value = windClock.current
    uniforms.uStripped!.value = s.stripped
    // The wind's inner edge moves out once the core has collapsed, leaving a thinning shell.
    uniforms.uStop!.value = s.vanish
    uniforms.uOpacity!.value = s.wind * presence
  })

  return <points ref={windRef} geometry={windGeo} material={windMat} frustumCulled={false} renderOrder={5} visible={false} />
}
