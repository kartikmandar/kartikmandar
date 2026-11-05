// src/components/CosmicJourney3D/CameraRig.tsx
'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { cumulativeRanges } from './scrollMath'
import { shotCurveT, baseFov, portraitFrame } from './cameraPath'
import { SCROLL_LENGTHS, BEATS } from './registry'
import { ORIGIN_ANCHOR, NEBULA_ANCHOR } from './beatsMeta'
import { readCapture } from './capture'
import { journeyFrame } from './store'
import { OPENING_CENTER, openingCameraPose } from './openingCamera'
import { pathCameraZoom, pathProgress } from './pathStage'
import { pathForMass, starStore } from './starChoice'

/** Damping rate (1/s) for the camera following the scroll. Lenis already smooths
 *  input, so this is light: it only removes residual steps. Frame-rate independent. */
const FOLLOW_LAMBDA = 10
/** Speed → FOV kick: scrolling fast widens the lens a little, like a warp. Capped. */
const FOV_KICK_MAX = 9
const FOV_PER_SPEED = 120
const FOV_LAMBDA = 5
/** Pointer sway: the camera leans a little toward the pointer (world units). */
const SWAY = 0.3
const SWAY_LAMBDA = 3
/** Damping rate (1/s) for the art making room for a beat's copy on portrait screens. */
const FRAME_LAMBDA = 3

// Scratch (no allocation per frame).
const _pos = new THREE.Vector3()
const _look = new THREE.Vector3()
const _toStar = new THREE.Vector3()
/** At full zoom, how much of the way to the star the camera moves. */
const PATH_ZOOM = 0.55

export function CameraRig() {
  const ranges = useMemo(() => cumulativeRanges(SCROLL_LENGTHS), [])

  const { posCurve, lookCurve } = useMemo(() => {
    // Each beat scene is mounted AT its anchor position and is ~10x7 units. Frame
    // it head-on by placing the camera CAM_BACK in front (toward +Z, the viewer
    // side) and slightly up, looking AT the scene center. CAM_BACK is well under
    // STATION_SPACING so the previous scene sits behind the camera.
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

  const followU = useRef(0)
  const fov = useRef(60)
  const appliedView = useRef('')
  const sway = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
  const frame = useRef<{ center: number; scale: number } | null>(null)
  const first = useRef(true)

  // Pointer sway target, desktop pointers only (touch would jitter on scroll).
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const state = sway.current
    const onMove = (e: PointerEvent) => {
      state.targetX = (e.clientX / window.innerWidth - 0.5) * 2
      state.targetY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((state) => {
    const camera = state.camera as THREE.PerspectiveCamera
    const f = journeyFrame
    const capture = readCapture().enabled
    // The shot schedule: travel → hold on the station → travel (cameraPath.ts).
    const u = shotCurveT(f.flight, ranges)
    const prevU = followU.current
    if (capture || first.current) {
      followU.current = u
      first.current = false
    } else {
      followU.current = THREE.MathUtils.damp(followU.current, u, FOLLOW_LAMBDA, f.dt)
    }
    const cu = Math.max(0, Math.min(1, followU.current))

    // Speed (curve units/s) widens the lens a touch; settles back at rest.
    const speed = f.dt > 0 ? Math.abs(followU.current - prevU) / f.dt : 0
    f.cameraSpeed = capture ? 0 : Math.min(1, (speed * FOV_PER_SPEED) / FOV_KICK_MAX)
    const fovBase = baseFov(camera.aspect)
    const fovTarget = capture ? fovBase : fovBase + Math.min(FOV_KICK_MAX, speed * FOV_PER_SPEED)
    fov.current = capture ? fovBase : THREE.MathUtils.damp(fov.current, fovTarget, FOV_LAMBDA, f.dt)

    const s = sway.current
    if (capture) {
      s.x = 0
      s.y = 0
    } else {
      s.x = THREE.MathUtils.damp(s.x, s.targetX, SWAY_LAMBDA, f.dt)
      s.y = THREE.MathUtils.damp(s.y, s.targetY, SWAY_LAMBDA, f.dt)
    }

    // getPoint (uniform per control point), not getPointAt (arc length): stations land exactly.
    posCurve.getPoint(cu, _pos)
    lookCurve.getPoint(cu, _look)
    // Before the flight, the opening has its own camera; it ends exactly on the curve's first point.
    if (f.flight <= 0) {
      openingCameraPose(f.opening, f.handoff, _pos, _look)
      // Some paths close in on a small star: move along the line to it, so it keeps its place on screen and grows.
      const zoom = pathCameraZoom(pathForMass(starStore.getState().mass), pathProgress(f.opening))
      if (zoom > 0) {
        _toStar.copy(OPENING_CENTER).sub(_pos).multiplyScalar(PATH_ZOOM * zoom)
        _pos.add(_toStar)
        _look.add(_toStar)
      }
    }
    camera.position.set(_pos.x + s.x * SWAY, _pos.y - s.y * SWAY * 0.6, _pos.z)
    camera.lookAt(_look)

    // A lens shift and a wider window, not a tilt or a dolly, so the composition stays the same.
    const { width, height } = state.size
    const target = portraitFrame(camera.aspect, f.copyTopPx, height)
    if (!target || !frame.current || capture) {
      frame.current = target && { ...target }
    } else {
      frame.current.center = THREE.MathUtils.damp(frame.current.center, target.center, FRAME_LAMBDA, f.dt)
      frame.current.scale = THREE.MathUtils.damp(frame.current.scale, target.scale, FRAME_LAMBDA, f.dt)
    }
    const shown = frame.current
    const viewKey = shown ? `${width}x${height}:${shown.center.toFixed(3)}:${shown.scale.toFixed(3)}` : ''
    if (viewKey !== appliedView.current) {
      appliedView.current = viewKey
      if (shown) {
        const viewWidth = width / shown.scale
        const viewHeight = height / shown.scale
        camera.setViewOffset(width, height, (width - viewWidth) / 2, height / 2 - shown.center * viewHeight, viewWidth, viewHeight)
      } else {
        camera.clearViewOffset()
      }
    }
    if (Math.abs(camera.fov - fov.current) > 0.01) {
      camera.fov = fov.current
      camera.updateProjectionMatrix()
    }
  })

  return null
}
