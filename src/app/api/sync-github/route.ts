import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { fetchCompleteGitHubData, parseGitHubUrl, getGitHubRateLimit } from '@/utilities/github'
import type { Project } from '@/payload-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SyncResult {
  success: boolean
  projectId?: string
  projectTitle?: string
  error?: string
  githubData?: any
}

interface SyncResponse {
  success: boolean
  results: SyncResult[]
  rateLimit?: any
  totalProcessed: number
  totalSuccess: number
  totalErrors: number
}

/**
 * Sync GitHub data for a single project
 */
async function syncProjectGitHubData(project: Project): Promise<SyncResult> {
  try {
    const githubUrl = project.links?.githubUrl
    if (!githubUrl) {
      return {
        success: false,
        projectId: project.id,
        projectTitle: project.title,
        error: 'No GitHub URL found'
      }
    }

    // Parse GitHub URL
    const parsed = parseGitHubUrl(githubUrl)
    if (!parsed) {
      return {
        success: false,
        projectId: project.id,
        projectTitle: project.title,
        error: 'Invalid GitHub URL format'
      }
    }

    // Fetch comprehensive GitHub data
    const githubData = await fetchCompleteGitHubData(githubUrl)
    if (!githubData) {
      return {
        success: false,
        projectId: project.id,
        projectTitle: project.title,
        error: 'Failed to fetch GitHub data'
      }
    }

    const { repository, languages, contributors, latestRelease, totalCommits, fileTree, readme, linesOfCode, stats, branches } = githubData

    // Update project with GitHub data
    const payload = await getPayload({ config: configPromise })
    
    const updatedProject = await payload.update({
      collection: 'projects',
      id: project.id,
      data: {
        // Update basic GitHub stats
        links: {
          ...project.links,
          githubStats: {
            stars: repository.stargazers_count,
            forks: repository.forks_count,
            watchers: repository.watchers_count,
            openIssues: repository.open_issues_count,
            language: repository.language,
            size: repository.size,
            lastUpdated: repository.updated_at,
          }
        },
        
        // Update tech stack with languages
        techStack: Object.keys(languages).length > 0 
          ? Object.keys(languages).map(lang => ({ technology: lang }))
          : project.techStack,
        
        // Update project details with GitHub info
        projectDetails: {
          ...project.projectDetails,
          readme,
          totalCommits,
          linesOfCode,
          contributors: contributors.slice(0, 10).map(c => ({
            name: c.login,
            contributions: c.contributions,
            githubUrl: c.html_url,
            avatarUrl: c.avatar_url,
          })),
          fileCount: fileTree?.tree ? fileTree.tree.filter(item => item.type === 'blob').length : undefined,
          directoryCount: fileTree?.tree ? fileTree.tree.filter(item => item.type === 'tree').length : undefined,
          repositorySize: repository.size,
          defaultBranch: repository.default_branch,
          isArchived: repository.archived,
          isFork: repository.fork,
          license: repository.license?.name,
          topics: repository.topics?.map(topic => ({ topic })) || [],
          createdAt: repository.created_at,
          homepage: repository.homepage,
          fileTree: fileTree?.tree ? fileTree.tree.map(item => ({
            path: item.path,
            type: item.type,
            size: item.size,
            url: item.url,
          })) : [],
          githubIssues: {
            total: stats.issues.total,
            open: stats.issues.open,
            closed: stats.issues.closed,
          },
          githubPullRequests: {
            total: stats.pullRequests.total,
            open: stats.pullRequests.open,
            closed: stats.pullRequests.closed,
            merged: stats.pullRequests.merged,
          },
        },
        
        // Update with latest release info if available
        latestRelease: latestRelease ? {
          version: latestRelease.tag_name,
          name: latestRelease.name,
          publishedAt: latestRelease.published_at,
          description: latestRelease.body,
          htmlUrl: latestRelease.html_url,
          downloadCount: latestRelease.assets.reduce((sum, asset) => sum + asset.download_count, 0),
        } : undefined,
        
        // Update branches if available
        branches: branches ? branches.map(branch => ({
          name: branch.name,
          protected: branch.protected,
          commitSha: branch.commit.sha,
        })) : undefined,
        
        // Update description if empty and GitHub has one
        description: !project.description && repository.description 
          ? repository.description 
          : project.description,
        
        // Update short description if empty
        shortDescription: !project.shortDescription && repository.description
          ? repository.description.slice(0, 150) + (repository.description.length > 150 ? '...' : '')
          : project.shortDescription,
        
        // Auto-sync timestamp
        lastGitHubSync: new Date().toISOString(),
      }
    })

    return {
      success: true,
      projectId: project.id,
      projectTitle: project.title,
      githubData: {
        stars: repository.stargazers_count,
        forks: repository.forks_count,
        languages: Object.keys(languages),
        totalCommits,
        contributors: contributors.length,
        latestRelease: latestRelease?.tag_name,
      }
    }

  } catch (error) {
    console.error(`Error syncing GitHub data for project ${project.id}:`, error)
    return {
      success: false,
      projectId: project.id,
      projectTitle: project.title,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * GET - Sync all projects or specific project
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const checkRateLimit = searchParams.get('rateLimit') === 'true'
    
    // Check rate limit if requested
    let rateLimit = null
    if (checkRateLimit) {
      rateLimit = await getGitHubRateLimit()
    }
    
    const payload = await getPayload({ config: configPromise })
    
    // Fetch projects to sync
    let projects: Project[]
    if (projectId) {
      // Sync specific project
      const result = await payload.findByID({
        collection: 'projects',
        id: projectId,
      })
      projects = [result]
    } else {
      // Sync all projects that have GitHub URLs
      const result = await payload.find({
        collection: 'projects',
        limit: 100,
        where: {
          'links.githubUrl': {
            exists: true,
          }
        }
      })
      projects = result.docs
    }
    
    if (projects.length === 0) {
      return NextResponse.json({
        success: true,
        results: [],
        rateLimit,
        totalProcessed: 0,
        totalSuccess: 0,
        totalErrors: 0,
        message: projectId ? 'Project not found' : 'No projects with GitHub URLs found'
      })
    }
    
    // Sync projects (limit concurrent requests to avoid rate limiting)
    const results: SyncResult[] = []
    const batchSize = 5 // Process 5 projects at a time
    
    for (let i = 0; i < projects.length; i += batchSize) {
      const batch = projects.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(project => syncProjectGitHubData(project))
      )
      results.push(...batchResults)
      
      // Add delay between batches to be respectful to GitHub API
      if (i + batchSize < projects.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    const totalSuccess = results.filter(r => r.success).length
    const totalErrors = results.filter(r => !r.success).length
    
    const response: SyncResponse = {
      success: true,
      results,
      rateLimit,
      totalProcessed: projects.length,
      totalSuccess,
      totalErrors,
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error in GitHub sync API:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        results: [],
        totalProcessed: 0,
        totalSuccess: 0,
        totalErrors: 1,
      },
      { status: 500 }
    )
  }
}

/**
 * POST - Sync GitHub data for specific project by GitHub URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { githubUrl, projectId } = body
    
    if (!githubUrl && !projectId) {
      return NextResponse.json(
        { success: false, error: 'Either githubUrl or projectId is required' },
        { status: 400 }
      )
    }
    
    if (githubUrl) {
      // Validate GitHub URL
      const parsed = parseGitHubUrl(githubUrl)
      if (!parsed) {
        return NextResponse.json(
          { success: false, error: 'Invalid GitHub URL format' },
          { status: 400 }
        )
      }
      
      // Fetch GitHub data without updating any project
      const githubData = await fetchCompleteGitHubData(githubUrl)
      if (!githubData) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch GitHub data' },
          { status: 404 }
        )
      }
      
      // Return the GitHub data for preview/validation
      return NextResponse.json({
        success: true,
        githubData: {
          name: githubData.repository.name,
          fullName: githubData.repository.full_name,
          description: githubData.repository.description,
          stars: githubData.repository.stargazers_count,
          forks: githubData.repository.forks_count,
          language: githubData.repository.language,
          languages: Object.keys(githubData.languages),
          topics: githubData.repository.topics,
          license: githubData.repository.license?.name,
          totalCommits: githubData.totalCommits,
          contributors: githubData.contributors.slice(0, 5).map(c => ({
            login: c.login,
            contributions: c.contributions,
          })),
          latestRelease: githubData.latestRelease?.tag_name,
          fileCount: githubData.fileTree?.tree?.filter(item => item.type === 'blob').length,
          createdAt: githubData.repository.created_at,
          updatedAt: githubData.repository.updated_at,
        }
      })
    }
    
    if (projectId) {
      // Sync specific existing project
      const payload = await getPayload({ config: configPromise })
      const project = await payload.findByID({
        collection: 'projects',
        id: projectId,
      })
      
      const result = await syncProjectGitHubData(project)
      return NextResponse.json(result)
    }
    
  } catch (error) {
    console.error('Error in GitHub sync POST API:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}