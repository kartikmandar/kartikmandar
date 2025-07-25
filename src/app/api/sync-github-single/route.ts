import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Project } from '@/payload-types'
import { 
  fetchGitHubRepoStats, 
  fetchGitHubBranches, 
  fetchGitHubReleases,
  fetchGitHubContributors 
} from '@/utilities/github'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })
    
    // Get the project
    const project = await payload.findByID({
      collection: 'projects',
      id: projectId,
    })

    if (!project?.links?.githubUrl) {
      return NextResponse.json({ error: 'No GitHub URL found' }, { status: 400 })
    }

    // Parse GitHub URL to get owner and repo
    const githubUrl = project.links.githubUrl
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    
    if (!match) {
      return NextResponse.json({ error: 'Invalid GitHub URL format' }, { status: 400 })
    }

    const [, owner, repo] = match
    const cleanRepo = repo!.replace(/\.git$/, '')

    // Fetch GitHub data
    const [repoStats, branches, releases, contributors] = await Promise.allSettled([
      fetchGitHubRepoStats(owner!, cleanRepo),
      fetchGitHubBranches(owner!, cleanRepo),
      fetchGitHubReleases(owner!, cleanRepo),
      fetchGitHubContributors(owner!, cleanRepo),
    ])

    // Prepare update data
    interface ProjectUpdateData {
      lastGitHubSync: string
      links?: Partial<Project['links']>
      projectDetails?: Partial<Project['projectDetails']>
      branches?: Array<{
        name: string
        protected: boolean
        commitSha: string
      }>
      latestRelease?: {
        version: string
        name?: string | null
        publishedAt: string
        description?: string | null
        htmlUrl: string
        downloadCount: number
      }
    }
    
    const updateData: ProjectUpdateData = {
      lastGitHubSync: new Date().toISOString(),
    }

    // Process repo stats
    if (repoStats.status === 'fulfilled' && repoStats.value) {
      const stats = repoStats.value
      updateData.links = {
        ...project.links,
        githubStats: {
          stars: stats.stars,
          forks: stats.forks,
          watchers: stats.watchers,
          openIssues: stats.openIssues,
          language: stats.language,
          size: stats.size,
          lastUpdated: stats.lastUpdated,
        },
      }

      // Update project details
      updateData.projectDetails = {
        ...project.projectDetails,
        readme: stats.readme,
        totalCommits: stats.totalCommits,
        // contributors is a count in stats, but we need the actual contributor data
        // We'll handle this separately below
        fileCount: stats.fileCount,
        directoryCount: stats.directoryCount,
        repositorySize: stats.repositorySize,
        defaultBranch: stats.defaultBranch,
        isArchived: stats.isArchived,
        isFork: stats.isFork,
        license: stats.license,
        topics: stats.topics?.map((topic: string) => ({ topic })),
        createdAt: stats.createdAt,
        homepage: stats.homepage,
        fileTree: stats.fileTree?.tree?.map((item: { path: string; type: string; size?: number; url?: string }) => ({
          path: item.path,
          type: item.type as 'blob' | 'tree' | 'commit',
          size: item.size,
          url: item.url,
        })),
        githubIssues: stats.githubIssues,
        githubPullRequests: stats.githubPullRequests,
      }
    }

    // Process contributors
    if (contributors.status === 'fulfilled' && contributors.value) {
      // Map contributor data to match the expected format
      const topContributors = contributors.value.slice(0, 10).map(contributor => ({
        name: contributor.login,
        contributions: contributor.contributions,
        githubUrl: contributor.html_url,
        avatarUrl: contributor.avatar_url,
      }))

      if (!updateData.projectDetails) {
        updateData.projectDetails = {}
      }
      updateData.projectDetails.contributors = topContributors
    }

    // Process branches
    if (branches.status === 'fulfilled' && branches.value) {
      updateData.branches = branches.value.map(branch => ({
        name: branch.name,
        protected: branch.protected,
        commitSha: branch.commit.sha,
      }))
    }

    // Process latest release
    if (releases.status === 'fulfilled' && releases.value && releases.value.length > 0) {
      const latestRelease = releases.value[0]
      if (latestRelease) {
        updateData.latestRelease = {
          version: latestRelease.tag_name,
          name: latestRelease.name,
          publishedAt: latestRelease.published_at || new Date().toISOString(),
          description: latestRelease.body,
          htmlUrl: latestRelease.html_url,
          downloadCount: latestRelease.assets?.reduce((sum, asset) => sum + (asset.download_count || 0), 0) || 0,
        }
      }
    }

    // Update the project
    await payload.update({
      collection: 'projects',
      id: projectId,
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Individual sync error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}