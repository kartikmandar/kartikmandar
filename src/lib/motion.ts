// The site's motion vocabulary. One easing family, three durations, one
// stagger, so every reveal, menu and route change moves the same way.
// CSS mirrors these as --ease-out-expo / --duration-* in globals.css.

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

export const DURATION = {
  fast: 0.3,
  base: 0.6,
  slow: 1.0,
} as const

export const STAGGER = 0.06

/** Route transition length in seconds; data-heavy routes get a quicker one. */
export const ROUTE_TRANSITION = {
  default: 0.4,
  quick: 0.25,
} as const

/**
 * The story flight: it runs its own scroll clock (its own Lenis), its own grain
 * and its own navigation, so the site chrome steps back there.
 */
export function isStoryFlight(pathname: string | null | undefined): boolean {
  return pathname === '/my-story'
}

/** Routes that should not animate in: the story pages own their entrance. */
export function skipsRouteTransition(pathname: string | null | undefined): boolean {
  return !!pathname && (pathname === '/my-story' || pathname.startsWith('/my-story/'))
}

/** Routes whose entrance should be quick (long, scanned pages). */
export function isQuickRoute(pathname: string | null | undefined): boolean {
  return pathname === '/cv' || pathname === '/publications'
}
