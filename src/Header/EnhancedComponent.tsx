import { HeaderClient } from './Component.client'
import { SpotlightTerminal } from '@/components/SpotlightTerminal'
import React from 'react'

export function EnhancedHeader() {
  // Define your static nav items here
  const navItems = [
    { link: { label: 'Home', url: '/' } },
    { link: { label: 'CV', url: '/cv' } },
    { link: { label: 'Publications', url: '/publications' } },
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