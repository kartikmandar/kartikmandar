import type { Metadata } from 'next'
import { QrGenerator } from './QrGenerator.client'
import { getServerSideURL } from '@/utilities/getURL'

export const metadata: Metadata = {
  title: 'QR generator — Links',
  description: 'Generate per-source QR codes for /links.',
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null },
}

export const dynamic = 'force-static'

export default function QrPage() {
  return <QrGenerator baseUrl={getServerSideURL()} />
}
