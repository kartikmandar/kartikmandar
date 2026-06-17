// src/components/CosmicJourney3D/index.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ScrollRig, useScrollProgressRef } from './ScrollRig'
import { CameraRig } from './CameraRig'
import { Environment } from './Environment'
import { Overlay } from './Overlay'
import { ChapterRail } from './ChapterRail'
import Fallback from './Fallback'
import { BEATS, TOTAL_SCROLL_VH } from './registry'
import { ORIGIN_ANCHOR } from './beatsMeta'
import OriginBlackHole from './scenes/OriginBlackHole'
import { readJourneyEnv, selectQuality } from './tiers'
import { fallbackMode } from './fallbackPlan'
import { cumulativeRanges, locate } from './scrollMath'
import type { QualityTier } from './types'

// Drives clock + localProgress into the active (and origin) scenes; one shared time base.
function SceneHost({ quality, reducedMotion }: { quality: QualityTier; reducedMotion: boolean }) {
  const progressRef = useScrollProgressRef()
  const ranges = useMemo(() => cumulativeRanges(BEATS.map((b) => b.meta.scrollLength)), [])
  const [clock, setClock] = useState(0)
  const [active, setActive] = useState(0)
  const localRef = useRef(0)

  useFrame((_s, dt) => {
    const d = Math.min(dt, 1 / 30) // clamp; protects the phase machine on tab-return
    setClock((c) => c + d)
    const { index, local } = locate(progressRef.current, ranges)
    localRef.current = local
    setActive((p) => (p === index ? p : index))
  })

  return (
    <>
      <group position={ORIGIN_ANCHOR.position}>
        <OriginBlackHole localProgress={0} clock={clock} quality={quality} reducedMotion={reducedMotion} />
      </group>
      {/* eslint-disable react-hooks/refs -- localRef is written in useFrame (R3F loop, not React render); reading .current per beat here is intentional */}
      {BEATS.map((b, i) => (
        <group key={b.id} position={b.meta.anchor.position} visible={Math.abs(i - active) <= 1}>
          <b.Scene
            localProgress={i === active ? localRef.current : i < active ? 1 : 0}
            clock={clock}
            quality={quality}
            reducedMotion={reducedMotion}
          />
        </group>
      ))}
      {/* eslint-enable react-hooks/refs */}
    </>
  )
}

export default function CosmicJourney3D() {
  const [ready, setReady] = useState(false)
  const [quality, setQuality] = useState<QualityTier>('high')
  const [mode, setMode] = useState<'none' | 'static'>('none')

  /* eslint-disable react-hooks/set-state-in-effect -- one-time init: reads browser APIs (matchMedia, webgl2 probe) only available client-side; batched by React 18 */
  useEffect(() => {
    const env = readJourneyEnv()
    setQuality(selectQuality(env))
    setMode(fallbackMode(env.reducedMotion, env.webgl2))
    setReady(true)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setMode(fallbackMode(mq.matches, env.webgl2))
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  // eslint-enable react-hooks/set-state-in-effect
  }, [])

  if (!ready) return null
  if (mode === 'static') return <Fallback />

  return (
    <ScrollRig totalScrollVh={TOTAL_SCROLL_VH}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }} aria-hidden>
        <Canvas camera={{ fov: 60, near: 0.1, far: 1000, position: ORIGIN_ANCHOR.position }} dpr={quality === 'high' ? [1, 2] : [1, 1.5]}>
          <Environment quality={quality} />
          <CameraRig />
          <SceneHost quality={quality} reducedMotion={false} />
        </Canvas>
      </div>
      <Overlay />
      <ChapterRail />
    </ScrollRig>
  )
}
