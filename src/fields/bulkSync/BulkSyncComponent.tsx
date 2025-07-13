'use client'

import React, { useState } from 'react'
import { Button } from '@payloadcms/ui'

interface SyncResult {
  success: boolean
  projectId?: string
  projectTitle?: string
  error?: string
}

interface SyncResponse {
  success: boolean
  results: SyncResult[]
  totalProcessed: number
  totalSuccess: number
  totalErrors: number
}

interface BulkSyncComponentProps {
  // Component doesn't require props, using Record<string, never> for empty interface
  [key: string]: never
}

export const BulkSyncComponent: React.FC<BulkSyncComponentProps> = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [syncResults, setSyncResults] = useState<SyncResponse | null>(null)

  const handleBulkSync = async () => {
    if (isLoading) return

    const confirmed = window.confirm(
      'This will sync GitHub data for ALL projects with GitHub URLs. This may take several minutes and will consume GitHub API rate limit. Continue?'
    )
    
    if (!confirmed) return

    setIsLoading(true)
    setSyncStatus('idle')
    setErrorMessage('')
    setSyncResults(null)
    
    try {
      const response = await fetch('/api/sync-github', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SyncResponse = await response.json()
      setSyncResults(data)

      if (data.success) {
        setSyncStatus('success')
        setLastSync(new Date().toLocaleString())
      } else {
        throw new Error('Sync failed')
      }
    } catch (error) {
      console.error('Bulk sync error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error')
      setSyncStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="field-type field-type--ui">
      <div className="field-label">
        <label className="field-label__label">Bulk GitHub Sync</label>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <p style={{ 
          fontSize: '13px', 
          color: '#666', 
          margin: '0 0 12px 0',
          lineHeight: '1.4'
        }}>
          Sync GitHub data for all projects with repository URLs. This will update repository stats, branches, releases, and metadata.
        </p>
        
        <Button
          type="button"
          onClick={handleBulkSync}
          disabled={isLoading}
          buttonStyle="primary"
          size="medium"
        >
          {isLoading ? 'Syncing All Projects...' : 'Bulk Sync All Projects'}
        </Button>
      </div>

      {syncStatus === 'success' && syncResults && (
        <div style={{ 
          marginBottom: '12px',
          padding: '12px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          color: '#155724',
          fontSize: '13px'
        }}>
          <strong>✅ Bulk Sync Completed!</strong>
          <br />
          <div style={{ marginTop: '6px' }}>
            • Total Projects: {syncResults.totalProcessed}
            <br />
            • Successfully Synced: {syncResults.totalSuccess}
            <br />
            • Failed: {syncResults.totalErrors}
            <br />
            • Completed: {lastSync}
          </div>
          
          {syncResults.totalErrors > 0 && (
            <details style={{ marginTop: '8px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                View Failed Projects ({syncResults.totalErrors})
              </summary>
              <div style={{ marginTop: '6px', fontSize: '12px' }}>
                {syncResults.results
                  .filter(r => !r.success)
                  .map((result, index) => (
                    <div key={index} style={{ marginBottom: '4px' }}>
                      • {result.projectTitle || result.projectId}: {result.error}
                    </div>
                  ))
                }
              </div>
            </details>
          )}
        </div>
      )}

      {syncStatus === 'error' && errorMessage && (
        <div style={{ 
          marginBottom: '12px',
          padding: '12px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24',
          fontSize: '13px'
        }}>
          <strong>❌ Bulk Sync Failed:</strong> {errorMessage}
        </div>
      )}

      <details style={{ fontSize: '12px', color: '#666' }}>
        <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
          What gets synced for each project
        </summary>
        <ul style={{ margin: '0', paddingLeft: '16px', lineHeight: '1.4' }}>
          <li>Repository stats (stars, forks, watchers, issues)</li>
          <li>Programming languages and tech stack</li>
          <li>Contributors and commit count</li>
          <li>Branches information with protection status</li>
          <li>File/directory counts and repository size</li>
          <li>Latest release information and download counts</li>
          <li>Repository metadata (license, topics, homepage)</li>
          <li>Issues and pull request statistics</li>
        </ul>
        <p style={{ fontSize: '11px', color: '#999', margin: '8px 0 0 0' }}>
          <strong>Note:</strong> This operation uses significant GitHub API rate limit. Projects are processed in batches with delays to respect rate limits.
        </p>
      </details>
    </div>
  )
}

export default BulkSyncComponent