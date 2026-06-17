import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { bakeBackgroundCubemap, type BakedCubemap } from './background'
import { derivePhaseUniforms } from './phaseUniforms'
import { BLACKHOLE_FRAG, FULLSCREEN_VERT } from './shaders/blackhole.frag'
import { CONSTANTS, Phase, type PhaseState, type SceneRenderer } from './types'

/**
 * Desktop tier: fullscreen quad raymarching Schwarzschild geodesics,
 * HDR -> UnrealBloom -> ACES. Owns its WebGLRenderer; index.tsx owns
 * the perspective camera + OrbitControls.
 */
export class RaymarchedRenderer implements SceneRenderer {
  /** index.tsx sets this; called when the watchdog gives up. */
  onDemote: (() => void) | null = null

  private renderer: THREE.WebGLRenderer | null = null
  private composer: EffectComposer | null = null
  private material: THREE.ShaderMaterial | null = null
  private quadGeometry: THREE.PlaneGeometry | null = null
  private bloomPass: UnrealBloomPass | null = null
  private outputPass: OutputPass | null = null
  private background: BakedCubemap | null = null
  private camera: THREE.PerspectiveCamera | null = null

  private size = { width: 1, height: 1 }
  private resolutionScale = 1
  private time = 0
  private frameTimes: number[] = []
  private slowSeconds = 0
  private demoted = false
  private readonly invProjView = new THREE.Matrix4()
  private readonly worldToDisk = new THREE.Matrix3()

