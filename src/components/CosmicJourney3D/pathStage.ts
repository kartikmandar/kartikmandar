// src/components/CosmicJourney3D/pathStage.ts
// What each path's life and ending shows over the 720 vh path segment: pure, so
// the choreography can be tested without WebGL. Every path writes the same star
// state (its colour, glow, size, and what happens to its planets), which the
// opening's star, planets and disk follow; each path adds its own fields for the
// scenery only it has. Timed against the copy (§8): the segment's scroll is
// shared equally among the path's lines, as in openingLineIndex.

import { ease, pulse, ramp } from './art/anim'
import { segmentRange, type StarPathId } from './openingStory'
import { HANDOFF_ARRIVE } from './openingScroll'

export interface PathStarState {
  /** Surface temperature (K): the star's colour. */
  temperature: number
  /** Multiplier on the main-sequence star's glow brightness. */
  glow: number
  /** Multiplier on the main-sequence star's glow size. */
  glowSize: number
  /** Multiplier on the halo's opacity. */
  halo: number
  /** Radius of the star's visible surface, in the Sun's disk units (0: drawn as a point of light). */
  body: number
  /** 0..1 how much of that surface is still there. */
  bodyOpacity: number
  /** Orbits inside this radius have been swallowed. */
  engulf: number
  /** Multiplier on the surviving planets' orbits (they drift out as the star loses mass). */
  orbitScale: number
  /** 0..1 the leftover dust from the disk. */
  debris: number
}

const PATH = segmentRange('path')

/** Path progress (0..1 over the path segment) for opening progress (0..1). */
export function pathProgress(opening: number): number {
  return ramp(opening, PATH.start, PATH.end)
}

/** Writes the main-sequence star at `temperature`, unchanged: the state every path starts from. */
export function steadyStar(temperature: number, out: PathStarState): PathStarState {
  out.temperature = temperature
  out.glow = 1
  out.glowSize = 1
  out.halo = 1
  out.body = 0
  out.bodyOpacity = 0
  out.engulf = 0
  out.orbitScale = 1
  out.debris = 1
  return out
}

export function createPathStar(): PathStarState {
  return steadyStar(5800, {} as PathStarState)
}

// --- Like the Sun (lines 17-23) -----------------------------------------------

export interface SunPathState extends PathStarState {
  /** 0..1 the helium flash, deep in the core (line 19). */
  flash: number
  /** 0..1 the outer layers shed during the second swelling (line 20). */
  shed: number
  /** 0..1 how far the shed gas has drifted out. */
  expansion: number
  /** 0..1 the shed gas lit up by the bare core: a planetary nebula (line 21). */
  ionized: number
  /** 0..1 how bright the nebula is (it fades after about ten thousand years). */
  nebula: number
}

const SUN_LINES = 7
/** Where line `k` of the Sun's path starts, in path progress. */
const line = (k: number) => k / SUN_LINES
const L = 1 / SUN_LINES
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Red giant radius at its largest, in the Sun's disk units: it swallows the two innermost worlds (orbits 0.62 and 0.86). */
export const SUN_GIANT_RADIUS = 0.95
/** The second swelling (the asymptotic giant branch) is a little larger still. */
export const SUN_AGB_RADIUS = 1.0

/**
 * The Sun's life and ending at path progress `t` (0..1). `time` drives the
 * thermal pulses of the second swelling; pass 0 for reduced motion.
 */
