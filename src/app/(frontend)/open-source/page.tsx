import type { Metadata } from 'next/types'
import React from 'react'
import {
  Users,
  ExternalLink
} from 'lucide-react'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Open Source Contributions | Kartik Mandar - Building the Future of Technology',
    description: 'Explore my open source contributions including Google Summer of Code projects, GitHub contributions, and community impact.',
    openGraph: {
      title: 'Open Source Contributions - Building the Future of Technology',
      description: 'Discover my journey in open source, GSoC projects, and contributions to the tech community.',
    },
  }
}

// Mock data - replace with actual data from GitHub API or CMS

const gsocProjects = [
  {
    year: 2025,
    organization: "ML4Sci (DeepLense)",
    project: "Data Processing Pipeline for the LSST",
    mentors: ["Prof. Sergei Gleyzer", "Dr. Michael Toomey", "Anna Parul", "Lucca Paris"],
    duration: "May - September 2025",
    description: "Developing a dedicated pipeline that bridges LSST data access tools with DeepLense deep learning workflows for efficient retrieval, preprocessing, and transformation of LSST images and catalogs for gravitational lensing studies.",
    features: [
      "LSST Butler API integration for data access",
      "Configurable preprocessing module for cutout extraction and normalization",
      "DeepLense ML workflow integration with PyTorch DataLoader support",
      "Validating on DP0.2 mock survey data with performance metrics"
    ],
    finalReportUrl: "https://github.com/kartikmandar/RIPPLe",
    proposalUrl: "https://drive.google.com/file/d/1PsR4uNVVwPyAC_WN3On1DHrbXwdH3-Zh/view?usp=sharing",
    weeklyBlogsUrl: "https://gsoc2025.blogspot.com/",
    repositoryUrl: "https://github.com/kartikmandar/RIPPLe"
  },
  {
    year: 2024,
    organization: "Open Astronomy",
    project: "A Quicklook Dashboard for X-ray Astronomy with Stingray",
    mentors: ["Prof. Matteo Bachetti", "Dr. Guglielmo Mastroserio"],
    duration: "May - September 2024",
    description: "Developed a configurable quicklook dashboard for X-ray astronomy data analysis using the Stingray library, facilitating visualization of light curves, periodograms, Cross spectra, Power Spectra, Average Power Spectra, Dynamical Power Spectra and spectral colors with interactive data exploration.",
    features: [
      "Flexible dashboard with configurable widgets, plots and layouts",
      "Interactive data visualization",
      "Bokeh + Datashader based plotting for real-time updates",
      "Multiprocessing support",
    ],
    finalReportUrl: "/open-source/stingray-explorer",
    proposalUrl: "https://drive.google.com/file/d/1VnP1hpKPUtQin5lKPRWXS-Ai2EW8057b/view?usp=sharing",
    weeklyBlogsUrl: "https://gsoc2024.blogspot.com/",
    repositoryUrl: "https://github.com/StingraySoftware/StingrayExplorer"
  }
]

const featuredProjects = [
  {
    name: "PromptPrep",
    organization: "Personal Project",
    description: "Python CLI tool to aggregate code files & directory structure into one file, perfect for LLM context preparation. Features interactive file selection, multiple output formats, and smart code analysis.",
    role: "Creator & Maintainer",
    duration: "April 2025 - Present",
    features: [
      "Interactive TUI for visual file selection",
      "Multiple output formats (plain, markdown, HTML, highlighted)",
      "Token counting for AI model context limits",
      "Incremental processing and diff generation"
    ],
    techStack: ["Python", "Pytest"],
    repositoryUrl: "https://github.com/kartikmandar/promptprep",
    contributionsUrl: "https://github.com/kartikmandar/promptprep",
    impact: "Published on PyPI with 12 releases"
  },
  {
    name: "DAVE",
    organization: "StingraySoftware",
    description: "Helped bring an outdated astronomical data analysis GUI back to life. The application hadn't been updated in 8 years, so I worked on modernizing the entire technology stack.",
    role: "Contributor",
    duration: "March 2025 - Present",
    features: [
      "Updated Python, Flask, and Electron to current versions",
      "Improved application performance and memory usage",
      "Enhanced security and fixed vulnerabilities",
      "Added modern UI features like dark mode"
    ],
    techStack: ["Python", "Flask", "Electron", "JavaScript"],
    repositoryUrl: "https://github.com/StingraySoftware/dave",
    contributionsUrl: "https://github.com/StingraySoftware/dave/pull/79",
    impact: "Made the tool usable again for astronomers analyzing X-ray data"
  }
]




export default function OpenSourcePage(): React.JSX.Element {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-5xl mx-auto">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            Open Source Contributions
          </h1>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
            Building the future of technology, one commit at a time.
          </p>
        </div>


        {/* Google Summer of Code Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Google Summer of Code
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Contributing to open source through Google&apos;s Summer of Code mentorship program.
            </p>
          </div>
          
          <div className="space-y-6">
            {gsocProjects.map((gsocProject, projectIndex) => (
              <div key={projectIndex} className="bg-card border border-border rounded-lg p-6 md:p-8 transition-colors hover:bg-accent/50">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div className="order-2 sm:order-1">
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">{gsocProject.project}</h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {gsocProject.organization}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>{gsocProject.duration}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="w-full sm:w-auto">Mentor{gsocProject.mentors.length > 1 ? 's' : ''}: {gsocProject.mentors.join(', ')}</span>
                    </div>
                  </div>
                  <div className="order-1 sm:order-2 text-3xl font-bold text-muted-foreground flex-shrink-0">
                    {gsocProject.year}
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6">{gsocProject.description}</p>
                
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Features</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {gsocProject.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <a
                    href={gsocProject.finalReportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    Final Report <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href={gsocProject.weeklyBlogsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors text-sm"
                  >
                    Weekly Blogs <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href={gsocProject.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors text-sm"
                  >
                    View Repository <ExternalLink className="w-4 h-4" />
                  </a>
                  {gsocProject.proposalUrl && (
                    <a
                      href={gsocProject.proposalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors text-sm"
                    >
                      Proposal <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Other Contributions */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Other Contributions</h2>
          </div>
          
          <div className="space-y-6">
            {featuredProjects.map((project, projectIndex) => (
              <div key={projectIndex} className="bg-card border border-border rounded-lg p-6 md:p-8 transition-colors hover:bg-accent/50">
                <div className="flex flex-col gap-4 mb-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">{project.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {project.organization}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>{project.duration}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                        {project.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-muted rounded-md">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6">{project.description}</p>
                
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Features</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {project.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm text-muted-foreground italic order-2 sm:order-1">
                    {project.impact}
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-4 order-1 sm:order-2">
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                    >
                      Repository <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                      href={project.contributionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors text-sm"
                    >
                      My Contributions <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>




      </div>
    </div>
  )
}