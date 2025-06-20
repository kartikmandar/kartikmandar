import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { FileSystemMapper } from './FileSystemMapper'

export interface CommandResult {
  output: string
  newDirectory?: string
  navigate?: boolean
  error?: boolean
}

export interface Command {
  name: string
  description: string
  usage: string
  examples: string[]
}

export class CommandProcessor {
  private fileSystemMapper: FileSystemMapper
  private router: AppRouterInstance
  private currentPath: string
  private commands: Map<string, Command>

  constructor(fileSystemMapper: FileSystemMapper, router: AppRouterInstance, currentPath: string) {
    this.fileSystemMapper = fileSystemMapper
    this.router = router
    this.currentPath = currentPath
    this.commands = this.initializeCommands()
  }

  private initializeCommands(): Map<string, Command> {
    const commands = new Map<string, Command>()

    commands.set('pwd', {
      name: 'pwd',
      description: 'Print working directory - shows current page location',
      usage: 'pwd',
      examples: ['pwd']
    })

    commands.set('ls', {
      name: 'ls',
      description: 'List directory contents - shows available pages/sections',
      usage: 'ls [path] [-l] [-la]',
      examples: ['ls', 'ls -l', 'ls /posts', 'ls -la']
    })

    commands.set('cd', {
      name: 'cd',
      description: 'Change directory - navigate to different pages',
      usage: 'cd [path]',
      examples: ['cd /posts', 'cd ..', 'cd /projects', 'cd ~/']
    })

    commands.set('tree', {
      name: 'tree',
      description: 'Display directory tree structure of the entire website',
      usage: 'tree [path] [-d] [-L level]',
      examples: ['tree', 'tree -d', 'tree /posts', 'tree -L 2']
    })

    commands.set('help', {
      name: 'help',
      description: 'Show available commands and their usage',
      usage: 'help [command]',
      examples: ['help', 'help cd', 'help ls']
    })

    commands.set('clear', {
      name: 'clear',
      description: 'Clear the terminal output',
      usage: 'clear',
      examples: ['clear']
    })


    commands.set('whoami', {
      name: 'whoami',
      description: 'Display current user information',
      usage: 'whoami',
      examples: ['whoami']
    })

    commands.set('refresh', {
      name: 'refresh',
      description: 'Refresh filesystem with latest content from CMS',
      usage: 'refresh',
      examples: ['refresh']
    })

    commands.set('info', {
      name: 'info',
      description: 'Show information about a directory or file',
      usage: 'info [path]',
      examples: ['info', 'info /posts', 'info ../publications']
    })

    commands.set('stats', {
      name: 'stats',
      description: 'Show website content statistics',
      usage: 'stats',
      examples: ['stats']
    })

    return commands
  }

  public async processCommand(commandLine: string, currentDirectory: string): Promise<CommandResult> {
    const trimmedCommand = commandLine.trim()
    if (!trimmedCommand) {
      return { output: '', error: false }
    }

    const [command, ...args] = this.parseCommand(trimmedCommand)
    const lowerCommand = command?.toLowerCase() || ''

    // Update current path - only ensure fresh content for refresh command
    this.currentPath = this.fileSystemMapper.urlToPath(currentDirectory)
    
    // Only refresh content for specific commands that need it
    if (['refresh', 'stats'].includes(lowerCommand)) {
      await this.fileSystemMapper.ensureFreshContent()
    }

    try {
      switch (lowerCommand) {
        case 'pwd':
          return this.executePwd()
        
        case 'ls':
          return this.executeLs(args)
        
        case 'cd':
          return this.executeCd(args)
        
        case 'tree':
          return this.executeTree(args)
        
        case 'help':
          return this.executeHelp(args)
        
        case 'clear':
          return this.executeClear()
        
        case 'whoami':
          return this.executeWhoami()
        
        case 'refresh':
          return this.executeRefresh()
        
        case 'info':
          return this.executeInfo(args)
        
        case 'stats':
          return this.executeStats()
        
        default:
          return {
            output: `Command not found: ${command || 'unknown'}\nType 'help' to see available commands.`,
            error: true
          }
      }
    } catch (error) {
      return {
        output: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: true
      }
    }
  }

  private parseCommand(commandLine: string): string[] {
    // Simple command parsing - split by spaces, handle quotes later if needed
    return commandLine.split(/\s+/)
  }

  private executePwd(): CommandResult {
    const displayPath = this.currentPath === '/' ? '/' : this.currentPath
    return {
      output: displayPath,
      error: false
    }
  }

