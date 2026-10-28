// src/components/CosmicJourney3D/JourneyLoader.tsx
'use client'

import { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { useStore } from 'zustand'
import { FIRST_VISIT_MIN_MS, IGNITE_MS, loadStore, reportLoad, SEEN_KEY } from './loader'
import { journeyFrame } from './store'
import { getLenis } from './scrollEngine'
import { LoaderView } from './LoaderView'

/** Frames the flight's opening is drawn behind the loader so buffers, textures and glyphs upload early. */
const WARMUP_FRAMES = 4

/**
 * Inside the Canvas: compiles every material in the scene (all 31 beats, the
 * prologue pass and the origin impostor) before the story starts, so no beat
 * hitches on first arrival. compileAsync uses KHR_parallel_shader_compile when
 * available. Progress feeds the loader's point of light.
 */
export function Precompile() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    let cancelled = false
    reportLoad(0.35) // canvas live, sky cubemap baked (ProloguePass bakes during render)
    const raf = requestAnimationFrame(() => {
      gl.compileAsync(scene, camera)
        .catch(() => undefined) // a failed precompile only costs a first-arrival hitch
        .then(() => {
          if (cancelled) return
          reportLoad(0.85)
          // Warm-up: draw the flight's opening (beats 1–2, origin impostor, sky) for a
          // few frames while the loader still covers the screen. compileAsync built
          // the programs; this uploads geometry, textures and glyphs, so the
          // photon-ring hand-off does not hitch on first reveal.
          journeyFrame.warmup = true
          let frames = 0
          const tick = () => {
            if (cancelled) {
              journeyFrame.warmup = false
              return
            }
            frames += 1
            if (frames < WARMUP_FRAMES) {
              requestAnimationFrame(tick)
              return
            }
            journeyFrame.warmup = false
            reportLoad(1, true)
          }
          requestAnimationFrame(tick)
        })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [gl, scene, camera])
  return null
}

function readSeen(): boolean {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

function markSeen(): void {
  try {
    window.sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // private mode / blocked storage: the loader just keeps its first-visit pacing
  }
}

/**
 * DOM overlay over the canvas: the point of light from the server first paint
 * keeps brightening with real progress, then ignites into the prologue's star.
 * Scrolling is locked until then. A first visit holds at least FIRST_VISIT_MIN_MS.
 */
export function JourneyLoader() {
  const { progress, done, linked } = useStore(loadStore)
  const [stage, setStage] = useState<'loading' | 'igniting' | 'gone'>('loading')
  const [minUntil] = useState(() => performance.now() + (readSeen() ? 0 : FIRST_VISIT_MIN_MS))

  useEffect(() => {
    // Scroll stays locked while loading. Once done, the lock lifts while the
    // loader still covers the screen, so a deep link can position the story
    // behind it before the ignition reveals anything.
    const root = document.documentElement
    const previous = root.style.overflow
    const lenis = getLenis()
    const locked = stage === 'loading' && !done
    if (locked) {
      root.style.overflow = 'hidden'
      lenis?.stop()
    }
    return () => {
      if (locked) {
        root.style.overflow = previous
        lenis?.start()
      }
    }
  }, [stage, done])

  useEffect(() => {
    if (!done || !linked || stage !== 'loading') return
    const wait = Math.max(0, minUntil - performance.now())
    const ignite = window.setTimeout(() => {
      markSeen()
      setStage('igniting')
    }, wait)
    return () => window.clearTimeout(ignite)
  }, [done, linked, stage, minUntil])

  useEffect(() => {
    if (stage !== 'igniting') return
    const gone = window.setTimeout(() => setStage('gone'), IGNITE_MS)
    return () => window.clearTimeout(gone)
  }, [stage])

  if (stage === 'gone') return null
  return <LoaderView progress={progress} igniting={stage === 'igniting'} />
}
