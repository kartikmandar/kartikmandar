export const PROLOGUE_FRACTION = 0.22
export const CROSSFADE_BAND = 0.04

// global scroll fraction (0..1 over the whole page) for a flight-space fraction (0..1 over the 21 beats)
export function flightFractionToGlobal(fraction: number, prologueFraction: number = PROLOGUE_FRACTION): number {
  const f = Math.max(0, Math.min(1, fraction))
  return prologueFraction + (1 - prologueFraction) * f
}

// total page scroll height (vh) given the flight's vh, after reserving the prologue fraction
export function pageScrollVh(totalFlightVh: number, prologueFraction: number = PROLOGUE_FRACTION): number {
  return totalFlightVh / (1 - prologueFraction)
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
  const flightProgress = fraction < 1 ? clamp01((g - fraction) / (1 - fraction)) : 0
  // crossfade ramps 0->1 across [fraction-band, fraction+band]
  const crossfade = clamp01((g - (fraction - band)) / (2 * band))
  return { inPrologue: g < fraction, prologueProgress, flightProgress, crossfade }
}
