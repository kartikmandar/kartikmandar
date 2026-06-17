// src/components/CosmicJourney3D/scenes/Beat_Textbook.tsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { SceneProps } from '../types'

// Acceptance: a textbook page fades; 2D outline planets (Saturn w/ rings,
// Jupiter, Mars) lift off and become shaded 3D spheres as localProgress 0->1.
// Mirrors drawPageToCosmos: pageFade = 1 - p/0.3, liftOff = p/0.6,
// become3D = (p - 0.4) / 0.6. The page fills the inner 80% (0.1..0.9), and
// planet normalized coords are relative to that inner box.

// Inner-page extent (the original draws planets inside the 0.1..0.9 page box).
const PAGE_W = 10 * 0.8
const PAGE_H = 7 * 0.8

// id, normalized [x, y] inside the page box, world radius, color.
const PLANETS = [
  { id: 'saturn', x: 0.25, y: 0.4, r: 0.5, color: '#e3dccb', ring: true },
  { id: 'jupiter', x: 0.7, y: 0.6, r: 0.8, color: '#d8bba2', ring: false },
  { id: 'mars', x: 0.8, y: 0.25, r: 0.36, color: '#d66a3e', ring: false },
] as const

// Map a normalized page coord [0..1] into local XY (page box centered at origin).
const pagePos = (nx: number, ny: number): [number, number] => [
  (nx - 0.5) * PAGE_W,
  (0.5 - ny) * PAGE_H,
]

// Build XY segment pairs for a closed outline circle (for <lineSegments>).
const circleSegments = (radius: number, seg = 48): Float32Array => {
  const arr = new Float32Array(seg * 6)
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * Math.PI * 2
    const a1 = ((i + 1) / seg) * Math.PI * 2
    arr[i * 6] = Math.cos(a0) * radius
    arr[i * 6 + 1] = Math.sin(a0) * radius
    arr[i * 6 + 2] = 0
    arr[i * 6 + 3] = Math.cos(a1) * radius
    arr[i * 6 + 4] = Math.sin(a1) * radius
    arr[i * 6 + 5] = 0
  }
  return arr
}

export default function Beat_Textbook({ localProgress, clock, reducedMotion }: SceneProps) {
  const pageFade = Math.max(0, 1 - localProgress / 0.3)
  const liftOff = Math.min(1, localProgress / 0.6)
  const become3D = Math.max(0, (localProgress - 0.4) / 0.6)
  const drift = reducedMotion ? 0 : clock

  // Pre-compute outline geometry per planet (radius + optional saturn ring oval).
  const outlines = useMemo(
    () =>
      PLANETS.map((p) => ({
        body: circleSegments(p.r),
        ring: p.ring ? circleSegments(1) : null,
      })),
    [],
  )

  return (
    <group>
      {/* Fading textbook page */}
      {pageFade > 0 && (
        <group position={[0, 0, -0.5]}>
          <mesh>
            <planeGeometry args={[PAGE_W, PAGE_H]} />
            <meshBasicMaterial color="#f0f0f0" transparent opacity={pageFade} toneMapped={false} />
          </mesh>
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[
                  new Float32Array([
                    -PAGE_W / 2, -PAGE_H / 2, 0, PAGE_W / 2, -PAGE_H / 2, 0,
                    PAGE_W / 2, -PAGE_H / 2, 0, PAGE_W / 2, PAGE_H / 2, 0,
                    PAGE_W / 2, PAGE_H / 2, 0, -PAGE_W / 2, PAGE_H / 2, 0,
                    -PAGE_W / 2, PAGE_H / 2, 0, -PAGE_W / 2, -PAGE_H / 2, 0,
                  ]),
                  3,
                ]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#c8c8c8" transparent opacity={pageFade} toneMapped={false} />
          </lineSegments>
          <Text position={[0, PAGE_H / 2 - 0.5, 0.01]} fontSize={0.35} color="#666" anchorX="center" fillOpacity={pageFade}>
            The Solar System
          </Text>
        </group>
      )}

      {PLANETS.map((p, i) => {
        const [bx, by] = pagePos(p.x, p.y)
        // liftOff raises planets toward the top (original: liftY = -liftOff * baseY * 0.5).
        const y = by + liftOff * (PAGE_H / 2 - by) * 0.5
        const outline = outlines[i]!
        const spin = drift * (0.15 + i * 0.05)
        return (
          <group key={p.id} position={[bx, y, 0]}>
            {/* Drop shadow on the page while still 2D (flattens + fades as it lifts). */}
            {liftOff < 1 && (
              <mesh position={[0, -(y - by) - 0.15, -0.49]} scale={[1 - liftOff, 0.3 * (1 - liftOff), 1]}>
                <ringGeometry args={[0, p.r, 24]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.2 * (1 - liftOff)} toneMapped={false} />
              </mesh>
            )}

            {/* Outline circle (2D), fades out as it becomes 3D. */}
            {become3D < 1 && outline.body.length > 0 && (
              <lineSegments>
                <bufferGeometry>
                  <bufferAttribute attach="attributes-position" args={[outline.body, 3]} />
                </bufferGeometry>
                <lineBasicMaterial color="#333333" transparent opacity={1 - become3D} toneMapped={false} />
              </lineSegments>
            )}

            {/* Saturn outline ring (oval) before it becomes 3D. */}
            {p.ring && become3D < 1 && outline.ring && (
              <lineSegments rotation={[0, 0, -0.3]} scale={[p.r * 1.5, p.r * 0.5, 1]}>
                <bufferGeometry>
                  <bufferAttribute attach="attributes-position" args={[outline.ring, 3]} />
                </bufferGeometry>
                <lineBasicMaterial color="#333333" transparent opacity={1 - become3D} toneMapped={false} />
              </lineSegments>
            )}

            {/* Shaded 3D sphere, fades in as become3D rises. */}
            {become3D > 0 && (
              <mesh rotation={[0.2, spin, 0]}>
                <sphereGeometry args={[p.r, 32, 32]} />
                <meshBasicMaterial color={p.color} transparent opacity={become3D} toneMapped={false} />
              </mesh>
            )}

            {/* Saturn's filled ring once 3D. */}
            {p.ring && become3D > 0 && (
              <mesh rotation={[Math.PI / 2 - 0.45, 0, -0.3]}>
                <ringGeometry args={[p.r * 1.25, p.r * 1.9, 48]} />
                <meshBasicMaterial
                  color={p.color}
                  transparent
                  opacity={become3D * 0.6}
                  side={THREE.DoubleSide}
                  toneMapped={false}
                />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}
