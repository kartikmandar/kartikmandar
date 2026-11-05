// src/components/CosmicJourney3D/openingStory.ts
// The opening: a star's life, from a cold cloud to its ending, along the path
// the visitor chooses. Copy approved by the owner on 2026-11-04.
// Source of truth: docs/superpowers/specs/2026-11-04-stellar-life-cycle-opening-design.md (§3, §5, §8)

export type StarPathId = 'brown-dwarf' | 'red-dwarf' | 'sun' | 'massive' | 'very-massive' | 'first-stars'

export interface StarPath {
  id: StarPathId
  /** Preset button label. */
  label: string
  /** Preset mass in solar masses (§3.2). */
  mass: number
  /** Line 7: what the disk makes around a star of this mass. */
  planets: string
  /** Line 9 or its variant; the brown dwarf, which never ignites, says why instead. */
  ignition: string
  /** The path's life and ending. */
  life: string[]
  /** Which `life` line carries a timeline of the star's life against the Universe's age so far, if any. */
  lifetimeLine?: number
}

const PLANETS_GIANTS = 'Beyond the snow line, ice helps cores grow big enough to pull in gas. Giants form there.'
const PLANETS_SMALL = 'A small disk makes small worlds, if any.'
const PLANETS_CLEARED = 'Ultraviolet light from a star this heavy clears the disk quickly. Planets have little time to form.'
const IGNITION = 'The core passes about ten million kelvin. Hydrogen fuses into helium, and the star settles onto the main sequence.'
const IGNITION_HEAVY = "Its core ignites while it is still feeding. Heavy stars don't wait."

export const STAR_PATHS: readonly StarPath[] = [
  {
    id: 'brown-dwarf', label: 'Brown dwarf', mass: 0.05,
    planets: PLANETS_SMALL,
    ignition: 'It stopped short. Below about 0.08 solar masses, the core never gets hot enough to keep hydrogen burning.',
    life: [
      'It burns deuterium for a while, then glows only with leftover heat.',
      'It cools and dims for billions of years, never quite a star.',
    ],
  },
  {
    id: 'red-dwarf', label: 'Red dwarf', mass: 0.15,
    planets: PLANETS_GIANTS,
    lifetimeLine: 1,
    ignition: 'The core reaches a few million kelvin, just enough. Hydrogen fuses into helium, and the star settles onto the main sequence.',
    life: [
      'A small, cool red dwarf. Its whole interior churns, so it uses almost all of its hydrogen.',
      'It will shine for trillions of years. The Universe is only 13.8 billion years old.',
      'Late in life it should heat up and shrink into a helium white dwarf.',
      "None has done this yet. There hasn't been time.",
    ],
  },
  {
    id: 'sun', label: 'Like the Sun', mass: 1,
    planets: PLANETS_GIANTS,
    ignition: IGNITION,
    life: [
      'It fuses hydrogen steadily for about ten billion years.',
      'When the core runs out, the star swells into a red giant and swallows the inner planets.',
      'Below about two solar masses, helium in the core ignites in a runaway: the helium flash. From outside, nothing shows.',
      'It burns helium calmly for about a hundred million years, then swells again. Its outer layers pulse and drift away.',
      'The drifting gas glows as a planetary nebula, lit by the bare core.',
      'The core is now a white dwarf of carbon and oxygen, about the size of Earth. The outer planets still orbit it.',
      'It cools for longer than the Universe has existed. A cold, dark black dwarf is still only a prediction.',
    ],
  },
  {
    id: 'massive', label: 'Massive', mass: 15,
    planets: PLANETS_CLEARED,
    ignition: IGNITION_HEAVY,
    life: [
      'A massive star burns hot, blue and fast: about twelve million years.',
      'It swells into a red supergiant. Inside, shells fuse heavier and heavier elements, out to iron.',
      'Fusing iron releases no energy. The core collapses in less than a second.',
      'The core rebounds. Neutrinos pouring out heat the stalled shock until it blows the star apart: a Type II supernova.',
      'Left behind is a neutron star about twenty-five kilometres across. If its beams sweep past us, we see a pulsar.',
    ],
  },
  {
    id: 'very-massive', label: 'Very massive', mass: 40,
    planets: PLANETS_CLEARED,
    ignition: IGNITION_HEAVY,
    life: [
      'A star this heavy lives only a few million years and blows much of itself away as it goes.',
      'Its winds can strip it down to a hot, bare core, a Wolf-Rayet star.',
      'Its core may collapse straight into a black hole, with a weak explosion or none at all.',
    ],
  },
  {
    id: 'first-stars', label: 'First stars', mass: 200,
    planets: PLANETS_CLEARED,
    ignition: IGNITION_HEAVY,
    life: [
      'In gas with almost no heavy elements, as in the early Universe, a star this heavy can keep its mass.',
      'Its core gets so hot that light turns into pairs of electrons and positrons. The pressure drops, and the core falls in.',
      'Oxygen ignites all at once, and the star blows itself apart. Nothing is left behind.',
      'A few candidates have been seen. None is certain.',
    ],
  },
]

/** No choice, no JavaScript, calm mode and reduced motion all follow the Sun's path (decision 9.5). */
export const DEFAULT_STAR_PATH: StarPathId = 'sun'

