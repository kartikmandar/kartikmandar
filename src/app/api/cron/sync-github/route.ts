import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { fetchCompleteGitHubData, parseGitHubUrl, getGitHubRateLimit } from '@/utilities/github'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Vercel Cron Job - Sync GitHub data for all projects
 * 
 * This endpoint is called by Vercel Cron to automatically update
 * GitHub data for all projects on a schedule.
 * 
 * To set up in Vercel:
 * 1. Add CRON_SECRET environment variable
 * 2. Create vercel.json with cron configuration
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret) {
      console.error('CRON_SECRET environment variable not set')
      return NextResponse.json(
        { error: 'Cron secret not configured' },
        { status: 500 }
      )
    }
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Invalid cron secret provided')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting scheduled GitHub sync job...')
    
    // Check GitHub API rate limit before starting
    const rateLimit = await getGitHubRateLimit()
    if (rateLimit && rateLimit.rate.remaining < 100) {
      console.warn(`GitHub API rate limit low: ${rateLimit.rate.remaining} requests remaining`)
      return NextResponse.json({
        success: false,
        error: 'GitHub API rate limit too low for batch sync',
        rateLimit
      })
    }

    const payload = await getPayload({ config: configPromise })
    
    // Fetch all projects that have GitHub URLs and haven't been synced recently
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const result = await payload.find({
      collection: 'projects',
      limit: 50, // Limit to prevent overwhelming the API
      where: {
        and: [
          {
            'links.githubUrl': {
              exists: true,
            }
          },
          {
            or: [
              {
                lastGitHubSync: {
                  exists: false,
                }
              },
              {
                lastGitHubSync: {
                  less_than: oneDayAgo.toISOString(),
                }
              }
            ]
          }
        ]
      }
    })
    
    const projects = result.docs
    console.log(`Found ${projects.length} projects to sync`)
    
    if (projects.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No projects need syncing',
        totalProcessed: 0
      })
    }

    const syncResults = []
    let successCount = 0
    let errorCount = 0

    // Process projects in small batches to respect rate limits
    const batchSize = 3
    for (let i = 0; i < projects.length; i += batchSize) {
      const batch = projects.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (project) => {
        try {
          const githubUrl = project.links?.githubUrl
          if (!githubUrl) {
            return { projectId: project.id, success: false, error: 'No GitHub URL' }
          }

          const parsed = parseGitHubUrl(githubUrl)
          if (!parsed) {
            return { projectId: project.id, success: false, error: 'Invalid GitHub URL' }
          }

          const githubData = await fetchCompleteGitHubData(githubUrl)
          if (!githubData) {
            return { projectId: project.id, success: false, error: 'Failed to fetch GitHub data' }
          }

          const { repository, languages, contributors, latestRelease, totalCommits, fileTree } = githubData

          // Update project with GitHub data
          await payload.update({
            collection: 'projects',
            id: project.id,
            data: {
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
              
              // Update tech stack with languages if empty
              techStack: (!project.techStack || project.techStack.length === 0) && Object.keys(languages).length > 0 
                ? Object.keys(languages).map(lang => ({ technology: lang }))
                : project.techStack,
              
              // Update project details
              projectDetails: {
                ...project.projectDetails,
                totalCommits,
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
                topics: repository.topics?.map(topic => ({ topic })),
                createdAt: repository.created_at,
                homepage: repository.homepage,
              },
              
              // Update with latest release if available
              latestRelease: latestRelease ? {
                version: latestRelease.tag_name,
                name: latestRelease.name,
                publishedAt: latestRelease.published_at,
                description: latestRelease.body,
                htmlUrl: latestRelease.html_url,
                downloadCount: latestRelease.assets.reduce((sum, asset) => sum + asset.download_count, 0),
              } : undefined,
              
              // Update descriptions if empty
              description: !project.description && repository.description 
                ? repository.description 
                : project.description,
              
              shortDescription: !project.shortDescription && repository.description
                ? repository.description.slice(0, 150) + (repository.description.length > 150 ? '...' : '')
                : project.shortDescription,
              
              lastGitHubSync: new Date().toISOString(),
            }
          })

          return { 
            projectId: project.id, 
            projectTitle: project.title,
            success: true, 
            stars: repository.stargazers_count,
            forks: repository.forks_count 
          }

        } catch (error) {
          console.error(`Error syncing project ${project.id}:`, error)
          return { 
            projectId: project.id, 
            projectTitle: project.title,
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      syncResults.push(...batchResults)
      
      // Count results
      batchResults.forEach(result => {
        if (result.success) successCount++
        else errorCount++
      })

      // Add delay between batches to respect GitHub rate limits
      if (i + batchSize < projects.length) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
      }
    }

    console.log(`GitHub sync job completed: ${successCount} success, ${errorCount} errors`)

    return NextResponse.json({
      success: true,
      totalProcessed: projects.length,
      successCount,
      errorCount,
      results: syncResults,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint for manual triggering of the sync job
 * (same functionality as GET but for manual testing)
 */
export async function POST(request: NextRequest) {
  return GET(request)
}