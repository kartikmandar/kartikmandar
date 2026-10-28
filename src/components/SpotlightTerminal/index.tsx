'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { TerminalInterface } from './TerminalInterface'
import { CommandProcessor } from './CommandProcessor'
import { FileSystemMapper, type StaticContent } from './FileSystemMapper'
import { WELCOME_LINES } from './asciiArt'
import type { OutputLine } from './types'
import { useChromeStore } from '@/components/SiteChrome/chromeStore'
import { lockScroll } from '@/lib/scrollLock'

interface SpotlightTerminalProps {
  navItems: Array<{ link: { label: string; url: string } }>
  content: StaticContent
}

let lineIdCounter = 0
function createOutputLine(
  type: OutputLine['type'],
  content: string,
  animate?: boolean
): OutputLine {
  return {
    id: `line-${++lineIdCounter}`,
    type,
    content,
    timestamp: Date.now(),
    animate,
  }
}

export const SpotlightTerminal: React.FC<SpotlightTerminalProps> = ({ navItems, content }) => {
  // Cmd-K: the terminal opens over the page from the top bar's search button or
  // the shortcut. Its open state lives in the chrome store, so it and the menu
  // never stack.
  const isExpanded = useChromeStore((state) => state.overlay === 'command')
  const openOverlay = useChromeStore((state) => state.open)
  const closeOverlay = useChromeStore((state) => state.close)
  const setIsExpanded = useCallback((next: boolean | ((prev: boolean) => boolean)) => {
    const current = useChromeStore.getState().overlay === 'command'
    const value = typeof next === 'function' ? next(current) : next
    if (value) openOverlay('command')
    else if (current) closeOverlay()
  }, [openOverlay, closeOverlay])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [output, setOutput] = useState<OutputLine[]>(() =>
    WELCOME_LINES.map((line, i) => createOutputLine('welcome', line, i === 0))
  )
  const [currentInput, setCurrentInput] = useState<string>('')

  const router = useRouter()
  const pathname = usePathname()
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  // Initialize file system mapper and command processor with useMemo to prevent recreation
  const fileSystemMapper = React.useMemo(() => new FileSystemMapper(navItems, content), [navItems, content])
  const commandProcessor = React.useMemo(() => new CommandProcessor(fileSystemMapper, router, pathname), [fileSystemMapper, router, pathname])

  // Derive current directory from pathname
  const currentDirectory = React.useMemo(() => fileSystemMapper.urlToPath(pathname), [pathname, fileSystemMapper])

  // Focus input when expanded; hold the page still and hand focus back on close
  useEffect(() => {
    if (!isExpanded) return
    restoreFocusRef.current = document.activeElement as HTMLElement | null
    inputRef.current?.focus()
    const unlock = lockScroll()
    return () => {
      unlock()
      restoreFocusRef.current?.focus?.({ preventScroll: true })
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
  }, [isExpanded, setIsExpanded])

  // Escape closes (Cmd-K itself is handled by LazyCommand, which loads this on first use)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isExpanded) {
        setIsExpanded(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded, setIsExpanded])

  const handleCommand = async (command: string): Promise<void> => {
    if (!command.trim()) return

    setCommandHistory(prev => [...prev, command])

    const result = await commandProcessor.processCommand(command, currentDirectory)

    if (result.output === '[[CLEAR]]') {
      setOutput([])
    } else {
      const commandLine = createOutputLine('command', `${currentDirectory} $ ${command}`)
      const resultLine = createOutputLine(
        result.error ? 'error' : 'result',
        result.output
      )
      setOutput(prev => [...prev, commandLine, resultLine])
    }

    if (result.navigate) {
      setTimeout(() => {
        setIsExpanded(false)
        setTimeout(() => {
          setIsExpanded(true)
        }, 500)
      }, 300)
    }

    setCurrentInput('')
  }

  const addCompletionHint = (hint: string) => {
    setOutput(prev => [...prev, createOutputLine('completion-hint', hint)])
  }

  const getCurrentPath = (): string => {
    return currentDirectory === '/' ? '~' : currentDirectory
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background-deep/50 backdrop-blur-sm z-[var(--z-command)]"
          />
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
            role="dialog"
            aria-modal="true"
            aria-label="Terminal: search and navigate the site"
            data-lenis-prevent
            className="fixed top-4 left-0 right-0 mx-auto w-[95vw] sm:w-[90vw] max-w-4xl z-[var(--z-command)]"
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
                commandProcessor={commandProcessor}
                onCompletionHint={addCompletionHint}
                inputRef={inputRef}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  )
}
