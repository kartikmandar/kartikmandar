export const PROLOGUE_FRACTION = 0.22
export const CROSSFADE_BAND = 0.04

// The flight starts only once the prologue has fully dissolved (the end of the
// crossfade band). During the band the camera rests at the origin, so the first
// beat never plays under the prologue, however short its scroll range.
export function flightStart(prologueFraction: number = PROLOGUE_FRACTION, band: number = CROSSFADE_BAND): number {
  return Math.min(1, prologueFraction + band)
}

// global scroll fraction (0..1 over the whole page) for a flight-space fraction (0..1 over the beats)
export function flightFractionToGlobal(
  fraction: number,
  prologueFraction: number = PROLOGUE_FRACTION,
  band: number = CROSSFADE_BAND,
): number {
  const f = Math.max(0, Math.min(1, fraction))
  const start = flightStart(prologueFraction, band)
  return start + (1 - start) * f
}

// total page scroll height (vh) given the flight's vh, after reserving the prologue and hand-off
export function pageScrollVh(
  totalFlightVh: number,
  prologueFraction: number = PROLOGUE_FRACTION,
  band: number = CROSSFADE_BAND,
): number {
  return totalFlightVh / (1 - flightStart(prologueFraction, band))
}

export interface Split {
  inPrologue: boolean
  prologueProgress: number
  flightProgress: number
  crossfade: number
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

export function splitProgress(
  global: number,
  fraction: number = PROLOGUE_FRACTION,
  band: number = CROSSFADE_BAND,
): Split {
  const g = clamp01(global)
  const prologueProgress = fraction > 0 ? clamp01(g / fraction) : 1
  const start = flightStart(fraction, band)
  const flightProgress = start < 1 ? clamp01((g - start) / (1 - start)) : 0
  // crossfade ramps 0->1 across [fraction-band, fraction+band]
  const crossfade = clamp01((g - (fraction - band)) / (2 * band))
  return { inPrologue: g < fraction, prologueProgress, flightProgress, crossfade }
}
