// src/components/CosmicJourney3D/JourneyNav.tsx
'use client'

// Deep links and keyboard for the journey:
// - the URL hash follows the beat on screen (/my-story/preview#rri-research),
//   and loading a link with a hash flies straight to that beat after the loader;
// - J / → next beat, K / ← previous beat, Esc skips to the end; focus moves to
//   the beat's heading so screen readers hear where they landed;
// - a "Skip the story" link appears on keyboard focus.

import { useEffect, useState } from 'react'
import { useStore } from 'zustand'
import { BEATS } from './registry'
import { journeyFrame, journeyStore } from './store'
import { scrollToProgress } from './scrollEngine'
import { beatIndexForSlug, beatTargetProgress, slugFor } from './navigation'
import { loadStore, reportLinked } from './loader'
import { BEAT_HEADING_ID } from './Overlay'
import { COPY_IN, COPY_OUT } from './overlayView'
import { readCapture } from './capture'

/** Moves focus to the visible beat's heading without scrolling (a11y after jumps). */
export function focusBeatHeading(): void {
  // The overlay mounts the new heading a frame or two after arrival: retry briefly.
  let tries = 0
  const attempt = () => {
    const heading = document.getElementById(BEAT_HEADING_ID)
    if (heading) heading.focus({ preventScroll: true })
    else if (++tries < 60) requestAnimationFrame(attempt)
  }
  requestAnimationFrame(attempt)
}

function jumpTo(index: number): void {
  const i = Math.max(0, Math.min(BEATS.length - 1, index))
  scrollToProgress(beatTargetProgress(i), { onComplete: focusBeatHeading })
}

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))
}

export function JourneyNav() {
  const loaded = useStore(loadStore, (s) => s.done)
  const capture = readCapture().enabled
  // The hash the page was opened with, captured before anything rewrites it.
  const [initialHash] = useState(() => (typeof window !== 'undefined' ? window.location.hash : ''))
  const [linked, setLinked] = useState(false)

  // Initial deep link: once the loader is done, jump straight to the beat.
  useEffect(() => {
    if (!loaded || capture || linked) return
    const index = beatIndexForSlug(initialHash)
    if (index >= 0) scrollToProgress(beatTargetProgress(index), { immediate: true, onComplete: focusBeatHeading })
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot latch after the loader hands over
    setLinked(true)
    reportLinked() // the loader may ignite now (the story is already in place behind it)
  }, [loaded, capture, linked, initialHash])

  // Keep the hash in step with the beat whose copy is on screen (after any deep link is applied).
  useEffect(() => {
    if (capture || !linked) return
    let lastHash = window.location.hash
    const sync = () => {
      const i = journeyStore.getState().activeIndex
      const local = journeyFrame.local[i] ?? 0
      const inFlight = journeyFrame.flight > 0 && local >= COPY_IN && local <= COPY_OUT
      const hash = inFlight ? `#${slugFor(BEATS[i]!.id)}` : ''
      if (hash === lastHash) return
      lastHash = hash
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${hash}`)
    }
    const timer = window.setInterval(sync, 400) // cheap, throttled; history writes are rate-limited by browsers
    return () => window.clearInterval(timer)
  }, [capture, linked])

  // Keyboard: J/→ next, K/← previous, Esc to the end.
  useEffect(() => {
    if (capture) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return
      const inPrologue = journeyFrame.flight <= 0
      const i = journeyStore.getState().activeIndex
      if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowRight') {
        e.preventDefault()
        jumpTo(inPrologue ? 0 : i + 1)
      } else if (e.key === 'k' || e.key === 'K' || e.key === 'ArrowLeft') {
        e.preventDefault()
        if (inPrologue || i === 0) scrollToProgress(0)
        else jumpTo(i - 1)
      } else if (e.key === 'Escape') {
        jumpTo(BEATS.length - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [capture])

  return (
    <a
      href={`#${slugFor(BEATS[BEATS.length - 1]!.id)}`}
      className="journey-skip-link"
      onClick={(e) => {
        e.preventDefault()
        jumpTo(BEATS.length - 1)
      }}
    >
      Skip the story (J / K to move between chapters)
      <style>{`.journey-skip-link{position:fixed;left:16px;top:16px;z-index:30;padding:10px 14px;border-radius:6px;background:#eef2ff;color:#04050b;font:500 13px/1.2 var(--font-jetbrains-mono),ui-monospace,monospace;transform:translateY(-200%);transition:transform 160ms ease}.journey-skip-link:focus-visible{transform:translateY(0);outline:2px solid #5ee7ff;outline-offset:2px}`}</style>
    </a>
  )
}
