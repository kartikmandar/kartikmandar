import { PageHeader } from '@/components/motion'
import type { Metadata } from 'next/types'
import React from 'react'
import { getCanonicalUrl, getServerSideURL } from '@/utilities/getURL'
import { generateBreadcrumbSchema } from '@/utilities/structuredData'
import { getTalks } from '@/data/talks'
import { CardAction, ContentCard } from '@/components/ContentCard'
import { CV_SECTIONS_AFTER } from '@/data/cv'

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
      timeZone: 'UTC',
    })
  } catch {
    return 'TBD'
  }
}

export default function TalksPage(): React.JSX.Element {
  const talks = getTalks()
  const meetings = CV_SECTIONS_AFTER.find((section) => section.id === 'schools')?.entries ?? []
  const serverUrl = getServerSideURL()
  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: 'Home', url: serverUrl },
    { name: 'Talks', url: `${serverUrl}/talks` },
  ])

  return (
    <div className="container mx-auto px-4 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-5xl mx-auto">

        <PageHeader eyebrow="Talks & Teaching" title="Talks & Presentations" />

        <div className="space-y-6">
          {talks.map((talk) => {
            const coverImage = typeof talk.coverImage === 'object' ? talk.coverImage : undefined
            const materialsUrl = talk.materials?.gDriveFolderUrl || null
            const venue = talk.eventDetails?.venue
            const city = talk.eventDetails?.city
            const country = talk.eventDetails?.country
            // Venues often carry the city already ("IISER Bhopal"), so don't repeat it.
            const location = [venue, city && !venue?.includes(city) ? city : null, country].filter(Boolean).join(', ')
            const topics = talk.topics?.map(t => t.topic) || []
            const technologies = talk.technologies?.map(t => t.technology) || []
            const tags = [...new Set([...topics, ...technologies])]
            const status = talk.scheduling?.talkStatus

            return (
              <ContentCard
                key={talk.id}
                variant="row"
                titleAs="h2"
                title={talk.title}
                eyebrow={talk.presentedBy ? `Presented by ${talk.presentedBy}` : status ? status.charAt(0).toUpperCase() + status.slice(1) : undefined}
                image={coverImage?.url ? { src: coverImage.url, alt: coverImage.alt || talk.title } : undefined}
                meta={
                  <>
                    <p>{talk.eventDetails?.eventName}</p>
                    <p>
                      {formatDate(talk.scheduling?.talkDate)}
                      {location && ` — ${location}`}
                    </p>
                  </>
                }
                summary={<p className="line-clamp-3">{talk.shortDescription || talk.abstract}</p>}
                tags={tags}
                actions={materialsUrl ? <CardAction href={materialsUrl}>View materials</CardAction> : undefined}
              />
            )
          })}
        </div>

        <section className="mt-16">
          <h2 className="font-display text-display-md text-foreground">Schools & meetings attended</h2>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {meetings.map((meeting) => (
              <li key={meeting.title} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6">
                <div>
                  <p className="text-foreground">{meeting.title}</p>
                  <p className="text-sm text-muted-foreground">{meeting.organisation}</p>
                </div>
                <p className="text-sm text-muted-foreground">{meeting.dates}</p>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  )
}
