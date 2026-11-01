// src/components/CosmicJourney3D/Environment.tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, SMAA, ToneMapping } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import type { QualityTier } from './types'
import { PALETTE } from './art/palette'
import { getGlowTexture } from './art/materials'
import { CoverAware } from './CoverAware'
import { NEBULA_ANCHOR, STATION_SPACING } from './beatsMeta'

// Nebula field reaches a little beyond the end of the flight.
const NEBULA_DEPTH = Math.abs(NEBULA_ANCHOR.position[2]) + 80

/** Mulberry32 seeded PRNG — deterministic, lint-safe replacement for Math.random(). */
function mulberry32(seed: number): () => number {
  let s = seed
  return () => {
    s += 0x6d2b79f5
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function Environment({ quality }: { quality: QualityTier }) {
  // The star shell travels with the camera, so it reads as infinitely far away however long the flight.
  const starsRef = useRef<THREE.Group>(null)
  useFrame(({ camera }) => {
    starsRef.current?.position.copy(camera.position)
  })

  const nebula = useMemo(() => {
    const rand = mulberry32(0xdeadbeef) // fixed seed → deterministic nebula
    const positions: number[] = []
    const colors: number[] = []
    const palette = [new THREE.Color('#6366f1'), new THREE.Color('#a78bfa'), new THREE.Color('#22d3ee')]
    // Scaled with the corridor's length, so the nebula keeps its density along the flight.
    const baseCount = quality === 'mobile' ? 600 : quality === 'low' ? 1500 : 4000
    const count = Math.round(baseCount * (STATION_SPACING / 8))
    for (let i = 0; i < count; i++) {
      positions.push((rand() - 0.5) * 400, (rand() - 0.5) * 200, -rand() * NEBULA_DEPTH)
      const c = palette[i % palette.length]!
      colors.push(c.r, c.g, c.b)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return g
  }, [quality])

  // Art bible post stack: bloom only on HDR emissives (> ~1), AgX tone mapping
  // applied once (here, not on the renderer), fine film grain, SMAA in place of
  // MSAA. The vignette is a CSS overlay (index.tsx), so it costs no GPU pass.
  return (
    <>
      <color attach="background" args={[PALETTE.void]} />
      {/* Distance fog matched to the background: stations emerge and dissolve instead of popping. */}
      <fogExp2 attach="fog" args={[PALETTE.void, 0.045]} />
      <ambientLight intensity={0.15} />
      {/* The prologue pass brings its own lensed sky; hide ours while it covers the screen. */}
      <CoverAware>
        <group ref={starsRef}>
          <Stars radius={300} depth={120} count={quality === 'mobile' ? 1500 : 6000} factor={4} fade speed={0.4} />
        </group>
        <points geometry={nebula}>
          <pointsMaterial map={getGlowTexture()} size={2.2} vertexColors transparent opacity={0.35} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
        </points>
      </CoverAware>
      {quality !== 'mobile' && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={quality === 'high' ? 1.1 : 0.7} luminanceThreshold={0.85} luminanceSmoothing={0.2} mipmapBlur radius={0.7} />
          <ToneMapping mode={ToneMappingMode.AGX} />
          <SMAA />
          <Noise premultiply opacity={0.035} blendFunction={BlendFunction.SOFT_LIGHT} />
        </EffectComposer>
      )}
    </>
  )
}
