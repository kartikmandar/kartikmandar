'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { isStoryFlight } from '@/lib/motion'

/** Renders its children everywhere except inside the story flight. */
export function HideInJourney({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (isStoryFlight(pathname)) return null
  return <>{children}</>
}

/** Static film grain over the site; the story grains in its own post stack. */
export function SiteGrain() {
  return (
    <HideInJourney>
      <div aria-hidden className="site-grain" />
    </HideInJourney>
  )
}
