'use client'

import { useEffect } from 'react'
import { useAccountabilityStore } from './useAccountabilityStore'

/**
 * Hook to automatically sync with Redis every 30 seconds
 * This enables cross-device synchronization
 */
export function useRedisSync() {
  const syncFromRedis = useAccountabilityStore(state => state.syncFromRedis)
  
  useEffect(() => {
    // Sync immediately on mount
    syncFromRedis()
    
    // Set up periodic sync every 30 seconds
    const interval = setInterval(() => {
      syncFromRedis()
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [syncFromRedis])
}

/**
 * Hook for manual sync with loading state
 */
export function useManualSync() {
  const syncFromRedis = useAccountabilityStore(state => state.syncFromRedis)
  const isLoading = useAccountabilityStore(state => state.isLoading)
  
  return {
    sync: syncFromRedis,
    isLoading
  }
}