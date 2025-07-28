'use client'

import React from 'react'
import { useTaskStore } from '@/hooks/useTaskStore'
import { Timer, Coffee, Zap, Clock } from 'lucide-react'

export function QuickActions() {
  const { startTimer, currentTimer } = useTaskStore()

  const quickTimers = [
    { duration: 25, label: 'Pomodoro', icon: Timer, color: 'from-blue-500 to-purple-500' },
    { duration: 15, label: 'Quick Focus', icon: Zap, color: 'from-green-500 to-emerald-500' },
    { duration: 45, label: 'Deep Work', icon: Clock, color: 'from-purple-500 to-pink-500' },
    { duration: 5, label: 'Break', icon: Coffee, color: 'from-orange-500 to-red-500', type: 'break' as const }
  ]

  if (currentTimer) {
    return null // Hide quick actions when timer is running
  }

  return (
    <div className="bg-muted/30 border rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickTimers.map((timer) => {
          const Icon = timer.icon
          const type = timer.type || 'work'
          
          return (
            <button
              key={timer.label}
              onClick={() => startTimer(timer.duration, type)}
              className={`bg-gradient-to-r ${timer.color} text-white p-4 rounded-lg hover:scale-105 transition-all duration-200 shadow-lg`}
            >
              <div className="flex flex-col items-center space-y-2">
                <Icon className="w-6 h-6" />
                <span className="font-medium">{timer.label}</span>
                <span className="text-sm opacity-90">{timer.duration}min</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}