'use client'

import { useEffect } from 'react'

export function ExternalLinkHandler(): null {
  useEffect(() => {
    const handleExternalLinks = (): void => {
      const links = document.querySelectorAll('a[href]')
      
      links.forEach((link) => {
        const href = link.getAttribute('href')
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          // Check if it's not already set to avoid overriding existing settings
          if (!link.getAttribute('target')) {
            link.setAttribute('target', '_blank')
          }
          if (!link.getAttribute('rel')) {
            link.setAttribute('rel', 'noopener noreferrer')
          }
        }
      })
    }

    // Run immediately
    handleExternalLinks()

    // Run when new content is added to the page
    const observer = new MutationObserver(() => {
      handleExternalLinks()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}