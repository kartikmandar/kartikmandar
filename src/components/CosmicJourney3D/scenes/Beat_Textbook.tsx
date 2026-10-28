// src/components/CosmicJourney3D/scenes/Beat_Textbook.tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { BeatSceneProps } from '../types'
import { useBeat, type BeatHandle } from '../store'

// Acceptance: a textbook page fades; 2D outline planets (Saturn w/ rings,
// Jupiter, Mars) lift off and become shaded 3D spheres as localProgress 0->1.
// Mirrors drawPageToCosmos: pageFade = 1 - p/0.3, liftOff = p/0.6,
// become3D = (p - 0.4) / 0.6. The page fills the inner 80% (0.1..0.9), and
// planet normalized coords are relative to that inner box.

// Inner-page extent (the original draws planets inside the 0.1..0.9 page box).
// Sized to fill ~9x6 of the head-on frame; the whole group is raised by
// PAGE_Y_OFFSET so the page bottom clears the overlay floor at local Y = -1.5.
const PAGE_W = 9.2
const PAGE_H = 5.2
const PAGE_Y_OFFSET = 1.2

// id, normalized [x, y] inside the page box, world radius, color, label.
const PLANETS = [
  { id: 'saturn', x: 0.24, y: 0.42, r: 0.62, color: '#e3dccb', ring: true, label: 'Saturn' },
  { id: 'jupiter', x: 0.7, y: 0.58, r: 0.95, color: '#d8bba2', ring: false, label: 'Jupiter' },
  { id: 'mars', x: 0.82, y: 0.26, r: 0.42, color: '#d66a3e', ring: false, label: 'Mars' },
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

type TroikaText = THREE.Mesh & { fillOpacity: number }

// Fixed page border (module-level: never rebuilt).
const PAGE_BORDER = new Float32Array([
  -PAGE_W / 2, -PAGE_H / 2, 0, PAGE_W / 2, -PAGE_H / 2, 0,
  PAGE_W / 2, -PAGE_H / 2, 0, PAGE_W / 2, PAGE_H / 2, 0,
  PAGE_W / 2, PAGE_H / 2, 0, -PAGE_W / 2, PAGE_H / 2, 0,
  -PAGE_W / 2, PAGE_H / 2, 0, -PAGE_W / 2, -PAGE_H / 2, 0,
])

interface PlanetProps {
  planetIndex: number
  beat: BeatHandle
  reducedMotion: boolean
  outline: { body: Float32Array; ring: Float32Array | null }
}

function Planet({ planetIndex, beat, reducedMotion, outline }: PlanetProps) {
  const p = PLANETS[planetIndex]!
  const [bx, by] = pagePos(p.x, p.y)

  const groupRef = useRef<THREE.Group>(null)
  const shadowRef = useRef<THREE.Mesh>(null)
  const shadowMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const bodyOutlineRef = useRef<THREE.LineSegments>(null)
  const bodyOutlineMatRef = useRef<THREE.LineBasicMaterial>(null)
  const ringOutlineRef = useRef<THREE.LineSegments>(null)
  const ringOutlineMatRef = useRef<THREE.LineBasicMaterial>(null)
  const sphereRef = useRef<THREE.Mesh>(null)
  const sphereMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const labelRef = useRef<TroikaText>(null)

  useFrame(() => {
    if (!beat.near) return
    const local = beat.local
    const liftOff = Math.min(1, local / 0.6)
    const become3D = Math.max(0, (local - 0.4) / 0.6)
    const spin = (reducedMotion ? 0 : beat.clock) * (0.15 + planetIndex * 0.05)
    // liftOff raises planets toward the top (original: liftY = -liftOff * baseY * 0.5).
    const lift = liftOff * (PAGE_H / 2 - by) * 0.5

    if (groupRef.current) groupRef.current.position.y = by + lift

    const shadow = shadowRef.current
    if (shadow) {
      shadow.visible = liftOff < 1
      shadow.position.y = -lift - 0.15
      shadow.scale.set(1 - liftOff, 0.3 * (1 - liftOff), 1)
      if (shadowMatRef.current) shadowMatRef.current.opacity = 0.2 * (1 - liftOff)
    }

    const outlineVisible = become3D < 1
    if (bodyOutlineRef.current) bodyOutlineRef.current.visible = outlineVisible
    if (bodyOutlineMatRef.current) bodyOutlineMatRef.current.opacity = 1 - become3D
    if (ringOutlineRef.current) ringOutlineRef.current.visible = outlineVisible
    if (ringOutlineMatRef.current) ringOutlineMatRef.current.opacity = 1 - become3D

    const solid = become3D > 0
    if (sphereRef.current) {
      sphereRef.current.visible = solid
      sphereRef.current.rotation.y = spin
    }
    if (sphereMatRef.current) sphereMatRef.current.opacity = become3D
    if (ringRef.current) ringRef.current.visible = solid
    if (ringMatRef.current) ringMatRef.current.opacity = become3D * 0.6
    if (labelRef.current) {
      labelRef.current.visible = solid
      labelRef.current.fillOpacity = become3D
    }
  })

  return (
    <group ref={groupRef} position={[bx, by, 0]}>
      {/* Drop shadow on the page while still 2D (flattens + fades as it lifts). */}
      <mesh ref={shadowRef} position={[0, -0.15, -0.49]} scale={[1, 0.3, 1]}>
        <ringGeometry args={[0, p.r, 24]} />
        <meshBasicMaterial ref={shadowMatRef} color="#000000" transparent opacity={0.2} toneMapped={false} />
      </mesh>

      {/* Outline circle (2D), fades out as it becomes 3D. */}
      <lineSegments ref={bodyOutlineRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[outline.body, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={bodyOutlineMatRef} color="#333333" transparent opacity={1} toneMapped={false} />
      </lineSegments>

      {/* Saturn outline ring (oval) before it becomes 3D. */}
      {p.ring && outline.ring && (
        <lineSegments ref={ringOutlineRef} rotation={[0, 0, -0.3]} scale={[p.r * 1.5, p.r * 0.5, 1]}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[outline.ring, 3]} />
          </bufferGeometry>
          <lineBasicMaterial ref={ringOutlineMatRef} color="#333333" transparent opacity={1} toneMapped={false} />
        </lineSegments>
      )}

      {/* Shaded 3D sphere, fades in as become3D rises. */}
      <mesh ref={sphereRef} rotation={[0.2, 0, 0]} visible={false}>
        <sphereGeometry args={[p.r, 32, 32]} />
        <meshBasicMaterial ref={sphereMatRef} color={p.color} transparent opacity={0} toneMapped={false} />
      </mesh>

      {/* Saturn's filled ring once 3D. */}
      {p.ring && (
        <mesh ref={ringRef} rotation={[Math.PI / 2 - 0.45, 0, -0.3]} visible={false}>
          <ringGeometry args={[p.r * 1.25, p.r * 1.9, 48]} />
          <meshBasicMaterial
            ref={ringMatRef}
            color={p.color}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Name label beside each planet, fading in with the 3D body. */}
      <Text
        ref={labelRef}
        visible={false}
        position={[p.r + 0.25, p.r + 0.18, 0.1]}
        fontSize={0.34}
        color="#cfd6e6"
        anchorX="left"
        anchorY="middle"
        fillOpacity={0}
        outlineWidth={0.012}
        outlineColor="#05070f"
      >
        {p.label}
      </Text>
    </group>
  )
}

export default function Beat_Textbook({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const pageGroupRef = useRef<THREE.Group>(null)
  const pageMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const pageLineMatRef = useRef<THREE.LineBasicMaterial>(null)
  const pageTitleRef = useRef<TroikaText>(null)

  // Pre-compute outline geometry per planet (radius + optional saturn ring oval).
  const outlines = useMemo(
    () =>
      PLANETS.map((p) => ({
        body: circleSegments(p.r),
        ring: p.ring ? circleSegments(1) : null,
      })),
    [],
  )

  useFrame(() => {
    if (!beat.near) return
    const pageFade = Math.max(0, 1 - beat.local / 0.3)
    if (pageGroupRef.current) pageGroupRef.current.visible = pageFade > 0
    if (pageMatRef.current) pageMatRef.current.opacity = pageFade
    if (pageLineMatRef.current) pageLineMatRef.current.opacity = pageFade
    if (pageTitleRef.current) pageTitleRef.current.fillOpacity = pageFade
  })

  return (
    <group position={[0, PAGE_Y_OFFSET, 0]}>
      {/* Fading textbook page */}
      <group ref={pageGroupRef} position={[0, 0, -0.5]}>
        <mesh>
          <planeGeometry args={[PAGE_W, PAGE_H]} />
          <meshBasicMaterial ref={pageMatRef} color="#f0f0f0" transparent opacity={1} toneMapped={false} />
        </mesh>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[PAGE_BORDER, 3]} />
          </bufferGeometry>
          <lineBasicMaterial ref={pageLineMatRef} color="#c8c8c8" transparent opacity={1} toneMapped={false} />
        </lineSegments>
        <Text
          ref={pageTitleRef}
          position={[0, PAGE_H / 2 - 0.55, 0.01]}
          fontSize={0.5}
          color="#555"
          anchorX="center"
          anchorY="middle"
          fillOpacity={1}
        >
          The Solar System
        </Text>
      </group>

      {PLANETS.map((p, i) => (
        <Planet key={p.id} planetIndex={i} beat={beat} reducedMotion={reducedMotion} outline={outlines[i]!} />
      ))}
    </group>
  )
}
