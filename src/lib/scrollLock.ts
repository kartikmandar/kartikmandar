// Overlays (the menu, Cmd-K, the cookie preferences) lock the page while open.
// Locks are counted, so two overlays can open and close in any order.
type Listener = (locked: boolean) => void

let count = 0
const listeners = new Set<Listener>()

function emit(): void {
  for (const listener of listeners) listener(count > 0)
}

/** Locks page scroll; returns the matching unlock (safe to call twice). */
export function lockScroll(): () => void {
  count += 1
  if (count === 1) emit()
  let released = false
  return () => {
    if (released) return
    released = true
    count = Math.max(0, count - 1)
    if (count === 0) emit()
  }
}

export function isScrollLocked(): boolean {
  return count > 0
}

export function onScrollLockChange(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
