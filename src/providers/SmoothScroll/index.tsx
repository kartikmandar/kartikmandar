'use client'

// The site's inertial scroll. One Lenis instance smooths the native document
// scroll, so anchors, find-in-page, keyboard scrolling and assistive tech keep
// working. It stands down on the story flight (which runs its own scroll clock)
// and entirely under prefers-reduced-motion.

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import { isStoryFlight } from '@/lib/motion'
import { isScrollLocked, onScrollLockChange } from '@/lib/scrollLock'

let siteLenis: Lenis | null = null
let navigatedByHistory = false

/** The running site Lenis, or null (reduced motion, or the story flight). */
export function getSiteLenis(): Lenis | null {
  return siteLenis
}

/** Scrolls the page smoothly when Lenis runs, natively otherwise. */
export function scrollPageTo(target: number | HTMLElement, options: { immediate?: boolean; offset?: number } = {}): void {
  const { immediate = false, offset = 0 } = options
  if (siteLenis) {
    siteLenis.scrollTo(target, { immediate, offset, force: true })
    return
  }
  const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: top + offset, behavior: immediate || reduced ? 'auto' : 'smooth' })
}

/** Height of the fixed top bar, so anchored headings land below it. */
const ANCHOR_OFFSET = -88

function hashTarget(): HTMLElement | null {
  const hash = window.location.hash.slice(1)
  if (!hash) return null
  try {
    return document.getElementById(decodeURIComponent(hash))
  } catch {
    return null
  }
}

export function SmoothScroll() {
  const pathname = usePathname()
  const owned = isStoryFlight(pathname)

  // Page locking (menu, Cmd-K): stop Lenis and the native scroll together.
  useEffect(() => {
    const apply = (locked: boolean) => {
      const root = document.documentElement
      if (locked) {
        siteLenis?.stop()
        root.style.overflow = 'hidden'
      } else {
        siteLenis?.start()
        root.style.overflow = ''
      }
    }
    apply(isScrollLocked())
    return onScrollLockChange(apply)
  }, [])

  useEffect(() => {
    if (owned) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.1,
      anchors: { offset: ANCHOR_OFFSET },
    })
    siteLenis = lenis
    if (isScrollLocked()) lenis.stop()

    return () => {
      if (siteLenis === lenis) siteLenis = null
      lenis.destroy()
    }
  }, [owned])

  // Route changes: back/forward keeps the browser's restored position; a fresh
  // navigation to a hash lands its target below the top bar.
  useEffect(() => {
    const onPop = () => {
      navigatedByHistory = true
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (owned) return
    if (navigatedByHistory) {
      navigatedByHistory = false
      return
    }
    const frame = requestAnimationFrame(() => {
      const target = hashTarget()
      if (target) scrollPageTo(target, { immediate: true, offset: ANCHOR_OFFSET })
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, owned])

  return null
}
