'use client'

import React, { useState } from 'react'
import { ProjectCard, ProjectModal, type Project } from '@/components/ProjectCard'
import type { Project as DataProject } from '@/data/types'
import type { Media } from '@/data/types'

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

// Helper function to transform data project to component project
const transformDataProject = (dataProject: DataProject): Project => {
  const project: Project = {
    id: dataProject.id,
    title: dataProject.title,
    shortDescription: dataProject.shortDescription || undefined,
    description: dataProject.description,
    coverImage: dataProject.coverImage as Project['coverImage'],
    category: dataProject.category ?
      String(dataProject.category).replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) :
      undefined,
    status: dataProject.projectStatus as 'active' | 'completed' | 'archived',
    techStack: dataProject.techStack?.map(tech => typeof tech === 'string' ? tech : tech.technology) || [],
  }

  // Transform links
  if (dataProject.links?.githubUrl) {
    project.github = {
      url: dataProject.links.githubUrl,
      stars: dataProject.links.githubStats?.stars || 0,
      forks: dataProject.links.githubStats?.forks || 0,
    }

    project.links = {
      githubUrl: dataProject.links.githubUrl,
      githubStats: {
        stars: dataProject.links.githubStats?.stars || 0,
        forks: dataProject.links.githubStats?.forks || 0,
        language: dataProject.links.githubStats?.language || undefined,
        watchers: dataProject.links.githubStats?.watchers || 0,
        openIssues: dataProject.links.githubStats?.openIssues || 0,
        size: dataProject.links.githubStats?.size || 0,
        lastUpdated: dataProject.links.githubStats?.lastUpdated || undefined,
      }
    }
  }

  if (dataProject.links?.demoUrl) {
    project.demoUrl = dataProject.links.demoUrl
  }

  // Transform project details
  if (dataProject.projectDetails) {
    project.linesOfCode = dataProject.projectDetails.linesOfCode || undefined
    project.architecture = dataProject.projectDetails.architecture || undefined
    project.usageGuide = dataProject.projectDetails.usageGuide || undefined
    project.problemSolving = dataProject.projectDetails.problemSolving || undefined
    project.futureWork = dataProject.projectDetails.futureWork || undefined
    project.readme = dataProject.projectDetails.readme || undefined
    project.readmeIsMarkdown = dataProject.projectDetails.readmeIsMarkdown || false

    project.totalCommits = dataProject.projectDetails.totalCommits || undefined
    project.fileCount = dataProject.projectDetails.fileCount || undefined
    project.directoryCount = dataProject.projectDetails.directoryCount || undefined
    project.repositorySize = dataProject.projectDetails.repositorySize || undefined
    project.contributors = dataProject.projectDetails.contributors?.map(c => ({
      name: c.name,
      contributions: c.contributions,
      githubUrl: c.githubUrl || undefined,
      avatarUrl: c.avatarUrl || undefined
    })) || undefined
    project.createdAt = dataProject.projectDetails.createdAt || undefined

    project.updatedAt = dataProject.links?.githubStats?.lastUpdated ||
                       dataProject.updatedAt ||
                       undefined

    project.fileTree = dataProject.projectDetails.fileTree?.filter(item => item.url).map(item => ({
      path: item.path,
      type: item.type,
      size: item.size || undefined,
      url: item.url!
    })) || undefined

    project.lastGitHubSync = dataProject.lastGitHubSync || undefined

    project.githubIssues = dataProject.projectDetails.githubIssues ? {
      total: dataProject.projectDetails.githubIssues.total || 0,
      open: dataProject.projectDetails.githubIssues.open || 0,
      closed: dataProject.projectDetails.githubIssues.closed || 0
    } : undefined
    project.githubPullRequests = dataProject.projectDetails.githubPullRequests ? {
      total: dataProject.projectDetails.githubPullRequests.total || 0,
      open: dataProject.projectDetails.githubPullRequests.open || 0,
      closed: dataProject.projectDetails.githubPullRequests.closed || 0,
      merged: dataProject.projectDetails.githubPullRequests.merged || 0
    } : undefined

    project.projectDetails = {
      ...project.projectDetails,
      license: dataProject.projectDetails.license || undefined,
      defaultBranch: dataProject.projectDetails.defaultBranch || undefined,
      homepage: dataProject.projectDetails.homepage || undefined,
      topics: dataProject.projectDetails.topics || undefined,
      isArchived: dataProject.projectDetails.isArchived ?? undefined,
      isFork: dataProject.projectDetails.isFork ?? undefined,
    }
  }

  // Transform publication
  if (dataProject.publication?.title) {
    project.publication = {
      title: dataProject.publication.title,
      authors: dataProject.publication.authors || '',
      venue: dataProject.publication.venue || '',
      year: dataProject.publication.year || new Date().getFullYear(),
      url: dataProject.publication.url || undefined,
    }
  }

  // Transform branches
  if (dataProject.branches?.length) {
    project.branches = dataProject.branches.map(branch => ({
      name: branch.name,
      protected: branch.protected ?? undefined,
      commitSha: branch.commitSha || undefined,
    }))
  }

  // Transform latest release
  if (dataProject.latestRelease?.version) {
    project.latestRelease = {
      version: dataProject.latestRelease.version,
      name: dataProject.latestRelease.name || undefined,
      publishedAt: dataProject.latestRelease.publishedAt || undefined,
      description: dataProject.latestRelease.description || undefined,
      htmlUrl: dataProject.latestRelease.htmlUrl || undefined,
      downloadCount: dataProject.latestRelease.downloadCount || undefined,
    }
  }

  // Transform media
  if (dataProject.media?.plots?.length) {
    project.plots = dataProject.media.plots.map(plot => ({
      url: typeof plot.image === 'object' ? (plot.image as Media).url || '' : '',
      caption: plot.caption,
      alt: plot.alt || plot.caption,
    }))
  }

  if (dataProject.media?.screenshots?.length) {
    project.images = dataProject.media.screenshots.map(screenshot => ({
      url: typeof screenshot.image === 'object' ? (screenshot.image as Media).url || '' : '',
      caption: screenshot.caption,
      alt: screenshot.alt || screenshot.caption,
    }))
  }

  if (dataProject.media?.posters?.length) {
    project.posters = dataProject.media.posters.map(poster => ({
      title: poster.title,
      conference: poster.conference,
      year: poster.year,
      url: typeof poster.file === 'object' ? (poster.file as Media).url || '' : '',
    }))
  }

  return project
}

