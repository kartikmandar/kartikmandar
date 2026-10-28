// src/components/CosmicJourney3D/art/LightLine.tsx
'use client'

import type { ComponentRef, Ref } from 'react'
import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { hdr } from './palette'

export type LightLineObject = ComponentRef<typeof Line>

export interface LightLineProps {
  points: ReadonlyArray<THREE.Vector3 | [number, number, number]>
  color: string
  /** HDR multiplier; > 1 blooms. */
  intensity?: number
  /** Width in world units (fat line, no 1px aliasing). */
  width?: number
  opacity?: number
  segments?: boolean
  dashed?: boolean
  dashSize?: number
  gapSize?: number
  ref?: Ref<LightLineObject>
}

/** Fat, glowing hairline in world units. Draw it on with setLineReveal(ref.current, p). */
export function LightLine({
  points, color, intensity = 2, width = 0.02, opacity = 1, segments, dashed, dashSize, gapSize, ref,
}: LightLineProps) {
  const tint = useMemo(() => hdr(color, intensity), [color, intensity])
  return (
    <Line
      ref={ref}
      points={points as Array<THREE.Vector3 | [number, number, number]>}
      color={tint}
      lineWidth={width}
      worldUnits
      transparent
      opacity={opacity}
      depthWrite={false}
      toneMapped
      segments={segments}
      dashed={dashed}
      dashSize={dashSize}
      gapSize={gapSize}
    />
  )
}

/**
 * Reveals the first `p` (0..1) of a line by limiting drawn segment instances.
 * No allocation; works because Line2 geometry is an InstancedBufferGeometry.
 */
export function setLineReveal(line: LightLineObject | null, p: number): void {
  if (!line) return
  const geometry = line.geometry as THREE.InstancedBufferGeometry & { _maxInstanceCount?: number }
  const start = geometry.attributes.instanceStart as THREE.InterleavedBufferAttribute | undefined
  const total = start ? start.count : 0
  geometry.instanceCount = Math.max(0, Math.min(total, Math.round(total * Math.max(0, Math.min(1, p)))))
}

/** Sets a line's opacity in place. */
export function setLineOpacity(line: LightLineObject | null, opacity: number): void {
  if (!line) return
  const material = line.material as THREE.Material
  material.opacity = opacity
  line.visible = opacity > 0.001
}
