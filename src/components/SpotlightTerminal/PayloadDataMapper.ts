import { FileSystemNode } from './FileSystemMapper'

export interface PayloadPost {
  id: string
  title: string
  slug: string
  publishedAt?: string
  categories?: string[]
}

export interface PayloadProject {
  id: string
  title: string
  slug: string
  description?: string
  category?: string
  status?: string
}

export interface PayloadPage {
  id: string
  title: string
  slug: string
  publishedAt?: string
}

export class PayloadDataMapper {
  static async fetchAndMapContent(): Promise<FileSystemNode[]> {
    const dynamicNodes: FileSystemNode[] = []

    try {
      // Fetch posts from Payload CMS
      const posts = await PayloadDataMapper.fetchPosts()
      if (posts.length > 0) {
        const postsNode: FileSystemNode = {
          name: 'posts',
          type: 'directory',
          path: '/posts',
          children: posts.map(post => ({
            name: post.slug,
            type: 'file',
            path: `/posts/${post.slug}`,
            url: `/posts/${post.slug}`,
            description: post.title
          })),
          description: `Blog posts (${posts.length} items)`
        }
        dynamicNodes.push(postsNode)
      }

      // Fetch projects from Payload CMS
      const projects = await PayloadDataMapper.fetchProjects()
      if (projects.length > 0) {
        // Group projects by category
        const projectsByCategory = PayloadDataMapper.groupProjectsByCategory(projects)
        
        const projectsNode: FileSystemNode = {
          name: 'projects',
          type: 'directory',
          path: '/projects',
          children: Object.entries(projectsByCategory).map(([category, categoryProjects]) => ({
            name: category,
            type: 'directory',
            path: `/projects/${category}`,
            children: categoryProjects.map(project => ({
              name: project.slug,
              type: 'file',
              path: `/projects/${category}/${project.slug}`,
              url: `/projects/${project.slug}`, // Assuming projects have individual URLs
              description: project.title
            })),
            description: `${category} projects (${categoryProjects.length} items)`
          })),
          description: `All projects (${projects.length} items)`
        }
        dynamicNodes.push(projectsNode)
      }

      // Fetch pages from Payload CMS
      const pages = await PayloadDataMapper.fetchPages()
      if (pages.length > 0) {
        const pageNodes = pages.map(page => ({
          name: page.slug,
          type: 'file' as const,
          path: `/${page.slug}`,
          url: `/${page.slug}`,
          description: page.title
        }))
        dynamicNodes.push(...pageNodes)
      }

    } catch (error) {
      console.warn('Failed to fetch dynamic content from Payload CMS:', error)
      // Return empty array if API is not available
    }

    return dynamicNodes
  }

  private static async fetchPosts(): Promise<PayloadPost[]> {
    try {
      const response = await fetch('/api/posts?limit=100&depth=0')
      if (!response.ok) return []
      
      const data = await response.json()
      return data.docs || []
    } catch (error) {
      console.warn('Failed to fetch posts:', error)
      return []
    }
  }

  private static async fetchProjects(): Promise<PayloadProject[]> {
    try {
      const response = await fetch('/api/projects?limit=100&depth=0')
      if (!response.ok) return []
      
      const data = await response.json()
      return data.docs || []
    } catch (error) {
      console.warn('Failed to fetch projects:', error)
      return []
    }
  }

  private static async fetchPages(): Promise<PayloadPage[]> {
    try {
      const response = await fetch('/api/pages?limit=50&depth=0')
      if (!response.ok) return []
      
      const data = await response.json()
      return data.docs || []
    } catch (error) {
      console.warn('Failed to fetch pages:', error)
      return []
    }
  }

  private static groupProjectsByCategory(projects: PayloadProject[]): Record<string, PayloadProject[]> {
    const grouped: Record<string, PayloadProject[]> = {}
    
    projects.forEach(project => {
      const category = project.category || 'uncategorized'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(project)
    })
    
    return grouped
  }

  static async getRealtimeStats(): Promise<{ posts: number; projects: number; pages: number }> {
    try {
      const [posts, projects, pages] = await Promise.all([
        PayloadDataMapper.fetchPosts(),
        PayloadDataMapper.fetchProjects(),
        PayloadDataMapper.fetchPages()
      ])

      return {
        posts: posts.length,
        projects: projects.length,
        pages: pages.length
      }
    } catch (error) {
      console.warn('Failed to fetch stats:', error)
      return { posts: 0, projects: 0, pages: 0 }
    }
  }
}