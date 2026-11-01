'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const TRAVEL_PX = 12

/** The portrait as a dark-to-ember duotone that drifts with the pointer (desktop only). */
export function Portrait() {
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const x = useSpring(pointerX, { stiffness: 60, damping: 18 })
  const y = useSpring(pointerY, { stiffness: 60, damping: 18 })

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onMove = (event: PointerEvent) => {
      pointerX.set((event.clientX / window.innerWidth - 0.5) * -2 * TRAVEL_PX)
      pointerY.set((event.clientY / window.innerHeight - 0.5) * -2 * TRAVEL_PX)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [pointerX, pointerY])

  return (
    <div className="relative isolate aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/10 bg-background-deep">
      <motion.div className="absolute -inset-4" style={{ x, y }}>
        <Image
          src="/kartik-mandar.jpeg"
          alt="Kartik Mandar"
          fill
          sizes="(max-width: 768px) 90vw, 40vw"
          className="object-cover object-top contrast-110 grayscale"
        />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-[oklch(0.86_0.09_62)] mix-blend-multiply" />
      <div aria-hidden className="absolute inset-0 bg-[oklch(0.2_0.04_265)] mix-blend-lighten" />
    </div>
  )
}
