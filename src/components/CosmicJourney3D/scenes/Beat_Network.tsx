// src/components/CosmicJourney3D/scenes/Beat_Network.tsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { SceneProps } from '../types'

// Acceptance: a central indigo node connects out to surrounding nodes one by one
// as localProgress grows; academic vs code nodes differ; connection lines + small
// flowing particles. Mirrors drawVirtualNetwork (central hub, 8 radial nodes,
// alternating academic/code, lines that draw in, particles flowing to each node).
const NODE_COUNT = 8

type NetNode = { pos: THREE.Vector3; academic: boolean; icon: string; color: string }

// Map the original 2D [0..1] layout into the XY plane of this beat's local space.
const toPos = (x: number, y: number) =>
  new THREE.Vector3((x - 0.5) * 10, (0.5 - y) * 7, 0)

const CENTER = toPos(0.5, 0.5)
const INDIGO = '#a5b4fc'
const ACADEMIC = '#fde047'
const CODE = '#4ade80'

export default function Beat_Network({ localProgress, clock, reducedMotion }: SceneProps) {
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

  // One-by-one reveal: nodesToShow whole nodes plus a partially-drawn last line.
  const reach = localProgress * NODE_COUNT
  const nodesToShow = Math.floor(reach)
  const lastLineT = reach % 1

  // Connection lines (indigo), drawing the final one in progressively.
  const linePositions = useMemo(() => {
    const arr: number[] = []
    for (let i = 0; i < nodesToShow; i++) {
      const node = nodes[i]
      if (!node) continue
      const t = i === nodesToShow - 1 && lastLineT < 1 ? lastLineT : 1
      const end = CENTER.clone().lerp(node.pos, t)
      arr.push(CENTER.x, CENTER.y, CENTER.z, end.x, end.y, end.z)
    }
    return new Float32Array(arr)
  }, [nodes, nodesToShow, lastLineT])

  // Particles flowing from center toward each revealed node, colored by type.
  const drift = reducedMotion ? 0.4 : (clock * 0.5) % 1
  const { particlePos, particleCol } = useMemo(() => {
    const pos: number[] = []
    const col: number[] = []
    for (let i = 0; i < nodesToShow; i++) {
      const node = nodes[i]
      if (!node) continue
      const t = (drift + i * 0.13) % 1
      const p = CENTER.clone().lerp(node.pos, t)
      pos.push(p.x, p.y, p.z)
      const c = new THREE.Color(node.color)
      col.push(c.r, c.g, c.b)
    }
    return { particlePos: new Float32Array(pos), particleCol: new Float32Array(col) }
  }, [nodes, nodesToShow, drift])

  const spin = reducedMotion ? 0 : Math.sin(clock * 0.15) * 0.06

  return (
    <group rotation={[0, 0, spin]}>
      {/* Central indigo hub */}
      <mesh position={CENTER}>
        <sphereGeometry args={[0.34, 24, 24]} />
        <meshBasicMaterial color={INDIGO} toneMapped={false} />
      </mesh>
      <mesh position={CENTER}>
        <sphereGeometry args={[0.55, 20, 20]} />
        <meshBasicMaterial color={INDIGO} transparent opacity={0.18} toneMapped={false} />
      </mesh>

      {/* Surrounding academic / code nodes, revealed one by one */}
      {nodes.map((node, i) => {
        if (i >= nodesToShow) return null
        const appear = i === nodesToShow - 1 ? lastLineT : 1
        return (
          <group key={`n${i}`} position={node.pos}>
            <mesh>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshBasicMaterial color={node.color} transparent opacity={appear} toneMapped={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.38, 14, 14]} />
              <meshBasicMaterial color={node.color} transparent opacity={0.15 * appear} toneMapped={false} />
            </mesh>
            <Text
              position={[0, 0.55, 0]}
              fontSize={0.42}
              color={node.color}
              anchorX="center"
              anchorY="middle"
              fillOpacity={appear}
            >
              {node.icon}
            </Text>
          </group>
        )
      })}

      {/* Indigo connection lines from hub to each node */}
      {linePositions.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={INDIGO} transparent opacity={0.45} toneMapped={false} />
        </lineSegments>
      )}

      {/* Small flowing particles travelling outward along each line */}
      {particlePos.length > 0 && (
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[particlePos, 3]} />
            <bufferAttribute attach="attributes-color" args={[particleCol, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.22} vertexColors transparent opacity={0.95} sizeAttenuation toneMapped={false} />
        </points>
      )}
    </group>
  )
}
