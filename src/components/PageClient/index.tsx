'use client'
import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { scrollPageTo } from '@/providers/SmoothScroll'

const PageClient: React.FC = () => {
  const pathname = usePathname()

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
          const element = document.querySelector<HTMLElement>(hash)
          if (element) scrollPageTo(element, { offset: -88 })
        }, 1500) // Give time for CosmicJourney to fully load

        return () => clearTimeout(timeoutId)
      }
      // For normal reloads without hash, let browser handle scroll restoration naturally
    }
  }, [pathname])

  return <React.Fragment />
}

export default PageClient
