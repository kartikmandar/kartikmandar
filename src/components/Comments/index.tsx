'use client'

import React, { useEffect, useRef, useState } from 'react'
import Giscus from '@giscus/react'
import { useTheme } from '@/providers/Theme'

interface CommentsProps {
  /**
   * The title for the discussion (used for display only)
   */
  title: string
  /**
   * Optional className for styling
   */
  className?: string
}

export function Comments({ title: _title, className = '' }: CommentsProps): React.JSX.Element {
  const commentsRef = useRef<HTMLDivElement>(null)
  const [giscusTheme, setGiscusTheme] = useState<string>('light')
  const [mounted, setMounted] = useState(false)

  // Get theme from useTheme hook safely
  let theme: string = 'light'
  try {
    const themeContext = useTheme()
    theme = themeContext?.theme || 'light'
  } catch (error) {
    console.log('Theme context not available:', error)
    theme = 'light'
  }

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update giscus theme when custom theme changes
  useEffect(() => {
    const currentTheme = theme === 'dark' ? 'dark' : 'light'
    setGiscusTheme(currentTheme)

    const updateGiscusTheme = () => {
      const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage({
            giscus: {
              setConfig: {
                theme: currentTheme
              }
            }
          }, 'https://giscus.app')
        } catch (error) {
          console.log('Giscus theme update failed:', error)
        }
      }
    }

    // Wait for iframe to be available
    const waitForIframe = () => {
      const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
      if (iframe && iframe.contentWindow) {
        updateGiscusTheme()
      } else {
        // Check again in 500ms
        setTimeout(waitForIframe, 500)
      }
    }

    // Start checking immediately
    waitForIframe()
  }, [theme])

  useEffect(() => {
    // Scroll to comments section when component mounts
    const scrollToComments = () => {
      if (commentsRef.current && window.location.hash === '#comments') {
        commentsRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }

    // Check if user navigated to comments
    scrollToComments()

    // Listen for hash changes
    const handleHashChange = () => {
      scrollToComments()
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Don't render until mounted (prevents SSR issues)
  if (!mounted) {
    return (
      <div
        ref={commentsRef}
        id="comments"
        className={`w-full max-w-4xl mx-auto px-4 py-8 ${className}`}
      >
        <div className="border-t border-border pt-8">
          <div className="h-32 bg-muted/20 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Loading comments...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={commentsRef}
      id="comments"
      className={`w-full max-w-4xl mx-auto px-4 py-8 ${className}`}
    >
      <div className="border-t border-border pt-8">
        <Giscus
          id="comments"
          repo="kartikmandar/kartikmandar"
          repoId="R_kgDOOgAO2g"
          category="Website Comments"
          categoryId="DIC_kwDOOgAO2s4CtCNd"
          mapping="pathname"
          strict="1"
          reactionsEnabled="1"
          emitMetadata="1"
          inputPosition="top"
          theme={giscusTheme}
          lang="en"
          loading="lazy"
          key={`giscus-${giscusTheme}`} // Force complete re-render when theme changes
        />
      </div>
    </div>
  )
}

export default Comments