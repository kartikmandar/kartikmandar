import type { Metadata } from 'next/types'
import React from 'react'
import { 
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { formatAuthors } from '@/utilities/formatAuthors'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Life of an Academia Student | Kartik Mandar - The Real Academic Journey',
    description: 'An honest look into what life is really like for students and researchers in academia - from undergraduate studies to PhD and beyond.',
    openGraph: {
      title: 'Life of an Academia Student - The Real Academic Journey',
      description: 'Discover the realities, challenges, and rewards of pursuing a career in academia.',
    },
  }
}

// Helper function to extract text from Lexical content
function extractTextFromContent(content: unknown): string {
  if (!content || typeof content !== 'object') return ''
  
  const contentObj = content as { root?: { children?: unknown[] } }
  if (!contentObj.root || !contentObj.root.children) return ''
  
  const extractText = (node: unknown): string => {
    if (!node || typeof node !== 'object') return ''
    
    const nodeObj = node as { type?: string; text?: string; children?: unknown[] }
    
    if (nodeObj.type === 'text') {
      return nodeObj.text || ''
    }
    
    if (nodeObj.children && Array.isArray(nodeObj.children)) {
      return nodeObj.children.map(extractText).join(' ')
    }
    
    return ''
  }
  
  const fullText = contentObj.root.children.map(extractText).join(' ')
  // Return first 150 characters with word boundary
  if (fullText.length <= 150) return fullText
  return fullText.substring(0, 150).split(' ').slice(0, -1).join(' ') + '...'
}

