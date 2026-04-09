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

export interface StaticContent {
  posts: Array<{ title: string; slug: string; publishedAt?: string }>
  projects: Array<{ title: string; slug: string }>
  talks: Array<{ title: string; slug: string }>
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
  private staticContent: StaticContent
  private appRoutes: AppRoute[]

  constructor(navItems: NavigationItem[], content: StaticContent) {
    this.navItems = navItems
    this.staticContent = content
    this.appRoutes = this.getAppRoutes()
    this.fileSystem = this.buildFileSystem()
  }

  private getAppRoutes(): AppRoute[] {
    return [
      { path: '/posts', name: 'posts', type: 'static', hasIndex: true },
      { path: '/consultancy', name: 'consultancy', type: 'static', hasIndex: true },
      { path: '/publications', name: 'publications', type: 'static', hasIndex: true },
      { path: '/hobbies', name: 'hobbies', type: 'static', hasIndex: true },
      { path: '/contact', name: 'contact', type: 'static', hasIndex: true },
      { path: '/search', name: 'search', type: 'static', hasIndex: true },
      { path: '/journal-club', name: 'journal-club', type: 'static', hasIndex: true },
      { path: '/talks', name: 'talks', type: 'static', hasIndex: true },
      { path: '/posts/[slug]', name: '[slug]', type: 'dynamic', hasIndex: false },
    ]
  }

  private buildFileSystem(): FileSystemNode {
    const root: FileSystemNode = {
      name: '/',
      type: 'directory',
      path: '/',
      children: [],
    }

    const homeDir: FileSystemNode = {
      name: 'home',
      type: 'directory',
      path: '/home',
      url: '/',
      description: 'Website root directory',
      children: [],
    }
    root.children!.push(homeDir)

    // Add navigation items as directories under home
    this.navItems.forEach((item) => {
      const url = item.link.url
      if (this.isValidInternalUrl(url)) {
        this.addNavigationPath(homeDir, url, item.link.label)
      }
    })

    // Merge app routes
    this.appRoutes.forEach((route) => {
      if (route.type === 'static' && route.hasIndex) {
        const routeParts = route.path.split('/').filter((part) => part.length > 0)
        this.addRouteToFileSystem(homeDir, routeParts, route.path, route.name)
      }
    })

    // Add static content
    this.addContentToFileSystem(homeDir)

    return root
  }

  private isValidInternalUrl(url: string): boolean {
    return (
      !url.includes('/404') &&
      !url.startsWith('http') &&
      !url.startsWith('#') &&
      !url.includes('#') &&
      url !== '/'
    )
  }

  private addContentToFileSystem(homeDir: FileSystemNode): void {
    // Add posts
    const postsDir = homeDir.children?.find((child) => child.name === 'posts')
    if (postsDir && this.staticContent.posts.length > 0) {
      postsDir.children = this.staticContent.posts.map((post) => ({
        name: post.slug,
        type: 'directory' as const,
        path: `/home/posts/${post.slug}`,
        url: `/posts/${post.slug}`,
        description: post.title,
        lastUpdated: post.publishedAt ? new Date(post.publishedAt) : undefined,
        children: [],
      }))
      postsDir.description = `Blog posts (${this.staticContent.posts.length} articles)`
    }

    // Add talks
    if (this.staticContent.talks.length > 0) {
      let talksDir = homeDir.children?.find((child) => child.name === 'talks')
      if (!talksDir) {
        talksDir = {
          name: 'talks',
          type: 'directory',
          path: '/home/talks',
          url: '/talks',
          description: `Talks (${this.staticContent.talks.length} items)`,
          children: [],
        }
        homeDir.children!.push(talksDir)
      }

      talksDir.children = this.staticContent.talks.map((talk) => ({
        name: talk.slug,
        type: 'file' as const,
        path: `/home/talks/${talk.slug}`,
        url: `/talks/${talk.slug}`,
        description: talk.title,
      }))

      talksDir.description = `Talks (${this.staticContent.talks.length} items)`
    }
  }

  private addRouteToFileSystem(
    parentDir: FileSystemNode,
    pathParts: string[],
    fullUrl: string,
    description: string,
  ): void {
    if (pathParts.length === 0) return

    const [currentPart, ...remainingParts] = pathParts
    if (!currentPart) return
    let currentPath: string

    if (parentDir.path === '/home') {
      currentPath = `/home/${currentPart}`
    } else {
      currentPath = `${parentDir.path}/${currentPart}`
    }

    parentDir.children = parentDir.children || []
    let existingNode = parentDir.children.find((child) => child.name === currentPart)

    if (!existingNode) {
      existingNode = {
        name: currentPart,
        type: 'directory',
        path: currentPath,
        url: remainingParts.length === 0 ? fullUrl : undefined,
        description: remainingParts.length === 0 ? description : undefined,
        children: [],
      }
      parentDir.children.push(existingNode)
    }

    if (remainingParts.length > 0) {
      this.addRouteToFileSystem(existingNode, remainingParts, fullUrl, description)
    }
  }

