'use client'

import React, { useState, useEffect, useRef } from 'react'
import './terminal.css'
import type { OutputLine } from './types'
import { CommandProcessor } from './CommandProcessor'

interface TerminalInterfaceProps {
  output: OutputLine[]
  currentDirectory: string
  currentInput: string
  onInputChange: (value: string) => void
  onCommand: (command: string) => Promise<void>
  commandHistory: string[]
  commandProcessor: CommandProcessor
  onCompletionHint: (hint: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}

function useTypewriter(text: string, speed: number = 12, enabled: boolean = true) {
  const [displayed, setDisplayed] = useState(enabled ? '' : text)
  const [done, setDone] = useState(!enabled)
  const interrupted = useRef(false)

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text)
      setDone(true)
      return
    }

    setDisplayed('')
    setDone(false)
    interrupted.current = false
    let i = 0

    const tick = () => {
      if (interrupted.current || i >= text.length) {
        setDisplayed(text)
        setDone(true)
        return
      }
      i++
      setDisplayed(text.slice(0, i))
      setTimeout(tick, speed)
    }

    tick()

    return () => {
      interrupted.current = true
    }
  }, [text, speed, enabled])

  const skip = () => {
    interrupted.current = true
    setDisplayed(text)
    setDone(true)
  }

  return { displayed, done, skip }
}

const TypewriterLine: React.FC<{ text: string; onDone?: () => void }> = ({ text, onDone }) => {
  const { displayed, done } = useTypewriter(text, 8, true)

  useEffect(() => {
    if (done && onDone) onDone()
  }, [done, onDone])

  return (
    <span style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {displayed}
    </span>
  )
}

const OUTPUT_COLORS: Record<OutputLine['type'], string> = {
  command: 'text-blue-400 font-medium',
  result: 'text-green-200',
  error: 'text-red-400',
  system: 'text-yellow-400',
  'completion-hint': 'text-white/50',
  welcome: 'text-green-400',
}

export const TerminalInterface: React.FC<TerminalInterfaceProps> = ({
  output,
  currentDirectory,
  currentInput,
  onInputChange,
  onCommand,
  commandHistory,
  commandProcessor,
  onCompletionHint,
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

  // Reset history when user types directly (not via history navigation or tab completion)
  const handleUserInput = (value: string) => {
    if (historyIndex !== -1) {
      setHistoryIndex(-1)
    }
    onInputChange(value)
  }

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

    if (currentInput.trim().toLowerCase() === 'clear') {
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
    const trimmed = currentInput.trimStart()
    if (!trimmed) return

    const hasSpace = trimmed.includes(' ')

    if (!hasSpace) {
      // Complete command name
      const completions = commandProcessor.getCommandCompletions(trimmed)

      if (completions.length === 1) {
        onInputChange(completions[0] + ' ')
      } else if (completions.length > 1) {
        const prefix = CommandProcessor.commonPrefix(completions)
        if (prefix.length > trimmed.length) {
          onInputChange(prefix)
        }
        onCompletionHint(completions.join('  '))
      }
    } else {
      // Complete path argument
      const completions = commandProcessor.getPathCompletions(trimmed, currentDirectory)

      if (completions.length === 1) {
        // Replace the last part of the input with the completion
        const parts = trimmed.split(' ')
        parts[parts.length - 1] = completions[0] || ''
        onInputChange(parts.join(' '))
      } else if (completions.length > 1) {
        const prefix = CommandProcessor.commonPrefix(completions)
        const parts = trimmed.split(' ')
        const lastPart = parts[parts.length - 1] || ''

        if (prefix.length > lastPart.length) {
          parts[parts.length - 1] = prefix
          onInputChange(parts.join(' '))
        }
        onCompletionHint(completions.join('  '))
      }
    }
  }

  const getCurrentPath = (): string => {
    return currentDirectory === '/' ? '~' : currentDirectory
  }

  const renderOutputLine = (line: OutputLine, _index: number): React.ReactNode => {
    const colorClass = OUTPUT_COLORS[line.type]

    // Typewriter for the first welcome line (the ASCII banner)
    if (line.type === 'welcome' && line.animate) {
      return (
        <div key={line.id} className={`text-xs sm:text-sm mb-1 ${colorClass}`}>
          <TypewriterLine text={line.content} />
        </div>
      )
    }

    // For ls output: color directories differently
    if (line.type === 'result' && line.content.includes('/')) {
      const lines = line.content.split('\n')
      return (
        <div
          key={line.id}
          className={`text-xs sm:text-sm mb-1`}
          style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {lines.map((l, i) => {
            const isDir = l.trimEnd().endsWith('/')
            return (
              <div key={i} className={isDir ? 'text-blue-300' : 'text-green-200'}>
                {l}
              </div>
            )
          })}
        </div>
      )
    }

    return (
      <div
        key={line.id}
        className={`text-xs sm:text-sm mb-1 ${colorClass}`}
        style={{
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {line.content}
      </div>
    )
  }

  const renderOutput = (): React.ReactNode => {
    if (output.length === 0) {
      return null
    }

    return output.map((line, index) => renderOutputLine(line, index))
  }

  return (
    <div className="flex flex-col h-80 sm:h-96 md:h-[28rem] max-h-[28rem]">
      {/* Output Area */}
      <div
        ref={outputRef}
        className="terminal-output flex-1 overflow-y-auto p-3 sm:p-4 space-y-1"
        style={{ minHeight: 0 }}
      >
        {renderOutput()}
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 p-3 sm:p-4">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Prompt */}
          <div className="flex items-center gap-1 text-xs sm:text-sm font-mono whitespace-nowrap">
            <span className="text-green-400 hidden sm:inline">user@website</span>
            <span className="text-white/60 hidden sm:inline">:</span>
            <span className="text-blue-400">{getCurrentPath()}</span>
            <span className="text-white/60">$</span>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => handleUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-white text-xs sm:text-sm font-mono placeholder-white/40 caret-green-400 min-w-0"
            placeholder="Type a command..."
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        {/* Hints */}
        <div className="mt-2 text-xs text-white/30 flex flex-wrap gap-2 sm:gap-4">
          <span className="hidden sm:inline">&uarr;&darr; History</span>
          <span className="hidden sm:inline">Tab Complete</span>
          <span>Ctrl+C Clear</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  )
}
