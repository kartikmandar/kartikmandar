import * as THREE from 'three'

export interface BackgroundHandle {
  dispose(): void
}

/** 1400 stars on a far sphere shell (extracted from the legacy scene). */
export function addBackgroundStars(
  parent: THREE.Object3D,
  numStars = 1400,
  radius = 120,
): BackgroundHandle {
  const positions = new Float32Array(numStars * 3)
  const colors = new Float32Array(numStars * 3)
  for (let i = 0; i < numStars; i++) {
    const phi = Math.acos(2 * Math.random() - 1)
    const theta = 2 * Math.PI * Math.random()
    const r = radius * (0.92 + 0.08 * Math.random())
    positions[3 * i] = r * Math.sin(phi) * Math.cos(theta)
    positions[3 * i + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[3 * i + 2] = r * Math.cos(phi)
    const base = 0.85 + Math.random() * 0.15
    const color = new THREE.Color().setHSL(
      0.1 + 0.15 * Math.random(),
      0.05 + 0.17 * Math.random(),
      base,
    )
    colors[3 * i] = color.r
    colors[3 * i + 1] = color.g
    colors[3 * i + 2] = color.b
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const mat = new THREE.PointsMaterial({
    size: 0.72,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  })
  const stars = new THREE.Points(geo, mat)
  parent.add(stars)
  return {
    dispose() {
      parent.remove(stars)
      geo.dispose()
      mat.dispose()
    },
  }
}

/** Procedural wispy spiral-galaxy sprite texture (extracted from legacy). */
function createGalaxyTexture(size = 256, color1 = '#fff', color2 = '#ffd080'): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.save()
  ctx.translate(size / 2, size / 2)
  for (let arm = 0; arm < 3; arm++) {
    ctx.rotate(((2 * Math.PI) / 3) * arm + Math.random() * 0.2)
    ctx.beginPath()
    for (let i = 0; i < 90; i++) {
      const t = i / 90
      const r = (size / 2) * t * (0.6 + 0.2 * Math.random())
      const theta = 2.5 * Math.PI * t
      const x = r * Math.cos(theta)
      const y = r * Math.sin(theta)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 2.5 + Math.random() * 2.5
    ctx.shadowColor = color2
    ctx.shadowBlur = 8 + Math.random() * 10
    ctx.globalAlpha = 0.7
    ctx.stroke()
  }
  ctx.restore()
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2 * 0.45)
  grad.addColorStop(0, color1)
  grad.addColorStop(0.35, color2)
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.globalAlpha = 1.0
  ctx.globalCompositeOperation = 'lighter'
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2 * 0.45, 0, 2 * Math.PI)
  ctx.closePath()
  ctx.fillStyle = grad
  ctx.fill()
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/** 12 galaxy sprites on the far shell (extracted; placement bias removed — the cubemap covers all directions anyway). */
export function addBackgroundGalaxies(
  parent: THREE.Object3D,
  num = 12,
  radius = 110,
): BackgroundHandle {
  const disposables: Array<() => void> = []
  for (let i = 0; i < num; i++) {
    const phi = Math.acos(2 * Math.random() - 1)
    const theta = 2 * Math.PI * Math.random()
    const r = radius * (0.93 + 0.09 * Math.random())
    const color1 = i % 3 === 0 ? '#fff' : i % 3 === 1 ? '#ffd080' : '#b5e3ff'
    const color2 = i % 3 === 0 ? '#ffd080' : i % 3 === 1 ? '#ffb347' : '#a6c8ff'
    const tex = createGalaxyTexture(256, color1, color2)
    if (!tex) continue
    const mat = new THREE.SpriteMaterial({
      map: tex,
      color: 0xffffff,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const sprite = new THREE.Sprite(mat)
    const scale = 10 + Math.random() * 22
    sprite.scale.set(scale, scale, 1)
    sprite.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    )
    parent.add(sprite)
    disposables.push(() => {
      parent.remove(sprite)
      mat.dispose()
      tex.dispose()
    })
  }
  return {
    dispose() {
      disposables.forEach((d) => d())
    },
  }
}

export interface BakedCubemap {
  texture: THREE.CubeTexture
  /**
   * Frees the GPU render target (6 FBOs + texture). Always call this —
   * disposing only `texture` leaks the framebuffers.
   */
  dispose(): void
}

/**
 * Bake stars + galaxies into a cubemap once at init.
 * Escaped rays in the raymarcher sample this, so the background lenses for free.
 */
export function bakeBackgroundCubemap(renderer: THREE.WebGLRenderer): BakedCubemap {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)
  const stars = addBackgroundStars(scene)
  const galaxies = addBackgroundGalaxies(scene)

  const target = new THREE.WebGLCubeRenderTarget(1024, {
    generateMipmaps: false,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  })
  const cubeCamera = new THREE.CubeCamera(0.1, 500, target)
  cubeCamera.update(renderer, scene)

  stars.dispose()
  galaxies.dispose()
  return {
    texture: target.texture,
    dispose() {
      target.dispose()
    },
  }
}
