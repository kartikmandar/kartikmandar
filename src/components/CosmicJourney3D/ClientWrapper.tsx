'use client'

import dynamic from 'next/dynamic'

// dynamic(..., { ssr: false }) is only allowed inside a Client Component in
// Next.js 16 (Server Components reject it). This thin client wrapper keeps the
// heavy WebGL journey (three / R3F / postprocessing) from evaluating during
// SSR, mirroring src/components/QuasarBackground/ClientWrapper.tsx.
const CosmicJourney3D = dynamic(() => import('./index'), { ssr: false })

export default function CosmicJourney3DClient() {
  return <CosmicJourney3D />
}
