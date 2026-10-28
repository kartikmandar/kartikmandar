// src/components/CosmicJourney3D/art/GlowSprite.tsx
'use client'

import type { Ref } from 'react'
import { useMemo } from 'react'
import * as THREE from 'three'
import { getGlowTexture } from './materials'
import { hdr } from './palette'

export interface GlowSpriteProps {
  color: string
  /** HDR multiplier; > 1 blooms. */
  intensity?: number
  /** World-space diameter of the halo. */
  size?: number
  position?: [number, number, number]
  opacity?: number
  ref?: Ref<THREE.Sprite>
}

/**
 * Additive soft glow, always facing the camera. Replaces stacked transparent spheres.
 * Animate via ref: sprite.material.opacity and sprite.scale (no allocation).
 */
export function GlowSprite({ color, intensity = 2, size = 1, position, opacity = 1, ref }: GlowSpriteProps) {
  const tint = useMemo(() => hdr(color, intensity), [color, intensity])
  return (
    <sprite ref={ref} position={position} scale={[size, size, 1]}>
      <spriteMaterial
        map={getGlowTexture()}
        color={tint}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </sprite>
  )
}
