import type { Metadata } from 'next/types'
import React from 'react'
import {
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getAllPosts, postToCardData } from '@/lib/posts'
import { Comments } from '@/components/Comments'

export const dynamic = 'force-static'

export function generateMetadata(): Metadata {
  return {
    title: 'Life of an Academia Student | Kartik Mandar - The Real Academic Journey',
    description: 'An honest look into what life is really like for students and researchers in academia - from undergraduate studies to PhD and beyond.',
    openGraph: {
      title: 'Life of an Academia Student - The Real Academic Journey',
      description: 'Discover the realities, challenges, and rewards of pursuing a career in academia.',
    },
  }
}

export default function AcademicLifePage(): React.JSX.Element {
  const allPosts = getAllPosts()
  const posts = allPosts.slice(0, 6).map(postToCardData)

  const academicStages = [
    {
      stage: "Undergraduate",
      duration: "3-4 years",
      focus: "Foundation building, discovering research interests",
      challenges: ["Heavy coursework", "Finding direction", "Time management"],
      color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30"
    },
    {
      stage: "Masters/Research",
      duration: "2 years",
      focus: "Specialization, first research experience",
      challenges: ["Thesis writing", "Research methodology", "Literature review"],
      color: "from-green-500/20 to-emerald-500/20 border-green-500/30"
    },
    {
      stage: "PhD",
      duration: "4-6 years",
      focus: "Independent research, becoming an expert",
      challenges: ["Imposter syndrome", "Long timelines", "Uncertainty"],
      color: "from-purple-500/20 to-pink-500/20 border-purple-500/30"
    },
    {
      stage: "Postdoc",
      duration: "2-4 years",
      focus: "Building research profile, job hunting",
      challenges: ["Job market", "Publication pressure", "Mobility"],
      color: "from-orange-500/20 to-red-500/20 border-orange-500/30"
    },
    {
      stage: "Academic Career",
      duration: "Never Ends",
      focus: "Teaching, research, service",
      challenges: ["Tenure track", "Funding", "Work-life balance"],
      color: "from-gray-500/20 to-gray-700/20 border-gray-500/30"
    }
  ]




  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            Life of an Academia Student
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
            An honest look into what life is really like for students and researchers in academia.
          </p>
          
          {/* Target Audience Note */}
          <div className="max-w-3xl mx-auto mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 text-sm md:text-base">
              <strong>For High School Students:</strong> This page is specifically designed for incoming high school students who are thinking of going into research!
            </p>
          </div>
        </div>

        {/* Personal Stories from Blog */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Personal Stories & Experiences</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real stories from the academic journey - the successes, failures, and everything in between.
            </p>
          </div>
          
          {posts && posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post, index) => {
                // Get thumbnail from meta.image
                const thumbnail = post.meta?.image
                const thumbnailUrl = thumbnail && typeof thumbnail === 'object' && 'url' in thumbnail ? thumbnail.url : null
                const thumbnailAlt = thumbnail && typeof thumbnail === 'object' && 'alt' in thumbnail ? (thumbnail.alt || post.title) : post.title

                // Get author names
                const authorNames = (post.populatedAuthors || [])
                  .map((a) => a?.name)
                  .filter(Boolean)
                const authorsText = authorNames.length > 0 ? authorNames.join(', ') : null

                return (
                  <article key={index} className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
                    {/* Thumbnail */}
                    {thumbnailUrl && (
                      <div className="aspect-video overflow-hidden relative">
                        <Image
                          src={thumbnailUrl}
                          alt={thumbnailAlt}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-muted-foreground text-sm line-clamp-3 mb-2">
                            {post.excerpt}
                          </p>
                        )}
                        {!post.excerpt && post.meta?.description && (
                          <p className="text-muted-foreground text-sm line-clamp-3 mb-2">
                            {post.meta.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {authorsText && (
                            <div className="mb-1">
                              By {authorsText}
                            </div>
                          )}
                          {post.publishedAt && new Date(post.publishedAt).toLocaleDateString()}
                        </div>
                        <Link
                          href={`/posts/${post.slug}`}
                          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          Read <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-xl">
              <p className="text-muted-foreground">
                Personal stories and blog posts will be featured here as they&apos;re published.
              </p>
            </div>
          )}
          
          <div className="text-center">
            <Link 
              href="/posts"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              View All Posts
            </Link>
          </div>
        </section>

        {/* Academic Journey Stages */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Academic Journey</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each stage brings its own unique challenges, growth opportunities, and revelations.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
            {academicStages.map((stage, index) => (
              <div key={index} className={`bg-gradient-to-br ${stage.color} bg-card border rounded-xl p-6 hover:scale-105 transition-all duration-300 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-[350px]`}>
                <div className="mb-4">
                  <h3 className="font-bold text-foreground">{stage.stage}</h3>
                  <p className="text-sm text-muted-foreground">{stage.duration}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{stage.focus}</p>
                <div>
                  <p className="text-xs font-medium text-foreground mb-2">Key Challenges:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {stage.challenges.map((challenge, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* Financial Reality */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Financial Reality</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Let&apos;s talk about money - because passion doesn&apos;t pay the bills (but it might barely cover them).
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-bold text-foreground mb-4">PhD Stipends</h3>
              <p className="text-muted-foreground text-sm">
                In India: ₹37,000-₹42,000/month for PhD scholars (JRF/SRF). 
                Just enough to survive, rarely enough to thrive.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-bold text-foreground mb-4">Funding Sources</h3>
              <p className="text-muted-foreground text-sm">
                Multiple income streams keep academics afloat: fellowships, 
                teaching assistantships, research grants.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-bold text-foreground mb-4">Long-term View</h3>
              <p className="text-muted-foreground text-sm">
                Academic careers require patience. Financial stability 
                often comes later but can be very rewarding.
              </p>
            </div>
          </div>
        </section>



        {/* Call to Action */}
        <section className="text-center py-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join the Academic Community?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Academic life isn&apos;t for everyone, but for those called to it, it can be incredibly fulfilling. 
            The world needs curious minds pushing the boundaries of knowledge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/posts"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Read More Stories
            </Link>
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
            >
              Connect & Discuss
            </Link>
          </div>
        </section>

        {/* Comments Section */}
        <Comments
          title="Life of an Academia Student"
          className="mt-16"
        />

      </div>
    </div>
  )
}