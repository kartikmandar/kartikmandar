import type { Metadata } from 'next'
import { Montserrat, JetBrains_Mono } from 'next/font/google'
import React from 'react'

import { cn } from '@/utilities/ui'
import { CookieConsentBanner } from '@/components/CookieConsent'
import { ConsentAwareAnalytics } from '@/components/ConsentAwareAnalytics'
import { PostHogProvider } from '@/components/PostHogProvider'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { getServerSideURL } from '@/utilities/getURL'

import '../(frontend)/globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export default function BareLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={cn(montserrat.variable, jetbrainsMono.variable)}
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head suppressHydrationWarning>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <InitTheme />
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
