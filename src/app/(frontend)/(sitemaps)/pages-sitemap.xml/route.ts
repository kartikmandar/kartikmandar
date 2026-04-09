import { getServerSideSitemap } from 'next-sitemap'

const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://kartikmandar.com'

// All known static pages
const STATIC_PAGES = [
  { slug: '', lastmod: '2026-03-29T00:00:00.000Z' },
  { slug: 'cv', lastmod: '2026-04-10T00:00:00.000Z' },
  { slug: 'my-story', lastmod: '2026-03-29T00:00:00.000Z' },
  { slug: 'open-source', lastmod: '2026-03-29T00:00:00.000Z' },
  { slug: 'publications', lastmod: '2026-03-29T00:00:00.000Z' },
  { slug: 'talks', lastmod: '2026-03-29T00:00:00.000Z' },
  { slug: 'certificates', lastmod: '2026-03-29T00:00:00.000Z' },
  { slug: 'hobbies', lastmod: '2026-03-29T00:00:00.000Z' },
  { slug: 'courses', lastmod: '2026-03-29T00:00:00.000Z' },
  { slug: 'posters', lastmod: '2026-03-29T00:00:00.000Z' },
  { slug: 'contact', lastmod: '2026-03-29T00:00:00.000Z' },
  { slug: 'consultancy', lastmod: '2026-03-29T00:00:00.000Z' },
  { slug: 'journal-club', lastmod: '2026-03-29T00:00:00.000Z' },
  { slug: 'search', lastmod: '2026-03-29T00:00:00.000Z' },
  { slug: 'posts', lastmod: '2026-03-29T00:00:00.000Z' },
]

export async function GET() {
  const sitemap = STATIC_PAGES.map((page) => ({
    loc: page.slug ? `${SITE_URL}/${page.slug}` : `${SITE_URL}/`,
    lastmod: page.lastmod,
  }))

  return getServerSideSitemap(sitemap)
}
