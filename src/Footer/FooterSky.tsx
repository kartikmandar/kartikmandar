'use client'

import { useEffect, useRef } from 'react'

/** The footer's twinkling stars and meteors. The meteors only fly while the footer is on screen. */
export function FooterSky() {
  const starsContainerRef = useRef<HTMLDivElement>(null)
  const shootingStarsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = starsContainerRef.current
    if (!container) return
    const starCount = 150

    container.innerHTML = ''

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div')
      star.className = 'star'

      // Random size between 1px and 3px
      const size = Math.random() * 2 + 1
      star.style.width = `${size}px`
      star.style.height = `${size}px`

      star.style.left = `${Math.random() * 100}%`
      star.style.top = `${Math.random() * 100}%`

      star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`)
      star.style.animationDelay = `${Math.random() * 5}s`

      container.appendChild(star)
    }
  }, [])

  useEffect(() => {
    const container = shootingStarsRef.current
    if (!container) return
    // Respect reduced motion: the static starfield stays, the meteors don't fly.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Every pending timer is tracked so leaving the screen or unmounting stops the loop.
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const later = (callback: () => void, delayMs: number) => {
      const id = setTimeout(() => {
        timers.delete(id)
        callback()
      }, delayMs)
      timers.add(id)
    }
    const stopLoop = () => {
      for (const id of timers) clearTimeout(id)
      timers.clear()
      container.innerHTML = ''
    }

    function createShootingStar() {
      if (!container) return
      const shootingStar = document.createElement('div')
      shootingStar.className = 'shooting-star'

      // Start from the right side or beyond, mostly in the top half
      shootingStar.style.left = `${Math.random() * 100 + 50}%`
      shootingStar.style.top = `${Math.random() * 50}%`
      shootingStar.style.width = `${Math.random() * 80 + 80}px`

      // Random duration between 0.8 and 1.5 seconds
      const duration = Math.random() * 0.7 + 0.8
      shootingStar.style.animationDuration = `${duration}s`

      container.appendChild(shootingStar)
      later(() => shootingStar.remove(), duration * 1000)
    }

    function shootingStarLoop() {
      // Two to four shooting stars per batch
      const count = Math.floor(Math.random() * 3) + 2
      for (let i = 0; i < count; i++) later(createShootingStar, i * 300)

      // Next batch in 0.8 to 2.8 seconds
      later(shootingStarLoop, Math.random() * 2000 + 800)
    }

    const observer = new IntersectionObserver(([entry]) => {
      stopLoop()
      if (entry?.isIntersecting) shootingStarLoop()
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
      stopLoop()
    }
  }, [])

  return (
    <>
      <div className="stars-container" ref={starsContainerRef}></div>
      <div className="shooting-stars-container" ref={shootingStarsRef}></div>
    </>
  )
}
