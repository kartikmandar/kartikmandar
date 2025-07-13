'use client'

import React, { useState, useMemo } from 'react'
import { useForm } from '@payloadcms/ui'
import { Button } from '@payloadcms/ui'

interface GitHubSyncComponentProps {
  // Component doesn't require props, using Record<string, never> for empty interface
  [key: string]: never
}

export const GitHubSyncComponent: React.FC<GitHubSyncComponentProps> = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const { getData, dispatchFields } = useForm()
  const formData = getData()

  // Get GitHub URL from form data (this is more reliable)
  const githubUrl = formData?.links?.githubUrl as string
  
  // Try multiple ways to get the project ID
  const projectId = formData?.id || 
                   formData?._id || 
                   (typeof window !== 'undefined' && window.location.pathname.includes('/admin/collections/projects/') 
                     ? window.location.pathname.split('/').pop() 
                     : null) as string


  // Validate GitHub URL
  const urlValidation = useMemo(() => {
    if (!githubUrl) {
      return { isValid: false, message: 'No GitHub URL provided' }
    }

    if (!githubUrl.includes('github.com')) {
      return { isValid: false, message: 'Not a GitHub URL' }
    }

    const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?(\?.*)?$/
    if (!githubUrlPattern.test(githubUrl.replace(/\.git$/, ''))) {
      return { isValid: false, message: 'Invalid GitHub URL format' }
    }

    return { isValid: true, message: '' }
  }, [githubUrl])

  const handleSync = async () => {
    if (!githubUrl) {
      setErrorMessage('No GitHub URL found. Please add a GitHub URL first.')
      setSyncStatus('error')
      return
    }

    if (!projectId) {
      setErrorMessage('Project must be saved before syncing GitHub data.')
      setSyncStatus('error')
      return
    }

    setIsLoading(true)
    setSyncStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/sync-github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      })

      const result = await response.json()

      if (result.success) {
        setSyncStatus('success')
        setLastSync(new Date().toLocaleString())
        
        // Update the lastGitHubSync field in the form
        dispatchFields({
          type: 'UPDATE',
          path: 'lastGitHubSync',
          value: new Date().toISOString(),
        })

        // Optionally refresh the page to show updated data
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setErrorMessage(result.error || 'Failed to sync GitHub data')
        setSyncStatus('error')
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Network error occurred')
      setSyncStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = async () => {
    if (!githubUrl) {
      setErrorMessage('No GitHub URL found. Please add a GitHub URL first.')
      setSyncStatus('error')
      return
    }

    setIsLoading(true)
    setSyncStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/sync-github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ githubUrl }),
      })

      const result = await response.json()

      if (result.success) {
        const { githubData } = result
        alert(`GitHub Repository Preview:
        
Name: ${githubData.fullName}
Description: ${githubData.description || 'No description'}
Stars: ${githubData.stars}
Forks: ${githubData.forks}
Language: ${githubData.language || 'Not specified'}
Languages: ${githubData.languages.join(', ')}
Total Commits: ${githubData.totalCommits}
Contributors: ${githubData.contributors.length}
License: ${githubData.license || 'No license'}
Created: ${new Date(githubData.createdAt).toLocaleDateString()}
Last Updated: ${new Date(githubData.updatedAt).toLocaleDateString()}`)
      } else {
        setErrorMessage(result.error || 'Failed to fetch GitHub data')
        setSyncStatus('error')
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Network error occurred')
      setSyncStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="field-type field-type--ui">
      <div className="field-label">
        <label className="field-label__label">GitHub Data Sync</label>
      </div>
      
      {githubUrl && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ 
            fontSize: '13px',
            color: urlValidation.isValid ? '#666' : '#dc3545',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            marginBottom: '4px'
          }}>
            {githubUrl}
          </div>
          {!urlValidation.isValid && (
            <div style={{
              fontSize: '12px',
              color: '#dc3545',
              fontWeight: '500'
            }}>
              ⚠️ {urlValidation.message}
            </div>
          )}
          {urlValidation.isValid && (
            <div style={{
              fontSize: '12px',
              color: '#28a745',
              fontWeight: '500'
            }}>
              ✅ Valid GitHub repository URL
            </div>
          )}
        </div>
      )}
      
      {!githubUrl && (
        <div style={{
          marginBottom: '12px',
          padding: '8px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          color: '#856404',
          fontSize: '13px'
        }}>
          💡 Add a GitHub URL in the &quot;Links&quot; section above to enable syncing
        </div>
      )}

      {githubUrl && urlValidation.isValid && !projectId && (
        <div style={{
          marginBottom: '12px',
          padding: '8px',
          backgroundColor: '#cce5ff',
          border: '1px solid #4dabf7',
          borderRadius: '4px',
          color: '#1971c2',
          fontSize: '13px'
        }}>
          💾 Save this project first to enable GitHub syncing
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <Button
          type="button"
          onClick={handlePreview}
          disabled={isLoading || !githubUrl || !urlValidation.isValid}
          size="small"
          buttonStyle="secondary"
        >
          {isLoading ? 'Loading...' : 'Preview Data'}
        </Button>
        
        <Button
          type="button"
          onClick={handleSync}
          disabled={isLoading || !githubUrl || !projectId || !urlValidation.isValid}
          size="small"
          buttonStyle="primary"
        >
          {isLoading ? 'Syncing...' : !projectId ? 'Save Project First' : 'Sync from GitHub'}
        </Button>
      </div>

      {syncStatus === 'success' && (
        <div style={{ 
          marginBottom: '12px',
          padding: '8px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          color: '#155724',
          fontSize: '13px'
        }}>
          <strong>✅ Success!</strong> GitHub data synced! {lastSync && `(${lastSync})`}
          <br />
          <small>Page will refresh to show updated data...</small>
        </div>
      )}

      {syncStatus === 'error' && errorMessage && (
        <div style={{ 
          marginBottom: '12px',
          padding: '8px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24',
          fontSize: '13px'
        }}>
          <strong>❌ Error:</strong> {errorMessage}
        </div>
      )}

      <details style={{ fontSize: '12px', color: '#666' }}>
        <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
          What gets synced from GitHub
        </summary>
        <ul style={{ margin: '0', paddingLeft: '16px', lineHeight: '1.4' }}>
          <li>Repository stats (stars, forks, watchers, issues)</li>
          <li>Programming languages and tech stack</li>
          <li>Contributors and commit count</li>
          <li>File/directory counts and repository size</li>
          <li>Latest release information</li>
          <li>Repository metadata (license, topics, etc.)</li>
        </ul>
        <p style={{ fontSize: '11px', color: '#999', margin: '8px 0 0 0' }}>
          <strong>Note:</strong> GitHub API has rate limits. Use sparingly.
        </p>
      </details>
    </div>
  )
}

export default GitHubSyncComponent