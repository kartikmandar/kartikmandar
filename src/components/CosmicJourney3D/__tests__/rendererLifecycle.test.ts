import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type * as THREE from 'three'
import { COMPILE_POLL_MS, compileScene, guardForcedContextLoss, isTeardownCanvas, releaseOnUnmount, type CompilingRenderer } from '../rendererLifecycle'

const canvas = (connected: boolean) => ({ isConnected: connected }) as HTMLCanvasElement

describe('guardForcedContextLoss', () => {
  // R3F schedules forceContextLoss 500 ms after the Canvas effect's cleanup.
  it('keeps the context of a canvas still in the page (Strict Mode remount)', () => {
    const lose = vi.fn()
    const renderer = guardForcedContextLoss({ forceContextLoss: lose, domElement: canvas(true) })
    renderer.forceContextLoss()
    expect(lose).not.toHaveBeenCalled()
  })

  it('releases the context once the canvas has left the page (real unmount)', () => {
    const lose = vi.fn()
    const renderer = guardForcedContextLoss({ forceContextLoss: lose, domElement: canvas(false) })
    renderer.forceContextLoss()
    expect(lose).toHaveBeenCalledTimes(1)
  })

  it('reads the canvas at the time of the call, not when guarded', () => {
    const lose = vi.fn()
    const element = { isConnected: true }
    const renderer = guardForcedContextLoss({ forceContextLoss: lose, domElement: element as HTMLCanvasElement })
    element.isConnected = false
    renderer.forceContextLoss()
    expect(lose).toHaveBeenCalledTimes(1)
  })
})

describe('guardForcedContextLoss, released once', () => {
  it('loses the context only once, whoever asks (R3F teardown and releaseOnUnmount)', () => {
    const lose = vi.fn()
    const renderer = guardForcedContextLoss({ forceContextLoss: lose, domElement: canvas(false) })
    renderer.forceContextLoss()
    renderer.forceContextLoss()
    expect(lose).toHaveBeenCalledTimes(1)
  })
})

describe('releaseOnUnmount', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  // After a Strict Mode remount R3F has forgotten the canvas, so the real unmount must release it.
  it('releases the context once React has removed the canvas', () => {
    const lose = vi.fn()
    const element = { isConnected: true }
    const renderer = guardForcedContextLoss({ forceContextLoss: lose, domElement: element as HTMLCanvasElement })
    releaseOnUnmount(renderer)
    element.isConnected = false // React removes the canvas in the same commit
    vi.runAllTimers()
    expect(lose).toHaveBeenCalledTimes(1)
  })

  it("keeps the context through Strict Mode's simulated unmount (the canvas stays in the page)", () => {
    const lose = vi.fn()
    const renderer = guardForcedContextLoss({ forceContextLoss: lose, domElement: canvas(true) })
    releaseOnUnmount(renderer)
    vi.runAllTimers()
    expect(lose).not.toHaveBeenCalled()
  })

  it('does nothing before a renderer exists', () => {
    expect(() => releaseOnUnmount(null)).not.toThrow()
  })
})

describe('isTeardownCanvas', () => {
  it('is true only for a canvas no longer in the page', () => {
    expect(isTeardownCanvas(canvas(false))).toBe(true)
    expect(isTeardownCanvas(canvas(true))).toBe(false)
  })
})

describe('compileScene', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  const material = (name: string) => ({ name }) as THREE.Material
  const scene = {} as THREE.Object3D
  const camera = {} as THREE.Camera

  function fakeRenderer(programs: Map<THREE.Material, { ready: boolean } | undefined>, parallel = true): CompilingRenderer {
    return {
      compile: () => new Set(programs.keys()),
      properties: {
        get: (m) => {
          const program = programs.get(m)
          return program ? { currentProgram: { isReady: () => program.ready } } : {}
        },
      },
      extensions: { has: (name) => parallel && name === 'KHR_parallel_shader_compile' },
    }
  }

  it('resolves once every program is linked', async () => {
    const a = material('a')
    const programs = new Map([[a, { ready: false }]])
    const done = vi.fn()
    void compileScene(fakeRenderer(programs), scene, camera, () => false).then(done)
    await vi.advanceTimersByTimeAsync(COMPILE_POLL_MS * 3)
    expect(done).not.toHaveBeenCalled()
    programs.get(a)!.ready = true
    await vi.advanceTimersByTimeAsync(COMPILE_POLL_MS)
    expect(done).toHaveBeenCalledWith(true)
  })

  // Strict Mode's dev remount disposes the first mount's materials mid-compile: three's own poll throws on them.
  it('treats a disposed material (no program) as done instead of throwing', async () => {
    const programs = new Map<THREE.Material, { ready: boolean } | undefined>([[material('disposed'), undefined]])
    await expect(compileScene(fakeRenderer(programs), scene, camera, () => false)).resolves.toBe(true)
  })

  it('stops polling when cancelled', async () => {
    let cancelled = false
    const programs = new Map([[material('slow'), { ready: false }]])
    const result = compileScene(fakeRenderer(programs, false), scene, camera, () => cancelled)
    await vi.advanceTimersByTimeAsync(COMPILE_POLL_MS * 2)
    cancelled = true
    await vi.advanceTimersByTimeAsync(COMPILE_POLL_MS)
    await expect(result).resolves.toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })
})
