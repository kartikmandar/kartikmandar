'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Media } from '@/payload-types'
import { 
  Github, 
  ExternalLink, 
  Book, 
  BarChart3, 
  Image, 
  Code, 
  Layers, 
  Lightbulb, 
  Award, 
  X, 
  ChevronRight, 
  Star, 
  GitFork, 
  Eye,
  Users,
  FolderTree,
  File,
  Folder,
  HardDrive,
  Zap,
  Clock,
  AlertCircle,
  GitPullRequest,
  CheckCircle,
  XCircle,
  GitMerge,
  FileText,
  FileCode,
  FileImage,
  FileJson,
  Database,
  Settings,
  Terminal,
  Package,
  Palette,
  Tag,
  GitBranch,
  Home,
  Shield,
  Archive,
  Download,
  Calendar
} from 'lucide-react'

import { Media as MediaComponent } from '@/components/Media'
// import useClickableCard from '@/utilities/useClickableCard'

// Utility function to generate heading IDs from text
const generateHeadingId = (children: React.ReactNode): string => {
  const text = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : ''
  return text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

// Utility function to get file icon based on extension
const getFileIcon = (filename: string) => {
  const ext = filename.toLowerCase().split('.').pop()
  
  const iconMap: { [key: string]: { icon: React.ComponentType<{ className?: string }>, color: string } } = {
    // JavaScript & TypeScript
    'js': { icon: FileCode, color: 'text-yellow-500' },
    'jsx': { icon: FileCode, color: 'text-blue-400' },
    'ts': { icon: FileCode, color: 'text-blue-600' },
    'tsx': { icon: FileCode, color: 'text-blue-500' },
    'mjs': { icon: FileCode, color: 'text-yellow-600' },
    'cjs': { icon: FileCode, color: 'text-yellow-700' },
    'ejs': { icon: FileCode, color: 'text-green-400' },
    'vue': { icon: FileCode, color: 'text-green-500' },
    'svelte': { icon: FileCode, color: 'text-orange-600' },
    'astro': { icon: FileCode, color: 'text-purple-600' },
    
    // Python
    'py': { icon: FileCode, color: 'text-green-500' },
    'pyw': { icon: FileCode, color: 'text-green-600' },
    'pyx': { icon: FileCode, color: 'text-green-700' },
    'pxd': { icon: FileCode, color: 'text-green-800' },
    'ipynb': { icon: FileCode, color: 'text-orange-500' },
    
    // Java & JVM languages
    'java': { icon: FileCode, color: 'text-red-500' },
    'kt': { icon: FileCode, color: 'text-purple-500' },
    'kts': { icon: FileCode, color: 'text-purple-600' },
    'scala': { icon: FileCode, color: 'text-red-500' },
    'clj': { icon: FileCode, color: 'text-green-600' },
    'cljs': { icon: FileCode, color: 'text-green-700' },
    'groovy': { icon: FileCode, color: 'text-blue-600' },
    'gradle': { icon: Settings, color: 'text-green-600' },
    
    // C/C++
    'c': { icon: FileCode, color: 'text-blue-800' },
    'cpp': { icon: FileCode, color: 'text-blue-700' },
    'cc': { icon: FileCode, color: 'text-blue-600' },
    'cxx': { icon: FileCode, color: 'text-blue-500' },
    'h': { icon: FileCode, color: 'text-purple-500' },
    'hpp': { icon: FileCode, color: 'text-purple-600' },
    'hxx': { icon: FileCode, color: 'text-purple-700' },
    'hh': { icon: FileCode, color: 'text-purple-400' },
    
    // C# & .NET
    'cs': { icon: FileCode, color: 'text-green-600' },
    'vb': { icon: FileCode, color: 'text-blue-500' },
    'fs': { icon: FileCode, color: 'text-blue-600' },
    'fsx': { icon: FileCode, color: 'text-blue-700' },
    'xaml': { icon: FileCode, color: 'text-purple-500' },
    
    // Web Development
    'html': { icon: Code, color: 'text-orange-500' },
    'htm': { icon: Code, color: 'text-orange-500' },
    'xhtml': { icon: Code, color: 'text-orange-600' },
    'css': { icon: Palette, color: 'text-blue-500' },
    'scss': { icon: Palette, color: 'text-pink-500' },
    'sass': { icon: Palette, color: 'text-pink-500' },
    'less': { icon: Palette, color: 'text-blue-600' },
    'stylus': { icon: Palette, color: 'text-green-500' },
    'postcss': { icon: Palette, color: 'text-red-500' },
    
    // PHP
    'php': { icon: FileCode, color: 'text-purple-700' },
    'phtml': { icon: FileCode, color: 'text-purple-600' },
    'php3': { icon: FileCode, color: 'text-purple-500' },
    'php4': { icon: FileCode, color: 'text-purple-400' },
    'php5': { icon: FileCode, color: 'text-purple-300' },
    
    // Ruby
    'rb': { icon: FileCode, color: 'text-red-600' },
    'rbw': { icon: FileCode, color: 'text-red-500' },
    'gem': { icon: Package, color: 'text-red-500' },
    'gemfile': { icon: Package, color: 'text-red-600' },
    'rakefile': { icon: Settings, color: 'text-red-500' },
    
    // Go
    'go': { icon: FileCode, color: 'text-blue-500' },
    'mod': { icon: Package, color: 'text-blue-500' },
    'sum': { icon: Package, color: 'text-blue-600' },
    
    // Rust
    'rs': { icon: FileCode, color: 'text-orange-600' },
    'rlib': { icon: Package, color: 'text-orange-500' },
    
    // Swift & Objective-C
    'swift': { icon: FileCode, color: 'text-orange-500' },
    'm': { icon: FileCode, color: 'text-blue-500' },
    'mm': { icon: FileCode, color: 'text-blue-600' },
    
    // Other Programming Languages
    'r': { icon: FileCode, color: 'text-blue-400' },
    'rmd': { icon: FileText, color: 'text-blue-500' },
    'matlab': { icon: FileCode, color: 'text-orange-600' },
    'pl': { icon: FileCode, color: 'text-blue-600' },
    'pm': { icon: FileCode, color: 'text-blue-700' },
    'lua': { icon: FileCode, color: 'text-blue-500' },
    'dart': { icon: FileCode, color: 'text-blue-400' },
    'elm': { icon: FileCode, color: 'text-green-600' },
    'hs': { icon: FileCode, color: 'text-purple-600' },
    'lhs': { icon: FileCode, color: 'text-purple-700' },
    'erl': { icon: FileCode, color: 'text-red-500' },
    'hrl': { icon: FileCode, color: 'text-red-600' },
    'ex': { icon: FileCode, color: 'text-purple-500' },
    'exs': { icon: FileCode, color: 'text-purple-600' },
    'ml': { icon: FileCode, color: 'text-orange-500' },
    'mli': { icon: FileCode, color: 'text-orange-600' },
    'nim': { icon: FileCode, color: 'text-yellow-600' },
    'cr': { icon: FileCode, color: 'text-gray-700' },
    'zig': { icon: FileCode, color: 'text-orange-500' },
    
    // Data & Configuration
    'json': { icon: FileJson, color: 'text-yellow-600' },
    'json5': { icon: FileJson, color: 'text-yellow-700' },
    'jsonc': { icon: FileJson, color: 'text-yellow-500' },
    'xml': { icon: FileCode, color: 'text-green-600' },
    'yaml': { icon: FileText, color: 'text-purple-500' },
    'yml': { icon: FileText, color: 'text-purple-500' },
    'toml': { icon: FileText, color: 'text-orange-500' },
    'ini': { icon: Settings, color: 'text-gray-500' },
    'cfg': { icon: Settings, color: 'text-gray-500' },
    'conf': { icon: Settings, color: 'text-gray-500' },
    'config': { icon: Settings, color: 'text-gray-500' },
    'properties': { icon: Settings, color: 'text-blue-500' },
    'env': { icon: Settings, color: 'text-green-500' },
    'dotenv': { icon: Settings, color: 'text-green-600' },
    'editorconfig': { icon: Settings, color: 'text-gray-600' },
    'prettierrc': { icon: Settings, color: 'text-pink-500' },
    'eslintrc': { icon: Settings, color: 'text-purple-500' },
    'babelrc': { icon: Settings, color: 'text-yellow-500' },
    'browserslistrc': { icon: Settings, color: 'text-green-500' },
    
    // Documentation
    'md': { icon: FileText, color: 'text-blue-600' },
    'markdown': { icon: FileText, color: 'text-blue-600' },
    'mdown': { icon: FileText, color: 'text-blue-500' },
    'mkdown': { icon: FileText, color: 'text-blue-400' },
    'txt': { icon: FileText, color: 'text-gray-600' },
    'text': { icon: FileText, color: 'text-gray-500' },
    'rst': { icon: FileText, color: 'text-blue-500' },
    'rtf': { icon: FileText, color: 'text-blue-400' },
    'adoc': { icon: FileText, color: 'text-green-500' },
    'asciidoc': { icon: FileText, color: 'text-green-600' },
    'org': { icon: FileText, color: 'text-green-600' },
    'tex': { icon: FileText, color: 'text-blue-600' },
    'latex': { icon: FileText, color: 'text-blue-700' },
    'bibtex': { icon: FileText, color: 'text-green-600' },
    
    // Images
    'png': { icon: FileImage, color: 'text-green-500' },
    'jpg': { icon: FileImage, color: 'text-green-500' },
    'jpeg': { icon: FileImage, color: 'text-green-500' },
    'gif': { icon: FileImage, color: 'text-purple-500' },
    'svg': { icon: FileImage, color: 'text-orange-500' },
    'webp': { icon: FileImage, color: 'text-blue-500' },
    'ico': { icon: FileImage, color: 'text-yellow-500' },
    'bmp': { icon: FileImage, color: 'text-blue-400' },
    'tiff': { icon: FileImage, color: 'text-green-400' },
    'tif': { icon: FileImage, color: 'text-green-300' },
    'psd': { icon: FileImage, color: 'text-blue-600' },
    'ai': { icon: FileImage, color: 'text-orange-600' },
    'eps': { icon: FileImage, color: 'text-red-500' },
    'pdf': { icon: FileText, color: 'text-red-600' },
    
    // Audio & Video
    'mp3': { icon: File, color: 'text-green-500' },
    'wav': { icon: File, color: 'text-blue-500' },
    'flac': { icon: File, color: 'text-purple-500' },
    'ogg': { icon: File, color: 'text-orange-500' },
    'mp4': { icon: File, color: 'text-red-500' },
    'avi': { icon: File, color: 'text-blue-600' },
    'mov': { icon: File, color: 'text-gray-600' },
    'wmv': { icon: File, color: 'text-blue-700' },
    'flv': { icon: File, color: 'text-red-400' },
    'webm': { icon: File, color: 'text-green-600' },
    
    // Archives
    'zip': { icon: Package, color: 'text-yellow-500' },
    'rar': { icon: Package, color: 'text-red-500' },
    '7z': { icon: Package, color: 'text-blue-500' },
    'tar': { icon: Package, color: 'text-brown-500' },
    'gz': { icon: Package, color: 'text-gray-500' },
    'bz2': { icon: Package, color: 'text-orange-500' },
    'xz': { icon: Package, color: 'text-purple-500' },
    
    // Database
    'sql': { icon: Database, color: 'text-blue-600' },
    'db': { icon: Database, color: 'text-gray-600' },
    'sqlite': { icon: Database, color: 'text-gray-600' },
    'sqlite3': { icon: Database, color: 'text-gray-700' },
    'mdb': { icon: Database, color: 'text-blue-500' },
    'accdb': { icon: Database, color: 'text-blue-400' },
    
    // Package Managers & Dependencies
    'package.json': { icon: Package, color: 'text-green-600' },
    'package-lock.json': { icon: Package, color: 'text-red-600' },
    'yarn.lock': { icon: Package, color: 'text-blue-500' },
    'pnpm-lock.yaml': { icon: Package, color: 'text-yellow-600' },
    'composer.json': { icon: Package, color: 'text-orange-500' },
    'composer.lock': { icon: Package, color: 'text-orange-600' },
    'requirements.txt': { icon: Package, color: 'text-blue-500' },
    'pipfile': { icon: Package, color: 'text-yellow-500' },
    'pipfile.lock': { icon: Package, color: 'text-yellow-600' },
    'cargo.toml': { icon: Package, color: 'text-orange-600' },
    'cargo.lock': { icon: Package, color: 'text-orange-700' },
    'go.mod': { icon: Package, color: 'text-blue-500' },
    'go.sum': { icon: Package, color: 'text-blue-600' },
    'pubspec.yaml': { icon: Package, color: 'text-blue-400' },
    'mix.exs': { icon: Package, color: 'text-purple-500' },
    'dune-project': { icon: Package, color: 'text-orange-500' },
    
    // Shell Scripts
    'sh': { icon: Terminal, color: 'text-green-500' },
    'bash': { icon: Terminal, color: 'text-green-500' },
    'zsh': { icon: Terminal, color: 'text-green-600' },
    'fish': { icon: Terminal, color: 'text-blue-500' },
    'csh': { icon: Terminal, color: 'text-green-400' },
    'tcsh': { icon: Terminal, color: 'text-green-300' },
    'ksh': { icon: Terminal, color: 'text-green-700' },
    'ps1': { icon: Terminal, color: 'text-blue-600' },
    'psm1': { icon: Terminal, color: 'text-blue-700' },
    'bat': { icon: Terminal, color: 'text-gray-600' },
    'cmd': { icon: Terminal, color: 'text-gray-600' },
    
    // Build Tools & CI/CD
    'dockerfile': { icon: Package, color: 'text-blue-500' },
    'docker-compose.yml': { icon: Package, color: 'text-blue-600' },
    'docker-compose.yaml': { icon: Package, color: 'text-blue-600' },
    'makefile': { icon: Settings, color: 'text-red-500' },
    'cmake': { icon: Settings, color: 'text-red-600' },
    'cmakelists.txt': { icon: Settings, color: 'text-red-500' },
    'jenkinsfile': { icon: Settings, color: 'text-blue-500' },
    'gulpfile.js': { icon: Settings, color: 'text-red-500' },
    'gruntfile.js': { icon: Settings, color: 'text-orange-500' },
    'webpack.config.js': { icon: Settings, color: 'text-blue-600' },
    'rollup.config.js': { icon: Settings, color: 'text-red-400' },
    'vite.config.js': { icon: Settings, color: 'text-purple-500' },
    'vite.config.ts': { icon: Settings, color: 'text-purple-600' },
    'next.config.js': { icon: Settings, color: 'text-gray-700' },
    'nuxt.config.js': { icon: Settings, color: 'text-green-500' },
    'astro.config.mjs': { icon: Settings, color: 'text-purple-600' },
    'svelte.config.js': { icon: Settings, color: 'text-orange-600' },
    'tailwind.config.js': { icon: Settings, color: 'text-blue-400' },
    'postcss.config.js': { icon: Settings, color: 'text-red-500' },
    'jest.config.js': { icon: Settings, color: 'text-green-600' },
    'vitest.config.js': { icon: Settings, color: 'text-yellow-500' },
    'cypress.config.js': { icon: Settings, color: 'text-green-500' },
    'playwright.config.js': { icon: Settings, color: 'text-green-600' },
    
    // Version Control
    'gitignore': { icon: Settings, color: 'text-orange-500' },
    'gitattributes': { icon: Settings, color: 'text-orange-500' },
    'gitmodules': { icon: Settings, color: 'text-orange-600' },
    'gitkeep': { icon: Settings, color: 'text-orange-400' },
    'hgignore': { icon: Settings, color: 'text-blue-500' },
    
    // License & Legal
    'license': { icon: FileText, color: 'text-green-600' },
    'licence': { icon: FileText, color: 'text-green-600' },
    'copying': { icon: FileText, color: 'text-green-500' },
    'copyright': { icon: FileText, color: 'text-green-400' },
    
    // IDE & Editor Files
    'code-workspace': { icon: Settings, color: 'text-blue-500' },
    'sublime-project': { icon: Settings, color: 'text-orange-500' },
    'sublime-workspace': { icon: Settings, color: 'text-orange-600' },
    
    // Dotfiles - Development Tools
    '.env': { icon: Settings, color: 'text-green-500' },
    '.env.local': { icon: Settings, color: 'text-green-600' },
    '.env.development': { icon: Settings, color: 'text-green-400' },
    '.env.production': { icon: Settings, color: 'text-green-700' },
    '.env.test': { icon: Settings, color: 'text-green-300' },
    '.env.example': { icon: Settings, color: 'text-gray-500' },
    '.envrc': { icon: Settings, color: 'text-green-500' },
    
    // Dotfiles - Linting & Formatting
    '.eslintrc': { icon: Settings, color: 'text-purple-500' },
    '.eslintrc.js': { icon: Settings, color: 'text-purple-500' },
    '.eslintrc.json': { icon: Settings, color: 'text-purple-500' },
    '.eslintrc.yaml': { icon: Settings, color: 'text-purple-500' },
    '.eslintignore': { icon: Settings, color: 'text-purple-400' },
    '.prettierrc': { icon: Settings, color: 'text-pink-500' },
    '.prettierrc.js': { icon: Settings, color: 'text-pink-500' },
    '.prettierrc.json': { icon: Settings, color: 'text-pink-500' },
    '.prettierrc.yaml': { icon: Settings, color: 'text-pink-500' },
    '.prettierignore': { icon: Settings, color: 'text-pink-400' },
    '.stylelintrc': { icon: Settings, color: 'text-blue-500' },
    '.stylelintrc.js': { icon: Settings, color: 'text-blue-500' },
    '.stylelintrc.json': { icon: Settings, color: 'text-blue-500' },
    '.stylelintignore': { icon: Settings, color: 'text-blue-400' },
    '.flake8': { icon: Settings, color: 'text-green-500' },
    '.flake8rc': { icon: Settings, color: 'text-green-500' },
    '.pylintrc': { icon: Settings, color: 'text-green-600' },
    '.pycodestyle': { icon: Settings, color: 'text-green-400' },
    '.mypy.ini': { icon: Settings, color: 'text-blue-500' },
    '.bandit': { icon: Settings, color: 'text-red-500' },
    '.black': { icon: Settings, color: 'text-gray-800' },
    '.isort.cfg': { icon: Settings, color: 'text-orange-500' },
    
    // Dotfiles - Testing & Coverage
    '.coverage': { icon: BarChart3, color: 'text-green-500' },
    '.coveragerc': { icon: BarChart3, color: 'text-green-600' },
    '.nyc_output': { icon: BarChart3, color: 'text-yellow-500' },
    '.nycrc': { icon: BarChart3, color: 'text-yellow-600' },
    '.nycrc.json': { icon: BarChart3, color: 'text-yellow-600' },
    
    // Dotfiles - Build & Deployment
    '.babelrc': { icon: Settings, color: 'text-yellow-500' },
    '.babelrc.js': { icon: Settings, color: 'text-yellow-500' },
    '.babelrc.json': { icon: Settings, color: 'text-yellow-500' },
    '.swcrc': { icon: Settings, color: 'text-orange-500' },
    '.browserslistrc': { icon: Settings, color: 'text-green-500' },
    '.nvmrc': { icon: Settings, color: 'text-green-600' },
    '.node-version': { icon: Settings, color: 'text-green-600' },
    '.python-version': { icon: Settings, color: 'text-green-500' },
    '.ruby-version': { icon: Settings, color: 'text-red-500' },
    '.java-version': { icon: Settings, color: 'text-red-500' },
    '.tool-versions': { icon: Settings, color: 'text-blue-500' },
    '.dockerignore': { icon: Settings, color: 'text-blue-400' },
    '.helmignore': { icon: Settings, color: 'text-blue-600' },
    
    // Dotfiles - Editor & IDE Configurations
    '.vscode': { icon: Folder, color: 'text-blue-500' },
    '.idea': { icon: Folder, color: 'text-orange-500' },
    '.sublime': { icon: Folder, color: 'text-orange-600' },
    '.atom': { icon: Folder, color: 'text-green-500' },
    '.vim': { icon: Folder, color: 'text-green-600' },
    '.emacs': { icon: Folder, color: 'text-purple-500' },
    '.editorconfig': { icon: Settings, color: 'text-gray-600' },
    '.vimrc': { icon: Settings, color: 'text-green-600' },
    '.gvimrc': { icon: Settings, color: 'text-green-700' },
    '.tmux.conf': { icon: Settings, color: 'text-green-500' },
    
    // Dotfiles - Cloud & Infrastructure
    '.github': { icon: Folder, color: 'text-gray-700' },
    '.gitlab': { icon: Folder, color: 'text-orange-500' },
    '.bitbucket': { icon: Folder, color: 'text-blue-600' },
    '.circleci': { icon: Folder, color: 'text-green-500' },
    '.travis.yml': { icon: Settings, color: 'text-yellow-600' },
    '.appveyor.yml': { icon: Settings, color: 'text-blue-500' },
    '.azure-pipelines.yml': { icon: Settings, color: 'text-blue-600' },
    '.buildkite': { icon: Folder, color: 'text-green-600' },
    '.codeship': { icon: Folder, color: 'text-blue-500' },
    '.drone.yml': { icon: Settings, color: 'text-blue-400' },
    '.gitlab-ci.yml': { icon: Settings, color: 'text-orange-500' },
    '.semaphore': { icon: Folder, color: 'text-blue-600' },
    '.wercker.yml': { icon: Settings, color: 'text-orange-600' },
    
    // Dotfiles - Package Managers & Dependencies
    '.npmrc': { icon: Settings, color: 'text-red-500' },
    '.yarnrc': { icon: Settings, color: 'text-blue-500' },
    '.yarnrc.yml': { icon: Settings, color: 'text-blue-500' },
    '.pnpmrc': { icon: Settings, color: 'text-yellow-600' },
    '.pip.conf': { icon: Settings, color: 'text-blue-500' },
    '.piprc': { icon: Settings, color: 'text-blue-600' },
    '.gemrc': { icon: Settings, color: 'text-red-500' },
    '.bundle': { icon: Folder, color: 'text-red-600' },
    '.cargo': { icon: Folder, color: 'text-orange-600' },
    
    // Dotfiles - Database & Cache
    '.pgpass': { icon: Database, color: 'text-blue-600' },
    '.my.cnf': { icon: Database, color: 'text-orange-500' },
    '.rediscli_history': { icon: Database, color: 'text-red-500' },
    '.mongorc.js': { icon: Database, color: 'text-green-600' },
    
    // Dotfiles - Shell & Terminal
    '.bashrc': { icon: Terminal, color: 'text-green-500' },
    '.bash_profile': { icon: Terminal, color: 'text-green-600' },
    '.bash_history': { icon: Terminal, color: 'text-green-400' },
    '.bash_logout': { icon: Terminal, color: 'text-green-300' },
    '.zshrc': { icon: Terminal, color: 'text-green-600' },
    '.zsh_history': { icon: Terminal, color: 'text-green-500' },
    '.zprofile': { icon: Terminal, color: 'text-green-700' },
    '.zshenv': { icon: Terminal, color: 'text-green-400' },
    '.fishrc': { icon: Terminal, color: 'text-blue-500' },
    '.fish_history': { icon: Terminal, color: 'text-blue-400' },
    '.profile': { icon: Terminal, color: 'text-gray-600' },
    '.aliases': { icon: Terminal, color: 'text-purple-500' },
    '.functions': { icon: Terminal, color: 'text-purple-600' },
    '.exports': { icon: Terminal, color: 'text-blue-500' },
    '.path': { icon: Terminal, color: 'text-blue-600' },
    
    // Dotfiles - Security & Authentication
    '.ssh': { icon: Folder, color: 'text-red-500' },
    '.gnupg': { icon: Folder, color: 'text-red-600' },
    '.gpg': { icon: Folder, color: 'text-red-600' },
    '.aws': { icon: Folder, color: 'text-orange-500' },
    '.gcloud': { icon: Folder, color: 'text-blue-500' },
    '.azure': { icon: Folder, color: 'text-blue-600' },
    '.kube': { icon: Folder, color: 'text-blue-400' },
    '.docker': { icon: Folder, color: 'text-blue-500' },
    '.netrc': { icon: Settings, color: 'text-red-500' },
    '.authinfo': { icon: Settings, color: 'text-red-600' },
    
    // Dotfiles - AI & Machine Learning
    '.claude': { icon: Folder, color: 'text-purple-600' },
    '.anthropic': { icon: Folder, color: 'text-purple-500' },
    '.openai': { icon: Folder, color: 'text-green-500' },
    '.huggingface': { icon: Folder, color: 'text-yellow-500' },
    '.wandb': { icon: Folder, color: 'text-yellow-600' },
    '.mlflow': { icon: Folder, color: 'text-blue-500' },
    '.tensorboard': { icon: Folder, color: 'text-orange-500' },
    '.jupyter': { icon: Folder, color: 'text-orange-600' },
    '.ipython': { icon: Folder, color: 'text-blue-600' },
    
    // Dotfiles - Development Environment
    '.devcontainer': { icon: Folder, color: 'text-blue-500' },
    '.codespaces': { icon: Folder, color: 'text-blue-600' },
    '.gitpod.yml': { icon: Settings, color: 'text-orange-500' },
    '.gitpod.dockerfile': { icon: Settings, color: 'text-orange-600' },
    '.replit': { icon: Settings, color: 'text-green-500' },
    '.glitch-assets': { icon: Settings, color: 'text-purple-500' },
    '.stackblitzrc': { icon: Settings, color: 'text-blue-500' },
    
    // Dotfiles - Monitoring & Analytics
    '.sentry': { icon: Settings, color: 'text-purple-600' },
    '.bugsnag': { icon: Settings, color: 'text-green-600' },
    '.rollbar': { icon: Settings, color: 'text-blue-500' },
    '.datadog': { icon: Settings, color: 'text-purple-500' },
    '.newrelic': { icon: Settings, color: 'text-green-500' },
    '.prometheus': { icon: Settings, color: 'text-orange-500' },
    '.grafana': { icon: Settings, color: 'text-orange-600' },
    
    // Dotfiles - Misc Development Tools
    '.pre-commit-config.yaml': { icon: Settings, color: 'text-yellow-500' },
    '.pre-commit-hooks.yaml': { icon: Settings, color: 'text-yellow-600' },
    '.commitlintrc': { icon: Settings, color: 'text-blue-500' },
    '.commitlintrc.js': { icon: Settings, color: 'text-blue-500' },
    '.commitlintrc.json': { icon: Settings, color: 'text-blue-500' },
    '.conventional-commits': { icon: Settings, color: 'text-green-500' },
    '.semantic-release': { icon: Settings, color: 'text-green-600' },
    '.releaserc': { icon: Settings, color: 'text-green-500' },
    '.releaserc.js': { icon: Settings, color: 'text-green-500' },
    '.releaserc.json': { icon: Settings, color: 'text-green-500' },
    '.changelog': { icon: FileText, color: 'text-green-500' },
    '.keep': { icon: Settings, color: 'text-gray-500' },
    '.gitkeep': { icon: Settings, color: 'text-orange-400' },
    '.DS_Store': { icon: Settings, color: 'text-gray-400' },
    '.localized': { icon: Settings, color: 'text-blue-400' },
    '.CFUserTextEncoding': { icon: Settings, color: 'text-gray-400' },
    
    // Other Special Files
    'readme': { icon: FileText, color: 'text-blue-600' },
    'readme.md': { icon: FileText, color: 'text-blue-600' },
    'changelog': { icon: FileText, color: 'text-green-500' },
    'changelog.md': { icon: FileText, color: 'text-green-500' },
    'contributing': { icon: FileText, color: 'text-green-600' },
    'contributing.md': { icon: FileText, color: 'text-green-600' },
    'authors': { icon: FileText, color: 'text-blue-500' },
    'contributors': { icon: FileText, color: 'text-blue-400' },
    'maintainers': { icon: FileText, color: 'text-blue-300' },
    'security': { icon: FileText, color: 'text-red-500' },
    'security.md': { icon: FileText, color: 'text-red-500' },
    'code_of_conduct': { icon: FileText, color: 'text-purple-500' },
    'code_of_conduct.md': { icon: FileText, color: 'text-purple-500' },
    'funding.yml': { icon: Settings, color: 'text-pink-500' },
    'dependabot.yml': { icon: Settings, color: 'text-blue-500' },
    'renovate.json': { icon: Settings, color: 'text-blue-600' },
  }
  
  // Check for exact filename matches first
  const fullName = filename.toLowerCase()
  if (iconMap[fullName]) {
    return iconMap[fullName]
  }
  
  // Then check by extension
  if (ext && iconMap[ext]) {
    return iconMap[ext]
  }
  
  // Default file icon
  return { icon: File, color: 'text-gray-500' }
}

export interface ProjectTechStack {
  name: string
  icon?: React.ComponentType<{ className?: string }>
}

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

type TreeNode = {
  [key: string]: {
    type: 'tree' | 'blob' | 'commit'
    size?: number
    children: TreeNode
  }
}

export interface Project {
  id: string | number
  title: string
  shortDescription?: string
  description: string
  coverImage?: string | number | Media | null
  techStack?: (string | ProjectTechStack)[]
  github?: ProjectGithubStats
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
  linesOfCode?: number
  totalCommits?: number
  fileCount?: number
  directoryCount?: number
  repositorySize?: number
  contributors?: Array<{
    name: string
    contributions: number
    githubUrl?: string
    avatarUrl?: string
  }>
  fileTree?: Array<{
    path: string
    type: 'blob' | 'tree' | 'commit'
    size?: number
    url: string
  }>
  createdAt?: string
  updatedAt?: string
  readme?: string
  readmeIsMarkdown?: boolean
  architecture?: string
  problemSolving?: string
  usageGuide?: string
  futureWork?: string
  publication?: ProjectPublication
  plots?: ProjectMedia[]
  images?: ProjectMedia[]
  posters?: ProjectPoster[]
  demoUrl?: string
  status?: 'active' | 'completed' | 'archived'
  category?: string
  lastGitHubSync?: string
  githubIssues?: {
    total: number
    open: number
    closed: number
  }
  githubPullRequests?: {
    total: number
    open: number
    closed: number
    merged: number
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
  projectDetails?: {
    linesOfCode?: number
    architecture?: string
    usageGuide?: string
    problemSolving?: string
    futureWork?: string
    readme?: string
    totalCommits?: number
    contributors?: Array<{
      name: string
      contributions: number
      githubUrl?: string
      avatarUrl?: string
    }>
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
    fileTree?: Array<{
      path: string
      type: 'blob' | 'tree'
      size?: number
      url?: string
    }>
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
}

interface ProjectCardProps {
  project: Project
  onExpand?: (project: Project) => void
  className?: string
  variant?: 'default' | 'compact' | 'featured'
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onExpand,
  className = '',
  variant = 'default'
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false)

  const handleModalOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onExpand) {
      onExpand(project)
    }
  }

  const renderTechStack = () => {
    if (!project.techStack?.length) return null
    
    const displayCount = variant === 'compact' ? 2 : 3
    const visibleTech = project.techStack.slice(0, displayCount)
    const remainingCount = project.techStack.length - displayCount

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {visibleTech.map((tech, index) => {
          const techName = typeof tech === 'string' ? tech : tech.name
          return (
            <span 
              key={index} 
              className="px-3 py-1.5 bg-secondary text-secondary-foreground text-xs md:text-xs font-medium rounded-full min-h-[28px] flex items-center"
            >
              {techName}
            </span>
          )
        })}
        {remainingCount > 0 && (
          <span className="px-3 py-1.5 bg-muted text-muted-foreground text-xs md:text-xs font-medium rounded-full min-h-[28px] flex items-center">
            +{remainingCount} more
          </span>
        )}
      </div>
    )
  }

  const renderStats = () => {
    if (!project.links?.githubStats && !project.linesOfCode) return null

    return (
      <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-xs text-muted-foreground">
        {project.links?.githubStats && (
          <>
            <div className="flex items-center gap-1 min-h-[24px]">
              <Star className="w-3 h-3 md:w-3 md:h-3" />
              <span>{(project.links.githubStats.stars || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 min-h-[24px]">
              <GitFork className="w-3 h-3 md:w-3 md:h-3" />
              <span>{(project.links.githubStats.forks || 0).toLocaleString()}</span>
            </div>
          </>
        )}
        {project.linesOfCode && (
          <div className="flex items-center gap-1 min-h-[24px]">
            <Code className="w-3 h-3 md:w-3 md:h-3" />
            <span>{project.linesOfCode.toLocaleString()} lines</span>
          </div>
        )}
      </div>
    )
  }

  const cardClasses = `
    relative bg-card border border-border rounded-lg overflow-hidden
    transition-all duration-300 ease-out shadow-sm transform
    ${isHovered ? 'shadow-lg border-primary/20 -translate-y-1' : 'hover:shadow-md'}
    ${variant === 'featured' ? 'col-span-full md:col-span-2' : ''}
    ${className}
  `.trim()

  return (
    <div 
      className={cardClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Image */}
      <div 
        className={`relative bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 overflow-hidden cursor-pointer ${
          variant === 'compact' ? 'h-24 md:h-32' : variant === 'featured' ? 'h-48 md:h-64' : 'h-40 md:h-48'
        }`}
        onClick={handleModalOpen}
      >
        {project.coverImage ? (
          <MediaComponent 
            resource={project.coverImage} 
            imgClassName="object-cover object-center"
            className="w-full h-full bg-muted/20"
            fill={true}
            alt={project.title}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground text-4xl opacity-60">
              <BarChart3 />
            </div>
          </div>
        )}
        {/* Enhanced gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/30 to-transparent"></div>
        
        {/* Status Badge */}
        {project.status && (
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-md shadow-lg border border-white/20 ${
              project.status === 'active' ? 'bg-green-500/90 text-white shadow-green-500/25' :
              project.status === 'completed' ? 'bg-blue-500/90 text-white shadow-blue-500/25' :
              'bg-gray-500/90 text-white shadow-gray-500/25'
            }`}>
              {project.status}
            </span>
          </div>
        )}

        {/* Action Icons */}
        <div className="absolute top-3 md:top-4 right-3 md:right-4 flex gap-2">
          {project.links?.githubUrl && (
            <a
              href={project.links.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900/80 dark:bg-white/90 backdrop-blur-md rounded-full p-3 md:p-2.5 shadow-lg border border-white/20 dark:border-gray-900/20 hover:bg-gray-800/90 dark:hover:bg-white transition-all duration-200 z-20 hover:scale-105 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
              aria-label="View GitHub repository"
            >
              <Github className="w-4 h-4 md:w-4 md:h-4 text-white dark:text-gray-900" />
            </a>
          )}
          {project.publication && (
            <div className="bg-orange-500/90 backdrop-blur-md rounded-full p-3 md:p-2.5 shadow-lg border border-white/20 hover:scale-105 transition-transform duration-200 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center">
              <Award className="w-4 h-4 md:w-4 md:h-4 text-white" />
            </div>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500/90 backdrop-blur-md rounded-full p-3 md:p-2.5 shadow-lg border border-white/20 hover:bg-blue-600/90 transition-all duration-200 z-20 hover:scale-105 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
              aria-label="View live demo"
            >
              <ExternalLink className="w-4 h-4 md:w-4 md:h-4 text-white" />
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 
              className="text-lg md:text-xl font-semibold text-foreground leading-tight mb-1 cursor-pointer hover:text-primary transition-colors line-clamp-2 md:truncate"
              onClick={handleModalOpen}
            >
              {project.title}
            </h3>
            {project.category && (
              <span className="text-xs md:text-xs uppercase text-muted-foreground font-medium tracking-wide">
                {project.category}
              </span>
            )}
          </div>
          <ChevronRight 
            className={`w-5 h-5 text-muted-foreground transition-all duration-300 ml-2 md:ml-2 flex-shrink-0 cursor-pointer hover:text-primary min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0 ${
              isHovered ? 'translate-x-1' : ''
            }`}
            onClick={handleModalOpen}
          />
        </div>
        
        <p className="text-muted-foreground text-sm md:text-sm leading-relaxed mb-4 overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical' as const,
        }}>
          {project.shortDescription || project.description}
        </p>
        
        {/* Tech Stack */}
        {renderTechStack()}

        {/* Stats */}
        {renderStats()}
      </div>

      {/* External Link - only show when no modal functionality */}
      {!onExpand && (project.github?.url || project.demoUrl) && (
        <a
          href={project.demoUrl || project.github?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10"
          aria-label={`View ${project.title}`}
        >
          <span className="sr-only">View {project.title}</span>
        </a>
      )}
    </div>
  )
}

interface ProjectModalProps {
  project: Project
  onClose: () => void
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye, condition: true },
    { id: 'code', label: 'Code & Architecture', icon: Code, condition: !!(project.github || project.architecture) },
    { id: 'research', label: 'Research', icon: Book, condition: !!(project.problemSolving || project.publication) },
    { id: 'media', label: 'Media', icon: Image, condition: !!(project.plots?.length || project.images?.length || project.posters?.length) },
    { id: 'future', label: 'Future Work', icon: Lightbulb, condition: !!project.futureWork },
  ].filter(tab => tab.condition)

  React.useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscKey)
    document.body.style.overflow = 'hidden'
    
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10)
    
    return () => {
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    // Restore body scroll immediately when closing starts
    document.body.style.overflow = 'unset'
    setTimeout(() => onClose(), 200) // Wait for exit animation
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    handleClose()
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-foreground">Project Description</h3>
              <p className="text-muted-foreground leading-relaxed">{project.description}</p>
            </div>
            
            {project.techStack && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Technology Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, index) => {
                    const techName = typeof tech === 'string' ? tech : tech.name
                    return (
                      <span key={index} className="px-4 py-2 bg-secondary text-secondary-foreground font-medium rounded-lg">
                        {techName}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {project.usageGuide && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Usage Guide</h3>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">{project.usageGuide}</pre>
                </div>
              </div>
            )}
          </div>
        )

      case 'code':
        return (
          <div className="space-y-6">
            {!project.github && !project.architecture && (
              <div className="text-center py-8">
                <Code className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Code Information Available</h3>
                <p className="text-muted-foreground">
                  This project doesn&apos;t have GitHub repository or architecture information linked.
                </p>
              </div>
            )}
            
            {project.github && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <Github className="w-5 h-5" />
                    Repository Information
                  </h3>
                  {project.lastGitHubSync && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last synced: {new Date(project.lastGitHubSync).toLocaleDateString()} {new Date(project.lastGitHubSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-foreground">{project.links?.githubUrl?.split('/').pop()}</span>
                    <a 
                      href={project.links?.githubUrl || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on GitHub
                    </a>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-3 bg-background rounded border border-border">
                      <Star className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                      <div className="font-medium text-foreground">{(project.links?.githubStats?.stars || 0).toLocaleString()}</div>
                      <div className="text-muted-foreground">Stars</div>
                    </div>
                    <div className="text-center p-3 bg-background rounded border border-border">
                      <GitFork className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <div className="font-medium text-foreground">{(project.links?.githubStats?.forks || 0).toLocaleString()}</div>
                      <div className="text-muted-foreground">Forks</div>
                    </div>
                    <div className="text-center p-3 bg-background rounded border border-border">
                      <Eye className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                      <div className="font-medium text-foreground">{(project.links?.githubStats?.watchers || 0).toLocaleString()}</div>
                      <div className="text-muted-foreground">Watchers</div>
                    </div>
                    <div className="text-center p-3 bg-background rounded border border-border">
                      <Code className="w-4 h-4 mx-auto mb-1 text-green-500" />
                      <div className="font-medium text-foreground">
                        {project.linesOfCode ? project.linesOfCode.toLocaleString() : 
                         project.totalCommits ? project.totalCommits.toLocaleString() : 
                         project.fileCount ? project.fileCount.toLocaleString() : '-'}
                      </div>
                      <div className="text-muted-foreground">
                        {project.linesOfCode ? 'Lines' : 
                         project.totalCommits ? 'Commits' : 
                         project.fileCount ? 'Files' : 'Lines'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Repository Dates */}
                  {(project.createdAt || project.updatedAt) && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {project.createdAt && (
                          <div>
                            <div className="text-muted-foreground text-xs mb-1">Created</div>
                            <div className="font-medium text-foreground">
                              {new Date(project.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        )}
                        {project.updatedAt && (
                          <div>
                            <div className="text-muted-foreground text-xs mb-1">Last Updated</div>
                            <div className="font-medium text-foreground">
                              {new Date(project.updatedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Repository Metadata */}
            {project.links?.githubUrl && (project.links?.githubStats?.language || project.projectDetails?.license || project.projectDetails?.defaultBranch || project.projectDetails?.homepage || project.projectDetails?.topics?.length || project.projectDetails?.isArchived !== undefined || project.projectDetails?.isFork !== undefined || project.branches?.length) && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <Settings className="w-5 h-5" />
                  Repository Metadata
                </h3>
                <div className="bg-muted rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {/* Language & License */}
                    <div className="space-y-3">
                      {project.links?.githubStats?.language && (
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-blue-500" />
                          <span className="text-muted-foreground">Language:</span>
                          <span className="font-medium text-foreground">{project.links.githubStats.language}</span>
                        </div>
                      )}
                      {project.projectDetails?.license && (
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span className="text-muted-foreground">License:</span>
                          <span className="font-medium text-foreground">{project.projectDetails.license}</span>
                        </div>
                      )}
                      {project.projectDetails?.defaultBranch && (
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-4 h-4 text-purple-500" />
                          <span className="text-muted-foreground">Default Branch:</span>
                          <span className="font-medium text-foreground">{project.projectDetails.defaultBranch}</span>
                        </div>
                      )}
                      {project.projectDetails?.homepage && (
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-orange-500" />
                          <span className="text-muted-foreground">Homepage:</span>
                          <a 
                            href={project.projectDetails.homepage} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:text-primary/80 transition-colors truncate"
                          >
                            {project.projectDetails.homepage.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {/* Status Flags */}
                    <div className="space-y-3">
                      {(project.projectDetails?.isArchived !== undefined || project.projectDetails?.isFork !== undefined) && (
                        <div className="space-y-2">
                          <span className="text-muted-foreground text-xs font-medium uppercase">Repository Status</span>
                          {project.projectDetails?.isArchived && (
                            <div className="flex items-center gap-2">
                              <Archive className="w-4 h-4 text-yellow-500" />
                              <span className="text-yellow-600 dark:text-yellow-400 font-medium">Archived Repository</span>
                            </div>
                          )}
                          {project.projectDetails?.isFork && (
                            <div className="flex items-center gap-2">
                              <GitFork className="w-4 h-4 text-blue-500" />
                              <span className="text-blue-600 dark:text-blue-400 font-medium">Forked Repository</span>
                            </div>
                          )}
                          {!project.projectDetails?.isArchived && !project.projectDetails?.isFork && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-green-600 dark:text-green-400 font-medium">Active Repository</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Topics/Tags */}
                  {project.projectDetails?.topics && project.projectDetails.topics.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground text-sm font-medium">Topics</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.projectDetails.topics.slice(0, 10).map((topic, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md border border-primary/20"
                          >
                            {typeof topic === 'string' ? topic : topic.topic}
                          </span>
                        ))}
                        {project.projectDetails.topics.length > 10 && (
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md">
                            +{project.projectDetails.topics.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Branches */}
                  {project.branches && project.branches.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <GitBranch className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground text-sm font-medium">Branches ({project.branches.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {project.branches.map((branch, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-2 bg-background rounded border border-border text-sm"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <GitBranch className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <span className="font-medium text-foreground truncate">{branch.name}</span>
                              {branch.protected && (
                                <Shield className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                              )}
                            </div>
                            {branch.commitSha && (
                              <span className="text-xs text-muted-foreground font-mono">
                                {branch.commitSha.slice(0, 7)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Latest Release */}
            {project.latestRelease && (project.latestRelease.version || project.latestRelease.name) && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <Package className="w-5 h-5" />
                  Latest Release
                </h3>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground text-lg">
                          {project.latestRelease.version || project.latestRelease.name}
                        </span>
                        {project.latestRelease.version && project.latestRelease.name && project.latestRelease.version !== project.latestRelease.name && (
                          <span className="text-sm text-muted-foreground">({project.latestRelease.name})</span>
                        )}
                      </div>
                      {project.latestRelease.publishedAt && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          Released {new Date(project.latestRelease.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      {project.latestRelease.downloadCount !== undefined && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Download className="w-3 h-3" />
                          <span>{project.latestRelease.downloadCount.toLocaleString()} downloads</span>
                        </div>
                      )}
                      {project.latestRelease.htmlUrl && (
                        <a
                          href={project.latestRelease.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Release
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {project.latestRelease.description && (
                    <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        <ReactMarkdown
                          components={{
                            a: ({ href, children, ...props }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 transition-colors"
                                {...props}
                              >
                                {children}
                              </a>
                            ),
                            p: ({ children, ...props }) => (
                              <p className="mb-2 last:mb-0" {...props}>{children}</p>
                            ),
                            ul: ({ children, ...props }) => (
                              <ul className="list-disc list-inside mb-2" {...props}>{children}</ul>
                            ),
                            li: ({ children, ...props }) => (
                              <li className="mb-1" {...props}>{children}</li>
                            )
                          }}
                        >
                          {project.latestRelease.description.length > 300 
                            ? project.latestRelease.description.substring(0, 300) + '...'
                            : project.latestRelease.description
                          }
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contributors Section */}
            {project.contributors && project.contributors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <Users className="w-5 h-5" />
                  Contributors ({project.contributors.length})
                </h3>
                <div className="bg-muted rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {project.contributors.map((contributor, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-background rounded border border-border">
                        {contributor.avatarUrl ? (
                          <img 
                            src={contributor.avatarUrl} 
                            alt={contributor.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary text-sm font-medium">
                              {contributor.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">
                            {contributor.githubUrl ? (
                              <a 
                                href={contributor.githubUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors"
                              >
                                {contributor.name}
                              </a>
                            ) : (
                              contributor.name
                            )}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {contributor.contributions.toLocaleString()} commits
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* GitHub Issues & Pull Requests */}
            {(project.githubIssues || project.githubPullRequests) && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <AlertCircle className="w-5 h-5" />
                  Issues & Pull Requests
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Issues Section */}
                  {project.githubIssues && (
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <h4 className="font-medium text-foreground">Issues</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div className="text-center p-2 bg-background rounded border border-border">
                          <AlertCircle className="w-3 h-3 mx-auto mb-1 text-orange-500" />
                          <div className="font-medium text-foreground">{project.githubIssues.total.toLocaleString()}</div>
                          <div className="text-muted-foreground text-xs">Total</div>
                        </div>
                        <div className="text-center p-2 bg-background rounded border border-border">
                          <XCircle className="w-3 h-3 mx-auto mb-1 text-red-500" />
                          <div className="font-medium text-foreground">{project.githubIssues.open.toLocaleString()}</div>
                          <div className="text-muted-foreground text-xs">Open</div>
                        </div>
                        <div className="text-center p-2 bg-background rounded border border-border">
                          <CheckCircle className="w-3 h-3 mx-auto mb-1 text-green-500" />
                          <div className="font-medium text-foreground">{project.githubIssues.closed.toLocaleString()}</div>
                          <div className="text-muted-foreground text-xs">Closed</div>
                        </div>
                      </div>
                      {project.githubIssues.total > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Resolution Rate: {Math.round((project.githubIssues.closed / project.githubIssues.total) * 100)}%
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pull Requests Section */}
                  {project.githubPullRequests && (
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <GitPullRequest className="w-4 h-4 text-blue-500" />
                        <h4 className="font-medium text-foreground">Pull Requests</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="text-center p-2 bg-background rounded border border-border">
                          <GitPullRequest className="w-3 h-3 mx-auto mb-1 text-blue-500" />
                          <div className="font-medium text-foreground">{project.githubPullRequests.total.toLocaleString()}</div>
                          <div className="text-muted-foreground text-xs">Total</div>
                        </div>
                        <div className="text-center p-2 bg-background rounded border border-border">
                          <XCircle className="w-3 h-3 mx-auto mb-1 text-red-500" />
                          <div className="font-medium text-foreground">{project.githubPullRequests.open.toLocaleString()}</div>
                          <div className="text-muted-foreground text-xs">Open</div>
                        </div>
                        <div className="text-center p-2 bg-background rounded border border-border">
                          <GitMerge className="w-3 h-3 mx-auto mb-1 text-green-500" />
                          <div className="font-medium text-foreground">{project.githubPullRequests.merged.toLocaleString()}</div>
                          <div className="text-muted-foreground text-xs">Merged</div>
                        </div>
                        <div className="text-center p-2 bg-background rounded border border-border">
                          <XCircle className="w-3 h-3 mx-auto mb-1 text-gray-500" />
                          <div className="font-medium text-foreground">{project.githubPullRequests.closed.toLocaleString()}</div>
                          <div className="text-muted-foreground text-xs">Closed</div>
                        </div>
                      </div>
                      {project.githubPullRequests.total > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Merge Rate: {Math.round((project.githubPullRequests.merged / project.githubPullRequests.total) * 100)}%
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No Code Structure Notice */}
            {project.github && !project.fileCount && !project.linesOfCode && !project.totalCommits && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <FileText className="w-5 h-5" />
                  Repository Type
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-foreground">Documentation Repository</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    This repository primarily contains documentation, research, or non-code content. 
                    Check the README section below for detailed information about this project.
                  </p>
                </div>
              </div>
            )}

            {/* Repository Structure & Stats */}
            {((project.fileCount ?? 0) > 0 || (project.directoryCount ?? 0) > 0 || project.repositorySize || (project.fileTree && project.fileTree.length > 0)) && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <FolderTree className="w-5 h-5" />
                  Repository Structure
                </h3>
                
                {/* Repository Stats */}
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    {(project.fileCount !== undefined && project.fileCount !== null) && (
                      <div className="text-center p-3 bg-background rounded border border-border">
                        {(() => {
                          // Get top 3 file types for display
                          const extensions: { [key: string]: number } = {}
                          project.fileTree?.forEach(item => {
                            if (item.type === 'blob') {
                              const filename = item.path.split('/').pop() || ''
                              // For dotfiles, use the full filename; for regular files, use extension
                              let ext: string
                              if (filename.startsWith('.') && filename.indexOf('.', 1) === -1) {
                                // Dotfile without extension (e.g., .coverage, .eslintrc)
                                ext = filename
                              } else if (filename.startsWith('.') && filename.indexOf('.', 1) > -1) {
                                // Dotfile with extension (e.g., .eslintrc.js, .travis.yml)
                                ext = filename
                              } else {
                                // Regular file - use extension
                                ext = filename.includes('.') ? `.${filename.split('.').pop()?.toLowerCase()}` : 'no extension'
                              }
                              extensions[ext] = (extensions[ext] || 0) + 1
                            }
                          })
                          
                          const topExtensions = Object.entries(extensions)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 3)
                          
                          if (topExtensions.length > 0) {
                            return (
                              <div className="flex justify-center gap-1 mb-1">
                                {topExtensions.map(([ext], index) => {
                                  const { icon: FileIcon, color } = getFileIcon(ext.startsWith('.') ? ext : `file${ext}`)
                                  return (
                                    <FileIcon 
                                      key={ext} 
                                      className={`w-4 h-4 ${color}`}
                                      style={{ zIndex: 3 - index }}
                                    />
                                  )
                                })}
                              </div>
                            )
                          } else {
                            return <File className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                          }
                        })()}
                        <div className="font-medium text-foreground">{project.fileCount.toLocaleString()}</div>
                        <div className="text-muted-foreground">Files</div>
                      </div>
                    )}
                    {(project.directoryCount !== undefined && project.directoryCount !== null) && (
                      <div className="text-center p-3 bg-background rounded border border-border">
                        <Folder className="w-4 h-4 mx-auto mb-1 text-orange-500" />
                        <div className="font-medium text-foreground">{project.directoryCount.toLocaleString()}</div>
                        <div className="text-muted-foreground">Folders</div>
                      </div>
                    )}
                    {project.repositorySize && (
                      <div className="text-center p-3 bg-background rounded border border-border">
                        <HardDrive className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                        <div className="font-medium text-foreground">
                          {project.repositorySize > 1024 
                            ? `${(project.repositorySize / 1024).toFixed(1)} MB`
                            : `${project.repositorySize} KB`
                          }
                        </div>
                        <div className="text-muted-foreground">Size</div>
                      </div>
                    )}
                    {(project.totalCommits !== undefined && project.totalCommits !== null) && (
                      <div className="text-center p-3 bg-background rounded border border-border">
                        <Zap className="w-4 h-4 mx-auto mb-1 text-green-500" />
                        <div className="font-medium text-foreground">{project.totalCommits.toLocaleString()}</div>
                        <div className="text-muted-foreground">Commits</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Directory Tree */}
                {project.fileTree && project.fileTree.length > 0 && (
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-foreground">Directory Tree</h4>
                      <span className="text-xs text-muted-foreground">
                        {project.fileTree.length} items
                      </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto bg-background rounded border border-border">
                      <div className="p-3 font-mono text-xs">
                        {(() => {
                          // Build directory tree structure
                          const buildTree = (items: typeof project.fileTree) => {
                            const tree: TreeNode = {}
                            
                            items?.forEach(item => {
                              const parts = item.path.split('/')
                              let current = tree
                              
                              parts.forEach((part, index) => {
                                if (!current[part]) {
                                  current[part] = {
                                    type: index === parts.length - 1 ? item.type : 'tree',
                                    size: item.size,
                                    children: {}
                                  }
                                }
                                current = current[part].children
                              })
                            })
                            
                            return tree
                          }
                          
                          const renderTree = (tree: TreeNode, depth = 0) => {
                            return Object.entries(tree).map(([name, node], index, array) => {
                              const isLastItem = index === array.length - 1
                              const indent = '  '.repeat(depth)
                              const connector = depth === 0 ? '' : (isLastItem ? '└── ' : '├── ')
                              
                              return (
                                <div key={`${depth}-${name}`}>
                                  <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                                    <span>{indent}{connector}</span>
                                    {node.type === 'tree' ? (
                                      <Folder className="w-3 h-3 text-orange-500 flex-shrink-0" />
                                    ) : (() => {
                                      const { icon: FileIcon, color } = getFileIcon(name)
                                      return <FileIcon className={`w-3 h-3 ${color} flex-shrink-0`} />
                                    })()}
                                    <span className="truncate">{name}</span>
                                    {node.size && node.type === 'blob' && (
                                      <span className="text-xs text-muted-foreground ml-auto">
                                        {node.size > 1024 ? `${(node.size / 1024).toFixed(1)}KB` : `${node.size}B`}
                                      </span>
                                    )}
                                  </div>
                                  {Object.keys(node.children).length > 0 && (
                                    <div>{renderTree(node.children, depth + 1)}</div>
                                  )}
                                </div>
                              )
                            })
                          }
                          
                          const tree = buildTree(project.fileTree)
                          return renderTree(tree)
                        })()}
                      </div>
                    </div>
                    
                    {/* File Type Breakdown */}
                    {project.fileTree && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <h5 className="font-medium text-foreground mb-2">File Types</h5>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            const extensions: { [key: string]: number } = {}
                            project.fileTree?.forEach(item => {
                              if (item.type === 'blob') {
                                const filename = item.path.split('/').pop() || ''
                                // For dotfiles, use the full filename; for regular files, use extension
                                let ext: string
                                if (filename.startsWith('.') && filename.indexOf('.', 1) === -1) {
                                  // Dotfile without extension (e.g., .coverage, .eslintrc)
                                  ext = filename
                                } else if (filename.startsWith('.') && filename.indexOf('.', 1) > -1) {
                                  // Dotfile with extension (e.g., .eslintrc.js, .travis.yml)
                                  ext = filename
                                } else {
                                  // Regular file - use extension
                                  ext = filename.includes('.') ? `.${filename.split('.').pop()?.toLowerCase()}` : 'no extension'
                                }
                                extensions[ext] = (extensions[ext] || 0) + 1
                              }
                            })
                            
                            return Object.entries(extensions)
                              .sort(([,a], [,b]) => b - a)
                              .slice(0, 8)
                              .map(([ext, count]) => {
                                const { icon: FileIcon, color } = getFileIcon(ext.startsWith('.') ? ext : `file${ext}`)
                                return (
                                  <span 
                                    key={ext}
                                    className="px-2 py-1 bg-background rounded text-xs text-muted-foreground border border-border flex items-center gap-1"
                                  >
                                    <FileIcon className={`w-3 h-3 ${color} flex-shrink-0`} />
                                    {ext.startsWith('.') ? ext : `.${ext}`}: {count}
                                  </span>
                                )
                              })
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {project.readme && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">README</h3>
                <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto prose prose-sm prose-gray dark:prose-invert max-w-none">
                  {project.readmeIsMarkdown === true ? (
                    // Render Markdown files with ReactMarkdown
                    <ReactMarkdown
                      components={{
                        a: ({ href, children, ...props }) => {
                          // Handle different types of links
                          if (href?.startsWith('#')) {
                            // Internal anchor links - smooth scroll within the README
                            return (
                              <a
                                href={href}
                                onClick={(e) => {
                                  e.preventDefault()
                                  const targetId = href.slice(1)
                                  // Try multiple selector strategies
                                  let targetElement = document.getElementById(targetId)
                                  
                                  // If not found by ID, try finding by heading text
                                  if (!targetElement) {
                                    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
                                    targetElement = headings.find(heading => {
                                      const text = heading.textContent?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
                                      return text === targetId || heading.id === targetId
                                    }) as HTMLElement
                                  }
                                  
                                  if (targetElement) {
                                    // Scroll within the README container
                                    const readmeContainer = targetElement.closest('.prose')
                                    if (readmeContainer) {
                                      const containerRect = readmeContainer.getBoundingClientRect()
                                      const elementRect = targetElement.getBoundingClientRect()
                                      const scrollTop = readmeContainer.scrollTop + (elementRect.top - containerRect.top) - 20
                                      
                                      readmeContainer.scrollTo({
                                        top: scrollTop,
                                        behavior: 'smooth'
                                      })
                                    } else {
                                      targetElement.scrollIntoView({ behavior: 'smooth' })
                                    }
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                                {...props}
                              >
                                {children}
                              </a>
                            )
                          }
                          
                          // Handle relative links - convert to GitHub URLs
                          let finalHref = href
                          if (href && !href.startsWith('http') && !href.startsWith('mailto:') && project.links?.githubUrl) {
                            const githubUrl = project.links.githubUrl
                            const repoMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
                            if (repoMatch) {
                              const [, owner, repo] = repoMatch
                              finalHref = `https://github.com/${owner}/${repo}/blob/main/${href.startsWith('./') ? href.slice(2) : href}`
                            }
                          }

                          return (
                            <a
                              href={finalHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              {...props}
                            >
                              {children}
                            </a>
                          )
                        },
                        h1: ({ children, ...props }) => <h1 id={generateHeadingId(children)} {...props}>{children}</h1>,
                        h2: ({ children, ...props }) => <h2 id={generateHeadingId(children)} {...props}>{children}</h2>,
                        h3: ({ children, ...props }) => <h3 id={generateHeadingId(children)} {...props}>{children}</h3>,
                        h4: ({ children, ...props }) => <h4 id={generateHeadingId(children)} {...props}>{children}</h4>,
                        h5: ({ children, ...props }) => <h5 id={generateHeadingId(children)} {...props}>{children}</h5>,
                        h6: ({ children, ...props }) => <h6 id={generateHeadingId(children)} {...props}>{children}</h6>,
                        img: ({ src, alt, ...props }) => {
                          // Handle relative images - convert to GitHub raw URLs
                          let finalSrc = src
                          if (src && !src.startsWith('http') && project.links?.githubUrl) {
                            const githubUrl = project.links.githubUrl
                            const repoMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
                            if (repoMatch) {
                              const [, owner, repo] = repoMatch
                              finalSrc = `https://raw.githubusercontent.com/${owner}/${repo}/main/${src.startsWith('./') ? src.slice(2) : src}`
                            }
                          }
                          
                          return (
                            <img
                              src={finalSrc}
                              alt={alt}
                              className="max-w-full h-auto rounded border border-border"
                              {...props}
                            />
                          )
                        }
                      }}
                    >
                      {project.readme}
                    </ReactMarkdown>
                  ) : project.readmeIsMarkdown === false ? (
                    // Render RST and other formats as HTML
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: project.readme
                          ?.replace(/<a class="headerlink"[^>]*>.*?<\/a>/gi, '') // Remove headerlink anchors
                          ?.replace(/¶/g, '') // Remove pilcrow symbols
                          ?.replace(/§/g, '') // Remove section symbols
                          ?.replace(/#\s*$/gm, '') // Remove trailing # symbols
                          ?.replace(/\s+<\/h([1-6])>/g, '</h$1>') // Clean up whitespace before closing heading tags
                        || ''
                      }}
                      className="readme-content [&_a]:text-blue-600 [&_a]:hover:text-blue-800 dark:[&_a]:text-blue-400 dark:[&_a]:hover:text-blue-300 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded [&_img]:border [&_img]:border-border [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:p-2 [&_td]:border [&_td]:border-border [&_td]:p-2"
                    />
                  ) : (
                    // Fallback for undefined readmeIsMarkdown - detect from content
                    project.readme && (project.readme.startsWith('<') || project.readme.includes('</')) ? (
                      // Looks like HTML, render as HTML
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: project.readme
                            ?.replace(/<a class="headerlink"[^>]*>.*?<\/a>/gi, '') // Remove headerlink anchors
                            ?.replace(/¶/g, '') // Remove pilcrow symbols
                            ?.replace(/§/g, '') // Remove section symbols
                            ?.replace(/#\s*$/gm, '') // Remove trailing # symbols
                            ?.replace(/\s+<\/h([1-6])>/g, '</h$1>') // Clean up whitespace before closing heading tags
                          || ''
                        }}
                        className="readme-content [&_a]:text-blue-600 [&_a]:hover:text-blue-800 dark:[&_a]:text-blue-400 dark:[&_a]:hover:text-blue-300 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded [&_img]:border [&_img]:border-border [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:p-2 [&_td]:border [&_td]:border-border [&_td]:p-2"
                      />
                    ) : (
                      // Assume Markdown for backward compatibility
                      <ReactMarkdown
                        components={{
                          a: ({ href, children, ...props }) => {
                            // Handle different types of links
                            if (href?.startsWith('#')) {
                              // Internal anchor links - smooth scroll within the README
                              return (
                                <a
                                  href={href}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    const targetId = href.slice(1)
                                    const targetElement = document.getElementById(targetId)
                                    if (targetElement) {
                                      targetElement.scrollIntoView({ behavior: 'smooth' })
                                    }
                                  }}
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                                  {...props}
                                >
                                  {children}
                                </a>
                              )
                            }
                            
                            // Handle relative links - convert to GitHub URLs
                            let finalHref = href
                            if (href && !href.startsWith('http') && !href.startsWith('mailto:') && project.links?.githubUrl) {
                              const githubUrl = project.links.githubUrl
                              const repoMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
                              if (repoMatch) {
                                const [, owner, repo] = repoMatch
                                finalHref = `https://github.com/${owner}/${repo}/blob/main/${href.startsWith('./') ? href.slice(2) : href}`
                              }
                            }
                            
                            return (
                              <a
                                href={finalHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                {...props}
                              >
                                {children}
                              </a>
                            )
                          },
                          h1: ({ children, ...props }) => <h1 id={generateHeadingId(children)} {...props}>{children}</h1>,
                          h2: ({ children, ...props }) => <h2 id={generateHeadingId(children)} {...props}>{children}</h2>,
                          h3: ({ children, ...props }) => <h3 id={generateHeadingId(children)} {...props}>{children}</h3>,
                          h4: ({ children, ...props }) => <h4 id={generateHeadingId(children)} {...props}>{children}</h4>,
                          h5: ({ children, ...props }) => <h5 id={generateHeadingId(children)} {...props}>{children}</h5>,
                          h6: ({ children, ...props }) => <h6 id={generateHeadingId(children)} {...props}>{children}</h6>,
                          img: ({ src, alt, ...props }) => {
                            // Handle relative images - convert to GitHub raw URLs
                            let finalSrc = src
                            if (src && !src.startsWith('http') && project.links?.githubUrl) {
                              const githubUrl = project.links.githubUrl
                              const repoMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
                              if (repoMatch) {
                                const [, owner, repo] = repoMatch
                                finalSrc = `https://raw.githubusercontent.com/${owner}/${repo}/main/${src.startsWith('./') ? src.slice(2) : src}`
                              }
                            }
                            
                            return (
                              <img
                                src={finalSrc}
                                alt={alt}
                                className="max-w-full h-auto rounded border border-border"
                                {...props}
                              />
                            )
                          }
                        }}
                      >
                        {project.readme}
                      </ReactMarkdown>
                    )
                  )}
                </div>
              </div>
            )}

            {project.architecture && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <Layers className="w-5 h-5" />
                  Architecture
                </h3>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-muted-foreground">{project.architecture}</p>
                </div>
              </div>
            )}
          </div>
        )

      case 'research':
        return (
          <div className="space-y-6">
            {project.problemSolving && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Scientific Problem Solving</h3>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-muted-foreground">{project.problemSolving}</p>
                </div>
              </div>
            )}

            {project.publication && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <Award className="w-5 h-5" />
                  Publications
                </h3>
                <div className="bg-secondary/50 border border-secondary rounded-lg p-4">
                  <div className="font-medium text-foreground mb-2">{project.publication.title}</div>
                  <div className="text-sm text-muted-foreground mb-2">{project.publication.authors}</div>
                  <div className="text-sm text-muted-foreground">{project.publication.venue} • {project.publication.year}</div>
                  {project.publication.url && (
                    <a 
                      href={project.publication.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-primary hover:text-primary/80 text-sm transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Read Publication
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )

      case 'media':
        return (
          <div className="space-y-6">
            {project.plots && project.plots.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Plots & Visualizations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.plots.map((plot, index) => (
                    <div key={index} className="bg-muted rounded-lg p-2">
                      <img 
                        src={plot.url} 
                        alt={plot.alt || plot.caption} 
                        className="w-full h-40 md:h-32 object-cover rounded border border-border" 
                      />
                      <p className="text-sm text-muted-foreground mt-2">{plot.caption}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {project.images && project.images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Project Images</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.images.map((image, index) => (
                    <div key={index} className="bg-muted rounded-lg p-2">
                      <img 
                        src={image.url} 
                        alt={image.alt || image.caption} 
                        className="w-full h-32 object-cover rounded border border-border" 
                      />
                      <p className="text-sm text-muted-foreground mt-2">{image.caption}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {project.posters && project.posters.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Conference Posters</h3>
                <div className="space-y-4">
                  {project.posters.map((poster, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 bg-card">
                      <div className="font-medium mb-2 text-foreground">{poster.title}</div>
                      <div className="text-sm text-muted-foreground">{poster.conference} • {poster.year}</div>
                      <a 
                        href={poster.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-primary hover:text-primary/80 text-sm transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Poster
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'future':
        return (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
              <Lightbulb className="w-5 h-5" />
              Future Work & Roadmap
            </h3>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-muted-foreground whitespace-pre-line">{project.futureWork}</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-[9999] p-2 md:p-4 transition-all duration-300 ease-out ${
        isVisible 
          ? 'bg-background/40 backdrop-blur-sm' 
          : 'bg-background/0 backdrop-blur-none'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-card/60 backdrop-blur-xl border border-border/30 rounded-lg max-w-7xl w-full h-[95vh] md:h-[90vh] flex flex-col md:flex-row shadow-2xl transition-all duration-300 ease-out overflow-hidden ${
          isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Header with Close Button */}
        <div className="block md:hidden px-4 py-3 border-b border-border/30 bg-muted/5 backdrop-blur-md">
          <div className="flex items-center">
            <button 
              onClick={handleCloseClick}
              className="mr-3 p-2 hover:bg-muted rounded-full transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center relative z-[10000]"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground mb-1 truncate">{project.title}</h2>
              <p className="text-sm text-muted-foreground leading-tight">
                {project.shortDescription || project.description?.substring(0, 80) + "..."}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Tabs */}
        <div className="block md:hidden border-b border-border/30 bg-muted/5">
          <nav className="px-2 py-2">
            <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setActiveTab(tab.id)
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap min-h-[44px] ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs md:text-sm">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>
        </div>

        {/* Desktop Left Sidebar with Tabs */}
        <div className="hidden md:flex w-64 bg-muted/10 backdrop-blur-md rounded-l-lg border-r border-border/30 flex-col">
          {/* Header in Sidebar */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-foreground mb-1 truncate">{project.title}</h2>
                <p className="text-sm text-muted-foreground leading-tight">
                  {project.shortDescription || project.description?.substring(0, 100) + "..."}
                </p>
              </div>
              <button 
                onClick={handleCloseClick}
                className="ml-2 p-1 hover:bg-muted rounded-full transition-colors flex-shrink-0 relative z-[10000]"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Vertical Tabs */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setActiveTab(tab.id)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Desktop Content Header */}
          <div className="hidden md:block px-8 py-6 border-b border-border/30 bg-muted/5 backdrop-blur-md">
            <h3 className="text-xl font-semibold text-foreground">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h3>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="p-4 md:p-8">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard