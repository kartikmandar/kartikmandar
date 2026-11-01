'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/utilities/ui'

const POSTER = '/media/home/blackhole-poster.avif'
const LOOP = '/media/home/blackhole-loop.mp4'

/**
 * The hero backdrop: a poster (the LCP element) with the pre-rendered black
 * hole loop fading in over it. The video only loads after hydration, stays off
 * under reduced motion or data saver, and pauses while off screen.
 */
export function HeroLoop({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (connection?.saveData) return

    video.src = LOOP
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) video.play().catch(() => {})
      else video.pause()
    })
    observer.observe(video)
    return () => {
      observer.disconnect()
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }, [])

  return (
    <div aria-hidden className={cn('absolute inset-0', className)}>
      <Image src={POSTER} alt="" fill priority unoptimized sizes="100vw" className="object-cover" />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="auto"
        onPlaying={() => setPlaying(true)}
        className={cn('absolute inset-0 size-full object-cover transition-opacity duration-1000', playing ? 'opacity-100' : 'opacity-0')}
      />
    </div>
  )
}
