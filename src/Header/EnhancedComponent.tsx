import { HeaderClient } from './Component.client'
import { SpotlightTerminal } from '@/components/SpotlightTerminal'
import { NAVIGATION_ITEMS } from '@/constants/navigation'
import { getAllPosts } from '@/lib/posts'
import { getPublishedProjects } from '@/data/projects'
import { getTalks } from '@/data/talks'
import React from 'react'

export function EnhancedHeader() {
  const navItems = NAVIGATION_ITEMS.map(item => ({ link: item }))

  // Build static content for SpotlightTerminal
  const posts = getAllPosts().map(p => ({ title: p.title, slug: p.slug, publishedAt: p.publishedAt || undefined }))
  const projects = getPublishedProjects().map(p => ({ title: p.title, slug: p.slug || '' }))
  const talks = getTalks().map(t => ({ title: t.title, slug: t.slug || '' }))

  return (
    <>
      {/* Spotlight Terminal - New primary navigation */}
      <SpotlightTerminal navItems={navItems} content={{ posts, projects, talks }} />

      {/* Original Header - Keep as fallback/alternative navigation */}
      <HeaderClient data={{ navItems }} />
    </>
  )
}
