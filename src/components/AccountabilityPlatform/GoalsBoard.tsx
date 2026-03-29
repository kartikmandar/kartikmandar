'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Target, AlertCircle, CheckCircle, Archive, Flame, Plus, Edit2, Trash2, XCircle, ArchiveIcon } from 'lucide-react'
import { useAccountabilityStore, type Goal } from '@/hooks/useAccountabilityStore'
import { GoalForm } from './GoalForm'

export function GoalsBoard() {
  const { goals, moveGoal, deleteGoal, updateGoal: _updateGoal } = useAccountabilityStore()
  const [showGoalForm, setShowGoalForm] = useState<boolean>(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const columns = [
    { 
      id: 'active', 
      title: 'Active Goals', 
      status: 'active' as const, 
      color: 'from-blue-500/20 to-purple-500/20 border-blue-500/30',
      icon: Target
    },
    { 
      id: 'completed', 
      title: 'Completed', 
      status: 'completed' as const, 
      color: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      icon: CheckCircle
    },
    { 
      id: 'not_achieved', 
      title: 'Not Achieved', 
      status: 'not_achieved' as const, 
      color: 'from-red-500/20 to-pink-500/20 border-red-500/30',
      icon: AlertCircle
    },
    { 
      id: 'archived', 
      title: 'Archived', 
      status: 'archived' as const, 
      color: 'from-gray-500/20 to-slate-500/20 border-gray-500/30',
      icon: Archive
    }
  ]

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-500/10'
      case 'high': return 'text-red-500 bg-red-500/10'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10'
      case 'low': return 'text-green-500 bg-green-500/10'
      default: return 'text-muted-foreground bg-muted/50'
    }
  }

  const calculateCountdown = (goal: Goal) => {
    if (goal.goalType === 'deadline' && goal.deadline) {
      const deadline = new Date(goal.deadline)
      const now = currentTime
      const diff = deadline.getTime() - now.getTime()
      
      if (diff <= 0) {
        return { text: 'Overdue', isOverdue: true, isUrgent: false }
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      const isUrgent = diff < 24 * 60 * 60 * 1000 // Less than 24 hours
      
      if (days > 0) {
        return { text: `${days}d ${hours}h`, isOverdue: false, isUrgent }
      } else if (hours > 0) {
        return { text: `${hours}h ${minutes}m`, isOverdue: false, isUrgent }
      } else {
        return { text: `${minutes}m`, isOverdue: false, isUrgent }
      }
    }
    
    if (goal.goalType === 'duration' && goal.duration) {
      const start = new Date(goal.duration.startDate)
      const now = currentTime
      
      let endTime: Date
      switch (goal.duration.unit) {
        case 'hours':
          endTime = new Date(start.getTime() + goal.duration.amount * 60 * 60 * 1000)
          break
        case 'days':
          endTime = new Date(start.getTime() + goal.duration.amount * 24 * 60 * 60 * 1000)
          break
        case 'weeks':
          endTime = new Date(start.getTime() + goal.duration.amount * 7 * 24 * 60 * 60 * 1000)
          break
        case 'months':
          endTime = new Date(start)
          endTime.setMonth(endTime.getMonth() + goal.duration.amount)
          break
        default:
          return { text: 'Invalid duration', isOverdue: false, isUrgent: false }
      }
      
      const diff = endTime.getTime() - now.getTime()
      
      if (diff <= 0) {
        return { text: 'Time expired', isOverdue: true, isUrgent: false }
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      
      const isUrgent = diff < 24 * 60 * 60 * 1000
      
      if (days > 0) {
        return { text: `${days}d ${hours}h left`, isOverdue: false, isUrgent }
      } else {
        return { text: `${hours}h left`, isOverdue: false, isUrgent }
      }
    }
    
    return { text: 'Ongoing', isOverdue: false, isUrgent: false }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setShowGoalForm(true)
  }

  const handleDeleteGoal = async (goalId: string) => {
    const password = prompt('Enter admin password to delete this goal:')
    if (password !== 'poonam123') {
      alert('❌ Incorrect password. Only the owner can delete goals.')
      return
    }
    
    if (confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(goalId)
      } catch (error) {
        console.error('Failed to delete goal:', error)
        alert('Failed to delete goal. Please try again.')
      }
    }
  }

  const handleMoveGoal = async (goalId: string, status: Goal['status']) => {
    const password = prompt('Enter admin password to update goal status:')
    if (password !== 'poonam123') {
      alert('❌ Incorrect password. Only the owner can change goal status.')
      return
    }
    
    try {
      await moveGoal(goalId, status)
    } catch (error) {
      console.error('Failed to move goal:', error)
      alert('Failed to update goal status. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Add Goal Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => {
            setEditingGoal(null)
            setShowGoalForm(true)
          }}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Goals Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {columns.map((column) => {
          const Icon = column.icon
          const columnGoals = goals.filter(goal => goal.status === column.status)
          
          return (
            <div key={column.id} className="space-y-4">
              
              {/* Column Header */}
              <div className={`bg-gradient-to-r ${column.color} bg-card border rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <h3 className="font-semibold">{column.title}</h3>
                  </div>
                  <span className="bg-foreground/10 text-xs px-2 py-1 rounded-full">
                    {columnGoals.length}
                  </span>
                </div>
              </div>

              {/* Goals */}
              <div className="space-y-3 min-h-[300px] md:min-h-[400px]">
                {columnGoals.map((goal) => {
                  const countdown = calculateCountdown(goal)
                  
                  return (
                    <div
                      key={goal.id}
                      className="bg-card border rounded-lg p-4 space-y-3 hover:shadow-lg transition-all duration-200"
                    >
                      
                      {/* Goal Header */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium leading-tight flex-1 pr-2">
                            {goal.title}
                          </h4>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                            {goal.priority.toUpperCase()}
                            {goal.priority === 'critical' && <Flame className="w-3 h-3 inline ml-1" />}
                          </div>
                        </div>
                        
                        {/* Description */}
                        {goal.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {goal.description}
                          </p>
                        )}
                      </div>

                      {/* Countdown/Status */}
                      {goal.status === 'active' && (
                        <div className={`text-center py-3 px-4 rounded-lg ${
                          countdown.isOverdue 
                            ? 'bg-red-500/20 text-red-600 border border-red-500/30' 
                            : countdown.isUrgent
                            ? 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/30'
                            : 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
                        }`}>
                          <div className="flex items-center justify-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{countdown.text}</span>
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="space-y-2 text-xs text-muted-foreground">
                        
                        {/* Deadline */}
                        {goal.deadline && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Due: {formatDate(goal.deadline)}</span>
                          </div>
                        )}

                        {/* Duration Info */}
                        {goal.duration && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {goal.duration.amount} {goal.duration.unit} 
                              {goal.duration.startDate && ` (started ${formatDate(goal.duration.startDate)})`}
                            </span>
                          </div>
                        )}

                        {/* Completion Date */}
                        {goal.completedAt && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            <span>Completed: {formatDate(goal.completedAt)}</span>
                          </div>
                        )}

                        {/* Category */}
                        {goal.category && (
                          <div className="inline-block bg-muted px-2 py-1 rounded text-xs">
                            {goal.category}
                          </div>
                        )}

                        {/* Tags */}
                        {goal.tags && goal.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {goal.tags.map((tag, index) => (
                              <span key={index} className="bg-blue-500/20 text-blue-600 px-2 py-1 rounded text-xs">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Last Updated */}
                        <div className="text-xs text-muted-foreground pt-1 border-t">
                          Updated: {formatDate(goal.updatedAt)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t space-y-2 sm:space-y-0">
                        <div className="flex flex-wrap gap-2">
                          {goal.status === 'active' && (
                            <>
                              <button
                                onClick={() => handleMoveGoal(goal.id, 'completed')}
                                className="flex items-center space-x-1 text-green-600 hover:text-green-700 hover:bg-green-500/10 px-2 py-1 rounded text-xs transition-colors"
                                title="Mark as completed"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Complete</span>
                              </button>
                              <button
                                onClick={() => handleMoveGoal(goal.id, 'not_achieved')}
                                className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-500/10 px-2 py-1 rounded text-xs transition-colors"
                                title="Mark as not achieved"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Failed</span>
                              </button>
                            </>
                          )}
                          {(goal.status === 'completed' || goal.status === 'not_achieved') && (
                            <button
                              onClick={() => handleMoveGoal(goal.id, 'archived')}
                              className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 hover:bg-gray-500/10 px-2 py-1 rounded text-xs transition-colors"
                              title="Archive goal"
                            >
                              <ArchiveIcon className="w-3 h-3" />
                              <span>Archive</span>
                            </button>
                          )}
                          {goal.status === 'archived' && (
                            <button
                              onClick={() => handleMoveGoal(goal.id, 'active')}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 hover:bg-blue-500/10 px-2 py-1 rounded text-xs transition-colors"
                              title="Reactivate goal"
                            >
                              <Target className="w-3 h-3" />
                              <span>Reactivate</span>
                            </button>
                          )}
                        </div>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditGoal(goal)}
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-500/10 rounded transition-colors"
                            title="Edit goal"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete goal"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                    </div>
                  )
                })}

                {columnGoals.length === 0 && (
                  <div className="text-center text-muted-foreground py-12">
                    <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {column.id === 'not_achieved' ? 'None achieved' : 
                       column.id === 'completed' ? 'None completed' :
                       column.id === 'archived' ? 'None archived' :
                       `No ${column.title.toLowerCase()}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Goal Form Modal */}
      {showGoalForm && (
        <GoalForm
          goal={editingGoal}
          onClose={() => {
            setShowGoalForm(false)
            setEditingGoal(null)
          }}
        />
      )}

    </div>
  )
}