'use client'

// The slim top bar: the name on the left, search (Cmd-K) and the menu on the
// right. It tucks away while reading down a page and returns on the way up.
// Inside the story flight only the two buttons remain, so the HUD keeps its corner.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Magnetic } from '@/components/motion'
import { isStoryFlight } from '@/lib/motion'
import { cn } from '@/utilities/ui'
import { useChromeStore } from './chromeStore'

/** Scroll distance before the bar may hide, and the dead-band that avoids jitter. */
const HIDE_AFTER = 160
const DEAD_BAND = 6

export function TopBar() {
  const pathname = usePathname()
  const journey = isStoryFlight(pathname)
  const overlay = useChromeStore((state) => state.overlay)
  const toggle = useChromeStore((state) => state.toggle)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    lastY.current = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY.current
      setScrolled(y > 24)
      if (Math.abs(delta) > DEAD_BAND) {
        setHidden(delta > 0 && y > HIDE_AFTER)
        lastY.current = y
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  const menuOpen = overlay === 'menu'
  const tucked = hidden && !menuOpen && !journey

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-[var(--z-chrome)] transition-transform duration-500 ease-out-expo',
        // Keyboard focus brings a tucked bar back, so nobody tabs through hidden links.
        tucked && '-translate-y-full focus-within:translate-y-0',
      )}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 h-28 bg-gradient-to-b from-background-deep/85 to-transparent transition-opacity duration-500',
          scrolled && !journey ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div className="relative flex h-16 items-center justify-between gap-4 px-4 md:h-20 md:px-8">
        {journey ? (
          <span />
        ) : (
          <Link href="/" className="group flex items-baseline gap-3 rounded-sm" aria-label="Kartik Mandar, home">
            <span className="font-display text-[1.65rem] leading-none tracking-[-0.01em] text-foreground md:text-[1.9rem]">
              Kartik Mandar
            </span>
            <span className="mono-label hidden text-muted-foreground transition-colors group-hover:text-foreground lg:inline">
              Astrophysics · Software
            </span>
          </Link>
        )}

        <div className="flex items-center gap-2">
          <Magnetic>
            <button
              type="button"
              onClick={() => toggle('command')}
              className="glass flex h-10 items-center gap-2 rounded-full px-3 text-sm text-foreground/85 transition-colors hover:text-foreground md:px-4"
              aria-label="Search and commands"
              aria-keyshortcuts="Meta+K Control+K"
            >
              <svg aria-hidden width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <span className="mono-label hidden text-muted-foreground md:inline">⌘K</span>
            </button>
          </Magnetic>
          <Magnetic>
            <button
              type="button"
              onClick={() => toggle('menu')}
              className="glass flex h-10 items-center gap-3 rounded-full pl-4 pr-3 text-foreground/90 transition-colors hover:text-foreground"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
            >
              <span className="mono-label">Menu</span>
              <span aria-hidden className="relative block h-3 w-4">
                <span className="absolute left-0 top-0.5 h-px w-4 bg-current" />
                <span className="absolute bottom-0.5 left-0 h-px w-4 bg-current" />
              </span>
            </button>
          </Magnetic>
        </div>
      </div>
    </header>
  )
}
