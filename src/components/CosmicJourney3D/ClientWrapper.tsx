'use client'

import { Component, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { LoaderView } from './LoaderView'

// dynamic(..., { ssr: false }) is only allowed inside a Client Component in
// Next.js 16 (Server Components reject it). This thin client wrapper keeps the
// heavy WebGL journey (three / R3F / postprocessing) from evaluating during
// SSR, mirroring src/components/QuasarBackground/ClientWrapper.tsx.
// The server renders the loader's first paint (title + point of light) so the
// page is never black while the 3D bundle loads; the client loader continues it.
const CosmicJourney3D = dynamic(() => import('./index'), {
  ssr: false,
  loading: () => <LoaderView progress={0.05} />,
})

/** A crash in the flight, or a failed 3D download, reveals the HTML article instead. */
class StoryBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  override componentDidCatch(error: unknown) {
    console.error('The 3D story failed, showing the article instead.', error)
    document.documentElement.dataset.storyMode = 'static'
    window.scrollTo(0, 0)
  }

  override componentWillUnmount() {
    delete document.documentElement.dataset.storyMode
  }

  override render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function CosmicJourney3DClient() {
  return (
    <StoryBoundary>
      <CosmicJourney3D />
    </StoryBoundary>
  )
}
