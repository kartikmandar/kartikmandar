// src/components/CosmicJourney3D/starChoice.ts
// The visitor's choice of mass (O5): a log-scale slider from a brown dwarf to a
// first star, its readout (mass, main-sequence lifetime, ending), and the path
// each mass follows. Pure, apart from the small store and the URL helpers at the end.
// Source of truth: docs/superpowers/specs/2026-11-04-stellar-life-cycle-opening-design.md (§3.2, §3.3, §4, §9.6)

import { createStore, useStore } from 'zustand'
import { DEFAULT_STAR_PATH, STAR_PATHS, starPath, type StarPathId } from './openingStory'

/** Slider range in solar masses (§4): pair instability needs up to about 250. */
export const MASS_MIN = 0.02
export const MASS_MAX = 250
/** The range input's integer steps: fine enough that arrow keys move about 1% in mass. */
export const SLIDER_STEPS = 1000

const LOG_MIN = Math.log10(MASS_MIN)
const LOG_SPAN = Math.log10(MASS_MAX) - LOG_MIN

const clampMass = (mass: number) => Math.min(MASS_MAX, Math.max(MASS_MIN, mass))

/** Slider position (0..SLIDER_STEPS) for a mass. */
export function massToSlider(mass: number): number {
  return Math.round(((Math.log10(clampMass(mass)) - LOG_MIN) / LOG_SPAN) * SLIDER_STEPS)
}

/**
 * Mass for a slider position: a preset's exact mass on its position, otherwise
 * unrounded. Rounding here would trap the arrow keys, since a one-step move
 * (about 1% in mass) would round back to the position it came from; the readout
 * rounds instead (formatMass).
 */
export function sliderToMass(value: number): number {
  const v = Math.min(SLIDER_STEPS, Math.max(0, Math.round(value)))
  const preset = STAR_PATHS.find((path) => massToSlider(path.mass) === v)
  return preset ? preset.mass : 10 ** (LOG_MIN + (v / SLIDER_STEPS) * LOG_SPAN)
}

/** How close (in slider steps) a dragged thumb has to come to a preset to snap onto it. */
export const DETENT_STEPS = 14

/** The preset a dragged slider position snaps to, if it is within the detent. */
export function snapToPreset(value: number): number {
  for (const path of STAR_PATHS) {
    const preset = massToSlider(path.mass)
    if (Math.abs(value - preset) <= DETENT_STEPS) return preset
  }
  return value
}

/** Where one path hands over to the next, in solar masses, for the slider's tick marks (§3.2). */
export const PATH_BOUNDARIES: readonly number[] = [0.08, 0.5, 8, 25, 140]

/**
 * The path a star of this mass follows (§3.2). Boundaries are approximate:
 * they depend on metallicity and on modelling choices, so the copy says "about".
 */
export function pathForMass(mass: number): StarPathId {
  // STAR_PATHS is ordered by mass, one path per gap between boundaries, so the ticks and the paths can't drift apart.
  const index = PATH_BOUNDARIES.findIndex((boundary) => mass < boundary)
  return STAR_PATHS[index === -1 ? STAR_PATHS.length - 1 : index]!.id
}

/** Main-sequence lifetimes from models (§3.3), interpolated in log space. */
const LIFETIMES: readonly [mass: number, years: number][] = [
  [0.1, 6e12],
  [0.15, 2.5e12],
  [0.2, 1e12],
  [0.3, 5e11],
  [0.5, 1e11],
  [1, 1e10],
  [2, 1e9],
  [5, 1e8],
  [15, 1.2e7],
  [40, 5e6],
  [120, 3e6],
]

