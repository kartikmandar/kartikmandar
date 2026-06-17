// src/components/CosmicJourney3D/Environment.tsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import type { QualityTier } from './types'

export function Environment({ quality }: { quality: QualityTier }) {
  const nebula = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    const palette = [new THREE.Color('#6366f1'), new THREE.Color('#a78bfa'), new THREE.Color('#22d3ee')]
    const count = quality === 'mobile' ? 600 : quality === 'low' ? 1500 : 4000
    for (let i = 0; i < count; i++) {
      positions.push((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 200, -Math.random() * 260)
      const c = palette[i % palette.length]!
      colors.push(c.r, c.g, c.b)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return g
  }, [quality])

  return (
    <>
      <color attach="background" args={['#02030a']} />
      <ambientLight intensity={0.15} />
      <Stars radius={300} depth={120} count={quality === 'mobile' ? 1500 : 6000} factor={4} fade speed={0.4} />
      <points geometry={nebula}>
        <pointsMaterial size={1.4} vertexColors transparent opacity={0.35} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {quality !== 'mobile' && (
        <EffectComposer>
          <Bloom intensity={quality === 'high' ? 0.9 : 0.5} luminanceThreshold={0.2} mipmapBlur />
          <Vignette eskil={false} offset={0.15} darkness={0.85} />
        </EffectComposer>
      )}
    </>
  )
}
