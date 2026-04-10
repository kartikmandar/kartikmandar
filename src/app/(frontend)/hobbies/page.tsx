import type { Metadata } from 'next/types'
import React from 'react'
import { getCanonicalUrl, getServerSideURL } from '@/utilities/getURL'
import { generateBreadcrumbSchema } from '@/utilities/structuredData'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Hobbies | Kartik Mandar - Beyond Research',
    description: 'Discover the personal interests and hobbies that fuel creativity and passion - from stargazing and badminton to keyboards and cycling.',
    alternates: { canonical: getCanonicalUrl('/hobbies') },
    openGraph: {
      title: 'Hobbies - Kartik Mandar',
      description: 'Personal interests beyond astrophysics research - astronomy, sports, and more.',
    },
  }
}

export default async function HobbiesPage() {
  const hobbies = [
    {
      title: "Astronomy",
      description: "Love to gaze the stars and study why our cosmos is the way it is.",
    },
    {
      title: "Badminton",
      description: "Playing and training since 11th class, I have played badminton competitively. I am currently playing for my college team.",
    },
    {
      title: "Green Tea",
      description: "A green tea addict. Favourite being the Organic India Tulsi-Mulethi.",
    },
    {
      title: "Cycling",
      description: "A proud road bike owner but still enjoy treks on MTB from time to time.",
    },
    {
      title: "Keyboards",
      description: "Love keyboards, current fad is Royal Kludge 84 RGB 75% with Gaterons Yellow switches.",
    },
    {
      title: "Running",
      description: "Running is more about the mind than the body.",
    }
  ]

  const serverUrl = getServerSideURL()
  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: 'Home', url: serverUrl },
    { name: 'Hobbies', url: `${serverUrl}/hobbies` },
  ])

  return (
    <div className="container mx-auto px-4 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-5xl mx-auto">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            Hobbies
          </h1>
        </div>

        {/* Hobbies Grid */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hobbies.map((hobby, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6 transition-colors hover:bg-accent/50"
              >
                {/* Content */}
                <div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">
                    {hobby.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {hobby.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>



      </div>
    </div>
  )
}