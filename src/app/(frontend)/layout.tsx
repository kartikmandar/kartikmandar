import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { Montserrat } from 'next/font/google'
import { JetBrains_Mono } from 'next/font/google'
import React from 'react'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { AdminBar } from '@/components/AdminBar'
import { ExternalLinkHandler } from '@/components/ExternalLinkHandler'
import { FloatingBottomNav } from '@/components/FloatingBottomNav'
import { FloatingTasksButton } from '@/components/FloatingTasksButton'
import { GlobalAudioButton } from '@/components/GlobalAudioButton'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { NAVIGATION_ITEMS } from '@/constants/navigation'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  // Navigation items for both header and floating bottom nav
  const navItems = NAVIGATION_ITEMS.map(item => ({ link: item }))

  return (
    <html className={cn(montserrat.variable, jetbrainsMono.variable)} lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <InitTheme />
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
          <ExternalLinkHandler />
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header />
          {children}
          <Footer />
          <FloatingBottomNav navItems={navItems} />
          <FloatingTasksButton />
          <GlobalAudioButton />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
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
