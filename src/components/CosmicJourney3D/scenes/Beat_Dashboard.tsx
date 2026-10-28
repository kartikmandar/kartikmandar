// src/components/CosmicJourney3D/scenes/Beat_Dashboard.tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'

// Acceptance: a software dashboard assembles in phases — wireframe rectangles ->
// sliding panels -> content + three small plots (light curve, power-spectrum
// bars, phase-lag scatter). Mirrors drawBuildingDashboard's metaphor in 3D.

// Original 2D layout: dash at [0.15,0.15] sized [0.7,0.7] in a [0..1] box.
// Scaled to fill ~9w x 5.3h and lifted so the dashboard's lower edge stays
// above the overlay copy band (local Y > -1.5). The 0.7-wide dash spans
// X in [-4.5, 4.5]; OFFSET_Y raises the whole frame so its bottom lands ~-1.3.
const SX = 12.857
const SY = 7.571
const OFFSET_Y = 1.35
const mapX = (x: number) => (x - 0.5) * SX
const mapY = (y: number) => (0.5 - y) * SY + OFFSET_Y

const DASH_X = 0.15
const DASH_Y = 0.15
const DASH_W = 0.7
const DASH_H = 0.7
const SIDEBAR_W = DASH_W * 0.25
const HEADER_H = DASH_H * 0.1

// Outlined rectangle as line loop in normalized space, mapped to local XY at z.
function rectPositions(nx: number, ny: number, nw: number, nh: number, z = 0): Float32Array {
  const x0 = mapX(nx)
  const x1 = mapX(nx + nw)
  const y0 = mapY(ny)
  const y1 = mapY(ny + nh)
  return new Float32Array([
    x0, y0, z, x1, y0, z, x1, y0, z, x1, y1, z,
    x1, y1, z, x0, y1, z, x0, y1, z, x0, y0, z,
  ])
}

type TextMesh = THREE.Mesh & { fillOpacity: number }

// Panel geometry in normalized space. Sliding panels (sidebar, header) grow in width with `slide`.
const SIDEBAR_CENTER_Y = mapY(DASH_Y + DASH_H / 2)
const HEADER_CENTER_Y = mapY(DASH_Y + HEADER_H / 2)
const MAIN_PANEL = { nx: DASH_X + SIDEBAR_W, ny: DASH_Y + HEADER_H, nw: DASH_W - SIDEBAR_W, nh: DASH_H * 0.5 }
const BOTTOM_LEFT_PANEL = { nx: DASH_X + SIDEBAR_W, ny: DASH_Y + DASH_H * 0.6, nw: DASH_W * 0.37, nh: DASH_H * 0.4 }
const BOTTOM_RIGHT_PANEL = { nx: DASH_X + DASH_W * 0.62, ny: DASH_Y + DASH_H * 0.6, nw: DASH_W * 0.38, nh: DASH_H * 0.4 }

const BAR_COUNT = 10
const BAR_PANEL_W = DASH_W * 0.37 - 0.04
const BAR_SLOT = BAR_PANEL_W / BAR_COUNT
const BAR_BASE_Y = DASH_Y + DASH_H * 0.6 + DASH_H * 0.4 - 0.04
const SCATTER_COUNT = 50

const WIRE_COUNT = 6

// Unit plane scaled/placed per frame (the original rebuilt a plane of the exact size).
function FixedPanel({ spec, z, color, setRef }: {
  spec: { nx: number; ny: number; nw: number; nh: number }
  z: number
  color: string
  setRef: (mesh: THREE.Mesh | null) => void
}) {
  return (
    <mesh
      ref={setRef}
      position={[mapX(spec.nx + spec.nw / 2), mapY(spec.ny + spec.nh / 2), z]}
      scale={[spec.nw * SX, spec.nh * SY, 1]}
      visible={false}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color={color} transparent opacity={0} toneMapped={false} />
    </mesh>
  )
}

