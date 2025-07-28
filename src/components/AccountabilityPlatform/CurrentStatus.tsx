'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Coffee, BookOpen, Search, Code, PenTool } from 'lucide-react'
import type { WorkSession } from '@/hooks/useAccountabilityStore'

interface CurrentStatusProps {
  currentSession: WorkSession | null
}

export function CurrentStatus({ currentSession }: CurrentStatusProps) {
  const [timeElapsed, setTimeElapsed] = useState<number>(0)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  useEffect(() => {
    if (!currentSession || !currentSession.isActive) return

    const startTime = new Date(currentSession.startTime).getTime()
    const plannedDuration = currentSession.duration * 60 * 1000 // Convert to milliseconds

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const elapsed = Math.floor((now - startTime) / 1000) // Convert to seconds
      const remaining = Math.max(0, Math.floor((plannedDuration - (now - startTime)) / 1000))
      
      setTimeElapsed(elapsed)
      setTimeRemaining(remaining)
    }, 1000)

    return () => clearInterval(interval)
  }, [currentSession])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'work': return <Clock className="w-6 h-6" />
      case 'break': return <Coffee className="w-6 h-6" />
      case 'study': return <BookOpen className="w-6 h-6" />
      case 'research': return <Search className="w-6 h-6" />
      case 'writing': return <PenTool className="w-6 h-6" />
      case 'coding': return <Code className="w-6 h-6" />
      default: return <Clock className="w-6 h-6" />
    }
  }

  const getSessionColor = (type: string) => {
    switch (type) {
      case 'work': return 'from-blue-500/20 to-purple-500/20 border-blue-500/30'
      case 'break': return 'from-green-500/20 to-emerald-500/20 border-green-500/30'
      case 'study': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
      case 'research': return 'from-orange-500/20 to-red-500/20 border-orange-500/30'
      case 'writing': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
      case 'coding': return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30'
      default: return 'from-gray-500/20 to-slate-500/20 border-gray-500/30'
    }
  }

  const getSessionLabel = (type: string) => {
    switch (type) {
      case 'work': return '🎯 Focus Work'
      case 'break': return '☕ Break Time'
      case 'study': return '📚 Study Session'
      case 'research': return '💡 Research'
      case 'writing': return '✍️ Writing'
      case 'coding': return '🔧 Coding'
      default: return '⚡ Working'
    }
  }

  if (!currentSession || !currentSession.isActive) {
    return null
  }

  const progressPercentage = currentSession.duration > 0 
    ? Math.min(100, (timeElapsed / (currentSession.duration * 60)) * 100)
    : 0

  return (
    <div className={`bg-gradient-to-r ${getSessionColor(currentSession.type)} bg-card border rounded-xl p-6`}>
      <div className="space-y-4">
        
        {/* Current Session Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            {getSessionIcon(currentSession.type)}
            <div>
              <span className="text-lg font-medium">
                {getSessionLabel(currentSession.type)}
              </span>
              <div className="text-sm text-muted-foreground">
                Live now • Public
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-mono font-bold">
              {formatTime(timeElapsed)}
            </div>
            <div className="text-sm text-muted-foreground">
              {timeRemaining > 0 ? `${formatTime(timeRemaining)} left` : 'Over time'}
            </div>
          </div>
        </div>

        {/* Session Title */}
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">
            {currentSession.sessionTitle}
          </h3>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted/50 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            {Math.round(progressPercentage)}% complete • Started {new Date(currentSession.startTime).toLocaleTimeString()}
          </div>
        </div>

      </div>
    </div>
  )
}