/**
 * Core data types for the site.
 * These replace the auto-generated payload-types.ts with clean,
 * purpose-built interfaces that match what components actually consume.
 */

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export interface MediaSize {
  url?: string | null
  width?: number | null
  height?: number | null
  mimeType?: string | null
  filesize?: number | null
  filename?: string | null
}

export interface Media {
  id: number
  alt?: string | null
  /** Plain string for new content; Lexical rich text object for legacy Payload data */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  caption?: any
  url?: string | null
  thumbnailURL?: string | null
  filename?: string | null
  mimeType?: string | null
  filesize?: number | null
  width?: number | null
  height?: number | null
  focalX?: number | null
  focalY?: number | null
  updatedAt: string
  createdAt: string
  sizes?: {
    thumbnail?: MediaSize
    square?: MediaSize
    small?: MediaSize
    medium?: MediaSize
    large?: MediaSize
    xlarge?: MediaSize
    og?: MediaSize
  }
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export interface Category {
  id: number | string
  title: string
  slug?: string | null
  parent?: Category | null
  breadcrumbs?: Array<{
    url?: string | null
    label?: string | null
  }> | null
}

// ---------------------------------------------------------------------------
// Posts (MDX-based)
// ---------------------------------------------------------------------------

export interface PostAuthor {
  id?: string | null
  name?: string | null
}

export interface PostMeta {
  title?: string | null
  description?: string | null
  image?: Media | string | null
}

export interface Post {
  slug: string
  title: string
  /** MDX source content (raw string) */
  content: string
  /** Plain text excerpt for cards/previews */
  excerpt?: string
  heroImage?: Media | string | null
  categories?: (Category | string)[]
  authors?: PostAuthor[]
  populatedAuthors?: PostAuthor[]
  relatedPosts?: string[]
  meta?: PostMeta
  publishedAt?: string | null
  updatedAt?: string
  createdAt?: string
}

/**
 * Subset of Post used by Card component for listing pages.
 */
export type CardPostData = Pick<
  Post,
  'slug' | 'categories' | 'meta' | 'title' | 'publishedAt' | 'populatedAuthors'
> & {
  /** Plain text excerpt replaces the Lexical content extraction */
  excerpt?: string
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export type ProjectCategory =
  | 'web-development'
  | 'mobile-development'
  | 'artificial-intelligence'
  | 'data-science'
  | 'scientific-computing'
  | 'ui-ux-design'
  | 'devops'
  | 'blockchain'
  | 'game-development'
  | 'research'
  | 'other'

export interface ProjectGithubStats {
  url: string
  stars: number
  forks: number
}

export interface ProjectPublication {
  title: string
  authors: string
  venue: string
  year: number
  url?: string
}

export interface ProjectMedia {
  url: string
  caption: string
  alt?: string
}

export interface ProjectPoster {
  title: string
  conference: string
  year: number
  url: string
}

export interface ProjectContributor {
  name: string
  contributions: number
  githubUrl?: string
  avatarUrl?: string
}

export interface ProjectFileTreeItem {
  path: string
  type: 'blob' | 'tree' | 'commit'
  size?: number
  url?: string
}

export interface Project {
  id: string | number
  displayOrder?: number
  title: string
  shortDescription?: string
  description: string
  coverImage?: Media | string | number | null
  category?: ProjectCategory | string | null
  projectStatus: 'active' | 'completed' | 'archived'
  featured?: boolean
  techStack?: Array<{ technology: string }>
  links?: {
    githubUrl?: string
    demoUrl?: string
    githubStats?: {
      stars?: number
      forks?: number
      watchers?: number
      openIssues?: number
      language?: string
      size?: number
      lastUpdated?: string
    }
  }
  projectDetails?: {
    linesOfCode?: number
    architecture?: string
    usageGuide?: string
    problemSolving?: string
    futureWork?: string
    readme?: string
    readmeIsMarkdown?: boolean
    totalCommits?: number
    contributors?: ProjectContributor[]
    fileCount?: number
    directoryCount?: number
    repositorySize?: number
    defaultBranch?: string
    isArchived?: boolean
    isFork?: boolean
    license?: string
    topics?: Array<{ topic: string }>
    createdAt?: string
    homepage?: string
    fileTree?: ProjectFileTreeItem[]
    githubIssues?: {
      total?: number
      open?: number
      closed?: number
    }
    githubPullRequests?: {
      total?: number
      open?: number
      closed?: number
      merged?: number
    }
  }
  publication?: ProjectPublication
  media?: {
    plots?: Array<{
      image: Media | number
      caption: string
      alt?: string
    }>
    screenshots?: Array<{
      image: Media | number
      caption: string
      alt?: string
    }>
    posters?: Array<{
      title: string
      conference: string
      year: number
      file: Media | number
    }>
  }
  latestRelease?: {
    version?: string
    name?: string
    publishedAt?: string
    description?: string
    htmlUrl?: string
    downloadCount?: number
  }
  branches?: Array<{
    name: string
    protected?: boolean
    commitSha?: string
  }>
  lastGitHubSync?: string | null
  publishedAt?: string | null
  slug?: string | null
  meta?: PostMeta
  updatedAt?: string
  createdAt?: string
}

// ---------------------------------------------------------------------------
// Talks
// ---------------------------------------------------------------------------

export type TalkType = 'keynote' | 'workshop' | 'panel' | 'lightning' | 'presentation' | 'tutorial' | 'demo' | 'poster'
export type TalkStatus = 'upcoming' | 'completed' | 'cancelled' | 'postponed'
export type AudienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'mixed'
export type TalkLanguage = 'english' | 'spanish' | 'french' | 'german' | 'portuguese' | 'other'
export type EventType = 'conference' | 'meetup' | 'workshop' | 'webinar' | 'symposium' | 'hackathon' | 'university' | 'corporate' | 'other'

export interface Talk {
  id: number | string
  displayOrder?: number
  title: string
  shortDescription?: string | null
  abstract: string
  talkType?: TalkType | null
  duration?: number | null
  language?: TalkLanguage | null
  audienceLevel?: AudienceLevel | null
  targetAudience?: string | null
  coverImage?: Media | number | null
  eventDetails: {
    eventName: string
    eventType?: EventType | null
    venue?: string | null
    eventWebsite?: string | null
    eventOrganizer?: string | null
    eventDescription?: string | null
    city?: string | null
    country?: string | null
  }
  scheduling: {
    talkDate: string
    talkTime?: string | null
    timezone?: string | null
    talkStatus: TalkStatus
    registrationUrl?: string | null
  }
  materials?: {
    gDriveFolderId?: string | null
    gDriveFolderUrl?: string | null
    enableEmbedView?: boolean | null
    embedHeight?: number | null
    materialDescription?: string | null
    videoRecording?: string | null
    liveStreamUrl?: string | null
    additionalLinks?: Array<{
      title: string
      url: string
      description?: string | null
      type?: 'demo' | 'github' | 'website' | 'article' | 'documentation' | 'other' | null
    }> | null
  }
  topics?: Array<{ topic: string }> | null
  technologies?: Array<{ technology: string }> | null
  keywords?: Array<{ keyword: string }> | null
  prerequisites?: string | null
  learningOutcomes?: string | null
  collaboration?: {
    coSpeakers?: Array<{
      name: string
      title?: string | null
      company?: string | null
      bio?: string | null
      linkedinUrl?: string | null
      twitterUrl?: string | null
    }> | null
    trackSession?: string | null
    acceptanceRate?: number | null
    peerReviewed?: boolean | null
    invitedSpeaker?: boolean | null
  }
  professional?: {
    honorarium?: boolean | null
    travelSponsored?: boolean | null
    speakerBio?: string | null
    speakerPhoto?: Media | number | null
  }
  media?: {
    eventPhotos?: Array<{
      photo: Media | number
      caption?: string | null
    }> | null
    socialMediaPosts?: Array<{
      platform: string
      url: string
      description?: string | null
    }> | null
    blogPosts?: Array<{
      title: string
      url: string
    }> | null
    pressCoverage?: Array<{
      title: string
      publication: string
      url: string
      publishedDate?: string | null
    }> | null
  }
  featured?: boolean | null
  publishedAt?: string | null
  slug?: string | null
  meta?: PostMeta
  updatedAt?: string
  createdAt?: string
}

// ---------------------------------------------------------------------------
// Block types (for page layout system)
// ---------------------------------------------------------------------------

export interface LinkData {
  type?: 'reference' | 'custom' | null
  newTab?: boolean | null
  url?: string | null
  label: string
  appearance?: 'default' | 'outline' | null
  /** For custom links, the URL is in `url`. For reference links, resolve slug. */
  reference?: {
    relationTo: 'pages' | 'posts'
    slug?: string
  } | null
}

export interface CallToActionBlock {
  richText?: string | null
  links?: Array<{ link: LinkData }> | null
  id?: string | null
  blockName?: string | null
  blockType: 'cta'
}

export interface ContentBlock {
  columns?: Array<{
    size?: 'oneThird' | 'half' | 'twoThirds' | 'full' | null
    richText?: string | null
    enableLink?: boolean | null
    link?: LinkData
    id?: string | null
  }> | null
  id?: string | null
  blockName?: string | null
  blockType: 'content'
}

export interface CosmicJourneyBlock {
  title?: string | null
  subtitle?: string | null
  id?: string | null
  blockName?: string | null
  blockType: 'cosmicJourney'
}

export interface MediaBlockData {
  media: Media | number
  id?: string | null
  blockName?: string | null
  blockType: 'mediaBlock'
}

export interface ArchiveBlock {
  introContent?: string | null
  populateBy?: 'collection' | 'selection' | null
  relationTo?: 'posts' | null
  categories?: (Category | string)[] | null
  limit?: number | null
  selectedDocs?: Array<{ relationTo: 'posts'; value: Post | string }> | null
  id?: string | null
  blockName?: string | null
  blockType: 'archive'
}

export interface ProjectsShowcaseBlock {
  blockName?: string | null
  title?: string | null
  subtitle?: string | null
  showAllProjects?: boolean | null
  projects?: (Project | string)[] | null
  showFeaturedOnly?: boolean | null
  maxProjects?: number | null
  layout?: 'grid-3' | 'grid-2' | 'grid-4' | 'mixed' | null
  showViewAllButton?: boolean | null
  viewAllButtonText?: string | null
  viewAllButtonUrl?: string | null
  id?: string | null
  blockType: 'projectsShowcase'
}

export interface TalksShowcaseBlock {
  blockName?: string | null
  title?: string | null
  subtitle?: string | null
  showAllTalks?: boolean | null
  talks?: (Talk | string)[] | null
  showFeaturedOnly?: boolean | null
  maxTalks?: number | null
  layout?: 'grid-3' | 'grid-2' | 'grid-4' | 'mixed' | null
  showViewAllButton?: boolean | null
  viewAllButtonText?: string | null
  viewAllButtonUrl?: string | null
  id?: string | null
  blockType: 'talksShowcase'
}

export type LayoutBlock =
  | CallToActionBlock
  | ContentBlock
  | CosmicJourneyBlock
  | MediaBlockData
  | ArchiveBlock
  | ProjectsShowcaseBlock
  | TalksShowcaseBlock

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export interface PageHero {
  type: 'none' | 'highImpact' | 'mediumImpact' | 'lowImpact'
  richText?: string | null
  links?: Array<{ link: LinkData }> | null
  media?: Media | null
}

export interface Page {
  id: number | string
  title: string
  hero: PageHero
  layout: LayoutBlock[]
  meta?: PostMeta
  publishedAt?: string | null
  slug?: string | null
  updatedAt?: string
  createdAt?: string
}

// ---------------------------------------------------------------------------
// Redirects
// ---------------------------------------------------------------------------

export interface Redirect {
  from: string
  to: {
    url?: string
    reference?: {
      relationTo: 'pages' | 'posts'
      slug?: string
    }
  }
}

// ---------------------------------------------------------------------------
// Search (for Fuse.js index)
// ---------------------------------------------------------------------------

export interface SearchDocument {
  title: string
  slug: string
  type: 'post' | 'project' | 'talk' | 'page'
  description?: string
  categories?: string[]
  url: string
}
