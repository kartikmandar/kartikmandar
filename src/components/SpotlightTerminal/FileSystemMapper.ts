export interface FileSystemNode {
  name: string
  type: 'directory' | 'file'
  path: string
  url?: string
  children?: FileSystemNode[]
  description?: string
  isLoading?: boolean
  lastUpdated?: Date
}

export interface NavigationItem {
  link: { label: string; url: string }
}

export interface PayloadContent {
  posts: Array<{ id: string; title: string; slug: string; publishedAt?: string; categories?: string[] }>
  pages: Array<{ id: string; title: string; slug: string; publishedAt?: string }>
  projects?: Array<{ id: string; title: string; slug: string; category?: string | null }>
  talks?: Array<{ id: string; title: string; slug: string; publishedAt?: string }>
}

export interface AppRoute {
  path: string
  name: string
  type: 'static' | 'dynamic'
  hasIndex?: boolean
}

export class FileSystemMapper {
  private fileSystem: FileSystemNode
  private navItems: NavigationItem[]
  private payloadContent: PayloadContent | null = null
  private appRoutes: AppRoute[] | null = null
  private lastContentFetch: Date | null = null
  private lastRoutesScan: Date | null = null
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private readonly ROUTES_CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

  constructor(navItems: NavigationItem[]) {
    this.navItems = navItems
    this.fileSystem = this.buildInitialFileSystem()
    // Load content only once at initialization
    this.initializeFileSystem()
  }

  private async initializeFileSystem(): Promise<void> {
    try {
      // Initialize both content and routes, but only if not already done
      await Promise.all([
        this.refreshDynamicContent(),
        this.scanAppRoutes()
      ])
    } catch (error) {
      console.warn('Failed to initialize filesystem:', error)
    }
  }

  private buildInitialFileSystem(): FileSystemNode {
    const root: FileSystemNode = {
      name: '/',
      type: 'directory',
      path: '/',
      children: []
    }

    // Create home directory - this represents the root of the website
    const homeDir: FileSystemNode = {
      name: 'home',
      type: 'directory', 
      path: '/home',
      url: '/',
      description: 'Website root directory',
      children: []
    }
    root.children!.push(homeDir)

    // Add navigation items as directories under home
    this.navItems.forEach(item => {
      const url = item.link.url
      if (this.isValidInternalUrl(url)) {
        this.addNavigationPath(homeDir, url, item.link.label)
      }
    })

    return root
  }

  private isValidInternalUrl(url: string): boolean {
    return !url.includes('/404') && 
           !url.startsWith('http') && 
           !url.startsWith('#') && 
           !url.includes('#') &&
           url !== '/'
  }

  private async refreshDynamicContent(): Promise<void> {
    // Check if we need to refresh cache
    if (this.payloadContent && this.lastContentFetch && 
        Date.now() - this.lastContentFetch.getTime() < this.CACHE_DURATION) {
      return
    }

    try {
      const content = await this.fetchPayloadContent()
      this.payloadContent = content
      this.lastContentFetch = new Date()
      // Only rebuild if we actually got new content
      if (content) {
        this.rebuildFileSystemWithDynamicContent()
      }
    } catch (error) {
      console.warn('Failed to fetch dynamic content:', error)
    }
  }

  private async scanAppRoutes(): Promise<void> {
    // Check if we need to refresh routes cache
    if (this.appRoutes && this.lastRoutesScan && 
        Date.now() - this.lastRoutesScan.getTime() < this.ROUTES_CACHE_DURATION) {
      return
    }

    try {
      const routes = await this.discoverAppRoutes()
      this.appRoutes = routes
      this.lastRoutesScan = new Date()
      // Only rebuild if we actually got new routes
      if (routes && routes.length > 0) {
        this.rebuildFileSystemWithDynamicContent()
      }
    } catch (error) {
      console.warn('Failed to scan app routes:', error)
    }
  }

  private async fetchPayloadContent(): Promise<PayloadContent> {
    const [postsRes, pagesRes, projectsRes, talksRes] = await Promise.all([
      fetch('/api/posts?limit=100&depth=0').catch(() => null),
      fetch('/api/pages?limit=50&depth=0').catch(() => null),
      fetch('/api/projects?limit=100&depth=0').catch(() => null),
      fetch('/api/talks?limit=100&depth=0').catch(() => null)
    ])

    const posts = postsRes && postsRes.ok ? (await postsRes.json()).docs || [] : []
    const pages = pagesRes && pagesRes.ok ? (await pagesRes.json()).docs || [] : []
    const projects = projectsRes && projectsRes.ok ? (await projectsRes.json()).docs || [] : []
    const talks = talksRes && talksRes.ok ? (await talksRes.json()).docs || [] : []

    return { posts, pages, projects, talks }
  }

