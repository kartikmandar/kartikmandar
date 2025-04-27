import { HeaderClient } from './Component.client'
import React from 'react'

export function Header() {
  // Define your static nav items here
  const navItems = [
    { link: { label: 'Home', url: '/' } },
    { link: { label: 'Posts', url: '/posts' } },
    { link: { label: 'About', url: '/about' } },
    // Add more as needed
  ]

  return <HeaderClient data={{ navItems }} />
}
