// Which version of the story a visitor gets, and how a beat maps to its URL slug.
// Kept free of three.js, so calm mode never downloads the 3D code.

export type StoryView = 'flight' | 'calm' | 'timeline'

const VIEWS: readonly StoryView[] = ['flight', 'calm', 'timeline']
const STORAGE_KEY = 'story-view'

export interface ViewInputs {
  /** ?view= on the URL. */
  requested: string | null
  /** The visitor's own earlier choice. */
  stored: string | null
  reducedMotion: boolean
  canFly: boolean
}

export function isStoryView(value: string | null): value is StoryView {
  return !!value && (VIEWS as readonly string[]).includes(value)
}

/** An explicit choice wins, so a visitor can opt in to the flight, unless the device can't run it. */
export function chooseView({ requested, stored, reducedMotion, canFly }: ViewInputs): StoryView {
  const explicit = isStoryView(requested) ? requested : isStoryView(stored) ? stored : null
  if (explicit && (explicit !== 'flight' || canFly)) return explicit
  return reducedMotion || !canFly ? 'calm' : 'flight'
}

export function readStoredView(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function storeView(view: StoryView): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, view)
  } catch {
    // Private windows may block storage. The choice still holds for this visit.
  }
}

/** Beat id → URL slug: drop the legacy "-section"/"-wrapper" suffixes. */
export function slugFor(id: string): string {
  return id.replace(/-wrapper$/, '').replace(/-section$/, '')
}
