import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LinksView } from './page.client'

export const metadata: Metadata = {
  title: 'Links — Kartik Mandar',
  description: 'All links in one place.',
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null },
}

export default function LinksPage() {
  return (
    <Suspense fallback={null}>
      <LinksView />
    </Suspense>
  )
}
