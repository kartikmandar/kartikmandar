// src/components/CosmicJourney3D/CameraRig.tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollProgressRef } from './ScrollRig'
import { cumulativeRanges } from './scrollMath'
import { easedCurveU } from './cameraPath'
import { SCROLL_LENGTHS, BEATS } from './registry'
import { ORIGIN_ANCHOR, NEBULA_ANCHOR } from './beatsMeta'

export function CameraRig() {
  const camera = useThree((s) => s.camera)
  const progressRef = useScrollProgressRef()
  const ranges = useMemo(() => cumulativeRanges(SCROLL_LENGTHS), [])

  const { posCurve, lookCurve } = useMemo(() => {
    const positions = [
      new THREE.Vector3(...ORIGIN_ANCHOR.position),
      ...BEATS.map((b) => new THREE.Vector3(...b.meta.anchor.position)),
      new THREE.Vector3(...NEBULA_ANCHOR.position),
    ]
    const looks = [
      new THREE.Vector3(...(ORIGIN_ANCHOR.lookAt ?? [0, 0, 0])),
      ...BEATS.map((b) => new THREE.Vector3(...(b.meta.anchor.lookAt ?? b.meta.anchor.position))),
      new THREE.Vector3(...(NEBULA_ANCHOR.lookAt ?? NEBULA_ANCHOR.position)),
    ]
    return {
      posCurve: new THREE.CatmullRomCurve3(positions, false, 'catmullrom', 0.5),
      lookCurve: new THREE.CatmullRomCurve3(looks, false, 'catmullrom', 0.5),
    }
  }, [])

  const lastU = useRef(0)
  const tmp = useRef(new THREE.Vector3())

  useFrame(() => {
    const u = easedCurveU(progressRef.current, ranges)
    // light smoothing so wheel deltas read as inertia, not steps
    lastU.current += (u - lastU.current) * 0.12
    const cu = Math.max(0, Math.min(1, lastU.current))
    posCurve.getPointAt(cu, tmp.current)
    camera.position.copy(tmp.current)
    lookCurve.getPointAt(cu, tmp.current)
    camera.lookAt(tmp.current)
  })

  return null
}
