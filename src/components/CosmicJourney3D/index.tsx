// src/components/CosmicJourney3D/index.tsx
'use client'

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, addAfterEffect, addEffect, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PerformanceMonitor } from '@react-three/drei'
import { ScrollRig, useScrollProgressRef } from './ScrollRig'
import { CameraRig } from './CameraRig'
import { Environment } from './Environment'
import { Overlay } from './Overlay'
import { ChapterRail } from './ChapterRail'
import { BEATS, TOTAL_SCROLL_VH } from './registry'
import { ORIGIN_ANCHOR, ORIGIN_BLACK_HOLE } from './beatsMeta'
import OriginBlackHole from './scenes/OriginBlackHole'
import { adaptiveDpr, DPR_START_FACTOR, readJourneyEnv, selectQuality } from './tiers'
import { fallbackMode } from './fallbackPlan'
import { beatVisible } from './cameraPath'
import { cumulativeRanges } from './scrollMath'
import type { QualityTier } from './types'
import { journeyFrame, journeyStore, writeBeatProgress } from './store'
import { HeroPrologue } from './HeroPrologue'
import { flightFractionToGlobal, splitProgress, pageScrollVh } from './prologueScroll'
import { readCapture, CAPTURE_SETTLE_FRAMES } from './capture'
import { diveState } from './prologueDive'
import { getLenis } from './scrollEngine'
import { ProloguePass } from './ProloguePass'
import { CoverAware } from './CoverAware'
import { FinaleConstellation } from './FinaleConstellation'
import { JourneyLoader, Precompile } from './JourneyLoader'
import { LoaderView } from './LoaderView'
import { JourneyNav } from './JourneyNav'
import { ContextGuard } from './ContextGuard'

const PerfProbe = lazy(() => import('./PerfProbe'))

// Capture mode: window.__captureFrame(t) moves the frozen clock to t and resolves
// with that frame as a PNG, for rendering the home loop. toBlob runs in an after
// effect because the drawing buffer is only valid until the frame is composited.
function installFrameGrabber() {
  const target = window as unknown as {
    __captureFrame?: (time: number) => Promise<Blob | null>
    __storyBeats?: { id: string; progress: number }[]
  }
  // Each beat's id and the page progress at the middle of its scroll range, for scripts/capture-posters.mjs.
  const ranges = cumulativeRanges(BEATS.map((b) => b.meta.scrollLength))
  target.__storyBeats = BEATS.map((b, i) => ({
    id: b.id,
    progress: flightFractionToGlobal((ranges[i]!.start + ranges[i]!.end) / 2),
  }))
  target.__captureFrame = (time) => new Promise((resolve) => {
    journeyFrame.clock = time
    let frames = 0
    const remove = addAfterEffect(() => {
      frames += 1
      if (frames < 2) return
      remove()
      const canvas = document.querySelector('canvas')
      if (canvas) canvas.toBlob(resolve, 'image/png')
      else resolve(null)
    })
  })
}

// Writes the shared per-frame journey state once, before any useFrame runs
// (R3F addEffect). Scenes read it through useBeat(); React only hears about
// discrete active-beat changes via journeyStore.
function JourneyDriver({ prologuePass }: { prologuePass: boolean }) {
  const progressRef = useScrollProgressRef()
  useEffect(() => {
    const ranges = cumulativeRanges(BEATS.map((b) => b.meta.scrollLength))
    const capture = readCapture()
    journeyFrame.clock = capture.enabled ? capture.time : 0
    if (capture.enabled) installFrameGrabber()
    let last: number | null = null
    const dive = diveState(0)
    return addEffect((timestamp) => {
      const dt = last === null ? 0 : Math.min((timestamp - last) / 1000, 1 / 30) // clamp protects tab-return
      last = timestamp
      // Step the scroll clock first, so this frame's progress is this frame's scroll.
      getLenis()?.raf(timestamp)
      const raw = progressRef.current
      // Use flightProgress (not raw) so scenes stay in lockstep with the camera
      // and overlay, which also remap through the prologue.
      const split = splitProgress(raw)
      const flight = split.flightProgress
      journeyFrame.raw = raw
      journeyFrame.flight = flight
      journeyFrame.prologue = split.prologueProgress
      journeyFrame.crossfade = split.crossfade
      // Only the in-canvas prologue pass can cover the flight (not ?legacyPrologue).
      journeyFrame.covered = prologuePass && diveState(split.crossfade, dive).covers
      journeyFrame.dt = capture.enabled ? 0 : dt
      if (!capture.enabled) journeyFrame.clock += dt
      const active = writeBeatProgress(flight, ranges, journeyFrame.local)
      journeyFrame.activeIndex = active
      if (journeyStore.getState().activeIndex !== active) journeyStore.setState({ activeIndex: active })
    })
  }, [progressRef, prologuePass])
  return null
}

