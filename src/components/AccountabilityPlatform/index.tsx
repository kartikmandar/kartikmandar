'use client'

import React, { useState, useEffect } from 'react'
import { GoalsBoard } from './GoalsBoard'
import { StandaloneTimer } from './StandaloneTimer'
import { CurrentStatus } from './CurrentStatus'
import { FocusmateSection } from './FocusmateSection'
import { BeeminderSection } from './BeeminderSection'
import { Target, Timer, User, TrendingUp } from 'lucide-react'
import { useAccountabilityStore } from '@/hooks/useAccountabilityStore'
import { useRedisSync } from '@/hooks/useRedisSync'

type ViewMode = 'goals' | 'timer' | 'focusmate' | 'beeminder'

export function AccountabilityPlatform() {
  const { initializeStore, goals, currentSession, isLoading } = useAccountabilityStore()
  const [activeView, setActiveView] = useState<ViewMode>('goals') // Default to goals
  
  // Enable auto-sync with Redis
  useRedisSync()

  useEffect(() => {
    initializeStore()
  }, [initializeStore])

  const viewConfig = {
    goals: {
      icon: Target,
      label: 'Goals',
      component: GoalsBoard
    },
    timer: {
      icon: Timer,
      label: 'Timer',
      component: StandaloneTimer
    },
    focusmate: {
      icon: User,
      label: 'Focusmate',
      component: FocusmateSection
    },
    beeminder: {
      icon: TrendingUp,
      label: 'Beeminder',
      component: BeeminderSection
    }
  }

  const ActiveComponent = viewConfig[activeView].component

  return (
    <div className="space-y-8">
      
      {/* Current Status - Always visible */}
      <CurrentStatus currentSession={currentSession} />
      
      {/* Navigation Tabs */}
      <div className="flex justify-center px-4">
        <div className="bg-card border rounded-xl p-1 sm:p-2 w-full max-w-2xl">
          <div className="grid grid-cols-4 gap-1 sm:flex sm:space-x-2">
            {Object.entries(viewConfig).map(([key, config]) => {
              const Icon = config.icon
              const isActive = activeView === key
              
              return (
                <button
                  key={key}
                  onClick={() => setActiveView(key as ViewMode)}
                  className={`flex flex-col sm:flex-row items-center justify-center sm:space-x-2 px-2 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-foreground border border-blue-500/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-xs sm:text-sm leading-tight sm:leading-normal">{config.label}</span>
                  {key === 'goals' && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center mt-0.5 sm:mt-0">
                      {goals.filter(g => g.status === 'active').length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card border rounded-xl p-6 min-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading from Redis...</p>
            </div>
          </div>
        ) : (
          <ActiveComponent />
        )}
      </div>
      
    </div>
  )
}