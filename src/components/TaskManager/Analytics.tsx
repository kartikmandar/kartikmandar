'use client'

import React, { useState, useMemo } from 'react'
import { useTaskStore } from '@/hooks/useTaskStore'
import { Clock, CheckCircle, TrendingUp, Calendar, Target, BarChart3 } from 'lucide-react'

type TimePeriod = 'today' | 'week' | 'month'

export function Analytics() {
  const { 
    tasks, 
    timerSessions, 
    getTotalTimeSpent, 
    getCompletedTasksCount 
  } = useTaskStore()
  
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('today')

  const periodLabels = {
    today: 'Today',
    week: 'This Week', 
    month: 'This Month'
  }

  // Calculate analytics data
  const analytics = useMemo(() => {
    const totalTimeSpent = getTotalTimeSpent(selectedPeriod)
    const completedTasks = getCompletedTasksCount(selectedPeriod)
    
    // Get date range for filtering
    const now = new Date()
    let startDate: Date
    
    switch (selectedPeriod) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    // Calculate sessions in period
    const sessionsInPeriod = timerSessions.filter(session => 
      session.completed && 
      session.type === 'work' &&
      new Date(session.startTime) >= startDate
    )

    // Tasks by status
    const tasksByStatus = {
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      archived: tasks.filter(t => t.status === 'archived').length
    }

    // Productivity by category
    const categoryData = tasks.reduce((acc, task) => {
      const category = task.category || 'Uncategorized'
      if (!acc[category]) {
        acc[category] = { total: 0, completed: 0, timeSpent: 0 }
      }
      acc[category].total++
      if (task.status === 'completed') {
        acc[category].completed++
      }
      if (task.actualDuration) {
        acc[category].timeSpent += task.actualDuration
      }
      return acc
    }, {} as Record<string, { total: number; completed: number; timeSpent: number }>)

    // Daily breakdown for charts (last 7 days)
    const dailyData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const daySessions = timerSessions.filter(session => {
        const sessionDate = new Date(session.startTime)
        return session.completed && 
               session.type === 'work' &&
               sessionDate >= dayStart && 
               sessionDate < dayEnd
      })
      
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.updatedAt)
        return task.status === 'completed' &&
               taskDate >= dayStart && 
               taskDate < dayEnd
      })

      dailyData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        timeSpent: daySessions.reduce((sum, s) => sum + s.duration, 0),
        tasksCompleted: dayTasks.length,
        sessions: daySessions.length
      })
    }

    return {
      totalTimeSpent,
      completedTasks,
      totalSessions: sessionsInPeriod.length,
      averageSessionLength: sessionsInPeriod.length > 0 
        ? Math.round(sessionsInPeriod.reduce((sum, s) => sum + s.duration, 0) / sessionsInPeriod.length)
        : 0,
      tasksByStatus,
      categoryData,
      dailyData
    }
  }, [selectedPeriod, tasks, timerSessions, getTotalTimeSpent, getCompletedTasksCount])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const maxDailyTime = Math.max(...analytics.dailyData.map(d => d.timeSpent), 1)

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        
        {/* Period Selector */}
        <div className="bg-muted/30 rounded-lg p-1 flex">
          {Object.entries(periodLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedPeriod(key as TimePeriod)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedPeriod === key
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-6 h-6 text-blue-500" />
            <span className="text-sm font-medium text-muted-foreground">Time Focused</span>
          </div>
          <div className="text-2xl font-bold">{formatTime(analytics.totalTimeSpent)}</div>
          <div className="text-sm text-muted-foreground">
            {analytics.totalSessions} sessions
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-sm font-medium text-muted-foreground">Tasks Completed</span>
          </div>
          <div className="text-2xl font-bold">{analytics.completedTasks}</div>
          <div className="text-sm text-muted-foreground">
            {analytics.tasksByStatus.pending} pending
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Target className="w-6 h-6 text-orange-500" />
            <span className="text-sm font-medium text-muted-foreground">Avg Session</span>
          </div>
          <div className="text-2xl font-bold">{formatTime(analytics.averageSessionLength)}</div>
          <div className="text-sm text-muted-foreground">
            per focus session
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            <span className="text-sm font-medium text-muted-foreground">Productivity</span>
          </div>
          <div className="text-2xl font-bold">
            {analytics.completedTasks > 0 && analytics.totalTimeSpent > 0
              ? Math.round((analytics.completedTasks / (analytics.totalTimeSpent / 60)) * 100) / 100
              : 0
            }
          </div>
          <div className="text-sm text-muted-foreground">
            tasks per hour
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Daily Activity Chart */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Daily Activity (Last 7 Days)</span>
          </h3>
          
          <div className="space-y-4">
            {analytics.dailyData.map((day, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">{day.date}</span>
                  <div className="flex space-x-4 text-muted-foreground">
                    <span>{formatTime(day.timeSpent)}</span>
                    <span>{day.tasksCompleted} tasks</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(day.timeSpent / maxDailyTime) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Task Status Overview</span>
          </h3>
          
          <div className="space-y-4">
            {Object.entries(analytics.tasksByStatus).map(([status, count]) => {
              const totalTasks = Object.values(analytics.tasksByStatus).reduce((a, b) => a + b, 0)
              const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0
              
              const statusConfig = {
                pending: { label: 'Pending', color: 'from-gray-500 to-slate-500' },
                in_progress: { label: 'In Progress', color: 'from-blue-500 to-purple-500' },
                completed: { label: 'Completed', color: 'from-green-500 to-emerald-500' },
                archived: { label: 'Archived', color: 'from-orange-500 to-red-500' }
              }
              
              const config = statusConfig[status as keyof typeof statusConfig]
              
              return (
                <div key={status} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{config.label}</span>
                    <div className="flex space-x-2 text-muted-foreground">
                      <span>{count}</span>
                      <span>({Math.round(percentage)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${config.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(analytics.categoryData).length > 0 && (
        <div className="bg-card border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Productivity by Category</span>
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Total Tasks</th>
                  <th className="text-left py-3 px-4 font-medium">Completed</th>
                  <th className="text-left py-3 px-4 font-medium">Time Spent</th>
                  <th className="text-left py-3 px-4 font-medium">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics.categoryData).map(([category, data]) => {
                  const completionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0
                  
                  return (
                    <tr key={category} className="border-b last:border-0">
                      <td className="py-3 px-4 font-medium">{category}</td>
                      <td className="py-3 px-4 text-muted-foreground">{data.total}</td>
                      <td className="py-3 px-4 text-green-600">{data.completed}</td>
                      <td className="py-3 px-4 text-muted-foreground">{formatTime(data.timeSpent)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(completionRate)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}