export function sunPath(t: number, time: number, out: SunPathState, mainSequenceKelvin = 5800): SunPathState {
  const p = Math.max(0, Math.min(1, t))
  // Line 17: about ten billion years of steady hydrogen fusion. The Sun slowly brightens as it goes.
  const main = ease(p, 0, line(1))
  // Line 18: the core's hydrogen runs out; the star swells into a red giant.
  const giant = ease(p, line(1) + 0.1 * L, line(2) - 0.1 * L)
  // Line 19: the helium flash, inside the core. From outside, nothing shows.
  out.flash = pulse(p, line(2) + 0.25 * L, line(2) + 0.75 * L)
  // Line 20: it settles to burn helium calmly (smaller, hotter), then swells again, pulsing and shedding its outer layers.
  const settle = ease(p, line(3), line(3) + 0.35 * L)
  const second = ease(p, line(3) + 0.45 * L, line(4) - 0.05 * L)
  // Line 21: the last of the envelope drifts off and the bare core lights it up.
  const bare = ease(p, line(4), line(4) + 0.5 * L)
  // Lines 22-23: a white dwarf, then a very long cooling.
  const dwarf = ease(p, line(5), line(5) + 0.5 * L)
  const cooling = ease(p, line(6), 1)

  const throb = 1 + 0.05 * Math.sin(time * 2.2) * second * (1 - bare)
  const radius = lerp(lerp(SUN_GIANT_RADIUS * giant, 0.5, settle), SUN_AGB_RADIUS, second) * throb
  out.body = radius
  out.bodyOpacity = ease(giant, 0, 0.3) * (1 - bare)

  let kelvin = lerp(mainSequenceKelvin, mainSequenceKelvin * 1.03, main)
  kelvin = lerp(kelvin, 3300, giant)
  kelvin = lerp(kelvin, 4800, settle)
  kelvin = lerp(kelvin, 3000, second)
  kelvin = lerp(kelvin, 100000, bare)
  kelvin = lerp(kelvin, 25000, dwarf)
  out.temperature = lerp(kelvin, 7000, cooling)

  // The point of light becomes a soft glow round the giant's surface, then the bare core: tiny, and hot.
  const swollen = out.bodyOpacity
  out.glowSize = lerp(lerp(1, (2.6 * Math.max(radius, 0.3)) / 0.75, swollen), 0.3, bare)
  out.glow = lerp(lerp(lerp(1, 1.1, main), 0.18, swollen), 1.6, bare) * (1 - 0.75 * cooling)
  // A bare core is tiny: its light shows as a point, and the nebula round it carries the glow.
  out.halo = lerp(lerp(1, 0.55, giant), 0.06, bare) * (1 - 0.6 * cooling)

  out.engulf = Math.max(SUN_GIANT_RADIUS * giant, SUN_AGB_RADIUS * second)
  // Losing about half its mass, the star's hold weakens and the surviving orbits widen.
  out.orbitScale = 1 + 0.45 * ease(p, line(4), line(5) + 0.5 * L)
  // The giant's wind blows the old dust away.
  out.debris = 1 - ease(p, line(1), line(2))

  out.shed = second
  out.expansion = ramp(p, line(3) + 0.5 * L, 1)
  out.ionized = bare
  out.nebula = bare * (1 - ease(p, line(5) + 0.3 * L, line(6) + 0.2 * L))
  return out
}

export function createSunPath(): SunPathState {
  return { ...createPathStar(), flash: 0, shed: 0, expansion: 0, ionized: 0, nebula: 0 }
}

// --- Massive (lines 24-28) ---------------------------------------------------

export interface MassivePathState extends PathStarState {
  /** 0..1 the cutaway opening on the supergiant, showing its shells (line 25). */
  cutaway: number
  /** 0..1 how many burning shells have formed, hydrogen outward to iron at the centre. */
  layers: number
  /** 0..1 the iron core falling in (line 26). */
  collapse: number
  /** Radius of the shock, in the disk units the star is drawn in (0: none yet). */
  shock: number
  /** 0..1 how bright the shock glows. */
  shockGlow: number
  /** 0..1 neutrinos pouring out of the core, heating the stalled shock (line 27). */
  neutrinos: number
  /** 0..1 the neutron star, and its beams (line 28). */
  pulsar: number
}

const MASSIVE_LINES = 5
const mLine = (k: number) => k / MASSIVE_LINES
const ML = 1 / MASSIVE_LINES

/** A red supergiant's surface temperature (K): the envelope keeps it until the shock reaches it. */
export const SUPERGIANT_KELVIN = 3500
/** Red supergiant radius in disk units (the star is drawn in the disk's frame, which is larger for heavy stars). */
export const SUPERGIANT_RADIUS = 1.5
/** Where the shock stalls, in disk units: just outside the collapsed core, inside the star. */
export const STALLED_SHOCK = 0.32
/** How far the supernova's shock runs: past the camera. */
export const SHOCK_REACH = 18

