import type { RequestInit } from 'next/dist/server/web/spec-extension/request'

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  clone_url: string
  ssh_url: string
  homepage: string | null
  size: number
  stargazers_count: number
  watchers_count: number
  forks_count: number
  subscribers_count: number
  open_issues_count: number
  language: string | null
  topics: string[]
  license: {
    key: string
    name: string
    spdx_id: string
    url: string | null
  } | null
  default_branch: string
  created_at: string
  updated_at: string
  pushed_at: string
  archived: boolean
  disabled: boolean
  fork: boolean
  private: boolean
  visibility: 'public' | 'private'
  network_count: number
}

export interface GitHubLanguages {
  [language: string]: number
}

export interface GitHubContributor {
  login: string
  id: number
  avatar_url: string
  html_url: string
  contributions: number
  type: 'User' | 'Bot'
}

export interface GitHubRelease {
  id: number
  tag_name: string
  name: string | null
  body: string | null
  draft: boolean
  prerelease: boolean
  created_at: string
  published_at: string | null
  html_url: string
  assets: Array<{
    name: string
    download_count: number
    size: number
    browser_download_url: string
  }>
}

export interface GitHubTree {
  sha: string
  url: string
  tree: Array<{
    path: string
    mode: string
    type: 'blob' | 'tree' | 'commit'
    sha: string
    size?: number
    url: string
  }>
  truncated: boolean
}

export interface GitHubCommit {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    committer: {
      name: string
      email: string
      date: string
    }
    message: string
  }
  html_url: string
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  created_at: string
  updated_at: string
  closed_at: string | null
  html_url: string
  user: {
    login: string
    avatar_url: string
    html_url: string
  }
  labels: Array<{
    name: string
    color: string
    description: string | null
  }>
  assignees: Array<{
    login: string
    avatar_url: string
    html_url: string
  }>
  comments: number
}

export interface GitHubPullRequest {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed' | 'merged'
  created_at: string
  updated_at: string
  closed_at: string | null
  merged_at: string | null
  html_url: string
  user: {
    login: string
    avatar_url: string
    html_url: string
  }
  head: {
    ref: string
    sha: string
  }
  base: {
    ref: string
    sha: string
  }
  merged: boolean
  mergeable: boolean | null
  comments: number
  review_comments: number
  commits: number
  additions: number
  deletions: number
  changed_files: number
}

export interface GitHubBranch {
  name: string
  commit: {
    sha: string
    url: string
  }
  protected: boolean
}

export interface GitHubStats {
  issues: {
    total: number
    open: number
    closed: number
    recent: GitHubIssue[]
  }
  pullRequests: {
    total: number
    open: number
    closed: number
    merged: number
    recent: GitHubPullRequest[]
  }
}

export interface GitHubRepoStats {
  repository: GitHubRepository
  languages: GitHubLanguages
  contributors: GitHubContributor[]
  latestRelease: GitHubRelease | null
  totalCommits: number
  fileTree: GitHubTree | null
  readme: { content: string; isMarkdown: boolean } | null
  packageJson: any | null
  linesOfCode?: number
  stats: GitHubStats
  branches?: GitHubBranch[]
}

/**
 * Parse GitHub URL to extract owner and repository name
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/,
      /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/,
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return {
          owner: match[1],
          repo: match[2],
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error parsing GitHub URL:', error)
    return null
  }
}

/**
 * Create authenticated fetch options for GitHub API
 */
