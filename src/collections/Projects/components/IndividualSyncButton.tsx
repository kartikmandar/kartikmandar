'use client'

import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

interface SyncResult {
  success: boolean
  projectId?: string
  projectTitle?: string
  error?: string
}

const IndividualSyncButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { id } = useDocumentInfo()

  const handleSync = async () => {
    if (isLoading || !id) return

    const confirmed = window.confirm(
      'This will sync GitHub data for this project. Continue?'
    )
    
    if (!confirmed) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/sync-github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId: id }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SyncResult = await response.json()

      if (data.success) {
        alert('Sync completed successfully!')
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        throw new Error(data.error || 'Sync failed')
      }
    } catch (error) {
      console.error('Individual sync error:', error)
      alert(
        `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <button
        type="button"
        onClick={handleSync}
        disabled={isLoading}
        style={{
          backgroundColor: isLoading ? '#6b7280' : '#059669',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = '#047857'
          }
        }}
        onMouseOut={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = '#059669'
          }
        }}
      >
        {isLoading ? (
          <>
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            Syncing...
          </>
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38L21.5 8" />
            </svg>
            Sync GitHub Data
          </>
        )}
      </button>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default IndividualSyncButton