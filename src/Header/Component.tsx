import { HeaderClient } from './Component.client'
import React from 'react'

export function Header() {
  // Define your static nav items here
  const navItems = [
    { link: { label: 'Home', url: '/' } },
    { link: { label: 'CV', url: '/404' } },
    { link: { label: 'Projects', url: '/404' } },
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

  return <HeaderClient data={{ navItems }} />
}