export function starPath(id: StarPathId): StarPath {
  return STAR_PATHS.find((path) => path.id === id) ?? STAR_PATHS.find((path) => path.id === DEFAULT_STAR_PATH)!
}

export const OPENING_TRUNK = [
  'A cold cloud of gas and dust, about ten degrees above absolute zero.',
  'In its densest knots, gravity wins. The cloud breaks into clumps, and each one starts to fall in.',
  'At the centre of one clump, a core heats up inside a cocoon of dust.',
  "Gas that can't fall straight in spreads into a spinning disk. Jets from the poles carry spin away, helping gas drain onto the star.",
] as const

export const CHOICE_LINE = 'The young star is still feeding from its disk. How much it gathers decides how long it lives and how it ends.'
export const PLANETS_LINE = 'In the disk, dust grains stick together. Pebbles become planetesimals, and planetesimals become planets.'
export const CLEARING_LINE = "The star's wind and light clear away the leftover gas. What has formed by now is all there will be."
export const HANDOFF_LINE = 'Billions of years and many stars later, someone looked up at the sky.'

/** The article's and calm mode's heading for the opening (§8, "Article and calm-mode extras"). */
export const OPENING_HEADING = 'How a star lives and ends'
export const LIFETIME_FORMULA_LINE = "Roughly, a star's lifetime falls with its mass to the power 2.5, so a star ten times heavier lives a few hundred times less long. The rule breaks down for the smallest and largest stars."

// The article tells the Sun's path in full and every other path in one or two of
// its own lines (§10): indices into the path's ignition line followed by its life.
const SUMMARY_LINES: Record<StarPathId, readonly number[]> = {
  'brown-dwarf': [0, 2],
  'red-dwarf': [2, 4],
  'sun': [1, 2],
  'massive': [1, 4],
  'very-massive': [1, 3],
  'first-stars': [1, 3],
}

/** One or two of a path's approved lines, for the article's list of other stars. */
export function pathSummary(id: StarPathId): string[] {
  const path = starPath(id)
  const lines = [path.ignition, ...path.life]
  return SUMMARY_LINES[id].map((index) => lines[index]!)
}

export type OpeningSegment = 'cloud' | 'protostar' | 'choice' | 'planets' | 'ignition' | 'path'

/** Scroll budget of the opening before the hand-off band, in vh (§5). The hand-off's 200 vh is the band itself. */
export const OPENING_SEGMENTS: readonly { id: OpeningSegment; vh: number }[] = [
  { id: 'cloud', vh: 260 },
  { id: 'protostar', vh: 240 },
  { id: 'choice', vh: 220 },
  { id: 'planets', vh: 260 },
  { id: 'ignition', vh: 180 },
  { id: 'path', vh: 720 },
]

export interface OpeningLine {
  segment: OpeningSegment | 'handoff'
  text: string
  /** Shown under the line: the star's lifetime against the age of the Universe. */
  aside?: 'lifetime'
}

/** Every line of the opening for one path, in order, ending with the hand-off line. */
export function openingLines(id: StarPathId): OpeningLine[] {
  const path = starPath(id)
  return [
    { segment: 'cloud', text: OPENING_TRUNK[0] },
    { segment: 'cloud', text: OPENING_TRUNK[1] },
    { segment: 'protostar', text: OPENING_TRUNK[2] },
    { segment: 'protostar', text: OPENING_TRUNK[3] },
    { segment: 'choice', text: CHOICE_LINE },
    { segment: 'planets', text: PLANETS_LINE },
    { segment: 'planets', text: path.planets },
    { segment: 'planets', text: CLEARING_LINE },
    { segment: 'ignition', text: path.ignition },
    ...path.life.map((text, i): OpeningLine => (i === path.lifetimeLine ? { segment: 'path', text, aside: 'lifetime' } : { segment: 'path', text })),
    { segment: 'handoff', text: HANDOFF_LINE },
  ]
}

const OPENING_VH = OPENING_SEGMENTS.reduce((sum, segment) => sum + segment.vh, 0)

/** Where a segment starts and ends in opening progress (0..1 over the opening, before the hand-off band). */
export function segmentRange(id: OpeningSegment): { start: number; end: number } {
  let start = 0
  for (const segment of OPENING_SEGMENTS) {
    if (segment.id === id) return { start: start / OPENING_VH, end: (start + segment.vh) / OPENING_VH }
    start += segment.vh
  }
  return { start: 1, end: 1 }
}

/**
 * Which line of `lines` is on screen: each segment shares its scroll equally
 * among its lines, and the hand-off band shows the hand-off line.
 */
export function openingLineIndex(openingProgress: number, inHandoff: boolean, lines: readonly OpeningLine[]): number {
  if (inHandoff || openingProgress >= 1) return lines.length - 1
  const p = Math.max(0, openingProgress)
  for (const segment of OPENING_SEGMENTS) {
    const range = segmentRange(segment.id)
    if (p >= range.end) continue
    const first = lines.findIndex((line) => line.segment === segment.id)
    const count = lines.filter((line) => line.segment === segment.id).length
    const within = Math.floor(((p - range.start) / (range.end - range.start)) * count)
    return first + Math.min(count - 1, Math.max(0, within))
  }
  return lines.length - 1
}
