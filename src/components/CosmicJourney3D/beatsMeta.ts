// src/components/CosmicJourney3D/beatsMeta.ts
import type { Anchor, BeatMeta } from './types'
import { NARRATIVE } from './narrative'

export const ORIGIN_ANCHOR: Anchor = { position: [0, 0, 12], lookAt: [0, 0, 0] }
/** The origin black hole sits where the flight's first look points: ahead of the camera as it emerges. */
export const ORIGIN_BLACK_HOLE: [number, number, number] = [0, 0, 0]

// Anchors lay the stations along a forward-and-down corridor in Z, gently
// alternating in X so the CatmullRom path curves. Tuned visually in later phases;
// these are real starting coordinates, not placeholders.
// Far enough that, while the camera holds on a beat, the previous scene is well
// behind it and the next is a faint speck in the fog.
export const STATION_SPACING = 18
const STATION_START_Z = -14

function station(i: number): Anchor {
  const z = STATION_START_Z - i * STATION_SPACING
  const x = Math.sin(i * 0.9) * 6
  const y = Math.cos(i * 0.6) * 2.5
  return { position: [x, y, z], lookAt: [x * 0.3, y * 0.3, z - 6] }
}

const META: Array<[string, Partial<BeatMeta>]> = [
  // Act I — Spark
  ['nao-section', { acceptance: ['textbook pages peel off and fold into a star chart', 'constellation lines ignite around a small glowing figure'] }],
  ['comet-section', { acceptance: ['dry-ice comet vapour becomes a real comet tail', 'dark Sariska sky with a glowing tent below'] }],
  ['decision-section', { acceptance: ['trajectory line draws from Earth to a distant star and locks'] }],
  ['constellation-section', { acceptance: ['light-wire refractor on a dune aimed at the annular eclipse', 'eclipse ring rhymes with the opening photon ring'] }],
  ['search-section-wrapper', { acceptance: ['terminal prompt types the 3 phrases', 'candidate orbits flicker; one survives toward IISER Bhopal'] }],
  // Act II — Course Correction
  ['new-system-section', { acceptance: ['code streams out of a laptop and becomes orbit lines of a new system'] }],
  ['fixation-section', { acceptance: ['planet in a temporary orbit keeps its face turned to a bright Physics star'] }],
  ['slingshot-section', { pin: true, acceptance: ['gravity-assist slingshot onto a new course', 'Δv shown as a glowing arrow'] }],
  ['lens-section', { acceptance: ['three faint suns orbit; one brightens into the system sun'] }],
  ['internship-section', { acceptance: ['two forking light paths: phone streaming sensor waveforms, protein ribbon ending in a gold glint over Paris'] }],
  ['injury-section', { acceptance: ['shuttlecock smash arc fractures into shards', 'shards re-form as a slower coaching arc'] }],
  // Act III — Ignition
  ['rri-research-section', { acceptance: ['hexagonal HERA array on the Karoo plain', 'interference fringes sweep the sky and sample a faint 21-cm haze'] }],
  ['gsoc-section', { pin: true, acceptance: ['X-ray photons assemble into a light curve', 'curve folds into floating dashboard panels'] }],
  ['doubling-down-section', { acceptance: ['desk lamp through a night timelapse', 'commit graph grows like a vine around a radio dish'] }],
  ['journal-club-section', { acceptance: ['ring of glowing figures around a campfire', 'sparks rise into orbiting arXiv pages'] }],
  ['bs-exit-section', { acceptance: ['camera leaves a bright safe orbit for dark space on a lone trajectory', 'faint beacons ahead'] }],
  ['lensing-section', { pin: true, acceptance: ['Einstein ring with a lensed arc', 'cutouts flow through gates into a neural-net lattice', 'cursor-draggable lens'] }],
  ['publication-section', { acceptance: ['scattered samples snap onto a regular grid (NUFFT)', 'journal page settles into place'] }],
  ['cygnus-publication-section', { acceptance: ['accretion disk beside a blue supergiant', 'inner disk edge slides inward as the state changes'] }],
  // Act IV — Widening
  ['radiosim-section', { pin: true, acceptance: ['wavefront passes through K/E/G/B/D/P Jones plates onto a dish', 'HEALPix sphere tessellates behind'] }],
  ['hera-upstream-section', { acceptance: ['ribbon sweeps the celestial sphere (hera_strip)', 'PR branches flow into a v1.0 trunk', 'four-Stokes polarized sky'] }],
  ['instruments-section', { acceptance: ['wireframe Green Bank dish tilts skyward', 'Act I refractor reappears as a ghost'] }],
  ['xray-followup-section', { acceptance: ['coronal light reflects off the disk', 'iron-line hump rises in a spectrum'] }],
  ['oss-maintainer-section', { acceptance: ['old flickering interface rebuilds panel by panel', 'noisy light curve phase-folds into a clean pulse profile'] }],
  ['engineer-section', { acceptance: ['bank statement ribbon; running balance snaps to zero residual', 'figures lift off pages with page-number tags'] }],
  ['enrolia-section', { acceptance: ['branching road toward university beacons', 'citation threads tie claims to glowing sources'] }],
  ['off-court-section', { acceptance: ['broken shuttlecock arc completes into a bracket tree', 'tree morphs into a ridgeline with a runner trail'] }],
  // Act V — Catania
  ['admission-section', { acceptance: ['portal of light opens after the dark stretch', '21cmFAST-style lightcone pours toward the camera'] }],
  ['arrival-section', { acceptance: ['Delhi → Sicily arc on a globe', 'Etna silhouette with an ember rim', 'small campfire circle echoes the journal club'] }],
  ['analysis-section', { pin: true, acceptance: ['foreground wedge in the (k⊥, k∥) plane', 'low-rank model peels layers to reveal a quiet EoR window'] }],
  ['journey-continues-section', { scrollLength: 240, acceptance: ['ionized bubbles merge into the opening photon ring', 'eclipse ring aligns', 'pull back to reveal all beats as a constellation'] }],
]

