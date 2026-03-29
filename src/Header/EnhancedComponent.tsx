import { HeaderClient } from './Component.client'
import { SpotlightTerminal } from '@/components/SpotlightTerminal'
import { NAVIGATION_ITEMS } from '@/constants/navigation'
import React from 'react'

export function EnhancedHeader() {
  // Use shared navigation items
  const navItems = NAVIGATION_ITEMS.map(item => ({ link: item }))

  return (
    <>
      {/* Spotlight Terminal - New primary navigation */}
      <SpotlightTerminal navItems={navItems} />
      
      {/* Original Header - Keep as fallback/alternative navigation */}
      <HeaderClient data={{ navItems }} />
    </>
  )
}