  private addNavigationPath(homeDir: FileSystemNode, url: string, label: string): void {
    const pathParts = url.split('/').filter((part) => part.length > 0)
    let currentNode = homeDir

    pathParts.forEach((part, index) => {
      currentNode.children = currentNode.children || []

      const isLastPart = index === pathParts.length - 1
      const nodePath = '/home/' + pathParts.slice(0, index + 1).join('/')

      let existingNode = currentNode.children.find((child) => child.name === part)

      if (!existingNode) {
        if (isLastPart) {
          existingNode = {
            name: part,
            type: 'directory',
            path: nodePath,
            url: url,
            description: label,
            children: [],
          }
        } else {
          existingNode = {
            name: part,
            type: 'directory',
            path: nodePath,
            children: [],
          }
        }

        currentNode.children.push(existingNode)
      } else if (isLastPart) {
        existingNode.url = url
        existingNode.description = label
      }

      currentNode = existingNode
    })
  }

  public async ensureFreshContent(): Promise<void> {
    // No-op: all content is static
  }

  public getNode(path: string): FileSystemNode | null {
    if (path === '/') return this.fileSystem
    if (path === '/home') {
      return this.fileSystem.children?.find((child) => child.name === 'home') || null
    }

    const pathParts = path.split('/').filter((part) => part.length > 0)
    let currentNode = this.fileSystem

    for (const part of pathParts) {
      if (!currentNode.children) return null

      const nextNode = currentNode.children.find((child) => child.name === part)
      if (!nextNode) return null

      currentNode = nextNode
    }

    return currentNode
  }

  public listDirectory(path: string): FileSystemNode[] {
    const node = this.getNode(path)
    if (!node || node.type !== 'directory') return []

    const children = node.children || []

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
    if (targetPath.startsWith('/')) {
      return this.normalizePath(targetPath)
    }

    if (targetPath === '.') {
      return currentPath
    }

    if (targetPath === '..') {
      const parts = currentPath.split('/').filter((part) => part.length > 0)
      parts.pop()
      return parts.length === 0 ? '/' : '/' + parts.join('/')
    }

    if (targetPath.startsWith('../')) {
      const relativeParts = targetPath.split('/').filter((part) => part.length > 0)
      const currentParts = currentPath.split('/').filter((part) => part.length > 0)

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

    const childPath =
      currentPath === '/' ? `/${targetPath}` : `${currentPath}/${targetPath}`
    return this.normalizePath(childPath)
  }

  private normalizePath(path: string): string {
    return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
  }

  public pathToUrl(path: string): string | null {
    const node = this.getNode(path)
    if (!node) return null

    if (node.url) return node.url

    if (path === '/home' || path === '/') return '/'

    if (path.startsWith('/home/')) {
      const urlPath = path.replace('/home', '')
      return urlPath || '/'
    }

    return null
  }

  public urlToPath(url: string): string {
    if (url === '/') return '/home'

    if (url.includes('#') || url.includes('?')) {
      const cleanUrl = url.split(/[#?]/)[0] || '/'
      return this.urlToPath(cleanUrl)
    }

    const normalizedUrl = this.normalizePath(url)
    if (normalizedUrl.startsWith('/home')) {
      return normalizedUrl
    }
    return '/home' + normalizedUrl
  }

  public getContentStats(): {
    posts: number
    projects: number
    talks: number
    routes: number
  } {
    return {
      posts: this.staticContent.posts.length,
      projects: this.staticContent.projects.length,
      talks: this.staticContent.talks.length,
      routes: this.appRoutes.length,
    }
  }

  public async forceRefresh(): Promise<void> {
    // No-op: all content is static
  }

  public getTreeStructure(
    path: string = '/',
    depth: number = 0,
    maxDepth: number = 3,
  ): string[] {
    if (depth > maxDepth) return []

    const node = this.getNode(path)
    if (!node || node.type !== 'directory') return []

    const lines: string[] = []
    const children = node.children || []

    const sortedChildren = [...children].sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name)
      }
      return a.type === 'directory' ? -1 : 1
    })

    sortedChildren.forEach((child, index) => {
      const isLast = index === sortedChildren.length - 1
      const prefix =
        depth === 0 ? '' : '  '.repeat(depth - 1) + (isLast ? '\u2514\u2500\u2500 ' : '\u251C\u2500\u2500 ')
      const icon = child.type === 'directory' ? '\uD83D\uDCC1' : '\uD83D\uDCC4'

      let description = ''
      if (child.description) {
        description = ` - ${child.description}`
      } else if (child.type === 'directory' && child.children && child.children.length > 0) {
        const fileCount = child.children.filter((c) => c.type === 'file').length
        const dirCount = child.children.filter((c) => c.type === 'directory').length

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
    exists: boolean
    type: 'directory' | 'file' | null
    childCount?: number
    description?: string
    url?: string
    lastUpdated?: Date
  }> {
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
      lastUpdated: node.lastUpdated,
    }
  }
}
