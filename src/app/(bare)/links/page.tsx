import type { Metadata } from 'next'
import { LinksView } from './page.client'

export const metadata: Metadata = {
  title: 'Links — Kartik Mandar',
  description: 'All links in one place.',
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null },
}

export const dynamic = 'force-static'

type PageProps = {
  searchParams: Promise<{ src?: string | string[] }>
}

export default async function LinksPage({ searchParams }: PageProps) {
  const params = await searchParams
  const rawSrc = params.src
  const src = (Array.isArray(rawSrc) ? rawSrc[0] : rawSrc) ?? null

  return <LinksView src={src} />
}