export default async function AcademicLifePage(): Promise<React.JSX.Element> {
  // Fetch blog posts from CMS
  const payload = await getPayload({ config: configPromise })
  
  const postsData = await payload.find({
    collection: 'posts',
    depth: 2,
    limit: 6,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      meta: true,
      publishedAt: true,
      heroImage: true,
      populatedAuthors: true,
      authors: true,
      content: true,
    },
  })
  
  const posts = postsData.docs
  
  // Debug: Log the posts data to see what we're getting
  console.log('Posts data:', JSON.stringify(posts, null, 2))

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
    }
  ]

  const dailyRealities = [
    {
      time: "6:00 AM",
      activity: "Early morning reading",
      description: "Coffee + latest papers in your field",
    },
    {
      time: "9:00 AM",
      activity: "Research work",
      description: "Experiments, coding, analysis, or writing",
    },
    {
      time: "12:00 PM",
      activity: "Lunch & networking",
      description: "Discussing ideas with peers and advisors",
    },
    {
      time: "2:00 PM",
      activity: "Coursework/Teaching",
      description: "Classes, assignments, or TA duties",
    },
    {
      time: "6:00 PM",
      activity: "Reading & planning",
      description: "Literature review and next day preparation",
    },
    {
      time: "9:00 PM",
      activity: "Personal time",
      description: "Hobbies, exercise, or just unwinding",
    }
  ]

  const challenges = [
    {
      title: "Imposter Syndrome",
      description: "Feeling like you don't belong or aren't smart enough",
      impact: "High",
      color: "from-red-500/20 to-pink-500/20 border-red-500/30"
    },
    {
      title: "Financial Uncertainty",
      description: "Living on stipends, uncertain funding, delayed gratification",
      impact: "High",
      color: "from-orange-500/20 to-red-500/20 border-orange-500/30"
    },
    {
      title: "Work-Life Balance",
      description: "Research never truly 'ends', always something more to do",
      impact: "Medium",
      color: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
    },
    {
      title: "Isolation",
      description: "Working on very specific problems few people understand",
      impact: "Medium",
      color: "from-blue-500/20 to-purple-500/20 border-blue-500/30"
    }
  ]

  const rewards = [
    {
      title: "Intellectual Freedom",
      description: "Pursuing questions you're genuinely curious about",
    },
    {
      title: "Making Discoveries",
      description: "Contributing new knowledge to human understanding",
    },
    {
      title: "Global Community",
      description: "Collaborating with brilliant minds worldwide",
    },
    {
      title: "Teaching Impact",
      description: "Inspiring the next generation of researchers",
    }
  ]

  const researchProcess = [
    {
      step: "Question",
      description: "Identify an interesting, unanswered question",
      duration: "Weeks to months"
    },
    {
      step: "Literature Review",
      description: "Read everything related to understand the field",
      duration: "1-3 months"
    },
    {
      step: "Methodology",
      description: "Design experiments or theoretical approach",
      duration: "Weeks to months"
    },
    {
      step: "Research",
      description: "Conduct experiments, collect data, analyze",
      duration: "Months to years"
    },
    {
      step: "Writing",
      description: "Draft papers, get feedback, revise extensively",
      duration: "3-6 months"
    },
    {
      step: "Publication",
      description: "Peer review process, revisions, final publication",
      duration: "6-18 months"
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
                // Get thumbnail from meta.image (same as posts page)
                const thumbnail = post.meta?.image
                const thumbnailUrl = thumbnail && typeof thumbnail === 'object' && thumbnail.url ? thumbnail.url : null
                const thumbnailAlt = thumbnail && typeof thumbnail === 'object' && thumbnail.alt ? thumbnail.alt : post.title
                
                // Get formatted authors
                console.log(`Post "${post.title}" populatedAuthors:`, post.populatedAuthors)
                console.log(`Post "${post.title}" authors:`, post.authors)
                const hasAuthors = post.populatedAuthors && post.populatedAuthors.length > 0 && formatAuthors(post.populatedAuthors) !== ''
                const authorsText = hasAuthors && post.populatedAuthors ? formatAuthors(post.populatedAuthors) : null
                console.log(`Post "${post.title}" authorsText:`, authorsText)
                
                // Extract content preview
                const contentPreview = extractTextFromContent(post.content)
                
                return (
                  <article key={index} className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
                    {/* Thumbnail */}
                    {thumbnailUrl && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={thumbnailUrl} 
                          alt={thumbnailAlt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {/* Content preview from post content */}
                        {contentPreview && (
                          <p className="text-muted-foreground text-sm line-clamp-3 mb-2">
                            {contentPreview}
                          </p>
                        )}
                        {/* Fallback to meta description if no content preview */}
                        {!contentPreview && post.meta?.description && (
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {academicStages.map((stage, index) => (
              <div key={index} className={`bg-gradient-to-br ${stage.color} bg-card border rounded-xl p-6 hover:scale-105 transition-all duration-300`}>
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

        {/* Daily Life Reality */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">A Day in Academic Life</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              What does a typical day actually look like? Spoiler: it&apos;s rarely typical.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {dailyRealities.map((item, index) => (
              <div key={index} className="flex items-start gap-4 mb-6 p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0 w-16 text-sm font-mono text-primary">
                  {item.time}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{item.activity}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The Research Process */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Research Actually Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From curiosity to published paper - the real timeline and process behind academic research.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {researchProcess.map((step, index) => (
                <div key={index} className="flex items-start gap-4 mb-8 relative">
                  {index < researchProcess.length - 1 && (
                    <div className="absolute left-4 top-12 w-0.5 h-16 bg-border"></div>
                  )}
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 bg-card border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-foreground">{step.step}</h4>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Reality check:</strong> This process is rarely linear. You&apos;ll often cycle back to earlier steps, 
                face rejections, and sometimes start over completely. That&apos;s normal!
              </p>
            </div>
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
              <p className="text-muted-foreground text-sm mb-3">
                In India: ₹31,000-₹35,000/month for PhD scholars (JRF/SRF). 
                Just enough to survive, rarely enough to thrive.
              </p>
              <div className="text-xs text-muted-foreground">
                <div>• Basic living covered</div>
                <div>• Limited savings</div>
                <div>• Delayed financial milestones</div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-bold text-foreground mb-4">Funding Sources</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Multiple income streams keep academics afloat: fellowships, 
                teaching assistantships, research grants.
              </p>
              <div className="text-xs text-muted-foreground">
                <div>• Research fellowships</div>
                <div>• Teaching assistantships</div>
                <div>• Conference travel grants</div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-bold text-foreground mb-4">Long-term View</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Academic careers require patience. Financial stability 
                often comes later but can be very rewarding.
              </p>
              <div className="text-xs text-muted-foreground">
                <div>• Delayed gratification</div>
                <div>• Long-term stability</div>
                <div>• Meaningful work</div>
              </div>
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/posts"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Read More Stories
            </Link>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
            >
              Connect & Discuss
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}