/**
 * A massive star's life and ending at path progress `t` (0..1). The exposure
 * of the explosion follows the scroll, so it ramps; it never flashes the screen.
 */
export function massivePath(t: number, _time: number, out: MassivePathState, mainSequenceKelvin = 31000): MassivePathState {
  const p = Math.max(0, Math.min(1, t))
  // Line 24: hot, blue and fast.
  // Line 25: it swells into a red supergiant; a cutaway shows shells fusing heavier elements, out to iron.
  const swell = ease(p, mLine(1) + 0.05 * ML, mLine(1) + 0.6 * ML)
  out.cutaway = ease(p, mLine(1) + 0.45 * ML, mLine(1) + 0.75 * ML)
  out.layers = ease(p, mLine(1) + 0.5 * ML, mLine(2) - 0.05 * ML)
  // Line 26: fusing iron releases no energy. The core falls in, in less than a second.
  out.collapse = ease(p, mLine(2) + 0.3 * ML, mLine(2) + 0.6 * ML)
  // Line 27: the core rebounds; the shock stalls just outside it; neutrinos heat it until it blows the star apart.
  const bounce = ease(p, mLine(3), mLine(3) + 0.12 * ML)
  out.neutrinos = pulse(p, mLine(3) + 0.1 * ML, mLine(3) + 0.55 * ML)
  const revived = ease(p, mLine(3) + 0.4 * ML, 1)
  out.shock = bounce > 0 ? lerp(0.05, STALLED_SHOCK, bounce) + (SHOCK_REACH - STALLED_SHOCK) * revived * revived : 0
  // The shock glows as it breaks out, then thins and fades as it sweeps past.
  out.shockGlow = bounce * (1 - 0.9 * ease(p, mLine(3) + 0.8 * ML, mLine(4) + 0.7 * ML))
  // Line 28: left behind, a neutron star; its beams sweep round as it spins.
  out.pulsar = ease(p, mLine(4), mLine(4) + 0.3 * ML)

  out.body = SUPERGIANT_RADIUS * swell * (1 - 0.06 * out.collapse)
  // The envelope is gone once the shock has run through it.
  const blown = ramp(out.shock, out.body * 0.8, out.body * 1.6)
  out.bodyOpacity = ease(swell, 0, 0.3) * (1 - blown)

  let kelvin = mainSequenceKelvin
  kelvin = lerp(kelvin, SUPERGIANT_KELVIN, swell)
  // The explosion is hot; the neutron star left behind is hotter still (drawn at the colour scale's blue end).
  kelvin = lerp(kelvin, 12000, bounce)
  out.temperature = lerp(kelvin, 40000, out.pulsar)

  // The point of light is the core: hidden as a soft glow inside the supergiant, then the explosion's
  // light ramping up and down as the shock breaks out, then a tiny hard point.
  const swollen = out.bodyOpacity
  // The light peaks as the shock breaks out of the surface and fades as the debris spreads.
  const outburst = pulse(ramp(out.shock, SUPERGIANT_RADIUS * 0.9, SUPERGIANT_RADIUS * 7), 0, 1)
  // The outburst brightens the glow more than it grows it: a big bright sprite blooms into a grey fog.
  out.glowSize = lerp(lerp(1, (2.4 * SUPERGIANT_RADIUS) / 0.75, swollen), 0.25, out.pulsar) * (1 + 0.35 * outburst)
  out.glow = lerp(lerp(1, 0.18, swollen), 1.3, out.pulsar) + 0.9 * outburst
  out.halo = lerp(lerp(1, 0.5, swell), 0.05, Math.max(blown, out.pulsar)) + 0.2 * outburst
  out.engulf = 0
  out.orbitScale = 1
  out.debris = 1 - ease(p, mLine(1), mLine(2))
  return out
}

export function createMassivePath(): MassivePathState {
  return { ...createPathStar(), cutaway: 0, layers: 0, collapse: 0, shock: 0, shockGlow: 0, neutrinos: 0, pulsar: 0 }
}

// --- Very massive (lines 29-31) ----------------------------------------------

