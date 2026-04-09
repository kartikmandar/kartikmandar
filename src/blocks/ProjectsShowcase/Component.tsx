import React from 'react'
import NextImage from 'next/image'
import type { Project as DataProject } from '@/data/types'
import type { Media } from '@/data/types'
import { Github, ExternalLink } from 'lucide-react'

interface ProjectsShowcaseProps {
  blockName?: string
  blockType: 'projectsShowcase'
  title?: string
  subtitle?: string
  showAllProjects?: boolean
  projects?: (string | DataProject)[]
  showFeaturedOnly?: boolean
  maxProjects?: number
  layout?: 'grid-3' | 'grid-2' | 'grid-4' | 'mixed'
  showViewAllButton?: boolean
  viewAllButtonText?: string
  viewAllButtonUrl?: string
}

export const ProjectsShowcase: React.FC<ProjectsShowcaseProps> = ({
  title = 'Featured Projects',
  projects: payloadProjects = [],
  layout = 'grid-3',
  maxProjects = 20,
}) => {
  const projects = payloadProjects
    .filter((project): project is DataProject => typeof project === 'object' && project !== null)
    .sort((a, b) => {
      const orderA = a.displayOrder ?? 999999
      const orderB = b.displayOrder ?? 999999
      if (orderA !== orderB) return orderA - orderB
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })
    .slice(0, maxProjects)

  const gridClasses = {
    'grid-2': 'md:grid-cols-2',
    'grid-3': 'md:grid-cols-2 lg:grid-cols-3',
    'grid-4': 'md:grid-cols-2 lg:grid-cols-4',
    'mixed': 'md:grid-cols-2 lg:grid-cols-3',
  }

  if (projects.length === 0) {
    return (
      <div id="my-projects" className="container my-16">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            {title}
          </h2>
          <p className="text-muted-foreground">No projects yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div id="my-projects" className="container my-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            {title}
          </h2>
        </div>

        <div className={`grid grid-cols-1 ${gridClasses[layout]} gap-6`}>
          {projects.map((project) => {
            const coverImage = project.coverImage as Media | null
            const coverImageUrl = coverImage?.url || null
            const coverImageAlt = coverImage?.alt || project.title
            const githubUrl = project.links?.githubUrl
            const demoUrl = project.links?.demoUrl
            const techStack = project.techStack?.slice(0, 4) || []
            const remainingTech = (project.techStack?.length || 0) - 4

            return (
              <div
                key={project.id}
                className="bg-card border border-border rounded-lg overflow-hidden transition-colors hover:bg-accent/50 flex flex-col"
              >
                {/* Cover Image */}
                {coverImageUrl && (
                  <div className="relative h-40 md:h-48 bg-muted">
                    <NextImage
                      src={coverImageUrl}
                      alt={coverImageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {project.title}
                  </h3>

                  {project.category && (
                    <span className="text-xs uppercase text-muted-foreground font-medium tracking-wide mb-3">
                      {project.category.replace('-', ' ')}
                    </span>
                  )}

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3 flex-1">
                    {project.shortDescription || project.description}
                  </p>

                  {/* Tech Stack */}
                  {techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {techStack.map((tech, index) => {
                        const techName = typeof tech === 'string' ? tech : tech.technology
                        return (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full"
                          >
                            {techName}
                          </span>
                        )
                      })}
                      {remainingTech > 0 && (
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                          +{remainingTech} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex items-center gap-2 mt-auto pt-2">
                      {githubUrl && (
                        <a
                          href={githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          <Github className="w-3.5 h-3.5" />
                          Repo
                        </a>
                      )}
                      {demoUrl && (
                        <a
                          href={demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-accent transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Demo
                        </a>
                      )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ProjectsShowcase
