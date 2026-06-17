# My-Story WebGL Scrollytelling — Phase 0 (Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the end-to-end architectural skeleton of the new `/my-story` cinematic WebGL scroll journey — a single R3F canvas, Framer-Motion-driven spline camera, the beat registry as single source of truth, DOM overlay + chapter rail + reduced-motion fallback — running the full flight with an origin black hole and one faithful reference scene, behind a preview route so the existing page is untouched.

**Architecture:** One fixed-position React Three Fiber `<Canvas>` (one WebGL context) sits behind a tall scroll container. Framer Motion `useScroll` produces a `MotionValue` written to a ref; R3F reads it in `useFrame` with zero per-frame React re-renders and drives a `CatmullRomCurve3` camera. All copy + per-beat metadata live in pure modules (`narrative.ts`, `beatsMeta.ts`) that both the 3D scenes and the real-DOM overlay render from. Pure logic (copy, scroll math, tiers, camera easing) is unit-tested in the existing node/Vitest harness; visual R3F pieces are implemented with concrete code and verified on the dev server.

**Tech Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Three.js 0.183 · `@react-three/fiber` · `@react-three/drei` · `@react-three/postprocessing` · Framer Motion 12 · Vitest 4.

## Global Constraints

- **Narrative is preserved byte-for-byte.** Headlines, body copy, eyebrows, order, and the typed phrases are reproduced verbatim from the spec §7 — including existing typos ("fascinaing"; the double space in "I  solidified"). Copy lives only in `narrative.ts`; a snapshot test pins it. Source of truth: `docs/superpowers/specs/2026-06-17-my-story-webgl-scrollytelling-revamp-design.md`.
- **One WebGL context.** Never instantiate a second renderer/canvas.
- **One time base.** Scene/camera motion uses the shared `useFrame` clock — never `Date.now()`, never `+= constant` per frame.
- **Reduced-motion-first.** Respect `prefers-reduced-motion` (media query + `matchMedia` listener); narrative copy is always real DOM (`h2`/`p`), the canvas is `aria-hidden`.
- **Non-destructive.** The existing `src/blocks/CosmicJourney/Component.tsx` and `/my-story` route stay working until parity. New work lives in `src/components/CosmicJourney3D/` and a `/my-story/preview` route.
- **Code style:** 2-space indentation, descriptive names, `'use client'` only where needed.
- **Commits:** conventional-commit format; **no Claude co-authorship line** (user rule). Ask before any non-commit git operation; committing is pre-authorized for this plan.
- **Tests:** pure-logic, node-environment `*.test.ts` under `src/**/__tests__/` (matches the existing harness; do not add jsdom in this phase).

---

## File Structure

```
src/components/CosmicJourney3D/
  types.ts                      # shared types: SceneProps, QualityTier, Beat, Anchor
  narrative.ts                  # PURE: ordered copy/metadata (hero prologue + 21 beats)
  beatsMeta.ts                  # PURE: id -> { scrollLength, pin, anchor, posterSrc, acceptance }
  scrollMath.ts                 # PURE: cumulative ranges, locate(progress) -> {index, local}
  cameraPath.ts                 # PURE: easedCurveU(progress) camera-parameter easing
  tiers.ts                      # PURE: quality-tier selection (extends QuasarBackground/tierSelect)
  registry.tsx                  # 'use client' wiring: narrative + meta + Scene components -> Beat[]
  ScrollRig.tsx                 # Framer Motion useScroll -> MotionValue ref + context
  CameraRig.tsx                 # R3F: spline camera driven by scroll ref + cameraPath
  Environment.tsx               # R3F: starfield, nebula, lighting, postprocessing
  Overlay.tsx                   # DOM narrative panels (real, crawlable copy) synced to active beat
  ChapterRail.tsx               # chapter/progress rail, click-to-jump, skip
  Fallback.tsx                  # reduced-motion / no-WebGL static experience
  fallbackPlan.ts               # PURE: decide fallback mode + copy list
  scenes/
    OriginBlackHole.tsx         # origin black-hole stand-in (Phase 1 ports the real raymarch shader)
    Beat_Constellation.tsx      # reference volumetric scene proving the SceneProps contract
    UnbuiltBeatMarker.tsx       # real anchored marker for not-yet-built beats (keeps flight complete)
  index.tsx                     # 'use client': mounts Canvas + rig + overlay + rail + fallback gating
  __tests__/
    narrative.test.ts
    beatsMeta.test.ts
    scrollMath.test.ts
    cameraPath.test.ts
    tiers.test.ts
    fallbackPlan.test.ts

src/app/(frontend)/my-story/preview/page.tsx   # preview route (existing /my-story untouched)
next.config.js                                  # add transpilePackages: ['three']
```

---

## Task 1: Dependencies & build config

**Files:**
- Modify: `package.json` (dependencies)
- Modify: `next.config.js:8-84` (add `transpilePackages`)

**Interfaces:**
- Produces: the three new packages resolvable by app and dev server; `three` transpiled by Next.

- [ ] **Step 1: Install the R3F stack**

Run:
```bash
pnpm add @react-three/fiber @react-three/drei @react-three/postprocessing
```
Expected: three new entries appear under `dependencies` in `package.json`; `pnpm-lock.yaml` updates.

- [ ] **Step 2: Add `transpilePackages` to `next.config.js`**

In the `nextConfig` object (currently lines 8-84), add the key right after `reactStrictMode: true,`:

```js
  reactStrictMode: true,
  transpilePackages: ['three'],
```

- [ ] **Step 3: Verify the toolchain still boots and tests pass**

Run:
```bash
pnpm test
pnpm exec tsc --noEmit
```
Expected: existing test suite passes (or "no tests" where applicable); typecheck succeeds. Then confirm the dev server boots:
```bash
pnpm dev
```
Expected: `✓ Ready` with no module-resolution errors. Stop it after confirming.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml next.config.js
git commit -m "build: add react-three-fiber stack and transpile three"
```

---

## Task 2: Narrative copy module + preservation test

**Files:**
- Create: `src/components/CosmicJourney3D/narrative.ts`
- Test: `src/components/CosmicJourney3D/__tests__/narrative.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface NarrativeBeat {
    id: string
    eyebrow?: string
    headline: string
    body?: string
    typedPhrases?: string[]
  }
  export const NARRATIVE: readonly NarrativeBeat[]   // 21 entries, in scroll order
  export const HERO_PHASES: readonly { phase: string; text: string }[]
  export const PAGE_TITLE = 'A Cosmic Journey'
  export const PAGE_SUBTITLE = 'The story of a path written in the stars.'
  ```

- [ ] **Step 1: Write the failing test**

```ts
// src/components/CosmicJourney3D/__tests__/narrative.test.ts
import { describe, it, expect } from 'vitest'
import { NARRATIVE, HERO_PHASES, PAGE_TITLE, PAGE_SUBTITLE } from '../narrative'

