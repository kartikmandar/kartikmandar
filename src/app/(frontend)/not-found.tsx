'use client'

import Link from 'next/link'
import { PageHeader } from '@/components/motion'
import React, { useEffect, useRef, useState, useCallback } from 'react'

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [generation, setGeneration] = useState(0)
  const [population, setPopulation] = useState(0)
  const [speed, setSpeed] = useState(10)
  
  // Game state
  const gridRef = useRef<number[][]>([])
  const animationRef = useRef<number>(0)
  const lastUpdateRef = useRef(0)
  const isDrawingRef = useRef(false)
  const cellSize = 8
  
  // Patterns
  const patterns = {
    glider: [
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1]
    ],
    pulsar: [
      [0,0,1,1,1,0,0,0,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [1,0,0,0,0,1,0,1,0,0,0,0,1],
      [1,0,0,0,0,1,0,1,0,0,0,0,1],
      [1,0,0,0,0,1,0,1,0,0,0,0,1],
      [0,0,1,1,1,0,0,0,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,0,0,0,1,1,1,0,0],
      [1,0,0,0,0,1,0,1,0,0,0,0,1],
      [1,0,0,0,0,1,0,1,0,0,0,0,1],
      [1,0,0,0,0,1,0,1,0,0,0,0,1],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,0,0,0,1,1,1,0,0]
    ],
    gun: [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ],
    spaceship: [
      [0,1,1,1,1],
      [1,0,0,0,1],
      [0,0,0,0,1],
      [1,0,0,1,0]
    ]
  }

  const createGrid = useCallback((cols: number, rows: number): number[][] => {
    return Array(cols).fill(null).map(() => Array(rows).fill(0))
  }, [])

  const drawGrid = useCallback((canvas: HTMLCanvasElement, grid: number[][], cols: number, rows: number) => {
    const ctx = canvas.getContext('2d')
    if (!ctx || !grid.length) return

    ctx.fillStyle = '#0c0d14'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw cells
    for (let i = 0; i < cols && i < grid.length; i++) {
      for (let j = 0; j < rows && j < (grid[i]?.length || 0); j++) {
        if (grid[i]?.[j] === 1) {
          ctx.fillStyle = 'rgba(236, 232, 224, 0.85)'
          ctx.fillRect(i * cellSize + 1, j * cellSize + 1, cellSize - 2, cellSize - 2)
        }
      }
    }
    
    // Very subtle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellSize, 0)
      ctx.lineTo(i * cellSize, canvas.height)
      ctx.stroke()
    }
    for (let j = 0; j <= rows; j++) {
      ctx.beginPath()
      ctx.moveTo(0, j * cellSize)
      ctx.lineTo(canvas.width, j * cellSize)
      ctx.stroke()
    }
  }, [cellSize])

  const countNeighbors = useCallback((grid: number[][], x: number, y: number, cols: number, rows: number): number => {
    let count = 0
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue
        
        const col = (x + i + cols) % cols
        const row = (y + j + rows) % rows
        if (grid[col] && grid[col][row]) {
          count += grid[col][row]
        }
      }
    }
    return count
  }, [])

  const nextGeneration = useCallback((grid: number[][], cols: number, rows: number): number[][] => {
    const next = createGrid(cols, rows)
    
    for (let i = 0; i < cols && i < grid.length; i++) {
      for (let j = 0; j < rows && j < (grid[i]?.length || 0); j++) {
        const neighbors = countNeighbors(grid, i, j, cols, rows)
        const state = grid[i]?.[j] || 0
        
        if (state === 0 && neighbors === 3) {
          next[i]![j] = 1
        } else if (state === 1 && (neighbors === 2 || neighbors === 3)) {
          next[i]![j] = 1
        } else {
          next[i]![j] = 0
        }
      }
    }
    
    return next
  }, [createGrid, countNeighbors])

  const updateStats = useCallback((grid: number[][]) => {
    let pop = 0
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < (grid[i]?.length || 0); j++) {
        pop += grid[i]?.[j] || 0
      }
    }
    setPopulation(pop)
  }, [])

  const randomize = useCallback((cols: number, rows: number): number[][] => {
    const grid = createGrid(cols, rows)
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        grid[i]![j] = Math.random() > 0.85 ? 1 : 0
      }
    }
    setGeneration(0)
    return grid
  }, [createGrid])

  const clear = useCallback((cols: number, rows: number): number[][] => {
    setGeneration(0)
    return createGrid(cols, rows)
  }, [createGrid])

  const placePattern = useCallback((grid: number[][], pattern: number[][], startX: number, startY: number, cols: number, rows: number): number[][] => {
    const newGrid = grid.map(row => [...row])
    for (let i = 0; i < pattern.length; i++) {
      for (let j = 0; j < (pattern[i]?.length || 0); j++) {
        const x = startX + j
        const y = startY + i
        if (x >= 0 && x < cols && y >= 0 && y < rows && newGrid[x] !== undefined) {
          newGrid[x]![y] = pattern[i]?.[j] || 0
        }
      }
    }
    return newGrid
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      
      const cols = Math.floor(canvas.width / cellSize)
      const rows = Math.floor(canvas.height / cellSize)
      
      // Only initialize with empty grid if no grid exists yet
      if (gridRef.current.length === 0) {
        gridRef.current = clear(cols, rows)
      } else {
        // Preserve existing grid when resizing
        const oldGrid = gridRef.current
        const newGrid = clear(cols, rows)
        
        // Copy existing cells to new grid (as much as fits)
        for (let i = 0; i < Math.min(cols, oldGrid.length); i++) {
          for (let j = 0; j < Math.min(rows, oldGrid[i]?.length || 0); j++) {
            if (oldGrid[i]?.[j] !== undefined) {
              newGrid[i]![j] = oldGrid[i]![j]!
            }
          }
        }
        gridRef.current = newGrid
      }
      
      updateStats(gridRef.current)
      drawGrid(canvas, gridRef.current, cols, rows)
    }

    const animate = (timestamp: number) => {
      const cols = Math.floor(canvas.width / cellSize)
      const rows = Math.floor(canvas.height / cellSize)
      
      if (isPlaying && timestamp - lastUpdateRef.current > 1000 / speed) {
        gridRef.current = nextGeneration(gridRef.current, cols, rows)
        setGeneration(prev => prev + 1)
        updateStats(gridRef.current)
        drawGrid(canvas, gridRef.current, cols, rows)
        lastUpdateRef.current = timestamp
      } else if (!isPlaying) {
        drawGrid(canvas, gridRef.current, cols, rows)
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    const drawCell = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      const x = Math.floor((clientX - rect.left) / cellSize)
      const y = Math.floor((clientY - rect.top) / cellSize)
      const cols = Math.floor(canvas.width / cellSize)
      const rows = Math.floor(canvas.height / cellSize)
      
      if (x >= 0 && x < cols && y >= 0 && y < rows && gridRef.current[x] !== undefined) {
        // Always set to 1 when drawing (don't toggle during drag)
        if (gridRef.current[x][y] !== 1) {
          gridRef.current[x][y] = 1
          updateStats(gridRef.current)
          drawGrid(canvas, gridRef.current, cols, rows)
        }
      }
    }

    const handleStart = (e: MouseEvent | TouchEvent) => {
      if (e.target !== canvas) return
      e.preventDefault()
      
      isDrawingRef.current = true
      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY
      
      if (clientX !== undefined && clientY !== undefined) {
        drawCell(clientX, clientY)
      }
    }

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current || e.target !== canvas) return
      e.preventDefault()
      
      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY
      
      if (clientX !== undefined && clientY !== undefined) {
        drawCell(clientX, clientY)
      }
    }

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      isDrawingRef.current = false
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // Mouse events
    canvas.addEventListener('mousedown', handleStart)
    canvas.addEventListener('mousemove', handleMove)
    canvas.addEventListener('mouseup', handleEnd)
    canvas.addEventListener('mouseleave', handleEnd)
    
    // Touch events
    canvas.addEventListener('touchstart', handleStart)
    canvas.addEventListener('touchmove', handleMove)
    canvas.addEventListener('touchend', handleEnd)
    canvas.addEventListener('touchcancel', handleEnd)
    
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      
      // Remove mouse events
      canvas.removeEventListener('mousedown', handleStart)
      canvas.removeEventListener('mousemove', handleMove)
      canvas.removeEventListener('mouseup', handleEnd)
      canvas.removeEventListener('mouseleave', handleEnd)
      
      // Remove touch events
      canvas.removeEventListener('touchstart', handleStart)
      canvas.removeEventListener('touchmove', handleMove)
      canvas.removeEventListener('touchend', handleEnd)
      canvas.removeEventListener('touchcancel', handleEnd)
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, speed, randomize, updateStats, drawGrid, nextGeneration, clear])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleStep = () => {
    if (!canvasRef.current) return
    const cols = Math.floor(canvasRef.current.width / cellSize)
    const rows = Math.floor(canvasRef.current.height / cellSize)
    gridRef.current = nextGeneration(gridRef.current, cols, rows)
    setGeneration(prev => prev + 1)
    updateStats(gridRef.current)
    drawGrid(canvasRef.current, gridRef.current, cols, rows)
  }

  const handleClear = () => {
    if (!canvasRef.current) return
    const cols = Math.floor(canvasRef.current.width / cellSize)
    const rows = Math.floor(canvasRef.current.height / cellSize)
    gridRef.current = clear(cols, rows)
    updateStats(gridRef.current)
    drawGrid(canvasRef.current, gridRef.current, cols, rows)
  }

  const handleRandom = () => {
    if (!canvasRef.current) return
    const cols = Math.floor(canvasRef.current.width / cellSize)
    const rows = Math.floor(canvasRef.current.height / cellSize)
    gridRef.current = randomize(cols, rows)
    updateStats(gridRef.current)
    drawGrid(canvasRef.current, gridRef.current, cols, rows)
  }

  const handlePattern = (patternName: keyof typeof patterns) => {
    if (!canvasRef.current) return
    const cols = Math.floor(canvasRef.current.width / cellSize)
    const rows = Math.floor(canvasRef.current.height / cellSize)
    const pattern = patterns[patternName]
    const startX = Math.floor(cols / 2 - (pattern[0]?.length || 0) / 2)
    const startY = Math.floor(rows / 2 - pattern.length / 2)
    gridRef.current = placePattern(gridRef.current, pattern, startX, startY, cols, rows)
    updateStats(gridRef.current)
    drawGrid(canvasRef.current, gridRef.current, cols, rows)
  }

  return (
    <div className="container mx-auto px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <div className="mb-12">
          <PageHeader
            title="Page not found"
            lead="This page doesn&apos;t exist, or it moved. While you&apos;re here, there&apos;s a Game of Life below: draw some cells and press Play."
            className="pb-8"
          />
          <Link 
            href="/" 
            className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Back to the home page
          </Link>
        </div>

        {/* Game Container */}
        <div className="relative bg-card border border-border rounded-xl overflow-hidden">
          <div 
            ref={containerRef}
            className="relative w-full h-[600px] overflow-hidden"
            style={{ touchAction: 'none' }}
          >
            <canvas 
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{ touchAction: 'none' }}
            />

            {/* Stats */}
            <div className="absolute top-4 right-4 text-right text-sm bg-background/50 px-4 py-2 rounded-lg backdrop-blur-md border border-border">
              <div>Generation: <span className="font-mono">{generation}</span></div>
              <div>Population: <span className="font-mono">{population}</span></div>
            </div>
            
            {/* Instructions */}
            <div className="absolute bottom-4 right-4 text-xs text-muted-foreground/70 bg-background/50 px-3 py-2 rounded-lg backdrop-blur-md">
              Click or drag to draw cells
            </div>
          </div>
          
          {/* Controls */}
          <div className="p-6 bg-background/50 border-t border-border backdrop-blur-md">
            <div className="flex flex-wrap gap-3 justify-center items-center">
              <button
                onClick={handlePlayPause}
                className={`px-4 py-2 rounded-full border font-medium transition-all ${
                  isPlaying 
                    ? 'bg-primary/30 border-primary text-primary-foreground' 
                    : 'bg-primary/10 border-primary/50 text-primary hover:bg-primary/20'
                }`}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              
              <button
                onClick={handleStep}
                className="px-4 py-2 bg-primary/10 border border-primary/50 text-primary rounded-full font-medium transition-all hover:bg-primary/20"
              >
                Step
              </button>
              
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-primary/10 border border-primary/50 text-primary rounded-full font-medium transition-all hover:bg-primary/20"
              >
                Clear
              </button>
              
              <button
                onClick={handleRandom}
                className="px-4 py-2 bg-primary/10 border border-primary/50 text-primary rounded-full font-medium transition-all hover:bg-primary/20"
              >
                Random
              </button>
              
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
                <span className="text-sm">Speed:</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="w-20 accent-primary"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap justify-center">
                <button
                  onClick={() => handlePattern('glider')}
                  className="px-3 py-1 text-xs bg-muted/50 border border-primary/50 text-primary rounded-full font-medium transition-all hover:bg-primary/20"
                >
                  Glider
                </button>
                <button
                  onClick={() => handlePattern('pulsar')}
                  className="px-3 py-1 text-xs bg-muted/50 border border-primary/50 text-primary rounded-full font-medium transition-all hover:bg-primary/20"
                >
                  Pulsar
                </button>
                <button
                  onClick={() => handlePattern('gun')}
                  className="px-3 py-1 text-xs bg-muted/50 border border-primary/50 text-primary rounded-full font-medium transition-all hover:bg-primary/20"
                >
                  Glider Gun
                </button>
                <button
                  onClick={() => handlePattern('spaceship')}
                  className="px-3 py-1 text-xs bg-muted/50 border border-primary/50 text-primary rounded-full font-medium transition-all hover:bg-primary/20"
                >
                  Spaceship
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}