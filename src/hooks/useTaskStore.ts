'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'archived' | 'not_achieved'
  priority: 'low' | 'medium' | 'high'
  category?: string
  estimatedDuration: number // in minutes
  actualDuration?: number
  timerSessions: TimerSession[]
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
}

export interface TimerSession {
  id: string
  taskId?: string
  duration: number // in minutes
  type: 'work' | 'break'
  startTime: Date
  endTime?: Date
  completed: boolean
}

export interface ActiveTimer {
  sessionId: string
  taskId?: string
  type: 'work' | 'break'
  duration: number
  remainingTime: number
  startTime: Date
  isRunning: boolean
}

interface TaskStore {
  tasks: Task[]
  timerSessions: TimerSession[]
  currentTimer: ActiveTimer | null
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timerSessions'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  moveTask: (id: string, status: Task['status']) => void
  
  // Timer actions
  startTimer: (duration: number, type: 'work' | 'break', taskId?: string) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  completeTimer: () => void
  
  // Analytics
  getTasksByStatus: (status: Task['status']) => Task[]
  getTotalTimeSpent: (period?: 'today' | 'week' | 'month') => number
  getCompletedTasksCount: (period?: 'today' | 'week' | 'month') => number
  
  // Initialization
  initializeStore: () => void
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      timerSessions: [],
      currentTimer: null,
      
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          timerSessions: []
        }
        
        set((state) => ({
          tasks: [...state.tasks, newTask]
        }))
      },
      
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map(task =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          )
        }))
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter(task => task.id !== id)
        }))
      },
      
      moveTask: (id, status) => {
        get().updateTask(id, { status })
      },
      
      startTimer: (duration, type, taskId) => {
        const sessionId = crypto.randomUUID()
        const newTimer: ActiveTimer = {
          sessionId,
          taskId,
          type,
          duration,
          remainingTime: duration * 60, // convert to seconds
          startTime: new Date(),
          isRunning: true
        }
        
        // Update task status if associated with a task
        if (taskId && type === 'work') {
          get().updateTask(taskId, { status: 'in_progress' })
        }
        
        set({ currentTimer: newTimer })
      },
      
      pauseTimer: () => {
        set((state) => ({
          currentTimer: state.currentTimer
            ? { ...state.currentTimer, isRunning: false }
            : null
        }))
      },
      
      resumeTimer: () => {
        set((state) => ({
          currentTimer: state.currentTimer
            ? { ...state.currentTimer, isRunning: true }
            : null
        }))
      },
      
      stopTimer: () => {
        set({ currentTimer: null })
      },
      
      completeTimer: () => {
        const timer = get().currentTimer
        if (!timer) return
        
        const session: TimerSession = {
          id: timer.sessionId,
          taskId: timer.taskId,
          duration: timer.duration,
          type: timer.type,
          startTime: timer.startTime,
          endTime: new Date(),
          completed: true
        }
        
        // Add session to history
        set((state) => ({
          timerSessions: [...state.timerSessions, session],
          currentTimer: null
        }))
        
        // Update task with session and actual duration
        if (timer.taskId && timer.type === 'work') {
          const task = get().tasks.find(t => t.id === timer.taskId)
          if (task) {
            const updatedSessions = [...task.timerSessions, session]
            const totalActualDuration = updatedSessions
              .filter(s => s.type === 'work' && s.completed)
              .reduce((sum, s) => sum + s.duration, 0)
            
            get().updateTask(timer.taskId, {
              timerSessions: updatedSessions,
              actualDuration: totalActualDuration
            })
          }
        }
      },
      
      getTasksByStatus: (status) => {
        return get().tasks.filter(task => task.status === status)
      },
      
      getTotalTimeSpent: (period = 'today') => {
        const sessions = get().timerSessions
        const now = new Date()
        let startDate: Date
        
        switch (period) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          default:
            startDate = new Date(0)
        }
        
        return sessions
          .filter(session => 
            session.completed && 
            session.type === 'work' &&
            new Date(session.startTime) >= startDate
          )
          .reduce((total, session) => total + session.duration, 0)
      },
      
      getCompletedTasksCount: (period = 'today') => {
        const tasks = get().tasks
        const now = new Date()
        let startDate: Date
        
        switch (period) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          default:
            startDate = new Date(0)
        }
        
        return tasks.filter(task => 
          task.status === 'completed' &&
          new Date(task.updatedAt) >= startDate
        ).length
      },
      
      initializeStore: () => {
        // This will be called on app start to ensure store is ready
        // Any initialization logic can go here
      }
    }),
    {
      name: 'task-timer-store',
      partialize: (state) => ({
        tasks: state.tasks,
        timerSessions: state.timerSessions
      })
    }
  )
)