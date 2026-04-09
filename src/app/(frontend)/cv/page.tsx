import type { Metadata } from 'next/types'
import React from 'react'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'CV | Kartik Mandar',
    description: 'Academic and professional curriculum vitae of Kartik Mandar.',
    openGraph: {
      title: 'CV - Kartik Mandar',
      description: 'Academic and professional curriculum vitae.',
    },
  }
}

export default function CVPage() {
  return (
    <div className="container mx-auto px-4 py-20 min-h-[60vh]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            CV
          </h1>
        </div>

        <div className="flex flex-col items-center gap-6">
          <a
            href="https://drive.google.com/file/d/1Mt1mdXwKkwagocNu4DYbXNjDmA006zvA/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg text-foreground hover:text-primary transition-colors underline underline-offset-4"
          >
            Academic CV
          </a>
          <a
            href="https://drive.google.com/file/d/15PZLNWHPzwWEzjf4GhA3WJhXWlJXqkXg/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg text-foreground hover:text-primary transition-colors underline underline-offset-4"
          >
            Professional CV
          </a>
        </div>
      </div>
    </div>
  )
}
