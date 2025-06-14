'use client'

import React, { useState } from 'react'
import { ProjectCard, ProjectModal, type Project } from '@/components/ProjectCard'
import type { Media, Project as PayloadProject } from '@/payload-types'

interface ProjectsShowcaseProps {
  blockName?: string
  blockType: 'projectsShowcase'
  title?: string
  subtitle?: string
  projects?: (string | PayloadProject)[]
  showFeaturedOnly?: boolean
  maxProjects?: number
  layout?: 'grid-3' | 'grid-2' | 'grid-4' | 'mixed'
  showViewAllButton?: boolean
  viewAllButtonText?: string
  viewAllButtonUrl?: string
}

// Helper function to transform Payload project to component project
const transformPayloadProject = (payloadProject: PayloadProject): Project => {
  const project: Project = {
    id: payloadProject.id,
    title: payloadProject.title,
    shortDescription: payloadProject.shortDescription || undefined,
    description: payloadProject.description,
    coverImage: payloadProject.coverImage,
    category: payloadProject.category ? 
      payloadProject.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
      undefined,
    status: payloadProject.projectStatus as 'active' | 'completed' | 'archived',
    techStack: payloadProject.techStack?.map(tech => tech.technology) || [],
  }

  // Transform links
  if (payloadProject.links?.githubUrl) {
    project.github = {
      url: payloadProject.links.githubUrl,
      stars: payloadProject.links.githubStats?.stars || 0,
      forks: payloadProject.links.githubStats?.forks || 0,
    }
    
    // Add additional GitHub stats for metadata
    project.links = {
      githubUrl: payloadProject.links.githubUrl,
      githubStats: {
        language: payloadProject.links.githubStats?.language,
        watchers: payloadProject.links.githubStats?.watchers || 0,
        openIssues: payloadProject.links.githubStats?.openIssues || 0,
        size: payloadProject.links.githubStats?.size || 0,
        lastUpdated: payloadProject.links.githubStats?.lastUpdated,
      }
    }
  }

  if (payloadProject.links?.demoUrl) {
    project.demoUrl = payloadProject.links.demoUrl
  }

  // Transform project details
  if (payloadProject.projectDetails) {
    project.linesOfCode = payloadProject.projectDetails.linesOfCode || undefined
    project.architecture = payloadProject.projectDetails.architecture || undefined
    project.usageGuide = payloadProject.projectDetails.usageGuide || undefined
    project.problemSolving = payloadProject.projectDetails.problemSolving || undefined
    project.futureWork = payloadProject.projectDetails.futureWork || undefined
    project.readme = payloadProject.projectDetails.readme || undefined
    project.readmeIsMarkdown = payloadProject.projectDetails.readmeIsMarkdown || false
    
    // Add GitHub synced data
    project.totalCommits = payloadProject.projectDetails.totalCommits || undefined
    project.fileCount = payloadProject.projectDetails.fileCount || undefined
    project.directoryCount = payloadProject.projectDetails.directoryCount || undefined
    project.repositorySize = payloadProject.projectDetails.repositorySize || undefined
    project.contributors = payloadProject.projectDetails.contributors || undefined
    project.createdAt = payloadProject.projectDetails.createdAt || undefined
    
    // Get last updated from either GitHub sync or repository data
    project.updatedAt = payloadProject.links?.githubStats?.lastUpdated || 
                       payloadProject.updatedAt ||
                       undefined
    
    // Add file tree data
    project.fileTree = payloadProject.projectDetails.fileTree || undefined
    
    // Add GitHub sync timestamp
    project.lastGitHubSync = payloadProject.lastGitHubSync || undefined
    
    // Add GitHub Issues and Pull Requests data
    project.githubIssues = payloadProject.projectDetails.githubIssues || undefined
    project.githubPullRequests = payloadProject.projectDetails.githubPullRequests || undefined
    
    // Add repository metadata
    project.projectDetails = {
      ...project.projectDetails,
      license: payloadProject.projectDetails.license,
      defaultBranch: payloadProject.projectDetails.defaultBranch,
      homepage: payloadProject.projectDetails.homepage,
      topics: payloadProject.projectDetails.topics,
      isArchived: payloadProject.projectDetails.isArchived,
      isFork: payloadProject.projectDetails.isFork,
    }
  }

  // Transform publication
  if (payloadProject.publication?.title) {
    project.publication = {
      title: payloadProject.publication.title,
      authors: payloadProject.publication.authors || '',
      venue: payloadProject.publication.venue || '',
      year: payloadProject.publication.year || new Date().getFullYear(),
      url: payloadProject.publication.url || undefined,
    }
  }

  // Transform branches
  if (payloadProject.branches?.length) {
    project.branches = payloadProject.branches.map(branch => ({
      name: branch.name,
      protected: branch.protected,
      commitSha: branch.commitSha,
    }))
  }

  // Transform latest release
  if (payloadProject.latestRelease?.version) {
    project.latestRelease = {
      version: payloadProject.latestRelease.version,
      name: payloadProject.latestRelease.name,
      publishedAt: payloadProject.latestRelease.publishedAt,
      description: payloadProject.latestRelease.description,
      htmlUrl: payloadProject.latestRelease.htmlUrl,
      downloadCount: payloadProject.latestRelease.downloadCount,
    }
  }

  // Transform media
  if (payloadProject.media?.plots?.length) {
    project.plots = payloadProject.media.plots.map(plot => ({
      url: typeof plot.image === 'object' ? (plot.image as Media).url || '' : '',
      caption: plot.caption,
      alt: plot.alt || plot.caption,
    }))
  }

  if (payloadProject.media?.screenshots?.length) {
    project.images = payloadProject.media.screenshots.map(screenshot => ({
      url: typeof screenshot.image === 'object' ? (screenshot.image as Media).url || '' : '',
      caption: screenshot.caption,
      alt: screenshot.alt || screenshot.caption,
    }))
  }

  if (payloadProject.media?.posters?.length) {
    project.posters = payloadProject.media.posters.map(poster => ({
      title: poster.title,
      conference: poster.conference,
      year: poster.year,
      url: typeof poster.file === 'object' ? (poster.file as Media).url || '' : '',
    }))
  }

  return project
}

