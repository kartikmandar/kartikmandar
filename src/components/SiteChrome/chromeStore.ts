// Which site overlay is open. Only one at a time: opening Cmd-K closes the menu.
import { create } from 'zustand'

export type ChromeOverlay = 'menu' | 'command' | null

interface ChromeState {
  overlay: ChromeOverlay
  open: (overlay: Exclude<ChromeOverlay, null>) => void
  toggle: (overlay: Exclude<ChromeOverlay, null>) => void
  close: () => void
}

export const useChromeStore = create<ChromeState>((set) => ({
  overlay: null,
  open: (overlay) => set({ overlay }),
  toggle: (overlay) => set((state) => ({ overlay: state.overlay === overlay ? null : overlay })),
  close: () => set({ overlay: null }),
}))