  private executeLs(args: string[]): CommandResult {
    let targetPath = this.currentPath
    let showDetails = false
    let showHidden = false

    // Parse arguments
    for (const arg of args) {
      if (arg.startsWith('-')) {
        if (arg.includes('l')) showDetails = true
        if (arg.includes('a')) showHidden = true
      } else {
        // Path argument
        targetPath = this.fileSystemMapper.resolvePath(this.currentPath, arg)
      }
    }

    const children = this.fileSystemMapper.listDirectory(targetPath)
    
    if (children.length === 0) {
      if (!this.fileSystemMapper.pathExists(targetPath)) {
        return {
          output: `ls: cannot access '${targetPath}': No such file or directory`,
          error: true
        }
      }
      return {
        output: '(empty directory)',
        error: false
      }
    }

    // Filter hidden files if not showing all
    const visibleChildren = showHidden ? children : children.filter(child => !child.name.startsWith('.'))

    if (showDetails) {
      // Detailed listing
      const lines = visibleChildren.map(child => {
        const type = child.type === 'directory' ? 'd' : '-'
        const permissions = child.type === 'directory' ? 'rwxr-xr-x' : 'rw-r--r--'
        const size = child.type === 'directory' ? '4096' : '1024'
        const date = new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
        
        const name = child.type === 'directory' ? `${child.name}/` : child.name
        
        return `${type}${permissions} 1 user user ${size.padStart(6)} ${date} ${name}`
      })
      
      return {
        output: lines.join('\n'),
        error: false
      }
    } else {
      // Simple listing
      const names = visibleChildren.map(child => {
        const name = child.type === 'directory' ? `${child.name}/` : child.name
        return name
      })
      
      return {
        output: names.join('\n'),
        error: false
      }
    }
  }

  private executeCd(args: string[]): CommandResult {
    if (args.length === 0) {
      // cd with no arguments goes to home (root)
      const url = this.fileSystemMapper.pathToUrl('/')
      if (url) {
        this.router.push(url)
        return {
          output: '',
          newDirectory: '/',
          navigate: true,
          error: false
        }
      }
      return {
        output: 'cd: unable to navigate to home directory',
        error: true
      }
    }

    const targetPath = args[0] || ''
    let resolvedPath: string

    // Handle special cases
    if (targetPath === '~' || targetPath === '~/') {
      resolvedPath = '/'
    } else {
      resolvedPath = this.fileSystemMapper.resolvePath(this.currentPath, targetPath)
    }

    // Check if path exists
    if (!this.fileSystemMapper.pathExists(resolvedPath)) {
      return {
        output: `cd: no such file or directory: ${targetPath || ''}`,
        error: true
      }
    }

    // Check if it's a directory
    const node = this.fileSystemMapper.getNode(resolvedPath)
    if (!node) {
      return {
        output: `cd: no such file or directory: ${targetPath || ''}`,
        error: true
      }
    }

    if (node.type !== 'directory') {
      return {
        output: `cd: not a directory: ${targetPath || ''}`,
        error: true
      }
    }

    // Get URL for navigation
    const url = this.fileSystemMapper.pathToUrl(resolvedPath)
    if (url) {
      this.router.push(url)
      return {
        output: '',
        newDirectory: resolvedPath,
        navigate: true,
        error: false
      }
    }

    // If no URL mapping, just change directory without navigation
    return {
      output: '',
      newDirectory: resolvedPath,
      error: false
    }
  }

