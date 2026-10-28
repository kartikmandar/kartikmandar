import type { Metadata } from 'next'

import React from 'react'

import { CookieConsentBanner } from '@/components/CookieConsent'
import { ConsentAwareAnalytics } from '@/components/ConsentAwareAnalytics'
import { ExternalLinkHandler } from '@/components/ExternalLinkHandler'
import { GlobalAudioButton } from '@/components/GlobalAudioButton'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { SmoothScroll } from '@/providers/SmoothScroll'
import { CursorLabel } from '@/components/motion'
import { HideInJourney, SiteGrain } from '@/components/SiteChrome/RouteGate'
import { fontVariables } from '@/app/fonts'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { generatePersonSchema, generateWebSiteSchema } from '@/utilities/structuredData'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${fontVariables} dark`} lang="en" data-theme="dark" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generatePersonSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebSiteSchema()) }}
        />
        {/* Favicon and app icons */}
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/favicon-16x16.png" rel="icon" type="image/png" sizes="16x16" />
        <link href="/favicon-32x32.png" rel="icon" type="image/png" sizes="32x32" />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
        <link href="/android-chrome-192x192.png" rel="icon" type="image/png" sizes="192x192" />
        <link href="/android-chrome-512x512.png" rel="icon" type="image/png" sizes="512x512" />
        <link href="/site.webmanifest" rel="manifest" />
      </head>
      <body>
        <Providers>
          <HideInJourney>
            <a href="#main" className="skip-link">Skip to content</a>
          </HideInJourney>
          <SmoothScroll />
          <ExternalLinkHandler />

          <Header />
          <main id="main">{children}</main>
          <HideInJourney>
            <Footer />
          </HideInJourney>
          <GlobalAudioButton />
          <CookieConsentBanner />
          <ConsentAwareAnalytics />
          <SiteGrain />
          <CursorLabel />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  alternates: {
    canonical: getServerSideURL(),
  },
  title: 'Kartik Mandar - Astrophysicist & Software Developer',
  description: 'Welcome to my digital space where I try to showcase my work and interests. Also astronomy is cool and more people should know about it. I tend to work on using my software development skills to solve problems in astrophysics and related fields.',
  keywords: ['astrophysics', 'software development', 'research', 'kartik mandar'],
  authors: [{ name: 'Kartik Mandar' }],
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@kartikmandar',
    title: 'Kartik Mandar - Astrophysicist & Software Developer',
    description: 'Welcome to my digital space where I try to showcase my work and interests. Also astronomy is cool and more people should know about it. I tend to work on using my software development skills to solve problems in astrophysics and related fields.',
  },
}
