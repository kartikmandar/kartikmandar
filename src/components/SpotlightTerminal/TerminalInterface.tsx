'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronRight } from 'lucide-react'

interface TerminalInterfaceProps {
  output: string[]
  currentDirectory: string
  currentInput: string
  onInputChange: (value: string) => void
  onCommand: (command: string) => Promise<void>
  commandHistory: string[]
  inputRef: React.RefObject<HTMLInputElement | null>
}

export const TerminalInterface: React.FC<TerminalInterfaceProps> = ({
  output,
  currentDirectory,
  currentInput,
  onInputChange,
  onCommand,
  commandHistory,
  inputRef
}) => {
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const [tempInput, setTempInput] = useState<string>('')
  const outputRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  // Reset history index when input changes externally
  useEffect(() => {
    if (historyIndex !== -1 && currentInput !== commandHistory[commandHistory.length - 1 - historyIndex]) {
      setHistoryIndex(-1)
    }
  }, [currentInput, commandHistory, historyIndex])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    switch (e.key) {
      case 'Enter':
        handleSubmit()
        break
        
      case 'ArrowUp':
        e.preventDefault()
        navigateHistory('up')
        break
        
      case 'ArrowDown':
        e.preventDefault()
        navigateHistory('down')
        break
        
      case 'Tab':
        e.preventDefault()
        handleTabCompletion()
        break
        
      case 'c':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          onInputChange('')
          setHistoryIndex(-1)
        }
        break
    }
  }

  const handleSubmit = async (): Promise<void> => {
    if (!currentInput.trim()) return
    
    // Handle clear command specially
    if (currentInput.trim().toLowerCase() === 'clear') {
      // Clear output by sending special command
      await onCommand('clear')
      return
    }
    
    await onCommand(currentInput)
    setHistoryIndex(-1)
    setTempInput('')
  }

  const navigateHistory = (direction: 'up' | 'down'): void => {
    if (commandHistory.length === 0) return

    if (direction === 'up') {
      if (historyIndex === -1) {
        // First time navigating up, save current input
        setTempInput(currentInput)
        setHistoryIndex(0)
        const lastCommand = commandHistory[commandHistory.length - 1]
        if (lastCommand) {
          onInputChange(lastCommand)
        }
      } else if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        const command = commandHistory[commandHistory.length - 1 - newIndex]
        if (command) {
          onInputChange(command)
        }
      }
    } else {
      // direction === 'down'
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        const command = commandHistory[commandHistory.length - 1 - newIndex]
        if (command) {
          onInputChange(command)
        }
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        onInputChange(tempInput)
      }
    }
  }

  const handleTabCompletion = (): void => {
    // Simple tab completion - could be enhanced
    const commonCommands = ['ls', 'cd', 'pwd', 'tree', 'help', 'clear', 'whoami']
    const matchingCommands = commonCommands.filter(cmd => 
      cmd.startsWith(currentInput.toLowerCase())
    )
    
    if (matchingCommands.length === 1) {
      onInputChange(matchingCommands[0] + ' ')
    } else if (matchingCommands.length > 1) {
      // Show available completions
      console.log('Available completions:', matchingCommands)
    }
  }

  const getCurrentPath = (): string => {
    return currentDirectory === '/' ? '~' : currentDirectory
  }

  const renderOutput = (): React.ReactNode => {
    if (output.length === 0) {
      return (
        <div className="text-green-400 text-sm mb-4">
          Welcome to Website Terminal! Type 'help' to see available commands.
        </div>
      )
    }

    return output.map((line, index) => {
      // Handle clear command
      if (line === '[[CLEAR]]') {
        return null
      }

      const isCommand = line.includes(' $ ')
      const isError = !isCommand && (line.includes('Error') || line.includes('not found') || line.includes('cannot access'))
      
      return (
        <div
          key={index}
          className={`text-sm mb-1 ${
            isCommand 
              ? 'text-blue-400 font-medium' 
              : isError 
              ? 'text-red-400' 
              : 'text-green-200'
          }`}
          style={{ 
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {line}
        </div>
      )
    }).filter(Boolean)
  }

  return (
    <div className="flex flex-col h-64 sm:h-80 max-h-80">
      {/* Output Area */}
      <div 
        ref={outputRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        style={{ minHeight: 0 }}
      >
        {renderOutput()}
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 p-3 sm:p-4">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Prompt */}
          <div className="flex items-center gap-1 text-blue-400 text-xs sm:text-sm font-medium">
            <span className="text-green-400 hidden sm:inline">user@website</span>
            <span className="text-white/60 hidden sm:inline">:</span>
            <span className="text-blue-400">{getCurrentPath()}</span>
            <ChevronRight size={12} className="sm:size-4 text-white/60" />
          </div>
          
          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-white text-xs sm:text-sm font-mono placeholder-white/40"
            placeholder="Type a command..."
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        
        {/* Hints */}
        <div className="mt-2 text-xs text-white/30 flex flex-wrap gap-2 sm:gap-4">
          <span className="hidden sm:inline">↑↓ History</span>
          <span className="hidden sm:inline">Tab Completion</span>
          <span>Ctrl+C Clear</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  )
}

// Add custom scrollbar styles
if (typeof window !== 'undefined') {
  const style = document.createElement('style')
  style.innerHTML = `
    .scrollbar-thin {
      scrollbar-width: thin;
    }
    
    .scrollbar-thumb-white\\/20::-webkit-scrollbar {
      width: 4px;
    }
    
    .scrollbar-thumb-white\\/20::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .scrollbar-thumb-white\\/20::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }
    
    .scrollbar-thumb-white\\/20::-webkit-scrollbar-thumb:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
  `
  
  if (!document.head.querySelector('style[data-terminal-scrollbar]')) {
    style.setAttribute('data-terminal-scrollbar', 'true')
    document.head.appendChild(style)
  }
}