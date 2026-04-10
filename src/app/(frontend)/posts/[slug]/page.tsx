import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import React from 'react'
import MarkdownContent from '@/components/MarkdownContent'

import { PostHero } from '@/heros/PostHero'
import { getServerSideURL } from '@/utilities/getURL'
import { getAllPostSlugs, getPostBySlug } from '@/lib/posts'
import { generateArticleSchema, generateBreadcrumbSchema } from '@/utilities/structuredData'
import PageClient from './page.client'
import { Comments } from '@/components/Comments'
import { notFound } from 'next/navigation'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }))
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function PostPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const post = getPostBySlug(slug)

  if (!post) return notFound()

  const serverUrl = getServerSideURL()
  const heroImageUrl =
    post.heroImage && typeof post.heroImage === 'object' && 'url' in post.heroImage
      ? post.heroImage.url
      : typeof post.heroImage === 'string'
        ? post.heroImage
        : undefined

  const articleJsonLd = generateArticleSchema({
    title: post.title,
    description: post.meta?.description || post.excerpt,
    publishedAt: post.publishedAt || undefined,
    updatedAt: post.updatedAt || undefined,
    heroImage: heroImageUrl || undefined,
    slug: post.slug,
  })

  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: 'Home', url: serverUrl },
    { name: 'Posts', url: `${serverUrl}/posts` },
    { name: post.title, url: `${serverUrl}/posts/${post.slug}` },
  ])

  return (
    <article className="pt-16 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PageClient />

      <PostHero post={post} />

      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          <MarkdownContent
            className="max-w-[48rem] mx-auto"
            content={post.content}
            enableGutter={false}
          />
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RelatedPosts
              className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              docs={post.relatedPosts
                .map((relatedSlug) => {
                  const related = getPostBySlug(relatedSlug)
                  return related
                    ? {
                        slug: related.slug,
                        title: related.title,
                        categories: related.categories,
                        meta: related.meta,
                        publishedAt: related.publishedAt,
                        populatedAuthors: related.populatedAuthors,
                      }
                    : null
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .filter(Boolean) as any[]}
            />
          )}
        </div>
      </div>

      <Comments title={post.title} className="mt-12" />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const post = getPostBySlug(slug)

  if (!post) return {}

  const serverUrl = getServerSideURL()
  const metaImage = post.meta?.image
  let ogImageUrl = serverUrl + '/website-template-OG.webp'

  if (metaImage && typeof metaImage === 'object' && 'url' in metaImage) {
    const ogUrl = metaImage.sizes?.og?.url
    ogImageUrl = ogUrl ? serverUrl + ogUrl : serverUrl + (metaImage.url || '')
  } else if (typeof metaImage === 'string') {
    ogImageUrl = serverUrl + metaImage
  }

  const title = post.meta?.title
    ? `${post.meta.title} | Kartik Mandar`
    : `${post.title} | Kartik Mandar`

  const categories = post.categories?.map((c) =>
    typeof c === 'object' && c !== null && 'title' in c ? c.title : String(c),
  ).filter(Boolean)

  return {
    title,
    description: post.meta?.description || post.excerpt,
    alternates: {
      canonical: `${serverUrl}/posts/${slug}`,
    },
    openGraph: {
      type: 'article',
      title,
      description: post.meta?.description || post.excerpt || '',
      images: [{ url: ogImageUrl }],
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || post.publishedAt || undefined,
      authors: ['Kartik Mandar'],
      tags: categories,
    },
  }
}
