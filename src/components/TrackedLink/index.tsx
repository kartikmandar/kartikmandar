'use client'

import type { ReactNode } from 'react'
import { getPosthog } from '@/components/PostHogProvider'
import type { LinkCategory } from '@/data/links'

type Props = {
  id: string
  category: LinkCategory
  href: string
  src?: string | null
  className?: string
  children: ReactNode
}

export function TrackedLink({ id, category, href, src, className, children }: Props) {
  const handleTrack = () => {
    const posthog = getPosthog()
    if (!posthog) return
    posthog.capture('link_click', {
      id,
      category,
      dest: id,
      href,
      src: src ?? null,
    })
  }

  const isExternal = /^(https?:|mailto:|tel:)/.test(href)

  return (
    <a
      href={href}
      target={isExternal && !href.startsWith('mailto:') && !href.startsWith('tel:') ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      onMouseDown={handleTrack}
      onTouchStart={handleTrack}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleTrack()
      }}
      className={className}
      data-link-id={id}
    >
      {children}
    </a>
  )
}
