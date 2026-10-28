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
import { splitProgress } from './prologueScroll'
import { readCapture } from './capture'

export function CameraRig() {
  const camera = useThree((s) => s.camera)
  const progressRef = useScrollProgressRef()
  const ranges = useMemo(() => cumulativeRanges(SCROLL_LENGTHS), [])

  const { posCurve, lookCurve } = useMemo(() => {
    // Each beat scene is mounted AT its anchor position and is ~10x7 units. Frame
    // it head-on by placing the camera CAM_BACK in front (toward +Z, the viewer
    // side) and slightly up, looking AT the scene center. CAM_BACK < the 8-unit
    // station spacing so the previous scene sits behind the camera.
    const CAM_BACK = 7
    const CAM_UP = 1.5
    const back = new THREE.Vector3(0, CAM_UP, CAM_BACK)
    const positions = [
      new THREE.Vector3(...ORIGIN_ANCHOR.position),
      ...BEATS.map((b) => new THREE.Vector3(...b.meta.anchor.position).add(back)),
      new THREE.Vector3(...NEBULA_ANCHOR.position),
    ]
    const looks = [
      new THREE.Vector3(...(ORIGIN_ANCHOR.lookAt ?? [0, 0, 0])),
      ...BEATS.map((b) => new THREE.Vector3(...b.meta.anchor.position)),
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
    const u = easedCurveU(splitProgress(progressRef.current).flightProgress, ranges)
    // light smoothing so wheel deltas read as inertia, not steps; capture snaps
    if (readCapture().enabled) lastU.current = u
    else lastU.current += (u - lastU.current) * 0.12
    const cu = Math.max(0, Math.min(1, lastU.current))
    posCurve.getPointAt(cu, tmp.current)
    camera.position.copy(tmp.current)
    lookCurve.getPointAt(cu, tmp.current)
    camera.lookAt(tmp.current)
  })

  return null
}
