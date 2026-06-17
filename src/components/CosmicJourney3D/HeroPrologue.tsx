// src/components/CosmicJourney3D/HeroPrologue.tsx
'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RaymarchedRenderer } from '@/components/QuasarBackground/engine/RaymarchedRenderer'
import { CONSTANTS } from '@/components/QuasarBackground/engine/types'
import { useScrollProgressRef } from './ScrollRig'
import { splitProgress } from './prologueScroll'
import { phaseStateFromProgress } from './prologuePhase'

export function HeroPrologue({ opacity }: { opacity: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useScrollProgressRef()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      1000,
    )
    const frame = (dist: number) => camera.position.set(0, 8, dist).setLength(dist)
    frame(CONSTANTS.CAMERA_START_DISTANCE)
    camera.lookAt(0, 0, 0)

    let renderer: RaymarchedRenderer | null = null
    try {
      renderer = new RaymarchedRenderer()
      renderer.init(container, camera)
    } catch {
      return // WebGL unavailable: Fallback handles the experience
    }

    let raf = 0
    let last = performance.now()
    let disposed = false
    const loop = () => {
      if (disposed) return
      raf = requestAnimationFrame(loop)
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now
      const { prologueProgress } = splitProgress(progressRef.current)
      // gentle dolly inward across the prologue (40 -> 22 r_s), then hold
      frame(CONSTANTS.CAMERA_START_DISTANCE - 18 * prologueProgress)
      camera.lookAt(0, 0, 0)
      camera.updateMatrixWorld()
      renderer!.setPhase(phaseStateFromProgress(prologueProgress))
      renderer!.update(dt)
    }
    raf = requestAnimationFrame(loop)

    const observer = new ResizeObserver(() => {
      const w = container.clientWidth
      const h = Math.max(container.clientHeight, 1)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer?.resize(w, h)
    })
    observer.observe(container)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      renderer?.dispose()
    }
  }, [progressRef])

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', inset: 0, zIndex: 1, background: '#000',
        opacity, pointerEvents: 'none', transition: 'opacity 80ms linear',
      }}
    >
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
    </div>
  )
}
