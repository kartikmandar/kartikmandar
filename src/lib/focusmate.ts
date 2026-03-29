// Focusmate API utility functions

export interface FocusmateUser {
  userId: string
  name: string
  totalSessionCount: number
  timeZone: string
  photoUrl?: string
  memberSince: string
}

export interface FocusmateSession {
  sessionId: string
  duration: string
  startTime: string
  users: Array<{
    userId: string
    sessionTitle?: string
    requestedAt: string
    joinedAt?: string | null
    completed: boolean
    activityType: string
    preferences?: {
      quietMode: boolean
      preferFavorites: string
    }
  }>
}

export interface FocusmateProfile {
  user: FocusmateUser
}

export interface FocusmateSessions {
  sessions: FocusmateSession[]
}

class FocusmateAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'FocusmateAPIError'
  }
}

// Client-side API functions that call our Next.js API routes
export async function getFocusmateProfile(): Promise<FocusmateUser> {
  const response = await fetch('/api/focusmate/profile')
  
  if (!response.ok) {
    const error = await response.json()
    throw new FocusmateAPIError(error.error || 'Failed to fetch profile', response.status)
  }
  
  const data = await response.json()
  return data.user
}

export async function getFocusmateSessions(
  startDate?: Date,
  endDate?: Date
): Promise<FocusmateSession[]> {
  const params = new URLSearchParams()
  
  if (startDate) {
    params.append('start', startDate.toISOString())
  }
  if (endDate) {
    params.append('end', endDate.toISOString())
  }
  
  const queryString = params.toString()
  const url = `/api/focusmate/sessions${queryString ? `?${queryString}` : ''}`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    const error = await response.json()
    throw new FocusmateAPIError(error.error || 'Failed to fetch sessions', response.status)
  }
  
  const data = await response.json()
  return data.sessions
}

export function formatSessionDuration(durationMs: string): string {
  const duration = parseInt(durationMs) / 1000 // Convert to seconds
  const minutes = Math.floor(duration / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  return `${minutes}m`
}

export function getSessionCompletionRate(sessions: FocusmateSession[]): number {
  if (sessions.length === 0) return 0
  
  const completedSessions = sessions.filter(session => 
    session.users[0]?.completed === true
  )
  
  return Math.round((completedSessions.length / sessions.length) * 100)
}

export function getTotalFocusTime(sessions: FocusmateSession[]): number {
  return sessions.reduce((total, session) => {
    const durationMs = parseInt(session.duration)
    return total + durationMs
  }, 0)
}

export function getSessionDurationStats(sessions: FocusmateSession[]) {
  const durations = sessions.map(session => parseInt(session.duration) / 1000 / 60) // Convert to minutes
  const shortSessions = durations.filter(d => d <= 25).length
  const mediumSessions = durations.filter(d => d > 25 && d <= 50).length
  const longSessions = durations.filter(d => d > 50).length
  
  return { shortSessions, mediumSessions, longSessions }
}

export function getJoinTimeStats(sessions: FocusmateSession[]) {
  const validSessions = sessions.filter(session => 
    session.users[0]?.joinedAt && session.users[0]?.requestedAt
  )
  
  if (validSessions.length === 0) return { avgEarlyMins: 0, onTimeCount: 0 }
  
  const joinDelays = validSessions.map(session => {
    const user = session.users[0]
    if (!user) return 0
    
    const joined = new Date(user.joinedAt!).getTime()
    const startTime = new Date(session.startTime).getTime()
    
    return (joined - startTime) / 1000 / 60 // Minutes early/late
  })
  
  const avgEarlyMins = Math.abs(joinDelays.reduce((sum, delay) => sum + delay, 0) / joinDelays.length)
  const onTimeCount = joinDelays.filter(delay => Math.abs(delay) <= 2).length
  
  return { avgEarlyMins: Math.round(avgEarlyMins * 10) / 10, onTimeCount }
}

export function getActivityTypeStats(sessions: FocusmateSession[]) {
  const activities = sessions.reduce((acc, session) => {
    const activity = session.users[0]?.activityType || 'unknown'
    acc[activity] = (acc[activity] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return activities
}

export { FocusmateAPIError }