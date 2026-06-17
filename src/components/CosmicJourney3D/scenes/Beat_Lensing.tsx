// src/components/CosmicJourney3D/scenes/Beat_Lensing.tsx
'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { SceneProps } from '../types'

// Acceptance: true gravitational lensing — a procedural blue/indigo galaxy field is
// warped around a moving Einstein-ring lens (dark core + bright ring glow). Ports the
// ShaderMaterial from initGravitationalLensing in src/blocks/CosmicJourney/Component.tsx,
// driving lens_mass = localProgress, einstein_radius = sin(localProgress*PI)*0.15, and a
// Lissajous lens_pos drift off the R3F clock (frozen under reducedMotion). No Date.now().

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec2 resolution;
  uniform float time;
  uniform sampler2D u_texture;
  uniform vec2 lens_pos;
  uniform float lens_mass;
  uniform float einstein_radius;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec2 p = uv - lens_pos;
    float r = length(p);

    vec2 new_uv = uv;
    if (lens_mass > 0.0 && r > 0.0) {
      vec2 displacement = p / r * (einstein_radius * einstein_radius) / r;
      new_uv = uv - displacement;
    }

    vec4 color = texture2D(u_texture, new_uv);

    float dist_to_lens = distance(uv, lens_pos);

    float core_radius = einstein_radius * 0.8;
    float darkening = 1.0 - smoothstep(0.0, core_radius, dist_to_lens);
    darkening = pow(darkening, 2.0) * lens_mass;
    vec4 dark_color = vec4(0.05, 0.0, 0.15, 1.0);
    color = mix(color, dark_color, darkening);

    float glow = 1.0 - smoothstep(einstein_radius - 0.02, einstein_radius + 0.02, dist_to_lens);
    glow *= smoothstep(einstein_radius * 0.8, einstein_radius, dist_to_lens);
    vec4 glow_color = vec4(0.7, 0.8, 1.0, 1.0);

    gl_FragColor = color + glow_color * glow * 1.5 * lens_mass;
  }
`

// Build the 512x512 procedural galaxy field on an offscreen 2D canvas, exactly as the
// original initGravitationalLensing does (radial indigo gradient + 800 star pixels).
function createGalaxyTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null
  const bgCanvas = document.createElement('canvas')
  bgCanvas.width = 512
  bgCanvas.height = 512
  const bgCtx = bgCanvas.getContext('2d')
  if (!bgCtx) return null

  const bgGrad = bgCtx.createRadialGradient(256, 256, 0, 256, 256, 256)
  bgGrad.addColorStop(0, 'rgba(200, 210, 255, 0.5)')
  bgGrad.addColorStop(0.3, 'rgba(40, 50, 100, 0.6)')
  bgGrad.addColorStop(1, 'rgba(10, 20, 40, 0)')
  bgCtx.fillStyle = bgGrad
  bgCtx.fillRect(0, 0, 512, 512)

  for (let i = 0; i < 800; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const size = Math.random() * 1.5
    const alpha = Math.random() * 0.5 + 0.5
    bgCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`
    bgCtx.fillRect(x, y, size, size)
  }

  const texture = new THREE.CanvasTexture(bgCanvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

export default function Beat_Lensing({ localProgress, clock, reducedMotion }: SceneProps) {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)

  // Procedural galaxy texture — generated once, offscreen, like the original.
  const texture = useMemo(() => createGalaxyTexture(), [])

  // ShaderMaterial mirroring the ported uniforms/shaders. Built once.
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(14, 9) },
        u_texture: { value: texture },
        lens_pos: { value: new THREE.Vector2(0.5, 0.5) },
        lens_mass: { value: 0 },
        einstein_radius: { value: 0 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
    })
  }, [texture])

  // Dispose GPU resources on unmount.
  useEffect(() => {
    return () => {
      material.dispose()
      texture?.dispose()
    }
  }, [material, texture])

  useFrame(() => {
    const uniforms = materialRef.current?.uniforms
    if (!uniforms) return

    // lens_mass tracks scroll progress through the beat.
    if (uniforms.lens_mass) uniforms.lens_mass.value = localProgress

    // einstein_radius swells then shrinks across the beat (sin envelope), peak 0.15.
    if (uniforms.einstein_radius) {
      uniforms.einstein_radius.value = Math.sin(localProgress * Math.PI) * 0.15
    }

    // time + Lissajous lens drift come from the R3F clock (no Date.now()). Under
    // reducedMotion we freeze drift/time and keep the static lensed composition.
    if (reducedMotion) {
      if (uniforms.lens_pos) uniforms.lens_pos.value.set(0.5, 0.5)
    } else {
      if (uniforms.time) uniforms.time.value = clock
      if (uniforms.lens_pos) {
        uniforms.lens_pos.value.x = 0.5 + Math.sin(clock * 0.5) * 0.2 * localProgress
        uniforms.lens_pos.value.y = 0.5 + Math.cos(clock * 0.4) * 0.2 * localProgress
      }
    }
  })

  return (
    <mesh>
      <planeGeometry args={[14, 9]} />
      <primitive object={material} ref={materialRef} attach="material" />
    </mesh>
  )
}
