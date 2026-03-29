/**
 * Convert exported Payload JSON to static TypeScript data files.
 *
 * Usage: npx tsx scripts/convert-to-data-files.ts
 *
 * Reads from src/data/exports/*.json and writes to src/data/*.ts
 */

import fs from 'fs'
import path from 'path'

const EXPORTS_DIR = path.resolve(import.meta.dirname, '..', 'src', 'data', 'exports')
const DATA_DIR = path.resolve(import.meta.dirname, '..', 'src', 'data')

function readExport(name: string): unknown[] {
  const filePath = path.join(EXPORTS_DIR, `${name}.json`)
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ ${filePath} not found, skipping`)
    return []
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

/**
 * Strip Payload internal IDs from array items (the MongoDB-style id fields
 * inside sub-arrays like techStack, topics, contributors, etc.)
 */
function stripInternalIds(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(stripInternalIds)
  }
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Skip MongoDB-style hex IDs in sub-objects (24-char hex strings)
      // but keep numeric IDs at the top level
      if (key === 'id' && typeof value === 'string' && /^[a-f0-9]{24}$/.test(value)) {
        continue
      }
      result[key] = stripInternalIds(value)
    }
    return result
  }
  return obj
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

function convertProjects() {
  const raw = readExport('projects') as Record<string, unknown>[]
  if (!raw.length) return

  const projects = raw.map((p) => {
    // Build clean project object matching our data/types.ts Project interface
    const project: Record<string, unknown> = {
      id: p.id,
      displayOrder: p.displayOrder ?? undefined,
      title: p.title,
      shortDescription: p.shortDescription || undefined,
      description: p.description,
      category: p.category || undefined,
      projectStatus: p.projectStatus,
      featured: p.featured || undefined,
      slug: p.slug || undefined,
      publishedAt: p.publishedAt || undefined,
      updatedAt: p.updatedAt || undefined,
      createdAt: p.createdAt || undefined,
    }

    // Cover image - keep the full media object for compatibility
    if (p.coverImage && typeof p.coverImage === 'object') {
      project.coverImage = stripInternalIds(p.coverImage)
    }

    // Tech stack
    if (Array.isArray(p.techStack) && p.techStack.length) {
      project.techStack = (p.techStack as Array<{ technology: string }>).map(t => ({
        technology: t.technology,
      }))
    }

    // Links
    if (p.links && typeof p.links === 'object') {
      const links = p.links as Record<string, unknown>
      project.links = {
        githubUrl: links.githubUrl || undefined,
        demoUrl: links.demoUrl || undefined,
        githubStats: links.githubStats || undefined,
      }
    }

    // Project details
    if (p.projectDetails && typeof p.projectDetails === 'object') {
      const pd = p.projectDetails as Record<string, unknown>
      const details: Record<string, unknown> = {}

      const simpleFields = [
        'linesOfCode', 'architecture', 'usageGuide', 'problemSolving',
        'futureWork', 'readme', 'readmeIsMarkdown', 'totalCommits',
        'fileCount', 'directoryCount', 'repositorySize', 'defaultBranch',
        'isArchived', 'isFork', 'license', 'createdAt', 'homepage',
      ]

      for (const field of simpleFields) {
        if (pd[field] !== null && pd[field] !== undefined) {
          details[field] = pd[field]
        }
      }

      // Contributors - strip internal IDs
      if (Array.isArray(pd.contributors) && pd.contributors.length) {
        details.contributors = (pd.contributors as Array<Record<string, unknown>>).map(c => ({
          name: c.name,
          contributions: c.contributions,
          githubUrl: c.githubUrl || undefined,
          avatarUrl: c.avatarUrl || undefined,
        }))
      }

      // Topics - strip internal IDs
      if (Array.isArray(pd.topics) && pd.topics.length) {
        details.topics = (pd.topics as Array<{ topic: string }>).map(t => ({
          topic: t.topic,
        }))
      }

      // File tree - strip internal IDs
      if (Array.isArray(pd.fileTree) && pd.fileTree.length) {
        details.fileTree = (pd.fileTree as Array<Record<string, unknown>>).map(f => ({
          path: f.path,
          type: f.type,
          size: f.size || undefined,
          url: f.url || undefined,
        }))
      }

      // GitHub issues/PRs
      if (pd.githubIssues) details.githubIssues = pd.githubIssues
      if (pd.githubPullRequests) details.githubPullRequests = pd.githubPullRequests

      project.projectDetails = details
    }

    // Publication
    if (p.publication && typeof p.publication === 'object') {
      const pub = p.publication as Record<string, unknown>
      if (pub.title) {
        project.publication = {
          title: pub.title,
          authors: pub.authors || '',
          venue: pub.venue || '',
          year: pub.year || new Date().getFullYear(),
          url: pub.url || undefined,
        }
      }
    }

    // Media (plots, screenshots, posters)
    if (p.media && typeof p.media === 'object') {
      const media = p.media as Record<string, unknown>
      const mediaObj: Record<string, unknown> = {}

      if (Array.isArray(media.plots) && media.plots.length) {
        mediaObj.plots = (media.plots as Array<Record<string, unknown>>).map(plot => ({
          image: stripInternalIds(plot.image),
          caption: plot.caption,
          alt: plot.alt || undefined,
        }))
      }

      if (Array.isArray(media.screenshots) && media.screenshots.length) {
        mediaObj.screenshots = (media.screenshots as Array<Record<string, unknown>>).map(s => ({
          image: stripInternalIds(s.image),
          caption: s.caption,
          alt: s.alt || undefined,
        }))
      }

      if (Array.isArray(media.posters) && media.posters.length) {
        mediaObj.posters = (media.posters as Array<Record<string, unknown>>).map(poster => ({
          title: poster.title,
          conference: poster.conference,
          year: poster.year,
          file: stripInternalIds(poster.file),
        }))
      }

      if (Object.keys(mediaObj).length) {
        project.media = mediaObj
      }
    }

    // Latest release
    if (p.latestRelease && typeof p.latestRelease === 'object') {
      const lr = p.latestRelease as Record<string, unknown>
      if (lr.version) {
        project.latestRelease = {
          version: lr.version,
          name: lr.name || undefined,
          publishedAt: lr.publishedAt || undefined,
          description: lr.description || undefined,
          htmlUrl: lr.htmlUrl || undefined,
          downloadCount: lr.downloadCount || undefined,
        }
      }
    }

    // Branches
    if (Array.isArray(p.branches) && p.branches.length) {
      project.branches = (p.branches as Array<Record<string, unknown>>).map(b => ({
        name: b.name,
        protected: b.protected || undefined,
        commitSha: b.commitSha || undefined,
      }))
    }

    // Last GitHub sync
    if (p.lastGitHubSync) {
      project.lastGitHubSync = p.lastGitHubSync
    }

    // Meta
    if (p.meta && typeof p.meta === 'object') {
      const meta = p.meta as Record<string, unknown>
      if (meta.title || meta.description || meta.image) {
        project.meta = {
          title: meta.title || undefined,
          description: meta.description || undefined,
          image: meta.image ? stripInternalIds(meta.image) : undefined,
        }
      }
    }

    return project
  })

  const output = `import type { Project } from './types'

/**
 * Static project data.
 * Generated from Payload CMS export on ${new Date().toISOString().split('T')[0]}.
 *
 * GitHub-synced fields (stars, forks, readme, contributors, etc.)
 * are stored separately in src/data/github/projects-cache.json
 * and merged at read time via getProjects().
 */
export const projects: Project[] = ${JSON.stringify(projects, null, 2)} as Project[]

/**
 * Load GitHub cache and merge with static project data.
 * Falls back to static data if cache doesn't exist.
 */
export function getProjects(): Project[] {
  let githubCache: Record<string, Partial<Project>> = {}

  try {
    // Dynamic import of JSON - works at build time in Node
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    githubCache = require('./github/projects-cache.json')
  } catch {
    // No cache yet — that's fine
  }

  return projects
    .map((project) => {
      const githubUrl = project.links?.githubUrl
      if (!githubUrl || !githubCache[githubUrl]) return project

      const cached = githubCache[githubUrl]
      return {
        ...project,
        links: {
          ...project.links,
          githubStats: {
            ...project.links?.githubStats,
            ...(cached.links?.githubStats || {}),
          },
        },
        projectDetails: {
          ...project.projectDetails,
          ...(cached.projectDetails || {}),
        },
        latestRelease: cached.latestRelease || project.latestRelease,
        branches: cached.branches || project.branches,
        lastGitHubSync: cached.lastGitHubSync || project.lastGitHubSync,
      }
    })
    .sort((a, b) => {
      const orderA = a.displayOrder ?? 999
      const orderB = b.displayOrder ?? 999
      if (orderA !== orderB) return orderA - orderB
      // Fall back to newest first
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return dateB - dateA
    })
}

/**
 * Get only published projects.
 */
export function getPublishedProjects(): Project[] {
  return getProjects()
}

/**
 * Get a single project by slug.
 */
export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug)
}
`

  fs.writeFileSync(path.join(DATA_DIR, 'projects.ts'), output)
  console.log(`  ✓ projects.ts: ${projects.length} projects`)
}

// ---------------------------------------------------------------------------
// Talks
// ---------------------------------------------------------------------------

function convertTalks() {
  const raw = readExport('talks') as Record<string, unknown>[]
  if (!raw.length) return

  const talks = raw.map((t) => {
    const talk: Record<string, unknown> = {
      id: t.id,
      displayOrder: t.displayOrder ?? undefined,
      title: t.title,
      shortDescription: t.shortDescription || undefined,
      abstract: t.abstract,
      talkType: t.talkType || undefined,
      duration: t.duration || undefined,
      language: t.language || undefined,
      audienceLevel: t.audienceLevel || undefined,
      targetAudience: t.targetAudience || undefined,
      featured: t.featured || undefined,
      publishedAt: t.publishedAt || undefined,
      slug: t.slug || undefined,
      updatedAt: t.updatedAt || undefined,
      createdAt: t.createdAt || undefined,
    }

    // Cover image
    if (t.coverImage && typeof t.coverImage === 'object') {
      talk.coverImage = stripInternalIds(t.coverImage)
    }

    // Event details
    if (t.eventDetails && typeof t.eventDetails === 'object') {
      talk.eventDetails = stripInternalIds(t.eventDetails)
    }

    // Scheduling
    if (t.scheduling && typeof t.scheduling === 'object') {
      talk.scheduling = stripInternalIds(t.scheduling)
    }

    // Materials
    if (t.materials && typeof t.materials === 'object') {
      const mat = t.materials as Record<string, unknown>
      const materials: Record<string, unknown> = {}
      const fields = [
        'gDriveFolderId', 'gDriveFolderUrl', 'enableEmbedView',
        'embedHeight', 'materialDescription', 'videoRecording', 'liveStreamUrl',
      ]
      for (const f of fields) {
        if (mat[f] !== null && mat[f] !== undefined) {
          materials[f] = mat[f]
        }
      }
      if (Array.isArray(mat.additionalLinks) && mat.additionalLinks.length) {
        materials.additionalLinks = (mat.additionalLinks as Array<Record<string, unknown>>).map(l => ({
          title: l.title,
          url: l.url,
          description: l.description || undefined,
          type: l.type || undefined,
        }))
      }
      if (Object.keys(materials).length) {
        talk.materials = materials
      }
    }

    // Topics, technologies, keywords - strip internal IDs
    if (Array.isArray(t.topics) && t.topics.length) {
      talk.topics = (t.topics as Array<{ topic: string }>).map(x => ({ topic: x.topic }))
    }
    if (Array.isArray(t.technologies) && t.technologies.length) {
      talk.technologies = (t.technologies as Array<{ technology: string }>).map(x => ({ technology: x.technology }))
    }
    if (Array.isArray(t.keywords) && t.keywords.length) {
      talk.keywords = (t.keywords as Array<{ keyword: string }>).map(x => ({ keyword: x.keyword }))
    }

    // Collaboration
    if (t.collaboration && typeof t.collaboration === 'object') {
      const collab = t.collaboration as Record<string, unknown>
      const collaboration: Record<string, unknown> = {}
      if (collab.trackSession) collaboration.trackSession = collab.trackSession
      if (collab.acceptanceRate) collaboration.acceptanceRate = collab.acceptanceRate
      if (collab.peerReviewed !== null && collab.peerReviewed !== undefined) collaboration.peerReviewed = collab.peerReviewed
      if (collab.invitedSpeaker !== null && collab.invitedSpeaker !== undefined) collaboration.invitedSpeaker = collab.invitedSpeaker
      if (Array.isArray(collab.coSpeakers) && collab.coSpeakers.length) {
        collaboration.coSpeakers = (collab.coSpeakers as Array<Record<string, unknown>>).map(s => ({
          name: s.name,
          title: s.title || undefined,
          company: s.company || undefined,
          bio: s.bio || undefined,
          linkedinUrl: s.linkedinUrl || undefined,
          twitterUrl: s.twitterUrl || undefined,
        }))
      }
      if (Object.keys(collaboration).length) {
        talk.collaboration = collaboration
      }
    }

    // Professional
    if (t.professional && typeof t.professional === 'object') {
      const prof = t.professional as Record<string, unknown>
      const professional: Record<string, unknown> = {}
      if (prof.honorarium !== null && prof.honorarium !== undefined) professional.honorarium = prof.honorarium
      if (prof.travelSponsored !== null && prof.travelSponsored !== undefined) professional.travelSponsored = prof.travelSponsored
      if (prof.speakerBio) professional.speakerBio = prof.speakerBio
      if (prof.speakerPhoto && typeof prof.speakerPhoto === 'object') {
        professional.speakerPhoto = stripInternalIds(prof.speakerPhoto)
      }
      if (Object.keys(professional).length) {
        talk.professional = professional
      }
    }

    // Media
    if (t.media && typeof t.media === 'object') {
      const media = t.media as Record<string, unknown>
      const mediaObj: Record<string, unknown> = {}

      if (Array.isArray(media.eventPhotos) && media.eventPhotos.length) {
        mediaObj.eventPhotos = (media.eventPhotos as Array<Record<string, unknown>>).map(p => ({
          photo: stripInternalIds(p.photo),
          caption: p.caption || undefined,
        }))
      }
      if (Array.isArray(media.socialMediaPosts) && media.socialMediaPosts.length) {
        mediaObj.socialMediaPosts = (media.socialMediaPosts as Array<Record<string, unknown>>).map(p => ({
          platform: p.platform,
          url: p.url,
          description: p.description || undefined,
        }))
      }
      if (Array.isArray(media.blogPosts) && media.blogPosts.length) {
        mediaObj.blogPosts = (media.blogPosts as Array<Record<string, unknown>>).map(p => ({
          title: p.title,
          url: p.url,
        }))
      }
      if (Array.isArray(media.pressCoverage) && media.pressCoverage.length) {
        mediaObj.pressCoverage = (media.pressCoverage as Array<Record<string, unknown>>).map(p => ({
          title: p.title,
          publication: p.publication,
          url: p.url,
          publishedDate: p.publishedDate || undefined,
        }))
      }
      if (Object.keys(mediaObj).length) {
        talk.media = mediaObj
      }
    }

    // Meta
    if (t.meta && typeof t.meta === 'object') {
      const meta = t.meta as Record<string, unknown>
      if (meta.title || meta.description || meta.image) {
        talk.meta = {
          title: meta.title || undefined,
          description: meta.description || undefined,
          image: meta.image ? stripInternalIds(meta.image) : undefined,
        }
      }
    }

    return talk
  })

  const output = `import type { Talk } from './types'

