import type { Metadata } from 'next/types'
import CosmicJourney3DClient from '@/components/CosmicJourney3D/ClientWrapper'
import { StoryArticle } from '@/components/CosmicJourney3D/StoryArticle'
import { PAGE_SUBTITLE, PAGE_TITLE } from '@/components/CosmicJourney3D/narrative'
import { generateStorySchema } from '@/utilities/structuredData'

export const metadata: Metadata = {
  title: 'My Story (Preview) - Kartik Mandar',
  robots: { index: false, follow: false },
  openGraph: { images: ['/media/my-story/share.jpg'] },
}

export default function MyStoryPreviewPage() {
  const storyJsonLd = generateStorySchema({ title: PAGE_TITLE, description: PAGE_SUBTITLE, path: '/my-story' })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storyJsonLd) }}
      />
      <StoryArticle />
      <CosmicJourney3DClient />
    </>
  )
}
