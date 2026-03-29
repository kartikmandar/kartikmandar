import type { Redirect } from './types'

/**
 * Site redirects.
 * Generated from Payload CMS export on 2026-03-29.
 */
export const redirects: Redirect[] = [] as Redirect[]

/**
 * Find a redirect for a given URL path.
 */
export function getRedirectForUrl(url: string): Redirect | undefined {
  return redirects.find((r) => r.from === url)
}
