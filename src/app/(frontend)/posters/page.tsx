import type { Metadata } from 'next/types'
import React from 'react'
import { 
  Presentation,
  Calendar,
  MapPin,
  Users,
  ExternalLink,
  Award
} from 'lucide-react'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Posters | Kartik Mandar - Research Presentations',
    description: 'Academic posters and presentations in astrophysics, radio interferometry, and computational astronomy research.',
    openGraph: {
      title: 'Posters - Kartik Mandar',
      description: 'Research posters and presentations in astrophysics and radio astronomy.',
    },
  }
}

export default async function PostersPage(): Promise<React.JSX.Element> {
  const posters = [
    {
      title: "RRIVis: 21cm Visibility Simulator",
      subtitle: "21cm Visibility Simulator for Epoch of Reionization Studies",
      venue: "In-House Physics Symposium",
      location: "IISER Bhopal",
      date: "5th March, 2025",
      category: "Radio Astronomy",
      abstract: "The RRIVis 21cm Visibility Simulator is a computational tool designed to generate synthetic visibility data for radio interferometric observations of the cosmic 21cm signal during the Epoch of Reionization (EoR). This simulator addresses the need for realistic datasets to test analysis pipelines and instrumentation in the context of upcoming radio telescopes. The tool incorporates customizable parameters, including array configurations and observation frequencies, to mimic real-world observational conditions.",
      icon: <Presentation className="w-8 h-8" />,
      color: "from-blue-500/20 to-purple-500/20 border-blue-500/30",
      posterUrl: "https://drive.google.com/file/d/1CGS4VNEFCh-vqCNOrh8nhtb29HcaBy9V/view?usp=sharing"
    }
  ]

  // Group posters by category
  const groupedPosters = posters.reduce((acc, poster) => {
    if (!acc[poster.category]) {
      acc[poster.category] = []
    }
    acc[poster.category]!.push(poster)
    return acc
  }, {} as Record<string, typeof posters>)

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            Posters
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
            Academic posters and presentations showcasing research contributions in astrophysics, radio interferometry, and computational astronomy.
          </p>
        </div>

        {/* Posters by Category */}
        {Object.entries(groupedPosters).map(([category, categoryPosters]) => (
          <section key={category} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-foreground">{category}</h2>
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {categoryPosters.length} poster{categoryPosters.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="grid gap-8">
              {categoryPosters.map((poster, index) => (
                <div 
                  key={`${category}-${index}`} 
                  className={`bg-gradient-to-br ${poster.color} bg-card border rounded-xl p-8 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg group`}
                >
                  <div className="grid lg:grid-cols-3 gap-6">
                    
                    {/* Left Column - Title */}
                    <div className="lg:col-span-1">
                      <h3 className="text-2xl font-bold mb-2 text-foreground">
                        {poster.title}
                      </h3>
                      {poster.subtitle && (
                        <p className="text-lg text-primary font-medium mb-4">
                          {poster.subtitle}
                        </p>
                      )}
                      
                      {/* Presentation Details */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{poster.venue}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">{poster.location}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">{poster.date}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* View Poster Button */}
                      {poster.posterUrl ? (
                        <a
                          href={poster.posterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Poster
                        </a>
                      ) : (
                        <div className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-muted text-muted-foreground cursor-not-allowed">
                          <ExternalLink className="w-4 h-4" />
                          View Poster
                        </div>
                      )}
                    </div>
                    
                    {/* Right Column - Abstract */}
                    <div className="lg:col-span-2">
                      <h4 className="text-lg font-semibold mb-4 text-foreground">Abstract</h4>
                      <div className="bg-background/50 rounded-lg p-6 border border-border/50">
                        <p className="text-muted-foreground leading-relaxed text-justify">
                          {poster.abstract}
                        </p>
                      </div>
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Summary Stats */}
        <section className="mt-16 pt-8 border-t border-border">
          <div className="grid md:grid-cols-2 gap-6 text-center max-w-md mx-auto">
            <div className="bg-card border rounded-lg p-6">
              <div className="text-3xl font-bold text-primary mb-2">{posters.length}</div>
              <div className="text-sm text-muted-foreground">Total Posters</div>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <div className="text-3xl font-bold text-primary mb-2">{Object.keys(groupedPosters).length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}