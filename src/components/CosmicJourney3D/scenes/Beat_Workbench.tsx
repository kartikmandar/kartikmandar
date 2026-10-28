// src/components/CosmicJourney3D/scenes/Beat_Workbench.tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'

// Acceptance: three overlapping phases mirroring drawCelestialWorkbench —
//  1) Cygnus X-1 black hole with 5 expanding red/blue accretion rings,
//  2) an indigo RRIViz/EM-solver grid, and
//  3) a glowing crystal (lower-right) that drags floating LaTeX glyphs in to be absorbed.
// Grid framed to the composition bounds (9 wide x ~5 tall, top edge above Y=4).
const EXT_X = 9
const GRID_TOP = 3.7
const GRID_BOTTOM = -1.4 // keep the solver grid above the overlay copy band
// Crystal moved up and in so it (and its glyph swarm) stay within frame.
const CRYSTAL = [2.4, 1.0] as const
const GLYPHS = ['∫', 'Σ', 'a/b', 'α', '∇'] as const
const GRID_LINES = 11 // half-resolution of the original 20 for a clean 3D grid

// 15 glyphs scattered around the crystal, each drifting in to be absorbed.
const PARTICLES = Array.from({ length: 15 }, (_, i) => {
  const a = (i / 15) * Math.PI * 2
  const r = 1.4 + (i % 4) * 0.45
  return {
    x: Math.cos(a) * r,
    y: Math.sin(a) * r * 0.8,
    text: GLYPHS[i % GLYPHS.length] ?? 'α',
  }
})

const RING_COUNT = 5
const TORUS_RADIAL = 12
const TORUS_TUBULAR = 64
const RING_COLORS = ['#ff6464', '#96b4ff', '#ff6464', '#96b4ff', '#ff6464'] as const

// Torus vertex order matches THREE.TorusGeometry: index = j * (tubular + 1) + i.
const COS_U = new Float64Array(TORUS_TUBULAR + 1)
const SIN_U = new Float64Array(TORUS_TUBULAR + 1)
const COS_V = new Float64Array(TORUS_RADIAL + 1)
const SIN_V = new Float64Array(TORUS_RADIAL + 1)
for (let i = 0; i <= TORUS_TUBULAR; i++) {
  const u = (i / TORUS_TUBULAR) * Math.PI * 2
  COS_U[i] = Math.cos(u)
  SIN_U[i] = Math.sin(u)
}
for (let j = 0; j <= TORUS_RADIAL; j++) {
  const v = (j / TORUS_RADIAL) * Math.PI * 2
  COS_V[j] = Math.cos(v)
  SIN_V[j] = Math.sin(v)
}

/** Rewrites a TorusGeometry's vertices in place for a new (radius, tube) pair. */
function writeTorus(geometry: THREE.BufferGeometry, radius: number, tube: number) {
  const position = geometry.attributes.position as THREE.BufferAttribute
  let k = 0
  for (let j = 0; j <= TORUS_RADIAL; j++) {
    const ring = radius + tube * COS_V[j]!
    const z = tube * SIN_V[j]!
    for (let i = 0; i <= TORUS_TUBULAR; i++) {
      position.setXYZ(k++, ring * COS_U[i]!, ring * SIN_U[i]!, z)
    }
  }
  position.needsUpdate = true
}

type GlyphMesh = THREE.Mesh & { fillOpacity: number }

