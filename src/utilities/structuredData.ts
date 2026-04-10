import { getServerSideURL } from './getURL'

type BreadcrumbItem = {
  name: string
  url: string
}

export function generatePersonSchema() {
  const siteUrl = getServerSideURL()
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Kartik Mandar',
    url: siteUrl,
    image: `${siteUrl}/android-chrome-512x512.png`,
    jobTitle: 'Astrophysics Student & Software Developer',
    description:
      'Astrophysicist and software developer working on using software development skills to solve problems in astrophysics and related fields.',
    email: 'contact@kartikmandar.com',
    sameAs: [
      'https://github.com/kartikmandar',
      'https://www.linkedin.com/in/kartikmandar/',
      'https://x.com/kartik_mandar',
      'https://www.reddit.com/user/kartikmandar/',
      'https://scholar.google.com/citations?hl=en&user=8vhqrogAAAAJ',
      'https://orcid.org/0009-0002-6037-4613',
    ],
    knowsAbout: [
      'Astrophysics',
      'Radio Interferometry',
      'Python',
      'Software Development',
      'Open Source',
      'Machine Learning',
    ],
  }
}

export function generateWebSiteSchema() {
  const siteUrl = getServerSideURL()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Kartik Mandar',
    url: siteUrl,
    description:
      'Personal website of Kartik Mandar — astrophysicist and software developer.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

interface ArticleSchemaInput {
  title: string
  description?: string
  publishedAt?: string
  updatedAt?: string
  heroImage?: string
  slug: string
}

export function generateArticleSchema(post: ArticleSchemaInput) {
  const siteUrl = getServerSideURL()
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description || '',
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt || post.publishedAt || undefined,
    image: post.heroImage ? `${siteUrl}${post.heroImage}` : undefined,
    url: `${siteUrl}/posts/${post.slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/posts/${post.slug}`,
    },
    author: {
      '@type': 'Person',
      name: 'Kartik Mandar',
      url: siteUrl,
    },
  }
}