// Mounts every beat at its anchor; only the active beat and its neighbours are visible.
function SceneHost({ quality, reducedMotion, prologuePass }: { quality: QualityTier; reducedMotion: boolean; prologuePass: boolean }) {
  const groups = useRef<(THREE.Group | null)[]>([])
  // Per frame, not per render: a held shot hides its neighbours without a React update.
  useFrame(() => {
    const active = journeyFrame.activeIndex
    const local = journeyFrame.local[active] ?? 0
    groups.current.forEach((group, i) => {
      if (group) group.visible = readCapture().solo ? i === active : beatVisible(i, active, local)
    })
  })
  return (
    <>
      <JourneyDriver prologuePass={prologuePass} />
      <CoverAware>
      <OriginBlackHole position={ORIGIN_BLACK_HOLE} quality={quality} />
      {BEATS.map((b, i) => (
        <group key={b.id} ref={(group) => { groups.current[i] = group }} position={b.meta.anchor.position} visible={false}>
          <b.Scene index={i} quality={quality} reducedMotion={reducedMotion} />
        </group>
      ))}
      <FinaleConstellation />
      </CoverAware>
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

// ?legacyPrologue only: the pre-Phase-2 prologue in its own WebGL context, kept
// for side-by-side comparison with the in-canvas ProloguePass. Unmounts once fully
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
  const [dpr, setDpr] = useState(1.5)
  const [legacyPrologue, setLegacyPrologue] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect -- one-time init: reads browser APIs (matchMedia, webgl2 probe) only available client-side; batched by React 18 */
  useEffect(() => {
    const env = readJourneyEnv()
    const tier = selectQuality(env)
    setQuality(tier)
    setDpr(adaptiveDpr(tier, DPR_START_FACTOR, window.devicePixelRatio || 1))
    // Capture mode renders deliberately, whatever the renderer.
    const softwareRenderer = env.softwareRenderer && !readCapture().enabled
    setMode(fallbackMode(env.reducedMotion, env.webgl2, softwareRenderer))
    const params = new URLSearchParams(window.location.search)
    setPerf(params.has('perf'))
    setLegacyPrologue(params.has('legacyPrologue'))
    setReady(true)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setMode(fallbackMode(mq.matches, env.webgl2, softwareRenderer))
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

  const abandonFlight = useCallback(() => {
    setMode('static')
    window.scrollTo(0, 0)
  }, [])

  // R3F builds the renderer in an async step no error boundary can see, so a
  // context the probe got but the real canvas can't is caught here.
  const createRenderer = useCallback((props: THREE.WebGLRendererParameters) => {
    try {
      return new THREE.WebGLRenderer(props)
    } catch (error) {
      abandonFlight()
      throw error
    }
  }, [abandonFlight])

  // Static mode reveals the server-rendered article; the flight keeps it hidden and out of the tab order.
  useEffect(() => {
    if (!ready) return
    const root = document.documentElement
    const links = document.querySelectorAll<HTMLElement>('.story-article a')
    if (mode === 'static') {
      root.dataset.storyMode = 'static'
    } else {
      links.forEach((link) => { link.tabIndex = -1 })
    }
    return () => {
      delete root.dataset.storyMode
      links.forEach((link) => link.removeAttribute('tabindex'))
    }
  }, [ready, mode])

  // Until the client probe runs, keep showing the server's first paint (never a black frame).
  if (!ready) return <LoaderView progress={0.05} />
  if (mode === 'static') return null

  return (
    <ScrollRig totalScrollVh={pageScrollVh(TOTAL_SCROLL_VH)}>
      {legacyPrologue && quality !== 'mobile' && <PrologueLayer />}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }} aria-hidden>
        <Canvas
          gl={createRenderer}
          frameloop={frameloop}
          camera={{ fov: 60, near: 0.1, far: 1000, position: ORIGIN_ANCHOR.position }}
          dpr={capture.enabled ? capture.dpr : dpr}
          // AgX everywhere: the post ToneMapping effect handles composited tiers;
          // the renderer handles the mobile tier, which has no composer.
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.AgXToneMapping
          }}
        >
          {!legacyPrologue && <ProloguePass quality={quality} />}
          <Environment quality={quality} />
          <CameraRig />
          <SceneHost quality={quality} reducedMotion={false} prologuePass={!legacyPrologue} />
          <Precompile />
          <ContextGuard onAbandon={abandonFlight} />
          {!capture.enabled && (
            // Adaptive resolution: sheds DPR under load (thermal throttling, slow GPUs)
            // and recovers with headroom, in 0.25 steps; gives up flip-flopping after 4.
            <PerformanceMonitor
              factor={DPR_START_FACTOR}
              flipflops={4}
              onChange={({ factor }) => setDpr(adaptiveDpr(quality, factor, window.devicePixelRatio || 1))}
              onFallback={() => setDpr(adaptiveDpr(quality, 0, window.devicePixelRatio || 1))}
            />
          )}
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
      <JourneyNav />
      {!capture.enabled && <JourneyLoader />}
    </ScrollRig>
  )
}
