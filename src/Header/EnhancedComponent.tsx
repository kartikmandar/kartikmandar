import { HeaderClient } from './Component.client'
import { SpotlightTerminal } from '@/components/SpotlightTerminal'
import React from 'react'

export function EnhancedHeader() {
  // Define your static nav items here
  const navItems = [
    { link: { label: 'Home', url: '/' } },
    { link: { label: 'CV', url: '/404' } },
    { link: { label: 'Projects', url: '/#my-projects' } },
    { link: { label: 'GSoC 2024', url: '/404' } },
    { link: { label: 'GSoC 2025', url: '/404' } },
    { link: { label: 'Talks', url: '/404' } },
    { link: { label: 'Publications', url: '/404' } },
    { link: { label: 'Hobbies', url: '/404' } },
    { link: { label: 'Certificates', url: '/404' } },
    { link: { label: 'Journal Club', url: '/404' } },
    { link: { label: 'Courses', url: '/404' } },
    { link: { label: 'Common Resources', url: '/common-resources' } },
    { link: { label: 'Posts', url: '/posts' } },
  ]

  return (
    <>
      {/* Spotlight Terminal - New primary navigation */}
      <SpotlightTerminal navItems={navItems} />
      
      {/* Original Header - Keep as fallback/alternative navigation */}
      <HeaderClient data={{ navItems }} />
    </>
  )
}