'use client'

import React, { useState } from 'react'
import { useTaskStore, type Task } from '@/hooks/useTaskStore'
import { Plus, Clock, Calendar, Archive, Trash2, Edit2, Play, CheckCircle, XCircle, ArchiveIcon } from 'lucide-react'
import { TaskForm } from './TaskForm'

export function TaskBoard() {
  const { tasks, moveTask, deleteTask, startTimer } = useTaskStore()
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [_activeDropdown, _setActiveDropdown] = useState<string | null>(null)

  const columns = [
    { id: 'pending', title: 'Pending', status: 'pending' as const, color: 'from-gray-500/20 to-slate-500/20 border-gray-500/30' },
    { id: 'in_progress', title: 'In Progress', status: 'in_progress' as const, color: 'from-blue-500/20 to-purple-500/20 border-blue-500/30' },
    { id: 'completed', title: 'Completed', status: 'completed' as const, color: 'from-green-500/20 to-emerald-500/20 border-green-500/30' },
    { id: 'not_achieved', title: 'Not Achieved', status: 'not_achieved' as const, color: 'from-red-500/20 to-orange-500/20 border-red-500/30' },
    { id: 'archived', title: 'Archived', status: 'archived' as const, color: 'from-orange-500/20 to-red-500/20 border-orange-500/30' }
  ]

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-muted-foreground'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId)
  }

  const handleStartTimerForTask = (task: Task) => {
    startTimer(task.estimatedDuration, 'work', task.id)
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    moveTask(taskId, status)
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Task Board</h2>
        <button
          onClick={() => {
            setEditingTask(null)
            setShowTaskForm(true)
          }}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid lg:grid-cols-5 gap-6">
        {columns.map((column) => {
          const columnTasks = tasks.filter(task => task.status === column.status)
          
          return (
            <div key={column.id} className="space-y-4">
              
              {/* Column Header */}
              <div className={`bg-gradient-to-r ${column.color} bg-card border rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{column.title}</h3>
                  <span className="bg-foreground/10 text-xs px-2 py-1 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks */}
              <div
                className="space-y-3 min-h-[400px] p-2 rounded-lg border-2 border-dashed border-transparent transition-colors duration-200 hover:border-muted-foreground/30"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="bg-card border rounded-lg p-4 space-y-3 cursor-move hover:shadow-lg transition-all duration-200 group"
                  >
                    
                    {/* Task Header */}
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium leading-tight flex-1 pr-2">
                        {task.title}
                      </h4>
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-1 hover:bg-muted rounded transition-all duration-200"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Task Description */}
                    {task.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Task Metadata */}
                    <div className="space-y-2">
                      
                      {/* Priority & Duration */}
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority?.toUpperCase()}
                        </span>
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(task.estimatedDuration)}</span>
                          {task.actualDuration && task.actualDuration !== task.estimatedDuration && (
                            <span className="text-blue-500">
                              / {formatDuration(task.actualDuration)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Due Date */}
                      {task.dueDate && (
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Due {formatDate(task.dueDate)}</span>
                        </div>
                      )}

                      {/* Category */}
                      {task.category && (
                        <div className="inline-block bg-muted px-2 py-1 rounded text-xs">
                          {task.category}
                        </div>
                      )}

                      {/* Timer Sessions */}
                      {task.timerSessions.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {task.timerSessions.filter(s => s.completed && s.type === 'work').length} sessions completed
                        </div>
                      )}
                    </div>

                    {/* Task Actions */}
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t mt-2">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleStartTimerForTask(task)}
                          className="flex items-center space-x-2 px-3 py-1 text-left hover:bg-muted text-sm rounded-md"
                        >
                          <Play className="w-4 h-4" />
                          <span>Start</span>
                        </button>
                      )}
                      {(task.status === 'pending' || task.status === 'in_progress') && (
                        <>
                          <button
                            onClick={() => moveTask(task.id, 'completed')}
                            className="flex items-center space-x-2 px-3 py-1 text-left hover:bg-muted text-sm text-green-600 rounded-md"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Pass</span>
                          </button>
                          <button
                            onClick={() => moveTask(task.id, 'not_achieved')}
                            className="flex items-center space-x-2 px-3 py-1 text-left hover:bg-muted text-sm text-red-600 rounded-md"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Fail</span>
                          </button>
                          <button
                            onClick={() => moveTask(task.id, 'archived')}
                            className="flex items-center space-x-2 px-3 py-1 text-left hover:bg-muted text-sm rounded-md"
                          >
                            <ArchiveIcon className="w-4 h-4" />
                            <span>Remove</span>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="flex items-center space-x-2 px-3 py-1 text-left hover:bg-muted text-sm text-red-600 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}

                {columnTasks.length === 0 && (
                  <div className="text-center text-muted-foreground py-12">
                    <Archive className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onClose={() => {
            setShowTaskForm(false)
            setEditingTask(null)
          }}
        />
      )}

    </div>
  )
}
