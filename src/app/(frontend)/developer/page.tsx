import type { Metadata } from 'next/types'
import React from 'react'
import Link from 'next/link'
import {
  ExternalLink
} from 'lucide-react'
import GitHubCalendar from 'react-github-calendar'
import PageClient from './page.client'

export const dynamic = 'force-static'

// GitHub repositories configuration - add your repos in the order you want them to appear
const GITHUB_REPOS_CONFIG = [
  {
    owner: 'kartikmandar',
    repo: 'kartikmandar',
    featured: true,
    description: 'Personal portfolio website showcasing projects and professional experience'
  },
  {
    owner: 'kartikmandar',
    repo: 'promptprep',
    featured: true,
    description: 'Python CLI tool to aggregate code files & directory structure into one file, perfect for LLM context preparation'
  },
  {
    owner: 'kartikmandar',
    repo: 'RIPPLe',
    featured: true,
    description: 'Data Processing Pipeline for LSST gravitational lensing studies'
  },
  {
    owner: 'kartikmandar',
    repo: 'dave',
    featured: true,
    description: 'Modernized astronomical data analysis GUI application'
  },
  {
    owner: 'kartikmandar',
    repo: 'iGEM',
    featured: true,
    description: 'Synthetic biology project wiki and computational analysis for KeratiNoMore project'
  },
  {
    owner: 'kartikmandar',
    repo: 'fftvis',
    featured: true,
    description: 'Non-uniform Fast Fourier Transform based interferometric visibility simulator'
  },
  {
    owner: 'kartikmandar',
    repo: 'deeplense-tasks',
    featured: true,
    description: 'Deep learning workflows for gravitational lensing analysis tasks'
  },
  {
    owner: 'kartikmandar',
    repo: 'makeahomie',
    featured: true,
    description: 'Homelab management and automation scripts for personal infrastructure'
  },
  {
    owner: 'kartikmandar',
    repo: 'all_code',
    featured: true,
    description: 'Collection of code snippets and utilities for various programming tasks'
  },
  {
    owner: 'kartikmandar',
    repo: 'stingray-notebooks',
    featured: true,
    description: 'Jupyter notebooks for X-ray astronomy analysis using Stingray library'
  },
  {
    owner: 'kartikmandar',
    repo: 'RRIsecretsanta',
    featured: true,
    description: 'Secret Santa gift exchange management system for Raman Research Institute'
  },
  {
    owner: 'kartikmandar',
    repo: 'AstroBlog',
    featured: true,
    description: 'Astronomy and astrophysics blog platform for sharing research and insights'
  },
  {
    owner: 'StingraySoftware',
    repo: 'StingrayExplorer',
    featured: true,
    description: 'Interactive quicklook dashboard for X-ray astronomy data analysis'
  },
  {
    owner: 'AIIM2023',
    repo: 'AIIM2023.github.io',
    featured: true,
    description: 'Official website for All India iGEM Meet 2023 conference'
  },
  {
    owner: 'cygnus-x1-analysis',
    repo: 'Analysis',
    featured: true,
    description: 'Timing and spectral analysis of Cygnus X-1 using NuSTAR observations'
  },
  {
    owner: 'cygnus-x1-analysis',
    repo: 'scripts',
    featured: true,
    description: 'Data processing scripts for Cygnus X-1 X-ray analysis workflows'
  },
  {
    owner: 'RRI-interferometry',
    repo: 'hera_strip',
    featured: true,
    description: 'HERA data strip processing and analysis tools for radio interferometry'
  },
  {
    owner: 'RRI-interferometry',
    repo: 'RRIVis',
    featured: true,
    description: 'Radio interferometric visibility simulator for HERA validation'
  },
  {
    owner: 'RRI-interferometry',
    repo: 'HERA',
    featured: true,
    description: 'Hydrogen Epoch of Reionization Array data analysis and validation tools'
  },
  {
    owner: 'LinkSpace-by-Merakinist',
    repo: 'chrome_extension',
    featured: true,
    description: 'Chrome extension for enhanced browsing and productivity features'
  },
  {
    owner: 'Capstone-Projects-for-courses',
    repo: 'CustomerSupportAutomation',
    featured: true,
    description: 'Automated customer support system with AI-powered responses and ticket management'
  }
]

// GitHub API functions
async function fetchGitHubRepo(owner: string, repo: string) {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      console.warn(`Failed to fetch ${owner}/${repo}: ${response.status}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching ${owner}/${repo}:`, error)
    return null
  }
}

