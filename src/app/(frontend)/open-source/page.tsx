import { CardAction, ContentCard } from '@/components/ContentCard'
import { PageHeader } from '@/components/motion'
import type { Metadata } from 'next/types'
import React from 'react'
import { getCanonicalUrl, getServerSideURL } from '@/utilities/getURL'
import { generateBreadcrumbSchema } from '@/utilities/structuredData'
import { OPEN_SOURCE_GROUPS } from '@/data/openSource'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Open Source & Projects | Kartik Mandar',
    description: 'RadioSim, hera_pspec, matvis, fftvis, hera_strip, Stingray Explorer, DAVE, RIPPLe, Enrolia and Merakinist Labs, with the status of each.',
    alternates: { canonical: getCanonicalUrl('/open-source') },
    openGraph: {
      title: 'Open Source & Projects',
      description: 'Research software for radio and X-ray astronomy and strong lensing, and the products I build.',
    },
  }
}

function FeatureList({ features }: { features: string[] }) {
  return (
    <div className="mt-6">
      <h4 className="mono-label mb-3 text-muted-foreground">Highlights</h4>
      <div className="grid gap-3 md:grid-cols-2">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <div className="size-1.5 flex-shrink-0 rounded-full bg-muted-foreground/60" />
            <span className="text-sm text-foreground/85">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function OpenSourcePage(): React.JSX.Element {
  const serverUrl = getServerSideURL()
  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: 'Home', url: serverUrl },
    { name: 'Open Source', url: `${serverUrl}/open-source` },
  ])

  return (
    <div className="container mx-auto px-4 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-5xl mx-auto">

        <PageHeader
          title="Open source & projects"
          lead="Research software first, then the products I build. Where my work is still waiting in a pull request, the card says so."
        />

        {OPEN_SOURCE_GROUPS.map((group) => (
          <section key={group.id} id={group.id} className="mb-16 scroll-mt-24">
            <div className="mb-8">
              <h2 className="font-display text-display-md text-foreground">{group.title}</h2>
              <p className="mt-2 text-muted-foreground">{group.lead}</p>
            </div>

            <div className="space-y-6">
              {group.projects.map((project) => (
                <ContentCard
                  key={project.name}
                  variant="row"
                  eyebrow={project.role}
                  title={project.name}
                  image={project.image}
                  meta={
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      {project.meta.map((item) => <span key={item}>{item}</span>)}
                      {project.status && <span className="text-ember">{project.status}</span>}
                    </div>
                  }
                  summary={<p className="text-base">{project.summary}</p>}
                  tags={project.tags}
                  actions={project.links.map((link, index) => (
                    <CardAction key={link.href} href={link.href} primary={index === 0} external={link.href.startsWith('https://')}>{link.label}</CardAction>
                  ))}
                >
                  {project.highlights.length > 0 && <FeatureList features={project.highlights} />}
                </ContentCard>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
