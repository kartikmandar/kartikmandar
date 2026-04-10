import type { Metadata } from 'next/types'
import React from 'react'
import { getCanonicalUrl, getServerSideURL } from '@/utilities/getURL'
import { generateBreadcrumbSchema } from '@/utilities/structuredData'
import { getTalks } from '@/data/talks'
import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/data/types'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Talks & Presentations | Kartik Mandar',
    description: 'Talks and presentations on astrophysics, radio interferometry, and open source software.',
    alternates: { canonical: getCanonicalUrl('/talks') },
    openGraph: {
      title: 'Talks & Presentations - Kartik Mandar',
      description: 'Talks and presentations on astrophysics, radio interferometry, and open source software.',
    },
  }
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return 'TBD'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return 'TBD'
  }
}

export default function TalksPage(): React.JSX.Element {
  const talks = getTalks()
  const serverUrl = getServerSideURL()
  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: 'Home', url: serverUrl },
    { name: 'Talks', url: `${serverUrl}/talks` },
  ])

  return (
    <div className="container mx-auto px-4 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            Talks & Presentations
          </h1>
        </div>

        <div className="space-y-10">
          {talks.map((talk) => {
            const coverImage = typeof talk.coverImage === 'number' ? undefined : talk.coverImage
            const materialsUrl = talk.materials?.gDriveFolderUrl || null
            const venue = talk.eventDetails?.venue
            const city = talk.eventDetails?.city
            const country = talk.eventDetails?.country
            const location = [venue, city, country].filter(Boolean).join(', ')
            const topics = talk.topics?.map(t => t.topic) || []
            const technologies = talk.technologies?.map(t => t.technology) || []
            const tags = [...topics, ...technologies]

            return (
              <div key={talk.id} className="flex flex-col sm:flex-row gap-6 border-b border-border pb-10 last:border-0">
                {coverImage && (
                  <div className="flex-shrink-0 w-full sm:w-48 h-48 overflow-hidden rounded-lg">
                    <Media
                      resource={coverImage as MediaType}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-foreground mb-2">{talk.title}</h2>

                  <p className="text-sm text-muted-foreground mb-1">
                    {talk.eventDetails?.eventName}
                  </p>

                  <p className="text-sm text-muted-foreground mb-1">
                    {formatDate(talk.scheduling?.talkDate)}
                    {location && ` — ${location}`}
                  </p>

                  {talk.scheduling?.talkStatus && (
                    <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-3 bg-muted text-muted-foreground">
                      {talk.scheduling.talkStatus.charAt(0).toUpperCase() + talk.scheduling.talkStatus.slice(1)}
                    </span>
                  )}

                  <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                    {talk.shortDescription || talk.abstract}
                  </p>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {materialsUrl && (
                    <a
                      href={materialsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline underline-offset-2"
                    >
                      View materials
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