async function fetchGitHubReposData() {
  const reposData = []

  for (const repoConfig of GITHUB_REPOS_CONFIG) {
    const data = await fetchGitHubRepo(repoConfig.owner, repoConfig.repo)
    if (data) {
      reposData.push({
        ...data,
        config: repoConfig
      })
    }
  }

  return reposData
}

// Language color mapping
const LANGUAGE_COLORS: { [key: string]: string } = {
  Python: '#3572A5',
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  'Jupyter Notebook': '#DA5B0B',
  Makefile: '#427819',
  Dockerfile: '#384d54'
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Software Developer Profile | Kartik Mandar - Full-Stack Development & Scientific Computing',
    description: 'Expert software developer specializing in full-stack web development, mobile apps, data visualization, and scientific computing. Proficient in React, Next.js, Python, and modern development tools.',
    openGraph: {
      title: 'Software Developer Profile - Kartik Mandar',
      description: 'Full-stack developer & astrophysicist with expertise in web development, mobile apps, and scientific computing.',
    },
  }
}

const technicalSkills = [
  {
    category: "Programming Languages",
    skills: ["Python", "C", "Kotlin", "React Native", "JavaScript"]
  },
  {
    category: "Web and App",
    skills: ["HTML/CSS", "React", "Vite.js", "Bootstrap", "Tailwind", "Apache", "OpenLiteSpeed", "CyberPanel", "cPanel", "WordPress", "Webflow", "Svelte + Sveltekit", "Astro", "Expo", "Electron.JS"]
  },
  {
    category: "Database",
    skills: ["PostgreSQL", "SQLite"]
  },
  {
    category: "Backends",
    skills: ["NodeJS", "Django"]
  },
  {
    category: "Cloud",
    skills: ["Google Cloud Platform", "Digital Ocean", "Linode", "Hugging Face", "Firebase"]
  },
  {
    category: "Dev",
    skills: ["Git", "CI/CD", "Shell Scripting", "Nano", "Docker", "K8s", "Slurm", "SSH/SCP"]
  },
  {
    category: "Visualization",
    skills: ["Bokeh", "Plotly", "Matplotlib", "HoloViews", "Datashader", "HVplot"]
  },
  {
    category: "Mathematical & Statistical Tools",
    skills: ["STATA", "Matlab", "Mathematica"]
  }
]

const developmentExperience = [
  {
    period: "Aug 2025 - Present",
    role: "DevOps & System Administrator",
    organization: "Personal Homelab Project",
    achievements: [
      "Built 4-node Proxmox HA cluster with TrueNAS Z2 storage and failover WANs",
      "Set up Kubernetes development environment with containerized services (n8n, Django, Envoy)",
      "Optimized performance across heterogeneous nodes with resource allocation and network segmentation",
      "Deployed Proxmox Backup Server with deduplication and centralized storage management",
      "Configured RAID Z2 storage, backup schedulers, UPS management, and Pi-hole Unbound DNS"
    ],
    technologies: ["Proxmox", "Kubernetes", "Docker", "TrueNAS", "Linux System Administration", "Network Configuration", "High Availability", "Backup Solutions"]
  },
  {
    period: "Jan 2024 - Mar 2024",
    role: "Full-Stack Developer & System Administrator",
    organization: "IISERB Community Mastodon Platform",
    achievements: [
      "Deployed and configured Mastodon server on Digital Ocean with Ubuntu 20.04",
      "Managed DNS configuration, SSL encryption, and intrusion prevention systems",
      "Set up full stack with Ruby dependencies, PostgreSQL database, and Digital Ocean Spaces",
      "Implemented object storage solutions and optimized database performance"
    ],
    technologies: ["Ruby on Rails", "PostgreSQL", "Linux Server Administration", "Digital Ocean", "DNS Management", "SSL/TLS", "Object Storage"]
  },
  {
    period: "May 2023 - Nov 2023",
    role: "Mobile App Developer",
    organization: "Mental Health Research Project",
    achievements: [
      "Developed cross-platform mobile app for sensor data logging (Kotlin → React Native)",
      "Built NodeJS backend with MySQL database for automated data collection and transfer",
      "Designed for mental health study analyzing anxiety/depression using ML on collected data",
      "Implemented real-time data synchronization and secure server communications"
    ],
    technologies: ["React Native", "Node.js", "MySQL", "Mobile Development", "Data Collection", "Machine Learning Integration", "API Development"]
  },
  {
    period: "Aug 2022 - Jul 2023",
    role: "Full-Stack Web Developer",
    organization: "Conference & Event Websites",
    achievements: [
      "Developed Science Rendezvous 2023 website for University of Toronto",
      "Built AIIM 2023 conference website with complex scheduling and registration systems",
      "Created Enthuzia 2023 cultural fest website handling event management",
      "Developed IISM 2022 sports meet website with housing, mess, results, and logistics management"
    ],
    technologies: ["Full-Stack Development", "React", "Node.js", "Database Design", "Event Management Systems", "Registration Systems", "Web Development"]
  },
  {
    period: "Feb 2023 - Dec 2023",
    role: "Technical Lead & Web Developer",
    organization: "iGEM 2023 Synthetic Biology Project",
    achievements: [
      "Contributed to project wiki development and molecular dynamics simulations in GROMACS",
      "Validated gene insertion in membrane for KeratiNoMore project",
      "Gained experience in team collaboration, project management, and technical documentation",
      "Supported computational analysis for synthetic biology research"
    ],
    technologies: ["Web Development", "Molecular Dynamics", "Computational Biology", "Project Management", "Technical Documentation", "Team Collaboration"]
  }
]



