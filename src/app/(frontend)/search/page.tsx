import type { Metadata } from 'next/types'
import React from 'react'
import { getCanonicalUrl, getServerSideURL } from '@/utilities/getURL'
import { generateBreadcrumbSchema } from '@/utilities/structuredData'
import { getAllPosts } from '@/lib/posts'
import { getPublishedProjects } from '@/data/projects'
import { getTalks } from '@/data/talks'
import type { SearchDocument } from '@/data/types'
import SearchPageClient from './page.client'

function buildSearchIndex(): SearchDocument[] {
  const docs: SearchDocument[] = []

  // Add posts
  const posts = getAllPosts()
  for (const post of posts) {
    docs.push({
      title: post.title,
      slug: post.slug,
      type: 'post',
      description: post.excerpt || post.meta?.description || '',
      categories: (post.categories || []).map((c) =>
        typeof c === 'object' && c !== null ? c.title : String(c),
      ),
      url: `/posts/${post.slug}`,
    })
  }

  // Add projects
  const projects = getPublishedProjects()
  for (const project of projects) {
    docs.push({
      title: project.title,
      slug: project.slug || '',
      type: 'project',
      description: project.shortDescription || project.description || '',
      categories: project.category ? [project.category] : [],
      url: `/open-source`,
    })
  }

  // Add talks
  const talks = getTalks()
  for (const talk of talks) {
    docs.push({
      title: talk.title,
      slug: talk.slug || '',
      type: 'talk',
      description: talk.shortDescription || talk.abstract || '',
      categories: (talk.topics || []).map((t) => t.topic),
      url: `/talks`,
    })
  }

  return docs
}

export default function SearchPage() {
  const searchIndex = buildSearchIndex()
  const serverUrl = getServerSideURL()
  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: 'Home', url: serverUrl },
    { name: 'Search', url: `${serverUrl}/search` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SearchPageClient searchIndex={searchIndex} />
    </>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Search - Kartik Mandar',
    description: 'Search posts, projects, and talks.',
    alternates: { canonical: getCanonicalUrl('/search') },
  }
}