describe('narrative copy (preservation guard)', () => {
  it('has the 21 beats in order by id', () => {
    expect(NARRATIVE.map((b) => b.id)).toEqual([
      'nao-section', 'comet-section', 'decision-section', 'constellation-section',
      'search-section-wrapper', 'new-system-section', 'fixation-section', 'slingshot-section',
      'lens-section', 'internship-section', 'injury-section', 'rri-research-section',
      'gsoc-section', 'radio-section', 'doubling-down-section', 'bs-exit-section',
      'lensing-section', 'publication-section', 'cygnus-publication-section',
      'analysis-section', 'journey-continues-section',
    ])
  })

  it('preserves headline + eyebrow + body verbatim for sampled beats', () => {
    const nao = NARRATIVE[0]
    expect(nao.eyebrow).toBe('4th Standard')
    expect(nao.headline).toBe('The Spark: NAO')
    expect(nao.body).toBe(
      'Cleared the regional round of the National Astronomy Olympiad. Reading their textbooks sparked a fascination that led me to participating each year, fueling a deep interest in the cosmos.',
    )
    const comet = NARRATIVE[1]
    expect(comet.body).toContain('It was fascinaing.') // typo preserved on purpose
    const decision = NARRATIVE[2]
    expect(decision.body).toContain('I  solidified my resolve') // double space preserved
    const finale = NARRATIVE[20]
    expect(finale.headline).toBe('The Journey Continues...')
    expect(finale.body).toBe('...in search of a Master's in Astrophysics.')
    expect(finale.eyebrow).toBeUndefined()
  })

  it('keeps the search beat as typed phrases with no body', () => {
    const search = NARRATIVE[4]
    expect(search.body).toBeUndefined()
    expect(search.typedPhrases).toEqual(['DU > Hansraj College...', 'IISERs...', 'IISER Bhopal'])
  })

  it('carries the hero prologue phase copy', () => {
    expect(HERO_PHASES.map((p) => p.text)).toEqual([
      'Every story begins with a massive star.',
      'It dies in a supernova, outshining its entire galaxy.',
      'What remains collapses into a black hole. Matter spirals in, and the disk ignites.',
      'But this is just the surface of what really is happening!!',
    ])
    expect(PAGE_TITLE).toBe('A Cosmic Journey')
    expect(PAGE_SUBTITLE).toBe('The story of a path written in the stars.')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/CosmicJourney3D/__tests__/narrative.test.ts`
Expected: FAIL — cannot resolve `../narrative`.

- [ ] **Step 3: Implement `narrative.ts`**

Transcribe all copy verbatim from the live source `src/blocks/CosmicJourney/Component.tsx`, **decoding HTML entities to their characters**: `&apos;`→`'` (straight), `&quot;`→`"` (straight), `&amp;`→`&`. The source contains only straight quotes (verified: zero curly apostrophes); the deliberate typos ("fascinaing") and the double space ("I  solidified") are preserved exactly.

```ts
// src/components/CosmicJourney3D/narrative.ts
export interface NarrativeBeat {
  id: string
  eyebrow?: string
  headline: string
  body?: string
  typedPhrases?: string[]
}

export const PAGE_TITLE = 'A Cosmic Journey'
export const PAGE_SUBTITLE = 'The story of a path written in the stars.'

export const HERO_PHASES = [
  { phase: 'STAR', text: 'Every story begins with a massive star.' },
  { phase: 'SHELL', text: 'It dies in a supernova, outshining its entire galaxy.' },
  { phase: 'BIRTH', text: 'What remains collapses into a black hole. Matter spirals in, and the disk ignites.' },
  { phase: 'QUASAR', text: 'But this is just the surface of what really is happening!!' },
] as const

export const NARRATIVE: readonly NarrativeBeat[] = [
  { id: 'nao-section', eyebrow: '4th Standard', headline: 'The Spark: NAO',
    body: 'Cleared the regional round of the National Astronomy Olympiad. Reading their textbooks sparked a fascination that led me to participating each year, fueling a deep interest in the cosmos.' },
  { id: 'comet-section', eyebrow: '6th - 8th Standard', headline: 'Hands-On Exploration',
    body: 'Joined SPACE-India astronomy club at school. It was fascinaing. Solar observations, making dry-ice comets, finding asteroids, calculating Earth's circumference and overnight observation camps at Sariska somehow made the universe tangible.' },
  { id: 'decision-section', eyebrow: '9th - 10th Standard', headline: 'A Future Decided',
    body: 'With a clear vision, I decided my future lay among the cosmos. It seemed like a pipe dream but I  solidified my resolve to become an astronomer.' },
  { id: 'constellation-section', eyebrow: '11th - 12th Standard', headline: 'Forging My Own Path',
    body: 'Even though I chose PCM in my high school, I went on a goal to pursue research over engineering, built my own refractor, started the "Brittle Stars" blog, and played badminton competitively. I also bagged AIR 14 in Heliodyssey, winning a fully sponsored solar expedition to Oman to study an annular eclipse.' },
  { id: 'search-section-wrapper', eyebrow: 'Partial Drop Year', headline: 'Searching for the Right Trajectory',
    typedPhrases: ['DU > Hansraj College...', 'IISERs...', 'IISER Bhopal'] },
  { id: 'new-system-section', eyebrow: '1st Year at IISER Bhopal', headline: 'A New System',
    body: 'After a partial drop year, I joined the BS Economic Sciences programme at IISER Bhopal. The first semester was online due to COVID, a time I used to focus on full-stack web development alongside my studies.' },
  { id: 'fixation-section', eyebrow: 'Temporary Home', headline: 'Fixated on Physics',
    body: 'Though I started as an Economic Sciences student, my focus was always fixed on finding a way into physics and astronomy.' },
  { id: 'slingshot-section', eyebrow: 'End of 1st Year', headline: 'Orbital Correction',
    body: 'Scoring one of the highest CGPA in my branch gave me the option to switch. I chose to migrate to the 5-year BS-MS Natural Sciences programme, correcting my course toward astrophysics.' },
  { id: 'lens-section', eyebrow: '2nd & 3rd Year', headline: 'Finding My Sun',
    body: 'Exploring Physics, Maths, and Data Science as pre-majors, I finally chose Physics as my major and joined the IISER Bhopal Astronomy Club and the Sports Council.' },
  { id: 'internship-section', eyebrow: 'After 2nd Year', headline: 'Dual Pathways',
    body: 'I got selected for an internship in Sysmatics Lab at EECS department, to develop a mobile app for collecting data for detecting signs of depression among academicians. Also got selected for the iGEM team of IISER Bhopal for the synthetic biology competition organized by MIT in Paris.' },
  { id: 'injury-section', eyebrow: 'Leadership & Setbacks', headline: 'Captaincy and Injury',
    body: 'I captained the IISER Bhopal badminton team at the Inter IISER Sports Meet. Unfortunately, I also broke my shoulder and tore my ACL during a game, leading me to transition my role from captain to a coach.' },
  { id: 'rri-research-section', eyebrow: 'Summer After 3rd Year', headline: 'First Foray into Research',
    body: 'Joined Raman Research Institute as a visiting student, working with the HERA radio array in South Africa. As a part of the validation team, I built my own visibility simulator, RRIViz.' },
  { id: 'gsoc-section', eyebrow: 'Google Summer of Code 2024', headline: 'GSoC & Open Source',
    body: 'Selected for Google Summer of Code with Stingray, I built a quicklook dashboard for X-ray time series data. This marked the start of my open-source journey.' },
  { id: 'radio-section', headline: 'HERA: Seeing the Invisible',
    body: 'My work at RRI involved simulating visibility data from radio interferometers like HERA. I also learned about matvis and other popular visibility simulators.' },
  { id: 'doubling-down-section', eyebrow: 'Winter Vacation', headline: 'Doubling Down',
    body: 'Successfully completing both internships, I churned the midnight oil and returned to RRI in December to continue my work on RRIViz.' },
  { id: 'bs-exit-section', eyebrow: 'A Strategic Pivot', headline: 'The BS Exit Decision',
    body: 'I decided to take a BS exit from college to pursue an MS in Astrophysics elsewhere for better opportunities.' },
  { id: 'lensing-section', eyebrow: 'Summer of Code 2025', headline: 'GSoC 2025: ML for Science',
    body: 'Selected again for GSoC with ML4SCI, working on an LSST data analysis pipeline for DeepLense and applying machine learning to gravitational lensing.' },
  { id: 'publication-section', eyebrow: 'Third RRI Stint', headline: 'First Publication & New Horizons',
    body: 'Returning to RRI, I worked on fftvis, leading to my first co-authored paper on arXiv. I was also selected for fully-sponsored summer programs at the University of Toronto and IIT Indore for SKA training.' },
  { id: 'cygnus-publication-section', eyebrow: 'Second Publication & Some Training', headline: 'Cygnus X-1 Discovery & ZTF Summer School',
    body: 'Timing analysis of Cygnus X-1 using 26 NuSTAR observations resulted in my second co-authored paper submitted to arXiv. Selected for the prestigious ZTF Summer School at Caltech, focusing on data science techniques for the Rubin Observatory era.' },
  { id: 'analysis-section', eyebrow: 'Current Endeavors', headline: 'What I am working on?',
    body: 'Currently working across different projects: spectral analysis of Cygnus X-1, RRIVis version 2 with polarization and antenna beam support, contributing to RIPPLe, DAVE and Stingray, and maintaining fftvis.' },
  { id: 'journey-continues-section', headline: 'The Journey Continues...',
    body: '...in search of a Master's in Astrophysics.' },
]
```

> Note on quotes: in source these are HTML entities — `&quot;Brittle Stars&quot;`, `Earth&apos;s`, `Master&apos;s` — which render to **straight** `"` and `'`. `narrative.ts` stores the decoded straight characters (React renders them as text). The test asserts the straight finale form.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/components/CosmicJourney3D/__tests__/narrative.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/CosmicJourney3D/narrative.ts src/components/CosmicJourney3D/__tests__/narrative.test.ts
git commit -m "feat: add preserved my-story narrative copy module"
```

---

## Task 2 verbatim-quote correction note

If Step 4 fails on the constellation straight-quotes vs. the source, open the current `src/blocks/CosmicJourney/Component.tsx`, search the original JSX for "Brittle Stars", and copy the exact quote characters into `narrative.ts`. Re-run the test. (The original uses straight ASCII double quotes around Brittle Stars.) Then re-commit with `git commit --amend --no-edit` only if not yet pushed.

---

## Task 3: Per-beat metadata module (anchors, scroll length, posters)

**Files:**
- Create: `src/components/CosmicJourney3D/types.ts`
- Create: `src/components/CosmicJourney3D/beatsMeta.ts`
- Test: `src/components/CosmicJourney3D/__tests__/beatsMeta.test.ts`

**Interfaces:**
- Produces (`types.ts`):
  ```ts
  export type QualityTier = 'high' | 'low' | 'mobile'
  export interface Anchor { position: [number, number, number]; lookAt?: [number, number, number] }
  export interface SceneProps { localProgress: number; clock: number; quality: QualityTier; reducedMotion: boolean }
  export interface BeatMeta { scrollLength: number; pin: boolean; anchor: Anchor; posterSrc: string; acceptance: string[] }
  ```
- Produces (`beatsMeta.ts`): `export const BEATS_META: Record<string, BeatMeta>` keyed by every `NARRATIVE` id, plus `export const ORIGIN_ANCHOR: Anchor` and `export const NEBULA_ANCHOR: Anchor`.

- [ ] **Step 1: Write the failing test**

```ts
// src/components/CosmicJourney3D/__tests__/beatsMeta.test.ts
import { describe, it, expect } from 'vitest'
import { NARRATIVE } from '../narrative'
import { BEATS_META, ORIGIN_ANCHOR, NEBULA_ANCHOR } from '../beatsMeta'

describe('beatsMeta', () => {
  it('has metadata for every narrative beat and nothing extra', () => {
    const metaIds = Object.keys(BEATS_META).sort()
    const narrativeIds = NARRATIVE.map((b) => b.id).sort()
    expect(metaIds).toEqual(narrativeIds)
  })

  it('every beat has a positive scroll length, an anchor position, a poster, and acceptance notes', () => {
    for (const b of NARRATIVE) {
      const m = BEATS_META[b.id]
      expect(m.scrollLength).toBeGreaterThan(0)
      expect(m.anchor.position).toHaveLength(3)
      expect(m.posterSrc).toMatch(/^\/media\/.+\.(jpg|png|webp)$/)
      expect(m.acceptance.length).toBeGreaterThan(0)
    }
  })

  it('exposes distinct origin and nebula anchors for the flight ends', () => {
    expect(ORIGIN_ANCHOR.position).toHaveLength(3)
    expect(NEBULA_ANCHOR.position).toHaveLength(3)
    expect(ORIGIN_ANCHOR.position).not.toEqual(NEBULA_ANCHOR.position)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/CosmicJourney3D/__tests__/beatsMeta.test.ts`
Expected: FAIL — cannot resolve `../beatsMeta` / `../types`.

- [ ] **Step 3: Implement `types.ts` then `beatsMeta.ts`**

```ts
// src/components/CosmicJourney3D/types.ts
export type QualityTier = 'high' | 'low' | 'mobile'

export interface Anchor {
  position: [number, number, number]
  lookAt?: [number, number, number]
}

export interface SceneProps {
  localProgress: number
  clock: number
  quality: QualityTier
  reducedMotion: boolean
}

export interface BeatMeta {
  scrollLength: number
  pin: boolean
  anchor: Anchor
  posterSrc: string
  acceptance: string[]
}
```

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/components/CosmicJourney3D/__tests__/beatsMeta.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/CosmicJourney3D/types.ts src/components/CosmicJourney3D/beatsMeta.ts src/components/CosmicJourney3D/__tests__/beatsMeta.test.ts
git commit -m "feat: add per-beat metadata, anchors, and flight-end anchors"
```

---

## Task 4: Scroll math (cumulative ranges + locate)

**Files:**
- Create: `src/components/CosmicJourney3D/scrollMath.ts`
- Test: `src/components/CosmicJourney3D/__tests__/scrollMath.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface Range { start: number; end: number }     // normalized [0,1]
  export function cumulativeRanges(lengths: number[]): Range[]
  export function locate(progress: number, ranges: Range[]): { index: number; local: number }
  export function chapterOffset(index: number, ranges: Range[]): number  // scroll target for click-to-jump
  ```

- [ ] **Step 1: Write the failing test**

```ts
// src/components/CosmicJourney3D/__tests__/scrollMath.test.ts
import { describe, it, expect } from 'vitest'
import { cumulativeRanges, locate, chapterOffset } from '../scrollMath'

describe('cumulativeRanges', () => {
  it('normalizes lengths into contiguous [0,1] ranges', () => {
    const r = cumulativeRanges([100, 100, 200]) // total 400
    expect(r[0]).toEqual({ start: 0, end: 0.25 })
    expect(r[1]).toEqual({ start: 0.25, end: 0.5 })
    expect(r[2]).toEqual({ start: 0.5, end: 1 })
  })
})

describe('locate', () => {
  const ranges = cumulativeRanges([100, 100, 200])

  it('maps a global progress to the right beat and a full 0..1 local', () => {
    expect(locate(0, ranges)).toEqual({ index: 0, local: 0 })
    expect(locate(0.125, ranges)).toEqual({ index: 0, local: 0.5 })
    expect(locate(0.5, ranges)).toEqual({ index: 2, local: 0 })
    expect(locate(0.75, ranges)).toEqual({ index: 2, local: 0.5 }) // tall finale still sees full range
    expect(locate(1, ranges)).toEqual({ index: 2, local: 1 })
  })

  it('clamps out-of-range progress', () => {
    expect(locate(-0.2, ranges)).toEqual({ index: 0, local: 0 })
    expect(locate(1.5, ranges)).toEqual({ index: 2, local: 1 })
  })

  it('a short beat still traverses local 0..1 (edge-case the old build broke)', () => {
    const r2 = cumulativeRanges([120, 100, 100, 100]) // first beat short relative to a tall finale
    expect(locate(r2[0].start, r2)).toEqual({ index: 0, local: 0 })
    expect(locate((r2[0].start + r2[0].end) / 2, r2).local).toBeCloseTo(0.5, 5)
    expect(locate(r2[0].end - 1e-9, r2).index).toBe(0)
  })
})

describe('chapterOffset', () => {
  it('returns the start of a beat for click-to-jump', () => {
    const ranges = cumulativeRanges([100, 100, 200])
    expect(chapterOffset(1, ranges)).toBeCloseTo(0.25, 5)
    expect(chapterOffset(2, ranges)).toBeCloseTo(0.5, 5)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/CosmicJourney3D/__tests__/scrollMath.test.ts`
Expected: FAIL — cannot resolve `../scrollMath`.

- [ ] **Step 3: Implement `scrollMath.ts`**

```ts
// src/components/CosmicJourney3D/scrollMath.ts
export interface Range { start: number; end: number }

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

export function cumulativeRanges(lengths: number[]): Range[] {
  const total = lengths.reduce((a, b) => a + b, 0) || 1
  const ranges: Range[] = []
  let acc = 0
  for (const len of lengths) {
    const start = acc / total
    acc += len
    ranges.push({ start, end: acc / total })
  }
  // guard the last end against floating drift
  if (ranges.length) ranges[ranges.length - 1].end = 1
  return ranges
}

export function locate(progress: number, ranges: Range[]): { index: number; local: number } {
  const p = clamp01(progress)
  for (let i = 0; i < ranges.length; i++) {
    const { start, end } = ranges[i]
    if (p < end || i === ranges.length - 1) {
      const span = end - start || 1
      return { index: i, local: clamp01((p - start) / span) }
    }
  }
  return { index: 0, local: 0 }
}

export function chapterOffset(index: number, ranges: Range[]): number {
  return ranges[index]?.start ?? 0
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/components/CosmicJourney3D/__tests__/scrollMath.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/CosmicJourney3D/scrollMath.ts src/components/CosmicJourney3D/__tests__/scrollMath.test.ts
git commit -m "feat: add scroll-progress math with full-range edge handling"
```

---

## Task 5: Camera-parameter easing

**Files:**
- Create: `src/components/CosmicJourney3D/cameraPath.ts`
- Test: `src/components/CosmicJourney3D/__tests__/cameraPath.test.ts`

**Interfaces:**
- Consumes: `Range` from `scrollMath.ts`.
- Produces:
  ```ts
  export function easedCurveU(progress: number, ranges: Range[]): number  // [0,1] curve param, dwells at stations
  export function smootherstep(t: number): number
  ```

- [ ] **Step 1: Write the failing test**

```ts
// src/components/CosmicJourney3D/__tests__/cameraPath.test.ts
import { describe, it, expect } from 'vitest'
import { cumulativeRanges } from '../scrollMath'
import { easedCurveU, smootherstep } from '../cameraPath'

describe('smootherstep', () => {
  it('pins endpoints and has near-zero slope at the ends', () => {
    expect(smootherstep(0)).toBe(0)
    expect(smootherstep(1)).toBe(1)
    expect(smootherstep(0.5)).toBeCloseTo(0.5, 5)
    expect(smootherstep(0.02)).toBeLessThan(0.02) // slow start
  })
})

describe('easedCurveU', () => {
  const ranges = cumulativeRanges([100, 100, 100, 100]) // 4 beats

  it('is 0 at progress 0 and 1 at progress 1', () => {
    expect(easedCurveU(0, ranges)).toBeCloseTo(0, 6)
    expect(easedCurveU(1, ranges)).toBeCloseTo(1, 6)
  })

  it('maps each beat center to its station parameter on the curve', () => {
    // station i sits at curve param i/(N-1); beat-i center progress eases to it
    const centers = ranges.map((r) => (r.start + r.end) / 2)
    centers.forEach((c, i) => {
      expect(easedCurveU(c, ranges)).toBeCloseTo(i / (ranges.length - 1), 5)
    })
  })

  it('is monotonically non-decreasing across the scroll', () => {
    let prev = -1
    for (let p = 0; p <= 1.00001; p += 0.01) {
      const u = easedCurveU(p, ranges)
      expect(u).toBeGreaterThanOrEqual(prev - 1e-9)
      prev = u
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/CosmicJourney3D/__tests__/cameraPath.test.ts`
Expected: FAIL — cannot resolve `../cameraPath`.

- [ ] **Step 3: Implement `cameraPath.ts`**

The curve parameter interpolates between *station centers* with `smootherstep`, so the camera reaches station `i` (curve param `i/(N-1)`) exactly when scroll is at the center of beat `i`, and slows to a near-stop there — the "one unbroken take that dwells at each beat" feel. Before the first center it holds at `0`; after the last center it holds at `1`.

```ts
// src/components/CosmicJourney3D/cameraPath.ts
import type { Range } from './scrollMath'

export function smootherstep(t: number): number {
  const x = Math.max(0, Math.min(1, t))
  return x * x * x * (x * (x * 6 - 15) + 10)
}

// Map global scroll progress -> CatmullRom curve parameter u in [0,1].
// Station i sits at u = i/(N-1), reached at the CENTER of beat i's scroll range.
// Between adjacent centers, u eases with smootherstep (slow arrival + departure).
export function easedCurveU(progress: number, ranges: Range[]): number {
  const n = ranges.length
  if (n <= 1) return smootherstep(progress)
  const p = Math.max(0, Math.min(1, progress))
  const centers = ranges.map((r) => (r.start + r.end) / 2)
  if (p <= centers[0]) return 0
  if (p >= centers[n - 1]) return 1
  let i = 0
  while (i < n - 1 && !(p >= centers[i] && p <= centers[i + 1])) i++
  const t = (p - centers[i]) / (centers[i + 1] - centers[i] || 1)
  return (i + smootherstep(t)) / (n - 1)
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/components/CosmicJourney3D/__tests__/cameraPath.test.ts`
Expected: PASS. (Centers map exactly: at a center, `t` is `0` or `1`, so `u = i/(N-1)`; the clamped ends and per-interval `smootherstep` keep `u` monotonic.)

- [ ] **Step 5: Commit**

```bash
git add src/components/CosmicJourney3D/cameraPath.ts src/components/CosmicJourney3D/__tests__/cameraPath.test.ts
git commit -m "feat: add camera-parameter easing that dwells at each station"
```

---

## Task 6: Quality-tier selection

**Files:**
- Create: `src/components/CosmicJourney3D/tiers.ts`
- Test: `src/components/CosmicJourney3D/__tests__/tiers.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface JourneyEnv { reducedMotion: boolean; coarsePointer: boolean; smallScreen: boolean; deviceMemoryGb: number | null; webgl2: boolean }
  export function selectQuality(env: JourneyEnv): QualityTier   // 'high' | 'low' | 'mobile'
  export function readJourneyEnv(): JourneyEnv                  // browser reads (thin, untested)
  ```

- [ ] **Step 1: Write the failing test**

```ts
// src/components/CosmicJourney3D/__tests__/tiers.test.ts
import { describe, it, expect } from 'vitest'
import { selectQuality, type JourneyEnv } from '../tiers'

const desktop: JourneyEnv = { reducedMotion: false, coarsePointer: false, smallScreen: false, deviceMemoryGb: 16, webgl2: true }

describe('selectQuality', () => {
  it('capable desktop -> high', () => {
    expect(selectQuality(desktop)).toBe('high')
  })
  it('coarse pointer + small screen -> mobile', () => {
    expect(selectQuality({ ...desktop, coarsePointer: true, smallScreen: true })).toBe('mobile')
  })
  it('low device memory -> low', () => {
    expect(selectQuality({ ...desktop, deviceMemoryGb: 4 })).toBe('low')
  })
  it('no webgl2 -> mobile (cheapest path)', () => {
    expect(selectQuality({ ...desktop, webgl2: false })).toBe('mobile')
  })
  it('unknown memory does not downgrade a desktop', () => {
    expect(selectQuality({ ...desktop, deviceMemoryGb: null })).toBe('high')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/CosmicJourney3D/__tests__/tiers.test.ts`
Expected: FAIL — cannot resolve `../tiers`.

- [ ] **Step 3: Implement `tiers.ts`**

```ts
// src/components/CosmicJourney3D/tiers.ts
import type { QualityTier } from './types'

export interface JourneyEnv {
  reducedMotion: boolean
  coarsePointer: boolean
  smallScreen: boolean
  deviceMemoryGb: number | null
  webgl2: boolean
}

// Order: hard floor (no webgl2) > phone > low-memory > heuristics > high.
export function selectQuality(env: JourneyEnv): QualityTier {
  if (!env.webgl2) return 'mobile'
  if (env.coarsePointer && env.smallScreen) return 'mobile'
  if (env.deviceMemoryGb !== null && env.deviceMemoryGb <= 4) return 'low'
  return 'high'
}

export function readJourneyEnv(): JourneyEnv {
  const canMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  const nav = navigator as Navigator & { deviceMemory?: number }
  let webgl2 = false
  try {
    webgl2 = !!document.createElement('canvas').getContext('webgl2')
  } catch {
    webgl2 = false
  }
  return {
    reducedMotion: canMatchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
    coarsePointer: canMatchMedia ? window.matchMedia('(pointer: coarse)').matches : false,
    smallScreen: typeof window !== 'undefined' ? Math.min(window.screen.width, window.screen.height) < 768 : false,
    deviceMemoryGb: typeof nav?.deviceMemory === 'number' ? nav.deviceMemory : null,
    webgl2,
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/components/CosmicJourney3D/__tests__/tiers.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/CosmicJourney3D/tiers.ts src/components/CosmicJourney3D/__tests__/tiers.test.ts
git commit -m "feat: add journey quality-tier selection"
```

---

## Task 7: Reduced-motion / fallback plan (pure) + Fallback component

**Files:**
- Create: `src/components/CosmicJourney3D/fallbackPlan.ts`
- Create: `src/components/CosmicJourney3D/Fallback.tsx`
- Test: `src/components/CosmicJourney3D/__tests__/fallbackPlan.test.ts`

**Interfaces:**
- Consumes: `NARRATIVE`, `BEATS_META`.
- Produces:
  ```ts
  export type FallbackMode = 'none' | 'static'
  export function fallbackMode(reducedMotion: boolean, webgl2: boolean): FallbackMode
  export interface FallbackEntry { id: string; eyebrow?: string; headline: string; body?: string; posterSrc: string }
  export function fallbackEntries(): FallbackEntry[]   // full DOM narrative, in order
  ```

- [ ] **Step 1: Write the failing test**

```ts
// src/components/CosmicJourney3D/__tests__/fallbackPlan.test.ts
import { describe, it, expect } from 'vitest'
import { fallbackMode, fallbackEntries } from '../fallbackPlan'
import { NARRATIVE } from '../narrative'

describe('fallbackMode', () => {
  it('uses static experience when reduced-motion is requested', () => {
    expect(fallbackMode(true, true)).toBe('static')
  })
  it('uses static experience when WebGL2 is unavailable', () => {
    expect(fallbackMode(false, false)).toBe('static')
  })
  it('otherwise runs the full motion experience', () => {
    expect(fallbackMode(false, true)).toBe('none')
  })
})

describe('fallbackEntries', () => {
  it('emits every beat as DOM-ready copy in order with a poster', () => {
    const entries = fallbackEntries()
    expect(entries.map((e) => e.id)).toEqual(NARRATIVE.map((b) => b.id))
    for (const e of entries) {
      expect(e.headline.length).toBeGreaterThan(0)
      expect(e.posterSrc).toMatch(/^\/media\//)
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/CosmicJourney3D/__tests__/fallbackPlan.test.ts`
Expected: FAIL — cannot resolve `../fallbackPlan`.

- [ ] **Step 3: Implement `fallbackPlan.ts` then `Fallback.tsx`**

```ts
// src/components/CosmicJourney3D/fallbackPlan.ts
import { NARRATIVE } from './narrative'
import { BEATS_META } from './beatsMeta'

export type FallbackMode = 'none' | 'static'

export function fallbackMode(reducedMotion: boolean, webgl2: boolean): FallbackMode {
  return reducedMotion || !webgl2 ? 'static' : 'none'
}

export interface FallbackEntry {
  id: string
  eyebrow?: string
  headline: string
  body?: string
  posterSrc: string
}

export function fallbackEntries(): FallbackEntry[] {
  return NARRATIVE.map((b) => ({
    id: b.id,
    eyebrow: b.eyebrow,
    headline: b.headline,
    body: b.body,
    posterSrc: BEATS_META[b.id].posterSrc,
  }))
}
```

```tsx
// src/components/CosmicJourney3D/Fallback.tsx
'use client'

import Image from 'next/image'
import { fallbackEntries } from './fallbackPlan'
import { PAGE_TITLE, PAGE_SUBTITLE } from './narrative'

// Static, fully-readable experience for reduced-motion / no-WebGL users.
// Posters may not exist yet (generated in a later phase); alt text + copy carry meaning.
export default function Fallback() {
  const entries = fallbackEntries()
  return (
    <section aria-label={PAGE_TITLE} style={{ background: '#05060d', color: '#e8eaf5' }}>
      <header style={{ textAlign: 'center', padding: '12vh 1rem 6vh' }}>
        <h1>{PAGE_TITLE}</h1>
        <p style={{ opacity: 0.7 }}>{PAGE_SUBTITLE}</p>
      </header>
      {entries.map((e) => (
        <article key={e.id} style={{ maxWidth: 720, margin: '0 auto', padding: '4vh 1.25rem' }}>
          {e.eyebrow && (
            <div style={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: 12, color: '#a5b4fc' }}>{e.eyebrow}</div>
          )}
          <h2>{e.headline}</h2>
          {e.body && <p style={{ opacity: 0.85, lineHeight: 1.6 }}>{e.body}</p>}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', marginTop: 12, borderRadius: 10, overflow: 'hidden', background: '#0b0e1c' }}>
            <Image src={e.posterSrc} alt={e.headline} fill style={{ objectFit: 'cover' }} unoptimized />
          </div>
        </article>
      ))}
    </section>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/components/CosmicJourney3D/__tests__/fallbackPlan.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/CosmicJourney3D/fallbackPlan.ts src/components/CosmicJourney3D/Fallback.tsx src/components/CosmicJourney3D/__tests__/fallbackPlan.test.ts
git commit -m "feat: add reduced-motion fallback plan and static experience"
```

---

## Task 8: Scroll bridge (Framer Motion → ref + context)

**Files:**
- Create: `src/components/CosmicJourney3D/ScrollRig.tsx`

**Interfaces:**
- Produces:
  ```ts
  export const ScrollProgressContext: React.Context<React.MutableRefObject<number>>
  export function useScrollProgressRef(): React.MutableRefObject<number>
  export function ScrollRig(props: { totalScrollVh: number; children: React.ReactNode }): JSX.Element
  ```
  `ScrollRig` renders a tall spacer of height `totalScrollVh` and provides a ref whose `.current` is the live 0..1 scroll progress (updated by Framer Motion without re-rendering).

- [ ] **Step 1: Implement `ScrollRig.tsx`**

```tsx
// src/components/CosmicJourney3D/ScrollRig.tsx
'use client'

import React, { createContext, useContext, useRef } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'

export const ScrollProgressContext = createContext<React.MutableRefObject<number>>({ current: 0 })

export function useScrollProgressRef() {
  return useContext(ScrollProgressContext)
}

export function ScrollRig({ totalScrollVh, children }: { totalScrollVh: number; children: React.ReactNode }) {
  const targetRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start start', 'end end'] })

  // Write to a ref only — no React state, so R3F reads it per-frame with zero re-renders.
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    progressRef.current = v
  })

  return (
    <ScrollProgressContext.Provider value={progressRef}>
      {/* tall scroll driver; the fixed canvas + overlay live in children */}
      <div ref={targetRef} style={{ position: 'relative', height: `${totalScrollVh}vh` }}>
        {children}
      </div>
    </ScrollProgressContext.Provider>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors in `ScrollRig.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/CosmicJourney3D/ScrollRig.tsx
git commit -m "feat: add Framer Motion scroll bridge with zero per-frame re-renders"
```

---

## Task 9: Scene contract — OriginBlackHole, Beat_Constellation, UnbuiltBeatMarker

**Files:**
- Create: `src/components/CosmicJourney3D/scenes/OriginBlackHole.tsx`
- Create: `src/components/CosmicJourney3D/scenes/Beat_Constellation.tsx`
- Create: `src/components/CosmicJourney3D/scenes/UnbuiltBeatMarker.tsx`

**Interfaces:**
- Consumes: `SceneProps` from `types.ts`.
- Produces three `React.FC<SceneProps>` scene components. `Beat_Constellation` faithfully renders the constellation beat's acceptance (Gemini named stars + indigo connecting lines that complete by `localProgress ≈ 0.4`, engineering cluster fades out). `UnbuiltBeatMarker` renders a faint wireframe placeholder so unbuilt beats still occupy their anchor while the flight runs end-to-end.

- [ ] **Step 1: Implement `OriginBlackHole.tsx` (stand-in; Phase 1 ports the raymarch shader)**

```tsx
// src/components/CosmicJourney3D/scenes/OriginBlackHole.tsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { SceneProps } from '../types'

// Stand-in origin black hole: dark sphere + emissive accretion ring.
// Phase 1 replaces the internals with the ported blackhole.frag.ts raymarch shader.
export default function OriginBlackHole({ clock, reducedMotion }: SceneProps) {
  const ring = useRef<THREE.Mesh>(null)
  useFrame(() => {
    if (ring.current && !reducedMotion) ring.current.rotation.z = clock * 0.3
  })
  return (
    <group>
      <mesh>
        <sphereGeometry args={[1.6, 48, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[2.6, 0.5, 24, 120]} />
        <meshBasicMaterial color="#f59e0b" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={6} color="#ffd9a0" distance={40} />
    </group>
  )
}
```

- [ ] **Step 2: Implement `Beat_Constellation.tsx` (the reference faithful scene)**

```tsx
// src/components/CosmicJourney3D/scenes/Beat_Constellation.tsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { SceneProps } from '../types'

// Acceptance: engineering cluster fades; Gemini named stars light; indigo lines
// connect, completing by localProgress ~0.4 (mirrors drawConstellations).
const RESEARCH = [
  [0.4, 0.25], [0.25, 0.3], [0.55, 0.45], [0.45, 0.65], [0.3, 0.8],
  [0.85, 0.6], [0.89, 0.68], [0.93, 0.75], [0.6, 0.35], [0.2, 0.5],
] as const
const LINES = [[1, 3], [3, 4], [0, 2], [2, 4], [0, 8], [1, 9], [2, 5], [5, 6], [6, 7]] as const
const ENGINEERING = [[0.75, 0.3], [0.7, 0.5], [0.6, 0.55], [0.65, 0.7], [0.75, 0.8]] as const

// Map the original 2D [0..1] layout into the XY plane of this beat's local space.
const toPos = (p: readonly [number, number]) =>
  new THREE.Vector3((p[0] - 0.5) * 10, (0.5 - p[1]) * 7, 0)

export default function Beat_Constellation({ localProgress }: SceneProps) {
  const researchPts = useMemo(() => RESEARCH.map(toPos), [])
  const engPts = useMemo(() => ENGINEERING.map(toPos), [])
  const lineDone = Math.min(1, localProgress / 0.4)
  const engAlpha = Math.max(0, 1 - localProgress * 2.5)

  const linePositions = useMemo(() => {
    const arr: number[] = []
    LINES.forEach(([a, b], i) => {
      if (lineDone * LINES.length > i) {
        const t = Math.min(1, lineDone * LINES.length - i)
        const p1 = researchPts[a]
        const p2 = researchPts[b]
        const mid = p1.clone().lerp(p2, t)
        arr.push(p1.x, p1.y, p1.z, mid.x, mid.y, mid.z)
      }
    })
    return new Float32Array(arr)
  }, [lineDone, researchPts])

  return (
    <group>
      {researchPts.map((p, i) => (
        <mesh key={`r${i}`} position={p}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      ))}
      {engPts.map((p, i) => (
        <mesh key={`e${i}`} position={p}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={engAlpha} toneMapped={false} />
        </mesh>
      ))}
      {linePositions.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#a5b4fc" transparent opacity={0.85} toneMapped={false} />
        </lineSegments>
      )}
    </group>
  )
}
```

- [ ] **Step 3: Implement `UnbuiltBeatMarker.tsx`**

```tsx
// src/components/CosmicJourney3D/scenes/UnbuiltBeatMarker.tsx
'use client'

import type { SceneProps } from '../types'

// A real, intentional anchored marker for beats not yet rebuilt. Keeps the
// flight continuous end-to-end; later phases replace these one at a time.
export default function UnbuiltBeatMarker(_props: SceneProps) {
  return (
    <mesh>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshBasicMaterial color="#1e2547" wireframe transparent opacity={0.5} />
    </mesh>
  )
}
```

- [ ] **Step 4: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors in the three scene files.

- [ ] **Step 5: Commit**

```bash
git add src/components/CosmicJourney3D/scenes/
git commit -m "feat: add origin black hole, constellation reference scene, unbuilt-beat marker"
```

---

## Task 10: Registry wiring (narrative + meta + scenes → Beat[])

**Files:**
- Create: `src/components/CosmicJourney3D/registry.tsx`

**Interfaces:**
- Consumes: `NARRATIVE`, `BEATS_META`, scene components.
- Produces:
  ```ts
  export interface Beat { id: string; eyebrow?: string; headline: string; body?: string; typedPhrases?: string[]; meta: BeatMeta; Scene: React.FC<SceneProps> }
  export const BEATS: Beat[]                 // 21, in order
  export const TOTAL_SCROLL_VH: number       // sum of scrollLengths
  export const SCROLL_LENGTHS: number[]
  ```

- [ ] **Step 1: Implement `registry.tsx`**

```tsx
// src/components/CosmicJourney3D/registry.tsx
import type React from 'react'
import { NARRATIVE } from './narrative'
import { BEATS_META } from './beatsMeta'
import type { BeatMeta, SceneProps } from './types'
import Beat_Constellation from './scenes/Beat_Constellation'
import UnbuiltBeatMarker from './scenes/UnbuiltBeatMarker'

export interface Beat {
  id: string
  eyebrow?: string
  headline: string
  body?: string
  typedPhrases?: string[]
  meta: BeatMeta
  Scene: React.FC<SceneProps>
}

// Built scenes are registered here; everything else flies as an UnbuiltBeatMarker
// until its own phase replaces it. Origin black hole is mounted separately at ORIGIN_ANCHOR.
const SCENES: Record<string, React.FC<SceneProps>> = {
  'constellation-section': Beat_Constellation,
}

export const BEATS: Beat[] = NARRATIVE.map((b) => ({
  ...b,
  meta: BEATS_META[b.id],
  Scene: SCENES[b.id] ?? UnbuiltBeatMarker,
}))

export const SCROLL_LENGTHS = BEATS.map((b) => b.meta.scrollLength)
export const TOTAL_SCROLL_VH = SCROLL_LENGTHS.reduce((a, b) => a + b, 0)
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/CosmicJourney3D/registry.tsx
git commit -m "feat: wire beat registry from narrative, meta, and scenes"
```

---

## Task 11: Camera rig (spline camera driven by scroll)

**Files:**
- Create: `src/components/CosmicJourney3D/CameraRig.tsx`

**Interfaces:**
- Consumes: `useScrollProgressRef`, `easedCurveU`, `cumulativeRanges`, `SCROLL_LENGTHS`, `BEATS`, `ORIGIN_ANCHOR`, `NEBULA_ANCHOR`.
- Produces: `export function CameraRig(): null` — mutates the R3F camera each frame; renders nothing.

- [ ] **Step 1: Implement `CameraRig.tsx`**

```tsx
// src/components/CosmicJourney3D/CameraRig.tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollProgressRef } from './ScrollRig'
import { cumulativeRanges } from './scrollMath'
import { easedCurveU } from './cameraPath'
import { SCROLL_LENGTHS, BEATS } from './registry'
import { ORIGIN_ANCHOR, NEBULA_ANCHOR } from './beatsMeta'

export function CameraRig() {
  const camera = useThree((s) => s.camera)
  const progressRef = useScrollProgressRef()
  const ranges = useMemo(() => cumulativeRanges(SCROLL_LENGTHS), [])

  const { posCurve, lookCurve } = useMemo(() => {
    const positions = [
      new THREE.Vector3(...ORIGIN_ANCHOR.position),
      ...BEATS.map((b) => new THREE.Vector3(...b.meta.anchor.position)),
      new THREE.Vector3(...NEBULA_ANCHOR.position),
    ]
    const looks = [
      new THREE.Vector3(...(ORIGIN_ANCHOR.lookAt ?? [0, 0, 0])),
      ...BEATS.map((b) => new THREE.Vector3(...(b.meta.anchor.lookAt ?? b.meta.anchor.position))),
      new THREE.Vector3(...(NEBULA_ANCHOR.lookAt ?? NEBULA_ANCHOR.position)),
    ]
    return {
      posCurve: new THREE.CatmullRomCurve3(positions, false, 'catmullrom', 0.5),
      lookCurve: new THREE.CatmullRomCurve3(looks, false, 'catmullrom', 0.5),
    }
  }, [])

  const lastU = useRef(0)
  const tmp = useRef(new THREE.Vector3())

  useFrame(() => {
    const u = easedCurveU(progressRef.current, ranges)
    // light smoothing so wheel deltas read as inertia, not steps
    lastU.current += (u - lastU.current) * 0.12
    const cu = Math.max(0, Math.min(1, lastU.current))
    posCurve.getPointAt(cu, tmp.current)
    camera.position.copy(tmp.current)
    lookCurve.getPointAt(cu, tmp.current)
    camera.lookAt(tmp.current)
  })

  return null
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/CosmicJourney3D/CameraRig.tsx
git commit -m "feat: add CatmullRom spline camera driven by eased scroll"
```

---

## Task 12: Environment (starfield, nebula, lighting, postprocessing)

**Files:**
- Create: `src/components/CosmicJourney3D/Environment.tsx`

**Interfaces:**
- Consumes: `QualityTier`.
- Produces: `export function Environment(props: { quality: QualityTier }): JSX.Element` — background stars + nebula + lights, and a postprocessing `<EffectComposer>` (bloom; disabled on `mobile`).

- [ ] **Step 1: Implement `Environment.tsx`**

```tsx
// src/components/CosmicJourney3D/Environment.tsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import type { QualityTier } from './types'

export function Environment({ quality }: { quality: QualityTier }) {
  const nebula = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    const palette = [new THREE.Color('#6366f1'), new THREE.Color('#a78bfa'), new THREE.Color('#22d3ee')]
    const count = quality === 'mobile' ? 600 : quality === 'low' ? 1500 : 4000
    for (let i = 0; i < count; i++) {
      positions.push((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 200, -Math.random() * 260)
      const c = palette[i % palette.length]
      colors.push(c.r, c.g, c.b)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return g
  }, [quality])

  return (
    <>
      <color attach="background" args={['#02030a']} />
      <ambientLight intensity={0.15} />
      <Stars radius={300} depth={120} count={quality === 'mobile' ? 1500 : 6000} factor={4} fade speed={0.4} />
      <points geometry={nebula}>
        <pointsMaterial size={1.4} vertexColors transparent opacity={0.35} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {quality !== 'mobile' && (
        <EffectComposer>
          <Bloom intensity={quality === 'high' ? 0.9 : 0.5} luminanceThreshold={0.2} mipmapBlur />
          <Vignette eskil={false} offset={0.15} darkness={0.85} />
        </EffectComposer>
      )}
    </>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors. (If `@react-three/postprocessing` type exports differ, import `Bloom`/`Vignette` per its installed version's entry points; confirm via `node -e "console.log(Object.keys(require('@react-three/postprocessing')))"`.)

- [ ] **Step 3: Commit**

```bash
git add src/components/CosmicJourney3D/Environment.tsx
git commit -m "feat: add cosmic environment with starfield, nebula, and bloom"
```

---

## Task 13: Overlay (DOM narrative synced to active beat)

**Files:**
- Create: `src/components/CosmicJourney3D/Overlay.tsx`

**Interfaces:**
- Consumes: `useScrollProgressRef`, `cumulativeRanges`, `locate`, `BEATS`.
- Produces: `export function Overlay(): JSX.Element` — fixed, centered text panel; shows the active beat's eyebrow/headline/body as real DOM (`h2`/`p`); `aria-live="polite"`. Uses a `requestAnimationFrame` reader that calls `setState` only when the active index changes (not per frame).

- [ ] **Step 1: Implement `Overlay.tsx`**

```tsx
// src/components/CosmicJourney3D/Overlay.tsx
'use client'

import { useEffect, useState } from 'react'
import { useScrollProgressRef } from './ScrollRig'
import { cumulativeRanges, locate } from './scrollMath'
import { SCROLL_LENGTHS, BEATS } from './registry'

export function Overlay() {
  const progressRef = useScrollProgressRef()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const ranges = cumulativeRanges(SCROLL_LENGTHS)
    let raf = 0
    const tick = () => {
      const { index: i } = locate(progressRef.current, ranges)
      setIndex((prev) => (prev === i ? prev : i)) // re-render only on beat change
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progressRef])

  const beat = BEATS[index]

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        pointerEvents: 'none', padding: '0 6vw', color: '#fff', zIndex: 2,
      }}
    >
      {beat.eyebrow && (
        <div style={{ textTransform: 'uppercase', letterSpacing: 2, fontSize: 12, color: '#a5b4fc' }}>{beat.eyebrow}</div>
      )}
      <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, margin: '8px 0', textShadow: '0 2px 24px rgba(0,0,0,0.9)' }}>
        {beat.headline}
      </h2>
      {beat.body && (
        <p style={{ maxWidth: 620, fontSize: 'clamp(14px, 1.6vw, 18px)', lineHeight: 1.6, textShadow: '0 2px 16px rgba(0,0,0,0.95)' }}>
          {beat.body}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/CosmicJourney3D/Overlay.tsx
git commit -m "feat: add DOM narrative overlay synced to the active beat"
```

---

## Task 14: Chapter rail (progress + click-to-jump + skip)

**Files:**
- Create: `src/components/CosmicJourney3D/ChapterRail.tsx`

**Interfaces:**
- Consumes: `useScrollProgressRef`, `cumulativeRanges`, `chapterOffset`, `locate`, `BEATS`, `TOTAL_SCROLL_VH`.
- Produces: `export function ChapterRail(): JSX.Element` — fixed vertical rail of chapter ticks (label = eyebrow or headline), highlights the active beat, click scrolls to `chapterOffset * TOTAL_SCROLL_VH * viewportHeight`, plus a "Skip ↓" button to the end.

- [ ] **Step 1: Implement `ChapterRail.tsx`**

```tsx
// src/components/CosmicJourney3D/ChapterRail.tsx
'use client'

import { useEffect, useState } from 'react'
import { useScrollProgressRef } from './ScrollRig'
import { cumulativeRanges, chapterOffset, locate } from './scrollMath'
import { SCROLL_LENGTHS, BEATS, TOTAL_SCROLL_VH } from './registry'

export function ChapterRail() {
  const progressRef = useScrollProgressRef()
  const [active, setActive] = useState(0)

  useEffect(() => {
    const ranges = cumulativeRanges(SCROLL_LENGTHS)
    let raf = 0
    const tick = () => {
      const { index } = locate(progressRef.current, ranges)
      setActive((p) => (p === index ? p : index))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progressRef])

  const jumpTo = (fraction: number) => {
    const total = (TOTAL_SCROLL_VH / 100) * window.innerHeight
    window.scrollTo({ top: fraction * total, behavior: 'smooth' })
  }

  const ranges = cumulativeRanges(SCROLL_LENGTHS)

  return (
    <nav aria-label="Chapters" style={{ position: 'fixed', top: '50%', right: 14, transform: 'translateY(-50%)', zIndex: 5, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {BEATS.map((b, i) => (
        <button
          key={b.id}
          onClick={() => jumpTo(chapterOffset(i, ranges))}
          aria-current={active === i}
          title={b.eyebrow ?? b.headline}
          style={{
            all: 'unset', cursor: 'pointer', width: 10, height: 10, borderRadius: 999,
            background: active === i ? '#a5b4fc' : 'rgba(255,255,255,0.3)',
            outlineOffset: 2,
          }}
        />
      ))}
      <button onClick={() => jumpTo(1)} style={{ all: 'unset', cursor: 'pointer', marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
        Skip ↓
      </button>
    </nav>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/CosmicJourney3D/ChapterRail.tsx
git commit -m "feat: add chapter rail with click-to-jump and skip"
```

---

## Task 15: Compose the journey (`index.tsx`) + preview route

**Files:**
- Create: `src/components/CosmicJourney3D/index.tsx`
- Create: `src/app/(frontend)/my-story/preview/page.tsx`

**Interfaces:**
- Consumes: everything above.
- Produces: `export default function CosmicJourney3D(): JSX.Element` and a preview route at `/my-story/preview`. Existing `/my-story` is untouched.

- [ ] **Step 1: Implement `index.tsx`**

```tsx
// src/components/CosmicJourney3D/index.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ScrollRig } from './ScrollRig'
import { CameraRig } from './CameraRig'
import { Environment } from './Environment'
import { Overlay } from './Overlay'
import { ChapterRail } from './ChapterRail'
import Fallback from './Fallback'
import { BEATS, TOTAL_SCROLL_VH } from './registry'
import { ORIGIN_ANCHOR } from './beatsMeta'
import OriginBlackHole from './scenes/OriginBlackHole'
import { readJourneyEnv, selectQuality } from './tiers'
import { fallbackMode } from './fallbackPlan'
import { cumulativeRanges, locate } from './scrollMath'
import { useScrollProgressRef } from './ScrollRig'
import type { QualityTier } from './types'

// Drives clock + localProgress into the active (and origin) scenes; one shared time base.
function SceneHost({ quality, reducedMotion }: { quality: QualityTier; reducedMotion: boolean }) {
  const progressRef = useScrollProgressRef()
  const ranges = useMemo(() => cumulativeRanges(BEATS.map((b) => b.meta.scrollLength)), [])
  const [clock, setClock] = useState(0)
  const [active, setActive] = useState(0)
  const localRef = useRef(0)

  useFrame((_s, dt) => {
    const d = Math.min(dt, 1 / 30) // clamp; protects the phase machine on tab-return
    setClock((c) => c + d)
    const { index, local } = locate(progressRef.current, ranges)
    localRef.current = local
    setActive((p) => (p === index ? p : index))
  })

  return (
    <>
      <group position={ORIGIN_ANCHOR.position}>
        <OriginBlackHole localProgress={0} clock={clock} quality={quality} reducedMotion={reducedMotion} />
      </group>
      {BEATS.map((b, i) => (
        <group key={b.id} position={b.meta.anchor.position} visible={Math.abs(i - active) <= 1}>
          <b.Scene
            localProgress={i === active ? localRef.current : i < active ? 1 : 0}
            clock={clock}
            quality={quality}
            reducedMotion={reducedMotion}
          />
        </group>
      ))}
    </>
  )
}

export default function CosmicJourney3D() {
  const [ready, setReady] = useState(false)
  const [quality, setQuality] = useState<QualityTier>('high')
  const [mode, setMode] = useState<'none' | 'static'>('none')

  useEffect(() => {
    const env = readJourneyEnv()
    setQuality(selectQuality(env))
    setMode(fallbackMode(env.reducedMotion, env.webgl2))
    setReady(true)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setMode(fallbackMode(mq.matches, env.webgl2))
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  if (!ready) return null
  if (mode === 'static') return <Fallback />

  return (
    <ScrollRig totalScrollVh={TOTAL_SCROLL_VH}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }} aria-hidden>
        <Canvas camera={{ fov: 60, near: 0.1, far: 1000, position: ORIGIN_ANCHOR.position }} dpr={quality === 'high' ? [1, 2] : [1, 1.5]}>
          <Environment quality={quality} />
          <CameraRig />
          <SceneHost quality={quality} reducedMotion={false} />
        </Canvas>
      </div>
      <Overlay />
      <ChapterRail />
    </ScrollRig>
  )
}
```

- [ ] **Step 2: Implement the preview route**

```tsx
// src/app/(frontend)/my-story/preview/page.tsx
import type { Metadata } from 'next/types'
import dynamic from 'next/dynamic'

const CosmicJourney3D = dynamic(() => import('@/components/CosmicJourney3D'), { ssr: false })

export const metadata: Metadata = {
  title: 'My Story (Preview) - Kartik Mandar',
  robots: { index: false, follow: false },
}

export default function MyStoryPreviewPage() {
  return <CosmicJourney3D />
}
```

- [ ] **Step 3: Typecheck + boot + manual verify**

Run:
```bash
pnpm exec tsc --noEmit
pnpm dev
```
Then open `http://localhost:3000/my-story/preview` (or the active dev port) and verify:
- Page scrolls through the full height; the camera flies forward and dwells at beats.
- The origin black hole is visible at the start; the constellation beat shows named stars + indigo lines completing partway through its range; other beats show the wireframe marker.
- Overlay headline/body change per beat; chapter rail highlights the active beat and click-to-jump works; "Skip ↓" jumps to the end.
- With OS "Reduce motion" on (or DevTools emulate `prefers-reduced-motion`), the static `Fallback` renders all 21 beats' copy.
- No console errors; one WebGL context (check `chrome://gpu` / no "context lost" warnings).

- [ ] **Step 4: Commit**

```bash
git add src/components/CosmicJourney3D/index.tsx "src/app/(frontend)/my-story/preview/page.tsx"
git commit -m "feat: compose my-story 3D journey behind a preview route"
```

---

## Task 16: Full suite + lint gate

**Files:** none (verification task)

- [ ] **Step 1: Run the whole test suite**

Run: `pnpm test`
Expected: all `CosmicJourney3D` pure-logic tests pass alongside the existing suite.

- [ ] **Step 2: Lint + typecheck**

Run:
```bash
pnpm lint
pnpm exec tsc --noEmit
```
Expected: clean (fix any new warnings in the new files).

- [ ] **Step 3: Commit any lint fixes**

```bash
git add -A
git commit -m "chore: lint and typecheck pass for my-story 3D foundation"
```

---

## Phase 0 Self-Review

**Spec coverage (Phase 0 scope):**
- Single Canvas / one context → Task 15. ✓
- Framer Motion scroll bridge, no per-frame re-render → Task 8. ✓
- CatmullRom spline camera + eased dwell → Tasks 5, 11. ✓
- Registry as single source of truth (copy + meta) → Tasks 2, 3, 10. ✓
- Copy preserved byte-for-byte + test → Task 2. ✓
- Scroll math incl. broken edge cases → Task 4. ✓
- Quality tiers → Task 6. ✓
- Reduced-motion-first + DOM copy + fallback → Tasks 7, 15. ✓
- Origin black hole + one faithful reference scene + flight runs end-to-end → Tasks 9, 10, 15. ✓
- Chapter rail / click-to-jump / skip → Task 14. ✓
- `transpilePackages: ['three']` → Task 1. ✓
- Non-destructive (existing route intact, preview route) → Task 15. ✓
- One time base / dt clamp → Task 15 `SceneHost`. ✓

**Deferred to later phases (by design, each its own plan):** full raymarch hero port + STAR→QUASAR prologue (Phase 1); volumetric rebuilds of the other 20 beats (Phases 2–5); postprocessing/mobile tuning + per-beat poster generation + the missing `quasar-poster.jpg` (Phase 6); a11y audit + route swap + dead-code removal (Phase 7).

**Placeholder scan:** `UnbuiltBeatMarker` and `OriginBlackHole` (stand-in) are intentional, fully-implemented components with a stated replacement phase — not unwritten steps. No "TODO"/"add X"/"similar to" left in steps.

**Type consistency:** `SceneProps` is identical across `types.ts`, all scenes, registry, and `SceneHost`. `QualityTier` = `'high' | 'low' | 'mobile'` everywhere. `Range`/`locate`/`cumulativeRanges`/`chapterOffset`/`easedCurveU` signatures match across `scrollMath.ts`, `cameraPath.ts`, `CameraRig.tsx`, `Overlay.tsx`, `ChapterRail.tsx`. Registry exports `BEATS`/`SCROLL_LENGTHS`/`TOTAL_SCROLL_VH` consumed consistently.

---

## Follow-on plans (write each when its phase begins)

1. **Phase 1 — Hero prologue fusion:** port `blackhole.frag.ts` raymarch into an R3F `shaderMaterial` as `OriginBlackHole`; drive STAR→SHELL→BIRTH→FLASH→QUASAR from the prologue scroll sub-range with the preserved phase copy + idle auto-play + zoom.
2. **Phases 2–5 — Volumetric scene batches (3–4 beats each):** rebuild the remaining 20 metaphors against their `acceptance[]` checklists, registering each into `SCENES`.
3. **Phase 6 — Performance/mobile + assets:** demand-frameloop, visibility/perf gating, mobile shader trims, per-beat poster stills, generate `public/media/quasar-poster.jpg` and `public/media/my-story/*`.
4. **Phase 7 — Ship:** a11y audit, keyboard nav, motion toggle, swap `/my-story` to the new component, remove old `CosmicJourney` + dead CSS.
