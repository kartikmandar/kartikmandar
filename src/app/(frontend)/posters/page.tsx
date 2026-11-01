import { CardAction, ContentCard } from '@/components/ContentCard'
import { PageHeader } from '@/components/motion'
import type { Metadata } from 'next/types'
import React from 'react'
import { getCanonicalUrl, getServerSideURL } from '@/utilities/getURL'
import { generateBreadcrumbSchema } from '@/utilities/structuredData'
import {
  Calendar,
  MapPin,
  Users
} from 'lucide-react'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Posters | Kartik Mandar - Research Presentations',
    description: 'Academic posters and presentations in astrophysics, radio interferometry, and computational astronomy research.',
    alternates: { canonical: getCanonicalUrl('/posters') },
    openGraph: {
      title: 'Posters - Kartik Mandar',
      description: 'Research posters and presentations in astrophysics and radio astronomy.',
    },
  }
}

export default async function PostersPage(): Promise<React.JSX.Element> {
  const posters = [
    {
      title: "RRIVis: 21cm Visibility Simulator",
      subtitle: "21cm Visibility Simulator for Epoch of Reionization Studies",
      venue: "In-House Physics Symposium",
      location: "IISER Bhopal",
      date: "5th March, 2025",
      category: "Radio Astronomy",
      abstract: "The RRIVis 21cm Visibility Simulator is a computational tool designed to generate synthetic visibility data for radio interferometric observations of the cosmic 21cm signal during the Epoch of Reionization (EoR). This simulator addresses the need for realistic datasets to test analysis pipelines and instrumentation in the context of upcoming radio telescopes. The tool incorporates customizable parameters, including array configurations and observation frequencies, to mimic real-world observational conditions.",
      posterUrl: "https://drive.google.com/file/d/1CGS4VNEFCh-vqCNOrh8nhtb29HcaBy9V/view?usp=sharing"
    }
  ]

  // Group posters by category
  const groupedPosters = posters.reduce((acc, poster) => {
    if (!acc[poster.category]) {
      acc[poster.category] = []
    }
    acc[poster.category]!.push(poster)
    return acc
  }, {} as Record<string, typeof posters>)

  const serverUrl = getServerSideURL()
  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: 'Home', url: serverUrl },
    { name: 'Posters', url: `${serverUrl}/posters` },
  ])

  return (
    <div className="container mx-auto px-4 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-5xl mx-auto">

        <PageHeader eyebrow="Research" title="Posters" />

        {/* Posters by Category */}
        {Object.entries(groupedPosters).map(([category, categoryPosters]) => (
          <section key={category} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-display text-display-md text-foreground">{category}</h2>
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {categoryPosters.length} poster{categoryPosters.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="grid gap-6">
              {categoryPosters.map((poster, index) => (
                <ContentCard
                  key={`${category}-${index}`}
                  variant="row"
                  title={poster.title}
                  summary={poster.subtitle}
                  meta={
                    <ul className="mt-3 space-y-2">
                      <li className="flex items-start gap-2"><Users aria-hidden className="mt-0.5 size-4 flex-shrink-0" />{poster.venue}</li>
                      <li className="flex items-start gap-2"><MapPin aria-hidden className="mt-0.5 size-4 flex-shrink-0" />{poster.location}</li>
                      <li className="flex items-start gap-2"><Calendar aria-hidden className="mt-0.5 size-4 flex-shrink-0" />{poster.date}</li>
                    </ul>
                  }
                  actions={poster.posterUrl ? <CardAction href={poster.posterUrl} primary>View Poster</CardAction> : undefined}
                >
                  <div className="mt-6 border-t border-border pt-5">
                    <h4 className="mono-label mb-3 text-muted-foreground">Abstract</h4>
                    <p className="max-w-3xl leading-relaxed text-muted-foreground">{poster.abstract}</p>
                  </div>
                </ContentCard>
              ))}
            </div>
          </section>
        ))}


      </div>
    </div>
  )
}