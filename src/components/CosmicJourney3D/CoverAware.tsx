// src/components/CosmicJourney3D/CoverAware.tsx
'use client'

import { useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { journeyFrame } from './store'

/** Hides its children while the prologue pass covers the whole screen (no wasted draws), except during warm-up. */
export function CoverAware({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    if (ref.current) ref.current.visible = journeyFrame.warmup || !journeyFrame.covered
  })
  return <group ref={ref}>{children}</group>
}
