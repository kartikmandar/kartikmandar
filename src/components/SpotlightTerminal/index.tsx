'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { TerminalInterface } from './TerminalInterface'
import { CommandProcessor } from './CommandProcessor'
import { FileSystemMapper } from './FileSystemMapper'

interface SpotlightTerminalProps {
  navItems: Array<{ link: { label: string; url: string } }>
}

export const SpotlightTerminal: React.FC<SpotlightTerminalProps> = ({ navItems }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [currentDirectory, setCurrentDirectory] = useState<string>('/')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [output, setOutput] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState<string>('')
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const [isInteracting, setIsInteracting] = useState<boolean>(false)
  
  const router = useRouter()
  const pathname = usePathname()
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Initialize file system mapper and command processor with useMemo to prevent recreation
  const fileSystemMapper = React.useMemo(() => new FileSystemMapper(navItems), [navItems])
  const commandProcessor = React.useMemo(() => new CommandProcessor(fileSystemMapper, router, pathname), [fileSystemMapper, router, pathname])

  // Update current directory based on pathname
  useEffect(() => {
    const mappedPath = fileSystemMapper.urlToPath(pathname)
    setCurrentDirectory(mappedPath)
  }, [pathname, fileSystemMapper])

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  // Handle click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (terminalRef.current && !terminalRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

  // Handle auto-hide based on scroll and interactions
  useEffect(() => {
    const startHideTimer = () => {
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      // Hide after 2 seconds of no scrolling (unless expanded or interacting)
      scrollTimeoutRef.current = setTimeout(() => {
        if (!isExpanded && !isInteracting) {
          setIsVisible(false)
        }
      }, 2000)
    }

    const handleScroll = () => {
      // Show immediately on scroll
      setIsVisible(true)
      startHideTimer()
    }

    // Start timer when interaction ends
    if (!isInteracting && !isExpanded) {
      startHideTimer()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [isExpanded, isInteracting])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K to open spotlight
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsExpanded(true)
        setIsVisible(true) // Always show when opened via keyboard
      }
      
      // Escape to close
      if (event.key === 'Escape' && isExpanded) {
        setIsExpanded(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded])

  const handleExpand = (): void => {
    setIsExpanded(true)
  }

  const handleCommand = async (command: string): Promise<void> => {
    if (!command.trim()) return

    // Add to history
    setCommandHistory(prev => [...prev, command])
    
    // Process command
    const result = await commandProcessor.processCommand(command, currentDirectory)
    
    // Handle clear command specially
    if (result.output === '[[CLEAR]]') {
      setOutput([])
    } else {
      // Add command and result to output
      setOutput(prev => [...prev, `${currentDirectory} $ ${command}`, result.output])
    }
    
    // Update current directory if it changed
    if (result.newDirectory) {
      setCurrentDirectory(result.newDirectory)
    }
    
    // Navigate if command resulted in navigation
    if (result.navigate) {
      // Small delay to show command execution, then reopen terminal
      setTimeout(() => {
        setIsExpanded(false)
        // Reopen terminal after navigation completes
        setTimeout(() => {
          setIsExpanded(true)
        }, 500)
      }, 300)
    }
    
    // Clear input
    setCurrentInput('')
  }

  const getCurrentPath = (): string => {
    return currentDirectory === '/' ? '~' : currentDirectory
  }

  return (
    <>
      {/* Collapsed State - Dynamic Island */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ 
              opacity: isVisible ? 1 : 0, 
              scale: isVisible ? 1 : 0.8, 
              y: isVisible ? 0 : -20 
            }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-4 left-0 right-0 mx-auto w-fit z-50"
          >
            <motion.button
              onClick={handleExpand}
              onMouseEnter={() => setIsInteracting(true)}
              onMouseLeave={() => setIsInteracting(false)}
              className="group flex items-center gap-3 px-6 sm:px-8 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white/80 hover:text-white transition-all duration-300 hover:bg-black/30 hover:border-white/20 min-w-[200px] sm:min-w-[280px] h-12"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Terminal size={16} className="text-white/60 group-hover:text-white/80 flex-shrink-0" />
              <div className="flex-1 flex items-center justify-center">
                <span className="text-sm font-medium text-center">
                  {getCurrentPath()}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1 text-xs text-white/40 flex-shrink-0">
                <span>⌘K</span>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded State - Terminal Interface */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            ref={terminalRef}
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-4 left-0 right-0 mx-auto w-[95vw] sm:w-[90vw] max-w-2xl z-[9998]"
          >
            <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors"
                    aria-label="Close terminal"
                  />
                  <Terminal size={16} className="text-green-400" />
                  <span className="text-sm font-medium text-white/80">Terminal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-white/40 font-mono">
                    {getCurrentPath()}
                  </div>
                </div>
              </div>

              {/* Terminal Interface */}
              <TerminalInterface
                output={output}
                currentDirectory={currentDirectory}
                currentInput={currentInput}
                onInputChange={setCurrentInput}
                onCommand={handleCommand}
                commandHistory={commandHistory}
                inputRef={inputRef}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9997]"
          />
        )}
      </AnimatePresence>
    </>
  )
}