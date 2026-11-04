import React from 'react'

import { ContentCard } from '@/components/ContentCard'
import type { CardPostData } from '@/data/types'

export type { CardPostData }

// Helper function to extract text from Lexical content
function extractTextFromContent(content: unknown): string {
  if (!content || typeof content !== 'object') return ''

  const contentObj = content as { root?: { children?: unknown[] } }
  if (!contentObj.root || !contentObj.root.children) return ''

  const extractText = (node: unknown): string => {
    if (!node || typeof node !== 'object') return ''

    const nodeObj = node as { type?: string; text?: string; children?: unknown[] }

    if (nodeObj.type === 'text') {
      return nodeObj.text || ''
    }

    if (nodeObj.children && Array.isArray(nodeObj.children)) {
      return nodeObj.children.map(extractText).join(' ')
    }

    return ''
  }

  const fullText = contentObj.root.children.map(extractText).join(' ')
  // Return first 150 characters with word boundary
  if (fullText.length <= 150) return fullText
  return fullText.substring(0, 150).split(' ').slice(0, -1).join(' ') + '...'
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** A post on the shared ContentCard (compact variant). */
export const Card: React.FC<{
  className?: string
  doc?: CardPostData & { content?: unknown }
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = ({ className, doc, relationTo, showCategories, title: titleFromProps }) => {
  const { slug, categories, meta, title, publishedAt, populatedAuthors, content, excerpt } = doc || {} as CardPostData & { content?: unknown }
  const { description, image: metaImage } = meta || {}

  const titleToUse = titleFromProps || title || ''
  const authorNames = (populatedAuthors || [])
    .map((author) => (typeof author === 'object' && author !== null ? author.name : null))
    .filter(Boolean) as string[]
  const categoryNames = (categories || [])
    .map((category) => (typeof category === 'object' && category !== null ? category.title || 'Untitled category' : null))
    .filter(Boolean) as string[]

  // Use excerpt for MDX posts, fall back to Lexical content extraction, then the meta description
  const preview = excerpt || extractTextFromContent(content) || description?.replace(/\s/g, ' ')
  const imageSrc = typeof metaImage === 'string' ? metaImage : metaImage?.url
  const imageAlt = (typeof metaImage === 'object' && metaImage?.alt) || titleToUse

  return (
    <ContentCard
      variant="compact"
      className={className}
      title={titleToUse}
      href={`/${relationTo}/${slug}`}
      eyebrow={showCategories && categoryNames.length > 0 ? categoryNames.join(', ') : undefined}
      image={imageSrc ? { src: imageSrc, alt: imageAlt } : undefined}
      summary={preview ? <p className="line-clamp-3">{preview}</p> : undefined}
      meta={authorNames.length > 0 || publishedAt ? (
        <>
          {authorNames.length > 0 && <span>By {authorNames.join(', ')}</span>}
          {authorNames.length > 0 && publishedAt && ' · '}
          {publishedAt && <span>{formatDate(publishedAt)}</span>}
        </>
      ) : undefined}
    />
  )
}
