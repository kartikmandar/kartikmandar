// src/components/CosmicJourney3D/PerfProbe.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { StatsGl } from '@react-three/drei'

// Loaded only under ?perf (lazy import in index.tsx). Shows stats-gl and records
// frame times so baselines can be read from the console:
//   __journeyPerf.summary()  -> { frames, p50, p95, p99, max, over50 } in ms
//   __journeyPerf.reset()
interface PerfApi {
  summary: () => { frames: number; p50: number; p95: number; p99: number; max: number; over50: number }
  reset: () => void
}

declare global {
  interface Window {
    __journeyPerf?: PerfApi
  }
}

const MAX_SAMPLES = 20000

function percentile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0
  const i = Math.min(sorted.length - 1, Math.floor(q * sorted.length))
  return sorted[i]!
}

export default function PerfProbe() {
  const samples = useRef<number[]>([])
  const last = useRef<number | null>(null)

  useEffect(() => {
    window.__journeyPerf = {
      summary: () => {
        const sorted = [...samples.current].sort((a, b) => a - b)
        const round = (v: number) => Math.round(v * 10) / 10
        return {
          frames: sorted.length,
          p50: round(percentile(sorted, 0.5)),
          p95: round(percentile(sorted, 0.95)),
          p99: round(percentile(sorted, 0.99)),
          max: round(sorted[sorted.length - 1] ?? 0),
          over50: sorted.filter((v) => v > 50).length,
        }
      },
      reset: () => {
        samples.current = []
        last.current = null
      },
    }
    return () => {
      delete window.__journeyPerf
    }
  }, [])

  // Wall-clock frame interval (R3F's clamped delta would hide long frames).
  useFrame(() => {
    const now = performance.now()
    if (last.current !== null && samples.current.length < MAX_SAMPLES) {
      samples.current.push(now - last.current)
    }
    last.current = now
  })

  return <StatsGl className="journey-stats" />
}
