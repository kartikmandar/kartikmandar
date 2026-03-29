import { getServerSideSitemap } from 'next-sitemap'
import { getAllPosts } from '@/lib/posts'

const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://kartikmandar.com'

export async function GET() {
  const posts = getAllPosts()

  const sitemap = posts
    .filter((post) => Boolean(post.slug))
    .map((post) => ({
      loc: `${SITE_URL}/posts/${post.slug}`,
      lastmod: post.updatedAt || post.publishedAt || new Date().toISOString(),
    }))

  return getServerSideSitemap(sitemap)
}
