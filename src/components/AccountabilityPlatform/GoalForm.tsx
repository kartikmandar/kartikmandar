'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, Target, Flag, Zap } from 'lucide-react'
import { useAccountabilityStore, type Goal } from '@/hooks/useAccountabilityStore'

interface GoalFormProps {
  goal?: Goal | null
  onClose: () => void
}

export function GoalForm({ goal, onClose }: GoalFormProps) {
  const { addGoal, updateGoal } = useAccountabilityStore()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Goal['priority'],
    category: '',
    goalType: 'open_ended' as Goal['goalType'],
    deadline: '',
    duration: {
      amount: 1,
      unit: 'weeks' as 'hours' | 'days' | 'weeks' | 'months',
      startDate: new Date().toISOString().split('T')[0] as string
    },
    status: 'active' as Goal['status'],
    notes: '',
    tags: [] as string[]
  })
  
  const [newTag, setNewTag] = useState('')
  const [password, setPassword] = useState('')
  const [showPasswordError, setShowPasswordError] = useState(false)

  // Populate form if editing
  useEffect(() => {
    if (goal) {
      const deadlineString: string = goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0]! : ''
      const durationStartDate: string = goal.duration?.startDate ? new Date(goal.duration.startDate).toISOString().split('T')[0]! : new Date().toISOString().split('T')[0]!
      
      setFormData({
        title: goal.title,
        description: goal.description || '',
        priority: goal.priority,
        category: goal.category || '',
        goalType: goal.goalType,
        deadline: deadlineString,
        duration: goal.duration ? {
          amount: goal.duration.amount,
          unit: goal.duration.unit,
          startDate: durationStartDate
        } : {
          amount: 1,
          unit: 'weeks' as 'hours' | 'days' | 'weeks' | 'months',
          startDate: new Date().toISOString().split('T')[0] as string
        },
        status: goal.status,
        notes: goal.notes || '',
        tags: goal.tags || []
      })
    }
  }, [goal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) return

    // Check password first
    if (password !== 'poonam123') {
      setShowPasswordError(true)
      return
    }
    
    setShowPasswordError(false)

    const goalData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      category: formData.category.trim() || undefined,
      goalType: formData.goalType,
      deadline: formData.goalType === 'deadline' && formData.deadline 
        ? new Date(formData.deadline) 
        : undefined,
      duration: formData.goalType === 'duration' ? {
        amount: formData.duration.amount,
        unit: formData.duration.unit,
        startDate: new Date(formData.duration.startDate)
      } : undefined,
      status: formData.status,
      notes: formData.notes.trim() || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined
    }

    try {
      if (goal) {
        await updateGoal(goal.id, goalData)
      } else {
        await addGoal(goalData)
      }
      onClose()
    } catch (error) {
      console.error('Failed to save goal:', error)
      alert('Failed to save goal. Please try again.')
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-card border rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold">
              {goal ? 'Edit Goal' : 'Create New Goal'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
          
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Goal Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter your goal title..."
              className="w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your goal..."
              rows={3}
              className="w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
          </div>

          {/* Priority and Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-1">
                <Flag className="w-4 h-4" />
                <span>Priority</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Goal['priority'] }))}
                className="w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Work, Personal, Health"
                className="w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Goal Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center space-x-1">
              <Zap className="w-4 h-4" />
              <span>Goal Type</span>
            </label>
            <select
              value={formData.goalType}
              onChange={(e) => setFormData(prev => ({ ...prev, goalType: e.target.value as Goal['goalType'] }))}
              className="w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="open_ended">Open Ended</option>
              <option value="deadline">Deadline Based</option>
              <option value="duration">Duration Based</option>
              <option value="recurring">Recurring</option>
            </select>
          </div>

          {/* Deadline (if deadline type) */}
          {formData.goalType === 'deadline' && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Deadline</span>
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          )}

          {/* Duration (if duration type) */}
          {formData.goalType === 'duration' && (
            <div className="space-y-4">
              <label className="text-sm font-medium flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Duration</span>
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Amount</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration.amount}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      duration: { ...prev.duration, amount: parseInt(e.target.value) || 1 }
                    }))}
                    className="w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Unit</label>
                  <select
                    value={formData.duration.unit}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      duration: { ...prev.duration, unit: e.target.value as 'hours' | 'days' | 'weeks' | 'months' }
                    }))}
                    className="w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Start Date</label>
                <input
                  type="date"
                  value={formData.duration.startDate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    duration: { ...prev.duration, startDate: e.target.value }
                  }))}
                  className="w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Tags</label>
            
            {/* Add Tag Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Tags Display */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-500/20 text-blue-600 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or details..."
              rows={3}
              className="w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
          </div>

          {/* Password Protection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-red-600">Admin Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password to save changes..."
              className="w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
              required
            />
            {showPasswordError && (
              <p className="text-red-600 text-sm">❌ Incorrect password. Only the owner can create or edit goals.</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-muted-foreground hover:text-foreground border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
            >
              {goal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}