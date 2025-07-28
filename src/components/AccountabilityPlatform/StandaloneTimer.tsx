'use client'

import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, RotateCcw } from 'lucide-react'

interface StandaloneTimerProps {
  goals?: unknown[]
  currentSession?: unknown
}

export function StandaloneTimer({ goals: _goals, currentSession: _currentSession }: StandaloneTimerProps) {
  const [duration, setDuration] = useState<number>(25) // minutes
  const [timeRemaining, setTimeRemaining] = useState<number>(0) // seconds
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [isBreak, setIsBreak] = useState<boolean>(false)

  // Timer countdown effect
  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          // Timer completed - could add notification here
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, timeRemaining])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = (minutes: number, breakMode: boolean = false) => {
    setDuration(minutes)
    setTimeRemaining(minutes * 60)
    setIsRunning(true)
    setIsBreak(breakMode)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resumeTimer = () => {
    setIsRunning(true)
  }

  const stopTimer = () => {
    setIsRunning(false)
    setTimeRemaining(0)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeRemaining(duration * 60)
  }

  const progressPercentage = duration > 0 
    ? ((duration * 60 - timeRemaining) / (duration * 60)) * 100
    : 0

  const quickTimers = [
    { duration: 25, label: 'Pomodoro', color: 'from-blue-500 to-purple-500' },
    { duration: 15, label: 'Quick Focus', color: 'from-green-500 to-emerald-500' },
    { duration: 45, label: 'Deep Work', color: 'from-purple-500 to-pink-500' },
    { duration: 60, label: 'Hour Block', color: 'from-orange-500 to-red-500' },
    { duration: 5, label: 'Break', color: 'from-cyan-500 to-blue-500', isBreak: true },
    { duration: 10, label: 'Long Break', color: 'from-teal-500 to-green-500', isBreak: true }
  ]

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Standalone Timer</h2>
        <p className="text-muted-foreground">
          Personal focus timer - no tracking, just pure productivity
        </p>
      </div>

      {/* Timer Display */}
      <div className="text-center space-y-6">
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto">
          {/* Progress Circle */}
          <svg className="w-48 h-48 sm:w-64 sm:h-64 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              className="text-muted-foreground/20"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
              className={`transition-all duration-1000 ${
                isBreak 
                  ? 'text-green-500' 
                  : 'text-blue-500'
              }`}
            />
          </svg>
          
          {/* Timer Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl sm:text-4xl font-mono font-bold mb-2">
              {timeRemaining > 0 ? formatTime(timeRemaining) : `${duration}:00`}
            </div>
            <div className="text-sm text-muted-foreground">
              {timeRemaining > 0 
                ? (isBreak ? 'Break Time' : 'Focus Session')
                : 'Ready to Start'
              }
            </div>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {timeRemaining === 0 ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Choose a timer duration:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickTimers.map((timer) => (
                  <button
                    key={timer.label}
                    onClick={() => startTimer(timer.duration, timer.isBreak)}
                    className={`bg-gradient-to-r ${timer.color} text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg hover:scale-105 transition-all duration-200 shadow-lg text-xs sm:text-sm font-medium`}
                  >
                    <div>{timer.label}</div>
                    <div className="text-xs opacity-90">{timer.duration}min</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={isRunning ? pauseTimer : resumeTimer}
                className="flex items-center space-x-2 bg-card border text-foreground px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-muted/50 transition-all duration-200"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Resume</span>
                  </>
                )}
              </button>
              
              <button
                onClick={stopTimer}
                className="flex items-center space-x-2 bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-red-500/20 transition-all duration-200"
              >
                <Square className="w-5 h-5" />
                <span>Stop</span>
              </button>
              
              <button
                onClick={resetTimer}
                className="flex items-center space-x-2 bg-card border text-foreground px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-muted/50 transition-all duration-200"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Custom Duration */}
      {timeRemaining === 0 && (
        <div className="bg-muted/30 border rounded-xl p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-center">Custom Duration</h3>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              min="1"
              max="240"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="flex-1 px-3 py-2 bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Minutes"
            />
            <button
              onClick={() => startTimer(duration, false)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
            >
              Start
            </button>
          </div>
        </div>
      )}


    </div>
  )
}