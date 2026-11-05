// src/components/CosmicJourney3D/starLook.ts
// How the young star looks for a given mass: its surface temperature on the
// main sequence, the colour of that temperature, and how big and bright it is
// drawn. Pure, so the choice's visuals can be tested without WebGL.

/** Rough zero-age main-sequence surface temperatures (K), interpolated in log mass. A young brown dwarf is about 2,800 K. */
const TEMPERATURES: readonly [mass: number, kelvin: number][] = [
  [0.02, 2200],
  [0.05, 2800],
  [0.08, 2700],
  [0.15, 3100],
  [0.5, 3800],
  [1, 5800],
  [2, 9000],
  [5, 15500],
  [15, 31000],
  [40, 42000],
  [250, 55000],
]

export function surfaceTemperature(mass: number): number {
  const first = TEMPERATURES[0]!
  const last = TEMPERATURES[TEMPERATURES.length - 1]!
  if (mass <= first[0]) return first[1]
  if (mass >= last[0]) return last[1]
  for (let i = 1; i < TEMPERATURES.length; i++) {
    const [m1, k1] = TEMPERATURES[i]!
    if (mass > m1) continue
    const [m0, k0] = TEMPERATURES[i - 1]!
    const t = (Math.log10(mass) - Math.log10(m0)) / (Math.log10(m1) - Math.log10(m0))
    return k0 + t * (k1 - k0)
  }
  return last[1]
}

/**
 * Approximate sRGB colour (0..1) of a blackbody at `kelvin`, after Tanner
 * Helland's fit to Mitchell Charity's table. Writes into `out` without allocating.
 */
export function blackbodyRgb(kelvin: number, out: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
  const t = Math.min(40000, Math.max(1000, kelvin)) / 100
  const clamp = (v: number) => Math.min(255, Math.max(0, v)) / 255
  out.r = t <= 66 ? 1 : clamp(329.698727446 * (t - 60) ** -0.1332047592)
  out.g = t <= 66 ? clamp(99.4708025861 * Math.log(t) - 161.1195681661) : clamp(288.1221695283 * (t - 60) ** -0.0755148492)
  out.b = t >= 66 ? 1 : t <= 19 ? 0 : clamp(138.5177312231 * Math.log(t - 10) - 305.0447927307)
  return out
}

/**
 * How large the star is drawn, relative to the Sun's 1. Real radii span far
 * more than a screen can show (a red dwarf is a fifth of the Sun, a 40 M☉ star
 * about ten times it), so the drawing keeps the order but compresses the range.
 */
export function drawnRadius(mass: number): number {
  return Math.min(2.6, Math.max(0.35, mass ** 0.3))
}

/**
 * How bright the star is drawn, relative to the Sun's 1, compressed like the
 * radius: luminosity really spans about ten orders of magnitude across the slider.
 */
export function drawnBrightness(mass: number): number {
  return Math.min(2.2, Math.max(0.25, mass ** 0.22))
}

/** How wide the disk is drawn, relative to the Sun's 1: disk size grows with the star's mass (a brown dwarf's is small). */
export function drawnDiskScale(mass: number): number {
  return Math.min(1.3, Math.max(0.55, 1 + 0.28 * Math.log10(mass)))
}

/** How fast the disk is drawn turning, relative to the Sun's 1: orbital speed at a given radius goes as the square root of the mass. */
export function drawnSpin(mass: number): number {
  return Math.min(3, Math.max(0.35, Math.sqrt(mass)))
}
