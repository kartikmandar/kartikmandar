'use client'

import { Component, useCallback, useEffect, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { CalmStory } from './CalmStory'
import { readCapture } from './capture'
import { LoaderView } from './LoaderView'
import { chooseView, readStoredView, storeView, type StoryView } from './storyView'
import { readJourneyEnv } from './tiers'

// dynamic(..., { ssr: false }) is only allowed inside a Client Component in
// Next.js 16 (Server Components reject it). This thin client wrapper keeps the
// heavy WebGL journey (three / R3F / postprocessing) from evaluating during
// SSR.
// The server renders the loader's first paint (title + point of light) so the
// page is never black while the 3D bundle loads; the client loader continues it.
const CosmicJourney3D = dynamic(() => import('./index'), {
  ssr: false,
  loading: () => <LoaderView progress={0.05} />,
})

/** A crash in a view, or a failed 3D download, hands over to the next simplest view. */
class StoryBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  override state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  override componentDidCatch(error: unknown) {
    console.error('This view of the story failed, switching to a simpler one.', error)
    this.props.onFail()
  }

  override render() {
    return this.state.failed ? null : this.props.children
  }
}

const VIEW_BUTTON = 'mono-label fixed bottom-7 left-6 z-[var(--z-floating)] inline-flex min-h-11 items-center rounded-full border border-border bg-background/70 px-4 text-foreground backdrop-blur transition-colors hover:border-ember hover:text-ember'

export default function CosmicJourney3DClient() {
  // Null until the browser probe runs, so the server and first paint show the loader.
  const [view, setView] = useState<StoryView | null>(null)
  const [canFly, setCanFly] = useState(false)
  const capture = readCapture()

  /* eslint-disable react-hooks/set-state-in-effect -- one-time init: reads browser APIs (matchMedia, webgl2 probe) only available after mount */
  useEffect(() => {
    const env = readJourneyEnv()
    const capable = capture.enabled || (env.webgl2 && !env.softwareRenderer)
    const requested = new URLSearchParams(window.location.search).get('view')
    setCanFly(capable)
    setView(capture.enabled ? 'flight' : chooseView({ requested, stored: readStoredView(), reducedMotion: env.reducedMotion, canFly: capable }))

    // Follow a system setting change, unless the visitor has chosen a view themselves.
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => {
      if (capture.enabled || requested || readStoredView()) return
      setView(chooseView({ requested: null, stored: null, reducedMotion: motion.matches, canFly: capable }))
    }
    motion.addEventListener('change', onChange)
    return () => motion.removeEventListener('change', onChange)
  }, [capture.enabled])
  /* eslint-enable react-hooks/set-state-in-effect */

  // globals.css shows the article in the timeline view. During the flight it stays hidden, out of the tab order.
  useEffect(() => {
    if (!view) return
    const root = document.documentElement
    const links = document.querySelectorAll<HTMLElement>('.story-article a')
    root.dataset.storyMode = view
    if (view === 'flight') links.forEach((link) => { link.tabIndex = -1 })
    if (view === 'timeline') {
      const slug = window.location.hash.slice(1)
      // Prefixed ids: a bare one would make the browser's own hash jump fight the flight's.
      const target = slug ? document.getElementById(`timeline-${slug}`) : null
      if (target) target.scrollIntoView()
      else window.scrollTo(0, 0)
    }
    return () => {
      delete root.dataset.storyMode
      links.forEach((link) => link.removeAttribute('tabindex'))
    }
  }, [view])

  const choose = useCallback((next: StoryView) => {
    storeView(next)
    setView(next)
    if (next !== 'timeline') window.scrollTo(0, 0)
  }, [])

  // Not stored: the failure may not happen next time.
  const fallFromFlight = useCallback(() => {
    setCanFly(false)
    setView('calm')
    window.scrollTo(0, 0)
  }, [])
  const fallFromCalm = useCallback(() => setView('timeline'), [])

  if (!view) return <LoaderView progress={0.05} />

  if (view === 'flight') {
    return (
      <StoryBoundary key="flight" onFail={fallFromFlight}>
        <CosmicJourney3D onAbandon={fallFromFlight} />
        {!capture.hideUi && (
          <button type="button" className={VIEW_BUTTON} onClick={() => choose('calm')}>Reduce effects</button>
        )}
      </StoryBoundary>
    )
  }

  if (view === 'calm') {
    return (
      <StoryBoundary key="calm" onFail={fallFromCalm}>
        <CalmStory canFly={canFly} onFlight={() => choose('flight')} onTimeline={() => choose('timeline')} />
      </StoryBoundary>
    )
  }

  return <button type="button" className={VIEW_BUTTON} onClick={() => choose('calm')}>One beat at a time</button>
}
