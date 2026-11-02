import type { Metadata } from 'next/types'
import React from 'react'
import PageClient from '@/components/PageClient'
import QuasarBackgroundWrapper from '@/components/QuasarBackground/ClientWrapper'
import { CosmicJourney } from '@/blocks/CosmicJourney/Component'
import { getCanonicalUrl } from '@/utilities/getURL'

export const dynamic = 'force-static'

// The previous story page, kept for one release after the cutover. /my-story?legacy redirects here.
export const metadata: Metadata = {
  title: 'My Story (Previous Version) - Kartik Mandar',
  description: 'Journey through my cosmic story - from fascination with astrophysics to software development. Explore the universe that shaped my perspective.',
  alternates: { canonical: getCanonicalUrl('/my-story') },
  robots: { index: false, follow: false },
}

export default function MyStoryLegacyPage() {
  return (
    <>
      <PageClient />

      {/* Quasar background - 80% viewport height for immersive experience */}
      <div className="w-full" style={{ height: '80vh' }}>
        <QuasarBackgroundWrapper height="100%" />
      </div>

      <article className="-mb-2">
        {/* Cosmic Journey Component */}
        <CosmicJourney
          blockType="cosmicJourney"
          blockName="My Cosmic Journey"
        />
      </article>
    </>
  )
}
