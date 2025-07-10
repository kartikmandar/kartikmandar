import type { Metadata } from 'next/types'
import React from 'react'
import { 
  Users, 
  BookOpen, 
  MessageCircle,
  ExternalLink,
  Clock,
  Presentation
} from 'lucide-react'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Astrophysics Journal Club | Kartik Mandar - IISER Bhopal',
    description: 'Join the Astrophysics Journal Club at IISER Bhopal for weekly discussions on recent research papers in astronomy and astrophysics. Open to all levels.',
    openGraph: {
      title: 'Astrophysics Journal Club - IISER Bhopal',
      description: 'Weekly discussions on latest research in astronomy and astrophysics',
    },
  }
}

export default async function JournalClubPage() {
  const features = [
    {
      title: "Open Discussions",
      description: "Papers can be from any field of astronomy and astrophysics. Discussions are open—anyone can participate, share insights, or ask questions.",
      icon: <MessageCircle className="w-8 h-8" />,
      color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30"
    },
    {
      title: "Regular Presentations",
      description: "Core members are expected to present at least two papers per month that they have read, ensuring consistent engagement.",
      icon: <Presentation className="w-8 h-8" />,
      color: "from-green-500/20 to-emerald-500/20 border-green-500/30"
    },
    {
      title: "Weekly Sessions",
      description: "We hold weekly sessions Friday nights, making it a regular habit to explore and analyze new research.",
      icon: <Clock className="w-8 h-8" />,
      color: "from-purple-500/20 to-pink-500/20 border-purple-500/30"
    },
    {
      title: "Guest Speakers",
      description: "We invite speakers to discuss their own research papers and findings, providing insights from active researchers.",
      icon: <Users className="w-8 h-8" />,
      color: "from-orange-500/20 to-red-500/20 border-orange-500/30"
    }
  ]

  const benefits = [
    "Stay updated with the latest discoveries in astronomy and astrophysics",
    "Develop presentation skills by discussing papers in a group setting", 
    "Explore diverse fields as members bring different expertise and interests",
    "Engage in scientific discussions that encourage critical thinking and deeper understanding of research topics"
  ]

  const recentPresentations = [
    {
      title: "Are your visibilities Validated?",
      presenter: "Kartik Mandar",
      url: "https://www.kartikmandar.com/posterspublications",
      date: "14th March 2025"
    },
    {
      title: "On the Hubble Constant Tension in the SNe Ia Pantheon Sample",
      presenter: "Mudit Parakh", 
      url: "https://iopscience.iop.org/article/10.3847/1538-4357/abeb73",
      date: "10th Feb 2025"
    },
    {
      title: "If light waves are stretched by gravitational waves, how can we use light as a ruler to detect gravitational waves?",
      presenter: "Roshan Dora",
      url: "https://pubs.aip.org/aapt/ajp/article/65/6/501/530040/If-light-waves-are-stretched-by-gravitational",
      date: "10th Feb 2025"
    },
    {
      title: "A Heuristic Introduction to Radioastronomical Polarization",
      presenter: "Kartik Mandar",
      url: "https://arxiv.org/abs/astro-ph/0107327",
      note: "(first part)",
      date: "3rd Feb 2025"
    },
    {
      title: "Search for MeV gamma-ray emission from TeV bright red dwarfs with COMPTEL",
      presenter: "Niharika Shrivastava",
      url: "https://iopscience.iop.org/article/10.1088/1475-7516/2024/09/029/meta",
      date: "26th Jan 2025"
    },
    {
      title: "The Dark Ages of the Universe",
      presenter: "Kartik Mandar",
      url: "https://lweb.cfa.harvard.edu/~loeb/sciam.pdf",
      date: "26th Jan 2025"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            Astrophysics Journal Club
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-2">
            IISER Bhopal
          </p>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            A space for informal discussions on recent and impactful papers in astronomy and astrophysics. Our sessions are open to everyone, fostering a collaborative environment where participants can engage in thought-provoking conversations about the latest research.
          </p>
        </div>

        {/* How It Works Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`bg-gradient-to-br ${feature.color} bg-card border rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg`}
              >
                <div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Join Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Why Join?</h2>
          <div className="bg-card border border-border rounded-xl p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-muted-foreground leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-center text-muted-foreground italic">
                Whether you are an undergraduate, a researcher, or just an astronomy enthusiast, the Astrophysics Journal Club provides a fantastic platform to enhance your knowledge, refine your scientific communication skills, and be part of an engaging community passionate about the cosmos.
              </p>
            </div>
          </div>
        </section>

        {/* Recent Presentations */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Recent Presentations</h2>
          <div className="space-y-6">
            {recentPresentations.map((presentation, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {presentation.title}
                      {presentation.note && (
                        <span className="text-sm text-muted-foreground font-normal ml-2">
                          {presentation.note}
                        </span>
                      )}
                    </h3>
                    <p className="text-muted-foreground">
                      Presented by: <span className="font-medium">{presentation.presenter}</span>
                      {presentation.date && (
                        <span className="ml-4 text-sm">
                          • {presentation.date}
                        </span>
                      )}
                    </p>
                  </div>
                  <a
                    href={presentation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors font-medium"
                  >
                    <BookOpen className="w-4 h-4" />
                    View Paper
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Meeting Schedule */}
        <section className="mb-16">
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Weekly Sessions</h2>
            <p className="text-lg text-muted-foreground mb-4">
              Join us every <span className="font-semibold text-foreground">Friday night</span> for our regular journal club sessions.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Contact us for specific timings and location details.
            </p>
            <a
              href="https://meet.google.com/svp-wzpo-ztf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Join Google Meet
            </a>
          </div>
        </section>

      </div>
    </div>
  )
}