  private rebuildFileSystemWithDynamicContent(): void {
    // Rebuild the file system with both static routes and dynamic content
    this.fileSystem = this.buildInitialFileSystem()
    const homeDir = this.fileSystem.children!.find(child => child.name === 'home')!
    
    // Merge discovered app routes with existing navigation
    this.mergeAppRoutesIntoFileSystem(homeDir)
    
    // Add dynamic CMS content
    this.addCMSContentToFileSystem(homeDir)
  }

  private async discoverAppRoutes(): Promise<AppRoute[]> {
    // Based on the actual app directory structure
    const knownRoutes: AppRoute[] = [
      { path: '/posts', name: 'posts', type: 'static', hasIndex: true },
      { path: '/consultancy', name: 'consultancy', type: 'static', hasIndex: true },
      { path: '/publications', name: 'publications', type: 'static', hasIndex: true },
      { path: '/hobbies', name: 'hobbies', type: 'static', hasIndex: true },
      { path: '/contact', name: 'contact', type: 'static', hasIndex: true },
      { path: '/common-resources', name: 'common-resources', type: 'static', hasIndex: true },
      { path: '/search', name: 'search', type: 'static', hasIndex: true },
      { path: '/journal-club', name: 'journal-club', type: 'static', hasIndex: true },
      { path: '/talks', name: 'talks', type: 'static', hasIndex: true },
      { path: '/posts/[slug]', name: '[slug]', type: 'dynamic', hasIndex: false }
    ]
    
    return knownRoutes
  }

  private mergeAppRoutesIntoFileSystem(homeDir: FileSystemNode): void {
    if (!this.appRoutes) return

    this.appRoutes.forEach(route => {
      if (route.type === 'static' && route.hasIndex) {
        // Add static routes as directories
        const routeParts = route.path.split('/').filter(part => part.length > 0)
        this.addRouteToFileSystem(homeDir, routeParts, route.path, route.name)
      }
    })
  }

  private addRouteToFileSystem(parentDir: FileSystemNode, pathParts: string[], fullUrl: string, description: string): void {
    if (pathParts.length === 0) return

    const [currentPart, ...remainingParts] = pathParts
    let currentPath: string
    
    // Build path correctly based on parent path
    if (parentDir.path === '/home') {
      currentPath = `/home/${currentPart}`
    } else {
      currentPath = `${parentDir.path}/${currentPart}`
    }
    
    parentDir.children = parentDir.children || []
    let existingNode = parentDir.children.find(child => child.name === currentPart)
    
    if (!existingNode) {
      existingNode = {
        name: currentPart,
        type: 'directory',
        path: currentPath,
        url: remainingParts.length === 0 ? fullUrl : undefined,
        description: remainingParts.length === 0 ? description : undefined,
        children: []
      }
      parentDir.children.push(existingNode)
    }
    
    if (remainingParts.length > 0) {
      this.addRouteToFileSystem(existingNode, remainingParts, fullUrl, description)
    }
  }

  private addCMSContentToFileSystem(homeDir: FileSystemNode): void {
    if (!this.payloadContent) return

    // Add posts to the posts directory if it exists
    const postsDir = homeDir.children?.find(child => child.name === 'posts')
    if (postsDir && this.payloadContent.posts.length > 0) {
      postsDir.children = this.payloadContent.posts.map(post => ({
        name: post.slug,
        type: 'directory' as const, // Posts should be directories, not files
        path: `/home/posts/${post.slug}`,
        url: `/posts/${post.slug}`,
        description: post.title,
        lastUpdated: post.publishedAt ? new Date(post.publishedAt) : undefined,
        children: [] // Empty directory for now
      }))
      postsDir.description = `Blog posts (${this.payloadContent.posts.length} articles)`
    }

    // Add dynamic pages from CMS that don't already exist
    this.payloadContent.pages.forEach(page => {
      if (page.slug && !homeDir.children!.find(child => child.name === page.slug)) {
        homeDir.children!.push({
          name: page.slug,
          type: 'directory',
          path: `/home/${page.slug}`,
          url: `/${page.slug}`,
          description: page.title,
          lastUpdated: page.publishedAt ? new Date(page.publishedAt) : undefined
        })
      }
    })

    // Projects are accessible via [slug] route but don't have a dedicated /projects directory
    // So we don't create a virtual projects directory since there's no actual route for it

    // Add talks to the existing talks directory if any exist
    if (this.payloadContent.talks && this.payloadContent.talks.length > 0) {
      let talksDir = homeDir.children?.find(child => child.name === 'talks')
      if (!talksDir) {
        talksDir = {
          name: 'talks',
          type: 'directory',
          path: '/home/talks',
          url: '/talks',
          description: `Talks from CMS (${this.payloadContent.talks.length} items)`,
          children: []
        }
        homeDir.children!.push(talksDir)
      }
      
      talksDir.children = this.payloadContent.talks.map(talk => ({
        name: talk.slug,
        type: 'file' as const,
        path: `/home/talks/${talk.slug}`,
        url: `/talks/${talk.slug}`,
        description: talk.title
      }))
      
      // Update description with actual count
      talksDir.description = `Talks from CMS (${this.payloadContent.talks.length} items)`
    }
  }

