'use client'

// Text that rises into view line by line through masks (GSAP SplitText), the
// same reveal the story overlay uses. Server HTML stays plain text: on the first
// page load an above-the-fold heading is left as is (no flash), and the reveal
// plays on client navigations and when the text scrolls into view later.
// GSAP is imported only when a reveal will actually play, so pages don't pay
// for it up front.

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { isFirstLoad } from '@/lib/navigationState'
import { DURATION, EASE_OUT_EXPO, STAGGER } from '@/lib/motion'

const ease = `cubic-bezier(${EASE_OUT_EXPO.join(',')})`

function inViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect()
  return rect.top < window.innerHeight && rect.bottom > 0
}

export function MaskedLines({ as = 'div', children, className, delay = 0 }: {
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span'
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  // One element type for the ref; the tag only changes semantics, not behaviour.
  const Tag = as as 'div'

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (isFirstLoad() && inViewport(el)) return

    // Hide until GSAP has split the lines (it arrives a moment later).
    el.style.visibility = 'hidden'
    let cancelled = false
    let observer: IntersectionObserver | null = null
    let revert: (() => void) | null = null

    Promise.all([import('gsap'), import('gsap/SplitText')])
      .then(([{ gsap }, { SplitText }]) => {
        if (cancelled) return
        gsap.registerPlugin(SplitText)
        const ctx = gsap.context(() => {
          SplitText.create(el, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit(self) {
              gsap.set(self.lines, { yPercent: 110 })
              el.style.visibility = ''
              const play = () =>
                gsap.to(self.lines, { yPercent: 0, duration: DURATION.slow, ease, stagger: STAGGER * 1.5, delay })
              if (inViewport(el)) return play()
              observer?.disconnect()
              observer = new IntersectionObserver((entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                  observer?.disconnect()
                  play()
                }
              }, { rootMargin: '0px 0px -10% 0px' })
              observer.observe(el)
            },
          })
        }, el)
        revert = () => ctx.revert()
      })
      .catch(() => {
        el.style.visibility = ''
      })

    return () => {
      cancelled = true
      observer?.disconnect()
      revert?.()
      el.style.visibility = ''
    }
  }, [delay])

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
