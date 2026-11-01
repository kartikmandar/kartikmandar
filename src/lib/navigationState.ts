// Tells entrance animations whether this render is the first page load (where
// the server HTML is already on screen, so replaying it would flash) or a
// client-side navigation (where the page arrives fresh and should animate).
// It compares routes rather than relying on effect order, because parts of the
// page can hydrate after the route template's effects have already run.
const landingPath = typeof window === 'undefined' ? null : window.location.pathname
let navigated = false

export function isFirstLoad(pathname?: string): boolean {
  if (landingPath === null) return true
  return !navigated && (pathname ?? window.location.pathname) === landingPath
}

/** Records the route on screen; leaving the landing route ends the first load for good. */
export function noteRoute(pathname: string): void {
  if (landingPath !== null && pathname !== landingPath) navigated = true
}