function createGitHubFetchOptions(customAccept?: string): RequestInit {
  const token = process.env.GITHUB_TOKEN
  
  const headers: Record<string, string> = {
    'Accept': customAccept || 'application/vnd.github.v3+json',
    'User-Agent': 'Payload-CMS-GitHub-Integration',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return {
    headers,
    next: { 
      revalidate: 3600 // Cache for 1 hour
    }
  }
}

/**
 * Add delay between requests to respect rate limits
 */
async function rateLimitDelay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Enhanced fetch with rate limit handling
 */
async function fetchWithRateLimit(url: string, options: RequestInit): Promise<Response> {
  const response = await fetch(url, options)
  
  // Check rate limit headers
  const remaining = response.headers.get('X-RateLimit-Remaining')
  const resetTime = response.headers.get('X-RateLimit-Reset')
  
  if (remaining && parseInt(remaining) < 10) {
    console.warn(`GitHub API rate limit warning: ${remaining} requests remaining`)
    // Add longer delay when approaching rate limit
    await rateLimitDelay(500)
  }
  
  if (response.status === 403) {
    const rateLimitMessage = response.headers.get('X-RateLimit-Remaining')
    if (rateLimitMessage === '0') {
      console.error('GitHub API rate limit exceeded. Reset time:', resetTime)
    }
  }
  
  return response
}

/**
 * Fetch repository data from GitHub API
 */
export async function fetchGitHubRepository(owner: string, repo: string): Promise<GitHubRepository | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      createGitHubFetchOptions()
    )
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Repository ${owner}/${repo} not found`)
        return null
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Error fetching repository ${owner}/${repo}:`, error)
    return null
  }
}

/**
 * Fetch repository languages from GitHub API
 */
export async function fetchGitHubLanguages(owner: string, repo: string): Promise<GitHubLanguages | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      createGitHubFetchOptions()
    )
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Error fetching languages for ${owner}/${repo}:`, error)
    return null
  }
}

/**
 * Fetch repository contributors from GitHub API
 */
export async function fetchGitHubContributors(owner: string, repo: string): Promise<GitHubContributor[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`,
      createGitHubFetchOptions()
    )
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Error fetching contributors for ${owner}/${repo}:`, error)
    return []
  }
}

/**
 * Fetch latest release from GitHub API
 */
export async function fetchGitHubLatestRelease(owner: string, repo: string): Promise<GitHubRelease | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
      createGitHubFetchOptions()
    )
    
    if (!response.ok) {
      if (response.status === 404) {
        // No releases found
        return null
      }
      if (response.status === 403) {
        // Rate limit exceeded - return null instead of throwing
        console.warn(`GitHub API rate limit exceeded for ${owner}/${repo}/releases/latest`)
        return null
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Error fetching latest release for ${owner}/${repo}:`, error)
    return null
  }
}

/**
 * Fetch repository branches from GitHub API
 */
export async function fetchGitHubBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
      createGitHubFetchOptions()
    )
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Repository ${owner}/${repo} not found`)
        return []
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Error fetching branches for ${owner}/${repo}:`, error)
    return []
  }
}

/**
 * Fetch repository file tree from GitHub API
 */
