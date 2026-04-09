import type { Metadata } from 'next/types'
import React from 'react'
import { TalksShowcase } from '@/blocks/TalksShowcase/Component'
import { getTalks } from '@/data/talks'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Talks & Presentations | Kartik Mandar - Speaking Engagements',
    description: 'Explore my speaking engagements, conference talks, workshops, and presentations on academic research, technology, and innovation.',
    openGraph: {
      title: 'Talks & Presentations - Academic and Tech Speaking',
      description: 'Discover keynotes, workshops, and presentations on cutting-edge research and technology topics.',
    },
  }
}

export default function TalksPage(): React.JSX.Element {
  const talks = getTalks()

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">

        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            Talks & Presentations
          </h1>
        </div>

        {/* TalksShowcase Block */}
        <TalksShowcase
          blockType="talksShowcase"
          title=""
          subtitle=""
          showAllTalks={true}
          layout="grid-3"
          maxTalks={1000}
          talks={talks}
        />

      </div>
    </div>
  )
}