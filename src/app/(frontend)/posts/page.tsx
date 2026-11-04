import type { Metadata } from 'next/types'
import { getCanonicalUrl, getServerSideURL } from '@/utilities/getURL'
import { generateBreadcrumbSchema } from '@/utilities/structuredData'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { getPaginatedPosts } from '@/lib/posts'
import React from 'react'
import { PageHeader } from '@/components/motion'

export const dynamic = 'force-static'

export default function Page() {
  const posts = getPaginatedPosts(1, 6)
  const serverUrl = getServerSideURL()
  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: 'Home', url: serverUrl },
    { name: 'Posts', url: `${serverUrl}/posts` },
  ])

  return (
    <div className="pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mb-16">
        <PageHeader title="Posts" />
      </div>

      {posts.totalPages > 1 && (
        <div className="container mb-8">
          <PageRange
            collection="posts"
            currentPage={posts.page}
            limit={6}
            totalDocs={posts.totalDocs}
          />
        </div>
      )}

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Posts | Kartik Mandar',
    alternates: { canonical: getCanonicalUrl('/posts') },
  }
}
