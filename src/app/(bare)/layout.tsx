import type { Metadata } from 'next'
import React from 'react'

import { fontVariables } from '@/app/fonts'
import { CookieConsentBanner } from '@/components/CookieConsent'
import { ConsentAwareAnalytics } from '@/components/ConsentAwareAnalytics'
import { PostHogProvider } from '@/components/PostHogProvider'
import { Providers } from '@/providers'
import { getServerSideURL } from '@/utilities/getURL'

import '../(frontend)/globals.css'

export default function BareLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={`${fontVariables} dark`}
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
    >
      <head suppressHydrationWarning>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
      </head>
      <body className="min-h-dvh bg-background text-foreground">
        <Providers>
          <PostHogProvider>
            <main className="min-h-dvh">{children}</main>
            <CookieConsentBanner />
            <ConsentAwareAnalytics />
          </PostHogProvider>
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: 'Links — Kartik Mandar',
  description: 'Kartik Mandar — links and contact.',
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null },
  openGraph: { title: 'Links', description: '', images: [] },
  twitter: { card: 'summary', title: 'Links', description: '' },
}
