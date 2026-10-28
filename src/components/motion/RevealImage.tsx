'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { DURATION, EASE_OUT_EXPO } from '@/lib/motion'
import { cn } from '@/utilities/ui'

/** Uncovers an image (or any media) with a clip-path wipe as it scrolls into view. */
export function RevealImage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={cn('overflow-hidden', className)}
      initial={{ clipPath: 'inset(12% 8% 12% 8% round 6px)', opacity: 0.4 }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 6px)', opacity: 1 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: DURATION.slow, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  )
}
