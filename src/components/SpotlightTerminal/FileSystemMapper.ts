export interface FileSystemNode {
  name: string
  type: 'directory' | 'file'
  path: string
  url?: string
  children?: FileSystemNode[]
  description?: string
}

export interface NavigationItem {
  link: { label: string; url: string }
}

export class FileSystemMapper {
  private fileSystem: FileSystemNode
  private navItems: NavigationItem[]

  constructor(navItems: NavigationItem[]) {
    this.navItems = navItems
    this.fileSystem = this.buildFileSystem()
  }

  private buildFileSystem(): FileSystemNode {
    const root: FileSystemNode = {
      name: '/',
      type: 'directory',
      path: '/',
      children: []
    }

    // Only add real/accessible navigation items (filter out 404s and sections)
    this.navItems.forEach(item => {
      const url = item.link.url
      // Skip 404 pages, fragment-only URLs, and URLs containing fragments
      if (!url.includes('/404') && !url.startsWith('#') && !url.includes('#')) {
        this.addPathToFileSystem(root, url, item.link.label)
      }
    })

    // Only add directories that we know exist
    this.addRealDirectories(root)

    return root
  }

  private addPathToFileSystem(root: FileSystemNode, url: string, label: string): void {
    if (url === '/') {
      // Root homepage - treat as directory so you can 'cd' to it
      const homeDir: FileSystemNode = {
        name: 'home',
        type: 'directory',
        path: '/',
        url: '/',
        description: label,
        children: []
      }
      root.children = root.children || []
      if (!root.children.find(child => child.name === 'home')) {
        root.children.push(homeDir)
      }
      return
    }

    const pathParts = url.split('/').filter(part => part.length > 0)
    let currentNode = root

    pathParts.forEach((part, index) => {
      currentNode.children = currentNode.children || []
      
      const isLastPart = index === pathParts.length - 1
      const nodePath = '/' + pathParts.slice(0, index + 1).join('/')
      
      let existingNode = currentNode.children.find(child => child.name === part)
      
      if (!existingNode) {
        // Handle special cases
        if (part.startsWith('#')) {
          // Fragment/section - treat as file
          existingNode = {
            name: part,
            type: 'file',
            path: nodePath,
            url: url,
            description: `Section: ${label}`
          }
        } else if (isLastPart) {
          // All navigable pages should be directories so you can 'cd' into them
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
      } else if (isLastPart && url) {
        // Update existing node with URL if it's the final destination
        existingNode.url = url
        existingNode.description = label
      }
      
      currentNode = existingNode
    })
  }


  private addRealDirectories(root: FileSystemNode): void {
    // Only add directories that we know exist based on navigation items
    const existingPaths = this.navItems.map(item => item.link.url)
    const realDirs: Array<{ name: string; path: string; description: string }> = []

    // Check if posts directory exists
    if (existingPaths.some(path => path.startsWith('/posts'))) {
      realDirs.push({ name: 'posts', path: '/posts', description: 'Blog posts and articles' })
    }

    // Check if projects exists (but don't add if it's just a fragment)
    const hasProjectsPage = existingPaths.some(path => path === '/projects' || (path.startsWith('/projects') && !path.includes('#')))
    if (hasProjectsPage) {
      realDirs.push({ name: 'projects', path: '/projects', description: 'Portfolio projects' })
    }

    root.children = root.children || []

    realDirs.forEach(dir => {
      if (!root.children!.find(child => child.name === dir.name)) {
        root.children!.push({
          name: dir.name,
          type: 'directory',
          path: dir.path,
          children: [],
          description: dir.description
        })
      }
    })
  }

  public getNode(path: string): FileSystemNode | null {
    if (path === '/') return this.fileSystem

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
    
    return node.children || []
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
    
    // For directories, try common patterns
    if (node.type === 'directory') {
      // Try the path as-is first
      if (this.isValidUrl(path)) return path
      
      // Try with common endings
      const possibleUrls = [path, `${path}/`]
      for (const url of possibleUrls) {
        if (this.isValidUrl(url)) return url
      }
    }

    return null
  }

  public urlToPath(url: string): string {
    // Handle homepage
    if (url === '/') return '/'
    
    // Handle fragments
    if (url.includes('#')) {
      const [pathPart] = url.split('#')
      return this.urlToPath(pathPart || '/')
    }

    // Handle query parameters
    if (url.includes('?')) {
      const [pathPart] = url.split('?')
      return this.urlToPath(pathPart || '/')
    }

    // Normalize and return
    return this.normalizePath(url)
  }

  private isValidUrl(url: string): boolean {
    // Check if this URL exists in our navigation items
    return this.navItems.some(item => item.link.url === url)
  }

  public getTreeStructure(path: string = '/', depth: number = 0, maxDepth: number = 3): string[] {
    if (depth > maxDepth) return []
    
    const node = this.getNode(path)
    if (!node || node.type !== 'directory') return []

    const lines: string[] = []
    const children = node.children || []
    
    children.forEach((child, index) => {
      const isLast = index === children.length - 1
      const prefix = depth === 0 ? '' : '  '.repeat(depth - 1) + (isLast ? '└── ' : '├── ')
      const icon = child.type === 'directory' ? '📁' : '📄'
      const description = child.description ? ` (${child.description})` : ''
      
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
}