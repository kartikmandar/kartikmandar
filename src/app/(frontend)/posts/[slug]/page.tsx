import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import React from 'react'
import MarkdownContent from '@/components/MarkdownContent'

import { PostHero } from '@/heros/PostHero'
import { getServerSideURL } from '@/utilities/getURL'
import { getAllPostSlugs, getPostBySlug } from '@/lib/posts'
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

  return (
    <article className="pt-16 pb-16">
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

  return {
    title,
    description: post.meta?.description || post.excerpt,
    openGraph: {
      title,
      description: post.meta?.description || post.excerpt || '',
      images: [{ url: ogImageUrl }],
    },
  }
}
