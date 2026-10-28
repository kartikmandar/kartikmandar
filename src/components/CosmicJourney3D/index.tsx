// src/components/CosmicJourney3D/index.tsx
'use client'

import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, addEffect, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
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
import { cumulativeRanges } from './scrollMath'
import type { QualityTier, SceneProps } from './types'
import { journeyFrame, journeyStore, useActiveBeat, writeBeatProgress } from './store'
import { HeroPrologue } from './HeroPrologue'
import { splitProgress, pageScrollVh } from './prologueScroll'
import { readCapture, CAPTURE_SETTLE_FRAMES } from './capture'

const PerfProbe = lazy(() => import('./PerfProbe'))

// Writes the shared per-frame journey state once, before any useFrame runs
// (R3F addEffect). Scenes read it through useBeat(); React only hears about
// discrete active-beat changes via journeyStore.
function JourneyDriver() {
  const progressRef = useScrollProgressRef()
  useEffect(() => {
    const ranges = cumulativeRanges(BEATS.map((b) => b.meta.scrollLength))
    const capture = readCapture()
    journeyFrame.clock = capture.enabled ? capture.time : 0
    let last: number | null = null
    return addEffect((timestamp) => {
      const dt = last === null ? 0 : Math.min((timestamp - last) / 1000, 1 / 30) // clamp protects tab-return
      last = timestamp
      const raw = progressRef.current
      // Use flightProgress (not raw) so scenes stay in lockstep with the camera
      // and overlay, which also remap through the prologue.
      const flight = splitProgress(raw).flightProgress
      journeyFrame.raw = raw
      journeyFrame.flight = flight
      journeyFrame.dt = capture.enabled ? 0 : dt
      if (!capture.enabled) journeyFrame.clock += dt
      const active = writeBeatProgress(flight, ranges, journeyFrame.local)
      journeyFrame.activeIndex = active
      if (journeyStore.getState().activeIndex !== active) journeyStore.setState({ activeIndex: active })
    })
  }, [progressRef])
  return null
}

// Adapter for scenes still on the legacy prop API: re-renders only while the
// beat is on screen (active ±1), instead of every scene every frame.
function LegacyBeat({ index, Scene, quality, reducedMotion }: {
  index: number
  Scene: React.FC<SceneProps>
  quality: QualityTier
  reducedMotion: boolean
}) {
  const [frame, setFrame] = useState({ local: 0, clock: journeyFrame.clock })
  useFrame(() => {
    const near = index < 0 ? journeyFrame.activeIndex <= 1 : Math.abs(journeyFrame.activeIndex - index) <= 1
    if (!near) return
    const local = index < 0 ? 0 : (journeyFrame.local[index] ?? 0)
    const clock = journeyFrame.clock
    setFrame((f) => (f.local === local && f.clock === clock ? f : { local, clock }))
  })
  return <Scene localProgress={frame.local} clock={frame.clock} quality={quality} reducedMotion={reducedMotion} />
}

// Mounts every beat at its anchor; only the active beat and its neighbours are visible.
function SceneHost({ quality, reducedMotion }: { quality: QualityTier; reducedMotion: boolean }) {
  const active = useActiveBeat()
  return (
    <>
      <JourneyDriver />
      <group position={ORIGIN_ANCHOR.position}>
        <LegacyBeat index={-1} Scene={OriginBlackHole} quality={quality} reducedMotion={reducedMotion} />
      </group>
      {BEATS.map((b, i) => (
        <group key={b.id} position={b.meta.anchor.position} visible={Math.abs(i - active) <= 1}>
          {b.BeatScene ? (
            <b.BeatScene index={i} quality={quality} reducedMotion={reducedMotion} />
          ) : (
            <LegacyBeat index={i} Scene={b.Scene} quality={quality} reducedMotion={reducedMotion} />
          )}
        </group>
      ))}
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
        <Canvas
          frameloop={frameloop}
          camera={{ fov: 60, near: 0.1, far: 1000, position: ORIGIN_ANCHOR.position }}
          dpr={capture.enabled ? capture.dpr : quality === 'high' ? [1, 2] : [1, 1.5]}
          // AgX everywhere: the post ToneMapping effect handles composited tiers;
          // the renderer handles the mobile tier, which has no composer.
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.AgXToneMapping
          }}
        >
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
      {/* CSS vignette: replaces the post-processing Vignette pass at zero GPU cost. */}
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 85% 75% at 50% 45%, transparent 55%, rgba(2,3,8,0.78) 100%)',
        }}
      />
      {!capture.hideUi && <Overlay />}
      {!capture.hideUi && <ChapterRail />}
    </ScrollRig>
  )
}
