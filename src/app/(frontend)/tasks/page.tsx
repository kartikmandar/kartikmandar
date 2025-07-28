import type { Metadata } from 'next/types'
import React from 'react'
import { AccountabilityPlatform } from '@/components/AccountabilityPlatform'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Goals & Accountability | Kartik Mandar',
    description: 'Public accountability platform showing my current goals, progress, and work sessions. See what I\'m working on in real-time.',
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function AccountabilityPage() {
  return (
    <div className="container mx-auto px-4 pt-24 pb-8 sm:pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            Goals & Accountability
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
            See what I&apos;m currently working on and hold me accountable to my commitments.
          </p>
        </div>

        {/* Accountability Platform Component */}
        <AccountabilityPlatform />

      </div>
    </div>
  )
}