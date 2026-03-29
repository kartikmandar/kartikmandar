'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import type { CosmicJourneyBlock as CosmicJourneyBlockProps } from '@/payload-types'
import type * as THREE from 'three'

// Type definitions for various data structures
type Particle = {
  startX: number
  startY: number
  size: number
  alpha: number
  distFactor: number
  color: string
}

type Star = {
  x: number
  y: number
  size: number
}

type NetworkNode = {
  x: number
  y: number
  type: 'academic' | 'code'
  vx?: number
  vy?: number
}

type VisibilityPoint = {
  x: number
  y: number
}

type Antenna = {
  x: number
  y?: number
  distance?: number
}

type Shard = {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  vRotation?: number
  size: number
  fallSpeed?: number
  type?: 'feather' | 'cork'
  color?: string
  lineWidth?: number
}

type PathStar = {
  x: number
  y: number
  size: number
  alpha: number
  twinkle: number
}

type LatexParticle = {
  x: number
  y: number
  vx: number
  vy: number
  text: string
  size?: number
  alpha: number
  absorbed?: boolean
}

type DrawFunctionData = {
  particles?: Particle[]
  stars?: Star[]
  networkNodes?: NetworkNode[]
  visibilityData?: VisibilityPoint[]
  antennas?: Antenna[]
  shards?: Shard[]
  pathStars?: PathStar[]
  latexParticles?: LatexParticle[]
  noisySignal?: VisibilityPoint[]
  nodes?: NetworkNode[]
  currentLatexSymbol?: string
}

type CanvasData = {
  canvas: HTMLCanvasElement
  ctx?: CanvasRenderingContext2D
  section: HTMLElement
  drawFn?: (params: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number; data?: DrawFunctionData }) => void
  initFn?: (params: { canvas: HTMLCanvasElement; section: HTMLElement }) => { update: (progress: number) => void }
  animation?: { update: (progress: number) => void }
  data?: DrawFunctionData
  isInitialized?: boolean
  lastProgress?: number
}

