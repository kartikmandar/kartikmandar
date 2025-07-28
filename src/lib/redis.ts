import { Redis } from '@upstash/redis'
import type { Goal, WorkSession } from '@/hooks/useAccountabilityStore'

// Initialize Redis client with environment variables  
const redis = new Redis({
  url: process.env.REDIS_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.REDIS_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Redis keys for different data types
export const REDIS_KEYS = {
  goals: 'accountability:goals',
  sessions: 'accountability:sessions',
  lastSync: 'accountability:last_sync'
} as const

// Goals operations
export async function saveGoals(goals: Goal[]): Promise<void> {
  try {
    await redis.set(REDIS_KEYS.goals, goals)
    await redis.set(REDIS_KEYS.lastSync, Date.now())
  } catch (error) {
    console.error('Failed to save goals to Redis:', error)
    throw error
  }
}

export async function loadGoals(): Promise<Goal[]> {
  try {
    const goals = await redis.get<Goal[]>(REDIS_KEYS.goals)
    return goals || []
  } catch (error) {
    console.error('Failed to load goals from Redis:', error)
    return []
  }
}

// Work sessions operations
export async function saveSessions(sessions: WorkSession[]): Promise<void> {
  try {
    // Filter out active sessions (don't persist them)
    const inactiveSessions = sessions.filter(session => !session.isActive)
    await redis.set(REDIS_KEYS.sessions, inactiveSessions)
  } catch (error) {
    console.error('Failed to save sessions to Redis:', error)
    throw error
  }
}

export async function loadSessions(): Promise<WorkSession[]> {
  try {
    const sessions = await redis.get<WorkSession[]>(REDIS_KEYS.sessions)
    return sessions || []
  } catch (error) {
    console.error('Failed to load sessions from Redis:', error)
    return []
  }
}

// Sync utilities
export async function getLastSyncTime(): Promise<number> {
  try {
    const lastSync = await redis.get<number>(REDIS_KEYS.lastSync)
    return lastSync || 0
  } catch (error) {
    console.error('Failed to get last sync time:', error)
    return 0
  }
}

// Health check
export async function testRedisConnection(): Promise<boolean> {
  try {
    await redis.ping()
    return true
  } catch (error) {
    console.error('Redis connection failed:', error)
    return false
  }
}

// Clear all data (for testing/reset)
export async function clearAllData(): Promise<void> {
  try {
    await redis.del(REDIS_KEYS.goals, REDIS_KEYS.sessions, REDIS_KEYS.lastSync)
  } catch (error) {
    console.error('Failed to clear Redis data:', error)
    throw error
  }
}