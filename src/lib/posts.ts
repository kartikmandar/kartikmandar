import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Post, CardPostData, Category } from '@/data/types'
import { getCategoryBySlug } from '@/data/categories'

const POSTS_DIR = path.join(process.cwd(), 'src', 'content', 'posts')

/**
 * Read a single MDX file and return parsed post data.
 */
function readPostFile(filename: string): Post | null {
  const filePath = path.join(POSTS_DIR, filename)

  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data: frontmatter, content } = matter(raw)

  // Resolve categories from slugs/titles to Category objects
  const categories: (Category | string)[] = (frontmatter.categories || []).map(
    (cat: string) => {
      const found = getCategoryBySlug(cat.toLowerCase().replace(/\s+/g, '-'))
      return found || cat
    },
  )

  const post: Post = {
    slug: frontmatter.slug || filename.replace(/\.mdx?$/, ''),
    title: frontmatter.title || 'Untitled',
    content,
    excerpt: extractExcerpt(content),
    categories,
    authors: frontmatter.authors || [],
    populatedAuthors: frontmatter.authors || [],
    publishedAt: frontmatter.publishedAt || null,
    heroImage: frontmatter.heroImage || null,
    meta: frontmatter.meta || {},
    relatedPosts: frontmatter.relatedPosts || [],
    updatedAt: frontmatter.updatedAt || frontmatter.publishedAt || undefined,
    createdAt: frontmatter.createdAt || frontmatter.publishedAt || undefined,
  }

  return post
}

/**
 * Extract first ~150 characters as a plain text excerpt.
 */
function extractExcerpt(markdown: string, maxLength = 150): string {
  // Strip markdown formatting
  const plain = markdown
    .replace(/^---[\s\S]*?---/, '') // strip frontmatter if present
    .replace(/!\[.*?\]\(.*?\)/g, '') // images
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1') // links
    .replace(/#{1,6}\s+/g, '') // headings
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // italic
    .replace(/~~(.*?)~~/g, '$1') // strikethrough
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // code
    .replace(/>\s+/g, '') // blockquotes
    .replace(/[-*+]\s+/g, '') // list markers
    .replace(/\n+/g, ' ') // newlines to spaces
    .trim()

  if (plain.length <= maxLength) return plain
  return plain.substring(0, maxLength).split(' ').slice(0, -1).join(' ') + '...'
}

/**
 * Get all posts, sorted by publishedAt (newest first).
 */
export function getAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return []

  const files = fs.readdirSync(POSTS_DIR).filter((f) => /^[^.].*\.mdx?$/.test(f))

  const posts = files
    .map((f) => readPostFile(f))
    .filter((p): p is Post => p !== null)
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0).getTime()
      const dateB = new Date(b.publishedAt || 0).getTime()
      return dateB - dateA
    })

  return posts
}

/**
 * Get a single post by slug.
 */
export function getPostBySlug(slug: string): Post | null {
  // Try exact filename match first
  for (const ext of ['.mdx', '.md']) {
    const post = readPostFile(`${slug}${ext}`)
    if (post) return post
  }

  // Fallback: scan all posts for matching slug
  const all = getAllPosts()
  return all.find((p) => p.slug === slug) || null
}

/**
 * Get paginated posts for listing pages.
 */
export function getPaginatedPosts(
  page: number,
  limit: number,
): {
  docs: CardPostData[]
  page: number
  totalPages: number
  totalDocs: number
} {
  const all = getAllPosts()
  const totalDocs = all.length
  const totalPages = Math.ceil(totalDocs / limit)
  const start = (page - 1) * limit
  const docs = all.slice(start, start + limit).map(postToCardData)

  return { docs, page, totalPages, totalDocs }
}

/**
 * Convert a full Post to the subset used by Card components.
 */
export function postToCardData(post: Post): CardPostData {
  return {
    slug: post.slug,
    title: post.title,
    categories: post.categories,
    meta: post.meta,
    publishedAt: post.publishedAt,
    populatedAuthors: post.populatedAuthors,
    excerpt: post.excerpt,
  }
}

/**
 * Get all post slugs for generateStaticParams.
 */
export function getAllPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug)
}