export default async function DeveloperPage() {
  // Fetch GitHub repositories data
  const githubRepos = await fetchGitHubReposData()
  return (
    <>
      <PageClient />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">

          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
              Software Developer Profile
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              This is the page where I have discussed about most of my recent developer experience.
            </p>
          </div>

          {/* Projects Showcase */}
          <section id="projects" className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Projects Showcase</h2>
            </div>

            {githubRepos.length > 0 ? (
              <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                {githubRepos.map((repo, index) => (
                  <div key={index} className="bg-card border border-border rounded-lg p-6 hover:bg-accent/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{repo.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {repo.owner.login}/{repo.name}
                        </p>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">
                      {repo.config.description || repo.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {repo.language && (
                          <>
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#666' }}
                            />
                            <span className="text-sm text-muted-foreground">{repo.language}</span>
                          </>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Updated: {new Date(repo.updated_at).toLocaleDateString()}
                      </div>
                    </div>

  
                    <div className="flex gap-2">
                      <Link
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors text-sm"
                      >
                        View Repository
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Unable to fetch GitHub repositories at this time.</p>
              </div>
            )}
          </section>

          {/* GitHub Contribution Calendar */}
          <section id="contributions" className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">GitHub Commits</h2>
            </div>

            <div className="bg-card border border-border rounded-lg p-8 max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <GitHubCalendar
                  username="kartikmandar"
                  colorScheme="light"
                  blockSize={15}
                  blockMargin={4}
                  fontSize={14}
                  theme={{
                    light: [
                      '#ebedf0',
                      '#9be9a8',
                      '#40c463',
                      '#30a14e',
                      '#216e39'
                    ],
                    dark: [
                      '#161b22',
                      '#0e4429',
                      '#006d32',
                      '#26a641',
                      '#39d353'
                    ]
                  }}
                />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <Link
                  href="https://github.com/kartikmandar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  View full GitHub profile
                  <ExternalLink size={16} />
                </Link>
              </div>
            </div>
          </section>

          {/* Technical Skills Section */}
          <section id="skills" className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Technical Skills</h2>
            </div>

            <div className="bg-card border border-border rounded-lg p-8 max-w-4xl mx-auto">
              {technicalSkills.map((category, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  <h3 className="text-lg font-semibold mb-3 text-foreground">{category.category}:</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {category.skills.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Development Experience */}
          <section id="experience" className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Development Experience</h2>
            </div>

            <div className="space-y-8">
              {developmentExperience.map((experience, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6 hover:bg-accent/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{experience.role}</h3>
                      <p className="text-muted-foreground mb-2">{experience.organization}</p>
                    </div>
                    <p className="text-sm text-muted-foreground text-right">{experience.period}</p>
                  </div>

                  <div className="mb-4">
                    <ul className="space-y-1">
                      {experience.achievements.map((achievement, achievementIndex) => (
                        <li key={achievementIndex} className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                          <span className="text-sm">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  </div>
              ))}
            </div>
          </section>

          {/* Contact CTA */}
          <section id="contact" className="text-center">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Build Something Amazing?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Let&apos;s discuss your project requirements and how I can help bring your ideas to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Start a Conversation
                </Link>
                <Link
                  href="/consultancy"
                  className="inline-flex items-center justify-center px-8 py-4 bg-card border border-border text-card-foreground font-semibold rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  View Consultancy Services
                </Link>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  )
}