export const CosmicJourney: React.FC<CosmicJourneyBlockProps> = ({
  title = 'A Cosmic Journey',
  subtitle = 'The story of a path written in the stars.',
}) => {
  const [typingStarted, setTypingStarted] = useState(false)
  const [, setIsCosmicJourneyVisible] = useState(false)
  const searchTextRef = useRef<HTMLSpanElement>(null)
  const canvasDataRef = useRef<{ [key: string]: CanvasData }>({})
  const animationFrameRef = useRef<number>(0)
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null)
  const visibleCanvasesRef = useRef<Set<string>>(new Set())
  const cosmicJourneyRef = useRef<HTMLDivElement>(null)

  // Helper functions
  const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
  const distance = (x1: number, y1: number, x2: number, y2: number): number => 
    Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))

  const calculateScrollProgress = useCallback((section: HTMLElement): number => {
    const rect = section.getBoundingClientRect()
    const viewHeight = window.innerHeight
    const progress = (viewHeight - rect.top) / (viewHeight + rect.height)
    return Math.max(0, Math.min(1, progress))
  }, [])

  // Responsive scaling utilities
  const getResponsiveScale = useCallback((baseSize: number, w: number, h: number) => {
    const minDimension = Math.min(w, h)
    const isMobile = w < 768
    const isTablet = w < 1024 && w >= 768
    
    if (isMobile) {
      return baseSize * (minDimension / 400) * 0.8
    } else if (isTablet) {
      return baseSize * (minDimension / 600) * 0.9
    } else {
      return baseSize * (minDimension / 800)
    }
  }, [])

  const getResponsiveFontSize = useCallback((baseSize: number, w: number) => {
    if (w < 480) return `${baseSize * 0.7}px`
    if (w < 768) return `${baseSize * 0.8}px`
    if (w < 1024) return `${baseSize * 0.9}px`
    return `${baseSize}px`
  }, [])

  // Memoized data generation to avoid recreating on every render
  const memoizedData = useCallback(() => ({
    particles: generateParticles(50),
    stars150: generateStarfield(150),
    stars100: generateStarfield(100),
    networkNodes: generateNetworkNodes(8),
    visibilityData100: generateVisibilityData(100),
    antennas: generateAntennaPositions(5),
    pathStars100: generatePathStars(100)
  }), [])

  // Throttled scroll handler
  const throttledScrollUpdate = useCallback(() => {
    let ticking = false
    return () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Update only visible canvases
          visibleCanvasesRef.current.forEach(key => {
            const data = canvasDataRef.current[key]
            if (data) {
              const progress = calculateScrollProgress(data.section)
              const progressDiff = Math.abs(progress - (data.lastProgress || 0))
              
              if (progressDiff > 0.01 || data.animation) {
                data.lastProgress = progress
                
                // Initialize lensing canvas animation if needed
                if (key === 'lensing-canvas' && data.initFn && !data.animation) {
                  data.animation = data.initFn({ canvas: data.canvas, section: data.section })
                }
                
                if (data.animation) {
                  data.animation.update(progress)
                } else if (data.drawFn && data.ctx) {
                  data.drawFn({
                    ctx: data.ctx,
                    w: data.canvas.clientWidth,
                    h: data.canvas.clientHeight,
                    progress: progress,
                    data: data.data
                  })
                }
              }
            }
          })
          ticking = false
        })
        ticking = true
      }
    }
  }, [calculateScrollProgress])

  // Load Three.js dynamically
  useEffect(() => {
    const loadThreeJS = async () => {
      if (typeof window !== 'undefined' && !(window as Window & { THREE?: unknown }).THREE) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
        script.async = true
        document.head.appendChild(script)
      }
    }
    
    loadThreeJS()
  }, [])

  // Typing animation for search section
  useEffect(() => {
    if (!typingStarted || !searchTextRef.current) return

    const phrases = ["DU > Hansraj College...", "IISERs...", "IISER Bhopal"]
    let phraseIndex = 0
    let charIndex = 0
    let isDeleting = false

    const type = () => {
      const currentPhrase = phrases[phraseIndex] || ''
      if (isDeleting) {
        charIndex--
      } else {
        charIndex++
      }
      
      if (searchTextRef.current) {
        searchTextRef.current.textContent = (currentPhrase || '').substring(0, charIndex)
      }
      
      let typeSpeed = isDeleting ? 50 : 150
      
      if (!isDeleting && charIndex === (currentPhrase || '').length) {
        if (phraseIndex === phrases.length - 1) {
          if (searchTextRef.current) {
            searchTextRef.current.style.borderColor = '#4ade80'
          }
          return
        }
        typeSpeed = 2000
        isDeleting = true
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false
        phraseIndex++
        typeSpeed = 500
      }
      
      setTimeout(type, typeSpeed)
    }

    const timer = setTimeout(type, 1000)
    return () => clearTimeout(timer)
  }, [typingStarted])

  // Intersection observer for cosmic journey visibility and typing animation
  useEffect(() => {
    // Observer for cosmic journey visibility
    const cosmicJourneyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        setIsCosmicJourneyVisible(entry.isIntersecting)
      })
    }, { threshold: 0.1 })

    if (cosmicJourneyRef.current) {
      cosmicJourneyObserver.observe(cosmicJourneyRef.current)
    }

    // Observer for search section typing
    const searchSection = document.getElementById('search-section-wrapper')
    if (!searchSection) return

    const searchObserver = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !typingStarted) {
        setTypingStarted(true)
      }
    }, { threshold: 0.5 })

    searchObserver.observe(searchSection)

    return () => {
      cosmicJourneyObserver.disconnect()
      searchObserver.disconnect()
    }
  }, [typingStarted])

  // Original typing animation observer (keeping for compatibility)
  useEffect(() => {
    const searchSection = document.getElementById('search-section-wrapper')
    if (!searchSection) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !typingStarted) {
          setTypingStarted(true)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(searchSection)
    return () => observer.disconnect()
  }, [typingStarted])

  // Data generation functions
  const generateParticles = (count: number) => {
    const particles = []
    const w = typeof window !== 'undefined' ? window.innerWidth : 800
    const h = typeof window !== 'undefined' ? window.innerHeight : 600
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 2 * Math.PI
      particles.push({
        startX: Math.cos(angle) * 1000 + w / 2,
        startY: Math.sin(angle) * 1000 + h / 2,
        size: Math.random() * 3 + 2,
        alpha: Math.random() * 0.4 + 0.6,
        distFactor: Math.random(),
        color: Math.random() > 0.3 ? '220, 220, 220' : '180, 200, 255'
      })
    }
    return particles
  }

  const generateStarfield = (count: number) => {
    const stars = []
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.5 + 0.5,
      })
    }
    return stars
  }

  const generateVisibilityData = (count: number) => {
    const data = []
    for (let i = 0; i < count; i++) {
      const x = i / (count - 1)
      const y = 0.5 + Math.sin(x * Math.PI * 4) * 0.2 + (Math.random() - 0.5) * 0.1
      data.push({ x, y: Math.max(0, Math.min(1, y)) })
    }
    return data
  }

  const generateNetworkNodes = (count: number): NetworkNode[] => {
    const nodes: NetworkNode[] = []
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI + Math.PI / 4
      const radius = (Math.random() * 0.15 + 0.25)
      nodes.push({
        x: 0.5 + Math.cos(angle) * radius,
        y: 0.5 + Math.sin(angle) * radius * 0.8,
        type: i % 2 === 0 ? 'academic' : 'code'
      })
    }
    return nodes
  }

  const generatePathStars = (count: number): PathStar[] => {
    const stars: PathStar[] = []
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.5 + 0.5,
        alpha: 1,
        twinkle: Math.random()
      })
    }
    return stars
  }

  const generateAntennaPositions = (count: number) => {
    const positions = []
    const margin = 0.15
    for (let i = 0; i < count; i++) {
      positions.push({
        x: margin + Math.random() * (1 - margin * 2),
        y: 0.2 + Math.random() * 0.35
      })
    }
    return positions
  }

  const generateShards = (count: number, x: number, y: number): Shard[] => {
    const shards: Shard[] = []
    for (let i = 0; i < count; i++) {
      const type = Math.random() > 0.3 ? 'feather' : 'cork'
      shards.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 300,
        vy: (Math.random() - 0.5) * 300,
        rotation: (Math.random() - 0.5) * 8,
        fallSpeed: Math.random() * 200 + 100,
        type: type,
        color: type === 'feather' ? '255, 255, 255' : '210, 180, 140',
        lineWidth: type === 'feather' ? 0 : 2,
        size: Math.random() * 8 + 5
      })
    }
    return shards
  }

  // Helper drawing functions
  const drawAStar = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.fill()
  }

  const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill?: string, stroke?: string) => {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    if (fill) {
      ctx.fillStyle = fill
      ctx.fill()
    }
    if (stroke) {
      ctx.save()
      ctx.shadowBlur = r
      ctx.shadowColor = stroke
      ctx.strokeStyle = stroke
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()
    }
  }

  const drawShuttlecock = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color: string) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(scale, scale)
    ctx.fillStyle = color
    ctx.strokeStyle = '#aaa'
    ctx.lineWidth = 2
    
    // Skirt
    ctx.beginPath()
    ctx.moveTo(-20, -40)
    ctx.lineTo(20, -40)
    ctx.lineTo(10, 0)
    ctx.lineTo(-10, 0)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Cork
    ctx.fillStyle = '#d2b48c'
    ctx.beginPath()
    ctx.arc(0, 0, 10, 0, Math.PI)
    ctx.fill()
    ctx.stroke()

    ctx.restore()
  }

  const drawRealisticRadioDish = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, tilt: number) => {
    ctx.save()
    ctx.translate(x, y)

    // Tripod Stand
    ctx.strokeStyle = '#999'
    ctx.lineWidth = size * 0.05
    ctx.beginPath()
    ctx.moveTo(0, size * 0.7)
    ctx.lineTo(-size * 0.4, 0)
    ctx.moveTo(0, size * 0.7)
    ctx.lineTo(size * 0.4, 0)
    ctx.moveTo(0, size * 0.7)
    ctx.lineTo(0, size * 0.2)
    ctx.stroke()

    // Mount
    ctx.fillStyle = '#888'
    ctx.beginPath()
    ctx.arc(0, size * 0.2, size * 0.1, 0, 2 * Math.PI)
    ctx.fill()

    // Dish
    ctx.translate(0, -size * 0.05)
    ctx.rotate(tilt)
    ctx.fillStyle = '#27272a'
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = size * 0.08
    ctx.beginPath()
    ctx.ellipse(0, 0, size, size * 0.5, 0, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    
    // Sub-reflector
    ctx.fillStyle = '#ccc'
    ctx.beginPath()
    ctx.arc(0, -size*0.3, size * 0.05, 0, 2*Math.PI)
    ctx.fill()

    ctx.restore()
  }

  // Canvas drawing functions - All 18 sections
  const drawPageToCosmos = ({ ctx, w, h, progress }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number }) => {
    ctx.clearRect(0, 0, w, h)
    
    const pageFade = Math.max(0, 1 - progress / 0.3)
    if (pageFade > 0) {
      ctx.fillStyle = `rgba(240, 240, 240, ${pageFade})`
      ctx.fillRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8)
      ctx.strokeStyle = `rgba(200, 200, 200, ${pageFade})`
      ctx.strokeRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8)
    }

    const liftOff = Math.min(1, progress / 0.6)
    const become3D = Math.max(0, (progress - 0.4) / 0.6)
    
    const pagePlanets = [
      { id: 'saturn', x: 0.25, y: 0.4, size: 25, color: '#e3dccb' },
      { id: 'jupiter', x: 0.7, y: 0.6, size: 40, color: '#d8bba2' },
      { id: 'mars', x: 0.8, y: 0.25, size: 18, color: '#d66a3e' }
    ]

    pagePlanets.forEach((planet) => {
      const baseX = w * 0.1 + (w * 0.8 * planet.x)
      const baseY = h * 0.1 + (h * 0.8 * planet.y)
      const liftY = -liftOff * baseY * 0.5
      const currentY = baseY + liftY

      if (liftOff < 1) {
        ctx.beginPath()
        ctx.ellipse(baseX, baseY + 10, planet.size * (1 - liftOff), planet.size * 0.3 * (1 - liftOff), 0, 0, 2 * Math.PI)
        ctx.fillStyle = `rgba(0,0,0, ${0.2 * (1 - liftOff)})`
        ctx.fill()
      }
      
      if (become3D > 0) {
        const grad = ctx.createRadialGradient(baseX - planet.size / 3, currentY - planet.size / 3, planet.size/10, baseX, currentY, planet.size)
        grad.addColorStop(0, '#fff')
        grad.addColorStop(0.5, planet.color)
        grad.addColorStop(1, '#000')
        ctx.fillStyle = grad
        ctx.globalAlpha = become3D
        ctx.beginPath()
        ctx.arc(baseX, currentY, planet.size, 0, 2*Math.PI)
        ctx.fill()
        ctx.globalAlpha = 1
      }
      
      if (become3D < 1){
        ctx.globalAlpha = 1 - become3D
        ctx.strokeStyle = '#333'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(baseX, currentY, planet.size, 0, 2*Math.PI)
        ctx.stroke()

        if (planet.id === 'saturn') {
          ctx.beginPath()
          ctx.ellipse(baseX, currentY, planet.size * 1.5, planet.size * 0.5, -0.3, 0, 2 * Math.PI)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }
      
      if (planet.id === 'saturn' && become3D > 0) {
        ctx.globalAlpha = become3D
        ctx.fillStyle = `rgba(227, 220, 203, 0.5)`
        ctx.beginPath()
        ctx.ellipse(baseX, currentY, planet.size * 1.5, planet.size * 0.5, -0.3, 0, 2 * Math.PI)
        ctx.fill()
        ctx.globalAlpha = 1
      }
    })
  }

  const drawBuildAComet = useCallback(({ ctx, w, h, progress, data }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number; data?: DrawFunctionData }) => {
    ctx.clearRect(0, 0, w, h)
    const nucleus = { x: w * 0.5, y: h * 0.5 }

    const accProgress = Math.min(1, progress / 0.4)
    const nucleusSize = 10 + 20 * accProgress
    
    data?.particles?.forEach((p) => {
      const travelDist = accProgress * (1 - p.distFactor)
      const currentX = p.startX + (nucleus.x - p.startX) * travelDist
      const currentY = p.startY + (nucleus.y - p.startY) * travelDist
      const alpha = (1 - (accProgress * 0.8)) * p.alpha
      if (alpha > 0) {
        drawAStar(ctx, currentX, currentY, p.size, `rgba(${p.color}, ${alpha})`)
      }
    })

    const sublimation = Math.max(0, (progress - 0.4) / 0.6)
    if (sublimation > 0) {
      const sunX = w + 200
      
      const comaSize = nucleusSize + 80 * sublimation
      const comaGrad = ctx.createRadialGradient(nucleus.x, nucleus.y, nucleusSize, nucleus.x, nucleus.y, comaSize)
      comaGrad.addColorStop(0, `rgba(180, 220, 255, ${0.5 * sublimation})`)
      comaGrad.addColorStop(1, `rgba(180, 220, 255, 0)`)
      ctx.fillStyle = comaGrad
      ctx.fillRect(0, 0, w, h)

      const tailLength = w * 0.8 * sublimation
      ctx.save()
      ctx.translate(nucleus.x, nucleus.y)
      ctx.rotate(Math.atan2(nucleus.y - h/2, nucleus.x - sunX))
      
      const dustTailGrad = ctx.createLinearGradient(0, 0, tailLength, 0)
      dustTailGrad.addColorStop(0, `rgba(240, 240, 220, ${0.3 * sublimation})`)
      dustTailGrad.addColorStop(1, 'rgba(240, 240, 220, 0)')
      ctx.fillStyle = dustTailGrad
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.quadraticCurveTo(tailLength * 0.5, 30, tailLength, 50)
      ctx.quadraticCurveTo(tailLength * 0.5, -30, 0, 0)
      ctx.fill()

      const ionTailGrad = ctx.createLinearGradient(0, 0, tailLength * 1.2, 0)
      ionTailGrad.addColorStop(0, `rgba(170, 200, 255, ${0.4 * sublimation})`)
      ionTailGrad.addColorStop(1, 'rgba(170, 200, 255, 0)')
      ctx.fillStyle = ionTailGrad
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(tailLength * 1.2, 10)
      ctx.lineTo(tailLength * 1.2, -10)
      ctx.closePath()
      ctx.fill()

      ctx.restore()
    }

    const rockGrad = ctx.createRadialGradient(nucleus.x - 5, nucleus.y - 5, 2, nucleus.x, nucleus.y, nucleusSize)
    rockGrad.addColorStop(0, '#aaa')
    rockGrad.addColorStop(1, '#555')
    ctx.fillStyle = rockGrad
    drawAStar(ctx, nucleus.x, nucleus.y, nucleusSize, '#999')
  }, [])

  const drawFocusingLens = ({ ctx, w, h, progress }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number; data?: DrawFunctionData }) => {
    ctx.clearRect(0, 0, w, h)
    const centerX = w / 2
    const centerY = h / 2

    // const zoom = 1 + progress * 15  // Unused variable
    const astronomerSharpness = Math.max(0, (progress - 0.4) / 0.6)

    // Removed starfield blobs per user request

    // Draw astronomer figure that becomes clearer as we zoom in
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.scale(1 + astronomerSharpness * 3, 1 + astronomerSharpness * 3)
    
    // Stick figure astronomer
    const astronomerAlpha = astronomerSharpness
    if (astronomerAlpha > 0) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${astronomerAlpha})`
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      
      // Head (circle outline)
      ctx.beginPath()
      ctx.arc(0, -40, 12, 0, 2 * Math.PI)
      ctx.stroke()
      
      // Body (vertical line)
      ctx.beginPath()
      ctx.moveTo(0, -28)
      ctx.lineTo(0, 15)
      ctx.stroke()
      
      // Arms - one pointing up toward stars
      ctx.beginPath()
      ctx.moveTo(0, -15) // Shoulder point
      ctx.lineTo(-20, -35) // Left arm pointing to stars
      ctx.moveTo(0, -15) // Shoulder point
      ctx.lineTo(18, -8) // Right arm
      ctx.stroke()
      
      // Legs
      ctx.beginPath()
      ctx.moveTo(0, 15) // Hip point
      ctx.lineTo(-12, 40) // Left leg
      ctx.moveTo(0, 15) // Hip point  
      ctx.lineTo(12, 40) // Right leg
      ctx.stroke()
      
      // Telescope (simple stick version)
      if (astronomerSharpness > 0.5) {
        ctx.strokeStyle = `rgba(200, 200, 200, ${astronomerAlpha})`
        ctx.lineWidth = 2
        
        // Telescope tube
        ctx.beginPath()
        ctx.moveTo(25, -25)
        ctx.lineTo(40, -40)
        ctx.stroke()
        
        // Telescope tripod legs
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(25, -8)
        ctx.lineTo(20, 10) // Left leg
        ctx.moveTo(25, -8)
        ctx.lineTo(30, 10) // Right leg
        ctx.moveTo(25, -8)
        ctx.lineTo(25, 10) // Center leg
        ctx.stroke()
      }
      
      // Glowing effect around astronomer
      const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 60)
      glowGrad.addColorStop(0, `rgba(135, 206, 235, ${astronomerAlpha * 0.3})`)
      glowGrad.addColorStop(1, 'rgba(135, 206, 235, 0)')
      ctx.fillStyle = glowGrad
      ctx.fillRect(-60, -60, 120, 120)
    }
    
    ctx.restore()
    
    // Vignette effect (lens focusing)
    const lensRadius = w * (1 - Math.min(progress, 0.8))
    const vignetteGrad = ctx.createRadialGradient(centerX, centerY, lensRadius, centerX, centerY, lensRadius + 200)
    vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)')
    vignetteGrad.addColorStop(1, 'rgba(0,0,0,1)')
    ctx.fillStyle = vignetteGrad
    ctx.fillRect(0,0,w,h)
  }

  const drawConstellations = useCallback(({ ctx, w, h, progress }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number }) => {
    ctx.clearRect(0, 0, w, h)
    
    const researchStars = [
      { x: 0.40, y: 0.25, radius: 5, name: 'Castor' },        // Alpha Geminorum (brightest in mythology)
      { x: 0.25, y: 0.30, radius: 6, name: 'Pollux' },        // Beta Geminorum (actually brightest)
      { x: 0.55, y: 0.45, radius: 3, name: 'Wasat' },         // Delta Geminorum (middle)
      { x: 0.45, y: 0.65, radius: 3.5, name: 'Mebsuta' },     // Epsilon Geminorum (outstretched paw)
      { x: 0.30, y: 0.80, radius: 4, name: 'Alhena' },        // Gamma Geminorum (foot of Pollux)
      { x: 0.85, y: 0.60, radius: 2.5, name: 'Mekbuda' },     // Zeta Geminorum (folded paw)
      { x: 0.89, y: 0.68, radius: 2, name: 'Alzirr' },        // Xi Geminorum
      { x: 0.93, y: 0.75, radius: 2, name: 'Propus' },        // Eta Geminorum
      { x: 0.60, y: 0.35, radius: 2, name: 'Tejat' },         // Mu Geminorum (back foot)
      { x: 0.20, y: 0.50, radius: 2.5, name: 'Kappa Gem' }    // Kappa Geminorum
    ]
    
    const engineeringStars = [[0.75, 0.3], [0.7, 0.5], [0.6, 0.55], [0.65, 0.7], [0.75, 0.8]]
    const researchLines = [[1, 3], [3, 4], [0, 2], [2, 4], [0, 8], [1, 9], [2, 5], [5, 6], [6, 7]]
    
    const engAlpha = Math.max(0, 1 - progress * 2.5)
    engineeringStars.forEach(star => drawAStar(ctx, star[0]! * w, star[1]! * h, 2, `rgba(255, 255, 255, ${engAlpha})`))
    
    researchStars.forEach(star => {
      drawAStar(ctx, star.x * w, star.y * h, star.radius, `rgba(255, 255, 255, 1)`)
      if(star.name) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.font = getResponsiveFontSize(14, w)
        ctx.fillText(star.name, star.x * w + 15, star.y * h + 5)
      }
    })
    
    // Draw connecting lines - fast animation that completes early
    const totalLength = researchLines.length
    // Complete all lines by 40% progress, so you can see the full constellation
    const lineAnimProgress = Math.min(1, progress / 0.4)
    const linesToDraw = lineAnimProgress * totalLength
    ctx.strokeStyle = "rgba(165, 180, 252, 0.8)"
    ctx.lineWidth = 2
    ctx.shadowBlur = 10
    ctx.shadowColor = "rgba(165, 180, 252, 0.8)"
    
    researchLines.forEach((line, i) => {
      if (linesToDraw > i) {
        const p1 = researchStars[line[0] || 0]
        const p2 = researchStars[line[1] || 0]
        const lineProgress = Math.min(1, linesToDraw - i)
        ctx.beginPath()
        ctx.moveTo((p1?.x || 0) * w, (p1?.y || 0) * h)
        ctx.lineTo((p1?.x || 0) * w + ((p2?.x || 0) * w - (p1?.x || 0) * w) * lineProgress, (p1?.y || 0) * h + ((p2?.y || 0) * h - (p1?.y || 0) * h) * lineProgress)
        ctx.stroke()
      }
    })
    ctx.shadowBlur = 0
  }, [getResponsiveFontSize])

  const drawVirtualNetwork = useCallback(({ ctx, w, h, progress, data }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number; data?: DrawFunctionData }) => {
    ctx.clearRect(0, 0, w, h)
    const centerX = w / 2
    const centerY = h / 2
    const centralNodeRadius = getResponsiveScale(20, w, h)

    ctx.fillStyle = '#a5b4fc'
    ctx.beginPath()
    ctx.arc(centerX, centerY, centralNodeRadius, 0, 2 * Math.PI)
    ctx.fill()

    const totalNodes = data?.networkNodes?.length || 0
    const nodesToShow = Math.floor(progress * totalNodes)
    const lastLineProgress = (progress * totalNodes) % 1

    for (let i = 0; i < nodesToShow; i++) {
      const node = data?.networkNodes?.[i]
      if (!node) continue
      const nodeX = node.x * w
      const nodeY = node.y * h

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      if (i === nodesToShow - 1 && lastLineProgress < 1) {
        ctx.lineTo(centerX + (nodeX - centerX) * lastLineProgress, centerY + (nodeY - centerY) * lastLineProgress)
      } else {
        ctx.lineTo(nodeX, nodeY)
      }
      ctx.strokeStyle = 'rgba(165, 180, 252, 0.3)'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.font = `bold ${getResponsiveFontSize(32, w)} Poppins`
      ctx.fillStyle = node.type === 'academic' ? '#fde047' : '#4ade80'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const icon = node.type === 'academic' ? '📈' : '</>'
      ctx.fillText(icon, nodeX, nodeY)

      const particleProgress = (Date.now() / 20 + i * 100) % 100 / 100
      const pX = centerX + (nodeX - centerX) * particleProgress
      const pY = centerY + (nodeY - centerY) * particleProgress
      ctx.fillStyle = node.type === 'academic' ? '#fde047' : '#4ade80'
      ctx.beginPath()
      ctx.arc(pX, pY, 4, 0, 2 * Math.PI)
      ctx.fill()
    }
  }, [getResponsiveFontSize, getResponsiveScale])

  const drawUnwaveringCompass = useCallback(({ ctx, w, h, progress }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number }) => {
    ctx.clearRect(0, 0, w, h)
    const time = Date.now()
    const centerX = w * 0.4
    const centerY = h / 2
    const compassRadius = Math.min(w, h) * 0.2
    
    // Draw Compass Rose
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(centerX, centerY, compassRadius, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    
    ctx.fillStyle = 'white'
    ctx.font = getResponsiveFontSize(14, w)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Economic Sciences', centerX, centerY - compassRadius - 20)

    // Draw Physics Star
    const physicsStar = { x: w * 0.85, y: h * 0.5 }
    const starSize = getResponsiveScale(30, w, h) * progress
    const starAlpha = progress
    if (starAlpha > 0) {
      drawAStar(ctx, physicsStar.x, physicsStar.y, starSize, `rgba(165, 180, 252, ${starAlpha})`)
      drawAStar(ctx, physicsStar.x, physicsStar.y, starSize * 0.6, `rgba(255, 255, 255, ${starAlpha})`)
      ctx.fillStyle = `rgba(255,255,255, ${starAlpha})`
      ctx.font = getResponsiveFontSize(16, w)
      ctx.fillText('Physics', physicsStar.x, physicsStar.y + starSize + 20)
    }

    // Draw Compass Needle
    const startAngle = -Math.PI / 2 // North
    const targetAngle = Math.atan2(physicsStar.y - centerY, physicsStar.x - centerX)
    
    const swingProgress = Math.min(1, progress * 2)
    const currentAngle = lerp(startAngle, targetAngle, swingProgress)
    const tremble = Math.sin(time / 50) * 0.02 * progress
    
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(currentAngle + tremble)
    
    ctx.strokeStyle = '#f87171'
    ctx.fillStyle = '#f87171'
    ctx.lineWidth = getResponsiveScale(4, w, h)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(compassRadius * 0.8, 0)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(compassRadius * 0.9, 0)
    ctx.lineTo(compassRadius * 0.7, 8)
    ctx.lineTo(compassRadius * 0.7, -8)
    ctx.closePath()
    ctx.fill()
    
    ctx.restore()
  }, [getResponsiveFontSize, getResponsiveScale])

  const drawSlingshot = useCallback(({ ctx, w, h, progress }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number }) => {
    ctx.clearRect(0, 0, w, h)
    const sun1 = { x: w * 0.25, y: h * 0.5, radius: Math.min(w, h) * 0.02 }
    drawCircle(ctx, sun1.x, sun1.y, sun1.radius, '#fde047', '#facc15')
    const sun2 = { x: w * 0.75, y: h * 0.5, radius: Math.min(w, h) * 0.04 }
    const sun2Alpha = Math.min(1, progress * 1.5)
    drawCircle(ctx, sun2.x, sun2.y, sun2.radius, `rgba(165, 180, 252, ${sun2Alpha})`, `rgba(79, 70, 229, ${sun2Alpha})`)
    
    let planetX: number, planetY: number
    const orbit1Radius = Math.min(w, h) * 0.12
    const orbit2Radius = Math.min(w, h) * 0.22
    
    // Draw dotted orbit paths
    ctx.save()
    ctx.setLineDash([3, 5])
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.3)'
    ctx.lineWidth = 1
    
    // Orbit 1 around sun1 (fade out as planet leaves)
    const orbit1Alpha = progress < 0.4 ? 0.5 : Math.max(0, 0.5 - (progress - 0.4) * 2)
    if (orbit1Alpha > 0) {
      ctx.globalAlpha = orbit1Alpha
      ctx.beginPath()
      ctx.arc(sun1.x, sun1.y, orbit1Radius, 0, 2 * Math.PI)
      ctx.stroke()
    }
    
    // Transition path (visible during slingshot)
    if (progress >= 0.3 && progress <= 0.8) {
      const transitionAlpha = progress < 0.4 ? (progress - 0.3) / 0.1 : progress > 0.7 ? (0.8 - progress) / 0.1 : 1
      ctx.globalAlpha = transitionAlpha
      ctx.strokeStyle = 'rgba(165, 180, 252, 0.3)'
      ctx.beginPath()
      const startX = sun1.x - orbit1Radius
      const startY = sun1.y
      const controlX = w * 0.5
      const controlY = h * 0.2
      const endX = sun2.x
      const endY = sun2.y - orbit2Radius
      ctx.moveTo(startX, startY)
      ctx.quadraticCurveTo(controlX, controlY, endX, endY)
      ctx.stroke()
    }
    
    // Orbit 2 around sun2 (fade in as planet arrives)
    const orbit2Alpha = progress < 0.6 ? 0 : Math.min(0.5, (progress - 0.6) * 2.5)
    if (orbit2Alpha > 0) {
      ctx.globalAlpha = orbit2Alpha
      ctx.strokeStyle = 'rgba(165, 180, 252, 0.5)'
      ctx.beginPath()
      ctx.arc(sun2.x, sun2.y, orbit2Radius, 0, 2 * Math.PI)
      ctx.stroke()
    }
    
    ctx.restore()
    
    // Draw planet position
    if (progress < 0.4) {
      const angle = 2 * Math.PI * (progress / 0.4) + Math.PI
      planetX = sun1.x + Math.cos(angle) * orbit1Radius
      planetY = sun1.y + Math.sin(angle) * orbit1Radius
    } else if (progress < 0.7) {
      const p = (progress - 0.4) / 0.3
      const startX = sun1.x - orbit1Radius
      const startY = sun1.y
      const controlX = w * 0.5
      const controlY = h * 0.2
      const endX = sun2.x
      const endY = sun2.y - orbit2Radius
      planetX = (1 - p) ** 2 * startX + 2 * (1 - p) * p * controlX + p ** 2 * endX
      planetY = (1 - p) ** 2 * startY + 2 * (1 - p) * p * controlY + p ** 2 * endY
    } else {
      const p = (progress - 0.7) / 0.3
      const angle = 2 * Math.PI * p - Math.PI / 2
      planetX = sun2.x + Math.cos(angle) * orbit2Radius
      planetY = sun2.y + Math.sin(angle) * orbit2Radius
    }
    drawCircle(ctx, planetX, planetY, Math.min(w, h) * 0.008, '#fff', '#a5b4fc')
  }, [])

  const drawMajorChoiceLens = useCallback(({ ctx, w, h, progress }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number }) => {
    ctx.clearRect(0, 0, w, h)
    const orbs = [
      { name: "Maths", pos: [0.2, 0.5] },
      { name: "Physics", pos: [0.5, 0.5] },
      { name: "Data Sci", pos: [0.8, 0.5] }
    ]
    
    orbs.forEach((orb, i) => {
      const focusPoint = 0.2 + i * 0.3
      const dist = Math.abs(progress - focusPoint)
      const blur = Math.min(20, dist * 60)
      const alpha = Math.max(0.1, 1 - dist * 2)
      
      ctx.save()
      ctx.filter = `blur(${blur}px)`
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
      ctx.font = `${Math.min(w, h) * 0.02}px Poppins`
      ctx.textAlign = "center"
      ctx.fillText(orb.name, (orb.pos?.[0] || 0) * w, (orb.pos?.[1] || 0) * h - 50)
      ctx.beginPath()
      ctx.arc((orb.pos?.[0] || 0) * w, (orb.pos?.[1] || 0) * h, Math.min(w, h) * 0.03, 0, 2 * Math.PI)
      ctx.fill()
      ctx.restore()
    })
    
    const lensRadius = Math.min(w, h) * 0.2 * Math.min(1, progress * 4)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = getResponsiveScale(3, w, h)
    ctx.beginPath()
    ctx.arc(w / 2, h / 2, lensRadius, 0, 2 * Math.PI)
    ctx.stroke()
  }, [getResponsiveScale])

  const drawInternshipPathways = ({ ctx, w, h, progress }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number }) => {
    ctx.clearRect(0, 0, w, h)
    
    // Draw two diverging paths from center
    const centerX = w / 2
    const centerY = h * 0.8
    const pathProgress = Math.min(1, progress * 3) // Speed up 3x
    
    // Tech path (left side) - mobile app/EECS
    const techEndX = w * 0.2
    const techEndY = h * 0.3
    const techPath = Math.min(1, pathProgress)
    
    // Bio path (right side) - iGEM/synthetic biology
    const bioEndX = w * 0.8
    const bioEndY = h * 0.3
    const bioPath = Math.min(1, Math.max(0, pathProgress - 0.1)) // Reduce delay from 0.2 to 0.1
    
    // Draw tech pathway
    if (techPath > 0) {
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.8 * techPath})`
      ctx.lineWidth = 3
      ctx.shadowColor = 'rgba(59, 130, 246, 0.5)'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      const techCurrentX = centerX + (techEndX - centerX) * techPath
      const techCurrentY = centerY + (techEndY - centerY) * techPath
      ctx.lineTo(techCurrentX, techCurrentY)
      ctx.stroke()
      ctx.shadowBlur = 0
      
      // Draw mobile phone icon at end of tech path
      if (techPath > 0.5) {
        const phoneAlpha = (techPath - 0.5) / 0.5
        ctx.fillStyle = `rgba(59, 130, 246, ${phoneAlpha})`
        ctx.strokeStyle = `rgba(255, 255, 255, ${phoneAlpha})`
        ctx.lineWidth = 2
        // Phone outline
        ctx.fillRect(techEndX - 15, techEndY - 25, 30, 50)
        ctx.strokeRect(techEndX - 15, techEndY - 25, 30, 50)
        // Screen
        ctx.fillStyle = `rgba(0, 0, 0, ${phoneAlpha})`
        ctx.fillRect(techEndX - 12, techEndY - 20, 24, 35)
        // Signal bars for depression detection
        ctx.fillStyle = `rgba(34, 197, 94, ${phoneAlpha})`
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(techEndX - 8 + i * 4, techEndY - 15 + i * 2, 2, 8 - i * 2)
        }
      }
      
      // Tech lab label
      if (techPath > 0.3) {
        ctx.fillStyle = `rgba(255, 255, 255, ${(techPath - 0.3) / 0.7})`
        ctx.font = '14px Poppins'
        ctx.textAlign = 'center'
        ctx.fillText('Sysmatics Lab', techEndX, techEndY + 40)
        ctx.fillText('EECS Dept', techEndX, techEndY + 55)
      }
    }
    
    // Draw bio pathway
    if (bioPath > 0) {
      ctx.strokeStyle = `rgba(34, 197, 94, ${0.8 * bioPath})`
      ctx.lineWidth = 3
      ctx.shadowColor = 'rgba(34, 197, 94, 0.5)'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      const bioCurrentX = centerX + (bioEndX - centerX) * bioPath
      const bioCurrentY = centerY + (bioEndY - centerY) * bioPath
      ctx.lineTo(bioCurrentX, bioCurrentY)
      ctx.stroke()
      ctx.shadowBlur = 0
      
      // Draw DNA helix at end of bio path
      if (bioPath > 0.5) {
        const dnaAlpha = (bioPath - 0.5) / 0.5
        ctx.strokeStyle = `rgba(34, 197, 94, ${dnaAlpha})`
        ctx.lineWidth = 2
        ctx.beginPath()
        for (let i = 0; i < 40; i++) {
          const angle = (i / 40) * Math.PI * 4
          const x = bioEndX + Math.cos(angle) * 8
          const y = bioEndY - 20 + i
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        
        // Second strand
        ctx.beginPath()
        for (let i = 0; i < 40; i++) {
          const angle = (i / 40) * Math.PI * 4 + Math.PI
          const x = bioEndX + Math.cos(angle) * 8
          const y = bioEndY - 20 + i
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        
        // Cross connections
        for (let i = 0; i < 8; i++) {
          const y = bioEndY - 15 + i * 5
          const angle1 = (i / 8) * Math.PI * 4
          const angle2 = angle1 + Math.PI
          const x1 = bioEndX + Math.cos(angle1) * 8
          const x2 = bioEndX + Math.cos(angle2) * 8
          ctx.beginPath()
          ctx.moveTo(x1, y)
          ctx.lineTo(x2, y)
          ctx.stroke()
        }
      }
      
      // iGEM label
      if (bioPath > 0.3) {
        ctx.fillStyle = `rgba(255, 255, 255, ${(bioPath - 0.3) / 0.7})`
        ctx.font = '14px Poppins'
        ctx.textAlign = 'center'
        ctx.fillText('iGEM Team', bioEndX, bioEndY + 40)
        ctx.fillText('MIT (Paris)', bioEndX, bioEndY + 55)
      }
    }
    
    // Central branching point
    const branchAlpha = Math.min(1, progress * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${branchAlpha})`
    ctx.beginPath()
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI)
    ctx.fill()
    
    // Connecting arc between paths
    if (progress > 0.8) {
      const arcAlpha = (progress - 0.8) / 0.2
      ctx.strokeStyle = `rgba(138, 43, 226, ${0.6 * arcAlpha})`
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.arc(centerX, centerY - 100, 120, Math.PI / 6, Math.PI * 5 / 6)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }

  const drawShatteringShuttlecock = useCallback(({ ctx, w, h, progress, data }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number; data?: DrawFunctionData }) => {
    ctx.clearRect(0, 0, w, h)
    const centerX = w / 2
    const riseProgress = Math.min(1, progress / 0.4)
    const crackPhase = Math.max(0, (progress - 0.4) / 0.2)
    const shatterPhase = Math.max(0, (progress - 0.6) / 0.4)
    
    const startY = h * 0.9
    const impactY = h * 0.2
    const currentY = startY - (startY - impactY) * riseProgress

    if (shatterPhase > 0) {
      const shards = data?.shards || generateShards(25, centerX, impactY)
      shards.forEach((shard) => {
        const travelProgress = Math.pow(shatterPhase, 0.7)
        const currentX = shard.x + shard.vx * travelProgress
        const currentY = shard.y + shard.vy * travelProgress + (travelProgress * travelProgress * 200)
        const alpha = 1 - shatterPhase
        
        ctx.save()
        ctx.translate(currentX, currentY)
        ctx.rotate(shard.rotation * travelProgress)
        ctx.fillStyle = `rgba(${shard.color}, ${alpha})`
        ctx.strokeStyle = `rgba(150, 150, 150, ${alpha})`
        ctx.lineWidth = shard.lineWidth || 2
        
        // Draw shard shape
        if (shard.type === 'feather') {
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(shard.size * 0.5, -shard.size)
          ctx.lineTo(-shard.size * 0.5, -shard.size)
          ctx.closePath()
          ctx.fill()
        } else {
          ctx.fillRect(-shard.size/2, -shard.size/2, shard.size, shard.size)
          ctx.strokeRect(-shard.size/2, -shard.size/2, shard.size, shard.size)
        }
        
        ctx.restore()
      })
    } else {
      // Shards have been cleared
      drawShuttlecock(ctx, centerX, currentY, 1, '#fff')
      if (crackPhase > 0) {
        ctx.strokeStyle = `rgba(0, 0, 0, ${crackPhase * 0.8})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(centerX, currentY - 10 * crackPhase)
        ctx.lineTo(centerX + 8 * crackPhase, currentY - 20 * crackPhase)
        ctx.lineTo(centerX - 5 * crackPhase, currentY - 25 * crackPhase)
        ctx.moveTo(centerX, currentY - 10 * crackPhase)
        ctx.lineTo(centerX - 10 * crackPhase, currentY - 18 * crackPhase)
        ctx.lineTo(centerX + 2 * crackPhase, currentY - 30 * crackPhase)
        ctx.stroke()
      }
    }
  }, [])

  const drawSignalToSimulation = useCallback(({ ctx, w, h, progress, data }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number; data?: DrawFunctionData }) => {
    ctx.clearRect(0, 0, w, h)
    const time = Date.now() / 100

    const signalProgress = Math.min(1, progress / 0.4)
    const signalY = h * 0.1
    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - signalProgress * 0.8})`
    ctx.lineWidth = 1
    ctx.beginPath()
    for(let i = 0; i < w; i++) {
      const y = signalY + Math.sin(i * 0.1 + time) * 10 + (Math.random() - 0.5) * 30
      if (i === 0) ctx.moveTo(i, y); else ctx.lineTo(i, y)
    }
    ctx.stroke()

    const antennaProgress = Math.min(1, progress / 0.4)
    data?.antennas?.forEach((antenna) => {
      const x = antenna.x * w
      const y = (antenna.y || 0.3) * h
      ctx.globalAlpha = antennaProgress
      drawRealisticRadioDish(ctx, x, y, 20, -Math.PI / 8)
      ctx.globalAlpha = 1
    })

    const baselineProgress = Math.max(0, (progress - 0.2) / 0.5)
    if (baselineProgress > 0) {
      ctx.strokeStyle = `rgba(74, 222, 128, ${0.4 * baselineProgress})`
      ctx.lineWidth = 1.5
      ctx.shadowColor = `rgba(74, 222, 128, 1)`
      ctx.shadowBlur = 10
      const antennas = data?.antennas || []
      for (let i = 0; i < antennas.length; i++) {
        const antennaI = antennas[i]
        if (!antennaI) continue
        for (let j = i + 1; j < antennas.length; j++) {
          const antennaJ = antennas[j]
          if (!antennaJ) continue
          ctx.beginPath()
          ctx.moveTo(antennaI.x * w, (antennaI.y || 0.3) * h)
          ctx.lineTo(antennaJ.x * w, (antennaJ.y || 0.3) * h)
          ctx.stroke()
        }
      }
      ctx.shadowBlur = 0
    }

    const plotProgress = Math.max(0, (progress - 0.5) / 0.5)
    if (plotProgress > 0) {
      const plotY = h * 0.8
      const plotW = w * 0.6
      const plotH = h * 0.15
      const plotX = (w - plotW) / 2

      ctx.strokeStyle = `rgba(255,255,255, ${0.5 * plotProgress})`
      ctx.strokeRect(plotX, plotY, plotW, plotH)
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * plotProgress})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      const noisySignal = data?.noisySignal || []
      const pointsToDraw = Math.floor(plotProgress * noisySignal.length)
      for (let i = 0; i < pointsToDraw; i++) {
        const point = noisySignal[i]
        if (!point) continue
        const x = plotX + point.x * plotW
        const y = plotY + plotH/2 - (point.y - 0.5) * plotH * 0.8
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.stroke()

      ctx.strokeStyle = '#4ade80'
      ctx.lineWidth = 3
      ctx.beginPath()
      for(let i=0; i < plotW * plotProgress; i++) {
        const x = plotX + i
        const y = plotY + plotH/2 + Math.sin(i/plotW * Math.PI * 4) * plotH * 0.4
        if(i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y)
      }
      ctx.stroke()
      ctx.fillStyle = `rgba(74, 222, 128, ${plotProgress})`
      ctx.font = getResponsiveFontSize(16, w)
      ctx.textAlign = 'right'
      ctx.fillText("RRIViz", plotX + plotW - 10, plotY + 20)
    }
  }, [getResponsiveFontSize])

  const drawBuildingDashboard = useCallback(({ ctx, w, h, progress }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number }) => {
    ctx.clearRect(0, 0, w, h)
    ctx.font = getResponsiveFontSize(14, w)

    const dashX = w * 0.15
    const dashY = h * 0.15
    const dashW = w * 0.7
    const dashH = h * 0.7

    // Phase 1: Wireframe
    const frameProgress = Math.min(1, progress / 0.15)
    if (frameProgress > 0) {
      ctx.strokeStyle = `rgba(165, 180, 252, ${0.3 * frameProgress})`
      ctx.lineWidth = 1
      ctx.strokeRect(dashX, dashY, dashW, dashH)
      ctx.strokeRect(dashX, dashY, dashW * 0.25, dashH)
      ctx.strokeRect(dashX + dashW * 0.25, dashY, dashW * 0.75, dashH * 0.1)
      ctx.strokeRect(dashX + dashW * 0.25, dashY + dashH * 0.1, dashW * 0.75, dashH * 0.5)
      ctx.strokeRect(dashX + dashW * 0.25, dashY + dashH * 0.6, dashW * 0.37, dashH * 0.4)
      ctx.strokeRect(dashX + dashW * 0.62, dashY + dashH * 0.6, dashW * 0.38, dashH * 0.4)
    }

    // Phase 2: UI Panels
    const slideProgress = Math.min(1, Math.max(0, (progress - 0.15) / 0.3))
    
    const sidebarW = dashW * 0.25
    ctx.fillStyle = `rgba(30, 41, 59, ${slideProgress})`
    ctx.fillRect(dashX, dashY, sidebarW * slideProgress, dashH)

    const headerH = dashH * 0.1
    ctx.fillStyle = `rgba(51, 65, 85, ${slideProgress})`
    ctx.fillRect(dashX + sidebarW, dashY, (dashW - sidebarW) * slideProgress, headerH)
    
    const panelFadeProgress = Math.min(1, Math.max(0, (progress - 0.3) / 0.2))
    if (panelFadeProgress > 0) {
      ctx.fillStyle = `rgba(51, 65, 85, ${panelFadeProgress})`
      ctx.globalAlpha = panelFadeProgress
      ctx.fillRect(dashX + sidebarW, dashY + headerH, dashW - sidebarW, dashH * 0.5)
      ctx.fillRect(dashX + sidebarW, dashY + dashH * 0.6, dashW * 0.37, dashH * 0.4)
      ctx.fillRect(dashX + dashW * 0.62, dashY + dashH * 0.6, dashW * 0.38, dashH * 0.4)
      ctx.globalAlpha = 1
    }

    // Phase 3: Content and Plots
    const contentProgress = Math.min(1, Math.max(0, (progress - 0.5) / 0.5))
    if(contentProgress > 0) {
      ctx.globalAlpha = contentProgress

      ctx.fillStyle = '#e0e0e0'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText("Stingray QL", dashX + 15, dashY + 30)
      
      ctx.fillStyle = '#a5b4fc'
      const obsText = "Obs ID: 4040130102\nTarget: Cygnus X-1"
      const obsLines = obsText.split('\n')
      ctx.fillText((obsLines[0] || '').substring(0, Math.floor(contentProgress * (obsLines[0]?.length || 0))), dashX + 15, dashY + 70)
      if (progress > 0.55) {
        ctx.fillText((obsLines[1] || '').substring(0, Math.floor(Math.max(0, contentProgress - 0.1) * (obsLines[1]?.length || 0))), dashX + 15, dashY + 90)
      }
      
      ctx.fillStyle = '#e0e0e0'
      ctx.fillText("Quicklook Dashboard - X-Ray Time Series", dashX + sidebarW + 15, dashY + headerH/2)

      const plotDrawProgress = Math.min(1, Math.max(0, (progress - 0.6) / 0.4))
      if (plotDrawProgress > 0) {
        const p1x = dashX + sidebarW + 10, p1y = dashY + headerH + 10, p1w = dashW - sidebarW - 20, p1h = dashH * 0.5 - 20
        ctx.fillStyle = '#e0e0e0'
        ctx.fillText("Light Curve", p1x, p1y + 14)
        ctx.strokeStyle = '#fde047'
        ctx.lineWidth = 2
        ctx.beginPath()
        for(let i=0; i < p1w * plotDrawProgress; i++) {
          const x = p1x + i
          const y = p1y + p1h * 0.6 + Math.sin(i * 0.05) * p1h * 0.3
          if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y)
        }
        ctx.stroke()

        const p2x = dashX + sidebarW + 10, p2y = dashY + dashH * 0.6 + 10, p2w = dashW * 0.37 - 20, p2h = dashH * 0.4 - 20
        ctx.fillStyle = '#e0e0e0'
        ctx.fillText("Power Spectrum", p2x, p2y + 14)
        ctx.fillStyle = '#4ade80'
        const numBars = 10
        for(let i=0; i < numBars; i++) {
          const barHeight = p2h * 0.8 * (Math.sin(i * 1.5) * 0.5 + 0.5) * plotDrawProgress
          if (barHeight > 0) {
            ctx.fillRect(p2x + i * (p2w/numBars), p2y + p2h - barHeight, (p2w/numBars) - 5, barHeight)
          }
        }

        const p3x = dashX + dashW * 0.62 + 10, p3y = dashY + dashH * 0.6 + 10, p3w = dashW * 0.38 - 20, p3h = dashH * 0.4 - 20
        ctx.fillStyle = '#e0e0e0'
        ctx.fillText("Phase Lag", p3x, p3y + 14)
        ctx.fillStyle = 'rgba(239, 68, 68, 0.7)'
        const numPoints = 50
        for (let i=0; i < numPoints * plotDrawProgress; i++) {
          const x = p3x + Math.random() * p3w
          const y = p3y + Math.random() * p3h
          ctx.beginPath()
          ctx.arc(x,y,2,0,2*Math.PI)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    }
  }, [getResponsiveFontSize])

  const drawRadioInterferometry = ({ ctx, w, h, progress, data }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number; data?: DrawFunctionData }) => {
    ctx.clearRect(0, 0, w, h)
    const padding = 50
    const plotW = w - padding * 2
    const plotH = h - padding * 2

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, padding + plotH)
    ctx.lineTo(padding + plotW, padding + plotH)
    ctx.stroke()
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '14px Poppins'
    ctx.textAlign = 'center'
    ctx.fillText('LST (Time)', padding + plotW / 2, padding + plotH + 30)
    ctx.save()
    ctx.translate(padding - 30, padding + plotH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Visibility Amplitude', 0, 0)
    ctx.restore()

    const visibilityData = data?.visibilityData || []
    const pointsToDraw = Math.floor(progress * visibilityData.length)
    ctx.strokeStyle = '#4ade80'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i < pointsToDraw; i++) {
      const point = visibilityData[i]
      if (!point) continue
      const x = padding + point.x * plotW
      const y = padding + plotH - (point.y * plotH)
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  const drawBurningMidnightOil = useCallback(({ ctx, w, h, progress }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number }) => {
    ctx.clearRect(0, 0, w, h)

    // Background gradient from day to night
    const dayAmount = 1 - Math.min(1, progress * 1.5)
    const r = 12 + 123 * dayAmount
    const g = 10 + 196 * dayAmount
    const b = 26 + 209 * dayAmount
    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.fillRect(0, 0, w, h)

    // Sun and Moon
    const sunMoonY = h * 0.15
    const travelX = (w + 60) * progress - 30
    if (dayAmount > 0) {
      drawCircle(ctx, travelX, sunMoonY, 30, `rgba(253, 224, 71, ${dayAmount})`, `rgba(250, 204, 21, ${dayAmount * 0.5})`)
    }
    if (dayAmount < 1) {
      ctx.globalAlpha = 1 - dayAmount
      ctx.fillStyle = '#f0f0f0'
      ctx.beginPath()
      ctx.arc(travelX, sunMoonY, 30, 0, 2 * Math.PI)
      ctx.fill()
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.beginPath()
      ctx.arc(travelX - 10, sunMoonY - 5, 25, 0, 2 * Math.PI)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    // Bars
    const barY = h * 0.7
    const barH = 50
    const barW = w * 0.7
    const barX = (w - barW) / 2

    ctx.font = '16px Poppins'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // College Bar
    let collegeAlpha = 1
    if (progress > 0.4) {
      collegeAlpha = Math.max(0, 1 - (progress - 0.4) * 2)
    }
    ctx.fillStyle = `rgba(30, 41, 59, ${collegeAlpha * 0.5 + 0.1})`
    ctx.fillRect(barX, barY - 70, barW, barH)
    ctx.fillStyle = `rgba(253, 224, 71, ${collegeAlpha})`
    ctx.fillRect(barX, barY - 70, barW * 0.6, barH)
    ctx.fillStyle = `rgba(255,255,255, ${collegeAlpha})`
    ctx.fillText("College", w / 2, barY - 45)

    // RRI/RRIViz Bar
    let rriGlow = 0
    if(progress > 0.5) {
      rriGlow = (progress - 0.5) * 2 * 30
    }
    ctx.fillStyle = `rgba(30, 41, 59, 0.6)`
    ctx.fillRect(barX, barY - 140, barW, barH)

    ctx.shadowBlur = rriGlow
    ctx.shadowColor = `rgba(74, 222, 128, 0.8)`
    ctx.fillStyle = `rgba(74, 222, 128, 1)`
    ctx.fillRect(barX, barY - 140, barW, barH)
    ctx.shadowBlur = 0
    
    ctx.fillStyle = `rgba(0,0,0,0.8)`
    ctx.fillText("RRIViz", w/2, barY - 115)
  }, [])

  const drawDivergingPaths = useCallback(({ ctx, w, h, progress }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number }) => {
    ctx.clearRect(0, 0, w, h)
    const centerX = w / 2
    const pathWidth = 20
    const forkY = h * 0.5

    ctx.lineWidth = pathWidth
    ctx.lineCap = 'round'
    ctx.font = '16px Poppins'
    ctx.textAlign = 'center'

    // Draw BS-MS Path (main path)
    ctx.strokeStyle = '#a5b4fc'
    ctx.beginPath()
    ctx.moveTo(centerX, h)
    ctx.lineTo(centerX, forkY)
    ctx.stroke()

    // Draw Fading continuation of BS-MS
    const fadeProgress = Math.max(0, (progress - 0.4) / 0.4)
    ctx.strokeStyle = `rgba(165, 180, 252, ${1 - fadeProgress})`
    ctx.setLineDash([15, 15])
    ctx.beginPath()
    ctx.moveTo(centerX, forkY)
    ctx.lineTo(centerX, 0)
    ctx.stroke()
    ctx.setLineDash([])
    
    // Draw new MS Astro Path
    const newPathProgress = Math.max(0, (progress - 0.3) / 0.7)
    if (newPathProgress > 0) {
      ctx.strokeStyle = '#fde047'
      ctx.shadowBlur = 20
      ctx.shadowColor = '#fde047'
      ctx.beginPath()
      ctx.moveTo(centerX, forkY)
      ctx.lineTo(centerX + (w*0.3 * newPathProgress), forkY - (h*0.4 * newPathProgress))
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    // Draw Traveler with corrected logic
    let travelerX: number, travelerY: number
    
    if (progress < 0.5) {
      // Move up to the fork
      const travelProgress = progress / 0.5
      travelerX = centerX
      travelerY = h - (h - forkY) * travelProgress
    } else {
      // Move along the new path after the fork
      const switchProgress = (progress - 0.5) / 0.5
      travelerX = centerX + (w * 0.3 * switchProgress)
      travelerY = forkY - (h * 0.4 * switchProgress)
    }
    
    drawCircle(ctx, travelerX, travelerY, 15, 'rgba(255,255,255,1)', 'rgba(255,255,255,0.5)')
    
    // Labels
    const labelProgress = Math.max(0, (progress - 0.4) / 0.3)
    if (labelProgress > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${labelProgress})`
      ctx.textAlign = 'right'
      ctx.fillText("BS Exit", centerX - 25, forkY + 5)

      ctx.textAlign = 'left'
      ctx.fillText("BS-MS", centerX + 25, forkY + 40)
    }
  }, [])

  // Gravitational Lensing with Three.js
  const initGravitationalLensing = ({ canvas }: { canvas: HTMLCanvasElement; section: HTMLElement }) => {
    let scene: THREE.Scene | undefined
    let camera: THREE.OrthographicCamera | undefined
    let renderer: THREE.WebGLRenderer | undefined
    let material: THREE.ShaderMaterial | undefined
    let mesh: THREE.Mesh | undefined

    function init() {
      if (!(window as unknown as { THREE?: typeof import('three') }).THREE) {
        // Defer initialization until Three.js is loaded
        setTimeout(init, 100)
        return
      }

      const THREE = (window as unknown as { THREE: typeof import('three') }).THREE
      scene = new THREE.Scene()
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
      camera.position.z = 1

      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
      
      // Create galaxy background texture
      const bgCanvas = document.createElement('canvas')
      const bgCtx = bgCanvas.getContext('2d')!
      bgCanvas.width = 512
      bgCanvas.height = 512
      
      const bgGrad = bgCtx.createRadialGradient(256, 256, 0, 256, 256, 256)
      bgGrad.addColorStop(0, 'rgba(200, 210, 255, 0.5)')
      bgGrad.addColorStop(0.3, 'rgba(40, 50, 100, 0.6)')
      bgGrad.addColorStop(1, 'rgba(10, 20, 40, 0)')
      bgCtx.fillStyle = bgGrad
      bgCtx.fillRect(0,0,512,512)
      
      for(let i=0; i < 800; i++) {
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

      // Shader Material
      material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 },
          resolution: { value: new THREE.Vector2(canvas.clientWidth, canvas.clientHeight) },
          u_texture: { value: texture },
          lens_pos: { value: new THREE.Vector2(0.5, 0.5) },
          lens_mass: { value: 0.0 },
          einstein_radius: { value: 0.0 }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
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
      })

      const geometry = new THREE.PlaneGeometry(2, 2)
      mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      window.addEventListener('resize', onWindowResize, false)
      onWindowResize()
    }
    
    function onWindowResize() {
      if (!renderer || !material) return
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      renderer?.setSize(rect.width, rect.height)
      if (camera) {
        // OrthographicCamera doesn't have aspect, update bounds instead
        const aspect = rect.width / rect.height
        camera.left = -aspect
        camera.right = aspect
        camera.updateProjectionMatrix()
      }
      if (material?.uniforms?.resolution) {
        material.uniforms.resolution.value.set(rect.width * dpr, rect.height * dpr)
      }
    }

    function animate(progress: number) {
      if (!material || !renderer || !scene || !camera) return
      
      if (material.uniforms.time) {
        material.uniforms.time.value += 0.01
      }
      if (material.uniforms.lens_mass) {
        material.uniforms.lens_mass.value = progress
      }

      const radiusProgress = Math.sin(progress * Math.PI)
      if (material.uniforms.einstein_radius) {
        material.uniforms.einstein_radius.value = radiusProgress * 0.15
      }
      
      if (material.uniforms.lens_pos) {
        material.uniforms.lens_pos.value.x = 0.5 + Math.sin(Date.now() / 2000) * 0.2 * progress
        material.uniforms.lens_pos.value.y = 0.5 + Math.cos(Date.now() / 2500) * 0.2 * progress
      }

      renderer.render(scene, camera)
    }
    
    function update(progress: number) {
      if (!scene) init()
      animate(progress)
    }

    return { update }
  }

  const drawFoldingPlane = useCallback((ctx: CanvasRenderingContext2D, pW: number, pH: number, t: number) => {
    ctx.fillStyle = 'white'
    ctx.strokeStyle = '#aaa'
    ctx.lineWidth = 1.5

    const tl = { x: -pW / 2, y: -pH / 2 }
    const tr = { x: pW / 2, y: -pH / 2 }
    const bl = { x: -pW / 2, y: pH / 2 }
    const br = { x: pW / 2, y: pH / 2 }
    
    const p1 = { x: -pW / 4, y: 0 }
    const p2 = { x: pW / 4, y: 0 }

    const nose = { x: 0, y: -pH / 4}
    const tail = { x: 0, y: pH/2 }

    const t1 = Math.min(1, t / 0.33)
    const t2 = Math.min(1, Math.max(0, t - 0.33) / 0.33)
    const t3 = Math.min(1, Math.max(0, t - 0.66) / 0.34)

    const c_tl = { x: lerp(tl.x, p1.x, t1), y: lerp(tl.y, p1.y, t1) }
    const c_tr = { x: lerp(tr.x, p2.x, t2), y: lerp(tr.y, p2.y, t2) }
    const c_bl = { x: bl.x, y: bl.y }
    const c_br = { x: br.x, y: br.y }

    const final_tl = { x: lerp(c_tl.x, nose.x, t3), y: lerp(c_tl.y, nose.y, t3) }
    const final_tr = { x: lerp(c_tr.x, nose.x, t3), y: lerp(c_tr.y, nose.y, t3) }
    const final_bl = { x: lerp(c_bl.x, tail.x, t3), y: lerp(c_bl.y, tail.y, t3) }
    const final_br = { x: lerp(c_br.x, tail.x, t3), y: lerp(c_br.y, tail.y, t3) }

    // Left wing
    ctx.beginPath()
    ctx.moveTo(final_tl.x, final_tl.y)
    ctx.lineTo(final_bl.x, final_bl.y)
    ctx.lineTo(tail.x, tail.y)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Right wing
    ctx.beginPath()
    ctx.moveTo(final_tr.x, final_tr.y)
    ctx.lineTo(final_br.x, final_br.y)
    ctx.lineTo(tail.x, tail.y)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }, [])

  const drawPublicationFlight = useCallback(({ ctx, w, h, progress }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number; data?: DrawFunctionData }) => {
    ctx.clearRect(0, 0, w, h)

    const paperPhase = Math.min(1, progress / 0.2)
    const foldPhase = Math.max(0, (progress - 0.2) / 0.2)
    const flightPhase = Math.max(0, (progress - 0.4) / 0.6)

    const pW = w * 0.4
    const pH = h * 0.5
    
    if (flightPhase > 0) {
      const startX = w / 2
      const startY = h / 2
      const endX = w * 0.9  // Changed from 1.3 to keep on screen
      const endY = h * 0.2
      
      const planeX = startX + (endX - startX) * Math.min(flightPhase, 0.8)  // Stop at 80% of flight
      const planeY = startY + (endY - startY) * Math.min(flightPhase, 0.8)
      
      ctx.save()
      ctx.translate(planeX, planeY)
      ctx.rotate(-Math.PI / 10)
      drawPaperPlane(ctx, 50, Math.max(0.3, 1 - (flightPhase * 0.8)))  // Keep more visible
      ctx.restore()
      
      if (flightPhase > 0.05) {
        const splitProgress = Math.max(0, (flightPhase - 0.1) / 0.4)  // Start earlier, progress faster
        
        const dest1 = { x: w * 0.25, y: h * 0.4 }
        const dest2 = { x: w * 0.75, y: h * 0.6 }

        const midX1 = lerp(startX, dest1.x, splitProgress)
        const midY1 = lerp(startY, dest1.y, splitProgress)
        const midX2 = lerp(startX, dest2.x, splitProgress)
        const midY2 = lerp(startY, dest2.y, splitProgress)
        
        ctx.lineWidth = 2
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0.3, 1 - flightPhase * 0.5)})`  // Fade slower
        ctx.shadowColor = `rgba(255, 255, 255, 0.5)`
        ctx.shadowBlur = 10
        
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.quadraticCurveTo(startX, startY, midX1, midY1)
        ctx.stroke()
        
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.quadraticCurveTo(startX, startY, midX2, midY2)
        ctx.stroke()
        ctx.shadowBlur = 0

        const destAlpha = Math.min(1, splitProgress * 2)  // Appear faster
        if (destAlpha > 0) {
          drawAStar(ctx, dest1.x, dest1.y, 15, `rgba(253, 224, 71, ${destAlpha})`)  // Bigger stars
          drawAStar(ctx, dest2.x, dest2.y, 15, `rgba(165, 180, 252, ${destAlpha})`)

          ctx.fillStyle = `rgba(255, 255, 255, ${destAlpha})`
          ctx.font = getResponsiveFontSize(16, w)  // Larger text
          ctx.textAlign = 'center'
          ctx.fillText("U of Toronto", dest1.x, dest1.y + 35)
          ctx.fillText("IIT Indore (SKA)", dest2.x, dest2.y + 35)
        }
      }
    } else if (foldPhase > 0) {
      ctx.save()
      ctx.translate(w / 2, h / 2)
      drawFoldingPlane(ctx, pW, pH, foldPhase)
      ctx.restore()
    } else {
      const pX = (w - pW) / 2
      const pY = (h - pH) / 2
      ctx.fillStyle = `rgba(240, 240, 240, ${paperPhase})`
      ctx.strokeStyle = `rgba(200, 200, 200, ${paperPhase})`
      ctx.lineWidth = 2
      
      ctx.fillRect(pX, pY, pW, pH)
      ctx.strokeRect(pX, pY, pW, pH)
      
      // Draw paper header
      ctx.fillStyle = `rgba(30, 30, 30, ${paperPhase})`
      ctx.font = `bold ${getResponsiveFontSize(18, w)} Poppins`
      ctx.textAlign = 'center'
      ctx.fillText('arXiv:2506.02130', w/2, pY + 40)
      
      // Draw title
      ctx.font = `bold ${getResponsiveFontSize(13, w)} Poppins`
      ctx.fillText('fftvis: A Non-Uniform Fast Fourier', w/2, pY + 70)
      ctx.fillText('Transform Based Interferometric', w/2, pY + 90)
      ctx.fillText('Visibility Simulator', w/2, pY + 110)
      
      // Draw authors line
      ctx.font = getResponsiveFontSize(10, w)
      ctx.fillText('T.A. Cox, S.G. Murray, A.R. Parsons,', w/2, pY + 135)
      ctx.fillText('J.S. Dillon, K. Mandar, et al.', w/2, pY + 150)
      
      // Draw abstract lines
      ctx.lineWidth = 1
      ctx.strokeStyle = `rgba(50, 50, 50, ${paperPhase * 0.5})`
      ctx.font = getResponsiveFontSize(10, w)
      const abstractY = pY + 175
      for (let i = 0; i < 6; i++) {
        const lineY = abstractY + i * 18
        const lineWidth = pW * (0.8 - i * 0.05)
        const lineX = pX + (pW - lineWidth) / 2
        ctx.beginPath()
        ctx.moveTo(lineX, lineY)
        ctx.lineTo(lineX + lineWidth, lineY)
        ctx.stroke()
      }
    }
  }, [drawFoldingPlane, getResponsiveFontSize])

  const drawPublicationJourney = useCallback(({ ctx, w, h, progress }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number; data?: DrawFunctionData }) => {
    ctx.clearRect(0, 0, w, h)

    const time = Date.now() / 1000
    const padding = w * 0.1
    const centerY = h / 2

    // Define key points along the journey
    const points = [
      { x: padding, y: centerY, label: 'NuSTAR', phase: 0 },
      { x: w * 0.25, y: centerY - 20, label: 'Data', phase: 0.2 },
      { x: w * 0.4, y: centerY + 30, label: 'Analysis', phase: 0.4 },
      { x: w * 0.6, y: centerY - 15, label: 'Results', phase: 0.6 },
      { x: w * 0.75, y: centerY + 20, label: 'Paper', phase: 0.8 },
      { x: w - padding, y: centerY, label: 'ZTF', phase: 1.0 }
    ]

    // Draw the path
    ctx.strokeStyle = `rgba(100, 150, 255, ${0.3 * progress})`
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        const prevPoint = points[i - 1]
        if (prevPoint) {
          const cpx = (prevPoint.x + point.x) / 2
          const cpy = (prevPoint.y + point.y) / 2 - 30
          ctx.quadraticCurveTo(cpx, cpy, point.x, point.y)
        }
      }
    })
    ctx.stroke()
    ctx.setLineDash([])

    // Draw milestone indicators
    points.forEach((point, i) => {
      const pointProgress = Math.max(0, Math.min(1, (progress - point.phase) / 0.1))

      // Draw circle for milestone
      ctx.fillStyle = `rgba(100, 150, 255, ${0.8 * pointProgress})`
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * pointProgress})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Draw labels (positioned higher to avoid conflicts with larger icons)
      ctx.fillStyle = `rgba(255, 255, 255, ${pointProgress})`
      ctx.font = `${getResponsiveFontSize(10, w)} Poppins`
      ctx.textAlign = 'center'
      ctx.fillText(point.label, point.x, point.y - 40)

      // Draw simple icons for key milestones
      ctx.save()
      ctx.translate(point.x, point.y)

      if (i === 0) {
        // NuSTAR telescope (much bigger satellite)
        ctx.strokeStyle = `rgba(100, 150, 255, ${pointProgress})`
        ctx.lineWidth = 2
        // Solar panels
        ctx.fillStyle = `rgba(100, 150, 255, ${pointProgress})`
        ctx.fillRect(-35, -4, 20, 8)
        ctx.fillRect(15, -4, 20, 8)
        // Main body
        ctx.fillStyle = `rgba(150, 180, 255, ${pointProgress})`
        ctx.fillRect(-10, -10, 20, 20)
        // Antenna
        ctx.strokeStyle = `rgba(200, 200, 255, ${pointProgress})`
        ctx.beginPath()
        ctx.moveTo(0, -10)
        ctx.lineTo(0, -20)
        ctx.stroke()
      } else if (i === 2) {
        // Analysis - bigger histogram
        ctx.strokeStyle = `rgba(255, 200, 100, ${pointProgress})`
        ctx.lineWidth = 2
        const barHeight = 30
        for (let j = 0; j < 7; j++) {
          const height = barHeight * (0.3 + Math.random() * 0.7)
          ctx.fillStyle = `rgba(255, 200, 100, ${pointProgress * 0.8})`
          ctx.fillRect(-20 + j * 6, -height, 5, height)
        }
      } else if (i === 4) {
        // Paper document (much bigger)
        ctx.strokeStyle = `rgba(255, 255, 255, ${pointProgress})`
        ctx.lineWidth = 2
        ctx.strokeRect(-15, -20, 30, 40)
        ctx.fillStyle = `rgba(255, 255, 255, ${pointProgress * 0.1})`
        ctx.fillRect(-15, -20, 30, 40)
        // Paper lines
        ctx.strokeStyle = `rgba(100, 100, 100, ${pointProgress})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(-10, -12)
        ctx.lineTo(10, -12)
        ctx.moveTo(-10, -6)
        ctx.lineTo(10, -6)
        ctx.moveTo(-10, 0)
        ctx.lineTo(10, 0)
        ctx.moveTo(-10, 6)
        ctx.lineTo(10, 6)
        ctx.moveTo(-10, 12)
        ctx.lineTo(10, 12)
        ctx.stroke()
        // arXiv label
        ctx.fillStyle = `rgba(100, 150, 255, ${pointProgress})`
        ctx.font = `${getResponsiveFontSize(8, w)} monospace`
        ctx.textAlign = 'center'
        ctx.fillText('arXiv', 0, 0)
      } else if (i === 5) {
        // ZTF/Caltech telescope
        ctx.strokeStyle = `rgba(255, 150, 50, ${pointProgress})`
        ctx.lineWidth = 1
        // Telescope tube
        ctx.beginPath()
        ctx.moveTo(0, -8)
        ctx.lineTo(0, 8)
        ctx.stroke()
        // Base
        ctx.beginPath()
        ctx.moveTo(-6, 8)
        ctx.lineTo(6, 8)
        ctx.stroke()
      }

      ctx.restore()
    })

    // Draw moving particles along the path
    const particleCount = 5
    for (let i = 0; i < particleCount; i++) {
      const particleProgress = ((time * 0.3 + i * 0.2) % 1.0) * progress
      const segmentIndex = Math.floor(particleProgress * (points.length - 1))
      const segmentProgress = (particleProgress * (points.length - 1)) % 1

      if (segmentIndex < points.length - 1) {
        const start = points[segmentIndex]
        const end = points[segmentIndex + 1]
        const t = segmentProgress

        if (start && end) {
          // Quadratic bezier interpolation
          const cpx = (start.x + end.x) / 2
          const cpy = (start.y + end.y) / 2 - 30

          const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * cpx + t * t * end.x
          const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * cpy + t * t * end.y

          // Draw particle
          const particleSize = 3 + Math.sin(time * 3 + i) * 1
          ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * progress})`
          ctx.beginPath()
          ctx.arc(x, y, particleSize, 0, Math.PI * 2)
          ctx.fill()

          // Particle glow
          ctx.fillStyle = `rgba(100, 150, 255, ${0.3 * progress})`
          ctx.beginPath()
          ctx.arc(x, y, particleSize + 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

  }, [getResponsiveFontSize])

  const drawPaperPlane = (ctx: CanvasRenderingContext2D, size: number, alpha: number) => {
    ctx.fillStyle = `rgba(240, 240, 240, ${alpha})`
    ctx.strokeStyle = `rgba(150, 150, 150, ${alpha})`
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.moveTo(0, -size)
    ctx.lineTo(size * 0.9, size * 0.4)
    ctx.lineTo(0, size * 0.2)
    ctx.lineTo(-size * 0.9, size * 0.4)
    ctx.closePath()
    
    ctx.fill()
    ctx.stroke()
  }

  const drawCelestialWorkbench = useCallback(({ ctx, w, h, progress, data }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number; data?: DrawFunctionData }) => {
    ctx.clearRect(0, 0, w, h)
    const centerX = w / 2
    const centerY = h / 2

    // Phase 1: Cygnus X-1 Analysis
    const cygnusPhase = Math.min(1, progress / 0.5)
    if (cygnusPhase > 0) {
      const baseRadius = w * 0.05
      ctx.fillStyle = 'black'
      ctx.beginPath()
      ctx.arc(centerX, centerY, baseRadius * cygnusPhase, 0, 2 * Math.PI)
      ctx.fill()

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(Math.PI * 0.1)
      
      for(let i = 0; i < 5; i++) {
        const ringProgress = Math.max(0, (cygnusPhase - i*0.1) / (1 - i*0.1))
        const radius = baseRadius * (1.2 + i * 0.6) * ringProgress
        const alpha = (1 - (i/5)) * 0.15 * ringProgress
        const grad = ctx.createLinearGradient(-radius, 0, radius, 0)
        grad.addColorStop(0, `rgba(255, 100, 100, ${alpha})`)
        grad.addColorStop(0.5, `rgba(150, 180, 255, ${alpha})`)
        grad.addColorStop(1, `rgba(255, 100, 100, ${alpha})`)
        
        ctx.strokeStyle = grad
        ctx.lineWidth = 15 * (1 - i/5) * ringProgress
        ctx.beginPath()
        ctx.arc(0, 0, radius, 0, 2 * Math.PI)
        ctx.stroke()
      }
      ctx.restore()
    }
    
    // Phase 2: RRIViz & EM Solvers
    const rrivizPhase = Math.max(0, (progress - 0.2) / 0.6)
    if(rrivizPhase > 0) {
      ctx.strokeStyle = `rgba(165, 180, 252, ${rrivizPhase * 0.2})`
      ctx.lineWidth = 1
      for(let i = 0; i < 20; i++) {
        const pos = i * (w/20)
        ctx.beginPath()
        ctx.moveTo(pos, 0)
        ctx.lineTo(pos, h)
        ctx.moveTo(0, pos)
        ctx.lineTo(w, pos)
        ctx.stroke()
      }
    }

    // Phase 3: LaTeX Editor
    const latexPhase = Math.max(0, (progress - 0.5) / 0.5)
    if (latexPhase > 0) {
      const crystalX = w * 0.8
      const crystalY = h * 0.75
      const crystalSize = getResponsiveScale(80, w, h) * latexPhase
      
      ctx.save()
      ctx.translate(crystalX, crystalY)
      ctx.scale(crystalSize, crystalSize)
      
      ctx.fillStyle = `rgba(200, 220, 255, ${latexPhase * 0.3})`
      ctx.strokeStyle = `rgba(220, 240, 255, ${latexPhase * 0.8})`
      ctx.lineWidth = 3 / crystalSize

      ctx.beginPath()
      ctx.moveTo(0, -1)
      ctx.lineTo(0.8, -0.4)
      ctx.lineTo(0.5, 0.8)
      ctx.lineTo(-0.5, 0.8)
      ctx.lineTo(-0.8, -0.4)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.restore()

      if (data && data.latexParticles && data.latexParticles.length === 0 && latexPhase > 0.1) {
        const symbols = ['\\int', '\\Sigma', '\\frac{a}{b}', '\\alpha', '\\nabla']
        for (let i = 0; i < 15; i++) {
          data.latexParticles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (crystalX - (Math.random() * w)) / 200,
            vy: (crystalY - (Math.random() * h)) / 200,
            text: symbols[i % symbols.length] || '\\alpha',
            alpha: 1,
            absorbed: false,
          })
        }
      }
      
      if (data) {
        data?.latexParticles?.forEach((p) => {
        if (!p.absorbed) {
          p.x += p.vx
          p.y += p.vy
          p.alpha = Math.max(0.2, 1 - latexPhase * 0.7)

          ctx.fillStyle = `rgba(253, 224, 71, ${p.alpha})`
          ctx.font = getResponsiveFontSize(20, w)
          ctx.fillText(p.text, p.x, p.y)
          
          if(distance(p.x, p.y, crystalX, crystalY) < crystalSize * 0.8) {
            p.absorbed = true
            data.currentLatexSymbol = p.text
          }
        }
      })
      }

      if (data && data.currentLatexSymbol) {
        ctx.fillStyle = `rgba(253, 224, 71, ${latexPhase})`
        ctx.font = `bold ${getResponsiveFontSize(24, w)}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        drawMathSymbol(ctx, data.currentLatexSymbol, crystalX, crystalY)
      }
    }
    if (progress < 0.5 && data) {
      data.latexParticles = []
      data.currentLatexSymbol = undefined
    }
  }, [getResponsiveFontSize, getResponsiveScale])

  const drawMathSymbol = (ctx: CanvasRenderingContext2D, symbol: string, cx: number, cy: number) => {
    switch(symbol) {
      case '\\int': ctx.fillText('∫', cx, cy); break
      case '\\Sigma': ctx.fillText('Σ', cx, cy); break
      case '\\frac{a}{b}': ctx.fillText('a/b', cx, cy); break
      case '\\alpha': ctx.fillText('α', cx, cy); break
      case '\\nabla': ctx.fillText('∇', cx, cy); break
    }
  }

  const drawJourneyContinues = useCallback(({ ctx, w, h, progress, data }: { ctx: CanvasRenderingContext2D; w: number; h: number; progress: number; data?: DrawFunctionData }) => {
    ctx.clearRect(0, 0, w, h)
    
    const centerX = w / 2
    const startY = h * 0.95
    const endY = h * -0.2
    
    const travelerY = startY - (startY - endY) * progress
    const scale = 1.0 - progress * 0.9
    
    // Draw Nebulous background
    const nebulaProgress = Math.min(1, progress * 1.5)
    if (nebulaProgress > 0) {
      const grad = ctx.createRadialGradient(centerX, travelerY, 0, centerX, travelerY, w * 0.8 * nebulaProgress)
      grad.addColorStop(0, `rgba(40, 50, 100, ${nebulaProgress * 0.6})`)
      grad.addColorStop(1, `rgba(10, 20, 40, 0)`)
      ctx.fillStyle = grad
      ctx.fillRect(0,0,w,h)
    }

    // Draw Path of Stars
    ctx.save()
    ctx.translate(0, (h*0.3) * progress)
    data?.pathStars?.forEach((star) => {
      const perspective = (star.y * h) / h
      const pathWidth = (w * 0.1 + perspective * w * 0.4) * (1 - progress)
      const starX = centerX + (star.x - 0.5) * pathWidth
      const starY = star.y * h
      const alpha = (1 - perspective) * (1 - progress)
      if (starY > travelerY && progress < 0.9) return
      drawAStar(ctx, starX, starY, star.size, `rgba(255, 255, 255, ${alpha})`)
    })
    ctx.restore()
    
    // Draw Walker
    if (scale > 0) {
      drawWalker(ctx, centerX, travelerY, 30 * scale, progress)
    }
  }, [])

  const drawWalker = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, progress: number) => {
    const legAngle = Math.sin(progress * 50) * (Math.PI / 6)
    const armAngle = Math.cos(progress * 50) * (Math.PI / 8)

    ctx.strokeStyle = '#fff'
    ctx.lineWidth = size * 0.1
    ctx.lineCap = 'round'
    
    // Body
    const bodyY = y - size * 1.5
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x, bodyY)
    ctx.stroke()
    
    // Head
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(x, y - size * 1.8, size * 0.4, 0, 2 * Math.PI)
    ctx.fill()
    
    // Arms
    ctx.save()
    ctx.translate(x, bodyY)
    ctx.rotate(-armAngle)
    ctx.beginPath()
    ctx.moveTo(0,0)
    ctx.lineTo(0, size * 0.8)
    ctx.stroke()
    ctx.rotate(2 * armAngle)
    ctx.beginPath()
    ctx.moveTo(0,0)
    ctx.lineTo(0, size * 0.8)
    ctx.stroke()
    ctx.restore()

    // Legs
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(legAngle)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, size)
    ctx.stroke()
    ctx.rotate(-2 * legAngle)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, size)
    ctx.stroke()
    
    ctx.restore()
  }

  // Canvas setup and animation loop
  useEffect(() => {
    const data = memoizedData()
    
    const canvases = [
      { id: 'nao-canvas', sectionId: 'nao-section', drawFn: drawPageToCosmos },
      { id: 'comet-canvas', sectionId: 'comet-section', drawFn: drawBuildAComet, data: { particles: data.particles } },
      { id: 'decision-canvas', sectionId: 'decision-section', drawFn: drawFocusingLens, data: { stars: data.stars150 } },
      { id: 'constellation-canvas', sectionId: 'constellation-section', drawFn: drawConstellations },
      { id: 'new-system-canvas', sectionId: 'new-system-section', drawFn: drawVirtualNetwork, data: { networkNodes: data.networkNodes } },
      { id: 'fixation-canvas', sectionId: 'fixation-section', drawFn: drawUnwaveringCompass },
      { id: 'slingshot-canvas', sectionId: 'slingshot-section', drawFn: drawSlingshot },
      { id: 'lens-canvas', sectionId: 'lens-section', drawFn: drawMajorChoiceLens },
      { id: 'internship-canvas', sectionId: 'internship-section', drawFn: drawInternshipPathways },
      { id: 'injury-canvas', sectionId: 'injury-section', drawFn: drawShatteringShuttlecock, data: { shards: undefined } },
      { id: 'rri-research-canvas', sectionId: 'rri-research-section', drawFn: drawSignalToSimulation, data: { noisySignal: data.visibilityData100, antennas: data.antennas } },
      { id: 'gsoc-canvas', sectionId: 'gsoc-section', drawFn: drawBuildingDashboard },
      { id: 'radio-canvas', sectionId: 'radio-section', drawFn: drawRadioInterferometry, data: { visibilityData: data.visibilityData100 } },
      { id: 'doubling-down-canvas', sectionId: 'doubling-down-section', drawFn: drawBurningMidnightOil },
      { id: 'bs-exit-canvas', sectionId: 'bs-exit-section', drawFn: drawDivergingPaths },
      { id: 'lensing-canvas', sectionId: 'lensing-section', initFn: initGravitationalLensing },
      { id: 'publication-canvas', sectionId: 'publication-section', drawFn: drawPublicationFlight },
      { id: 'cygnus-publication-canvas', sectionId: 'cygnus-publication-section', drawFn: drawPublicationJourney },
      { id: 'analysis-canvas', sectionId: 'analysis-section', drawFn: drawCelestialWorkbench, data: { latexParticles: [], currentLatexSymbol: undefined } },
      { id: 'journey-continues-canvas', sectionId: 'journey-continues-section', drawFn: drawJourneyContinues, data: { pathStars: data.pathStars100 } },
    ]

    canvases.forEach(c => {
      const canvasEl = document.getElementById(c.id) as HTMLCanvasElement
      const sectionEl = document.getElementById(c.sectionId) as HTMLElement
      if (canvasEl && sectionEl) {
        if (c.id === 'lensing-canvas') {
          canvasDataRef.current[c.id] = { 
            canvas: canvasEl, 
            section: sectionEl, 
            initFn: c.initFn, 
            isInitialized: false,
            lastProgress: -1 
          }
        } else {
          canvasDataRef.current[c.id] = {
            canvas: canvasEl,
            ctx: canvasEl.getContext('2d')!,
            section: sectionEl,
            drawFn: c.drawFn,
            data: c.data || undefined,
            lastProgress: -1
          }
        }
      }
    })

    const resizeCanvases = () => {
      for (const key in canvasDataRef.current) {
        const data = canvasDataRef.current[key]
        if (data?.canvas) {
          const dpr = window.devicePixelRatio || 1
          const rect = data.canvas.getBoundingClientRect()
          data.canvas.width = rect.width * dpr
          data.canvas.height = rect.height * dpr
          if (data.ctx) {
            data.ctx.scale(dpr, dpr)
          }
        }
      }
    }

    // Throttled resize handler for better performance
    let resizeTimeout: NodeJS.Timeout | null = null
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        resizeCanvases()
      }, 150)
    }

    // Set up Intersection Observer for performance
    intersectionObserverRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const canvasId = entry.target.id.replace('-section', '-canvas')
        if (entry.isIntersecting) {
          visibleCanvasesRef.current.add(canvasId)
        } else {
          visibleCanvasesRef.current.delete(canvasId)
        }
      })
    }, { 
      rootMargin: '50px 0px',
      threshold: 0 
    })

    // Observe all sections
    canvases.forEach(c => {
      const sectionEl = document.getElementById(c.sectionId)
      if (sectionEl) {
        intersectionObserverRef.current?.observe(sectionEl)
      }
    })

    let frameCount = 0
    const throttledUpdate = throttledScrollUpdate()
    
    const mainAnimationLoop = () => {
      frameCount++
      
      // Update Three.js animations on every frame (60fps for smooth Three.js)
      visibleCanvasesRef.current.forEach(key => {
        const data = canvasDataRef.current[key]
        if (data?.animation) {
          const progress = calculateScrollProgress(data.section)
          data.animation.update(progress)
        }
        
        // Update analysis canvas continuously for moving LaTeX symbols
        if (key === 'analysis-canvas' && data?.drawFn && data?.ctx) {
          const progress = calculateScrollProgress(data.section)
          data.drawFn({
            ctx: data.ctx,
            w: data.canvas.clientWidth,
            h: data.canvas.clientHeight,
            progress: progress,
            data: data.data
          })
        }
      })
      
      // Use throttled update for canvas drawings (still optimized with progress detection)
      if (frameCount % 2 === 0) {
        throttledUpdate()
      }
      
      animationFrameRef.current = requestAnimationFrame(mainAnimationLoop)
    }

    window.addEventListener('resize', handleResize)
    resizeCanvases()
    mainAnimationLoop()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeout) clearTimeout(resizeTimeout)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect()
      }
    }
  }, [
    calculateScrollProgress,
    memoizedData,
    throttledScrollUpdate,
    drawBuildAComet,
    drawBuildingDashboard,
    drawBurningMidnightOil,
    drawCelestialWorkbench,
    drawConstellations,
    drawDivergingPaths,
    drawJourneyContinues,
    drawMajorChoiceLens,
    drawPublicationFlight,
    drawPublicationJourney,
    drawShatteringShuttlecock,
    drawSignalToSimulation,
    drawSlingshot,
    drawUnwaveringCompass,
    drawVirtualNetwork
  ])

  return (
    <div className="cosmic-journey-container relative" ref={cosmicJourneyRef}>
      {/* CSS Styles */}
      <style jsx>{`
        .cosmic-journey-container {
          font-family: 'Poppins', sans-serif;
          background: transparent;
          color: #e0e0e0;
          margin-top: 0;
          padding-top: 0;
          position: relative;
          z-index: 1;
        }

        .starry-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #0c0a1a;
          background-image:
            radial-gradient(1px 1px at 20% 30%, #ffffff, transparent),
            radial-gradient(1px 1px at 40% 20%, #ffffff, transparent),
            radial-gradient(1px 1px at 50% 80%, #dddddd, transparent),
            radial-gradient(2px 2px at 60% 70%, #ffffff, transparent),
            radial-gradient(2px 2px at 80% 10%, #dddddd, transparent),
            radial-gradient(2px 2px at 90% 40%, #ffffff, transparent);
          background-repeat: repeat;
          background-size: 300px 300px;
          background-attachment: fixed;
          z-index: 0;
          animation: move-stars 60s linear infinite;
          pointer-events: none;
        }

        @keyframes move-stars {
          from { background-position: 0 0; }
          to { background-position: -300px -300px; }
        }

        .timeline-container {
          position: relative;
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px;
          z-index: 1;
        }

        .timeline-spine {
          position: absolute;
          left: 50%;
          width: 3px;
          top: 0;
          bottom: 0;
          background: linear-gradient(to bottom, rgba(79, 70, 229, 0) 0%, #4f46e5 10%, #4f46e5 90%, rgba(79, 70, 229, 0) 100%);
          transform: translateX(-50%);
          box-shadow: 0 0 10px rgba(79, 70, 229, 0.8);
        }

        .timeline-event {
          position: relative;
          width: 45%;
          margin-bottom: 80px;
          opacity: 0;
          transition: all 0.8s ease-in-out;
        }

        .timeline-event.left { 
          left: 0; 
          transform: translateX(-50px); 
        }
        
        .timeline-event.right { 
          left: 55%; 
          transform: translateX(50px); 
        }
        
        .timeline-event.is-visible { 
          opacity: 1; 
          transform: translateX(0); 
        }

        .timeline-event::after {
          content: '';
          position: absolute;
          width: 18px;
          height: 18px;
          top: 10px;
          background-color: #fff;
          border: 4px solid #4f46e5;
          border-radius: 50%;
          z-index: 1;
          transition: transform 0.5s ease-in-out;
          transform: scale(0);
        }

        .timeline-event.left::after { right: -42px; }
        .timeline-event.right::after { left: -42px; }
        .timeline-event.is-visible::after { transform: scale(1); }

        .interactive-section {
          position: relative;
          width: 100%;
          height: 350vh;
          margin-bottom: 80px;
        }

        .interactive-canvas {
          position: sticky;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          min-height: 400px;
          will-change: transform;
        }

        .interactive-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: white;
          z-index: 10;
          width: 90%;
          max-width: 600px;
          pointer-events: none;
          padding: 20px;
        }

        /* Mobile and Tablet Responsive Styles */
        @media (max-width: 768px) {
          .interactive-canvas {
            height: 80vh;
            min-height: 350px;
          }
          
          .interactive-text {
            width: 95%;
            padding: 15px;
          }
          
          .interactive-text h3 {
            font-size: 1.5rem !important;
            line-height: 1.3;
            margin-bottom: 8px !important;
          }
          
          .interactive-text p {
            font-size: 0.9rem !important;
            line-height: 1.4;
          }
          
          .timeline-container {
            max-width: 100%;
            padding: 20px 10px;
          }
          
          .timeline-event {
            width: 80% !important;
            left: 10% !important;
            margin-bottom: 40px;
          }
          
          .timeline-event.left,
          .timeline-event.right {
            left: 10% !important;
            transform: none !important;
          }
          
          .timeline-spine {
            left: 8%;
          }
        }

        @media (max-width: 480px) {
          .interactive-canvas {
            height: 70vh;
            min-height: 300px;
          }
          
          .interactive-text h3 {
            font-size: 1.25rem !important;
          }
          
          .interactive-text p {
            font-size: 0.8rem !important;
          }
          
          .timeline-container {
            padding: 15px 5px;
          }
          
          .timeline-event {
            width: 90% !important;
            left: 5% !important;
            margin-bottom: 30px;
          }
          
          .timeline-spine {
            left: 5%;
          }
        }

        /* Large screens optimization */
        @media (min-width: 1400px) {
          .interactive-canvas {
            height: 100vh;
          }
          
          .timeline-container {
            max-width: 1200px;
          }
          
          .interactive-text {
            max-width: 700px;
          }
        }

        #search-text {
          display: inline-block;
          border-right: 3px solid #e0e0e0;
          animation: blink-caret 0.75s step-end infinite;
          min-height: 1em;
        }

        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: #e0e0e0; }
        }

        @keyframes glow {
          0% { 
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 165, 0, 0.3), 0 0 60px rgba(255, 69, 0, 0.2);
            transform: scale(1);
          }
          100% { 
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.8), 0 0 80px rgba(255, 165, 0, 0.6), 0 0 120px rgba(255, 69, 0, 0.4);
            transform: scale(1.02);
          }
        }
      `}</style>

      <div className="starry-background"></div>

      <header className="text-center px-4 pt-20 pb-8 relative z-10">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-wider">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-indigo-300 mb-4">
            {subtitle}
          </p>
        </div>
      </header>

      <div className="timeline-container">
        <div className="timeline-spine"></div>

        {/* NAO Section */}
        <section className="interactive-section" id="nao-section">
          <canvas 
            id="nao-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <p className="text-indigo-400 font-semibold mb-1">4th Standard</p>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">The Spark: NAO</h3>
            <p className="text-md md:text-lg">
              Cleared the regional round of the National Astronomy Olympiad. Reading their textbooks sparked a fascination that led me to participating each year, fueling a deep interest in the cosmos.
            </p>
          </div>
        </section>

        {/* Comet Section */}
        <section className="interactive-section" id="comet-section">
          <canvas 
            id="comet-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <p className="text-indigo-400 font-semibold mb-1">6th - 8th Standard</p>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">Hands-On Exploration</h3>
            <p className="text-md md:text-lg">
              Joined SPACE-India astronomy club at school. It was fascinaing. Solar observations, making dry-ice comets, finding asteroids, calculating Earth&apos;s circumference and overnight observation camps at Sariska somehow made the universe tangible.
            </p>
          </div>
        </section>

        {/* Decision Section */}
        <section className="interactive-section" id="decision-section">
          <canvas 
            id="decision-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <p className="text-indigo-400 font-semibold mb-1">9th - 10th Standard</p>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">A Future Decided</h3>
            <p className="text-md md:text-lg">
              With a clear vision, I decided my future lay among the cosmos. It seemed like a pipe dream but I  solidified my resolve to become an astronomer.
            </p>
          </div>
        </section>

        {/* Constellation Section */}
        <section className="interactive-section" id="constellation-section">
          <canvas 
            id="constellation-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <p className="text-indigo-400 font-semibold mb-1">11th - 12th Standard</p>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">Forging My Own Path</h3>
            <p className="text-md md:text-lg">
              Even though I chose PCM in my high school, I went on a goal to pursue research over engineering, built my own refractor, started the &quot;Brittle Stars&quot; blog, and played badminton competitively. I also bagged AIR 14 in Heliodyssey, winning a fully sponsored solar expedition to Oman to study an annular eclipse.
            </p>
          </div>
        </section>

        {/* Search Section */}
        <section className="interactive-section" style={{ height: '100vh' }} id="search-section-wrapper">
          <div id="search-section" className="flex flex-col justify-center items-center h-full sticky top-0">
            <p className="text-indigo-400 font-semibold mb-2">Partial Drop Year</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Searching for the Right Trajectory</h2>
            <div className="w-full max-w-2xl bg-black bg-opacity-30 p-4 rounded-lg border border-gray-700 text-left">
              <p className="text-lg md:text-xl text-green-400 font-mono">
                &gt; <span ref={searchTextRef} id="search-text"></span>
              </p>
            </div>
          </div>
        </section>
        
        {/* Virtual Network Section */}
        <section className="interactive-section" id="new-system-section">
          <canvas 
            id="new-system-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <p className="text-indigo-400 font-semibold mb-1">1st Year at IISER Bhopal</p>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">A New System</h3>
            <p className="text-md md:text-lg">
              After a partial drop year, I joined the BS Economic Sciences programme at IISER Bhopal. The first semester was online due to COVID, a time I used to focus on full-stack web development alongside my studies.
            </p>
          </div>
        </section>

        {/* Fixation Section */}
        <section className="interactive-section" id="fixation-section">
          <canvas 
            id="fixation-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <p className="text-indigo-400 font-semibold mb-1">Temporary Home</p>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">Fixated on Physics</h3>
            <p className="text-md md:text-lg">
              Though I started as an Economic Sciences student, my focus was always fixed on finding a way into physics and astronomy.
            </p>
          </div>
        </section>

        <section className="interactive-section" id="slingshot-section">
          <canvas 
            id="slingshot-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <p className="text-indigo-400 font-semibold mb-1">End of 1st Year</p>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">Orbital Correction</h3>
            <p className="text-md md:text-lg">
              Scoring one of the highest CGPA in my branch gave me the option to switch. I chose to migrate to the 5-year BS-MS Natural Sciences programme, correcting my course toward astrophysics.
            </p>
          </div>
        </section>

        <section className="interactive-section" id="lens-section">
          <canvas 
            id="lens-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <p className="text-indigo-400 font-semibold mb-1">2nd & 3rd Year</p>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">Finding My Sun</h3>
            <p className="text-md md:text-lg">
              Exploring Physics, Maths, and Data Science as pre-majors, I finally chose Physics as my major and joined the IISER Bhopal Astronomy Club and the Sports Council.
            </p>
          </div>
        </section>
        
        {/* Internship & iGEM Section */}
        <section className="interactive-section" id="internship-section">
          <canvas 
            id="internship-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <p className="text-indigo-400 font-semibold mb-1">After 2nd Year</p>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">Dual Pathways</h3>
            <p className="text-md md:text-lg">
              I got selected for an internship in Sysmatics Lab at EECS department, to develop a mobile app for collecting data for detecting signs of depression among academicians. Also got selected for the iGEM team of IISER Bhopal for the synthetic biology competition organized by MIT in Paris.
            </p>
          </div>
        </section>
        
        {/* Shattering Shuttlecock Section */}
        <section className="interactive-section" id="injury-section">
          <canvas 
            id="injury-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <p className="text-indigo-400 font-semibold mb-1">Leadership & Setbacks</p>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">Captaincy and Injury</h3>
            <p className="text-md md:text-lg">
              I captained the IISER Bhopal badminton team at the Inter IISER Sports Meet. Unfortunately, I also broke my shoulder and tore my ACL during a game, leading me to transition my role from captain to a coach.
            </p>
          </div>
        </section>
        
        {/* Signal to Simulation Section */}
        <section className="interactive-section" id="rri-research-section">
          <canvas 
            id="rri-research-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <p className="text-indigo-400 font-semibold mb-1">Summer After 3rd Year</p>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">First Foray into Research</h3>
            <p className="text-md md:text-lg">
              Joined Raman Research Institute as a visiting student, working with the HERA radio array in South Africa. As a part of the validation team, I built my own visibility simulator, RRIViz.
            </p>
          </div>
        </section>
        
        {/* GSoC Dashboard Section */}
        <section className="interactive-section" id="gsoc-section">
          <canvas 
            id="gsoc-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <p className="text-indigo-400 font-semibold mb-1">Google Summer of Code 2024</p>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">GSoC & Open Source</h3>
            <p className="text-md md:text-lg">
              Selected for Google Summer of Code with Stingray, I built a quicklook dashboard for X-ray time series data. This marked the start of my open-source journey.
            </p>
          </div>
        </section>

        {/* HERA Section */}
        <section className="interactive-section" id="radio-section">
          <canvas 
            id="radio-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">HERA: Seeing the Invisible</h3>
            <p className="text-md md:text-lg">
              My work at RRI involved simulating visibility data from radio interferometers like HERA. I also learned about matvis and other popular visibility simulators.
            </p>
          </div>
        </section>

        {/* Doubling Down Section */}
        <section className="interactive-section" id="doubling-down-section">
          <canvas 
            id="doubling-down-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <p className="text-indigo-400 font-semibold mb-1">Winter Vacation</p>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">Doubling Down</h3>
            <p className="text-md md:text-lg">
              Successfully completing both internships, I churned the midnight oil and returned to RRI in December to continue my work on RRIViz.
            </p>
          </div>
        </section>

        {/* BS Exit Decision Section */}
        <section className="interactive-section" id="bs-exit-section">
          <canvas 
            id="bs-exit-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <p className="text-indigo-400 font-semibold mb-1">A Strategic Pivot</p>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">The BS Exit Decision</h3>
            <p className="text-md md:text-lg">
              I decided to take a BS exit from college to pursue an MS in Astrophysics elsewhere for better opportunities.
            </p>
          </div>
        </section>

        {/* GSoC Lensing Section */}
        <section className="interactive-section" id="lensing-section">
          <canvas 
            id="lensing-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <p className="text-indigo-400 font-semibold mb-1">Summer of Code 2025</p>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">GSoC 2025: ML for Science</h3>
            <p className="text-md md:text-lg">
              Selected again for GSoC with ML4SCI, working on an LSST data analysis pipeline for DeepLense and applying machine learning to gravitational lensing.
            </p>
          </div>
        </section>

        {/* Publication Flight Section */}
        <section className="interactive-section" id="publication-section">
          <canvas 
            id="publication-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <p className="text-indigo-400 font-semibold mb-1">Third RRI Stint</p>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">First Publication & New Horizons</h3>
            <p className="text-md md:text-lg">
              Returning to RRI, I worked on fftvis, leading to my first co-authored paper on arXiv. I was also selected for fully-sponsored summer programs at the University of Toronto and IIT Indore for SKA training.
            </p>
          </div>
        </section>

        {/* Second Publication & ZTF School Section */}
        <section className="interactive-section" id="cygnus-publication-section">
          <canvas
            id="cygnus-publication-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <p className="text-indigo-400 font-semibold mb-1">Second Publication & Some Training</p>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">Cygnus X-1 Discovery & ZTF Summer School</h3>
            <p className="text-md md:text-lg">
              Timing analysis of Cygnus X-1 using 26 NuSTAR observations resulted in my second co-authored paper submitted to arXiv. Selected for the prestigious ZTF Summer School at Caltech, focusing on data science techniques for the Rubin Observatory era.
            </p>
          </div>
        </section>

        {/* Celestial Workbench Section */}
        <section className="interactive-section" id="analysis-section">
          <canvas 
            id="analysis-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text">
            <p className="text-indigo-400 font-semibold mb-1">Current Endeavors</p>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">What I am working on?</h3>
            <p className="text-md md:text-lg">
              Currently working across different projects: spectral analysis of Cygnus X-1, RRIVis version 2 with polarization and antenna beam support, contributing to RIPPLe, DAVE and Stingray, and maintaining fftvis.
            </p>
          </div>
        </section>

        {/* Final Journey Section */}
        <section className="interactive-section" id="journey-continues-section" style={{ height: '400vh', marginBottom: 0 }}>
          <canvas 
            id="journey-continues-canvas"
            className="interactive-canvas"
          ></canvas>
          <div className="interactive-text" style={{ top: '30%' }}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Journey Continues...</h2>
            <p className="text-lg text-indigo-300">...in search of a Master&apos;s in Astrophysics.</p>
          </div>
        </section>
      </div>
    </div>
  )
}