  init(container: HTMLElement, camera: THREE.PerspectiveCamera): void {
    this.camera = camera

    // preserveDrawingBuffer: under GPU contention (many tabs/windows) Chrome's
    // compositor can sample the canvas between clear and redraw, flashing a
    // blank frame every few seconds. Preserving means the buffer always holds
    // the last completed frame; cheap here since every pixel is overwritten
    // each frame anyway.
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONSTANTS.DPR_CAP))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)
    this.renderer = renderer

    this.background = bakeBackgroundCubemap(renderer, { hdr: true })

    // Disk tilt: reuse the legacy scene's tilt so the composition reads the same.
    const tilt = new THREE.Matrix4()
      .makeRotationZ(-Math.PI / 8)
      .multiply(new THREE.Matrix4().makeRotationX(0.749))
    this.worldToDisk.setFromMatrix4(tilt.invert())

    this.material = new THREE.ShaderMaterial({
      vertexShader: FULLSCREEN_VERT,
      fragmentShader: BLACKHOLE_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uResolution: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uCamPos: { value: new THREE.Vector3() },
        uInvProjView: { value: this.invProjView },
        uWorldToDisk: { value: this.worldToDisk },
        uBackground: { value: this.background.texture },
        uPhase: { value: Phase.STAR },
        uProgress: { value: 0 },
        uStarRadius: { value: CONSTANTS.STAR_RADIUS },
        uShellRadius: { value: 0 },
        uFlash: { value: 0 },
        uLensing: { value: 0 },
        uIgnition: { value: 0 },
      },
    })

    const scene = new THREE.Scene()
    this.quadGeometry = new THREE.PlaneGeometry(2, 2)
    scene.add(new THREE.Mesh(this.quadGeometry, this.material))
    const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    // setPixelRatio must precede EffectComposer construction — the composer snapshots the renderer's pixel ratio.
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, orthoCamera))
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(256, 256),
      CONSTANTS.BLOOM_STRENGTH,
      CONSTANTS.BLOOM_RADIUS,
      CONSTANTS.BLOOM_THRESHOLD,
    )
    composer.addPass(this.bloomPass)
    this.outputPass = new OutputPass()
    composer.addPass(this.outputPass)
    this.composer = composer

    this.resize(container.clientWidth, container.clientHeight)
  }

  setPhase(state: PhaseState): void {
    const u = this.material?.uniforms
    if (!u) return
    const derived = derivePhaseUniforms(state)
    u.uPhase!.value = state.phase
    u.uProgress!.value = state.progress
    u.uStarRadius!.value = derived.starRadius
    u.uShellRadius!.value = derived.shellRadius
    u.uFlash!.value = derived.flash
    u.uLensing!.value = derived.lensing
    u.uIgnition!.value = derived.ignition
  }

  update(dt: number): void {
    const { renderer, composer, material, camera } = this
    if (!renderer || !composer || !material || !camera) return

    this.time += dt
    material.uniforms.uTime!.value = this.time

    camera.updateMatrixWorld()
    ;(material.uniforms.uCamPos!.value as THREE.Vector3).copy(camera.position)
    // clip -> world: matrixWorld * projectionMatrixInverse
    this.invProjView.copy(camera.projectionMatrixInverse).premultiply(camera.matrixWorld)

    composer.render()
    this.governor(dt)
  }

  /**
   * Resolution governor + watchdog (spec §Desktop tier), driven by rAF cadence
   * (dt) — render-call CPU time would miss GPU-bound slowdowns since WebGL is
   * asynchronous. Healthy 60 Hz dt ≈ 16.7 ms; >20 ms avg means real slowdown.
   */
  private governor(dt: number): void {
    this.frameTimes.push(dt * 1000)
    if (this.frameTimes.length < 30) return
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
    this.frameTimes.length = 0

    if (avg > 1000 / 50 && this.resolutionScale > CONSTANTS.RESOLUTION_SCALE_MIN) {
      this.resolutionScale = Math.max(CONSTANTS.RESOLUTION_SCALE_MIN, this.resolutionScale - 0.1)
      this.applySize()
    } else if (avg < 1000 / 58 && this.resolutionScale < 1) {
      // 58 fps, not 80: with vsync at 60 Hz a healthy dt avg is ~16.7 ms, which
      // must qualify for upscaling or the scale could never recover.
      this.resolutionScale = Math.min(1, this.resolutionScale + 0.1)
      this.applySize()
    }

    if (
      avg > 1000 / CONSTANTS.WATCHDOG_FPS &&
      this.resolutionScale <= CONSTANTS.RESOLUTION_SCALE_MIN
    ) {
      this.slowSeconds += (avg / 1000) * 30 // actual elapsed time of this batch
      if (this.slowSeconds >= CONSTANTS.WATCHDOG_SECONDS && !this.demoted) {
        this.demoted = true
        this.onDemote?.()
      }
    } else {
      this.slowSeconds = 0
    }
  }

  /**
   * Hidden micro-benchmark (spec §Tier selection): renders the QUASAR phase at
   * low resolution for a few frames and reports the average frame time.
   * Call after init() and before the canvas is revealed.
   */
  runBenchmark(): number {
    const { renderer, composer, material } = this
    if (!renderer || !composer || !material) return Number.POSITIVE_INFINITY

    const prev = {
      phase: material.uniforms.uPhase!.value as Phase,
      progress: material.uniforms.uProgress!.value as number,
    }
    this.setPhase({ phase: Phase.QUASAR, progress: 1 })
    renderer.domElement.style.visibility = 'hidden'
    composer.setSize(CONSTANTS.BENCHMARK_SIZE, CONSTANTS.BENCHMARK_SIZE)
    ;(material.uniforms.uResolution!.value as THREE.Vector2).set(
      CONSTANTS.BENCHMARK_SIZE,
      CONSTANTS.BENCHMARK_SIZE,
    )

    // Warm-up render outside the timed window: the first frame carries shader
    // compile + program link cost, which would bias the average.
    composer.render()
    renderer.getContext().finish()

    const started = performance.now()
    for (let i = 0; i < CONSTANTS.BENCHMARK_FRAMES; i++) composer.render()
    // Force the GPU to finish so timings are honest.
    renderer.getContext().finish()
    const avg = (performance.now() - started) / CONSTANTS.BENCHMARK_FRAMES

    this.setPhase({ phase: prev.phase, progress: prev.progress })
    this.applySize()
    renderer.domElement.style.visibility = 'visible'
    return avg
  }

  resize(width: number, height: number): void {
    this.size = { width: Math.max(width, 1), height: Math.max(height, 1) }
    this.applySize()
  }

  private applySize(): void {
    const { renderer, composer, material } = this
    if (!renderer || !composer || !material) return
    const w = Math.round(this.size.width * this.resolutionScale)
    const h = Math.round(this.size.height * this.resolutionScale)
    renderer.setSize(w, h, false) // false: keep CSS at 100%
    composer.setSize(w, h)
    const dpr = renderer.getPixelRatio()
    ;(material.uniforms.uResolution!.value as THREE.Vector2).set(w * dpr, h * dpr)
  }

  dispose(): void {
    this.composer?.dispose()
    this.bloomPass?.dispose()
    this.outputPass?.dispose()
    this.material?.dispose()
    this.quadGeometry?.dispose()
    this.background?.dispose() // frees the cubemap render target (6 FBOs + texture)
    if (this.renderer) {
      this.renderer.domElement.remove()
      this.renderer.dispose()
    }
    this.renderer = null
    this.composer = null
    this.bloomPass = null
    this.outputPass = null
    this.material = null
    this.quadGeometry = null
    this.background = null
    this.camera = null
  }
}