  private addNavigationPath(homeDir: FileSystemNode, url: string, label: string): void {
    const pathParts = url.split('/').filter(part => part.length > 0)
    let currentNode = homeDir

    pathParts.forEach((part, index) => {
      currentNode.children = currentNode.children || []
      
      const isLastPart = index === pathParts.length - 1
      const nodePath = '/home/' + pathParts.slice(0, index + 1).join('/')
      
      let existingNode = currentNode.children.find(child => child.name === part)
      
      if (!existingNode) {
        if (isLastPart) {
          // Final destination - always a directory for navigation
          existingNode = {
            name: part,
            type: 'directory',
            path: nodePath,
            url: url,
            description: label,
            children: []
          }
        } else {
          // Intermediate directory
          existingNode = {
            name: part,
            type: 'directory',
            path: nodePath,
            children: []
          }
        }
        
        currentNode.children.push(existingNode)
      } else if (isLastPart) {
        // Update existing node with URL and description
        existingNode.url = url
        existingNode.description = label
      }
      
      currentNode = existingNode
    })
  }


  public async ensureFreshContent(): Promise<void> {
    // Only refresh if we haven't done so recently
    const now = Date.now()
    const needsContentRefresh = !this.lastContentFetch || (now - this.lastContentFetch.getTime()) > this.CACHE_DURATION
    const needsRoutesRefresh = !this.lastRoutesScan || (now - this.lastRoutesScan.getTime()) > this.ROUTES_CACHE_DURATION
    
    if (needsContentRefresh || needsRoutesRefresh) {
      const promises: Promise<void>[] = []
      
      if (needsContentRefresh) {
        promises.push(this.refreshDynamicContent())
      }
      
      if (needsRoutesRefresh) {
        promises.push(this.scanAppRoutes())
      }
      
      await Promise.all(promises)
    }
  }

  public getNode(path: string): FileSystemNode | null {
    if (path === '/') return this.fileSystem
    if (path === '/home') {
      return this.fileSystem.children?.find(child => child.name === 'home') || null
    }

    const pathParts = path.split('/').filter(part => part.length > 0)
    let currentNode = this.fileSystem

    for (const part of pathParts) {
      if (!currentNode.children) return null
      
      const nextNode = currentNode.children.find(child => child.name === part)
      if (!nextNode) return null
      
      currentNode = nextNode
    }

    return currentNode
  }

