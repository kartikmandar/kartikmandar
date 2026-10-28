// src/components/CosmicJourney3D/index.tsx
'use client'

import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
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
import { HeroPrologue } from './HeroPrologue'
import { splitProgress, pageScrollVh } from './prologueScroll'
import { readCapture, CAPTURE_SETTLE_FRAMES } from './capture'

const PerfProbe = lazy(() => import('./PerfProbe'))

// Drives clock + localProgress into the active (and origin) scenes; one shared time base.
function SceneHost({ quality, reducedMotion }: { quality: QualityTier; reducedMotion: boolean }) {
  const progressRef = useScrollProgressRef()
  const ranges = useMemo(() => cumulativeRanges(BEATS.map((b) => b.meta.scrollLength)), [])
  const capture = readCapture()
  const [clock, setClock] = useState(capture.enabled ? capture.time : 0)
  const [active, setActive] = useState(0)
  const localRef = useRef(0)

  useFrame((_s, dt) => {
    const d = Math.min(dt, 1 / 30) // clamp; protects the phase machine on tab-return
    if (!capture.enabled) setClock((c) => c + d)
    // Use flightProgress (not raw) so the visible scene stays in lockstep with
    // the camera and overlay, which also remap through the prologue.
    const { index, local } = locate(splitProgress(progressRef.current).flightProgress, ranges)
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

// Capture mode: flag <html data-capture="ready"> once the scene graph has stopped
// changing for CAPTURE_SETTLE_FRAMES frames. Async content (troika text, fonts)
// mounts late, so a plain frame count would fire on a still-empty frame.
function CaptureReady() {
  const stableFrames = useRef(0)
  const lastCount = useRef(-1)
  const done = useRef(false)
  useFrame(({ scene }) => {
    if (done.current) return
    let count = 0
    scene.traverse(() => {
      count += 1
    })
    stableFrames.current = count === lastCount.current ? stableFrames.current + 1 : 0
    lastCount.current = count
    if (stableFrames.current >= CAPTURE_SETTLE_FRAMES) {
      done.current = true
      document.documentElement.dataset.capture = 'ready'
    }
  })
  return null
}

// Mounts the prologue WebGL layer and drives the crossfade. Unmounts once fully
// faded out to release the second WebGL context. A dead-band (unmount at xfade>=1,
// remount only when xfade<0.9) prevents frame-to-frame thrash at the crossfade edge.
function PrologueLayer() {
  const progressRef = useScrollProgressRef()
  const [xfade, setXfade] = useState(0)
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const c = Math.round(splitProgress(progressRef.current).crossfade * 50) / 50
      setXfade((p) => (p === c ? p : c))
      if (c >= 1) setHidden((h) => (h ? h : true))
      else if (c < 0.9) setHidden((h) => (h ? false : h))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progressRef])
  if (hidden) return null
  return <HeroPrologue opacity={1 - xfade} />
}

export default function CosmicJourney3D() {
  const [ready, setReady] = useState(false)
  const [quality, setQuality] = useState<QualityTier>('high')
  const [mode, setMode] = useState<'none' | 'static'>('none')
  const [frameloop, setFrameloop] = useState<'always' | 'never'>('always')
  const capture = readCapture()
  const [perf, setPerf] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect -- one-time init: reads browser APIs (matchMedia, webgl2 probe) only available client-side; batched by React 18 */
  useEffect(() => {
    const env = readJourneyEnv()
    setQuality(selectQuality(env))
    setMode(fallbackMode(env.reducedMotion, env.webgl2))
    setPerf(new URLSearchParams(window.location.search).has('perf'))
    setReady(true)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setMode(fallbackMode(mq.matches, env.webgl2))
    mq.addEventListener('change', onChange)
    // Pause the WebGL render loop when the tab is backgrounded (battery/CPU).
    const onVis = () => setFrameloop(document.hidden ? 'never' : 'always')
    document.addEventListener('visibilitychange', onVis)
    onVis()
    return () => {
      mq.removeEventListener('change', onChange)
      document.removeEventListener('visibilitychange', onVis)
    }
  // eslint-enable react-hooks/set-state-in-effect
  }, [])

  if (!ready) return null
  if (mode === 'static') return <Fallback />

  return (
    <ScrollRig totalScrollVh={pageScrollVh(TOTAL_SCROLL_VH)}>
      {quality !== 'mobile' && <PrologueLayer />}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }} aria-hidden>
        <Canvas frameloop={frameloop} camera={{ fov: 60, near: 0.1, far: 1000, position: ORIGIN_ANCHOR.position }} dpr={capture.enabled ? capture.dpr : quality === 'high' ? [1, 2] : [1, 1.5]}>
          <Environment quality={quality} />
          <CameraRig />
          <SceneHost quality={quality} reducedMotion={false} />
          {capture.enabled && <CaptureReady />}
          {perf && (
            <Suspense fallback={null}>
              <PerfProbe />
            </Suspense>
          )}
        </Canvas>
      </div>
      {!capture.hideUi && <Overlay />}
      {!capture.hideUi && <ChapterRail />}
    </ScrollRig>
  )
}
