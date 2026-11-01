import type { Metadata } from 'next/types'
import React from 'react'
import { CardAction, ContentCard } from '@/components/ContentCard'
import { SOCIAL_LINKS } from '@/constants/navigation'
import { PageHeader } from '@/components/motion'
import { CopyBibtex } from '@/components/Publications/CopyBibtex'
import { PublicationList } from '@/components/Publications/PublicationList'
import { PUBLICATIONS, PUBLICATION_TOPICS, citationLine, toBibtex, type Publication } from '@/data/publications'
import { getCanonicalUrl, getServerSideURL } from '@/utilities/getURL'
import { generateBreadcrumbSchema } from '@/utilities/structuredData'

export const dynamic = 'force-static'

const PROFILE_LINKS = SOCIAL_LINKS.filter((link) => link.label === 'Scholar' || link.label === 'ORCID')

function Authors({ authors }: { authors: Publication['authors'] }) {
  return (
    <p>
      {authors.map(({ first, last }, index) => {
        const name = `${first} ${last}`
        return (
          <React.Fragment key={name}>
            {index > 0 && ', '}
            {last === 'Mandar' ? <strong className="font-medium text-foreground">{name}</strong> : name}
          </React.Fragment>
        )
      })}
    </p>
  )
}

export default function PublicationsPage(): React.JSX.Element {
  const serverUrl = getServerSideURL()
  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: 'Home', url: serverUrl },
    { name: 'Publications', url: `${serverUrl}/publications` },
  ])

  return (
    <div className="container mx-auto px-4 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mx-auto max-w-5xl">
        <PageHeader eyebrow="Research" title="Publications">
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {PROFILE_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline underline-offset-4 transition-colors hover:text-ember">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </PageHeader>

        <PublicationList
          topics={PUBLICATION_TOPICS}
          entries={PUBLICATIONS.map((publication) => ({
            id: publication.id,
            year: publication.year,
            topic: publication.topic,
            card: (
              <ContentCard
                variant="row"
                eyebrow={citationLine(publication)}
                title={publication.title}
                meta={<Authors authors={publication.authors} />}
                summary={publication.summary}
                actions={
                  <>
                    {publication.journal && (
                      <CardAction href={`https://doi.org/${publication.journal.doi}`} primary>Journal</CardAction>
                    )}
                    <CardAction href={`https://arxiv.org/abs/${publication.arxiv}`} primary={!publication.journal}>arXiv</CardAction>
                    <CopyBibtex bibtex={toBibtex(publication)} />
                  </>
                }
              />
            ),
          }))}
        />
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Publications | Kartik Mandar',
    description: 'Papers on 21-cm cosmology and black hole X-ray binaries, with citations, arXiv links and BibTeX.',
    alternates: { canonical: getCanonicalUrl('/publications') },
  }
}
