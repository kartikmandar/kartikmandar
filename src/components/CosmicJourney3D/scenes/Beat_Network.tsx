// src/components/CosmicJourney3D/scenes/Beat_Network.tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'

// Acceptance: a central indigo node connects out to surrounding nodes one by one
// as localProgress grows; academic vs code nodes differ; connection lines + small
// flowing particles. Mirrors drawVirtualNetwork (central hub, 8 radial nodes,
// alternating academic/code, lines that draw in, particles flowing to each node).
const NODE_COUNT = 8

type NetNode = { pos: THREE.Vector3; academic: boolean; icon: string; color: string }
type TroikaText = THREE.Mesh & { fillOpacity: number }

// Map the original 2D [0..1] layout into the XY plane of this beat's local space.
// Widen the spread so the hub-and-spokes fill ~9x6, and lift the whole graph up
// ~0.9 units so the lowest node clears the overlay's reserved bottom band.
const Y_LIFT = 1.2
const toPos = (x: number, y: number) =>
  new THREE.Vector3((x - 0.5) * 14, (0.5 - y) * 9 + Y_LIFT, 0)

const CENTER = toPos(0.5, 0.5)
const INDIGO = '#a5b4fc'
const ACADEMIC = '#fde047'
const CODE = '#4ade80'

export default function Beat_Network({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)

  // Deterministic radial layout matching generateNetworkNodes(8).
  const nodes = useMemo<NetNode[]>(() => {
    return Array.from({ length: NODE_COUNT }, (_, i) => {
      const angle = (i / NODE_COUNT) * Math.PI * 2 + Math.PI / 4
      const radius = 0.32
      const academic = i % 2 === 0
      return {
        pos: toPos(0.5 + Math.cos(angle) * radius, 0.5 + Math.sin(angle) * radius * 0.8),
        academic,
        icon: academic ? 'M' : '</>',
        color: academic ? ACADEMIC : CODE,
      }
    })
  }, [])

  // Fixed-size buffers (updated in place): hub-to-node segments and flowing particles.
  const linePositions = useMemo(() => new Float32Array(NODE_COUNT * 6), [])
  const particlePositions = useMemo(() => new Float32Array(NODE_COUNT * 3), [])
  const particleColors = useMemo(() => {
    const colors = new Float32Array(NODE_COUNT * 3)
    const scratchColor = new THREE.Color()
    nodes.forEach((node, i) => {
      scratchColor.set(node.color)
      colors[i * 3] = scratchColor.r
      colors[i * 3 + 1] = scratchColor.g
      colors[i * 3 + 2] = scratchColor.b
    })
    return colors
  }, [nodes])

  const spinGroupRef = useRef<THREE.Group>(null)
  const lineGeometryRef = useRef<THREE.BufferGeometry>(null)
  const particleGeometryRef = useRef<THREE.BufferGeometry>(null)
  const nodeGroupsRef = useRef<Array<THREE.Group | null>>([])
  const coreMaterialsRef = useRef<Array<THREE.MeshBasicMaterial | null>>([])
  const haloMaterialsRef = useRef<Array<THREE.MeshBasicMaterial | null>>([])
  const labelsRef = useRef<Array<TroikaText | null>>([])

  useFrame(() => {
    if (!beat.near) return
    const p = beat.local
    const t = beat.clock

    // One-by-one reveal: nodesToShow whole nodes plus a partially-drawn last line.
    const reach = p * NODE_COUNT
    const nodesToShow = Math.floor(reach)
    const lastLineT = reach % 1
    const drift = reducedMotion ? 0.4 : (t * 0.5) % 1

    const spinGroup = spinGroupRef.current
    if (spinGroup) spinGroup.rotation.z = reducedMotion ? 0 : Math.sin(t * 0.15) * 0.06

    const lineGeometry = lineGeometryRef.current
    const particleGeometry = particleGeometryRef.current
    const lineArray = lineGeometry?.attributes.position!.array as Float32Array | undefined
    const particleArray = particleGeometry?.attributes.position!.array as Float32Array | undefined

    for (let i = 0; i < NODE_COUNT; i++) {
      const node = nodes[i]!
      const nodeGroup = nodeGroupsRef.current[i]
      const shown = i < nodesToShow
      if (nodeGroup) nodeGroup.visible = shown
      if (shown && lineArray && particleArray) {
        const appear = i === nodesToShow - 1 ? lastLineT : 1
        const core = coreMaterialsRef.current[i]
        const halo = haloMaterialsRef.current[i]
        const label = labelsRef.current[i]
        if (core) core.opacity = appear
        if (halo) halo.opacity = 0.15 * appear
        if (label) label.fillOpacity = appear

        // Connection line, drawing the final one in progressively.
        const lineT = i === nodesToShow - 1 && lastLineT < 1 ? lastLineT : 1
        const lo = i * 6
        lineArray[lo] = CENTER.x
        lineArray[lo + 1] = CENTER.y
        lineArray[lo + 2] = CENTER.z
        lineArray[lo + 3] = CENTER.x + (node.pos.x - CENTER.x) * lineT
        lineArray[lo + 4] = CENTER.y + (node.pos.y - CENTER.y) * lineT
        lineArray[lo + 5] = CENTER.z + (node.pos.z - CENTER.z) * lineT

        // Particle flowing from the hub toward this node.
        const particleT = (drift + i * 0.13) % 1
        const po = i * 3
        particleArray[po] = CENTER.x + (node.pos.x - CENTER.x) * particleT
        particleArray[po + 1] = CENTER.y + (node.pos.y - CENTER.y) * particleT
        particleArray[po + 2] = CENTER.z + (node.pos.z - CENTER.z) * particleT
      }
    }

    if (lineGeometry) {
      lineGeometry.attributes.position!.needsUpdate = true
      lineGeometry.setDrawRange(0, nodesToShow * 2)
    }
    if (particleGeometry) {
      particleGeometry.attributes.position!.needsUpdate = true
      particleGeometry.setDrawRange(0, nodesToShow)
    }
  })

  return (
    <group ref={spinGroupRef}>
      {/* Central indigo hub */}
      <mesh position={CENTER}>
        <sphereGeometry args={[0.46, 24, 24]} />
        <meshBasicMaterial color={INDIGO} toneMapped={false} />
      </mesh>
      <mesh position={CENTER}>
        <sphereGeometry args={[0.74, 20, 20]} />
        <meshBasicMaterial color={INDIGO} transparent opacity={0.18} toneMapped={false} />
      </mesh>

      {/* Surrounding academic / code nodes, revealed one by one */}
      {nodes.map((node, i) => (
        <group
          key={`n${i}`}
          ref={(group) => {
            nodeGroupsRef.current[i] = group
          }}
          position={node.pos}
          visible={false}
        >
          <mesh>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshBasicMaterial
              ref={(material) => {
                coreMaterialsRef.current[i] = material
              }}
              color={node.color}
              transparent
              opacity={0}
              toneMapped={false}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.46, 14, 14]} />
            <meshBasicMaterial
              ref={(material) => {
                haloMaterialsRef.current[i] = material
              }}
              color={node.color}
              transparent
              opacity={0}
              toneMapped={false}
            />
          </mesh>
          <Text
            ref={(label) => {
              labelsRef.current[i] = label as TroikaText | null
            }}
            position={[0, 0.5, 0]}
            fontSize={0.4}
            color={node.color}
            anchorX="center"
            anchorY="middle"
            fillOpacity={0}
          >
            {node.icon}
          </Text>
        </group>
      ))}

      {/* Indigo connection lines from hub to each node */}
      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={lineGeometryRef} drawRange={{ start: 0, count: 0 }}>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={INDIGO} transparent opacity={0.6} toneMapped={false} />
      </lineSegments>

      {/* Small flowing particles travelling outward along each line */}
      <points frustumCulled={false}>
        <bufferGeometry ref={particleGeometryRef} drawRange={{ start: 0, count: 0 }}>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[particleColors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.22} vertexColors transparent opacity={0.95} sizeAttenuation toneMapped={false} />
      </points>
    </group>
  )
}
