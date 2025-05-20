'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import SupernovaEffect from '../SupernovaEffect'

export default function QuasarBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showSupernova, setShowSupernova] = useState(false)
  
  useEffect(() => {
    // Import Three.js dynamically to avoid SSR issues
    const importThreeJS = async () => {
      try {
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
        
        if (!containerRef.current) return
        
        // Get container dimensions
        const containerWidth = containerRef.current.clientWidth
        const containerHeight = containerRef.current.clientHeight
        
        // Scene setup
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x000000)

        const camera = new THREE.PerspectiveCamera(
          75, containerWidth / containerHeight, 0.1, 1000
        )
        camera.position.z = 5

        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(containerWidth, containerHeight)
        containerRef.current.appendChild(renderer.domElement)

        // Add OrbitControls for drag, zoom, rotate
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.enablePan = false
        
        // Set zoom limits
        controls.minDistance = 1.5
        controls.maxDistance = 2000
        
        // Track zoom level to trigger supernova
        const zoomThreshold = 1750 // The distance at which to trigger supernova
        let supernovaTriggered = false

        // Create a parent group for tilt
        const tiltGroup = new THREE.Group()
        scene.add(tiltGroup)

        // Create a child group for spinning around the local axis
        const spinGroup = new THREE.Group()
        tiltGroup.add(spinGroup)

        // Make the core a uniform, extremely bright white
        const sphereRadius = 0.2
        const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32)
        const sphereMaterial = new THREE.MeshPhongMaterial({
          color: 0xffffff, // pure white
          emissive: 0xffffff, // pure white
          emissiveIntensity: 25.0, // extremely bright
          shininess: 400
        })
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
        spinGroup.add(sphere)

        // Add a blindingly bright white point light at the core
        const coreLight = new THREE.PointLight(0xffffff, 18, 15)
        coreLight.position.set(0, 0, 0)
        spinGroup.add(coreLight)

        // Add a large, soft, bright white glow using a sprite
        const blindingGlowMaterial = new THREE.SpriteMaterial({
          map: (() => {
            const size = 512
            const canvas = document.createElement('canvas')
            canvas.width = canvas.height = size
            const ctx = canvas.getContext('2d')
            if (!ctx) return null
            const gradient = ctx.createRadialGradient(
              size/2, size/2, size/16,
              size/2, size/2, size/2
            )
            gradient.addColorStop(0, 'rgba(255,255,255,1.0)')
            gradient.addColorStop(0.2, 'rgba(255,255,255,0.85)')
            gradient.addColorStop(0.5, 'rgba(255,255,255,0.4)')
            gradient.addColorStop(1, 'rgba(255,255,255,0)')
            ctx.fillStyle = gradient
            ctx.fillRect(0,0,size,size)
            const texture = new THREE.CanvasTexture(canvas)
            return texture
          })(),
          transparent: true,
          depthWrite: false
        })
        const blindingGlow = new THREE.Sprite(blindingGlowMaterial)
        blindingGlow.scale.set(10, 10, 1) // large, soft, blinding glow
        spinGroup.add(blindingGlow)

        // --- Axis line as a thick, glowing cylinder (aligned with Y, no extra rotation) ---
        const axisLineLength = 1000
        const axisRadius = 0.08 // thickness of axis
        const axisColor = 0xffffff // white axis
        // Main solid axis
        const axisGeom = new THREE.CylinderGeometry(axisRadius, axisRadius, axisLineLength*2, 32)
        const axisMat = new THREE.MeshBasicMaterial({ color: axisColor })
        const axisMesh = new THREE.Mesh(axisGeom, axisMat)
        axisMesh.position.set(0, 0, 0)
        spinGroup.add(axisMesh)

        // Tilt the tiltGroup: first out of the screen (X axis), then to the right (Z axis)
        tiltGroup.rotation.x = 0.749 // 20 degrees in radians
        tiltGroup.rotation.z = -Math.PI / 8 // -30 degrees in radians

        // Add a point light to enhance the fiery glow effect and give shading
        const pointLight = new THREE.PointLight(0xffaa33, 2.2, 100)
        pointLight.position.set(2, 2, 2) // Move light off-center for shading
        scene.add(pointLight)

        // Add a second dimmer point light on the opposite side for depth
        const backLight = new THREE.PointLight(0xff3300, 0.7, 100)
        backLight.position.set(-2, -2, -2)
        scene.add(backLight)

        // Optionally, add a soft ambient light
        const ambientLight = new THREE.AmbientLight(0x442211, 0.4)
        scene.add(ambientLight)

        // --- Helper to create a 1D gradient texture (white to orange) ---
        function create1DGradientTexture(startColor: string, endColor: string, size = 128) {
          const canvas = document.createElement('canvas')
          canvas.width = size
          canvas.height = 1
          const ctx = canvas.getContext('2d')
          if (!ctx) return null
          const gradient = ctx.createLinearGradient(0, 0, size, 0)
          gradient.addColorStop(0, startColor)
          gradient.addColorStop(1, endColor)
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, size, 1)
          const texture = new THREE.CanvasTexture(canvas)
          texture.wrapS = THREE.ClampToEdgeWrapping
          texture.wrapT = THREE.ClampToEdgeWrapping
          texture.needsUpdate = true
          return texture
        }

        const spiralGradientTexture = create1DGradientTexture('#fff', '#ff8800', 256)

        // --- Helper to create a much softer, larger, and blurrier particle texture for gas ---
        function createSoftGasTexture(size = 128, color = '#fff') {
          const canvas = document.createElement('canvas')
          canvas.width = canvas.height = size
          const ctx = canvas.getContext('2d')
          if (!ctx) return null
          const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
          gradient.addColorStop(0, color)
          gradient.addColorStop(0.18, color)
          gradient.addColorStop(0.32, 'rgba(255,255,255,0.18)')
          gradient.addColorStop(0.56, 'rgba(255,255,255,0.06)')
          gradient.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, size, size)
          const texture = new THREE.CanvasTexture(canvas)
          texture.needsUpdate = true
          return texture
        }

        const gasTexture = createSoftGasTexture(128, '#fff8cc')

        // --- Color interpolation helper for multi-stop gradient (white -> yellow -> orange -> dark orange) ---
        function lerpMultiColor(stops: {stop: number, color: THREE.Color}[], t: number) {
          // stops: [{stop: 0-1, color: THREE.Color}...], t: 0-1
          if (!stops || stops.length === 0) return new THREE.Color(0xffffff)
          
          for (let i = 0; i < stops.length - 1; i++) {
            const current = stops[i];
            const next = stops[i+1];
            
            if (!current || !next) continue;
            
            if (t >= current.stop && t <= next.stop) {
              const localT = (t - current.stop) / (next.stop - current.stop)
              return current.color.clone().lerp(next.color, localT)
            }
          }
          
          // Fallback to last color or white if not found
          const lastStop = stops[stops.length-1];
          return lastStop?.color ? lastStop.color.clone() : new THREE.Color(0xffffff)
        }
        const dustColorStops = [
          { stop: 0.0, color: new THREE.Color(0xffffff) },   // white
          { stop: 0.33, color: new THREE.Color(0xfff066) },  // yellow
          { stop: 0.66, color: new THREE.Color(0xff8800) },  // orange
          { stop: 1.0, color: new THREE.Color(0xc14400) }    // dark orange
        ]

        // --- Add gas/fluid particles along the spiral arms ---
        const dustParticlesPerArm = 220
        for (let a = 0; a < 16; a++) {
          const angleOffset = (2 * Math.PI / 16) * a
          for (let i = 0; i < dustParticlesPerArm; i++) {
            const t = Math.random() * 0.98 + 0.01
            const r = 0.1 + (5.6 - 0.1) * t + (Math.random()-0.5)*0.12
            const theta = 2.2 * 2 * Math.PI * t + angleOffset + (Math.random()-0.5)*0.13
            const y = Math.sin(t * Math.PI) * 0.02 + Math.cos(theta + tiltGroup.rotation.x) * 0.05 + (Math.random()-0.5)*0.11
            const x = r * Math.cos(theta)
            const z = r * Math.sin(theta)
            const color = lerpMultiColor(dustColorStops, t)
            if (!color || !gasTexture) continue
            const spriteMat = new THREE.SpriteMaterial({
              map: gasTexture,
              color: color,
              transparent: true,
              opacity: 0.10 + Math.random()*0.13, // more transparent
              depthWrite: false,
              blending: THREE.AdditiveBlending
            })
            const sprite = new THREE.Sprite(spriteMat)
            // Elliptical scaling for more fluid look
            const scaleBase = 0.34 + Math.random()*0.23
            const scaleY = scaleBase * (0.7 + Math.random()*1.2)
            const scaleX = scaleBase * (0.7 + Math.random()*1.2)
            sprite.scale.set(scaleX, scaleY, 1)
            sprite.position.set(x, y, z)
            spinGroup.add(sprite)
          }
        }
        // Optional: Add a second, even softer layer for extra haze
        for (let a = 0; a < 10; a++) {
          const angleOffset = (2 * Math.PI / 10) * a + Math.PI/10
          for (let i = 0; i < 60; i++) {
            const t = Math.random() * 0.98 + 0.01
            const r = 0.1 + (5.6 - 0.1) * t + (Math.random()-0.5)*0.22
            const theta = 2.2 * 2 * Math.PI * t + angleOffset + (Math.random()-0.5)*0.21
            const y = Math.sin(t * Math.PI) * 0.04 + Math.cos(theta + tiltGroup.rotation.x) * 0.09 + (Math.random()-0.5)*0.17
            const x = r * Math.cos(theta)
            const z = r * Math.sin(theta)
            const color = lerpMultiColor(dustColorStops, t)
            if (!color || !gasTexture) continue
            const spriteMat = new THREE.SpriteMaterial({
              map: gasTexture,
              color: color,
              transparent: true,
              opacity: 0.04 + Math.random()*0.07,
              depthWrite: false,
              blending: THREE.AdditiveBlending
            })
            const sprite = new THREE.Sprite(spriteMat)
            const scaleBase = 0.65 + Math.random()*0.44
            const scaleY = scaleBase * (0.7 + Math.random()*1.2)
            const scaleX = scaleBase * (0.7 + Math.random()*1.2)
            sprite.scale.set(scaleX, scaleY, 1)
            sprite.position.set(x, y, z)
            spinGroup.add(sprite)
          }
        }

        // --- Smoke Particle System for Spiral Arms ---
        // Helper: Create a soft smoke texture (radial gradient, can be replaced with PNG if desired)
        function createSmokeTexture(size = 128) {
          const canvas = document.createElement('canvas')
          canvas.width = canvas.height = size
          const ctx = canvas.getContext('2d')
          if (!ctx) return null
          const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
          gradient.addColorStop(0, 'rgba(255,255,255,0.18)')
          gradient.addColorStop(0.18, 'rgba(255,255,255,0.12)')
          gradient.addColorStop(0.4, 'rgba(255,255,255,0.07)')
          gradient.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, size, size)
          const texture = new THREE.CanvasTexture(canvas)
          texture.needsUpdate = true
          return texture
        }
        const smokeTexture = createSmokeTexture()

        // --- Smoke Particle Data ---
        const smokeParticlesPerArm = 90
        const smokeNumArms = 16
        const smokeParticles: any[] = []
        const smokeGeometry = new THREE.BufferGeometry()
        const totalParticles = smokeParticlesPerArm * smokeNumArms
        const positions = new Float32Array(totalParticles * 3)
        const sizes = new Float32Array(totalParticles)
        const opacities = new Float32Array(totalParticles)
        const colors = new Float32Array(totalParticles * 3)
        const startTimes = new Float32Array(totalParticles)
        const lifetimes = new Float32Array(totalParticles)
        let smokeTime = 0
        // Color stops for smoke: white -> yellow -> orange -> dark orange
        const smokeColorStops = [
          { stop: 0.0, color: new THREE.Color(0xffffff) },
          { stop: 0.33, color: new THREE.Color(0xfff066) },
          { stop: 0.66, color: new THREE.Color(0xff8800) },
          { stop: 1.0, color: new THREE.Color(0xc14400) }
        ]
        // Initialize
        for (let a = 0; a < smokeNumArms; a++) {
          const angleOffset = (2 * Math.PI / smokeNumArms) * a
          for (let i = 0; i < smokeParticlesPerArm; i++) {
            const idx = a * smokeParticlesPerArm + i
            const t = Math.random() * 0.98 + 0.01
            const r = 0.1 + (5.6 - 0.1) * t + (Math.random()-0.5)*0.12
            const theta = 2.2 * 2 * Math.PI * t + angleOffset + (Math.random()-0.5)*0.13
            const y = Math.sin(t * Math.PI) * 0.02 + Math.cos(theta + tiltGroup.rotation.x) * 0.05 + (Math.random()-0.5)*0.11
            const x = r * Math.cos(theta)
            const z = r * Math.sin(theta)
            positions[idx*3] = x
            positions[idx*3+1] = y
            positions[idx*3+2] = z
            // Color based on t along spiral
            const color = lerpMultiColor(smokeColorStops, t)
            if (!color) continue
            colors[idx*3] = color.r
            colors[idx*3+1] = color.g
            colors[idx*3+2] = color.b
            // Particle timing
            startTimes[idx] = Math.random() * 8.0
            lifetimes[idx] = 3.5 + Math.random()*2.5
            // Initial size and opacity
            sizes[idx] = 0.18 + Math.random()*0.23
            opacities[idx] = 0.0
            // Store extra info for animation
            smokeParticles.push({
              idx, t, basePos: [x, y, z],
              theta, r, arm: a,
              size0: sizes[idx],
              color,
              lifetime: lifetimes[idx],
              startTime: startTimes[idx],
              speed: 0.12 + Math.random()*0.22,
              spiralOffset: (Math.random()-0.5)*0.1
            })
          }
        }
        smokeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        smokeGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
        smokeGeometry.setAttribute('customOpacity', new THREE.BufferAttribute(opacities, 1))
        smokeGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

        // --- Custom ShaderMaterial for animated smoke particles ---
        if (!smokeTexture) return
        const smokeMaterial = new THREE.PointsMaterial({
          map: smokeTexture,
          size: 1.0,
          sizeAttenuation: true,
          vertexColors: true,
          transparent: true,
          opacity: 0.45,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        })
        const smokePoints = new THREE.Points(smokeGeometry, smokeMaterial)
        spinGroup.add(smokePoints)

        // --- Animation loop for smoke ---
        function updateSmokeParticles(dt: number) {
          smokeTime += dt
          for (let i = 0; i < smokeParticles.length; i++) {
            const p = smokeParticles[i]
            // Particle age
            let age = (smokeTime - p.startTime) % p.lifetime
            if (age < 0) age += p.lifetime
            const lifeFrac = age / p.lifetime
            // Animate position slightly outward and around spiral
            const spiralT = p.t + 0.09 * lifeFrac
            const spiralR = 0.1 + (5.6 - 0.1) * spiralT + p.spiralOffset
            const spiralTheta = 2.2 * 2 * Math.PI * spiralT + (2 * Math.PI / smokeNumArms) * p.arm
            const spiralY = Math.sin(spiralT * Math.PI) * 0.02 + Math.cos(spiralTheta + tiltGroup.rotation.x) * 0.05
            const spiralX = spiralR * Math.cos(spiralTheta)
            const spiralZ = spiralR * Math.sin(spiralTheta)
            positions[p.idx*3] = spiralX
            positions[p.idx*3+1] = spiralY
            positions[p.idx*3+2] = spiralZ
            // Animate size and opacity
            let fade = 1.0
            if (lifeFrac < 0.18) fade = lifeFrac/0.18 // fade in
            else if (lifeFrac > 0.8) fade = (1.0-lifeFrac)/0.2 // fade out
            opacities[p.idx] = fade
            sizes[p.idx] = p.size0 * (0.7 + 0.7*lifeFrac)
          }
          const positionAttr = smokeGeometry.attributes.position
          const sizeAttr = smokeGeometry.attributes.size
          const opacityAttr = smokeGeometry.attributes.customOpacity
          
          if (positionAttr) positionAttr.needsUpdate = true
          if (sizeAttr) sizeAttr.needsUpdate = true
          if (opacityAttr) opacityAttr.needsUpdate = true
        }

        // --- Add fixed background stars ---
        function addBackgroundStars(scene: THREE.Scene, numStars = 1400, radius = 120) {
          const positions = new Float32Array(numStars * 3)
          const colors = new Float32Array(numStars * 3)
          for (let i = 0; i < numStars; i++) {
            // Random point on a sphere shell
            const phi = Math.acos(2 * Math.random() - 1)
            const theta = 2 * Math.PI * Math.random()
            const r = radius * (0.92 + 0.08 * Math.random())
            const x = r * Math.sin(phi) * Math.cos(theta)
            const y = r * Math.sin(phi) * Math.sin(theta)
            const z = r * Math.cos(phi)
            positions[3*i] = x
            positions[3*i+1] = y
            positions[3*i+2] = z
            // Slight color variation (white to blue-white/yellow-white)
            const base = 0.85 + Math.random()*0.15
            const color = new THREE.Color().setHSL(0.1 + 0.15*Math.random(), 0.05 + 0.17*Math.random(), base)
            colors[3*i] = color.r
            colors[3*i+1] = color.g
            colors[3*i+2] = color.b
          }
          const starGeo = new THREE.BufferGeometry()
          starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
          starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
          const starMat = new THREE.PointsMaterial({
            size: 0.72,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            depthWrite: false
          })
          const stars = new THREE.Points(starGeo, starMat)
          scene.add(stars)
        }
        addBackgroundStars(scene)

        // --- Add a couple of background galaxies (fixed, not rotating) ---
        function createGalaxyTexture(size = 256, color1 = '#fff', color2 = '#ffd080') {
          const canvas = document.createElement('canvas')
          canvas.width = canvas.height = size
          const ctx = canvas.getContext('2d')
          if (!ctx) return null
          // Spiral arms (simple, wispy)
          ctx.save()
          ctx.translate(size/2, size/2)
          for (let arm = 0; arm < 3; arm++) {
            ctx.rotate((2*Math.PI/3)*arm + Math.random()*0.2)
            ctx.beginPath()
            for (let i = 0; i < 90; i++) {
              const t = i / 90
              const r = size/2 * t * (0.6 + 0.2*Math.random())
              const theta = 2.5 * Math.PI * t
              const x = r * Math.cos(theta)
              const y = r * Math.sin(theta)
              if (i === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            }
            ctx.strokeStyle = 'rgba(255,255,255,0.18)'
            ctx.lineWidth = 2.5 + Math.random()*2.5
            ctx.shadowColor = color2
            ctx.shadowBlur = 8 + Math.random()*10
            ctx.globalAlpha = 0.7
            ctx.stroke()
          }
          ctx.restore()
          // Central core
          const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2*0.45)
          grad.addColorStop(0, color1)
          grad.addColorStop(0.35, color2)
          grad.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.globalAlpha = 1.0
          ctx.globalCompositeOperation = 'lighter'
          ctx.beginPath()
          ctx.arc(size/2, size/2, size/2*0.45, 0, 2*Math.PI)
          ctx.closePath()
          ctx.fillStyle = grad
          ctx.fill()
          const texture = new THREE.CanvasTexture(canvas)
          texture.needsUpdate = true
          return texture
        }
        
        function addBackgroundGalaxies(scene: THREE.Scene, num = 12, radius = 110) {
          for (let i = 0; i < num; i++) {
            // Bias galaxy placement toward the camera's view (positive Z hemisphere)
            const phi = Math.acos(2 * Math.random() - 1)
            // For most galaxies, theta is centered around 0 (positive Z axis)
            let theta: number
            if (i < Math.floor(num * 0.7)) {
              theta = (Math.random() - 0.5) * Math.PI * 0.85 // [-0.42π, 0.42π] -- mostly in front
            } else {
              theta = 2 * Math.PI * Math.random() // full sphere for some
            }
            const r = radius * (0.93 + 0.09 * Math.random())
            const x = r * Math.sin(phi) * Math.cos(theta)
            const y = r * Math.sin(phi) * Math.sin(theta)
            const z = r * Math.cos(phi)
            // Only keep galaxies with z > 0 (in front) for the biased ones
            if (i < Math.floor(num * 0.7) && z < 0) {
              // Flip to positive Z
              continue
            }
            const color1 = i % 3 === 0 ? '#fff' : (i % 3 === 1 ? '#ffd080' : '#b5e3ff')
            const color2 = i % 3 === 0 ? '#ffd080' : (i % 3 === 1 ? '#ffb347' : '#a6c8ff')
            const tex = createGalaxyTexture(256, color1, color2)
            if (!tex) continue
            const mat = new THREE.SpriteMaterial({
              map: tex,
              color: 0xffffff,
              transparent: true,
              opacity: 0.82,
              depthWrite: false,
              blending: THREE.AdditiveBlending
            })
            const sprite = new THREE.Sprite(mat)
            // Vary size for each galaxy
            const scale = 10 + Math.random()*22 // 10 to 32 units
            sprite.scale.set(scale, scale, 1)
            sprite.position.set(x, y, z)
            scene.add(sprite)
          }
        }
        addBackgroundGalaxies(scene)

        // Handle resize - update to container dimensions
        const handleResize = () => {
          if (!containerRef.current) return
          
          const width = containerRef.current.clientWidth
          const height = containerRef.current.clientHeight
          
          camera.aspect = width / height
          camera.updateProjectionMatrix()
          renderer.setSize(width, height)
        }
        
        window.addEventListener('resize', handleResize)

        // Animation loop (slow rotation: 1 rotation per minute)
        let lastTime = performance.now()
        let accumulatedRotation = 0
        
        function animate() {
          const animationId = requestAnimationFrame(animate)
          controls.update()
          
          // Check if we need to trigger the supernova effect based on zoom level
          if (!supernovaTriggered && camera.position.distanceTo(new THREE.Vector3(0, 0, 0)) > zoomThreshold) {
            supernovaTriggered = true
            setShowSupernova(true)
          } else if (supernovaTriggered && camera.position.distanceTo(new THREE.Vector3(0, 0, 0)) <= zoomThreshold) {
            supernovaTriggered = false
            setShowSupernova(false)
          }
          
          const now = performance.now()
          const delta = (now - lastTime) / 1000 // seconds
          lastTime = now
          
          // 1 rotation per minute = 2π/60 radians per second
          const rotationSpeed = 2 * Math.PI / 60
          accumulatedRotation += rotationSpeed * delta
          spinGroup.rotation.y = accumulatedRotation
          updateSmokeParticles(delta)
          renderer.render(scene, camera)
          
          return animationId
        }
        
        const animationId = animate()
        
        // Clean up
        return () => {
          cancelAnimationFrame(animationId)
          window.removeEventListener('resize', handleResize)
          
          if (containerRef.current) {
            containerRef.current.innerHTML = ''
          }
          
          // Dispose of resources
          renderer.dispose()
          scene.clear()
        }
      } catch (error) {
        console.error("Error initializing Three.js:", error)
      }
    }
    
    importThreeJS()
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div 
        ref={containerRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%',
          height: '100%',
          zIndex: 0,
          overflow: 'hidden'
        }} 
      />
      {!showSupernova && (
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 15px',
            background: 'rgba(0, 0, 0, 0.5)',
            color: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'normal',
            letterSpacing: '0.5px',
            backdropFilter: 'blur(4px)',
            zIndex: 2,
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease-in-out',
            fontFamily: 'sans-serif'
          }}
        >
          Scroll to zoom | Drag to spin
        </div>
      )}
      {showSupernova && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1
          }}
        >
          <SupernovaEffect height="100%" />
        </div>
      )}
    </div>
  )
} 