'use client'

import React, { useState, useEffect } from 'react'
import { TimerSection } from './TimerSection'
import { TaskBoard } from './TaskBoard'
import { Analytics } from './Analytics'
import { QuickActions } from './QuickActions'
import { useTaskStore } from '@/hooks/useTaskStore'
import { Timer, BarChart3, CheckSquare } from 'lucide-react'

type ViewMode = 'timer' | 'tasks' | 'analytics'

export function TaskManager() {
  const [activeView, setActiveView] = useState<ViewMode>('timer')
  const { tasks, currentTimer, initializeStore } = useTaskStore()

  useEffect(() => {
    initializeStore()
  }, [initializeStore])

  const viewConfig = {
    timer: {
      icon: Timer,
      label: 'Timer',
      component: TimerSection
    },
    tasks: {
      icon: CheckSquare,
      label: 'Tasks',
      component: TaskBoard
    },
    analytics: {
      icon: BarChart3,
      label: 'Analytics',
      component: Analytics
    }
  }

  const ActiveComponent = viewConfig[activeView].component

  return (
    <div className="space-y-8">
      
      {/* Quick Actions */}
      <QuickActions />
      
      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="bg-card border rounded-xl p-2 inline-flex space-x-2">
          {Object.entries(viewConfig).map(([key, config]) => {
            const Icon = config.icon
            const isActive = activeView === key
            
            return (
              <button
                key={key}
                onClick={() => setActiveView(key as ViewMode)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-foreground border border-blue-500/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{config.label}</span>
                {key === 'tasks' && tasks.filter(t => t.status === 'pending').length > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                    {tasks.filter(t => t.status === 'pending').length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Timer Indicator */}
      {currentTimer && (
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-lg font-medium">
              {currentTimer.type === 'work' ? '🎯 Focus Session' : '☕ Break Time'} Active
            </span>
            <div className="text-2xl font-mono">
              {Math.floor(currentTimer.remainingTime / 60)}:{(currentTimer.remainingTime % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-card border rounded-xl p-6 min-h-[600px]">
        <ActiveComponent />
      </div>
      
    </div>
  )
}