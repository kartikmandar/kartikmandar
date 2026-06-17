// src/components/CosmicJourney3D/scenes/Beat_Dashboard.tsx
'use client'

import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import type { SceneProps } from '../types'

// Acceptance: a software dashboard assembles in phases — wireframe rectangles ->
// sliding panels -> content + three small plots (light curve, power-spectrum
// bars, phase-lag scatter). Mirrors drawBuildingDashboard's metaphor in 3D.

// Original 2D layout: dash at [0.15,0.15] sized [0.7,0.7] in a [0..1] box.
// Map normalized x -> (x-0.5)*10, normalized y (down) -> (0.5-y)*7.
const SX = 10
const SY = 7
const mapX = (x: number) => (x - 0.5) * SX
const mapY = (y: number) => (0.5 - y) * SY

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

// Filled panel mesh centered on a normalized rect.
function Panel({ nx, ny, nw, nh, z, color, opacity }: {
  nx: number; ny: number; nw: number; nh: number; z: number; color: string; opacity: number
}) {
  if (opacity <= 0) return null
  const cx = mapX(nx + nw / 2)
  const cy = mapY(ny + nh / 2)
  return (
    <mesh position={[cx, cy, z]}>
      <planeGeometry args={[nw * SX, nh * SY]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} />
    </mesh>
  )
}

export default function Beat_Dashboard({ localProgress, clock, reducedMotion }: SceneProps) {
  // Phase windows mirror the original draw function.
  const frame = Math.min(1, localProgress / 0.15)
  const slide = Math.min(1, Math.max(0, (localProgress - 0.15) / 0.3))
  const panelFade = Math.min(1, Math.max(0, (localProgress - 0.3) / 0.2))
  const content = Math.min(1, Math.max(0, (localProgress - 0.5) / 0.5))
  const plots = Math.min(1, Math.max(0, (localProgress - 0.6) / 0.4))

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
  const bars = useMemo(() => Array.from({ length: 10 }, (_, i) => Math.sin(i * 1.5) * 0.5 + 0.5), [])
  const drift = reducedMotion ? 0 : Math.sin(clock * 0.4) * 0.04

  return (
    <group rotation={[0, drift, 0]}>
      {/* Phase 1: wireframe rectangles */}
      {wires.map((pos, i) => (
        <lineSegments key={`w${i}`}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[pos, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#a5b4fc" transparent opacity={0.35 * frame} toneMapped={false} />
        </lineSegments>
      ))}

      {/* Phase 2: sliding sidebar + header, then fading panels */}
      <Panel nx={DASH_X} ny={DASH_Y} nw={SIDEBAR_W * slide} nh={DASH_H} z={-0.01} color="#1e293b" opacity={slide} />
      <Panel nx={DASH_X + SIDEBAR_W} ny={DASH_Y} nw={(DASH_W - SIDEBAR_W) * slide} nh={HEADER_H} z={-0.01} color="#334155" opacity={slide} />
      <Panel nx={DASH_X + SIDEBAR_W} ny={DASH_Y + HEADER_H} nw={DASH_W - SIDEBAR_W} nh={DASH_H * 0.5} z={-0.01} color="#334155" opacity={panelFade} />
      <Panel nx={DASH_X + SIDEBAR_W} ny={DASH_Y + DASH_H * 0.6} nw={DASH_W * 0.37} nh={DASH_H * 0.4} z={-0.01} color="#334155" opacity={panelFade} />
      <Panel nx={DASH_X + DASH_W * 0.62} ny={DASH_Y + DASH_H * 0.6} nw={DASH_W * 0.38} nh={DASH_H * 0.4} z={-0.01} color="#334155" opacity={panelFade} />

      {/* Phase 3: content labels */}
      {content > 0 && (
        <group>
          <Text position={[mapX(DASH_X + 0.02), mapY(DASH_Y + 0.05), 0.03]} anchorX="left" fontSize={0.32} color="#e0e0e0" fillOpacity={content}>Stingray QL</Text>
          <Text position={[mapX(DASH_X + 0.02), mapY(DASH_Y + 0.13), 0.03]} anchorX="left" fontSize={0.2} color="#a5b4fc" fillOpacity={content}>Obs ID: 4040130102</Text>
          <Text position={[mapX(DASH_X + 0.02), mapY(DASH_Y + 0.18), 0.03]} anchorX="left" fontSize={0.2} color="#a5b4fc" fillOpacity={content}>Target: Cygnus X-1</Text>
          <Text position={[mapX(DASH_X + SIDEBAR_W + 0.02), mapY(DASH_Y + HEADER_H / 2), 0.03]} anchorX="left" fontSize={0.22} color="#e0e0e0" fillOpacity={content}>Quicklook Dashboard - X-Ray Time Series</Text>
        </group>
      )}

      {/* Phase 3: light curve */}
      {plots > 0 && (
        <group>
          <Text position={[mapX(DASH_X + SIDEBAR_W + 0.03), mapY(DASH_Y + HEADER_H + 0.05), 0.03]} anchorX="left" fontSize={0.2} color="#e0e0e0" fillOpacity={plots}>Light Curve</Text>
          <line>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[curve, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color="#fde047" transparent opacity={plots} toneMapped={false} />
          </line>

          {/* Power spectrum bars */}
          <Text position={[mapX(DASH_X + SIDEBAR_W + 0.03), mapY(DASH_Y + DASH_H * 0.6 + 0.05), 0.03]} anchorX="left" fontSize={0.2} color="#e0e0e0" fillOpacity={plots}>Power Spectrum</Text>
          {bars.map((b, i) => {
            const pw = DASH_W * 0.37 - 0.04
            const slot = pw / bars.length
            const bx = DASH_X + SIDEBAR_W + 0.02 + i * slot
            const baseY = DASH_Y + DASH_H * 0.6 + DASH_H * 0.4 - 0.04
            const h = b * DASH_H * 0.28 * plots
            if (h <= 0) return null
            return (
              <mesh key={`b${i}`} position={[mapX(bx + slot * 0.4), mapY(baseY - h / 2), 0.02]}>
                <planeGeometry args={[slot * 0.7 * SX, h * SY]} />
                <meshBasicMaterial color="#4ade80" transparent opacity={plots} toneMapped={false} />
              </mesh>
            )
          })}

          {/* Phase-lag scatter */}
          <Text position={[mapX(DASH_X + DASH_W * 0.62 + 0.03), mapY(DASH_Y + DASH_H * 0.6 + 0.05), 0.03]} anchorX="left" fontSize={0.2} color="#e0e0e0" fillOpacity={plots}>Phase Lag</Text>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[scatter.slice(0, Math.max(0, Math.floor(scatter.length / 3 * plots)) * 3), 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.12} color="#ef4444" transparent opacity={0.8 * plots} toneMapped={false} sizeAttenuation />
          </points>
        </group>
      )}
    </group>
  )
}