  public listDirectory(path: string): FileSystemNode[] {
    const node = this.getNode(path)
    if (!node || node.type !== 'directory') return []
    
    const children = node.children || []
    
    // Sort children: directories first, then files, both alphabetically
    return [...children].sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name)
      }
      return a.type === 'directory' ? -1 : 1
    })
  }

  public pathExists(path: string): boolean {
    return this.getNode(path) !== null
  }

  public resolvePath(currentPath: string, targetPath: string): string {
    // Handle absolute paths
    if (targetPath.startsWith('/')) {
      return this.normalizePath(targetPath)
    }

    // Handle relative paths
    if (targetPath === '.') {
      return currentPath
    }

    if (targetPath === '..') {
      const parts = currentPath.split('/').filter(part => part.length > 0)
      parts.pop()
      return parts.length === 0 ? '/' : '/' + parts.join('/')
    }

    if (targetPath.startsWith('../')) {
      const relativeParts = targetPath.split('/').filter(part => part.length > 0)
      const currentParts = currentPath.split('/').filter(part => part.length > 0)
      
      let upCount = 0
      for (const part of relativeParts) {
        if (part === '..') {
          upCount++
        } else {
          break
        }
      }

      const remainingParts = relativeParts.slice(upCount)
      const newParts = currentParts.slice(0, -upCount).concat(remainingParts)
      
      return newParts.length === 0 ? '/' : '/' + newParts.join('/')
    }

    // Handle direct child path
    const childPath = currentPath === '/' ? `/${targetPath}` : `${currentPath}/${targetPath}`
    return this.normalizePath(childPath)
  }

  private normalizePath(path: string): string {
    // Remove double slashes and normalize
    return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
  }

  public pathToUrl(path: string): string | null {
    const node = this.getNode(path)
    if (!node) return null
    
    // If node has explicit URL, use it
    if (node.url) return node.url
    
    // Handle special paths
    if (path === '/home' || path === '/') return '/'
    
    // For paths under /home, convert to actual URLs
    if (path.startsWith('/home/')) {
      const urlPath = path.replace('/home', '')
      return urlPath || '/'
    }

    return null
  }

  public urlToPath(url: string): string {
    // Handle homepage
    if (url === '/') return '/home'
    
    // Handle fragments and query parameters
    if (url.includes('#') || url.includes('?')) {
      const cleanUrl = url.split(/[#?]/)[0] || '/'
      return this.urlToPath(cleanUrl)
    }

    // Convert URL to path under /home, but avoid double /home
    const normalizedUrl = this.normalizePath(url)
    if (normalizedUrl.startsWith('/home')) {
      return normalizedUrl
    }
    return '/home' + normalizedUrl
  }

  public getContentStats(): { posts: number; pages: number; projects: number; talks: number; routes: number; lastUpdated: Date | null } {
    return {
      posts: this.payloadContent?.posts.length || 0,
      pages: this.payloadContent?.pages.length || 0,
      projects: this.payloadContent?.projects?.length || 0,
      talks: this.payloadContent?.talks?.length || 0,
      routes: this.appRoutes?.length || 0,
      lastUpdated: this.lastContentFetch
    }
  }

  public async forceRefresh(): Promise<void> {
    // Force refresh by clearing cache timestamps
    this.lastContentFetch = null
    this.lastRoutesScan = null
    await this.ensureFreshContent()
  }

  public getTreeStructure(path: string = '/', depth: number = 0, maxDepth: number = 3): string[] {
    if (depth > maxDepth) return []
    
    const node = this.getNode(path)
    if (!node || node.type !== 'directory') return []

    const lines: string[] = []
    const children = node.children || []
    
    // Sort children: directories first, then files, both alphabetically
    const sortedChildren = [...children].sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name)
      }
      return a.type === 'directory' ? -1 : 1
    })
    
    sortedChildren.forEach((child, index) => {
      const isLast = index === sortedChildren.length - 1
      const prefix = depth === 0 ? '' : '  '.repeat(depth - 1) + (isLast ? '└── ' : '├── ')
      const icon = child.type === 'directory' ? '📁' : '📄'
      
      // Show more meaningful descriptions
      let description = ''
      if (child.description) {
        description = ` - ${child.description}`
      } else if (child.type === 'directory' && child.children && child.children.length > 0) {
        const childCount = child.children.length
        const fileCount = child.children.filter(c => c.type === 'file').length
        const dirCount = child.children.filter(c => c.type === 'directory').length
        
        if (fileCount > 0 && dirCount > 0) {
          description = ` (${dirCount} dirs, ${fileCount} files)`
        } else if (fileCount > 0) {
          description = ` (${fileCount} files)`
        } else if (dirCount > 0) {
          description = ` (${dirCount} directories)`
        }
      }
      
      lines.push(`${prefix}${icon} ${child.name}${description}`)
      
      if (child.type === 'directory' && depth < maxDepth) {
        const subLines = this.getTreeStructure(child.path, depth + 1, maxDepth)
        lines.push(...subLines)
      }
    })

    return lines
  }


  public getFileSystem(): FileSystemNode {
    return this.fileSystem
  }

  public async getDirectoryInfo(path: string): Promise<{ 
    exists: boolean; 
    type: 'directory' | 'file' | null;
    childCount?: number;
    description?: string;
    url?: string;
    lastUpdated?: Date;
  }> {
    // Ensure we have fresh content
    await this.ensureFreshContent()
    
    const node = this.getNode(path)
    if (!node) {
      return { exists: false, type: null }
    }
    
    return {
      exists: true,
      type: node.type,
      childCount: node.children?.length,
      description: node.description,
      url: node.url,
      lastUpdated: node.lastUpdated
    }
  }
}