export const ProjectsShowcase: React.FC<ProjectsShowcaseProps> = ({ 
  blockName: _blockName,
  title = 'Featured Projects',
  subtitle = 'Discover some of the projects I am proud of.',
  showAllProjects = false,
  projects: payloadProjects = [],
  layout = 'grid-3',
  showViewAllButton = true,
  viewAllButtonText = 'View All Projects',
  viewAllButtonUrl = '/projects',
  maxProjects = 20,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Transform data projects to component projects
  const projects: Project[] = payloadProjects
    .filter((project): project is DataProject => typeof project === 'object' && project !== null)
    .sort((a, b) => {
      const orderA = a.displayOrder ?? 999999
      const orderB = b.displayOrder ?? 999999
      if (orderA !== orderB) {
        return orderA - orderB
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })
    .slice(0, maxProjects)
    .map(transformDataProject)

  // Always show debugging info to help with project limits
  console.log('ProjectsShowcase Debug:', {
    showAllProjects,
    payloadProjectsCount: payloadProjects.length,
    payloadProjects: payloadProjects.map(p => typeof p === 'object' ? p.title : p),
    maxProjects,
    actualProjectsShown: projects.length,
    isLimitingResults: payloadProjects.length > maxProjects
  })

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
      <div id="my-projects" className="container my-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {subtitle}
          </p>
          <p className="text-muted-foreground">
            No projects have been added yet. Add some projects to src/data/projects.ts to see them here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div id="my-projects" className="container my-16">
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