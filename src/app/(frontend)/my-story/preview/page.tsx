import type { Metadata } from 'next/types'
import CosmicJourney3DClient from '@/components/CosmicJourney3D/ClientWrapper'

export const metadata: Metadata = {
  title: 'My Story (Preview) - Kartik Mandar',
  robots: { index: false, follow: false },
}

export default function MyStoryPreviewPage() {
  return <CosmicJourney3DClient />
}
