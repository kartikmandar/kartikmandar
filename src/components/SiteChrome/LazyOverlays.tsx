'use client'

// The menu and the Cmd-K terminal are only downloaded the first time they are
// opened, so they cost nothing on first load. The shortcut lives here (always
// loaded); the terminal itself only handles Escape and its own input.

import dynamic from 'next/dynamic'
import { useEffect, useState, type ComponentProps } from 'react'
import type { SpotlightTerminal as SpotlightTerminalType } from '@/components/SpotlightTerminal'
import { useChromeStore } from './chromeStore'

const MenuOverlay = dynamic(() => import('./MenuOverlay').then((m) => m.MenuOverlay), { ssr: false })
const SpotlightTerminal = dynamic(() => import('@/components/SpotlightTerminal').then((m) => m.SpotlightTerminal), { ssr: false })

/** True once `overlay` has been opened at least once (it then stays mounted for its exit animation). */
function useOpenedOnce(overlay: 'menu' | 'command'): boolean {
  const open = useChromeStore((state) => state.overlay === overlay)
  const [opened, setOpened] = useState(false)
  if (open && !opened) setOpened(true)
  return opened
}

export function LazyMenu() {
  return useOpenedOnce('menu') ? <MenuOverlay /> : null
}

export function LazyCommand(props: ComponentProps<typeof SpotlightTerminalType>) {
  const toggle = useChromeStore((state) => state.toggle)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        toggle('command')
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [toggle])

  return useOpenedOnce('command') ? <SpotlightTerminal {...props} /> : null
}
