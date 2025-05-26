'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface SupernovaEffectProps {
  height?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
}

export default function SupernovaEffect({ 
  height = '100vh', 
  style,
  onComplete
}: SupernovaEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isExploding, setIsExploding] = useState(false)
  const isExplodingRef = useRef(false)
  
  // Auto-trigger explosion when the component is rendered
  useEffect(() => {
    // After a short delay to allow initialization
    const timer = setTimeout(() => {
      setIsExploding(true)
    }, 200)
    
    return () => clearTimeout(timer)
  }, []) // Empty dependency array ensures this runs only once
  
  // Add a completed flag to track if explosion is done
  const explosionCompletedRef = useRef(false)
  
  useEffect(() => {
    // Scene setup
    if (!containerRef.current) return

    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight
    
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000) // Ensure pitch black background
    const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerWidth, containerHeight)
    containerRef.current.appendChild(renderer.domElement)
    
    // Camera position
    camera.position.z = 30
    
    // Variables for the supernova
    let exploding = false
    let explosionTime = 0
    const explosionDuration = 12.0 // seconds - increased for a slower, smoother transition
    
    // Remove background stars - we want pitch black background
    // No code for stars here anymore
    
    // Create the star (pre-explosion)
    const starRadius = 4
    const starGeom = new THREE.SphereGeometry(starRadius, 32, 32)
    const starMat = new THREE.MeshBasicMaterial({ 
        color: 0xFFAA44,
        transparent: true,
        opacity: 0.9
    })
    const star = new THREE.Mesh(starGeom, starMat)
    scene.add(star)
    
    // Add a glow effect to the star
    const glowGeometry = new THREE.SphereGeometry(starRadius * 1.2, 32, 32)
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF5500,
        transparent: true,
        opacity: 0.5
    })
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
    scene.add(glowMesh)
    
    // Make star and glow invisible from the beginning
    star.visible = false
    glowMesh.visible = false
    
    // Create particles for explosion
    const particleCount = 20000
    const particleGeometry = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleColors = new Float32Array(particleCount * 3)
    const particleVelocities: Array<{x: number, y: number, z: number}> = []
    
    for (let i = 0; i < particleCount; i++) {
        // Create particles in a spherical distribution
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * Math.PI
        const radius = Math.random() * 2
        
        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.sin(phi) * Math.sin(theta)
        const z = radius * Math.cos(phi)
        
        particlePositions[i * 3] = x
        particlePositions[i * 3 + 1] = y
        particlePositions[i * 3 + 2] = z
        
        // Create random velocities for particles
        particleVelocities.push({
            x: x * (Math.random() * 0.5 + 0.5),
            y: y * (Math.random() * 0.5 + 0.5),
            z: z * (Math.random() * 0.5 + 0.5)
        })
        
        // Colors: mixture of yellow, orange, and red
        if (Math.random() < 0.4) {
            // Yellow-white core
            particleColors[i * 3] = 1.0     // R
            particleColors[i * 3 + 1] = 1.0 // G
            particleColors[i * 3 + 2] = 0.8 // B
        } else if (Math.random() < 0.7) {
            // Orange middle
            particleColors[i * 3] = 1.0     // R
            particleColors[i * 3 + 1] = 0.6 // G
            particleColors[i * 3 + 2] = 0.0 // B
        } else {
            // Red outer
            particleColors[i * 3] = 1.0     // R
            particleColors[i * 3 + 1] = 0.3 // G
            particleColors[i * 3 + 2] = 0.0 // B
        }
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.25,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    })
    
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    particles.visible = false
    scene.add(particles)
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x222222)
    scene.add(ambientLight)
    
    const pointLight = new THREE.PointLight(0xFFAA00, 2, 100)
    pointLight.position.set(0, 0, 0)
    scene.add(pointLight)
    
    // Trigger explosion function
    const triggerExplosion = () => {
        if (!exploding) {
            exploding = true
            isExplodingRef.current = true
            setIsExploding(true)
            explosionTime = 0
            particles.visible = true
            
            // Get position attribute safely
            const geometry = particles.geometry
            if (!geometry) return
            
            const positionAttribute = geometry.getAttribute('position')
            if (!positionAttribute) return
            
            const positions = positionAttribute.array
            if (!positions) return
            
            // Reset positions of particles to center
            for (let i = 0; i < particleCount; i++) {
                const index = i * 3
                if (index < positions.length - 2) {
                    positions[index] = 0
                    positions[index + 1] = 0
                    positions[index + 2] = 0
                }
            }
            
            positionAttribute.needsUpdate = true
        }
    }
    
    // Animation functions
    function animateStar() {
        // Do nothing - star should remain invisible
    }
    
    function animateExplosion(deltaTime: number) {
        if (!exploding) return
        
        explosionTime += deltaTime
        const progress = Math.min(explosionTime / explosionDuration, 1.0)
        const easing = progress < 0.2 ? 
            progress * 5 : // Fast start
            1 - (progress - 0.2) * 1.25 // Slow fade
        
        // Hide the original star during explosion
        star.visible = false
        glowMesh.visible = false
        
        // Get position attribute safely
        const geometry = particles.geometry
        if (!geometry) return
        
        const positionAttribute = geometry.getAttribute('position')
        if (!positionAttribute) return
        
        const positions = positionAttribute.array
        if (!positions) return
        
        // Update opacity - create a smoother fade out
        let opacity = 0;
        if (progress < 0.4) {
            // First 40%: full opacity
            opacity = 1.0;
        } else if (progress < 0.9) {
            // Gradually fade out from 0.4 to 0.9 progress - longer fade period
            opacity = 1.0 - ((progress - 0.4) / 0.5);
        } else {
            // Final fade from 0.9 to 1.0 - ensure it smoothly approaches zero
            opacity = 0.2 * Math.pow(1.0 - ((progress - 0.9) / 0.1), 2);
        }
        
        // Apply a smoothstep to create a more natural fade
        opacity = Math.max(0, Math.min(opacity, 1.0));
        particleMaterial.opacity = opacity;
        
        // When near completion, gradually make particles invisible to prevent flash
        if (progress > 0.98) {
            const finalOpacity = (1.0 - progress) / 0.02; // Approaches 0 as progress approaches 1
            particleMaterial.opacity = opacity * finalOpacity;
        }
        
        // Update particle positions
        const speed = progress < 0.7 ? 20 * easing : 5 * easing // Slower speed at the end
        
        // Slowly increase particle size as they fade out
        const particleSize = progress < 0.5 ? 0.25 : 0.25 + (progress - 0.5) * 0.3;
        particleMaterial.size = particleSize;
        
        for (let i = 0; i < particleCount; i++) {
            const index = i * 3
            
            // Make sure we have this velocity and don't go out of bounds
            if (i < particleVelocities.length && index < positions.length - 2) {
                const velocity = particleVelocities[i];
                
                if (velocity) {
                    positions[index] += (velocity?.x || 0) * speed * deltaTime
                    positions[index + 1] += (velocity?.y || 0) * speed * deltaTime
                    positions[index + 2] += (velocity?.z || 0) * speed * deltaTime
                }
            }
        }
        
        positionAttribute.needsUpdate = true
        
        // Add light flash
        if (progress < 0.3) {
            const intensity = 10 * (1 - progress / 0.3)
            pointLight.intensity = intensity
        } else {
            pointLight.intensity = 0
        }
        
        // Reset when explosion is complete
        if (progress >= 1.0 && !explosionCompletedRef.current) {
            exploding = false
            isExplodingRef.current = false
            setIsExploding(false) // Set React state to false to prevent retrigger
            explosionCompletedRef.current = true // Mark as completed
            
            // Ensure particles remain completely invisible in their final state
            particleMaterial.opacity = 0;
            particles.visible = false;
            
            // No light
            pointLight.intensity = 0;
            
            // Call the onComplete callback if provided
            if (onComplete) {
                onComplete();
            }
        }
    }
    
    // Watch for external isExploding changes
    const checkExploding = () => {
        if (isExploding && !isExplodingRef.current && !exploding && !explosionCompletedRef.current) {
            triggerExplosion()
        }
    }
    
    // Animation loop
    let lastTime = 0
    function animate(currentTime: number) {
        const animationId = requestAnimationFrame(animate)
        
        const deltaTime = lastTime === 0 ? 0.016 : (currentTime - lastTime) / 1000
        lastTime = currentTime
        
        // Check if we need to trigger an explosion
        checkExploding()
        
        // Camera position is fixed (no rotation)
        camera.position.z = 30
        camera.lookAt(0, 0, 0)
        
        // Only run animations if not completed
        if (!explosionCompletedRef.current) {
            animateStar()
            animateExplosion(deltaTime)
        } else {
            // Ensure there's no flash after completion
            particleMaterial.opacity = 0;
            particles.visible = false;
            pointLight.intensity = 0;
        }
        
        // Render the scene
        renderer.render(scene, camera)
        
        return animationId
    }
    
    // Handle resize
    const handleResize = () => {
        if (!containerRef.current) return
        
        const width = containerRef.current.clientWidth
        const height = containerRef.current.clientHeight
        
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
    }
    
    window.addEventListener('resize', handleResize)
    
    // Start animation loop
    const animationId = animate(0)
    
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
  }, [isExploding, onComplete]) // Add isExploding and onComplete as dependencies
  
  return (
    <div style={{
      position: 'relative',
      height,
      width: '100%',
      ...style
    }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
} 