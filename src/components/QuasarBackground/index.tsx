'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Image from 'next/image'
import { PhaseMachine } from './engine/PhaseMachine'
import { RaymarchedRenderer } from './engine/RaymarchedRenderer'
import { MeshRenderer } from './engine/MeshRenderer'
import { readTierEnvironment, selectTier, tierFromBenchmark, type Tier } from './engine/tierSelect'
import { CONSTANTS, Phase, type SceneRenderer } from './engine/types'

type ShellState = Tier | 'failed'

/** Overlay copy per phase (spec §Narrative). Edit the story here. */
const OVERLAY_TEXT: Partial<Record<Phase, string>> = {
  [Phase.STAR]: 'Every story begins with a massive star.',
  [Phase.SHELL]: 'It dies in a supernova — outshining its entire galaxy.',
  [Phase.BIRTH]: 'What remains collapses into a black hole. Matter spirals in, and the disk ignites.',
  [Phase.QUASAR]: 'But this is just the surface of what really is happening!!',
}

const overlayTextStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: 'white',
  fontSize: '32px',
  fontWeight: 900,
  letterSpacing: '1px',
  textAlign: 'center',
  maxWidth: '80%',
  textShadow:
    '-2px -2px 4px rgba(0,0,0,1), 2px -2px 4px rgba(0,0,0,1), -2px 2px 4px rgba(0,0,0,1), 2px 2px 4px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.8)',
  WebkitTextStroke: '2px rgba(0,0,0,0.9)',
  paintOrder: 'stroke fill',
  zIndex: 3,
  pointerEvents: 'none',
  fontFamily: 'sans-serif',
}

const hintPillStyle: React.CSSProperties = {
  padding: '10px 16px',
  background: 'rgba(0,0,0,0.7)',
  color: 'rgba(255,255,255,0.9)',
  borderRadius: '25px',
  fontSize: '14px',
  fontWeight: 500,
  letterSpacing: '0.5px',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  fontFamily: 'sans-serif',
  textAlign: 'center',
  whiteSpace: 'nowrap',
}