export default function Beat_Workbench({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)

  const gridRef = useRef<THREE.LineSegments>(null)
  const cygnusRef = useRef<THREE.Group>(null)
  const horizonRef = useRef<THREE.Mesh>(null)
  const ringRefs = useRef<Array<THREE.Mesh | null>>([])
  const crystalGroupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const wireRef = useRef<THREE.Mesh>(null)
  const glyphRefs = useRef<Array<GlyphMesh | null>>([])
  const settledRef = useRef<GlyphMesh | null>(null)

  // Indigo solver grid: vertical + horizontal segments across the framed extent.
  const gridPositions = useMemo(() => {
    const arr: number[] = []
    for (let i = 0; i < GRID_LINES; i++) {
      const t = i / (GRID_LINES - 1)
      const fx = (t - 0.5) * EXT_X
      const fy = GRID_BOTTOM + t * (GRID_TOP - GRID_BOTTOM)
      arr.push(fx, GRID_BOTTOM, 0, fx, GRID_TOP, 0)
      arr.push(-EXT_X / 2, fy, 0, EXT_X / 2, fy, 0)
    }
    return new Float32Array(arr)
  }, [])

  useFrame(() => {
    if (!beat.near) return
    const localProgress = beat.local
    // Phase envelopes copied from the 2D source's progress windows.
    const cygnus = Math.min(1, localProgress / 0.5)
    const grid = Math.max(0, (localProgress - 0.2) / 0.6)
    const latex = Math.max(0, (localProgress - 0.5) / 0.5)
    const spin = reducedMotion ? 0 : beat.clock * 0.15

    // Phase 2 — indigo grid.
    const gridLines = gridRef.current
    if (gridLines) {
      gridLines.visible = grid > 0
      ;(gridLines.material as THREE.LineBasicMaterial).opacity = grid * 0.35
    }

    // Phase 1 — Cygnus X-1.
    const cygnusGroup = cygnusRef.current
    if (cygnusGroup) {
      cygnusGroup.visible = cygnus > 0
      cygnusGroup.rotation.z = Math.PI * 0.1 + spin * 0.3
      horizonRef.current?.scale.setScalar(Math.max(cygnus, 1e-6))
      for (let i = 0; i < RING_COUNT; i++) {
        const ring = ringRefs.current[i]
        if (!ring) continue
        const ringProgress = Math.max(0, (cygnus - i * 0.1) / (1 - i * 0.1))
        ring.visible = ringProgress > 0
        if (ringProgress <= 0) continue
        const radius = 0.8 * (1.2 + i * 0.6) * ringProgress
        const alpha = (1 - i / 5) * 0.6 * ringProgress
        const tube = 0.12 * (1 - i / 5) * ringProgress + 0.01
        writeTorus(ring.geometry, radius, tube)
        ;(ring.material as THREE.MeshBasicMaterial).opacity = alpha
      }
    }

    // Phase 3 — crystal + glyph swarm.
    const crystalGroup = crystalGroupRef.current
    if (crystalGroup) {
      crystalGroup.visible = latex > 0
      const core = coreRef.current
      if (core) {
        core.rotation.set(0, spin, spin * 0.5)
        core.scale.setScalar(0.7 * latex)
        ;(core.material as THREE.MeshBasicMaterial).opacity = 0.35 + latex * 0.4
      }
      const wire = wireRef.current
      if (wire) {
        wire.rotation.set(spin * 0.5, 0, spin)
        wire.scale.setScalar(0.95 * latex)
        ;(wire.material as THREE.MeshBasicMaterial).opacity = latex * 0.8
      }
      for (let i = 0; i < PARTICLES.length; i++) {
        const glyph = glyphRefs.current[i]
        if (!glyph) continue
        const particle = PARTICLES[i]!
        const pull = Math.min(1, latex * 1.2 + (i % 5) * 0.04)
        glyph.position.set(particle.x * (1 - pull), particle.y * (1 - pull), 0.1)
        glyph.fillOpacity = pull > 0.9 ? 0 : Math.max(0.2, 1 - latex * 0.5)
      }
      const settled = settledRef.current
      if (settled) {
        settled.visible = latex > 0.6
        settled.scale.setScalar(Math.max(latex, 1e-6))
        settled.fillOpacity = latex
      }
    }
  })

  return (
    <group>
      {/* Phase 2 — RRIViz / EM-solver indigo grid (behind everything). */}
      <lineSegments ref={gridRef} position={[0, 0, -0.5]} visible={false} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[gridPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#a5b4fc" transparent opacity={0} toneMapped={false} />
      </lineSegments>

      {/* Phase 1 — Cygnus X-1: event-horizon sphere + 5 expanding accretion rings. */}
      <group ref={cygnusRef} position={[-1.6, 1.2, 0]} rotation={[0, 0, Math.PI * 0.1]} scale={1.15} visible={false}>
        <mesh ref={horizonRef}>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshBasicMaterial color="#000000" toneMapped={false} />
        </mesh>
        {RING_COLORS.map((color, i) => (
          <mesh
            key={`ring${i}`}
            ref={(mesh) => {
              ringRefs.current[i] = mesh
            }}
            rotation={[Math.PI / 2, 0, 0]}
            visible={false}
            frustumCulled={false}
          >
            <torusGeometry args={[1, 0.1, TORUS_RADIAL, TORUS_TUBULAR]} />
            <meshBasicMaterial color={color} transparent opacity={0} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* Phase 3 — glowing crystal that absorbs drifting LaTeX glyph sprites. */}
      <group ref={crystalGroupRef} position={[CRYSTAL[0], CRYSTAL[1], 0.2]} visible={false}>
        {/* Crystal core: a faceted icosahedron, pale glowing blue. */}
        <mesh ref={coreRef} scale={0.0001}>
          <icosahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#c8dcff" transparent opacity={0.35} toneMapped={false} />
        </mesh>
        <mesh ref={wireRef} scale={0.0001}>
          <icosahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#dcefff" wireframe transparent opacity={0} toneMapped={false} />
        </mesh>

        {/* Glyphs drift from their scatter position toward the crystal as latex→1. */}
        {PARTICLES.map((particle, i) => (
          <Text
            key={`g${i}`}
            ref={(mesh) => {
              glyphRefs.current[i] = mesh as unknown as GlyphMesh | null
            }}
            position={[particle.x, particle.y, 0.1]}
            fontSize={0.42}
            color="#fde047"
            anchorX="center"
            anchorY="middle"
            fillOpacity={0}
            outlineWidth={0}
          >
            {particle.text}
          </Text>
        ))}

        {/* The settled symbol glowing inside the crystal once absorption completes. */}
        <Text
          ref={(mesh) => {
            settledRef.current = mesh as unknown as GlyphMesh | null
          }}
          position={[0, 0, 0.6]}
          fontSize={0.7}
          color="#fde047"
          anchorX="center"
          anchorY="middle"
          fillOpacity={0}
          outlineWidth={0}
          visible={false}
        >
          ∫
        </Text>
      </group>
    </group>
  )
}
