'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { DURATION, EASE_OUT_EXPO, STAGGER } from '@/lib/motion'

const rise = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT_EXPO } },
}

/** Fades and lifts its content in the first time it scrolls into view. */
export function Reveal({ children, delay = 0, ...props }: { children: ReactNode; delay?: number } & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={rise}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/** A group whose StaggerItem children reveal one after another. */
export function Stagger({ children, ...props }: { children: ReactNode } & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: STAGGER } } }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, ...props }: { children: ReactNode } & HTMLMotionProps<'div'>) {
  return (
    <motion.div variants={rise} {...props}>
      {children}
    </motion.div>
  )
}
