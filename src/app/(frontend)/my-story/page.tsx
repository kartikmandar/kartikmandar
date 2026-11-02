import type { Metadata } from 'next/types'
import CosmicJourney3DClient from '@/components/CosmicJourney3D/ClientWrapper'
import { LOADER_BACKDROP } from '@/components/CosmicJourney3D/LoaderView'
import { StoryArticle } from '@/components/CosmicJourney3D/StoryArticle'
import { PAGE_SUBTITLE, PAGE_TITLE } from '@/components/CosmicJourney3D/narrative'
import { getCanonicalUrl, getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { generateBreadcrumbSchema, generateStorySchema } from '@/utilities/structuredData'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  const description = 'The story of Kartik Mandar, from a fascination with astrophysics to radio cosmology and software, told as a flight through space.'
  return {
    title: 'My Story - Kartik Mandar',
    description,
    alternates: { canonical: getCanonicalUrl('/my-story') },
    openGraph: mergeOpenGraph({
      title: 'My Story - Kartik Mandar',
      description,
      url: getCanonicalUrl('/my-story'),
      images: [{ url: `${getServerSideURL()}/media/my-story/share.jpg`, width: 1200, height: 630 }],
    }),
  }
}

export default function MyStoryPage() {
  const serverUrl = getServerSideURL()
  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: 'Home', url: serverUrl },
    { name: 'My Story', url: `${serverUrl}/my-story` },
  ])
  const storyJsonLd = generateStorySchema({ title: PAGE_TITLE, description: PAGE_SUBTITLE, path: '/my-story' })

  return (
    <>
      <link rel="preload" as="image" href={LOADER_BACKDROP} fetchPriority="high" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storyJsonLd) }}
      />
      <StoryArticle />
      <CosmicJourney3DClient />
    </>
  )
}
