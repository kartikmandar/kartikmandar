import type { Metadata } from 'next/types'
import React from 'react'
import { getCanonicalUrl, getServerSideURL } from '@/utilities/getURL'
import { generateBreadcrumbSchema } from '@/utilities/structuredData'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Contact | Kartik Mandar',
    description: 'Get in touch with Kartik Mandar for research collaborations, academic discussions, or consultancy.',
    alternates: { canonical: getCanonicalUrl('/contact') },
    openGraph: {
      title: 'Contact Kartik Mandar',
      description: 'Connect for astrophysics research collaborations and academic discussions.',
    },
  }
}

export default async function ContactPage() {
  const serverUrl = getServerSideURL()
  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: 'Home', url: serverUrl },
    { name: 'Contact', url: `${serverUrl}/contact` },
  ])

  return (
    <div className="container mx-auto px-4 py-20 min-h-[60vh]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            Contact Me
          </h1>
        </div>

        {/* Contact Information Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Contact Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Institute */}
            <div className="flex gap-4 items-start p-4 bg-card rounded-lg border border-border">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Institute</h3>
                <p className="text-muted-foreground text-sm">
                  <a
                    href="https://www.rri.res.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    Raman Research Institute
                  </a><br />
                  Bangalore, Karnataka, India
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4 items-start p-4 bg-card rounded-lg border border-border">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Email</h3>
                <a
                  href="mailto:contact@kartikmandar.com"
                  className="text-primary hover:text-primary/80 transition-colors text-sm break-words block"
                >
                  contact@kartikmandar.com
                </a>
                <a
                  href="mailto:kartik4321mandar@gmail.com"
                  className="text-primary hover:text-primary/80 transition-colors text-sm break-words block mt-1"
                >
                  kartik4321mandar@gmail.com
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
