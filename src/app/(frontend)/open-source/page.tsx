import { CardAction, ContentCard } from '@/components/ContentCard'
import { PageHeader } from '@/components/motion'
import type { Metadata } from 'next/types'
import React from 'react'
import { getCanonicalUrl, getServerSideURL } from '@/utilities/getURL'
import { generateBreadcrumbSchema } from '@/utilities/structuredData'
import { Users } from 'lucide-react'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Open Source Contributions | Kartik Mandar - Building the Future of Technology',
    description: 'Explore my open source contributions including Google Summer of Code projects, GitHub contributions, and community impact.',
    alternates: { canonical: getCanonicalUrl('/open-source') },
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




function FeatureList({ features }: { features: string[] }) {
  return (
    <div className="mt-6">
      <h4 className="mono-label mb-3 text-muted-foreground">Features</h4>
      <div className="grid gap-3 md:grid-cols-2">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <div className="size-1.5 flex-shrink-0 rounded-full bg-ember" />
            <span className="text-sm text-foreground/85">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function OpenSourcePage(): React.JSX.Element {
  const serverUrl = getServerSideURL()
  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: 'Home', url: serverUrl },
    { name: 'Open Source', url: `${serverUrl}/open-source` },
  ])

  return (
    <div className="container mx-auto px-4 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-5xl mx-auto">

        <PageHeader eyebrow="Software" title="Open Source Contributions" />


        {/* Google Summer of Code Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="font-display text-display-md text-foreground">
              Google Summer of Code
            </h2>
          </div>
          
          <div className="space-y-6">
            {gsocProjects.map((gsocProject) => (
              <ContentCard
                key={gsocProject.year}
                variant="row"
                eyebrow={gsocProject.year}
                title={gsocProject.project}
                meta={
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1"><Users aria-hidden className="size-4" />{gsocProject.organization}</span>
                    <span>{gsocProject.duration}</span>
                    <span>Mentor{gsocProject.mentors.length > 1 ? 's' : ''}: {gsocProject.mentors.join(', ')}</span>
                  </div>
                }
                summary={<p className="text-base">{gsocProject.description}</p>}
                actions={
                  <>
                    <CardAction href={gsocProject.finalReportUrl} primary>Final Report</CardAction>
                    <CardAction href={gsocProject.weeklyBlogsUrl}>Weekly Blogs</CardAction>
                    <CardAction href={gsocProject.repositoryUrl}>View Repository</CardAction>
                    {gsocProject.proposalUrl && <CardAction href={gsocProject.proposalUrl}>Proposal</CardAction>}
                  </>
                }
              >
                <FeatureList features={gsocProject.features} />
              </ContentCard>
            ))}
          </div>
        </section>

        {/* Other Contributions */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="font-display text-display-md text-foreground">Other Contributions</h2>
          </div>
          
          <div className="space-y-6">
            {featuredProjects.map((project) => (
              <ContentCard
                key={project.name}
                variant="row"
                eyebrow={project.role}
                title={project.name}
                meta={
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1"><Users aria-hidden className="size-4" />{project.organization}</span>
                    <span>{project.duration}</span>
                  </div>
                }
                summary={<p className="text-base">{project.description}</p>}
                tags={project.techStack}
                actions={
                  <>
                    <CardAction href={project.repositoryUrl} primary>Repository</CardAction>
                    <CardAction href={project.contributionsUrl}>My Contributions</CardAction>
                  </>
                }
              >
                <FeatureList features={project.features} />
                <p className="mt-6 text-sm italic text-muted-foreground">{project.impact}</p>
              </ContentCard>
            ))}
          </div>
        </section>




      </div>
    </div>
  )
}