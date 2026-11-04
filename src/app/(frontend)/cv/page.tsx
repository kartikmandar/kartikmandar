import type { Metadata } from 'next/types'
import React from 'react'
import { CardAction } from '@/components/ContentCard'
import { CvRail } from '@/components/CV/CvRail'
import { PrintButton } from '@/components/CV/PrintButton'
import { PageHeader } from '@/components/motion'
import { Authors } from '@/components/Publications/Authors'
import { CONTACT_EMAIL } from '@/constants/navigation'
import {
  CV_NAV, CV_RESEARCH_INTERESTS, CV_SECTIONS_AFTER, CV_SECTIONS_BEFORE, CV_SKILLS,
  type CvEntry, type CvSection,
} from '@/data/cv'
import { PUBLICATIONS, citationLine } from '@/data/publications'
import { getCanonicalUrl, getServerSideURL } from '@/utilities/getURL'
import { generateBreadcrumbSchema } from '@/utilities/structuredData'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'CV | Kartik Mandar',
    description: 'Academic and professional curriculum vitae of Kartik Mandar.',
    alternates: { canonical: getCanonicalUrl('/cv') },
    openGraph: {
      title: 'CV - Kartik Mandar',
      description: 'Academic and professional curriculum vitae.',
    },
  }
}

function SectionShell({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border pt-6 pb-12 print:pb-5 print:pt-3">
      <h2 className="font-display text-display-md mb-6 text-foreground print:mb-2 print:text-2xl">{label}</h2>
      {children}
    </section>
  )
}

function Entry({ entry }: { entry: CvEntry }) {
  const { title, organisation, place, dates, people, points, href } = entry
  const subtitle = [organisation, place].filter(Boolean).join(', ')
  return (
    <li className="break-inside-avoid">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6">
        <h3 className="text-base font-medium text-foreground">{title}</h3>
        {dates && <p className="mono-label whitespace-nowrap text-muted-foreground">{dates}</p>}
      </div>
      {subtitle && (
        <p className="mt-0.5 text-sm text-muted-foreground">
          {href
            ? <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 transition-colors hover:text-ember">{subtitle}</a>
            : subtitle}
        </p>
      )}
      {people && <p className="mt-0.5 text-sm text-muted-foreground">With {people}</p>}
      {points && (
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-foreground/80 marker:text-ember">
          {points.map((point) => <li key={point}>{point}</li>)}
        </ul>
      )}
    </li>
  )
}

function Section({ section }: { section: CvSection }) {
  return (
    <SectionShell id={section.id} label={section.label}>
      <ul className="space-y-6 print:space-y-3">
        {section.entries.map((entry) => <Entry key={`${entry.title}-${entry.organisation ?? ''}`} entry={entry} />)}
      </ul>
    </SectionShell>
  )
}

export default function CvPage() {
  const serverUrl = getServerSideURL()
  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: 'Home', url: serverUrl },
    { name: 'CV', url: `${serverUrl}/cv` },
  ])

  return (
    <div className="container mx-auto px-4 pb-20 print:p-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="cv-print mx-auto max-w-5xl">
        <div className="print:hidden">
          <PageHeader title="CV" lead={CV_RESEARCH_INTERESTS}>
            <div className="mt-6 flex flex-wrap gap-2">
              <PrintButton />
              <CardAction href="https://drive.google.com/file/d/1Mt1mdXwKkwagocNu4DYbXNjDmA006zvA/view?usp=sharing">Academic CV</CardAction>
              <CardAction href="https://drive.google.com/file/d/15PZLNWHPzwWEzjf4GhA3WJhXWlJXqkXg/view?usp=sharing">Professional CV</CardAction>
            </div>
          </PageHeader>
        </div>

        <header className="mb-4 hidden print:block">
          <p className="font-display text-4xl text-foreground">Kartik Mandar</p>
          <p className="mt-1 text-sm text-muted-foreground">{CONTACT_EMAIL} · kartikmandar.com · Catania, Italy</p>
          <p className="mt-2 text-sm text-foreground/80">{CV_RESEARCH_INTERESTS}</p>
        </header>

        <div className="grid gap-10 md:grid-cols-[11rem_minmax(0,1fr)] print:block">
          <CvRail sections={CV_NAV} />
          <div className="min-w-0">
            {CV_SECTIONS_BEFORE.map((section) => <Section key={section.id} section={section} />)}

            <SectionShell id="publications" label="Publications">
              <ol className="space-y-6 print:space-y-3">
                {PUBLICATIONS.map((publication) => (
                  <li key={publication.id} className="break-inside-avoid">
                    <h3 className="text-base font-medium text-foreground">
                      <a href={`https://arxiv.org/abs/${publication.arxiv}`} target="_blank" rel="noopener noreferrer" className="underline-offset-4 transition-colors hover:text-ember hover:underline">
                        {publication.title}
                      </a>
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground"><Authors authors={publication.authors} /></p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{citationLine(publication)} · arXiv:{publication.arxiv}</p>
                  </li>
                ))}
              </ol>
            </SectionShell>

            {CV_SECTIONS_AFTER.map((section) => <Section key={section.id} section={section} />)}

            <SectionShell id="skills" label="Skills">
              <dl className="space-y-3 print:space-y-1">
                {CV_SKILLS.map(({ label, items }) => (
                  <div key={label} className="grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
                    <dt className="text-sm font-medium text-foreground">{label}</dt>
                    <dd className="text-sm text-muted-foreground">{items}</dd>
                  </div>
                ))}
              </dl>
            </SectionShell>
          </div>
        </div>
      </div>
    </div>
  )
}
