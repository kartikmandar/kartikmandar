'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

declare global {
  interface Window {
    arxiv_authorid: string
    arxiv_format: string
    arxiv_max_entries: number
    arxiv_includeTitle: number
    arxiv_includeSummary: number
    arxiv_includeComments: number
    arxiv_includeSubjects: number
    arxiv_includeJournalRef: number
    arxiv_includeDOI: number
    arxiv_bg_color: string
    arxiv_border_color: string
    arxiv_entry_color: string
  }
}

const PageClient: React.FC = () => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  useEffect(() => {
    // Configure arXiv widget
    // Replace 'yourauthorid' with your actual arXiv author identifier
    // For example: '0000-0002-7970-7855' or 'mandar_k_1'
    window.arxiv_authorid = 'mandar_k_1'
    window.arxiv_format = 'arxiv' // Use 'arxiv' format for better integration
    window.arxiv_max_entries = 0 // Show all publications
    window.arxiv_includeTitle = 1
    window.arxiv_includeSummary = 1 // Show abstracts
    window.arxiv_includeComments = 1
    window.arxiv_includeSubjects = 1
    window.arxiv_includeJournalRef = 1
    window.arxiv_includeDOI = 1

    // Load the arXiv myarticles script
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://arxiv.org/js/myarticles.js'
    script.async = true
    
    // Handle script load error
    script.onerror = () => {
      const arxivfeed = document.getElementById('arxivfeed')
      if (arxivfeed) {
        arxivfeed.innerHTML = `
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p class="text-red-800 dark:text-red-200">
              Error loading publications. Please check if the author ID is configured correctly.
            </p>
          </div>
        `
      }
    }
    
    // Style and highlight after the widget loads
    script.onload = () => {
      // Wait a bit for the widget to render content
      setTimeout(() => {
        const arxivfeed = document.getElementById('arxivfeed')
        if (arxivfeed) {
          // Force style the titles/bold text
          const boldElements = arxivfeed.querySelectorAll('b, strong, .title, .arxivfeed-title')
          boldElements.forEach((element) => {
            const htmlElement = element as HTMLElement
            htmlElement.style.setProperty('font-weight', '700', 'important')
            htmlElement.style.setProperty('color', '#1f2937', 'important')
            htmlElement.style.setProperty('font-size', '1.1em', 'important')
          })
          
          // Highlight variations of your name
          const nameVariations = [
            'Kartik Mandar',
            'K. Mandar',
            'Mandar, K.',
            'Mandar, Kartik'
          ]
          
          nameVariations.forEach(name => {
            const walker = document.createTreeWalker(
              arxivfeed,
              NodeFilter.SHOW_TEXT,
              null
            )
            
            let node: Node | null
            const nodesToReplace: { node: Text; text: string }[] = []
            
            while ((node = walker.nextNode())) {
              const textNode = node as Text
              if (textNode.textContent && textNode.textContent.includes(name)) {
                nodesToReplace.push({
                  node: textNode,
                  text: textNode.textContent
                })
              }
            }
            
            nodesToReplace.forEach(({ node, text }) => {
              const highlightedText = text.replace(
                new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
                `<mark style="background-color: #fef3c7; color: #92400e; padding: 2px 4px; border-radius: 3px; font-weight: 600;">${name}</mark>`
              )
              
              if (highlightedText !== text) {
                const span = document.createElement('span')
                span.innerHTML = highlightedText
                node.parentNode?.replaceChild(span, node)
              }
            })
          })
        }
      }, 1000) // Wait 1 second for widget to load
    }
    
    document.head.appendChild(script)

    // Cleanup function
    return () => {
      const existingScript = document.querySelector('script[src="https://arxiv.org/js/myarticles.js"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            Publications
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            My research contributions in astrophysics.
          </p>
        </div>

        {/* ArXiv Publications Feed */}
        <div 
          id="arxivfeed" 
          className="min-h-[200px]"
          style={{
            width: '100%'
          }}
        >
          <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading publications...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Simple styling for arXiv widget */}
      <style jsx global>{`
        #arxivfeed a {
          color: #3b82f6 !important;
          text-decoration: underline !important;
        }
        
        #arxivfeed a:hover {
          color: #1d4ed8 !important;
        }
        
        /* More aggressive title styling */
        #arxivfeed b, #arxivfeed strong, 
        #arxivfeed .title, #arxivfeed .arxivfeed-title,
        div#arxivfeed b, div#arxivfeed strong {
          font-weight: 700 !important;
          color: #1f2937 !important;
          font-size: 1.1em !important;
        }
        
        /* Target any bold text in the feed more aggressively */
        div[id="arxivfeed"] * b,
        div[id="arxivfeed"] * strong {
          font-weight: 700 !important;
          color: #1f2937 !important;
          font-size: 1.1em !important;
        }
        
        /* Dark mode support for titles */
        @media (prefers-color-scheme: dark) {
          #arxivfeed b, #arxivfeed strong,
          #arxivfeed .title, #arxivfeed .arxivfeed-title,
          div#arxivfeed b, div#arxivfeed strong,
          div[id="arxivfeed"] * b,
          div[id="arxivfeed"] * strong {
            color: #f9fafb !important;
          }
        }
      `}</style>
    </div>
  )
}

export default PageClient