export interface VeryMassivePathState extends PathStarState {
  /** 0..1 how strong the wind blowing the star's outer layers away is (line 29). */
  wind: number
  /** 0..1 how far the star has been stripped to a bare Wolf-Rayet core (line 30). */
  stripped: number
  /** 0..1 the star gone from view as its core falls in (line 31). */
  vanish: number
  /** 0..1 a weak outburst as it goes, if any. */
  outburst: number
  /** 0..1 the black hole: its shadow and the little gas still falling onto it. */
  blackHole: number
  /** 0..1 how brightly that infalling gas glows (the impostor's disk and photon ring). */
  infall: number
}

const VM_LINES = 3
const vLine = (k: number) => k / VM_LINES
const VL = 1 / VM_LINES

/**
 * A very massive star's life and ending at path progress `t` (0..1). Many such
 * stars leave a neutron star instead (§3.2); the copy says "may", and the scene
 * shows the black hole it names.
 */
export function veryMassivePath(t: number, _time: number, out: VeryMassivePathState, mainSequenceKelvin = 42000): VeryMassivePathState {
  const p = Math.max(0, Math.min(1, t))
  // Line 29: a few million years, blowing much of itself away as it goes.
  out.wind = ease(p, 0.05 * VL, 0.5 * VL)
  // Line 30: the winds strip it to a hot, bare core: a Wolf-Rayet star.
  out.stripped = ease(p, vLine(1), vLine(1) + 0.6 * VL)
  // Line 31: the core falls straight in. A weak outburst, or none; the star simply goes dark.
  out.vanish = ease(p, vLine(2) + 0.15 * VL, vLine(2) + 0.45 * VL)
  out.outburst = 0.35 * pulse(p, vLine(2) + 0.1 * VL, vLine(2) + 0.6 * VL)
  out.blackHole = ease(p, vLine(2) + 0.25 * VL, vLine(2) + 0.55 * VL)
  // Only a little gas is left to fall in: a faint inner glow and photon ring round the shadow, never a full disk.
  out.infall = out.blackHole * (0.05 + 0.07 * pulse(p, vLine(2) + 0.3 * VL, 1))

  // Stripped to its core, it gets hotter still (colour is held at the scale's blue end).
  out.temperature = lerp(mainSequenceKelvin, 60000, out.stripped)
  // Puffed up by its own light at first, then small and hard once stripped, then gone.
  out.glowSize = lerp(lerp(1, 1.25, out.wind), 0.55, out.stripped) * (1 - 0.9 * out.vanish) * (1 + 0.6 * out.outburst)
  out.glow = lerp(1, 1.25, out.stripped) * (1 - out.vanish) + 0.6 * out.outburst
  out.halo = lerp(1, 0.6, out.stripped) * (1 - out.vanish)
  out.body = 0
  out.bodyOpacity = 0
  out.engulf = 0
  out.orbitScale = 1
  // The wind sweeps away what dust the star's light had left.
  out.debris = 1 - ease(p, 0, 0.6 * VL)
  return out
}

export function createVeryMassivePath(): VeryMassivePathState {
  return { ...createPathStar(), wind: 0, stripped: 0, vanish: 0, outburst: 0, blackHole: 0, infall: 0 }
}

// --- Red dwarf (lines 13-16) -------------------------------------------------

export interface RedDwarfPathState extends PathStarState {
  /** 0..1 the cutaway showing the whole interior churning (line 13). */
  cutaway: number
  /** 0..1 the predicted future on screen, drawn ghosted (line 15); back to 0 for today (line 16). */
  ghost: number
  /** 0..1 within the prediction: heating up into a blue dwarf. */
  heat: number
  /** 0..1 within the prediction: shrinking into a helium white dwarf. */
  shrink: number
}

const RD_LINES = 4
const rLine = (k: number) => k / RD_LINES
const RL = 1 / RD_LINES

/** The red dwarf's surface radius, in the disk units it is drawn in (its disk is drawn smaller, about 0.77). */
export const RED_DWARF_RADIUS = 0.42

/**
 * A red dwarf's life and predicted ending at path progress `t` (0..1). Its end
 * is a model prediction (Laughlin et al. 1997): none has died yet, so it is
 * drawn ghosted, then the scene returns to the star as it is today.
 */