export default function Beat_Dashboard({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)

  const rootRef = useRef<THREE.Group>(null)
  const wireRefs = useRef<Array<THREE.LineSegments | null>>([])
  const sidebarRef = useRef<THREE.Mesh>(null)
  const headerRef = useRef<THREE.Mesh>(null)
  const panelRefs = useRef<Array<THREE.Mesh | null>>([])
  const contentRef = useRef<THREE.Group>(null)
  const contentTextRefs = useRef<Array<TextMesh | null>>([])
  const plotsRef = useRef<THREE.Group>(null)
  const plotTextRefs = useRef<Array<TextMesh | null>>([])
  const curveGroupRef = useRef<THREE.Group>(null)
  const barRefs = useRef<Array<THREE.Mesh | null>>([])
  const scatterRef = useRef<THREE.Points>(null)

  // Wireframe rectangles (Phase 1): outer, sidebar, header, main, two bottom.
  const wires = useMemo(() => [
    rectPositions(DASH_X, DASH_Y, DASH_W, DASH_H, -0.02),
    rectPositions(DASH_X, DASH_Y, DASH_W * 0.25, DASH_H, -0.02),
    rectPositions(DASH_X + DASH_W * 0.25, DASH_Y, DASH_W * 0.75, DASH_H * 0.1, -0.02),
    rectPositions(DASH_X + DASH_W * 0.25, DASH_Y + DASH_H * 0.1, DASH_W * 0.75, DASH_H * 0.5, -0.02),
    rectPositions(DASH_X + DASH_W * 0.25, DASH_Y + DASH_H * 0.6, DASH_W * 0.37, DASH_H * 0.4, -0.02),
    rectPositions(DASH_X + DASH_W * 0.62, DASH_Y + DASH_H * 0.6, DASH_W * 0.38, DASH_H * 0.4, -0.02),
  ], [])

  // Light-curve polyline (Phase 3): sine sweep across the main panel.
  const curve = useMemo(() => {
    const px = DASH_X + SIDEBAR_W
    const pw = DASH_W - SIDEBAR_W
    const py = DASH_Y + HEADER_H + DASH_H * 0.5 * 0.35
    const pts: number[] = []
    const N = 80
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1)
      pts.push(mapX(px + 0.04 + (pw - 0.08) * t), mapY(py + Math.sin(t * 18) * DASH_H * 0.13), 0.02)
    }
    return new Float32Array(pts)
  }, [])

  // Phase-lag scatter (Phase 3): deterministic pseudo-random points in panel 3.
  const scatter = useMemo(() => {
    const px = DASH_X + DASH_W * 0.62 + 0.02
    const pw = DASH_W * 0.38 - 0.04
    const py = DASH_Y + DASH_H * 0.6 + 0.04
    const ph = DASH_H * 0.4 - 0.06
    const pts: number[] = []
    for (let i = 0; i < 50; i++) {
      const rx = (Math.sin(i * 12.9898) * 43758.5453) % 1
      const ry = (Math.sin(i * 78.233) * 12543.123) % 1
      pts.push(mapX(px + Math.abs(rx) * pw), mapY(py + Math.abs(ry) * ph), 0.02)
    }
    return new Float32Array(pts)
  }, [])

  // Power-spectrum bars (Phase 3): heights animate with `plots`.
  const bars = useMemo(() => Array.from({ length: BAR_COUNT }, (_, i) => Math.sin(i * 1.5) * 0.5 + 0.5), [])

  useFrame(() => {
    if (!beat.near) return
    const lp = beat.local
    const t = beat.clock

    // Phase windows mirror the original draw function.
    const frame = Math.min(1, lp / 0.15)
    const slide = Math.min(1, Math.max(0, (lp - 0.15) / 0.3))
    const panelFade = Math.min(1, Math.max(0, (lp - 0.3) / 0.2))
    const content = Math.min(1, Math.max(0, (lp - 0.5) / 0.5))
    const plots = Math.min(1, Math.max(0, (lp - 0.6) / 0.4))

    const root = rootRef.current
    if (root) root.rotation.y = reducedMotion ? 0 : Math.sin(t * 0.4) * 0.04

    // Phase 1: wireframes
    for (let i = 0; i < WIRE_COUNT; i++) {
      const wire = wireRefs.current[i]
      if (wire) (wire.material as THREE.LineBasicMaterial).opacity = 0.35 * frame
    }

    // Phase 2: sliding sidebar + header
    const sidebar = sidebarRef.current
    if (sidebar) {
      const width = SIDEBAR_W * slide
      sidebar.visible = slide > 0
      sidebar.scale.set(width * SX, DASH_H * SY, 1)
      sidebar.position.set(mapX(DASH_X + width / 2), SIDEBAR_CENTER_Y, -0.01)
      ;(sidebar.material as THREE.MeshBasicMaterial).opacity = slide
    }
    const header = headerRef.current
    if (header) {
      const width = (DASH_W - SIDEBAR_W) * slide
      header.visible = slide > 0
      header.scale.set(width * SX, HEADER_H * SY, 1)
      header.position.set(mapX(DASH_X + SIDEBAR_W + width / 2), HEADER_CENTER_Y, -0.01)
      ;(header.material as THREE.MeshBasicMaterial).opacity = slide
    }
    for (let i = 0; i < 3; i++) {
      const panel = panelRefs.current[i]
      if (!panel) continue
      panel.visible = panelFade > 0
      ;(panel.material as THREE.MeshBasicMaterial).opacity = panelFade
    }

    // Phase 3: content labels
    if (contentRef.current) contentRef.current.visible = content > 0
    for (let i = 0; i < 4; i++) {
      const label = contentTextRefs.current[i]
      if (label) label.fillOpacity = content
    }

    // Phase 3: plots
    if (plotsRef.current) plotsRef.current.visible = plots > 0
    for (let i = 0; i < 3; i++) {
      const label = plotTextRefs.current[i]
      if (label) label.fillOpacity = plots
    }
    // `<line>` collides with the SVG element type, so reach it through its wrapper group.
    const curveLine = curveGroupRef.current?.children[0] as THREE.Line | undefined
    if (curveLine) (curveLine.material as THREE.LineBasicMaterial).opacity = plots
    for (let i = 0; i < BAR_COUNT; i++) {
      const bar = barRefs.current[i]
      if (!bar) continue
      const h = bars[i]! * DASH_H * 0.28 * plots
      bar.visible = h > 0
      bar.scale.y = h * SY
      bar.position.y = mapY(BAR_BASE_Y - h / 2)
      ;(bar.material as THREE.MeshBasicMaterial).opacity = plots
    }
    const scatterPoints = scatterRef.current
    if (scatterPoints) {
      scatterPoints.geometry.setDrawRange(0, Math.max(0, Math.floor(SCATTER_COUNT * plots)))
      ;(scatterPoints.material as THREE.PointsMaterial).opacity = 0.8 * plots
    }
  })

  return (
    <group ref={rootRef}>
      {/* Phase 1: wireframe rectangles */}
      {wires.map((pos, i) => (
        <lineSegments key={`w${i}`} ref={(m) => { wireRefs.current[i] = m }}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[pos, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#a5b4fc" transparent opacity={0} toneMapped={false} />
        </lineSegments>
      ))}

      {/* Phase 2: sliding sidebar + header, then fading panels */}
      <mesh ref={sidebarRef} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#1e293b" transparent opacity={0} toneMapped={false} />
      </mesh>
      <mesh ref={headerRef} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#334155" transparent opacity={0} toneMapped={false} />
      </mesh>
      <FixedPanel spec={MAIN_PANEL} z={-0.01} color="#334155" setRef={(m) => { panelRefs.current[0] = m }} />
      <FixedPanel spec={BOTTOM_LEFT_PANEL} z={-0.01} color="#334155" setRef={(m) => { panelRefs.current[1] = m }} />
      <FixedPanel spec={BOTTOM_RIGHT_PANEL} z={-0.01} color="#334155" setRef={(m) => { panelRefs.current[2] = m }} />

      {/* Phase 3: content labels */}
      <group ref={contentRef} visible={false}>
        <Text ref={(m) => { contentTextRefs.current[0] = m }} position={[mapX(DASH_X + 0.02), mapY(DASH_Y + 0.05), 0.03]} anchorX="left" anchorY="middle" fontSize={0.38} color="#e0e0e0" fillOpacity={0}>Stingray QL</Text>
        <Text ref={(m) => { contentTextRefs.current[1] = m }} position={[mapX(DASH_X + 0.02), mapY(DASH_Y + 0.13), 0.03]} anchorX="left" anchorY="middle" fontSize={0.3} color="#a5b4fc" fillOpacity={0}>Obs ID: 4040130102</Text>
        <Text ref={(m) => { contentTextRefs.current[2] = m }} position={[mapX(DASH_X + 0.02), mapY(DASH_Y + 0.2), 0.03]} anchorX="left" anchorY="middle" fontSize={0.3} color="#a5b4fc" fillOpacity={0}>Target: Cygnus X-1</Text>
        <Text ref={(m) => { contentTextRefs.current[3] = m }} position={[mapX(DASH_X + SIDEBAR_W + 0.02), mapY(DASH_Y + HEADER_H / 2), 0.03]} anchorX="left" anchorY="middle" fontSize={0.3} color="#e0e0e0" fillOpacity={0}>Quicklook Dashboard - X-Ray Time Series</Text>
      </group>

      {/* Phase 3: light curve */}
      <group ref={plotsRef} visible={false}>
        <Text ref={(m) => { plotTextRefs.current[0] = m }} position={[mapX(DASH_X + SIDEBAR_W + 0.03), mapY(DASH_Y + HEADER_H + 0.05), 0.03]} anchorX="left" anchorY="middle" fontSize={0.3} color="#e0e0e0" fillOpacity={0}>Light Curve</Text>
        <group ref={curveGroupRef}>
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[curve, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#fde047" transparent opacity={0} toneMapped={false} />
        </line>
        </group>

        {/* Power spectrum bars */}
        <Text ref={(m) => { plotTextRefs.current[1] = m }} position={[mapX(DASH_X + SIDEBAR_W + 0.03), mapY(DASH_Y + DASH_H * 0.6 + 0.05), 0.03]} anchorX="left" anchorY="middle" fontSize={0.3} color="#e0e0e0" fillOpacity={0}>Power Spectrum</Text>
        {bars.map((_, i) => (
          <mesh
            key={`b${i}`}
            ref={(m) => { barRefs.current[i] = m }}
            position={[mapX(DASH_X + SIDEBAR_W + 0.02 + i * BAR_SLOT + BAR_SLOT * 0.4), 0, 0.02]}
            scale={[BAR_SLOT * 0.7 * SX, 0, 1]}
            visible={false}
          >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial color="#4ade80" transparent opacity={0} toneMapped={false} />
          </mesh>
        ))}

        {/* Phase-lag scatter */}
        <Text ref={(m) => { plotTextRefs.current[2] = m }} position={[mapX(DASH_X + DASH_W * 0.62 + 0.03), mapY(DASH_Y + DASH_H * 0.6 + 0.05), 0.03]} anchorX="left" anchorY="middle" fontSize={0.3} color="#e0e0e0" fillOpacity={0}>Phase Lag</Text>
        <points ref={scatterRef} frustumCulled={false}>
          <bufferGeometry drawRange={{ start: 0, count: 0 }}>
            <bufferAttribute attach="attributes-position" args={[scatter, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.12} color="#ef4444" transparent opacity={0} toneMapped={false} sizeAttenuation />
        </points>
      </group>
    </group>
  )
}