export async function fetchGitHubFileTree(owner: string, repo: string, branch: string = 'main'): Promise<GitHubTree | null> {
  try {
    // Try main branch first, then master
    const branches = [branch, 'main', 'master']
    
    for (const branchName of branches) {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/${branchName}?recursive=1`,
          createGitHubFetchOptions()
        )
        
        if (response.ok) {
          return await response.json()
        }
      } catch (error) {
        // Try next branch
        continue
      }
    }
    
    return null
  } catch (error) {
    console.error(`Error fetching file tree for ${owner}/${repo}:`, error)
    return null
  }
}

/**
 * Fetch total commit count for repository
 */
export async function fetchGitHubCommitCount(owner: string, repo: string): Promise<number> {
  try {
    // Get first page to check total count in headers
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
      createGitHubFetchOptions()
    )
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }
    
    const linkHeader = response.headers.get('link')
    if (linkHeader) {
      // Parse the last page number from Link header
      const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/)
      if (lastPageMatch) {
        return parseInt(lastPageMatch[1], 10)
      }
    }
    
    // Fallback: fetch all commits (not recommended for large repos)
    const commits = await response.json()
    return commits.length
  } catch (error) {
    console.error(`Error fetching commit count for ${owner}/${repo}:`, error)
    return 0
  }
}

/**
 * Fetch README content from repository as rendered HTML
 * This supports all markup formats including Markdown, RST, and others
 */
export async function fetchGitHubReadme(owner: string, repo: string): Promise<{ content: string; isMarkdown: boolean } | null> {
  try {
    // First fetch the README metadata to check file extension
    const metaResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      createGitHubFetchOptions()
    )
    
    if (!metaResponse.ok) {
      if (metaResponse.status === 404) {
        return null // No README found
      }
      throw new Error(`GitHub API error: ${metaResponse.status} ${metaResponse.statusText}`)
    }
    
    const metadata = await metaResponse.json()
    const filename = metadata.name?.toLowerCase() || ''
    const isMarkdown = filename.endsWith('.md') || filename.endsWith('.markdown')
    
    if (isMarkdown) {
      // For Markdown files, fetch raw content
      const rawResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        createGitHubFetchOptions('application/vnd.github.raw')
      )
      
      if (!rawResponse.ok) {
        throw new Error(`GitHub API error: ${rawResponse.status} ${rawResponse.statusText}`)
      }
      
      const rawContent = await rawResponse.text()
      return { content: rawContent, isMarkdown: true }
    } else {
      // For RST and other files, fetch rendered HTML
      const htmlResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        createGitHubFetchOptions('application/vnd.github.html+json')
      )
      
      if (!htmlResponse.ok) {
        throw new Error(`GitHub API error: ${htmlResponse.status} ${htmlResponse.statusText}`)
      }
      
      const htmlContent = await htmlResponse.text()
      return { content: htmlContent, isMarkdown: false }
    }
  } catch (error) {
    console.error(`Error fetching README for ${owner}/${repo}:`, error)
    return null
  }
}

/**
 * Fetch package.json content from repository
 */
export async function fetchGitHubPackageJson(owner: string, repo: string): Promise<any | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
      createGitHubFetchOptions()
    )
    
    if (!response.ok) {
      if (response.status === 404) {
        return null // No package.json found
      }
      if (response.status === 403) {
        // Rate limit exceeded - return null instead of throwing
        console.warn(`GitHub API rate limit exceeded for ${owner}/${repo}/contents/package.json`)
        return null
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    // Decode base64 content and parse JSON
    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`Error fetching package.json for ${owner}/${repo}:`, error)
    return null
  }
}

/**
 * Count lines of code from repository file tree
 */
export async function countLinesOfCode(owner: string, repo: string, fileTree: GitHubTree | null): Promise<number> {
  if (!fileTree || !fileTree.tree) {
    return 0
  }

  // Define code file extensions to count
  const codeExtensions = new Set([
    // Web technologies
    'js', 'jsx', 'ts', 'tsx', 'vue', 'svelte', 'astro',
    'html', 'htm', 'css', 'scss', 'sass', 'less', 'stylus',
    
    // Backend languages
    'py', 'java', 'kt', 'scala', 'clj', 'rb', 'php', 'go', 'rs', 'swift',
    'c', 'cpp', 'cc', 'cxx', 'h', 'hpp', 'hxx', 'cs', 'vb', 'fs',
    
    // Other languages
    'r', 'matlab', 'm', 'pl', 'lua', 'dart', 'elm', 'hs', 'erl', 'ex',
    'ml', 'nim', 'cr', 'zig', 'sql',
    
    // Config files that might contain code
    'json', 'yaml', 'yml', 'toml', 'xml'
  ])

  // Get code files from tree (limit to avoid API rate limits)
  const codeFiles = fileTree.tree
    .filter(item => {
      if (item.type !== 'blob') return false
      const ext = item.path.split('.').pop()?.toLowerCase()
      return ext && codeExtensions.has(ext)
    })
    .slice(0, 50) // Limit to 50 files to avoid API rate limits

  if (codeFiles.length === 0) {
    return 0
  }

  let totalLines = 0
  const batchSize = 10 // Process files in batches

  for (let i = 0; i < codeFiles.length; i += batchSize) {
    const batch = codeFiles.slice(i, i + batchSize)
    
    const lineCountPromises = batch.map(async (file) => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
          createGitHubFetchOptions()
        )
        
        if (!response.ok) {
          return 0
        }
        
        const data = await response.json()
        if (data.content) {
          const content = Buffer.from(data.content, 'base64').toString('utf-8')
          // Count non-empty lines
          return content.split('\n').filter(line => line.trim().length > 0).length
        }
        return 0
      } catch (error) {
        console.error(`Error counting lines for ${file.path}:`, error)
        return 0
      }
    })

    const batchResults = await Promise.all(lineCountPromises)
    totalLines += batchResults.reduce((sum, count) => sum + count, 0)
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < codeFiles.length) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  return totalLines
}

/**
 * Fetch repository issues from GitHub API
 */
export async function fetchGitHubIssues(owner: string, repo: string): Promise<GitHubStats['issues']> {
  try {
    // Fetch recent issues (open and closed)
    const [openResponse, closedResponse] = await Promise.all([
      fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=10&sort=updated`,
        createGitHubFetchOptions()
      ),
      fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues?state=closed&per_page=10&sort=updated`,
        createGitHubFetchOptions()
      )
    ])

    if (!openResponse.ok || !closedResponse.ok) {
      throw new Error('Failed to fetch issues')
    }

    const [openIssues, closedIssues] = await Promise.all([
      openResponse.json(),
      closedResponse.json()
    ])

    // Filter out pull requests (GitHub API returns PRs as issues)
    const openIssuesFiltered = openIssues.filter((issue: any) => !issue.pull_request)
    const closedIssuesFiltered = closedIssues.filter((issue: any) => !issue.pull_request)

    // Get total counts by fetching repository data
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      createGitHubFetchOptions()
    )
    
    const repoData = await repoResponse.json()
    const totalOpen = repoData.open_issues_count || 0

    // Combine recent issues for display
    const recentIssues = [...openIssuesFiltered, ...closedIssuesFiltered]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5)

    return {
      total: totalOpen + closedIssuesFiltered.length,
      open: openIssuesFiltered.length,
      closed: closedIssuesFiltered.length,
      recent: recentIssues
    }
  } catch (error) {
    console.error(`Error fetching issues for ${owner}/${repo}:`, error)
    return {
      total: 0,
      open: 0,
      closed: 0,
      recent: []
    }
  }
}

/**
 * Fetch repository pull requests from GitHub API
 */
export async function fetchGitHubPullRequests(owner: string, repo: string): Promise<GitHubStats['pullRequests']> {
  try {
    // Fetch recent pull requests (open and closed)
    const [openResponse, closedResponse] = await Promise.all([
      fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=10&sort=updated`,
        createGitHubFetchOptions()
      ),
      fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&per_page=10&sort=updated`,
        createGitHubFetchOptions()
      )
    ])

    if (!openResponse.ok || !closedResponse.ok) {
      throw new Error('Failed to fetch pull requests')
    }

    const [openPRs, closedPRs] = await Promise.all([
      openResponse.json(),
      closedResponse.json()
    ])

    // Count merged vs closed PRs
    const mergedPRs = closedPRs.filter((pr: any) => pr.merged_at !== null)
    const justClosedPRs = closedPRs.filter((pr: any) => pr.merged_at === null)

    // Combine recent PRs for display
    const recentPRs = [...openPRs, ...closedPRs]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5)

    return {
      total: openPRs.length + closedPRs.length,
      open: openPRs.length,
      closed: justClosedPRs.length,
      merged: mergedPRs.length,
      recent: recentPRs
    }
  } catch (error) {
    console.error(`Error fetching pull requests for ${owner}/${repo}:`, error)
    return {
      total: 0,
      open: 0,
      closed: 0,
      merged: 0,
      recent: []
    }
  }
}

/**
 * Fetch comprehensive GitHub repository stats (issues and PRs)
 */
export async function fetchGitHubRepositoryStats(owner: string, repo: string): Promise<GitHubStats> {
  try {
    const [issues, pullRequests] = await Promise.all([
      fetchGitHubIssues(owner, repo),
      fetchGitHubPullRequests(owner, repo)
    ])

    return {
      issues,
      pullRequests
    }
  } catch (error) {
    console.error(`Error fetching repository stats for ${owner}/${repo}:`, error)
    return {
      issues: {
        total: 0,
        open: 0,
        closed: 0,
        recent: []
      },
      pullRequests: {
        total: 0,
        open: 0,
        closed: 0,
        merged: 0,
        recent: []
      }
    }
  }
}

/**
 * Comprehensive function to fetch all GitHub repository data
 */
export async function fetchCompleteGitHubData(githubUrl: string): Promise<GitHubRepoStats | null> {
  const parsed = parseGitHubUrl(githubUrl)
  if (!parsed) {
    console.error('Invalid GitHub URL:', githubUrl)
    return null
  }
  
  const { owner, repo } = parsed
  
  try {
    // Fetch essential data first (batch 1 - most important)
    console.log(`Fetching essential GitHub data for ${owner}/${repo}...`)
    const [repository, languages, fileTree, branches] = await Promise.all([
      fetchGitHubRepository(owner, repo),
      fetchGitHubLanguages(owner, repo),
      fetchGitHubFileTree(owner, repo),
      fetchGitHubBranches(owner, repo),
    ])
    
    // Small delay before next batch
    await rateLimitDelay(200)
    
    // Fetch secondary data (batch 2 - important but not critical)
    console.log(`Fetching secondary GitHub data for ${owner}/${repo}...`)
    const [contributors, totalCommits, readme] = await Promise.all([
      fetchGitHubContributors(owner, repo),
      fetchGitHubCommitCount(owner, repo),
      fetchGitHubReadme(owner, repo),
    ])
    
    // Another delay before final batch
    await rateLimitDelay(200)
    
    // Fetch optional data (batch 3 - nice to have)
    console.log(`Fetching optional GitHub data for ${owner}/${repo}...`)
    const [latestRelease, packageJson, stats] = await Promise.all([
      fetchGitHubLatestRelease(owner, repo),
      fetchGitHubPackageJson(owner, repo),
      fetchGitHubRepositoryStats(owner, repo),
    ])
    
    // Count lines of code after getting file tree
    const linesOfCode = fileTree ? await countLinesOfCode(owner, repo, fileTree) : 0
    
    if (!repository) {
      return null
    }
    
    return {
      repository,
      languages: languages || {},
      contributors: contributors || [],
      latestRelease,
      totalCommits,
      fileTree,
      readme,
      packageJson,
      linesOfCode,
      stats,
      branches: branches || [],
    }
  } catch (error) {
    console.error(`Error fetching complete GitHub data for ${githubUrl}:`, error)
    return null
  }
}

/**
 * Check if GitHub token is configured
 */
export function isGitHubTokenConfigured(): boolean {
  return !!process.env.GITHUB_TOKEN
}

/**
 * Get GitHub API rate limit information
 */
export async function getGitHubRateLimit(): Promise<any> {
  try {
    const response = await fetch(
      'https://api.github.com/rate_limit',
      createGitHubFetchOptions()
    )
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching GitHub rate limit:', error)
    return null
  }
}

/**
 * Check if we should proceed with API calls based on rate limit
 */
export async function checkRateLimitBeforeSync(): Promise<boolean> {
  try {
    const rateLimit = await getGitHubRateLimit()
    if (!rateLimit) return true // Proceed if we can't check
    
    const { core } = rateLimit.resources
    const remaining = core.remaining
    const resetTime = new Date(core.reset * 1000)
    
    console.log(`GitHub API Rate Limit Status:`)
    console.log(`- Remaining: ${remaining}/${core.limit}`)
    console.log(`- Resets at: ${resetTime.toLocaleString()}`)
    
    if (remaining < 10) {
      console.warn(`⚠️  Low rate limit remaining (${remaining}). Consider waiting until ${resetTime.toLocaleString()}`)
      return false
    }
    
    if (remaining < 50) {
      console.warn(`⚠️  Rate limit getting low (${remaining}). Proceeding with caution.`)
    }
    
    return true
  } catch (error) {
    console.error('Error checking rate limit:', error)
    return true // Proceed if check fails
  }
}