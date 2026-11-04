import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { PageHeader } from '@/components/motion'
import type { Metadata } from 'next/types'
import React from 'react'
import { CONTACT_EMAIL, SOCIAL_LINKS } from '@/constants/navigation'
import { getCanonicalUrl, getServerSideURL } from '@/utilities/getURL'
import { generateBreadcrumbSchema } from '@/utilities/structuredData'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Contact | Kartik Mandar',
    description: 'Get in touch with Kartik Mandar for research collaborations, academic discussions, or consultancy.',
    alternates: { canonical: getCanonicalUrl('/contact') },
    openGraph: {
      title: 'Contact Kartik Mandar',
      description: 'Connect for astrophysics research collaborations and academic discussions.',
    },
  }
}

const REASONS: { title: string; description: string; href: string; label: string }[] = [
  {
    title: 'Research',
    description: '21-cm cosmology, radio interferometry, black hole X-ray binaries and machine learning for strong lensing.',
    href: '/publications',
    label: 'Publications',
  },
  {
    title: 'Open source',
    description: 'Simulators and analysis tools for radio and X-ray astronomy.',
    href: '/open-source',
    label: 'Open source',
  },
  {
    title: 'Consultancy',
    description: 'AI engineering and full-stack work.',
    href: '/consultancy',
    label: 'Consultancy',
  },
]

export default async function ContactPage() {
  const serverUrl = getServerSideURL()
  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: 'Home', url: serverUrl },
    { name: 'Contact', url: `${serverUrl}/contact` },
  ])

  return (
    <div className="container mx-auto px-4 pb-20 min-h-[60vh]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Get in touch"
          lead="Email is the best way to reach me."
        />

        <section className="mb-16">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="break-all font-display text-3xl text-foreground underline decoration-ember underline-offset-8 transition-colors hover:text-ember sm:text-5xl"
          >
            {CONTACT_EMAIL}
          </a>
          <p className="mt-6">
            <a href="mailto:kartik4321mandar@gmail.com" className="break-all text-muted-foreground transition-colors hover:text-foreground">
              kartik4321mandar@gmail.com
            </a>
          </p>
        </section>

        <section className="mb-16">
          <h2 className="mono-label mb-4 text-muted-foreground">What to write about</h2>
          <dl className="grid gap-x-10 gap-y-6 md:grid-cols-3">
            {REASONS.map((reason) => (
              <div key={reason.title} className="border-t border-border pt-4">
                <dt className="font-display text-2xl text-foreground">{reason.title}</dt>
                <dd className="mt-1 text-muted-foreground">{reason.description}</dd>
                <dd className="mt-3">
                  <Link href={reason.href} className="text-sm text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-ember hover:decoration-ember">
                    {reason.label}
                  </Link>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="mono-label mb-4 text-muted-foreground">Where I am</h2>
            <p className="text-foreground">
              <a href="https://www.unict.it/" target="_blank" rel="noopener noreferrer" className="underline decoration-border underline-offset-4 transition-colors hover:text-ember hover:decoration-ember">
                University of Catania
              </a>
            </p>
            <p className="mt-1 text-muted-foreground">Catania, Italy</p>
          </div>
          <div>
            <h2 className="mono-label mb-4 text-muted-foreground">Elsewhere</h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.url}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-foreground transition-colors hover:text-ember">
                    {link.label}
                    <ArrowUpRight aria-hidden className="size-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
