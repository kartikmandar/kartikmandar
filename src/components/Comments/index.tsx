'use client'

import React, { useEffect, useRef, useSyncExternalStore } from 'react'
import { scrollPageTo } from '@/providers/SmoothScroll'

const subscribeNever = () => () => {}
import Giscus from '@giscus/react'

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
  // Client-only render (Giscus mounts an iframe); the server sends the placeholder.
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false)

  useEffect(() => {
    // Scroll to comments section when component mounts
    const scrollToComments = () => {
      if (commentsRef.current && window.location.hash === '#comments') {
        scrollPageTo(commentsRef.current, { offset: -88 })
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
          theme="dark"
          lang="en"
          loading="lazy"
        />
      </div>
    </div>
  )
}

export default Comments