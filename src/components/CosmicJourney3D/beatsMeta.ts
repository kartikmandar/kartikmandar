// src/components/CosmicJourney3D/beatsMeta.ts
import type { Anchor, BeatMeta } from './types'

export const ORIGIN_ANCHOR: Anchor = { position: [0, 0, 12], lookAt: [0, 0, 0] }
export const NEBULA_ANCHOR: Anchor = { position: [0, 8, -180], lookAt: [0, 12, -210] }

// Anchors lay the 21 stations along a forward-and-down corridor in Z, gently
// alternating in X so the CatmullRom path curves. Tuned visually in later phases;
// these are real starting coordinates, not placeholders.
function station(i: number): Anchor {
  const z = -14 - i * 8
  const x = Math.sin(i * 0.9) * 6
  const y = Math.cos(i * 0.6) * 2.5
  return { position: [x, y, z], lookAt: [x * 0.3, y * 0.3, z - 6] }
}

const META: Array<[string, Partial<BeatMeta>]> = [
  ['nao-section', { acceptance: ['textbook page fades', 'outline planets lift off and become 3D spheres'] }],
  ['comet-section', { acceptance: ['particles accrete onto growing nucleus', 'coma + dust tail + ion tail away from sun'] }],
  ['decision-section', { acceptance: ['vignette tunnel closes', 'astronomer figure sharpens into focus + telescope past 50%'] }],
  ['constellation-section', { acceptance: ['engineering cluster fades', 'Gemini named stars light + indigo lines connect'] }],
  ['search-section-wrapper', { scrollLength: 120, acceptance: ['terminal prompt types the 3 phrases', 'caret turns green on IISER Bhopal'] }],
  ['new-system-section', { acceptance: ['central node connects out to academic/code nodes one by one'] }],
  ['fixation-section', { acceptance: ['compass needle swings from N and locks on growing Physics star'] }],
  ['slingshot-section', { pin: true, acceptance: ['planet orbits yellow sun, transfers to blue-indigo sun, new orbit'] }],
  ['lens-section', { acceptance: ['focus sweeps Maths/Physics/Data Sci orbs', 'focus ring expands'] }],
  ['internship-section', { acceptance: ['two diverging paths: blue->phone (EECS), green->DNA (iGEM)'] }],
  ['injury-section', { acceptance: ['shuttlecock rises, cracks, shatters into ~25 falling shards (generated once)'] }],
  ['rri-research-section', { acceptance: ['radio dishes + green baselines between pairs', 'noisy curve resolves to RRIViz sine'] }],
  ['gsoc-section', { pin: true, acceptance: ['dashboard assembles: wireframe->panels->typed content + 3 plots'] }],
  ['radio-section', { acceptance: ['axes LST x Visibility Amplitude', 'green visibility curve draws in'] }],
  ['doubling-down-section', { acceptance: ['day->night sky', 'College bar fades, RRIViz bar glows'] }],
  ['bs-exit-section', { acceptance: ['fork: BS-MS ghost dashed up, yellow BS-Exit branch, traveler takes new branch'] }],
  ['lensing-section', { pin: true, acceptance: ['lens warps galaxy field', 'Einstein ring grows/shrinks (sin(progress*PI))'] }],
  ['publication-section', { acceptance: ['paper (arXiv:2506.02130, fftvis title) folds to plane, trails split to U Toronto + IIT Indore'] }],
  ['cygnus-publication-section', { acceptance: ['milestone path: NuSTAR/Data/Analysis/Results/Paper/ZTF with traveling particles'] }],
  ['analysis-section', { pin: true, acceptance: ['Cygnus black hole + rings', 'RRIViz grid', 'crystal absorbs LaTeX symbols'] }],
  ['journey-continues-section', { scrollLength: 160, acceptance: ['walker ascends narrowing star path', 'nebula grows', 'fly into nebula finale'] }],
]

export const BEATS_META: Record<string, BeatMeta> = Object.fromEntries(
  META.map(([id, partial], i) => [
    id,
    {
      scrollLength: partial.scrollLength ?? 100,
      pin: partial.pin ?? false,
      anchor: partial.anchor ?? station(i),
      posterSrc: `/media/my-story/${id}.jpg`,
      acceptance: partial.acceptance ?? [],
    } satisfies BeatMeta,
  ]),
)
