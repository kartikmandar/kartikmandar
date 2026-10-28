'use client'

// The fullscreen menu: the site in big serif type, grouped the way a visitor
// thinks about the work. It wipes down over the page, staggers its links in,
// traps focus, closes on Esc or navigation, and holds the page scroll still.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef } from 'react'
import { Magnetic } from '@/components/motion'
import { CONTACT_EMAIL, NAV_GROUPS, SOCIAL_LINKS, isActiveUrl } from '@/constants/navigation'
import { DURATION, EASE_IN_OUT, EASE_OUT_EXPO, STAGGER } from '@/lib/motion'
import { lockScroll } from '@/lib/scrollLock'
import { useChromeStore } from './chromeStore'
import { useFocusTrap } from './useFocusTrap'

const panel = {
  closed: { clipPath: 'inset(0% 0% 100% 0%)' },
  open: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.8, ease: EASE_IN_OUT } },
  exit: { clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: 0.55, ease: EASE_IN_OUT, delay: 0.1 } },
}

const list = {
  closed: {},
  open: { transition: { staggerChildren: STAGGER, delayChildren: 0.32 } },
  exit: { transition: { staggerChildren: STAGGER / 2, staggerDirection: -1 } },
}

const line = {
  closed: { y: '110%' },
  open: { y: '0%', transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO } },
  exit: { y: '110%', transition: { duration: DURATION.fast, ease: EASE_IN_OUT } },
}

const fade = {
  closed: { opacity: 0 },
  open: { opacity: 1, transition: { duration: DURATION.base, delay: 0.6 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export function MenuOverlay() {
  const pathname = usePathname()
  const open = useChromeStore((state) => state.overlay === 'menu')
  const close = useChromeStore((state) => state.close)
  const containerRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const onEscape = useCallback(() => close(), [close])
  useFocusTrap(containerRef, open, onEscape, closeRef)

  useEffect(() => {
    if (!open) return
    return lockScroll()
  }, [open])

  // A navigation (link, back button, Cmd-K) always closes the menu.
  // (It mounts lazily on first open, so only a change from the mount path counts.)
  const openedOn = useRef(pathname)
  useEffect(() => {
    if (pathname === openedOn.current) return
    openedOn.current = pathname
    if (useChromeStore.getState().overlay === 'menu') close()
  }, [pathname, close])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={containerRef}
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          data-lenis-prevent
          className="fixed inset-0 z-[var(--z-menu)] overflow-y-auto bg-background-deep/[0.97] backdrop-blur-xl"
          variants={panel}
          initial="closed"
          animate="open"
          exit="exit"
        >
          <div className="flex min-h-full flex-col px-4 md:px-8">
            <div className="flex h-16 items-center justify-between md:h-20">
              <Link href="/" className="font-display text-[1.65rem] leading-none text-foreground md:text-[1.9rem]" onClick={close}>
                Kartik Mandar
              </Link>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="glass flex h-10 items-center gap-3 rounded-full pl-4 pr-3 text-foreground transition-colors hover:text-ember"
                aria-label="Close menu"
              >
                <span className="mono-label">Close</span>
                <span aria-hidden className="relative block h-3 w-4">
                  <span className="absolute left-0 top-1/2 h-px w-4 rotate-45 bg-current" />
                  <span className="absolute left-0 top-1/2 h-px w-4 -rotate-45 bg-current" />
                </span>
              </button>
            </div>

            <nav aria-label="Primary" className="flex-1 py-10 md:py-14">
              <motion.ul
                className="grid gap-x-10 gap-y-10 md:grid-cols-2 xl:grid-cols-3"
                variants={list}
              >
                {NAV_GROUPS.map((group) => (
                  <li key={group.label}>
                    <motion.p variants={fade} className="mono-label mb-3 text-muted-foreground">
                      {group.label}
                    </motion.p>
                    <ul>
                      {group.items.map((item) => {
                        const active = isActiveUrl(pathname, item.url)
                        return (
                          <li key={item.url} className="overflow-hidden">
                            <motion.div variants={line}>
                              <Link
                                href={item.url}
                                onClick={close}
                                aria-current={active ? 'page' : undefined}
                                className="group flex items-baseline gap-3 py-0.5 font-display text-display-md text-foreground/90 transition-colors duration-300 hover:text-foreground"
                              >
                                <span className="inline-block transition-transform duration-500 ease-out-expo group-hover:translate-x-2">
                                  {item.label}
                                </span>
                                {active && <span aria-hidden className="size-2 translate-y-[-0.4em] rounded-full bg-ember" />}
                              </Link>
                            </motion.div>
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                ))}
              </motion.ul>
            </nav>

            <motion.div
              variants={fade}
              className="flex flex-col gap-5 border-t border-border py-6 md:flex-row md:items-center md:justify-between"
            >
              <Magnetic>
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-display text-2xl text-foreground transition-colors hover:text-ember">
                  {CONTACT_EMAIL}
                </a>
              </Magnetic>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {SOCIAL_LINKS.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono-label text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
