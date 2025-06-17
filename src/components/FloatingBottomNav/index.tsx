'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, FileText, BookOpen, PenTool } from 'lucide-react'

interface NavItem {
  label: string
  url: string
  icon: React.ReactNode
}

interface FloatingBottomNavProps {
  navItems?: Array<{ link: { label: string; url: string } }>
}

export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({ navItems }) => {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = React.useState<boolean>(true)
  const [isInteracting, setIsInteracting] = React.useState<boolean>(false)
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Default navigation items with icons
  const defaultNavItems: NavItem[] = [
    {
      label: 'Home',
      url: '/',
      icon: <Home size={20} />
    },
    {
      label: 'CV', 
      url: '/cv',
      icon: <FileText size={20} />
    },
    {
      label: 'Publications',
      url: '/publications', 
      icon: <BookOpen size={20} />
    },
    {
      label: 'Posts',
      url: '/posts',
      icon: <PenTool size={20} />
    }
  ]

  // Convert navItems prop to our format if provided, otherwise use defaults
  const navigationItems: NavItem[] = navItems 
    ? navItems.slice(0, 4).map((item, index) => ({
        label: item.link.label,
        url: item.link.url,
        icon: defaultNavItems[index]?.icon || <Home size={20} />
      }))
    : defaultNavItems

  // Handle auto-hide based on scroll and interactions
  React.useEffect(() => {
    const startHideTimer = () => {
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      // Hide after 2 seconds of no scrolling (unless interacting)
      scrollTimeoutRef.current = setTimeout(() => {
        if (!isInteracting) {
          setIsVisible(false)
        }
      }, 2000)
    }

    const handleScroll = () => {
      // Show immediately on scroll
      setIsVisible(true)
      startHideTimer()
    }

    // Start timer when interaction ends
    if (!isInteracting) {
      startHideTimer()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [isInteracting])

  const isActiveRoute = (url: string): boolean => {
    if (url === '/') {
      return pathname === '/'
    }
    if (url.includes('#')) {
      return pathname === '/' && url.includes('my-projects')
    }
    return pathname.startsWith(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        y: isVisible ? 0 : 20 
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="hidden lg:block fixed bottom-7 left-0 right-0 mx-auto w-fit z-50"
    >
      <div 
        className="flex items-center gap-1 px-3 py-1.5 bg-black/20 backdrop-blur-md border border-white/10 rounded-full shadow-2xl h-12"
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={() => setIsInteracting(false)}
      >
        {navigationItems.map((item, index) => {
          const isActive = isActiveRoute(item.url)
          
          return (
            <Link
              key={index}
              href={item.url}
              className="group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 backdrop-blur-sm text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {item.label}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
              </div>
              
              <motion.div
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ 
                  scale: 1.2,
                  y: -2,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                }}
                whileTap={{ 
                  scale: 0.95,
                  transition: { type: "spring", stiffness: 600, damping: 30 }
                }}
              >
                <motion.div 
                  className={`transition-all duration-200 ${
                    isActive ? 'text-white' : 'text-white/60 group-hover:text-white/90'
                  }`}
                  whileHover={{ 
                    scale: 1.1,
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                >
                  {item.icon}
                </motion.div>
              </motion.div>
              
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}