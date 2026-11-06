// src/components/CosmicJourney3D/rendererLifecycle.ts
// Keeps the flight's one WebGL context alive through React Strict Mode's
// development double mount, and lets the loader's precompile be cancelled.
//
// Strict Mode unmounts and remounts every new effect once (development only).
// R3F's Canvas answers the unmount by scheduling, 500 ms later, a teardown that
// calls renderer.forceContextLoss(); the remount keeps the same <canvas> and
// renderer, so that timer would kill the live context. On a real unmount React
// has already removed the <canvas> from the page by then, so "still in the
// page" tells the two apart.

import type * as THREE from 'three'

/** A canvas still in the page has a live owner: losing its context is not ours to force. */
export function isTeardownCanvas(canvas: HTMLCanvasElement): boolean {
  return !canvas.isConnected
}

/** Makes forceContextLoss a no-op while the renderer's canvas is still in the page. */
export function guardForcedContextLoss<T extends Pick<THREE.WebGLRenderer, 'forceContextLoss' | 'domElement'>>(renderer: T): T {
  const forceContextLoss = renderer.forceContextLoss.bind(renderer)
  renderer.forceContextLoss = () => {
    if (isTeardownCanvas(renderer.domElement)) forceContextLoss()
  }
  return renderer
}

/** What compileScene needs from the renderer (WebGLRenderer, or a fake in tests). */
export interface CompilingRenderer {
  compile: (scene: THREE.Object3D, camera: THREE.Camera) => Set<THREE.Material>
  properties: { get: (material: THREE.Material) => unknown }
  extensions: { has: (name: string) => boolean }
}

export const COMPILE_POLL_MS = 10

/**
 * renderer.compileAsync, but cancellable and safe when a material is disposed
 * mid-compile (its program is gone; three's own poll throws on it and never
 * resolves). Resolves true once every program is linked, false if cancelled.
 */
export function compileScene(
  renderer: CompilingRenderer,
  scene: THREE.Object3D,
  camera: THREE.Camera,
  isCancelled: () => boolean,
): Promise<boolean> {
  const pending = renderer.compile(scene, camera)
  return new Promise((resolve) => {
    const check = () => {
      if (isCancelled()) {
        resolve(false)
        return
      }
      for (const material of pending) {
        const program = (renderer.properties.get(material) as { currentProgram?: { isReady: () => boolean } }).currentProgram
        if (!program || program.isReady()) pending.delete(material)
      }
      if (pending.size === 0) resolve(true)
      else setTimeout(check, COMPILE_POLL_MS)
    }
    // With KHR_parallel_shader_compile the status can be read without blocking, so check at once.
    if (renderer.extensions.has('KHR_parallel_shader_compile')) check()
    else setTimeout(check, COMPILE_POLL_MS)
  })
}