export const ProjectsShowcase: React.FC<ProjectsShowcaseProps> = ({ 
  blockName,
  title = 'Featured Projects',
  subtitle = 'Discover our latest work showcasing innovation, technical excellence, and creative problem-solving',
  projects: payloadProjects = [],
  layout = 'grid-3',
  showViewAllButton = true,
  viewAllButtonText = 'View All Projects',
  viewAllButtonUrl = '/projects',
  maxProjects = 6,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Transform Payload projects to component projects
  const projects: Project[] = payloadProjects
    .filter((project): project is PayloadProject => typeof project === 'object' && project !== null)
    .slice(0, maxProjects)
    .map(transformPayloadProject)

  // Grid class mapping
  const gridClasses = {
    'grid-2': 'md:grid-cols-2',
    'grid-3': 'md:grid-cols-2 lg:grid-cols-3',
    'grid-4': 'md:grid-cols-2 lg:grid-cols-4',
    'mixed': 'md:grid-cols-2 lg:grid-cols-3',
  }

  // If no projects, show fallback content
  if (projects.length === 0) {
    return (
      <div className="container my-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {subtitle}
          </p>
          <p className="text-muted-foreground">
            No projects have been added yet. Add some projects in the CMS to see them here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="container my-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <div className={`grid grid-cols-1 ${gridClasses[layout]} gap-8`}>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onExpand={setSelectedProject}
            />
          ))}
        </div>

        {showViewAllButton && (
          <div className="text-center mt-12">
            <a
              href={viewAllButtonUrl}
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              {viewAllButtonText}
            </a>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  )
}

export default ProjectsShowcase