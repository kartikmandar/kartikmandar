import * as THREE from 'three'
import { buildSkyFragment, SKY_VERT } from './shaders/sky.frag'
import { CONSTANTS } from './types'

export interface BakedCubemap {
  texture: THREE.CubeTexture
  /**
   * Frees the GPU render target (6 FBOs + texture). Always call this —
   * disposing only `texture` leaks the framebuffers.
   */
  dispose(): void
}

export interface BakeOptions {
  size?: number
  /** Request a half-float target so HDR star cores (>1) survive into bloom. */
  hdr?: boolean
}

/**
 * Rendering to RGBA16F needs WebGL2 + EXT_color_buffer_float; without either,
 * fall back to bytes (stars clamp at 1.0 but still clear the bloom threshold).
 */
export function resolveBakeType(webgl2: boolean, floatColorBuffer: boolean): THREE.TextureDataType {
  return webgl2 && floatColorBuffer ? THREE.HalfFloatType : THREE.UnsignedByteType
}

/**
 * Bake the procedural sky (stars + Milky Way + galaxies, see sky.frag.ts)
 * into a cubemap once at init. The raymarched tier's escaped rays sample it
 * by direction, so the background lenses for free; the mesh tier sets it as
 * scene.background. Both tiers show the identical fixed-seed sky.
 */
export function bakeBackgroundCubemap(
  renderer: THREE.WebGLRenderer,
  options: BakeOptions = {},
): BakedCubemap {
  const { size = CONSTANTS.SKY_CUBEMAP_SIZE, hdr = false } = options
  const type = hdr
    ? resolveBakeType(
        renderer.capabilities.isWebGL2,
        renderer.extensions.has('EXT_color_buffer_float'),
      )
    : THREE.UnsignedByteType

  const scene = new THREE.Scene()
  const geometry = new THREE.SphereGeometry(100, 32, 16)
  const material = new THREE.ShaderMaterial({
    vertexShader: SKY_VERT,
    fragmentShader: buildSkyFragment(),
    side: THREE.BackSide, // sky sphere encloses the cube camera
    depthWrite: false,
  })
  scene.add(new THREE.Mesh(geometry, material))

  const target = new THREE.WebGLCubeRenderTarget(size, {
    generateMipmaps: false,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    type,
  })
  const cubeCamera = new THREE.CubeCamera(0.1, 500, target)
  cubeCamera.update(renderer, scene)

  geometry.dispose()
  material.dispose()
  return {
    texture: target.texture,
    dispose() {
      target.dispose()
    },
  }
}
