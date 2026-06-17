// src/app/(frontend)/my-story/preview/page.tsx
import type { Metadata } from 'next/types'
import dynamic from 'next/dynamic'

const CosmicJourney3D = dynamic(() => import('@/components/CosmicJourney3D'), { ssr: false })

export const metadata: Metadata = {
  title: 'My Story (Preview) - Kartik Mandar',
  robots: { index: false, follow: false },
}

export default function MyStoryPreviewPage() {
  return <CosmicJourney3D />
}
