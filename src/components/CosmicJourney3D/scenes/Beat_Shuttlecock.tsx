// src/components/CosmicJourney3D/scenes/Beat_Shuttlecock.tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { SceneProps } from '../types'

// Acceptance: a shuttlecock rises to a peak, develops cracks, then shatters into
// ~25 flying shards that scatter and fall under gravity and fade.
// Mirrors drawShatteringShuttlecock: riseProgress (0..0.4), crackPhase (0.4..0.6),
// shatterPhase (0.6..1.0). 2D [0..1] layout mapped to a 10 (x) x 7 (y) extent at z~0.
const SHARD_COUNT = 25

// 2D layout: startY = h*0.9 (bottom), impactY = h*0.2 (peak). In our y-up local
// space (0.5 - p) * 7, that is start y = -2.8, peak y = +2.1.
const START_Y = (0.5 - 0.9) * 7
const PEAK_Y = (0.5 - 0.2) * 7

interface Shard {
  origin: THREE.Vector3
  vel: THREE.Vector3
  axis: THREE.Vector3
  spin: number
  size: number
  feather: boolean
}

export default function Beat_Shuttlecock({ localProgress, clock, reducedMotion }: SceneProps) {
  const bodyRef = useRef<THREE.Group>(null)

  // Phase split identical to the 2D source of truth.
  const rise = Math.min(1, localProgress / 0.4)
  const crack = Math.max(0, Math.min(1, (localProgress - 0.4) / 0.2))
  const shatter = Math.max(0, (localProgress - 0.6) / 0.4)
  const intact = shatter <= 0
  const bodyY = START_Y + (PEAK_Y - START_Y) * rise

  // Generate shard data once; deterministic so the composition is stable.
  const shards = useMemo<Shard[]>(() => {
    // Pure hash-based RNG: stable per (shard index, channel), no mutable state.
    const rand = (i: number, ch: number) => {
      const n = Math.sin((i + 1) * 12.9898 + ch * 78.233) * 43758.5453
      return n - Math.floor(n)
    }
    return Array.from({ length: SHARD_COUNT }, (_, i) => {
      const r = (ch: number) => rand(i, ch)
      const feather = r(0) > 0.3
      return {
        origin: new THREE.Vector3(0, PEAK_Y, 0),
        // vx/vy scaled to local units; outward scatter (mirrors 2D vx/vy).
        vel: new THREE.Vector3((r(1) - 0.5) * 9, (r(2) - 0.5) * 6 + 1.5, (r(3) - 0.5) * 4),
        axis: new THREE.Vector3(r(4) - 0.5, r(5) - 0.5, r(6) - 0.5).normalize(),
        spin: (r(7) - 0.5) * 8,
        size: r(8) * 0.28 + 0.18,
        feather,
      }
    })
  }, [])

  // Crack lines drawn on the intact body during crackPhase (jagged, dark).
  const crackPositions = useMemo(() => {
    const c = crack
    return new Float32Array([
      0, 0.1 * c, 0.01, 0.18 * c, 0.42 * c, 0.01, -0.1 * c, 0.55 * c, 0.01,
      0, 0.1 * c, 0.01, -0.22 * c, 0.38 * c, 0.01, 0.05 * c, 0.62 * c, 0.01,
    ])
  }, [crack])

  useFrame(() => {
    if (!bodyRef.current) return
    // Gentle ambient wobble from the clock prop; held when reduced motion.
    bodyRef.current.rotation.z = reducedMotion ? 0 : Math.sin(clock * 1.2) * 0.12
  })

  // Travel easing matches Math.pow(shatterPhase, 0.7); gravity adds t^2.
  const travel = Math.pow(shatter, 0.7)
  const alpha = 1 - shatter

  return (
    <group>
      {intact ? (
        <group ref={bodyRef} position={[0, bodyY, 0]}>
          {/* Feather skirt: white truncated cone (cork at the base). */}
          <mesh position={[0, 0.7, 0]}>
            <coneGeometry args={[0.95, 1.6, 18, 1, true]} />
            <meshBasicMaterial color="#f5f5f5" transparent opacity={0.92} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
          {/* Cork hemisphere base (tan). */}
          <mesh position={[0, -0.1, 0]}>
            <sphereGeometry args={[0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshBasicMaterial color="#d2b48c" toneMapped={false} />
          </mesh>
          {/* Jagged cracks fading in over crackPhase. */}
          {crack > 0 && (
            <lineSegments position={[0, -0.1, 0.45]}>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[crackPositions, 3]} />
              </bufferGeometry>
              <lineBasicMaterial color="#1a1a1a" transparent opacity={crack * 0.85} toneMapped={false} />
            </lineSegments>
          )}
        </group>
      ) : (
        // Shatter: shards scatter outward and fall under gravity, fading out.
        shards.map((s, i) => {
          const px = s.origin.x + s.vel.x * travel
          const py = s.origin.y + s.vel.y * travel - travel * travel * 6
          const pz = s.origin.z + s.vel.z * travel
          const drift = reducedMotion ? 0 : Math.sin(clock + i) * 0.05
          return (
            <mesh
              key={i}
              position={[px + drift, py, pz]}
              rotation={[s.axis.x * s.spin * travel, s.axis.y * s.spin * travel, s.axis.z * s.spin * travel]}
            >
              {s.feather ? (
                <coneGeometry args={[s.size * 0.5, s.size * 1.4, 3]} />
              ) : (
                <boxGeometry args={[s.size, s.size, s.size * 0.4]} />
              )}
              <meshBasicMaterial
                color={s.feather ? '#ffffff' : '#d2b48c'}
                transparent
                opacity={Math.max(0, alpha)}
                toneMapped={false}
              />
            </mesh>
          )
        })
      )}
    </group>
  )
}