export function redDwarfPath(t: number, _time: number, out: RedDwarfPathState, mainSequenceKelvin = 3100): RedDwarfPathState {
  const p = Math.max(0, Math.min(1, t))
  // Line 13: a small, cool star, cut open: convection churns all the way to the centre.
  out.cutaway = ease(p, 0.15 * RL, 0.4 * RL) * (1 - ease(p, rLine(1) - 0.1 * RL, rLine(1) + 0.15 * RL))
  // Line 15: the prediction, ghosted: it heats up into a blue dwarf, then shrinks into a helium white dwarf.
  out.ghost = ease(p, rLine(2), rLine(2) + 0.12 * RL) * (1 - ease(p, rLine(3) + 0.1 * RL, rLine(3) + 0.45 * RL))
  out.heat = ease(p, rLine(2) + 0.1 * RL, rLine(2) + 0.5 * RL)
  out.shrink = ease(p, rLine(2) + 0.5 * RL, rLine(2) + 0.9 * RL)

  const future = lerp(lerp(mainSequenceKelvin, 6500, out.heat), 12000, out.shrink)
  out.temperature = lerp(mainSequenceKelvin, future, out.ghost)
  const futureRadius = lerp(RED_DWARF_RADIUS * 0.85, 0.07, out.shrink)
  out.body = lerp(RED_DWARF_RADIUS, futureRadius, out.ghost)
  out.bodyOpacity = ease(p, 0, 0.12 * RL)
  // The point of light becomes a soft glow round the drawn surface.
  out.glowSize = lerp(1, (2.2 * out.body) / 0.75, out.bodyOpacity)
  out.glow = lerp(1, 0.2, out.bodyOpacity) * (1 + 0.8 * out.ghost * out.shrink)
  // The halo dims for the prediction, so a white dwarf the size of the Earth stays a point, not a blur.
  out.halo = lerp(1, 0.45, out.bodyOpacity) * (1 - 0.85 * out.ghost)
  out.engulf = 0
  out.orbitScale = 1
  out.debris = 1
  return out
}

export function createRedDwarfPath(): RedDwarfPathState {
  return { ...createPathStar(), cutaway: 0, ghost: 0, heat: 0, shrink: 0 }
}

/**
 * How far the camera closes in on the star (0..1) for `path` at path progress `t`:
 * a red dwarf is small, so the camera moves in for its cutaway, then back out;
 * a brown dwarf is smaller, so it stays close for most of its path.
 */
export function pathCameraZoom(path: StarPathId, t: number): number {
  // A brown dwarf is smaller still: the camera moves in and stays while it cools, then backs out for the ending.
  if (path === 'brown-dwarf') return ease(t, 0, 0.4 * BL) * (1 - ease(t, bLine(1) + 0.45 * BL, bLine(1) + 0.9 * BL))
  if (path !== 'red-dwarf') return 0
  return ease(t, 0, 0.5 * RL) * (1 - ease(t, rLine(1) + 0.1 * RL, rLine(1) + 0.6 * RL))
}

// --- Brown dwarf (lines 11-12) -----------------------------------------------

export interface BrownDwarfPathState extends PathStarState {
  /** 0..1 deuterium burning in the core: a faint inner glow (line 11). */
  deuterium: number
  /** 0..1 how far it has cooled, from a young L dwarf toward a dark Y dwarf (lines 11-12). */
  cooling: number
}

const BD_LINES = 2
const bLine = (k: number) => k / BD_LINES
const BL = 1 / BD_LINES

/** The brown dwarf's radius, in the disk units it is drawn in: about Jupiter's size, so drawn small, close to a red dwarf's. */
export const BROWN_DWARF_RADIUS = 0.32
/** Where its cooling ends on screen (K): far below where its light is visible, so drawn nearly black. */
export const BROWN_DWARF_COLD_KELVIN = 600

/**
 * A brown dwarf's life at path progress `t` (0..1). It never ignites: it burns
 * deuterium for a while (millions of years at this mass; Spiegel et al. 2011),
 * then cools and dims for good, shrinking a little as it goes (Burrows et al. 2001).
 */
