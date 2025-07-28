'use client'

import React, { useState, useEffect } from 'react'
import { useTaskStore } from '@/hooks/useTaskStore'
import { Play, Pause, Square, RotateCcw, Settings } from 'lucide-react'

export function TimerSection() {
  const { 
    currentTimer, 
    tasks, 
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    stopTimer, 
    completeTimer 
  } = useTaskStore()
  
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [workDuration, setWorkDuration] = useState<number>(25)
  const [breakDuration, setBreakDuration] = useState<number>(5)
  const [showSettings, setShowSettings] = useState<boolean>(false)

  // Timer countdown effect
  useEffect(() => {
    if (!currentTimer || !currentTimer.isRunning) return

    const interval = setInterval(() => {
      useTaskStore.setState((state) => {
        if (!state.currentTimer) return state
        
        const newRemainingTime = state.currentTimer.remainingTime - 1
        
        if (newRemainingTime <= 0) {
          // Timer completed
          completeTimer()
          return state
        }
        
        return {
          ...state,
          currentTimer: {
            ...state.currentTimer,
            remainingTime: newRemainingTime
          }
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentTimer, completeTimer])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartTimer = (type: 'work' | 'break') => {
    const duration = type === 'work' ? workDuration : breakDuration
    const taskId = type === 'work' && selectedTaskId ? selectedTaskId : undefined
    startTimer(duration, type, taskId)
  }

  const progressPercentage = currentTimer 
    ? ((currentTimer.duration * 60 - currentTimer.remainingTime) / (currentTimer.duration * 60)) * 100
    : 0

  const pendingTasks = tasks.filter(task => task.status === 'pending')

  return (
    <div className="space-y-8">
      
      {/* Timer Display */}
      <div className="text-center space-y-6">
        <div className="relative w-64 h-64 mx-auto">
          {/* Progress Circle */}
          <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
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
                currentTimer?.type === 'work' 
                  ? 'text-blue-500' 
                  : 'text-green-500'
              }`}
            />
          </svg>
          
          {/* Timer Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-mono font-bold mb-2">
              {currentTimer ? formatTime(currentTimer.remainingTime) : `${workDuration}:00`}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentTimer 
                ? `${currentTimer.type === 'work' ? 'Focus' : 'Break'} Session`
                : 'Ready to Start'
              }
            </div>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center space-x-4">
          {!currentTimer ? (
            <>
              <button
                onClick={() => handleStartTimer('work')}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
              >
                <Play className="w-5 h-5" />
                <span>Start Focus</span>
              </button>
              <button
                onClick={() => handleStartTimer('break')}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
              >
                <Play className="w-5 h-5" />
                <span>Start Break</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={currentTimer.isRunning ? pauseTimer : resumeTimer}
                className="flex items-center space-x-2 bg-card border text-foreground px-6 py-3 rounded-lg hover:bg-muted/50 transition-all duration-200"
              >
                {currentTimer.isRunning ? (
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
                className="flex items-center space-x-2 bg-red-500/10 border border-red-500/30 text-red-600 px-6 py-3 rounded-lg hover:bg-red-500/20 transition-all duration-200"
              >
                <Square className="w-5 h-5" />
                <span>Stop</span>
              </button>
              <button
                onClick={completeTimer}
                className="flex items-center space-x-2 bg-green-500/10 border border-green-500/30 text-green-600 px-6 py-3 rounded-lg hover:bg-green-500/20 transition-all duration-200"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Complete</span>
              </button>
            </>
          )}
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2 bg-card border text-foreground px-4 py-3 rounded-lg hover:bg-muted/50 transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-muted/30 border rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold mb-4">Timer Settings</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Work Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={workDuration}
                onChange={(e) => setWorkDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Break Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Task Selection */}
      {pendingTasks.length > 0 && (
        <div className="bg-muted/30 border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Link Timer to Task</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Select a task (optional)
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2 bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">No task selected</option>
              {pendingTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title} ({task.estimatedDuration}min)
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

    </div>
  )
}