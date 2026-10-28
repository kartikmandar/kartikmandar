import { PageHeader } from '@/components/motion'
import type { Metadata } from 'next/types'
import React from 'react'
import { getCanonicalUrl, getServerSideURL } from '@/utilities/getURL'
import { generateBreadcrumbSchema } from '@/utilities/structuredData'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Consultancy | Kartik Mandar',
    description: 'Hire Kartik Mandar for scientific software development, data visualization, and research applications on Upwork.',
    alternates: { canonical: getCanonicalUrl('/consultancy') },
    openGraph: {
      title: 'Consultancy - Kartik Mandar',
      description: 'Scientific software consultancy via Upwork.',
    },
  }
}

export default function ConsultancyPage() {
  const serverUrl = getServerSideURL()
  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: 'Home', url: serverUrl },
    { name: 'Consultancy', url: `${serverUrl}/consultancy` },
  ])

  return (
    <div className="container mx-auto px-4 pb-20 min-h-[60vh]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-5xl mx-auto">

        <PageHeader eyebrow="Software" title="Consultancy" />

        <div className="flex flex-col items-center gap-4">
          <a
            href="https://www.upwork.com/freelancers/kartikmandar?mp_source=share"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg text-foreground hover:text-primary transition-colors underline underline-offset-4"
          >
            View my Upwork profile
          </a>
          <a
            href="https://merakinist.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg text-foreground hover:text-primary transition-colors underline underline-offset-4"
          >
            Visit Merakinist (Agency) Page
          </a>
        </div>

      </div>
    </div>
  )
}
