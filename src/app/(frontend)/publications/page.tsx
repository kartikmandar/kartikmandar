import type { Metadata } from 'next/types'
import React from 'react'
import { getCanonicalUrl, getServerSideURL } from '@/utilities/getURL'
import { generateBreadcrumbSchema } from '@/utilities/structuredData'
import PageClient from './page.client'

export const dynamic = 'force-dynamic'

export default async function PublicationsPage(): Promise<React.JSX.Element> {
  const serverUrl = getServerSideURL()
  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: 'Home', url: serverUrl },
    { name: 'Publications', url: `${serverUrl}/publications` },
  ])

  return (
    <div className="pt-24 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
        </div>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Publications - arXiv Search',
    description: 'Search and browse academic publications from arXiv repository',
    alternates: { canonical: getCanonicalUrl('/publications') },
  }
}