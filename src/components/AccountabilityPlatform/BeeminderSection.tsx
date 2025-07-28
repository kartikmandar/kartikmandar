'use client'

import React, { useState, useEffect } from 'react'
import { Target, TrendingUp, AlertTriangle, RefreshCw, ExternalLink, Award, Zap } from 'lucide-react'
import {
  getBeeminderUser,
  getBeeminderGoals,
  getBeeminderArchivedGoals,
  formatGoalDeadline,
  getDotColor,
  getUrgentGoals,
  getGoalStats,
  formatPledgeAmount,
  getGoalTypeLabel,
  BeeminderAPIError,
  type BeeminderUser,
  type BeeminderGoal
} from '@/lib/beeminder'

export function BeeminderSection() {
  const [user, setUser] = useState<BeeminderUser | null>(null)
  const [goals, setGoals] = useState<BeeminderGoal[]>([])
  const [archivedGoals, setArchivedGoals] = useState<BeeminderGoal[]>([])
  const [showArchived, setShowArchived] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  const fetchBeeminderData = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Fetch user profile, active goals, and archived goals
      const [userData, goalsData, archivedGoalsData] = await Promise.all([
        getBeeminderUser(),
        getBeeminderGoals(),
        getBeeminderArchivedGoals()
      ])

      setUser(userData)
      setGoals(goalsData)
      setArchivedGoals(archivedGoalsData)
    } catch (err) {
      console.error('Beeminder API error:', err)
      if (err instanceof BeeminderAPIError) {
        setError(`Failed to fetch Beeminder data: ${err.message}`)
      } else {
        setError('An unexpected error occurred while fetching Beeminder data')
      }
      setUser(null)
      setGoals([])
      setArchivedGoals([])
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on mount and refresh every 5 minutes
  useEffect(() => {
    fetchBeeminderData()
    const interval = setInterval(fetchBeeminderData, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    fetchBeeminderData()
  }


  const stats = getGoalStats(goals, archivedGoals)
  const urgentGoals = getUrgentGoals(goals)
  const displayGoals = showArchived ? archivedGoals : goals

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Beeminder</h2>
              <p className="text-muted-foreground text-sm">
                Loading your Beeminder data...
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-yellow-500" />
              <p className="text-muted-foreground">Loading Beeminder data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Beeminder</h2>
              <p className="text-muted-foreground text-sm">
                Connect your Beeminder account to track your goals
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
            <a
              href="https://www.beeminder.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Beeminder</span>
            </a>
          </div>
        </div>

        {/* Error State */}
        <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl p-6">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Connection Failed</h3>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Beeminder</h2>
            <p className="text-muted-foreground text-sm">
              Your commitment contracts and goal tracking
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <a
            href="https://www.beeminder.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Beeminder</span>
          </a>
        </div>
      </div>

      {/* User Profile Section */}
      {user && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{user.username}</h3>
              <p className="text-sm text-muted-foreground">
                {user.timezone} • Urgency Load: {user.urgency_load.toFixed(1)}
                {user.deadbeat && <span className="text-red-500 ml-2">• Payment Issue</span>}
              </p>
            </div>
          </div>

          {/* Primary Stats Grid */}
          <div className="space-y-3 sm:space-y-0 mb-4">
            {/* Mobile: 2x3 grid */}
            <div className="grid grid-cols-2 gap-3 sm:hidden mb-4">
              <div className="bg-card border rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">{stats.active}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div className="bg-card border rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-red-600">{stats.urgent}</div>
                <div className="text-xs text-muted-foreground">Urgent</div>
              </div>
              <div className="bg-card border rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-yellow-600">{formatPledgeAmount(stats.totalPledged)}</div>
                <div className="text-xs text-muted-foreground">Pledged</div>
              </div>
              <div className="bg-card border rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{stats.completed}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="bg-card border rounded-lg p-3 text-center col-span-2">
                <div className="text-lg font-bold text-purple-600">{stats.archived}</div>
                <div className="text-xs text-muted-foreground">Archived</div>
              </div>
            </div>
            
            {/* Desktop: 5 column grid */}
            <div className="hidden sm:grid sm:grid-cols-5 gap-4 mb-4">
              <div className="bg-card border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
                <div className="text-sm text-muted-foreground">Urgent</div>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{formatPledgeAmount(stats.totalPledged)}</div>
                <div className="text-sm text-muted-foreground">Pledged</div>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.archived}</div>
                <div className="text-sm text-muted-foreground">Archived</div>
              </div>
            </div>
          </div>

          {/* Goal Types Breakdown */}
          {Object.keys(stats.goalTypes).length > 0 && (
            <div className="bg-card border rounded-lg p-3 sm:p-4">
              <h4 className="text-sm font-medium mb-2">Goal Types</h4>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {Object.entries(stats.goalTypes).map(([type, count]) => (
                  <span
                    key={type}
                    className="bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded text-xs"
                  >
                    {getGoalTypeLabel(type)}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Urgent Goals - Only show for active goals */}
      {!showArchived && urgentGoals.length > 0 && (
        <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl p-4 sm:p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-red-600">Urgent Goals</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {urgentGoals.slice(0, 5).map((goal) => (
              <div
                key={goal.id}
                className="flex items-center justify-between p-2 sm:p-3 bg-card rounded-lg"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    getDotColor(goal.safebuf) === 'red' ? 'bg-red-500' :
                    getDotColor(goal.safebuf) === 'orange' ? 'bg-orange-500' :
                    getDotColor(goal.safebuf) === 'blue' ? 'bg-blue-500' :
                    getDotColor(goal.safebuf) === 'green' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatGoalDeadline(goal.losedate)} • {formatPledgeAmount(goal.pledge)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium">{goal.limsum}</p>
                  <p className="text-xs text-muted-foreground">{goal.safebuf} days safe</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Goals */}
      <div className="bg-card border rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>{showArchived ? 'Archived Goals' : 'Active Goals'}</span>
          </h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors w-full sm:w-auto text-center ${
                showArchived 
                  ? 'bg-purple-500/20 text-purple-600 border border-purple-500/30' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {showArchived ? `Show Active (${goals.length})` : `Show Archived (${archivedGoals.length})`}
            </button>
            <span className="text-sm text-muted-foreground text-center sm:text-left">
              {displayGoals.length} {showArchived ? 'archived' : 'active'} goals
            </span>
          </div>
        </div>

        {displayGoals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No {showArchived ? 'archived' : 'active'} goals found</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3 max-h-80 overflow-y-auto">
            {displayGoals.slice(0, 20).map((goal) => (
              <div
                key={goal.id}
                className="flex items-center justify-between p-2 sm:p-3 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    getDotColor(goal.safebuf) === 'red' ? 'bg-red-500' :
                    getDotColor(goal.safebuf) === 'orange' ? 'bg-orange-500' :
                    getDotColor(goal.safebuf) === 'blue' ? 'bg-blue-500' :
                    getDotColor(goal.safebuf) === 'green' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {getGoalTypeLabel(goal.goal_type)} • {formatPledgeAmount(goal.pledge)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {goal.won && <Award className="w-4 h-4 inline text-green-500 mr-1" />}
                      {goal.frozen && <Zap className="w-4 h-4 inline text-blue-500 mr-1" />}
                      {goal.lost && <AlertTriangle className="w-4 h-4 inline text-red-500 mr-1" />}
                      {!goal.won && !goal.frozen && !goal.lost && formatGoalDeadline(goal.losedate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {goal.safebuf} days safe
                    </p>
                  </div>
                  <a
                    href={`https://www.beeminder.com/${user?.username}/${goal.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}