/**
 * Static talk data.
 * Generated from Payload CMS export on ${new Date().toISOString().split('T')[0]}.
 */
export const talks: Talk[] = ${JSON.stringify(talks, null, 2)} as Talk[]

/**
 * Get all talks, sorted by display order then by talk date (newest first).
 */
export function getTalks(): Talk[] {
  return [...talks].sort((a, b) => {
    const orderA = a.displayOrder ?? 999
    const orderB = b.displayOrder ?? 999
    if (orderA !== orderB) return orderA - orderB
    const dateA = new Date(a.scheduling?.talkDate || 0).getTime()
    const dateB = new Date(b.scheduling?.talkDate || 0).getTime()
    return dateB - dateA
  })
}

/**
 * Get a single talk by slug.
 */
export function getTalkBySlug(slug: string): Talk | undefined {
  return talks.find((t) => t.slug === slug)
}
`

  fs.writeFileSync(path.join(DATA_DIR, 'talks.ts'), output)
  console.log(`  ✓ talks.ts: ${talks.length} talks`)
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

function convertCategories() {
  const raw = readExport('categories') as Record<string, unknown>[]
  if (!raw.length) return

  const categories = raw.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug || undefined,
    parent: c.parent || undefined,
    breadcrumbs: Array.isArray(c.breadcrumbs) ? c.breadcrumbs.map((b: Record<string, unknown>) => ({
      url: b.url || undefined,
      label: b.label || undefined,
    })) : undefined,
  }))

  const output = `import type { Category } from './types'

