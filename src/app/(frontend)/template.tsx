'use client'

// Route transitions: each new page rises and fades in (about 400 ms, quicker on
// the long scanned pages). The first page load is left alone, since its server
// HTML is already on screen, and the story pages keep their own entrance.

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { EASE_OUT_EXPO, ROUTE_TRANSITION, isQuickRoute, skipsRouteTransition } from '@/lib/motion'
import { isFirstLoad, noteRoute } from '@/lib/navigationState'

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [animate] = useState(() => !isFirstLoad(pathname) && !skipsRouteTransition(pathname))

  useEffect(() => {
    noteRoute(pathname)
  }, [pathname])

  if (!animate) return <>{children}</>

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0, transitionEnd: { transform: 'none' } }}
      transition={{ duration: isQuickRoute(pathname) ? ROUTE_TRANSITION.quick : ROUTE_TRANSITION.default, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  )
}
