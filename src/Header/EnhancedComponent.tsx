import { LazyCommand, LazyMenu } from '@/components/SiteChrome/LazyOverlays'
import { TopBar } from '@/components/SiteChrome/TopBar'
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
      {/* Slim top bar: name, search (Cmd-K) and the fullscreen menu */}
      <TopBar />
      <LazyMenu />

      {/* Cmd-K: the terminal, opened from the top bar or the shortcut */}
      <LazyCommand navItems={navItems} content={{ posts, projects, talks }} />
    </>
  )
}
