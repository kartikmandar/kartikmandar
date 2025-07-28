'use client'

import { create } from 'zustand'
import { saveGoalsAPI, loadGoalsAPI, saveSessionsAPI, loadSessionsAPI } from '@/lib/api'

export interface Goal {
  id: string
  title: string
  description?: string
  status: 'active' | 'completed' | 'not_achieved' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'critical'
  category?: string
  goalType: 'deadline' | 'duration' | 'open_ended' | 'recurring'
  deadline?: Date
  duration?: {
    amount: number
    unit: 'hours' | 'days' | 'weeks' | 'months'
    startDate: Date
  }
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    target: number
  }
  completedAt?: Date
  notes?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface WorkSession {
  id: string
  sessionTitle: string
  type: 'work' | 'break' | 'study' | 'research' | 'writing' | 'coding'
  startTime: Date
  endTime?: Date
  duration: number // planned duration in minutes
  isActive: boolean
  notes?: string
  relatedGoalId?: string
}

interface AccountabilityStore {
  goals: Goal[]
  workSessions: WorkSession[]
  currentSession: WorkSession | null
  isLoading: boolean
  
  // Goal actions (now async)
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  moveGoal: (id: string, status: Goal['status']) => Promise<void>
  
  // Work session actions
  startSession: (sessionData: Omit<WorkSession, 'id' | 'startTime' | 'isActive'>) => Promise<void>
  stopSession: () => Promise<void>
  getCurrentSession: () => WorkSession | null
  
  // Getters
  getGoalsByStatus: (status: Goal['status']) => Goal[]
  getActiveGoals: () => Goal[]
  
  // Initialization & sync
  initializeStore: () => Promise<void>
  syncFromRedis: () => Promise<void>
}

export const useAccountabilityStore = create<AccountabilityStore>()((set, get) => ({
  goals: [],
  workSessions: [],
  currentSession: null,
  isLoading: false,
  
  addGoal: async (goalData) => {
    const newGoal: Goal = {
      ...goalData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const updatedGoals = [...get().goals, newGoal]
    set({ goals: updatedGoals })
    
    try {
      await saveGoalsAPI(updatedGoals)
    } catch (error) {
      console.error('Failed to save goal to Redis:', error)
      // Revert local state on failure
      set({ goals: get().goals.filter(g => g.id !== newGoal.id) })
      throw error
    }
  },
  
  updateGoal: async (id, updates) => {
    const updatedGoals = get().goals.map(goal =>
      goal.id === id
        ? { ...goal, ...updates, updatedAt: new Date() }
        : goal
    )
    
    const originalGoals = get().goals
    set({ goals: updatedGoals })
    
    try {
      await saveGoalsAPI(updatedGoals)
    } catch (error) {
      console.error('Failed to update goal in Redis:', error)
      // Revert local state on failure
      set({ goals: originalGoals })
      throw error
    }
  },
  
  deleteGoal: async (id) => {
    const originalGoals = get().goals
    const updatedGoals = originalGoals.filter(goal => goal.id !== id)
    set({ goals: updatedGoals })
    
    try {
      await saveGoalsAPI(updatedGoals)
    } catch (error) {
      console.error('Failed to delete goal from Redis:', error)
      // Revert local state on failure
      set({ goals: originalGoals })
      throw error
    }
  },
  
  moveGoal: async (id, status) => {
    const updates: Partial<Goal> = { status }
    if (status === 'completed') {
      updates.completedAt = new Date()
    }
    await get().updateGoal(id, updates)
  },
  
  startSession: async (sessionData) => {
    // Stop any existing session first
    await get().stopSession()
    
    const newSession: WorkSession = {
      ...sessionData,
      id: crypto.randomUUID(),
      startTime: new Date(),
      isActive: true
    }
    
    const updatedSessions = [...get().workSessions, newSession]
    set({ 
      workSessions: updatedSessions,
      currentSession: newSession
    })
    
    try {
      await saveSessionsAPI(updatedSessions)
    } catch (error) {
      console.error('Failed to save session to Redis:', error)
      // Don't revert - session is only in memory anyway
    }
  },
  
  stopSession: async () => {
    const currentSession = get().currentSession
    if (!currentSession) return
    
    const endTime = new Date()
    const updatedSession: WorkSession = {
      ...currentSession,
      endTime,
      isActive: false
    }
    
    const updatedSessions = get().workSessions.map(session =>
      session.id === currentSession.id ? updatedSession : session
    )
    
    set({
      workSessions: updatedSessions,
      currentSession: null
    })
    
    try {
      await saveSessionsAPI(updatedSessions)
    } catch (error) {
      console.error('Failed to save sessions to Redis:', error)
    }
  },
  
  getCurrentSession: () => {
    return get().currentSession
  },
  
  getGoalsByStatus: (status) => {
    return get().goals.filter(goal => goal.status === status)
  },
  
  getActiveGoals: () => {
    return get().goals.filter(goal => goal.status === 'active')
  },
  
  initializeStore: async () => {
    set({ isLoading: true })
    
    try {
      const [goals, sessions] = await Promise.all([
        loadGoalsAPI(),
        loadSessionsAPI()
      ])
      
      set({ 
        goals,
        workSessions: sessions,
        currentSession: null, // Reset any active sessions on app start
        isLoading: false
      })
    } catch (error) {
      console.error('Failed to initialize store from Redis:', error)
      // Fallback to empty state
      set({ 
        goals: [], 
        workSessions: [], 
        currentSession: null,
        isLoading: false
      })
    }
  },
  
  syncFromRedis: async () => {
    try {
      const goals = await loadGoalsAPI()
      set({ goals })
    } catch (error) {
      console.error('Failed to sync from Redis:', error)
    }
  }
}))