/**
 * Dwell scales with how much there is to read: ~2.2 vh of scroll per word on top
 * of a base, so every beat holds long enough to be read at a comfortable pace.
 */
export function dwellFor(words: number): number {
  return Math.round(Math.max(110, Math.min(240, 90 + words * 2.2)))
}

function wordsIn(id: string): number {
  const beat = NARRATIVE.find((b) => b.id === id)
  const text = [beat?.headline, beat?.body, ...(beat?.typedPhrases ?? [])].filter(Boolean).join(' ')
  return text.trim().split(/\s+/).length
}

export const BEATS_META: Record<string, BeatMeta> = Object.fromEntries(
  META.map(([id, partial], i) => [
    id,
    {
      scrollLength: partial.scrollLength ?? dwellFor(wordsIn(id)),
      pin: partial.pin ?? false,
      anchor: partial.anchor ?? station(i),
      posterSrc: `/media/my-story/${id}.webp`,
      acceptance: partial.acceptance ?? [],
    } satisfies BeatMeta,
  ]),
)

// The flight ends a little past the last station, so the camera never doubles back.
const LAST_STATION_Z = STATION_START_Z - (META.length - 1) * STATION_SPACING
export const NEBULA_ANCHOR: Anchor = {
  position: [0, 8, LAST_STATION_Z - 6],
  lookAt: [0, 12, LAST_STATION_Z - 36],
}

/**
 * Where the finale's constellation (all beats, in miniature) floats: 12 units
 * ahead of the nebula camera along its view, nudged up so the end card sits below it.
 */
export const CONSTELLATION_CENTER: [number, number, number] = (() => {
  const [px, py, pz] = NEBULA_ANCHOR.position
  const [lx, ly, lz] = NEBULA_ANCHOR.lookAt!
  const dx = lx - px
  const dy = ly - py
  const dz = lz - pz
  const len = Math.hypot(dx, dy, dz) || 1
  return [px + (dx / len) * 12, py + (dy / len) * 12 + 1.9, pz + (dz / len) * 12]
})()
