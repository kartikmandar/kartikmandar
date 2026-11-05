// src/components/CosmicJourney3D/art/anim.ts
// Allocation-free scalar helpers for choreographing a beat from its local progress.

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/** Linear 0..1 ramp of `x` across [a, b]. */
export const ramp = (x: number, a: number, b: number) => clamp01((x - a) / (b - a || 1))

/** Smootherstep 0..1 across [a, b]: zero slope at both ends. */
export const ease = (x: number, a: number, b: number) => {
  const t = ramp(x, a, b)
  return t * t * t * (t * (t * 6 - 15) + 10)
}

export const easeInCubic = (t: number) => t * t * t
export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

/** A rise-then-fall pulse: 0 at a, 1 at the midpoint, 0 at b. */
export const pulse = (x: number, a: number, b: number) => Math.sin(Math.PI * ramp(x, a, b))

/** Deterministic hash in [0, 1) for (index, channel). Stable across reloads and captures. */
export function seeded(i: number, channel: number): number {
  const n = Math.sin((i + 1) * 12.9898 + channel * 78.233) * 43758.5453
  return n - Math.floor(n)
}

/** The shortest a bright change may take (photosensitivity, stellar opening spec §10): an exposure ramp, never a flash. */
export const EXPOSURE_RAMP_SECONDS = 0.3

/**
 * Moves `current` toward `target` by at most `span` per EXPOSURE_RAMP_SECONDS,
 * so a brightness driven by the scroll still ramps however fast the visitor
 * scrolls. Snaps when `current` is NaN (nothing drawn yet) or `dt` isn't positive.
 */
export function limitRamp(current: number, target: number, dt: number, span = 1): number {
  if (Number.isNaN(current) || !(dt > 0)) return target
  const step = (span * dt) / EXPOSURE_RAMP_SECONDS
  return target > current ? Math.min(target, current + step) : Math.max(target, current - step)
}
