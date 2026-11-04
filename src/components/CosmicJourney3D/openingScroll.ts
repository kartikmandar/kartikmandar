// The page splits into the opening (a star's life, the visitor's choice of
// path), a short hand-off band where the remnant gives way to the night sky,
// then the flight through the beats. The band keeps the camera resting at the
// origin, so the first beat never plays under the opening.
export const OPENING_FRACTION = 0.235
export const HANDOFF_BAND = 0.025

/** Global scroll fraction where the flight starts: the end of the hand-off band. */
export function flightStart(openingFraction: number = OPENING_FRACTION, band: number = HANDOFF_BAND): number {
  return Math.min(1, openingFraction + band)
}

// global scroll fraction (0..1 over the whole page) for a flight-space fraction (0..1 over the beats)
export function flightFractionToGlobal(
  fraction: number,
  openingFraction: number = OPENING_FRACTION,
  band: number = HANDOFF_BAND,
): number {
  const f = Math.max(0, Math.min(1, fraction))
  const start = flightStart(openingFraction, band)
  return start + (1 - start) * f
}

// total page scroll height (vh) given the flight's vh, after reserving the opening and hand-off
export function pageScrollVh(
  totalFlightVh: number,
  openingFraction: number = OPENING_FRACTION,
  band: number = HANDOFF_BAND,
): number {
  return totalFlightVh / (1 - flightStart(openingFraction, band))
}

export interface Split {
  /** True before the flight starts (the opening and the hand-off band). */
  inOpening: boolean
  /** 0..1 over the opening, before the band. */
  openingProgress: number
  /** 0..1 across the hand-off band. */
  handoff: number
  flightProgress: number
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

export function splitProgress(
  global: number,
  fraction: number = OPENING_FRACTION,
  band: number = HANDOFF_BAND,
): Split {
  const g = clamp01(global)
  const openingProgress = fraction > 0 ? clamp01(g / fraction) : 1
  const start = flightStart(fraction, band)
  const flightProgress = start < 1 ? clamp01((g - start) / (1 - start)) : 0
  const handoff = band > 0 ? clamp01((g - fraction) / band) : g >= fraction ? 1 : 0
  return { inOpening: g < start, openingProgress, handoff, flightProgress }
}