/**
 * Site categories.
 * Generated from Payload CMS export on ${new Date().toISOString().split('T')[0]}.
 */
export const categories: Category[] = ${JSON.stringify(categories, null, 2)} as Category[]

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}

export function getCategoryById(id: number | string): Category | undefined {
  return categories.find((c) => c.id === id)
}
`

  fs.writeFileSync(path.join(DATA_DIR, 'categories.ts'), output)
  console.log(`  ✓ categories.ts: ${categories.length} categories`)
}

// ---------------------------------------------------------------------------
// Redirects
// ---------------------------------------------------------------------------

function convertRedirects() {
  const raw = readExport('redirects') as Record<string, unknown>[]

  const output = `import type { Redirect } from './types'

/**
 * Site redirects.
 * Generated from Payload CMS export on ${new Date().toISOString().split('T')[0]}.
 */
export const redirects: Redirect[] = ${JSON.stringify(raw.map(r => ({
  from: r.from,
  to: r.to,
})), null, 2)} as Redirect[]

/**
 * Find a redirect for a given URL path.
 */
export function getRedirectForUrl(url: string): Redirect | undefined {
  return redirects.find((r) => r.from === url)
}
`

  fs.writeFileSync(path.join(DATA_DIR, 'redirects.ts'), output)
  console.log(`  ✓ redirects.ts: ${raw.length} redirects`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('\nConverting Payload exports to TypeScript data files...\n')

  convertProjects()
  convertTalks()
  convertCategories()
  convertRedirects()

  console.log('\nDone! Files written to src/data/')
  console.log('Next: verify with npx tsc --noEmit')
}

main()
