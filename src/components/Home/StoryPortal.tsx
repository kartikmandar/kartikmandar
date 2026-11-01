'use client'

import { useState, type MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Magnetic } from '@/components/motion'
import { EASE_IN_OUT } from '@/lib/motion'

/** The new flight's route until the Phase 7 cutover moves it to /my-story. */
const STORY_URL = '/my-story/preview'
const WIPE_SECONDS = 0.6

/**
 * "Enter the story": a photon-ring link. Clicking it opens a dark circle from
 * the pointer that fills the screen, then navigates. Modified clicks and
 * reduced motion take the plain link.
 */
export function StoryPortal() {
  const router = useRouter()
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null)

  const enter = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    event.preventDefault()
    setOrigin({ x: event.clientX, y: event.clientY })
  }

  return (
    <>
      <Magnetic>
        <Link href={STORY_URL} onClick={enter} className="group inline-flex min-h-14 items-center gap-4 rounded-full pr-2 text-foreground">
          <span aria-hidden className="relative grid size-14 place-items-center">
            <span className="absolute inset-0 animate-[spin_9s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,var(--ember),transparent_35%,var(--ember)_70%,transparent)] opacity-90 blur-[1px] transition-transform duration-500 group-hover:scale-110" />
            <span className="absolute inset-[3px] rounded-full bg-background-deep" />
            <span className="relative size-1.5 rounded-full bg-ember transition-transform duration-500 group-hover:scale-[2.5]" />
          </span>
          <span className="font-display text-2xl italic md:text-3xl">Enter the story</span>
        </Link>
      </Magnetic>
      {origin && (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-[var(--z-menu)] bg-background-deep"
          initial={{ clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` }}
          animate={{ clipPath: `circle(150vmax at ${origin.x}px ${origin.y}px)` }}
          transition={{ duration: WIPE_SECONDS, ease: EASE_IN_OUT }}
          onAnimationComplete={() => router.push(STORY_URL)}
        />
      )}
    </>
  )
}