export function brownDwarfPath(t: number, _time: number, out: BrownDwarfPathState, youngKelvin = 2800): BrownDwarfPathState {
  const p = Math.max(0, Math.min(1, t))
  // Line 11: deuterium burns for a while, then only leftover heat is left.
  out.deuterium = ease(p, 0.1 * BL, 0.35 * BL) * (1 - ease(p, 0.6 * BL, 0.95 * BL))
  // Lines 11-12: cooling starts once the deuterium is spent and never stops.
  out.cooling = ease(p, 0.75 * BL, 1)

  // Through the L, T and Y types: about 2,000 K, then 1,300 K, then 600 K and below.
  out.temperature = lerp(youngKelvin, BROWN_DWARF_COLD_KELVIN, out.cooling)
  out.body = BROWN_DWARF_RADIUS * (1 - 0.12 * out.cooling)
  out.bodyOpacity = ease(p, 0, 0.12 * BL)
  // The point of light becomes a soft glow round the drawn surface, never bright, and fades as it cools.
  out.glowSize = lerp(1, (2 * out.body) / 0.75, out.bodyOpacity)
  out.glow = lerp(1, 0.18, out.bodyOpacity) * (1 + 0.5 * out.deuterium) * (1 - 0.9 * out.cooling)
  out.halo = lerp(1, 0.25, out.bodyOpacity) * (1 - 0.95 * out.cooling)
  out.engulf = 0
  out.orbitScale = 1
  // What dust was left drifts away over the first few million years.
  out.debris = 1 - ease(p, 0.4 * BL, bLine(1) + 0.3 * BL)
  return out
}

export function createBrownDwarfPath(): BrownDwarfPathState {
  return { ...createPathStar(), deuterium: 0, cooling: 0 }
}

// --- First stars (lines 32-35) -----------------------------------------------

export interface FirstStarsPathState extends PathStarState {
  /** 0..1 how sparse the sky is: few stars yet in the early Universe (line 32). */
  sparse: number
  /** 0..1 the cutaway opening on the star, showing its huge oxygen core (line 33). */
  cutaway: number
  /** 0..1 light turning into electron-positron pairs in the core. */
  pairs: number
  /** 0..1 the core falling in once the pressure drops. */
  coreFall: number
  /** 0..1 oxygen igniting all at once, from the centre of the core outward (line 34). */
  ignite: number
  /** Radius of the debris shell, in the disk units the star is drawn in (0: none yet). */
  blast: number
  /** 0..1 how bright that shell glows. */
  blastGlow: number
}

const FS_LINES = 4
const fLine = (k: number) => k / FS_LINES
const FL = 1 / FS_LINES

/** The star's radius in disk units: a blue giant, compact for its mass because it has almost no heavy elements. */
export const FIRST_STAR_RADIUS = 1.1
/** Its helium core, as a fraction of its radius (drawn large: about 64-133 solar masses of it; Heger & Woosley 2002). */
export const FIRST_STAR_CORE = 0.42
/** How far the debris runs: past the camera. */
export const BLAST_REACH = 20

/**
 * A first star's life and ending at path progress `t` (0..1): a pair-instability
 * supernova, which leaves nothing behind (Heger & Woosley 2002). The light of the
 * explosion follows the debris shell's radius, so it ramps with the scroll; it never flashes.
 */