  private executeTree(args: string[]): CommandResult {
    let targetPath = this.currentPath
    let maxDepth = 3
    let directoriesOnly = false

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-d') {
        directoriesOnly = true
      } else if (arg === '-L' && i + 1 < args.length) {
        const depth = parseInt(args[i + 1] || '3')
        if (!isNaN(depth)) {
          maxDepth = Math.max(1, Math.min(depth, 5)) // Limit depth
          i++ // Skip next arg as it's the depth value
        }
      } else if (arg && !arg.startsWith('-')) {
        // Path argument
        targetPath = this.fileSystemMapper.resolvePath(this.currentPath, arg)
      }
    }

    if (!this.fileSystemMapper.pathExists(targetPath)) {
      return {
        output: `tree: ${targetPath}: No such file or directory`,
        error: true
      }
    }

    const lines = this.fileSystemMapper.getTreeStructure(targetPath, 0, maxDepth)
    
    if (directoriesOnly) {
      // Filter to show only directories
      const filteredLines = lines.filter(line => line.includes('📁'))
      return {
        output: filteredLines.length > 0 ? filteredLines.join('\n') : 'No directories found',
        error: false
      }
    }

    return {
      output: lines.length > 0 ? lines.join('\n') : 'Empty directory',
      error: false
    }
  }

  private executeHelp(args: string[]): CommandResult {
    if (args.length === 0) {
      // General help
      const commandList = Array.from(this.commands.values())
        .map(cmd => `  ${cmd.name.padEnd(8)} ${cmd.description}`)
        .join('\n')

      return {
        output: `Available commands:
${commandList}

Type 'help <command>' for detailed usage information.
Use Cmd/Ctrl+K to open/close this terminal.`,
        error: false
      }
    }

    const commandName = args[0]?.toLowerCase() || ''
    const command = this.commands.get(commandName)

    if (!command) {
      return {
        output: `No help available for command: ${commandName}`,
        error: true
      }
    }

    const examples = command.examples.map(ex => `  $ ${ex}`).join('\n')

    return {
      output: `${command.name} - ${command.description}

Usage: ${command.usage}

Examples:
${examples}`,
      error: false
    }
  }

  private executeClear(): CommandResult {
    return {
      output: '[[CLEAR]]', // Special marker for terminal to clear output
      error: false
    }
  }


  private executeWhoami(): CommandResult {
    // Get available commands dynamically
    const availableCommands = Array.from(this.commands.keys()).sort().join(', ')
    const stats = this.fileSystemMapper.getContentStats()
    
    const info = [
      'Current User: visitor',
      'Session: website-terminal',
      'Access Level: public',
      'Location: website filesystem',
      '',
      `Content: ${stats.posts} posts, ${stats.pages} pages, ${stats.projects} projects, ${stats.talks} talks`,
      `Routes: ${stats.routes} discovered`,
      `Last Updated: ${stats.lastUpdated?.toLocaleString() || 'Never'}`,
      '',
      `Available commands: ${availableCommands}`,
      'Tip: Use Cmd/Ctrl+K to toggle this terminal'
    ]

    return {
      output: info.join('\n'),
      error: false
    }
  }

  private async executeRefresh(): Promise<CommandResult> {
    try {
      await this.fileSystemMapper.forceRefresh()
      const stats = this.fileSystemMapper.getContentStats()
      
      return {
        output: `Filesystem refreshed successfully!\nDiscovered: ${stats.posts} posts, ${stats.pages} pages, ${stats.projects} projects, ${stats.talks} talks, ${stats.routes} routes`,
        error: false
      }
    } catch (error) {
      return {
        output: `Failed to refresh filesystem: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: true
      }
    }
  }

  private async executeInfo(args: string[]): Promise<CommandResult> {
    const targetPath = args.length > 0 
      ? this.fileSystemMapper.resolvePath(this.currentPath, args[0])
      : this.currentPath

    try {
      const info = await this.fileSystemMapper.getDirectoryInfo(targetPath)
      
      if (!info.exists) {
        return {
          output: `info: ${targetPath}: No such file or directory`,
          error: true
        }
      }

      const infoLines = [
        `Path: ${targetPath}`,
        `Type: ${info.type}`,
      ]

      if (info.description) {
        infoLines.push(`Description: ${info.description}`)
      }

      if (info.url) {
        infoLines.push(`URL: ${info.url}`)
      }

      if (info.childCount !== undefined) {
        infoLines.push(`Contents: ${info.childCount} items`)
      }

      if (info.lastUpdated) {
        infoLines.push(`Last Updated: ${info.lastUpdated.toLocaleString()}`)
      }

      return {
        output: infoLines.join('\n'),
        error: false
      }
    } catch (error) {
      return {
        output: `Failed to get info: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: true
      }
    }
  }

  private executeStats(): CommandResult {
    const stats = this.fileSystemMapper.getContentStats()
    
    const statsLines = [
      'Website Content Statistics:',
      '==========================',
      `Blog Posts: ${stats.posts}`,
      `CMS Pages: ${stats.pages}`,
      `Projects: ${stats.projects}`,
      `Talks: ${stats.talks}`,
      `App Routes: ${stats.routes}`,
      '',
      `Last Content Fetch: ${stats.lastUpdated?.toLocaleString() || 'Never'}`,
      '',
      'Use "refresh" to update content from CMS',
      'Use "tree" to see the full directory structure'
    ]

    return {
      output: statsLines.join('\n'),
      error: false
    }
  }


  public getAvailableCommands(): Command[] {
    return Array.from(this.commands.values())
  }

  public getCommandCompletions(partial: string): string[] {
    const commands = Array.from(this.commands.keys())
    return commands.filter(cmd => cmd.startsWith(partial.toLowerCase()))
  }

  public getPathCompletions(currentInput: string, currentDirectory: string): string[] {
    // Extract the path part from the current input
    const parts = currentInput.split(' ')
    const lastPart = parts[parts.length - 1] || ''
    
    if (!lastPart.includes('/')) {
      // Complete with immediate children
      const children = this.fileSystemMapper.listDirectory(currentDirectory)
      return children
        .filter(child => child.name.startsWith(lastPart))
        .map(child => child.type === 'directory' ? `${child.name}/` : child.name)
    }

    // Handle path completion for complex paths
    const pathParts = lastPart.split('/')
    const fileName = pathParts.pop() || ''
    const dirPath = pathParts.join('/')
    
    const targetDir = this.fileSystemMapper.resolvePath(currentDirectory, dirPath || '')
    const children = this.fileSystemMapper.listDirectory(targetDir)
    
    return children
      .filter(child => child.name.startsWith(fileName))
      .map(child => {
        const fullPath = dirPath ? `${dirPath}/${child.name}` : child.name
        return child.type === 'directory' ? `${fullPath}/` : fullPath
      })
  }
}