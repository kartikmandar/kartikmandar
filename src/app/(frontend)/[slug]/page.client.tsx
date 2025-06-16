'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const PageClient: React.FC = () => {
  /* Force the header to be dark mode while we have an image behind it */
  const { setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  useEffect(() => {
    // Always ensure scroll restoration is enabled
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'auto'
    }

    // On homepage, only handle hash fragments with delay - let normal scroll restoration work
    if (pathname === '/') {
      const hash = window.location.hash
      
      if (hash) {
        // Only for hash fragments, delay to prevent CosmicJourney interference
        const timeoutId = setTimeout(() => {
          const element = document.querySelector(hash)
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            })
          }
        }, 1500) // Give time for CosmicJourney to fully load
        
        return () => clearTimeout(timeoutId)
      }
      // For normal reloads without hash, let browser handle scroll restoration naturally
    }
  }, [pathname])

  return <React.Fragment />
}

export default PageClient
