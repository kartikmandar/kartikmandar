'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { User, Clock, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react'
import {
  getFocusmateProfile,
  getFocusmateSessions,
  formatSessionDuration,
  getSessionCompletionRate,
  getTotalFocusTime,
  getSessionDurationStats,
  getJoinTimeStats,
  getActivityTypeStats,
  FocusmateAPIError,
  type FocusmateUser,
  type FocusmateSession
} from '@/lib/focusmate'

export function FocusmateSection() {
  const [profile, setProfile] = useState<FocusmateUser | null>(null)
  const [sessions, setSessions] = useState<FocusmateSession[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  const fetchFocusmateData = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Fetch profile and recent sessions
      const [profileData, sessionsData] = await Promise.all([
        getFocusmateProfile(),
        getFocusmateSessions()
      ])

      setProfile(profileData)
      setSessions(sessionsData)
    } catch (err) {
      console.error('Focusmate API error:', err)
      if (err instanceof FocusmateAPIError) {
        setError(`Failed to fetch Focusmate data: ${err.message}`)
      } else {
        setError('An unexpected error occurred while fetching Focusmate data')
      }
      setProfile(null)
      setSessions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on mount and refresh every 5 minutes
  useEffect(() => {
    fetchFocusmateData()
    const interval = setInterval(fetchFocusmateData, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    fetchFocusmateData()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalFocusTimeMs = getTotalFocusTime(sessions)
  const totalFocusHours = Math.round(totalFocusTimeMs / (1000 * 60 * 60))
  const completionRate = getSessionCompletionRate(sessions)
  const durationStats = getSessionDurationStats(sessions)
  const joinTimeStats = getJoinTimeStats(sessions)
  const activityStats = getActivityTypeStats(sessions)

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Focusmate</h2>
              <p className="text-muted-foreground text-sm">
                Loading your Focusmate data...
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-500" />
              <p className="text-muted-foreground">Loading Focusmate data...</p>
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
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Focusmate</h2>
              <p className="text-muted-foreground text-sm">
                Connect your Focusmate account to track focus sessions
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
              href="https://www.focusmate.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Focusmate</span>
            </a>
          </div>
        </div>

        {/* Error State */}
        <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl p-6">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
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
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Focusmate</h2>
            <p className="text-muted-foreground text-sm">
              Your focus sessions and productivity stats
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
            href="https://www.focusmate.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Focusmate</span>
          </a>
        </div>
      </div>

      {/* Profile Section */}
      {profile && (
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-4 mb-4">
            {profile.photoUrl ? (
              <Image
                src={profile.photoUrl}
                alt={profile.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">
                Member since {formatDate(profile.memberSince)} • {profile.timeZone}
              </p>
            </div>
          </div>

          {/* Primary Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
            <div className="bg-card border rounded-lg p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{profile.totalSessionCount}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Sessions</div>
            </div>
            <div className="bg-card border rounded-lg p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{completionRate}%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Completion Rate</div>
            </div>
            <div className="bg-card border rounded-lg p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{totalFocusHours}h</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Focus Time (30d)</div>
            </div>
          </div>

          {/* Secondary Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
            <div className="bg-card border rounded-lg p-2 sm:p-3 text-center">
              <div className="text-sm sm:text-lg font-bold text-purple-600">{durationStats.shortSessions}</div>
              <div className="text-xs text-muted-foreground">25min</div>
            </div>
            <div className="bg-card border rounded-lg p-2 sm:p-3 text-center">
              <div className="text-sm sm:text-lg font-bold text-indigo-600">{durationStats.mediumSessions}</div>
              <div className="text-xs text-muted-foreground">50min</div>
            </div>
            <div className="bg-card border rounded-lg p-2 sm:p-3 text-center">
              <div className="text-sm sm:text-lg font-bold text-pink-600">{durationStats.longSessions}</div>
              <div className="text-xs text-muted-foreground">75min+</div>
            </div>
            <div className="bg-card border rounded-lg p-2 sm:p-3 text-center">
              <div className="text-sm sm:text-lg font-bold text-teal-600">{joinTimeStats.onTimeCount}</div>
              <div className="text-xs text-muted-foreground">On Time</div>
            </div>
          </div>

          {/* Activity Type Breakdown */}
          <div className="bg-card border rounded-lg p-3 sm:p-4">
            <h4 className="text-sm font-medium mb-2">Activity Types (30d)</h4>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {Object.entries(activityStats).map(([activity, count]) => (
                <span
                  key={activity}
                  className="bg-orange-500/20 text-orange-600 px-2 py-1 rounded text-xs"
                >
                  {activity}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="bg-card border rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Recent Sessions</span>
          </h3>
          <span className="text-sm text-muted-foreground">
            Last 30 days • {sessions.length} sessions
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent sessions found</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3 max-h-80 overflow-y-auto">
            {sessions.slice(0, 10).map((session) => {
              const userSession = session.users[0]
              return (
                <div
                  key={session.sessionId}
                  className="flex items-center justify-between p-2 sm:p-3 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      userSession?.completed ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {userSession?.sessionTitle || 'Focus Session'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(session.startTime)} • {formatSessionDuration(session.duration)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {userSession?.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-red-500" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}