export function firstStarsPath(t: number, _time: number, out: FirstStarsPathState, mainSequenceKelvin = 55000): FirstStarsPathState {
  const p = Math.max(0, Math.min(1, t))
  // Line 32: a huge blue star in a sparse early sky; its weak wind lets it keep its mass.
  out.sparse = ease(p, 0, 0.6 * FL)
  const grown = ease(p, 0.05 * FL, 0.45 * FL)
  // Line 33: cut open, its core so hot that light makes pairs; the pressure drops and the core falls in.
  out.cutaway = ease(p, fLine(1) + 0.05 * FL, fLine(1) + 0.3 * FL) * (1 - ease(p, fLine(2) + 0.4 * FL, fLine(2) + 0.6 * FL))
  out.pairs = ease(p, fLine(1) + 0.3 * FL, fLine(1) + 0.6 * FL) * (1 - ease(p, fLine(2), fLine(2) + 0.2 * FL))
  out.coreFall = ease(p, fLine(1) + 0.6 * FL, fLine(2))
  // Line 34: oxygen ignites all at once, and the star blows itself apart.
  out.ignite = ease(p, fLine(2), fLine(2) + 0.2 * FL)
  // It speeds up as it goes: the star is gone by the middle of line 34, and the debris passes the camera in line 35.
  const blown = ramp(p, fLine(2) + 0.15 * FL, fLine(3) + 0.6 * FL)
  out.blast = blown > 0 ? FIRST_STAR_RADIUS + (BLAST_REACH - FIRST_STAR_RADIUS) * blown * blown : 0
  // Line 35: the debris thins and fades as it sweeps past; nothing is left at the centre.
  out.blastGlow = ease(p, fLine(2) + 0.15 * FL, fLine(2) + 0.3 * FL) * (1 - 0.92 * ease(p, fLine(3), 1))

  out.body = FIRST_STAR_RADIUS * grown * (1 - 0.04 * out.coreFall)
  const gone = ramp(out.blast, FIRST_STAR_RADIUS * 1.05, FIRST_STAR_RADIUS * 2.2)
  out.bodyOpacity = ease(grown, 0, 0.4) * (1 - gone)
  out.temperature = lerp(mainSequenceKelvin, 12000, out.ignite)

  // The light peaks as the debris breaks out and fades as it spreads: brighter and longer than a core-collapse supernova.
  const outburst = pulse(ramp(out.blast, FIRST_STAR_RADIUS * 1.05, FIRST_STAR_RADIUS * 9), 0, 1)
  const swollen = out.bodyOpacity
  // Nothing is left: the point of light goes out with the star.
  out.glowSize = lerp(1, (2.4 * FIRST_STAR_RADIUS) / 0.75, swollen) * (1 + 0.4 * outburst) * (1 - gone * (1 - outburst))
  out.glow = lerp(1, 0.2, swollen) * (1 - gone) + 1.1 * outburst
  out.halo = lerp(1, 0.5, swollen) * (1 - gone) + 0.25 * outburst
  out.engulf = 0
  out.orbitScale = 1
  // A star this bright clears its leftover dust early.
  out.debris = 1 - ease(p, 0, fLine(1))
  return out
}

export function createFirstStarsPath(): FirstStarsPathState {
  return { ...createPathStar(), sparse: 0, cutaway: 0, pairs: 0, coreFall: 0, ignite: 0, blast: 0, blastGlow: 0 }
}

/**
 * How much of the sky's stars to draw (0..1) for `path` at path progress `t`:
 * the first stars shine in a nearly empty sky. The flight's full sky is back before the hand-off's hold.
 */
export function skyDensity(path: StarPathId, t: number, handoff: number): number {
  if (path !== 'first-stars') return 1
  return lerp(1 - 0.85 * ease(t, 0, 0.6 * FL), 1, ease(handoff, 0, HANDOFF_ARRIVE - 0.05))
}

// --- Every path ---------------------------------------------------------------

/** Each drawn path's own state object, so every frame fills them without allocating. */
export interface PathStates {
  sun: SunPathState
  massive: MassivePathState
  veryMassive: VeryMassivePathState
  redDwarf: RedDwarfPathState
  brownDwarf: BrownDwarfPathState
  firstStars: FirstStarsPathState
}

export function createPathStates(): PathStates {
  return { sun: createSunPath(), massive: createMassivePath(), veryMassive: createVeryMassivePath(), redDwarf: createRedDwarfPath(), brownDwarf: createBrownDwarfPath(), firstStars: createFirstStarsPath() }
}

/** The star's state for `path` at path progress `t`. */
export function pathStar(path: StarPathId, t: number, time: number, mainSequenceKelvin: number, states: PathStates): PathStarState {
  if (path === 'sun') return sunPath(t, time, states.sun, mainSequenceKelvin)
  if (path === 'massive') return massivePath(t, time, states.massive, mainSequenceKelvin)
  if (path === 'red-dwarf') return redDwarfPath(t, time, states.redDwarf, mainSequenceKelvin)
  if (path === 'very-massive') return veryMassivePath(t, time, states.veryMassive, mainSequenceKelvin)
  if (path === 'brown-dwarf') return brownDwarfPath(t, time, states.brownDwarf, mainSequenceKelvin)
  return firstStarsPath(t, time, states.firstStars, mainSequenceKelvin)
}
