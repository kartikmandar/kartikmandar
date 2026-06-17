// src/components/CosmicJourney3D/scenes/Beat_Workbench.tsx
'use client'

import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import type { SceneProps } from '../types'

// Acceptance: three overlapping phases mirroring drawCelestialWorkbench —
//  1) Cygnus X-1 black hole with 5 expanding red/blue accretion rings,
//  2) an indigo RRIViz/EM-solver grid, and
//  3) a glowing crystal (lower-right) that drags floating LaTeX glyphs in to be absorbed.
const EXT_X = 10
const EXT_Y = 7
// Crystal sits at the original's (w*0.8, h*0.75) anchor, mapped into local space.
const CRYSTAL = [(0.8 - 0.5) * EXT_X, (0.5 - 0.75) * EXT_Y] as const
const GLYPHS = ['∫', 'Σ', 'a/b', 'α', '∇'] as const
const GRID_LINES = 11 // half-resolution of the original 20 for a clean 3D grid

// 15 glyphs scattered across the field, each drifting toward the crystal.
const PARTICLES = Array.from({ length: 15 }, (_, i) => {
  const a = (i / 15) * Math.PI * 2
  const r = 3.2 + (i % 4) * 0.9
  return {
    x: Math.cos(a) * r * 0.9,
    y: Math.sin(a) * r * 0.6,
    text: GLYPHS[i % GLYPHS.length] ?? 'α',
  }
})

export default function Beat_Workbench({ localProgress, clock, reducedMotion }: SceneProps) {
  // Phase envelopes copied from the 2D source's progress windows.
  const cygnus = Math.min(1, localProgress / 0.5)
  const grid = Math.max(0, (localProgress - 0.2) / 0.6)
  const latex = Math.max(0, (localProgress - 0.5) / 0.5)
  const spin = reducedMotion ? 0 : clock * 0.15

  // Indigo solver grid: vertical + horizontal segments across the full extent.
  const gridPositions = useMemo(() => {
    const arr: number[] = []
    for (let i = 0; i < GRID_LINES; i++) {
      const fx = (i / (GRID_LINES - 1) - 0.5) * EXT_X
      const fy = (i / (GRID_LINES - 1) - 0.5) * EXT_Y
      arr.push(fx, -EXT_Y / 2, 0, fx, EXT_Y / 2, 0)
      arr.push(-EXT_X / 2, fy, 0, EXT_X / 2, fy, 0)
    }
    return new Float32Array(arr)
  }, [])

  return (
    <group>
      {/* Phase 2 — RRIViz / EM-solver indigo grid (behind everything). */}
      {grid > 0 && (
        <lineSegments position={[0, 0, -0.5]}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[gridPositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#a5b4fc" transparent opacity={grid * 0.35} toneMapped={false} />
        </lineSegments>
      )}

      {/* Phase 1 — Cygnus X-1: event-horizon sphere + 5 expanding accretion rings. */}
      {cygnus > 0 && (
        <group rotation={[0, 0, Math.PI * 0.1 + spin * 0.3]}>
          <mesh>
            <sphereGeometry args={[0.55 * cygnus, 32, 32]} />
            <meshBasicMaterial color="#000000" toneMapped={false} />
          </mesh>
          {Array.from({ length: 5 }, (_, i) => {
            const ringProgress = Math.max(0, (cygnus - i * 0.1) / (1 - i * 0.1))
            if (ringProgress <= 0) return null
            const radius = 0.8 * (1.2 + i * 0.6) * ringProgress
            const alpha = (1 - i / 5) * 0.6 * ringProgress
            const tube = 0.12 * (1 - i / 5) * ringProgress + 0.01
            // Alternate the warm/cool Doppler-shifted halves of the disk.
            const color = i % 2 === 0 ? '#ff6464' : '#96b4ff'
            return (
              <mesh key={`ring${i}`} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[radius, tube, 12, 64]} />
                <meshBasicMaterial color={color} transparent opacity={alpha} toneMapped={false} />
              </mesh>
            )
          })}
        </group>
      )}

      {/* Phase 3 — glowing crystal that absorbs drifting LaTeX glyph sprites. */}
      {latex > 0 && (
        <group position={[CRYSTAL[0], CRYSTAL[1], 0.2]}>
          {/* Crystal core: a faceted icosahedron, pale glowing blue. */}
          <mesh rotation={[0, spin, spin * 0.5]} scale={0.7 * latex}>
            <icosahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color="#c8dcff" transparent opacity={0.35 + latex * 0.4} toneMapped={false} />
          </mesh>
          <mesh rotation={[spin * 0.5, 0, spin]} scale={0.95 * latex}>
            <icosahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color="#dcefff" wireframe transparent opacity={latex * 0.8} toneMapped={false} />
          </mesh>

          {/* Glyphs drift from their scatter position toward the crystal as latex→1. */}
          {PARTICLES.map((p, i) => {
            const pull = Math.min(1, latex * 1.2 + (i % 5) * 0.04)
            const gx = p.x * (1 - pull)
            const gy = p.y * (1 - pull)
            const absorbed = pull > 0.9
            const op = absorbed ? 0 : Math.max(0.2, 1 - latex * 0.5)
            return (
              <Text
                key={`g${i}`}
                position={[gx, gy, 0.1]}
                fontSize={0.55}
                color="#fde047"
                anchorX="center"
                anchorY="middle"
                fillOpacity={op}
                outlineWidth={0}
              >
                {p.text}
              </Text>
            )
          })}

          {/* The settled symbol glowing inside the crystal once absorption completes. */}
          {latex > 0.6 && (
            <Text
              position={[0, 0, 0.6]}
              fontSize={0.7 * latex}
              color="#fde047"
              anchorX="center"
              anchorY="middle"
              fillOpacity={latex}
              outlineWidth={0}
            >
              ∫
            </Text>
          )}
        </group>
      )}
    </group>
  )
}
