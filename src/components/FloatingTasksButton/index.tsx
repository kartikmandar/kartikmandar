'use client'

import React from 'react'
import { Target, Home } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

export const FloatingTasksButton: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  
  const isTasksPage = pathname === '/tasks'
  const icon = isTasksPage ? Home : Target
  const label = isTasksPage ? 'Go to Home' : 'Go to Tasks'
  const destination = isTasksPage ? '/' : '/tasks'

  const handleClick = () => {
    router.push(destination)
  }

  const Icon = icon

  return (
    <div className="fixed left-5 top-4 z-50 md:right-5 md:left-auto">
      <button
        onClick={handleClick}
        aria-label={label}
        style={{
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: '12px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = ''
        }}
        className="group relative flex items-center justify-center w-12 h-12 bg-black/20 backdrop-blur-md border border-white/10 text-white/90 hover:text-white hover:bg-black/30 hover:border-white/20 shadow-2xl"
      >
        <Icon size={24} strokeWidth={2.2} />
      </button>
    </div>
  )
}