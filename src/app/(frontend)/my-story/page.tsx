import type { Metadata } from 'next/types'
import React from 'react'
import PageClient from '../[slug]/page.client'
import QuasarBackgroundWrapper from '@/components/QuasarBackground/ClientWrapper'
import { CosmicJourney } from '@/blocks/CosmicJourney/Component'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'My Story - Kartik Mandar',
    description: 'Journey through my cosmic story - from fascination with astrophysics to software development. Explore the universe that shaped my perspective.',
  }
}

export default function MyStoryPage() {
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