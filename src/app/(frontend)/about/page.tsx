import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next/types'
import React from 'react'
import { ArrowUpRight } from 'lucide-react'
import { PageHeader } from '@/components/motion'
import {
  ABOUT_PHOTOS,
  ABOUT_SECTIONS,
  CERTIFICATE_GROUPS,
  COURSE_GROUPS,
  HOBBIES,
  JOURNAL_CLUB_FORMAT,
  JOURNAL_CLUB_TALKS,
  type AboutItem,
  type AboutPhoto,
} from '@/data/about'
import { getCanonicalUrl, getServerSideURL } from '@/utilities/getURL'
import { generateBreadcrumbSchema } from '@/utilities/structuredData'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'About | Kartik Mandar',
    description: 'Running, calisthenics, cycling and treks, the IISER Bhopal Astrophysics Journal Club, certificates and coursework.',
    alternates: { canonical: getCanonicalUrl('/about') },
    openGraph: {
      title: 'About - Kartik Mandar',
      description: 'Life outside research, the journal club, certificates and coursework.',
    },
  }
}

function Section({ id, title, lead, children }: { id: string; title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-20 scroll-mt-24">
      <h2 className="font-display text-display-md text-foreground">{title}</h2>
      {lead && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{lead}</p>}
      <div className="mt-8">{children}</div>
    </section>
  )
}

function ItemGrid({ items }: { items: AboutItem[] }) {
  return (
    <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.title} className="border-t border-border pt-4">
          <dt className="font-display text-2xl text-foreground">{item.title}</dt>
          <dd className="mt-1 text-muted-foreground">{item.description}</dd>
        </div>
      ))}
    </dl>
  )
}

function PhotoFrame({ photo }: { photo: AboutPhoto }) {
  return (
    <figure>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-dashed border-border">
        {photo.src ? (
          <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center p-4 text-center">
            <span className="mono-label text-muted-foreground">Photo to come: {photo.label}</span>
          </div>
        )}
      </div>
      <figcaption className="mt-2 text-sm text-muted-foreground">{photo.caption}</figcaption>
    </figure>
  )
}

function LinkOut({ href, children }: { href: string; children: React.ReactNode }) {
  const className = 'inline-flex items-center gap-1 text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-ember hover:decoration-ember'
  if (href.startsWith('/')) return <Link href={href} className={className}>{children}</Link>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <ArrowUpRight aria-hidden className="size-3.5 flex-shrink-0" />
    </a>
  )
}

/** A long list that stays folded until asked for. Native, so it needs no JavaScript and find-in-page opens it. */
function Fold({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  return (
    <details className="group border-t border-border last:border-b">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="font-display text-2xl text-foreground">{label}</span>
        <span className="flex items-center gap-3 text-sm text-muted-foreground">
          {count}
          <span aria-hidden className="text-lg leading-none transition-transform group-open:rotate-45">+</span>
        </span>
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  )
}

export default function AboutPage(): React.JSX.Element {
  const serverUrl = getServerSideURL()
  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: 'Home', url: serverUrl },
    { name: 'About', url: `${serverUrl}/about` },
  ])

  return (
    <div className="container mx-auto px-4 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mx-auto max-w-5xl">

        <PageHeader
          eyebrow="About"
          title="The rest of it"
          lead="What I do away from the desk, the journal club I started, and the coursework and certificates behind the research."
        />

        <nav aria-label="On this page" className="mb-16 flex flex-wrap gap-2">
          {ABOUT_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="mono-label inline-flex min-h-9 items-center rounded-full border border-border px-3.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {section.label}
            </a>
          ))}
        </nav>

        <Section id="outside-research" title="Outside research">
          <ItemGrid items={HOBBIES} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {ABOUT_PHOTOS.map((photo) => <PhotoFrame key={photo.label} photo={photo} />)}
          </div>
        </Section>

        <Section
          id="journal-club"
          title="Astrophysics Journal Club"
          lead="I founded the journal club at IISER Bhopal so that undergraduates, researchers and astronomy enthusiasts could read new papers together and practise explaining them."
        >
          <ItemGrid items={JOURNAL_CLUB_FORMAT} />
          <h3 className="mono-label mb-2 mt-12 text-muted-foreground">Presentations from 2025</h3>
          <ul className="divide-y divide-border border-y border-border">
            {JOURNAL_CLUB_TALKS.map((talk) => (
              <li key={talk.title} className="py-4">
                <LinkOut href={talk.href}>{talk.title}</LinkOut>
                <p className="mt-1 text-sm text-muted-foreground">
                  {talk.presenter}, {talk.date}{talk.note && ` (${talk.note.toLowerCase()})`}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="certificates" title="Certificates">
          {CERTIFICATE_GROUPS.map((group) => (
            <Fold key={group.label} label={group.label} count={group.items.length}>
              <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
                {group.items.map((certificate) => (
                  <li key={certificate.href}>
                    <LinkOut href={certificate.href}>{certificate.title}</LinkOut>
                    {certificate.issuer && <p className="mt-0.5 text-sm text-muted-foreground">{certificate.issuer}</p>}
                  </li>
                ))}
              </ul>
            </Fold>
          ))}
        </Section>

        <Section id="courses" title="Courses" lead="My undergraduate coursework at IISER Bhopal.">
          {COURSE_GROUPS.map((group) => (
            <Fold key={group.label} label={group.label} count={group.items.length}>
              <ul className="grid gap-x-10 gap-y-2 sm:grid-cols-2">
                {group.items.map((course) => (
                  <li key={course.title} className="flex items-baseline justify-between gap-4 text-sm">
                    {course.href ? <LinkOut href={course.href}>{course.title}</LinkOut> : <span className="text-foreground/85">{course.title}</span>}
                    <span className="flex-shrink-0 text-muted-foreground">{course.credits} cr</span>
                  </li>
                ))}
              </ul>
            </Fold>
          ))}
        </Section>

      </div>
    </div>
  )
}
