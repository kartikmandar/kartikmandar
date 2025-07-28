import type { Goal, WorkSession } from '@/hooks/useAccountabilityStore'

// Goals API calls
export async function saveGoalsAPI(goals: Goal[]): Promise<void> {
  const response = await fetch('/api/goals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ goals }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save goals')
  }
}

export async function loadGoalsAPI(): Promise<Goal[]> {
  const response = await fetch('/api/goals', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to load goals')
  }
  
  const data = await response.json()
  return data.goals || []
}

// Sessions API calls
export async function saveSessionsAPI(sessions: WorkSession[]): Promise<void> {
  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessions }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save sessions')
  }
}

export async function loadSessionsAPI(): Promise<WorkSession[]> {
  const response = await fetch('/api/sessions', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to load sessions')
  }
  
  const data = await response.json()
  return data.sessions || []
}