/** Main-sequence lifetime in years, or null for a brown dwarf, which never sustains hydrogen fusion. */
export function lifetimeYears(mass: number): number | null {
  if (mass < PATH_BOUNDARIES[0]!) return null
  const first = LIFETIMES[0]!
  const last = LIFETIMES[LIFETIMES.length - 1]!
  // Beyond the table the lifetimes flatten out (and red dwarfs below 0.1 only get longer), so hold the end values.
  if (mass <= first[0]) return first[1]
  if (mass >= last[0]) return last[1]
  for (let i = 1; i < LIFETIMES.length; i++) {
    const [m1, y1] = LIFETIMES[i]!
    if (mass > m1) continue
    const [m0, y0] = LIFETIMES[i - 1]!
    const t = (Math.log10(mass) - Math.log10(m0)) / (Math.log10(m1) - Math.log10(m0))
    return 10 ** (Math.log10(y0) + t * (Math.log10(y1) - Math.log10(y0)))
  }
  return last[1]
}

const UNITS: readonly [size: number, name: string][] = [[1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million']]

/** "about 10 billion years": two significant figures from ten up, one below, because these are model values. */
export function formatYears(years: number): string {
  const [size, name] = UNITS.find(([unitSize]) => years >= unitSize) ?? UNITS[UNITS.length - 1]!
  const n = years / size
  const rounded = n >= 10 ? Number(n.toPrecision(2)) : Number(n.toPrecision(1))
  return `about ${rounded} ${name} years`
}

/** How a star of this mass ends, at the readout's level of detail (§3.2). */
export function endingFor(mass: number): string {
  if (mass < 0.08) return 'cools and fades'
  if (mass < 0.5) return 'helium white dwarf'
  if (mass < 6) return 'white dwarf'
  if (mass < 8) return 'white dwarf or supernova'
  if (mass < 20) return 'supernova, neutron star'
  if (mass < 70) return 'black hole or neutron star'
  if (mass < 140) return 'shell ejections, black hole'
  return 'nothing left'
}

/** Two significant figures: "0.05", "0.15", "1.0", "2.4", "15", "200". */
export function formatMass(mass: number): string {
  const rounded = Number(mass.toPrecision(2))
  if (rounded < 1) return String(rounded)
  if (rounded < 10) return rounded.toFixed(1)
  return String(Math.round(rounded))
}

/** The mono readout, also the slider's aria-valuetext: `1.0 M☉ · about 10 billion years · white dwarf`. */
export function massReadout(mass: number): string {
  const years = lifetimeYears(mass)
  const life = years === null ? 'no hydrogen fusion' : formatYears(years)
  return `${formatMass(mass)} M☉ · ${life} · ${endingFor(mass)}`
}

// --- Deep links (decision 9.6) -----------------------------------------------

/** The path a `?star=` query names, or null. */
export function parseStarParam(search: string): StarPathId | null {
  const value = new URLSearchParams(search).get('star')
  return STAR_PATHS.find((path) => path.id === value)?.id ?? null
}

/** `search` with `?star=` set to `id`, keeping every other parameter. */
export function withStarParam(search: string, id: StarPathId): string {
  const params = new URLSearchParams(search)
  params.set('star', id)
  return `?${params.toString()}`
}

// --- The chosen mass ---------------------------------------------------------

/** No choice, no JavaScript, calm mode and reduced motion follow the Sun (decision 9.5); `?star=` overrides it. */
function initialMass(): number {
  const linked = typeof window === 'undefined' ? null : parseStarParam(window.location.search)
  return starPath(linked ?? DEFAULT_STAR_PATH).mass
}

export const starStore = createStore<{ mass: number }>(() => ({ mass: initialMass() }))

export function setStarMass(mass: number): void {
  const next = clampMass(mass)
  if (starStore.getState().mass !== next) starStore.setState({ mass: next })
}

/** React hook for the chosen mass (re-renders only when it changes). */
export function useStarMass(): number {
  return useStore(starStore, (s) => s.mass)
}

/** React hook for the chosen path. */
export function useStarPath(): StarPathId {
  return useStore(starStore, (s) => pathForMass(s.mass))
}
