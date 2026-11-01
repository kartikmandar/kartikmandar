// Rules for when the WebGL flight gives way to the HTML article.

/** Software rasterizers can't run the flight at a usable frame rate. */
export function isSoftwareRenderer(renderer: string | null): boolean {
  if (!renderer) return false
  return /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i.test(renderer)
}

/** How long a lost WebGL context gets to come back before the article takes over. */
export const CONTEXT_RESTORE_TIMEOUT_MS = 4000

/** A context lost this many times in one visit won't hold, so stop trying. */
export const MAX_CONTEXT_LOSSES = 3

export function shouldAbandonAfterLoss(lossCount: number): boolean {
  return lossCount >= MAX_CONTEXT_LOSSES
}
