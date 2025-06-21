'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'
import { ChevronRight } from 'lucide-react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'

// Helper function to extract text from Lexical content
function extractTextFromContent(content: any): string {
  if (!content || !content.root || !content.root.children) return ''
  
  const extractText = (node: any): string => {
    if (!node) return ''
    
    if (node.type === 'text') {
      return node.text || ''
    }
    
    if (node.children && Array.isArray(node.children)) {
      return node.children.map(extractText).join(' ')
    }
    
    return ''
  }
  
  const fullText = content.root.children.map(extractText).join(' ')
  // Return first 150 characters with word boundary
  if (fullText.length <= 150) return fullText
  return fullText.substring(0, 150).split(' ').slice(0, -1).join(' ') + '...'
}

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title' | 'publishedAt' | 'populatedAuthors' | 'authors'> & {
  content?: Post['content']
}

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title, publishedAt, populatedAuthors, content } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  // Get formatted authors
  const hasAuthors = populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''
  const authorsText = hasAuthors ? formatAuthors(populatedAuthors) : null

  // Extract content preview
  const contentPreview = extractTextFromContent(content)

  return (
    <article
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer hover:shadow-lg transition-all duration-300 group',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full">
        {!metaImage && <div className="">No image</div>}
        {metaImage && typeof metaImage !== 'string' && (
          <div className="aspect-video overflow-hidden">
            <Media 
              resource={metaImage} 
              size="33vw" 
              imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
      </div>
      <div className="p-6">
        {showCategories && hasCategories && (
          <div className="uppercase text-sm mb-4 text-muted-foreground">
            {categories?.map((category, index) => {
              if (typeof category === 'object') {
                const { title: titleFromCategory } = category
                const categoryTitle = titleFromCategory || 'Untitled category'
                const isLast = index === categories.length - 1

                return (
                  <Fragment key={index}>
                    {categoryTitle}
                    {!isLast && <Fragment>, &nbsp;</Fragment>}
                  </Fragment>
                )
              }
              return null
            })}
          </div>
        )}
        
        <div className="mb-4">
          {titleToUse && (
            <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
              <Link className="not-prose" href={href} ref={link.ref}>
                {titleToUse}
              </Link>
            </h3>
          )}
          
          {/* Content preview from post content */}
          {contentPreview && (
            <p className="text-muted-foreground text-sm line-clamp-3 mb-2">
              {contentPreview}
            </p>
          )}
          {/* Fallback to meta description if no content preview */}
          {!contentPreview && sanitizedDescription && (
            <p className="text-muted-foreground text-sm line-clamp-3 mb-2">
              {sanitizedDescription}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {authorsText && (
              <div className="mb-1">
                By {authorsText}
              </div>
            )}
            {publishedAt && new Date(publishedAt).toLocaleDateString()}
          </div>
          <Link 
            href={href}
            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Read <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </article>
  )
}
