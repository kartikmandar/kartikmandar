import type { CollectionAfterChangeHook } from 'payload'
import { fetchCompleteGitHubData, parseGitHubUrl } from '@/utilities/github'

/**
 * Auto-sync GitHub data when a project is created or when GitHub URL is added/changed
 * This hook can be enabled/disabled based on your preferences
 */
export const autoSyncGitHub: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  // Only run for create operations or when GitHub URL changes
  const githubUrl = doc.links?.githubUrl
  const previousGithubUrl = previousDoc?.links?.githubUrl

  // Skip if no GitHub URL
  if (!githubUrl) {
    return doc
  }

  // Skip if GitHub URL hasn't changed (for update operations)
  if (operation === 'update' && githubUrl === previousGithubUrl) {
    return doc
  }

  // Skip if GitHub URL is invalid
  const parsed = parseGitHubUrl(githubUrl)
  if (!parsed) {
    req.payload.logger.warn(`Invalid GitHub URL for project ${doc.id}: ${githubUrl}`)
    return doc
  }

  try {
    req.payload.logger.info(`Auto-syncing GitHub data for project: ${doc.title}`)

    // Fetch GitHub data
    const githubData = await fetchCompleteGitHubData(githubUrl)
    if (!githubData) {
      req.payload.logger.warn(`Failed to fetch GitHub data for project ${doc.id}`)
      return doc
    }

    const { repository, languages, contributors, latestRelease, totalCommits, fileTree, branches } = githubData

    // Update the document with GitHub data
    const updatedDoc = await req.payload.update({
      collection: 'projects',
      id: doc.id,
      data: {
        // Update GitHub stats
        links: {
          ...doc.links,
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
        
        // Auto-populate tech stack if empty
        techStack: (!doc.techStack || doc.techStack.length === 0) && Object.keys(languages).length > 0
          ? Object.keys(languages).map(lang => ({ technology: lang }))
          : doc.techStack,
        
        // Update project details
        projectDetails: {
          ...doc.projectDetails,
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
        
        // Update latest release if available
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
        
        // Auto-populate description if empty
        description: !doc.description && repository.description 
          ? repository.description 
          : doc.description,
        
        // Auto-populate short description if empty
        shortDescription: !doc.shortDescription && repository.description
          ? repository.description.slice(0, 150) + (repository.description.length > 150 ? '...' : '')
          : doc.shortDescription,
        
        // Update sync timestamp
        lastGitHubSync: new Date().toISOString(),
      },
      depth: 0, // Avoid infinite loops
    })

    req.payload.logger.info(`Successfully synced GitHub data for project: ${doc.title}`)
    return updatedDoc

  } catch (error) {
    req.payload.logger.error(`Error auto-syncing GitHub data for project ${doc.id}:`, error)
    // Return original doc if sync fails - don't break the save operation
    return doc
  }
}

export default autoSyncGitHub