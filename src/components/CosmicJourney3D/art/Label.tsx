// src/components/CosmicJourney3D/art/Label.tsx
'use client'

import type { Ref } from 'react'
import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import type * as THREE from 'three'
import { hdr, LABEL_FONT, PALETTE } from './palette'

/** Three-step in-world label scale (world units). */
export const LABEL_SIZE = { small: 0.2, body: 0.28, title: 0.42 } as const

export interface LabelProps {
  children: string
  size?: keyof typeof LABEL_SIZE
  color?: string
  intensity?: number
  position?: [number, number, number]
  anchorX?: 'left' | 'center' | 'right'
  opacity?: number
  /** Keep the given case (e.g. physics notation like "k_perp"); labels are uppercase by default. */
  preserveCase?: boolean
  ref?: Ref<THREE.Mesh>
}

/**
 * Tracked, uppercase mono label in the self-hosted font. Keep strings ASCII
 * (plus "·"): the latin subset has no arrows or Greek, and missing glyphs would
 * make troika fetch fallback fonts from a CDN. Fade via ref: mesh.fillOpacity.
 */
export function Label({
  children, size = 'small', color = PALETTE.nearWhite, intensity = 1.1, position, anchorX = 'center', opacity = 1, preserveCase = false, ref,
}: LabelProps) {
  const tint = useMemo(() => hdr(color, intensity), [color, intensity])
  return (
    <Text
      ref={ref}
      font={LABEL_FONT}
      fontSize={LABEL_SIZE[size]}
      letterSpacing={0.14}
      color={tint}
      anchorX={anchorX}
      anchorY="middle"
      position={position}
      fillOpacity={opacity}
      outlineWidth={0}
    >
      {preserveCase ? children : children.toUpperCase()}
    </Text>
  )
}
