import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { addBackgroundGalaxies, addBackgroundStars, type BackgroundHandle } from './background'
import { derivePhaseUniforms } from './phaseUniforms'
import {
  DISK_FRAG,
  DISK_VERT,
  JET_FRAG,
  JET_VERT,
  SHELL_FRAG,
  SHELL_VERT,
  STAR_FRAG,
  STAR_VERT,
} from './shaders/meshShaders'
import { CONSTANTS, Phase, type PhaseState, type SceneRenderer } from './types'

const SHELL_POINTS = 3000

function additive(params: THREE.ShaderMaterialParameters): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    ...params,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}

/** Soft radial ring texture for the photon-ring billboard. */
function createRingTexture(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0.0, 'rgba(0,0,0,0)')
  grad.addColorStop(0.46, 'rgba(0,0,0,0)')
  grad.addColorStop(0.5, 'rgba(255,235,200,1)')
  grad.addColorStop(0.54, 'rgba(0,0,0,0)')
  grad.addColorStop(1.0, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

/** Soft white radial texture for the FLASH sprite. */
function createFlashTexture(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

/**
 * Fallback tier: one disk mesh, black sphere + photon-ring billboard +
 * over-arc, cone jets, point-shell supernova. Quarter-res bloom.
 */
export class MeshRenderer implements SceneRenderer {
  private renderer: THREE.WebGLRenderer | null = null
  private composer: EffectComposer | null = null
  private bloomPass: UnrealBloomPass | null = null
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera | null = null
  private time = 0
  private disposables: Array<{ dispose(): void }> = []
  private backgrounds: BackgroundHandle[] = []

  private bhGroup = new THREE.Group()
  private starMesh: THREE.Mesh | null = null
  private starMaterial: THREE.ShaderMaterial | null = null
  private diskMaterial: THREE.ShaderMaterial | null = null
  private jetMaterial: THREE.ShaderMaterial | null = null
  private shellPoints: THREE.Points | null = null
  private shellMaterial: THREE.ShaderMaterial | null = null
  private ringMaterial: THREE.SpriteMaterial | null = null
  private arcMaterial: THREE.MeshBasicMaterial | null = null
  private flashMaterial: THREE.SpriteMaterial | null = null

  init(container: HTMLElement, camera: THREE.PerspectiveCamera): void {
    this.camera = camera
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONSTANTS.DPR_CAP))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)
    this.renderer = renderer

    this.scene.background = new THREE.Color(0x000000)
    this.backgrounds.push(addBackgroundStars(this.scene), addBackgroundGalaxies(this.scene))

    // Same tilt as the raymarched tier / legacy scene.
    this.bhGroup.rotation.x = 0.749
    this.bhGroup.rotation.z = -Math.PI / 8
    this.scene.add(this.bhGroup)

    // Black hole shadow
    const bhGeo = new THREE.SphereGeometry(1, 32, 32)
    const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
    this.bhGroup.add(new THREE.Mesh(bhGeo, bhMat))
    this.disposables.push(bhGeo, bhMat)

    // Photon ring billboard (apparent radius ~2.6 r_s)
    const ringTex = createRingTexture()
    this.ringMaterial = new THREE.SpriteMaterial({
      map: ringTex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const ring = new THREE.Sprite(this.ringMaterial)
    ring.scale.set(5.2, 5.2, 1)
    this.scene.add(ring) // billboard: not tilted with the group
    this.disposables.push(ringTex, this.ringMaterial)

    // Lensing over-arc hint (upper half-torus in the group's vertical plane)
    const arcGeo = new THREE.TorusGeometry(4.2, 0.5, 12, 48, Math.PI)
    this.arcMaterial = new THREE.MeshBasicMaterial({
      color: 0xffc080,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    this.bhGroup.add(new THREE.Mesh(arcGeo, this.arcMaterial))
    this.disposables.push(arcGeo, this.arcMaterial)

    // Accretion disk
    const diskGeo = new THREE.RingGeometry(
      CONSTANTS.DISK_INNER_RS,
      CONSTANTS.DISK_OUTER_RS,
      128,
      8,
    )
    this.diskMaterial = additive({
      vertexShader: DISK_VERT,
      fragmentShader: DISK_FRAG,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uIgnition: { value: 0 },
        uInner: { value: CONSTANTS.DISK_INNER_RS },
        uOuter: { value: CONSTANTS.DISK_OUTER_RS },
      },
    })
    const disk = new THREE.Mesh(diskGeo, this.diskMaterial)
    disk.rotation.x = -Math.PI / 2 // lie flat in the group's XZ plane
    this.bhGroup.add(disk)
    this.disposables.push(diskGeo, this.diskMaterial)

    // Jets (two open cones along the group's Y axis)
    const jetGeo = new THREE.ConeGeometry(
      Math.tan((CONSTANTS.JET_HALF_ANGLE_DEG * Math.PI) / 180) * CONSTANTS.JET_LENGTH_RS,
      CONSTANTS.JET_LENGTH_RS,
      24,
      1,
      true,
    )
    this.jetMaterial = additive({
      vertexShader: JET_VERT,
      fragmentShader: JET_FRAG,
      side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 }, uIgnition: { value: 0 } },
    })
    const jetUp = new THREE.Mesh(jetGeo, this.jetMaterial)
    jetUp.position.y = CONSTANTS.JET_LENGTH_RS / 2
    jetUp.rotation.x = Math.PI // tip at origin, opening upward
    const jetDown = new THREE.Mesh(jetGeo, this.jetMaterial)
    jetDown.position.y = -CONSTANTS.JET_LENGTH_RS / 2
    this.bhGroup.add(jetUp, jetDown)
    this.disposables.push(jetGeo, this.jetMaterial)

    // Progenitor star
    const starGeo = new THREE.SphereGeometry(1, 48, 48)
    this.starMaterial = new THREE.ShaderMaterial({
      vertexShader: STAR_VERT,
      fragmentShader: STAR_FRAG,
      uniforms: { uTime: { value: 0 }, uCollapse: { value: 0 } },
    })
    this.starMesh = new THREE.Mesh(starGeo, this.starMaterial)
    this.scene.add(this.starMesh)
    this.disposables.push(starGeo, this.starMaterial)

    // Supernova shell points
    const dirs = new Float32Array(SHELL_POINTS * 3)
    const seeds = new Float32Array(SHELL_POINTS)
    for (let i = 0; i < SHELL_POINTS; i++) {
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      dirs[3 * i] = Math.sin(phi) * Math.cos(theta)
      dirs[3 * i + 1] = Math.sin(phi) * Math.sin(theta)
      dirs[3 * i + 2] = Math.cos(phi)
      seeds[i] = Math.random()
    }
    const shellGeo = new THREE.BufferGeometry()
    // Position attribute is required by Three even though the vertex shader ignores it.
    shellGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SHELL_POINTS * 3), 3))
    shellGeo.setAttribute('dir', new THREE.BufferAttribute(dirs, 3))
    shellGeo.setAttribute('seed', new THREE.BufferAttribute(seeds, 1))
    shellGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100) // skip culling math
    this.shellMaterial = additive({
      vertexShader: SHELL_VERT,
      fragmentShader: SHELL_FRAG,
      uniforms: {
        uShellRadius: { value: 0 },
        uCool: { value: 0 },
        uFade: { value: 1 },
      },
    })
    this.shellPoints = new THREE.Points(shellGeo, this.shellMaterial)
    this.shellPoints.visible = false
    this.scene.add(this.shellPoints)
    this.disposables.push(shellGeo, this.shellMaterial)

    // FLASH sprite
    const flashTex = createFlashTexture()
    this.flashMaterial = new THREE.SpriteMaterial({
      map: flashTex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const flash = new THREE.Sprite(this.flashMaterial)
    flash.scale.set(120, 120, 1)
    this.scene.add(flash)
    this.disposables.push(flashTex, this.flashMaterial)

    // Composer with quarter-res bloom
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(this.scene, camera))
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(Math.max(container.clientWidth / 4, 64), Math.max(container.clientHeight / 4, 64)),
      CONSTANTS.BLOOM_STRENGTH,
      CONSTANTS.BLOOM_RADIUS,
      CONSTANTS.BLOOM_THRESHOLD,
    )
    composer.addPass(this.bloomPass)
    composer.addPass(new OutputPass())
    this.composer = composer

    this.resize(container.clientWidth, container.clientHeight)
  }

  setPhase(state: PhaseState): void {
    const d = derivePhaseUniforms(state)
    if (this.starMesh && this.starMaterial) {
      this.starMesh.visible = d.starRadius > 0.01
      this.starMesh.scale.setScalar(Math.max(d.starRadius, 0.01))
      this.starMaterial.uniforms.uCollapse!.value =
        state.phase === Phase.COLLAPSE ? state.progress : 0
    }
    if (this.shellPoints && this.shellMaterial) {
      this.shellPoints.visible = d.shellRadius > 0.01
      this.shellMaterial.uniforms.uShellRadius!.value = d.shellRadius
      this.shellMaterial.uniforms.uCool!.value =
        state.phase === Phase.SHELL ? state.progress : state.phase >= Phase.BIRTH ? 1 : 0
      this.shellMaterial.uniforms.uFade!.value =
        state.phase === Phase.BIRTH ? 1 - state.progress : 1
    }
    if (this.diskMaterial) this.diskMaterial.uniforms.uIgnition!.value = d.ignition
    if (this.jetMaterial) this.jetMaterial.uniforms.uIgnition!.value = d.ignition
    if (this.ringMaterial) this.ringMaterial.opacity = d.ignition
    if (this.arcMaterial) this.arcMaterial.opacity = 0.35 * d.ignition
    if (this.flashMaterial) this.flashMaterial.opacity = Math.min(d.flash / 4, 1)
  }

  update(dt: number): void {
    if (!this.composer) return
    this.time += dt
    if (this.diskMaterial) this.diskMaterial.uniforms.uTime!.value = this.time
    if (this.jetMaterial) this.jetMaterial.uniforms.uTime!.value = this.time
    if (this.starMaterial) this.starMaterial.uniforms.uTime!.value = this.time
    this.composer.render()
  }

  resize(width: number, height: number): void {
    if (!this.renderer || !this.composer || !this.camera) return
    this.renderer.setSize(width, height, false)
    this.composer.setSize(width, height)
  }

  dispose(): void {
    this.backgrounds.forEach((b) => b.dispose())
    this.disposables.forEach((d) => d.dispose())
    this.composer?.dispose()
    this.bloomPass?.dispose()
    if (this.renderer) {
      this.renderer.domElement.remove()
      this.renderer.dispose()
    }
    this.renderer = null
    this.composer = null
    this.camera = null
  }
}
