'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RaymarchedRenderer } from './engine/RaymarchedRenderer'
import { Phase } from './engine/types'

export default function QuasarBackground() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = ref.current
    if (!container) return
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(0, 6, 40)
    camera.lookAt(0, 0, 0)
    const r = new RaymarchedRenderer()
    r.init(container, camera)
    r.setPhase({ phase: Phase.QUASAR, progress: 1 })
    let last = performance.now()
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const now = performance.now()
      r.update((now - last) / 1000)
      last = now
    }
    loop()
    return () => {
      cancelAnimationFrame(raf)
      r.dispose()
    }
  }, [])
  return <div ref={ref} style={{ width: '100%', height: '100%' }} />
}
