// src/components/CosmicJourney3D/art/materials.ts
// Material kit for the "made of light" idiom. Factories allocate; create them in
// useMemo and dispose on unmount (useDisposable). Animate through uniforms only.
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { INSTANCED_VERTEX_GLSL, NOISE_GLSL } from './glsl'

/** Creates a disposable (material, geometry, texture) once and disposes it on unmount. */
export function useDisposable<T extends { dispose: () => void }>(factory: () => T, deps: unknown[] = []): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls identity through deps
  const value = useMemo(factory, deps)
  useEffect(() => () => value.dispose(), [value])
  return value
}

export interface RimOptions {
  /** Body colour (linear, may be HDR). Kept dim: the rim carries the light. */
  base: THREE.Color
  /** Rim colour (HDR so it blooms). */
  rim: THREE.Color
  /** Fresnel exponent: higher = thinner rim. */
  power?: number
  /** Additive luminous shell (true) or opaque body (false). */
  additive?: boolean
  /** Per-instance reveal driven by an `aDelay` instance attribute vs uReveal. */
  instancedReveal?: boolean
}

/**
 * Fresnel/rim-lit body: the core material of the idiom. Instancing-aware.
 * Uniforms: uBase, uRim, uPower, uOpacity, uReveal (0..1, with instancedReveal).
 */
export function createRimMaterial(o: RimOptions): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    defines: o.instancedReveal ? { USE_REVEAL: '' } : {},
    uniforms: {
      uBase: { value: o.base.clone() },
      uRim: { value: o.rim.clone() },
      uPower: { value: o.power ?? 2.5 },
      uOpacity: { value: 1 },
      uReveal: { value: 1 },
    },
    vertexShader: /* glsl */ `
      ${INSTANCED_VERTEX_GLSL}
      varying vec3 vNormal;
      varying vec3 vView;
      varying float vLit;
      #ifdef USE_REVEAL
        attribute float aDelay;
        uniform float uReveal;
      #endif
      void main() {
        vec4 local = instancedPosition(position);
        vec4 mv = modelViewMatrix * local;
        vNormal = normalize(normalMatrix * instancedNormal(normal));
        vView = normalize(-mv.xyz);
        vLit = 1.0;
        #ifdef USE_REVEAL
          vLit = smoothstep(aDelay, aDelay + 0.12, uReveal);
        #endif
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uBase;
      uniform vec3 uRim;
      uniform float uPower;
      uniform float uOpacity;
      varying vec3 vNormal;
      varying vec3 vView;
      varying float vLit;
      void main() {
        vec3 n = normalize(vNormal);
        if (!gl_FrontFacing) n = -n;
        float fres = pow(1.0 - clamp(abs(dot(n, normalize(vView))), 0.0, 1.0), uPower);
        vec3 col = uBase * (0.35 + 0.65 * vLit) + uRim * fres * vLit;
        gl_FragColor = vec4(col, uOpacity);
      }
    `,
    transparent: o.additive ?? false,
    blending: o.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: !(o.additive ?? false),
    side: THREE.DoubleSide,
  })
}

/**
 * Holographic glass panel: faint fill, glowing edges, slow scanlines.
 * For flat infographics (dashboards, pages). Uniforms: uColor, uTime, uOpacity.
 */
export function createHoloMaterial(color: THREE.Color): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: color.clone() }, uTime: { value: 0 }, uOpacity: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        vec2 e = min(vUv, 1.0 - vUv);
        float edge = 1.0 - smoothstep(0.0, 0.012, min(e.x, e.y));
        float scan = 0.5 + 0.5 * sin((vUv.y * 140.0) - uTime * 2.0);
        float fill = 0.05 + 0.035 * scan;
        vec3 col = uColor * (fill + edge * 1.6);
        gl_FragColor = vec4(col, (fill + edge) * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
}

let glowTexture: THREE.DataTexture | null = null

/** Shared soft radial falloff (generated once, never disposed: used for the page's lifetime). */
export function getGlowTexture(): THREE.DataTexture {
  if (glowTexture) return glowTexture
  const size = 128
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x + 0.5) / size - 0.5
      const dy = (y + 0.5) / size - 0.5
      const r = Math.sqrt(dx * dx + dy * dy) * 2
      // Bright core + long soft halo; reaches zero at the edge.
      const core = Math.exp(-r * r * 18)
      const halo = Math.exp(-r * r * 3.2) * 0.45
      const v = Math.max(0, Math.min(1, (core + halo) * (1 - r * r)))
      const i = (y * size + x) * 4
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
      data[i + 3] = Math.round(v * 255)
    }
  }
  glowTexture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  glowTexture.needsUpdate = true
  glowTexture.magFilter = THREE.LinearFilter
  glowTexture.minFilter = THREE.LinearFilter
  return glowTexture
}

export { NOISE_GLSL }

/**
 * Sets a ShaderMaterial uniform on a mesh/points/line through its ref (inside useFrame).
 * Going through the object ref keeps per-frame mutation out of React's render data.
 */
export function setUniform(object: THREE.Object3D | null | undefined, name: string, value: number): void {
  const material = (object as THREE.Mesh | null | undefined)?.material as THREE.ShaderMaterial | undefined
  const uniform = material?.uniforms?.[name]
  if (uniform) uniform.value = value
}