export default function QuasarBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const debugRef = useRef<HTMLDivElement>(null)
  const [shellState, setShellState] = useState<ShellState>('raymarched')
  const [phase, setPhase] = useState<Phase>(Phase.STAR)
  const [isTouch, setIsTouch] = useState(false)
  const debugEnabled =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === 'fps'

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const env = readTierEnvironment()
    const machine = new PhaseMachine()

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      1000,
    )
    camera.position.set(0, 10, CONSTANTS.CAMERA_START_DISTANCE)
    camera.position.setLength(CONSTANTS.CAMERA_START_DISTANCE)

    const controls = new OrbitControls(camera, container)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enablePan = false
    controls.zoomSpeed = 1.2
    controls.rotateSpeed = 0.8
    controls.minDistance = CONSTANTS.CAMERA_MIN_DISTANCE
    controls.maxDistance = CONSTANTS.CAMERA_MAX_DISTANCE
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }

    let renderer: SceneRenderer | null = null
    let raf = 0
    let disposed = false
    let userInteracted = false
    let activeTier: Tier = 'raymarched'

    const onInteractionStart = () => {
      userInteracted = true
    }
    controls.addEventListener('start', onInteractionStart)

    const applyMeshConstraints = () => {
      const span = (CONSTANTS.MESH_TIER_MAX_POLAR_DEG * Math.PI) / 180
      controls.minPolarAngle = Math.PI / 2 - span
      controls.maxPolarAngle = Math.PI / 2 + span
    }

    const watchContextLoss = () => {
      const canvas = container.querySelector('canvas')
      canvas?.addEventListener('webglcontextlost', (e) => {
        e.preventDefault()
        if (activeTier === 'raymarched') demoteToMesh()
        else fail()
      })
    }

    const fail = () => {
      renderer?.dispose()
      renderer = null
      disposed = true // stop the rAF loop; nothing renders in the failed state
      cancelAnimationFrame(raf)
      setShellState('failed')
    }

    const startMesh = () => {
      activeTier = 'mesh'
      applyMeshConstraints()
      try {
        const mesh = new MeshRenderer()
        mesh.init(container, camera)
        renderer = mesh
        watchContextLoss()
        setShellState('mesh')
      } catch (err) {
        console.error('Mesh tier failed:', err)
        fail()
      }
    }

    const demoteToMesh = () => {
      renderer?.dispose()
      renderer = null
      startMesh()
    }

    const startRaymarched = () => {
      activeTier = 'raymarched'
      try {
        const ray = new RaymarchedRenderer()
        ray.init(container, camera)
        ray.onDemote = demoteToMesh
        renderer = ray
        watchContextLoss()
        setShellState('raymarched')
        return ray
      } catch (err) {
        console.error('Raymarched tier failed:', err)
        startMesh()
        return null
      }
    }

    // Tier flow (spec §Tier selection)
    const decision = selectTier(env)
    if (decision === 'mesh') {
      startMesh()
    } else {
      const ray = startRaymarched()
      if (ray && decision === 'benchmark') {
        const avgMs = ray.runBenchmark()
        if (tierFromBenchmark(avgMs) === 'mesh') demoteToMesh()
      }
    }

    // Debug HUD bookkeeping
    let fpsFrames = 0
    let fpsTime = 0

    let last = performance.now()
    const loop = () => {
      if (disposed) return
      raf = requestAnimationFrame(loop)
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now

      controls.update()
      const state = machine.update({
        dt,
        cameraDistance: camera.position.length(),
        userInteracted,
        reducedMotion: env.reducedMotion,
      })
      userInteracted = false

      // camera shake during FLASH
      if (state.phase === Phase.FLASH && !env.reducedMotion) {
        controls.target.set((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, 0)
      } else if (controls.target.lengthSq() > 0) {
        controls.target.set(0, 0, 0)
      }

      setPhase((prev) => (prev === state.phase ? prev : state.phase))
      renderer?.setPhase(state)
      renderer?.update(dt)

      if (debugRef.current) {
        fpsFrames++
        fpsTime += dt
        if (fpsTime >= 0.5) {
          debugRef.current.textContent = `${Math.round(fpsFrames / fpsTime)} fps | ${activeTier} | ${Phase[state.phase]} ${state.progress.toFixed(2)}`
          fpsFrames = 0
          fpsTime = 0
        }
      }
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
      controls.removeEventListener('start', onInteractionStart)
      controls.dispose()
      renderer?.dispose()
      renderer = null
    }
  }, [])

  const overlayText = OVERLAY_TEXT[phase]

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {shellState === 'failed' ? (
        <Image
          src="/media/quasar-poster.jpg"
          alt="An accreting black hole with a glowing, lensed accretion disk"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      ) : (
        <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
      )}

      {overlayText && <div style={overlayTextStyle}>{overlayText}</div>}

      {shellState !== 'failed' && phase === Phase.STAR && (
        <div
          style={{
            position: 'absolute',
            bottom: isTouch ? '40px' : '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div style={hintPillStyle}>
            {isTouch ? 'Pinch in to witness its end' : 'Zoom in to witness its end'}
          </div>
        </div>
      )}

      {shellState !== 'failed' && phase === Phase.QUASAR && (
        <div
          style={{
            position: 'absolute',
            bottom: isTouch ? '40px' : '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div style={hintPillStyle}>
            Scroll down to glimpse into my{' '}
            <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>boring</span> simple
            journey
          </div>
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '12px solid rgba(255,255,255,0.8)',
              animation: 'quasar-hint-bounce 2s infinite',
            }}
          />
        </div>
      )}

      {debugEnabled && (
        <div
          ref={debugRef}
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 20,
            color: '#0f0',
            fontFamily: 'monospace',
            fontSize: 12,
            background: 'rgba(0,0,0,0.6)',
            padding: '4px 8px',
            borderRadius: 4,
          }}
        />
      )}
    </div>
  )
}
