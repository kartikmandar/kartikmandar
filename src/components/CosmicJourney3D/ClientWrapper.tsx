'use client'

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

export default function CosmicJourney3DClient() {
  return <CosmicJourney3D />
}
