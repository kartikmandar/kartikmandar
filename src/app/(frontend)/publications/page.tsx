import type { Metadata } from 'next/types'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-dynamic'

export default async function PublicationsPage(): Promise<React.JSX.Element> {
  return (
    <div className="pt-24 pb-24">
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
  }
}