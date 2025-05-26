'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { cn } from '@/utilities/ui'

export const HeaderNav: React.FC<{ data: { navItems: { link: { label: string; url: string } }[] } }> = ({ data }) => {
  const navItems = data?.navItems || []
  const pathname = usePathname()

  return (
    <nav className="flex gap-3 items-center">
      {navItems.map(({ link }, i) => {
        const isActive = pathname === link.url || 
          (link.url !== '/' && pathname.startsWith(link.url))
        
        return (
          <CMSLink 
            key={i} 
            {...link} 
            appearance="link" 
            className={cn(
              'transition-colors',
              isActive ? 'text-primary font-semibold' : 'hover:text-primary'
            )}
          />
        )
      })}
      <Link 
        href="/search"
        className={cn(
          'transition-colors',
          pathname === '/search' ? 'text-primary' : 'hover:text-primary'
        )}
      >
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5" />
      </Link>
    </nav>
  )
}
