import type { Metadata } from 'next/types'
import React from 'react'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Consultancy | Kartik Mandar',
    description: 'Hire Kartik Mandar for scientific software development, data visualization, and research applications on Upwork.',
    openGraph: {
      title: 'Consultancy - Kartik Mandar',
      description: 'Scientific software consultancy via Upwork.',
    },
  }
}

export default function ConsultancyPage() {
  return (
    <div className="container mx-auto px-4 py-20 min-h-[60vh]">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            Consultancy
          </h1>
        </div>

        <div className="flex justify-center">
          <a
            href="https://www.upwork.com/freelancers/kartikmandar?mp_source=share"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg text-foreground hover:text-primary transition-colors underline underline-offset-4"
          >
            View my Upwork profile
          </a>
        </div>

      </div>
    </div>
  )
}
