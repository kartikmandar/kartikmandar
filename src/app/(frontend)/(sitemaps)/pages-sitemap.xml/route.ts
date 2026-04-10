import { getServerSideSitemap } from 'next-sitemap'

const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://kartikmandar.com'

// All known static pages
const STATIC_PAGES = [
  { slug: '', lastmod: '2026-03-29T00:00:00.000Z', changefreq: 'weekly' as const, priority: 1.0 },
  { slug: 'cv', lastmod: '2026-04-10T00:00:00.000Z', changefreq: 'monthly' as const, priority: 0.8 },
  { slug: 'my-story', lastmod: '2026-03-29T00:00:00.000Z', changefreq: 'monthly' as const, priority: 0.7 },
  { slug: 'open-source', lastmod: '2026-03-29T00:00:00.000Z', changefreq: 'monthly' as const, priority: 0.8 },
  { slug: 'publications', lastmod: '2026-03-29T00:00:00.000Z', changefreq: 'weekly' as const, priority: 0.8 },
  { slug: 'talks', lastmod: '2026-03-29T00:00:00.000Z', changefreq: 'monthly' as const, priority: 0.7 },
  { slug: 'certificates', lastmod: '2026-03-29T00:00:00.000Z', changefreq: 'monthly' as const, priority: 0.5 },
  { slug: 'hobbies', lastmod: '2026-03-29T00:00:00.000Z', changefreq: 'monthly' as const, priority: 0.4 },
  { slug: 'courses', lastmod: '2026-03-29T00:00:00.000Z', changefreq: 'monthly' as const, priority: 0.5 },
  { slug: 'posters', lastmod: '2026-03-29T00:00:00.000Z', changefreq: 'monthly' as const, priority: 0.5 },
  { slug: 'contact', lastmod: '2026-03-29T00:00:00.000Z', changefreq: 'yearly' as const, priority: 0.6 },
  { slug: 'consultancy', lastmod: '2026-03-29T00:00:00.000Z', changefreq: 'monthly' as const, priority: 0.7 },
  { slug: 'journal-club', lastmod: '2026-03-29T00:00:00.000Z', changefreq: 'monthly' as const, priority: 0.5 },
  { slug: 'search', lastmod: '2026-03-29T00:00:00.000Z', changefreq: 'monthly' as const, priority: 0.3 },
  { slug: 'posts', lastmod: '2026-03-29T00:00:00.000Z', changefreq: 'weekly' as const, priority: 0.9 },
]

export async function GET() {
  const sitemap = STATIC_PAGES.map((page) => ({
    loc: page.slug ? `${SITE_URL}/${page.slug}` : `${SITE_URL}/`,
    lastmod: page.lastmod,
    changefreq: page.changefreq,
    priority: page.priority,
  }))

  return getServerSideSitemap(sitemap)
}
