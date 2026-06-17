# My-Story WebGL Scrollytelling — Phase 1 (Hero Prologue Fusion) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make the existing raymarched black hole the scroll-driven "Act 0" prologue of `/my-story/preview`: scrolling drives STAR→COLLAPSE→FLASH→SHELL→BIRTH→QUASAR (with the hero phase copy), then at QUASAR the prologue crossfades into the 3D camera flight built in Phase 0.

**Architecture:** Approach A ("prologue act, then pull back"). Reuse `QuasarBackground/engine/RaymarchedRenderer` verbatim as a fullscreen layer, but driven by a new pure `phaseStateFromProgress(prologueProgress)` instead of the timed `PhaseMachine`. The page's scroll is split into a prologue fraction `[0, PF]` and a flight fraction `[PF, 1]`; the flight consumers (CameraRig/Overlay/ChapterRail) read a remapped `flightProgress` so they don't move during the prologue. A crossfade band around `PF` fades the prologue layer out and the flight Canvas in.

**Tech Stack:** Next 16 · React 19 · Three.js 0.183 · `@react-three/fiber` · Framer Motion 12 · Vitest. Reuses `src/components/QuasarBackground/engine/*` (RaymarchedRenderer, phaseUniforms, types) unchanged.

## Global Constraints

- **Narrative preserved byte-for-byte.** The four hero phase texts are reproduced verbatim from `src/components/QuasarBackground/index.tsx` `OVERLAY_TEXT` (already in `CosmicJourney3D/narrative.ts` as `HERO_PHASES`): STAR "Every story begins with a massive star.", SHELL "It dies in a supernova, outshining its entire galaxy.", BIRTH "What remains collapses into a black hole. Matter spirals in, and the disk ignites.", QUASAR "But this is just the surface of what really is happening!!". The 21 beats are unchanged.
- **Reuse, don't fork:** import `RaymarchedRenderer`, `derivePhaseUniforms`, `Phase`, `PHASE_DURATIONS`, `PHASE_ORDER`, `CONSTANTS` from `@/components/QuasarBackground/engine/*`. Do NOT modify those files.
- **tsc-clean** (`strict` + `noUncheckedIndexedAccess`); Vitest does not typecheck, so run `pnpm exec tsc --noEmit` as a gate on every task. **Run `pnpm lint` on component tasks.**
- One R3F context for the flight; the prologue's `RaymarchedRenderer` owns a second context only while the prologue layer is mounted, and is disposed after the crossfade.
- Non-destructive: existing `/my-story` route + `CosmicJourney/Component.tsx` untouched. Work stays behind `/my-story/preview`.
- 2-space indent; conventional commits; **NO Claude co-authorship line**; commit per task.

---

## File Structure

```
src/components/CosmicJourney3D/
  prologuePhase.ts            # PURE: phaseStateFromProgress(p) -> PhaseState (scroll -> STAR..QUASAR)
  prologueScroll.ts           # PURE: PROLOGUE_FRACTION + splitProgress(global) -> {inPrologue, prologueProgress, flightProgress, crossfade}
  HeroPrologue.tsx            # scroll-driven fullscreen raymarch layer (reuses RaymarchedRenderer)
  Overlay.tsx                 # MODIFY: show HERO_PHASES copy during prologue, beat copy during flight
  CameraRig.tsx               # MODIFY: consume flightProgress (no movement during prologue)
  ChapterRail.tsx             # MODIFY: consume flightProgress; hide/disable during prologue
  index.tsx                   # MODIFY: mount HeroPrologue + crossfade; extend ScrollRig height by prologue
  Fallback.tsx                # MODIFY: prepend the 4 hero phase lines to the static fallback
  __tests__/
    prologuePhase.test.ts
    prologueScroll.test.ts
```

---

## Task 1: Scroll → phase mapping (`prologuePhase.ts`)

**Files:**
- Create: `src/components/CosmicJourney3D/prologuePhase.ts`
- Test: `src/components/CosmicJourney3D/__tests__/prologuePhase.test.ts`

**Interfaces:**
- Consumes: `Phase`, `PhaseState` from `@/components/QuasarBackground/engine/types`.
- Produces:
  ```ts
  export const PHASE_WEIGHTS: Record<Phase, number>   // dwell weights across the prologue
  export function phaseStateFromProgress(progress: number): PhaseState
  ```
  Maps prologue progress 0..1 across STAR→COLLAPSE→FLASH→SHELL→BIRTH→QUASAR by weight; within a phase returns local 0..1 progress. `progress<=0` → STAR/0; `progress>=1` → QUASAR/1.

- [ ] **Step 1: Write the failing test**

```ts
// src/components/CosmicJourney3D/__tests__/prologuePhase.test.ts
import { describe, it, expect } from 'vitest'
import { phaseStateFromProgress, PHASE_WEIGHTS } from '../prologuePhase'
import { Phase, PHASE_ORDER } from '@/components/QuasarBackground/engine/types'

describe('phaseStateFromProgress', () => {
  it('starts at STAR progress 0 and ends at QUASAR progress 1', () => {
    expect(phaseStateFromProgress(0)).toEqual({ phase: Phase.STAR, progress: 0 })
    expect(phaseStateFromProgress(1)).toEqual({ phase: Phase.QUASAR, progress: 1 })
  })

  it('clamps out-of-range input', () => {
    expect(phaseStateFromProgress(-0.5)).toEqual({ phase: Phase.STAR, progress: 0 })
    expect(phaseStateFromProgress(2)).toEqual({ phase: Phase.QUASAR, progress: 1 })
  })

  it('visits every phase in PHASE_ORDER as progress increases', () => {
    const seen: Phase[] = []
    for (let p = 0; p <= 1.00001; p += 0.001) {
      const ph = phaseStateFromProgress(p).phase
      if (seen[seen.length - 1] !== ph) seen.push(ph)
    }
    expect(seen).toEqual(PHASE_ORDER)
  })

  it('phase progress runs 0..1 within each phase and never goes backwards in phase index', () => {
    let lastIdx = -1
    for (let p = 0; p <= 1.00001; p += 0.005) {
      const { phase, progress } = phaseStateFromProgress(p)
      expect(progress).toBeGreaterThanOrEqual(-1e-9)
      expect(progress).toBeLessThanOrEqual(1 + 1e-9)
      const idx = PHASE_ORDER.indexOf(phase)
      expect(idx).toBeGreaterThanOrEqual(lastIdx)
      lastIdx = idx
    }
  })

  it('every phase has a positive weight', () => {
    for (const ph of PHASE_ORDER) expect(PHASE_WEIGHTS[ph]).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/CosmicJourney3D/__tests__/prologuePhase.test.ts`
Expected: FAIL — cannot resolve `../prologuePhase`.

- [ ] **Step 3: Implement `prologuePhase.ts`**

Weights give STAR and QUASAR deliberate dwell (so the reader can absorb the copy); the middle phases roughly track `PHASE_DURATIONS`.

```ts
// src/components/CosmicJourney3D/prologuePhase.ts
import { Phase, PHASE_ORDER, type PhaseState } from '@/components/QuasarBackground/engine/types'

// Dwell weights across the prologue scroll. STAR/QUASAR are open-ended in the
// timed machine; here they get fixed dwell so the hero copy is readable. The
// middle phases approximate the timed PHASE_DURATIONS (COLLAPSE 1.5, FLASH 0.4,
// SHELL 8 compressed to 3, BIRTH 4 -> 2.5) for pacing.
export const PHASE_WEIGHTS: Record<Phase, number> = {
  [Phase.STAR]: 3,
  [Phase.COLLAPSE]: 1.5,
  [Phase.FLASH]: 0.5,
  [Phase.SHELL]: 3,
  [Phase.BIRTH]: 2.5,
  [Phase.QUASAR]: 2.5,
}

export function phaseStateFromProgress(progress: number): PhaseState {
  const p = Math.max(0, Math.min(1, progress))
  const total = PHASE_ORDER.reduce((a, ph) => a + PHASE_WEIGHTS[ph], 0)
  let acc = 0
  for (let i = 0; i < PHASE_ORDER.length; i++) {
    const phase = PHASE_ORDER[i]!
    const w = PHASE_WEIGHTS[phase] / total
    const start = acc
    const end = acc + w
    acc = end
    if (p < end || i === PHASE_ORDER.length - 1) {
      const local = w > 0 ? (p - start) / w : 0
      return { phase, progress: Math.max(0, Math.min(1, local)) }
    }
  }
  return { phase: Phase.QUASAR, progress: 1 }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/components/CosmicJourney3D/__tests__/prologuePhase.test.ts`
Expected: PASS.

- [ ] **Step 5: tsc + commit**

```bash
pnpm exec tsc --noEmit
git add src/components/CosmicJourney3D/prologuePhase.ts src/components/CosmicJourney3D/__tests__/prologuePhase.test.ts
git commit -m "feat: add scroll-to-phase mapping for the hero prologue"
```

---

## Task 2: Prologue/flight scroll split (`prologueScroll.ts`)

**Files:**
- Create: `src/components/CosmicJourney3D/prologueScroll.ts`
- Test: `src/components/CosmicJourney3D/__tests__/prologueScroll.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const PROLOGUE_FRACTION: number      // share of total scroll given to the prologue (e.g. 0.22)
  export const CROSSFADE_BAND: number         // width of the prologue->flight crossfade (e.g. 0.04)
  export interface Split { inPrologue: boolean; prologueProgress: number; flightProgress: number; crossfade: number }
  export function splitProgress(global: number, fraction?: number, band?: number): Split
  ```
  `prologueProgress` = global remapped over `[0, fraction]`; `flightProgress` = global remapped over `[fraction, 1]`; `crossfade` = 0 before the band, ramps 0→1 across the band centered near `fraction` (1 = flight fully visible); `inPrologue` = global < fraction.

- [ ] **Step 1: Write the failing test**

```ts
// src/components/CosmicJourney3D/__tests__/prologueScroll.test.ts
import { describe, it, expect } from 'vitest'
import { splitProgress, PROLOGUE_FRACTION, CROSSFADE_BAND } from '../prologueScroll'

describe('splitProgress', () => {
  const PF = 0.25
  const B = 0.05

  it('maps the prologue range to 0..1 prologueProgress', () => {
    expect(splitProgress(0, PF, B).prologueProgress).toBeCloseTo(0, 6)
    expect(splitProgress(PF / 2, PF, B).prologueProgress).toBeCloseTo(0.5, 6)
    expect(splitProgress(PF, PF, B).prologueProgress).toBeCloseTo(1, 6)
  })

  it('maps the flight range to 0..1 flightProgress and holds 0 during the prologue', () => {
    expect(splitProgress(0, PF, B).flightProgress).toBeCloseTo(0, 6)
    expect(splitProgress(PF, PF, B).flightProgress).toBeCloseTo(0, 6)
    expect(splitProgress((PF + 1) / 2, PF, B).flightProgress).toBeCloseTo(0.5, 6)
    expect(splitProgress(1, PF, B).flightProgress).toBeCloseTo(1, 6)
  })

  it('crossfade is 0 well before the band and 1 well after', () => {
    expect(splitProgress(PF - B, PF, B).crossfade).toBeCloseTo(0, 6)
    expect(splitProgress(PF + B, PF, B).crossfade).toBeCloseTo(1, 6)
    expect(splitProgress(0, PF, B).crossfade).toBe(0)
    expect(splitProgress(1, PF, B).crossfade).toBe(1)
  })

  it('inPrologue flips at the fraction', () => {
    expect(splitProgress(PF - 0.01, PF, B).inPrologue).toBe(true)
    expect(splitProgress(PF + 0.01, PF, B).inPrologue).toBe(false)
  })

  it('exposes sane defaults', () => {
    expect(PROLOGUE_FRACTION).toBeGreaterThan(0)
    expect(PROLOGUE_FRACTION).toBeLessThan(0.5)
    expect(CROSSFADE_BAND).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/CosmicJourney3D/__tests__/prologueScroll.test.ts`
Expected: FAIL — cannot resolve `../prologueScroll`.

- [ ] **Step 3: Implement `prologueScroll.ts`**

```ts
// src/components/CosmicJourney3D/prologueScroll.ts
export const PROLOGUE_FRACTION = 0.22
export const CROSSFADE_BAND = 0.04

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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/components/CosmicJourney3D/__tests__/prologueScroll.test.ts`
Expected: PASS.

- [ ] **Step 5: tsc + commit**

```bash
pnpm exec tsc --noEmit
git add src/components/CosmicJourney3D/prologueScroll.ts src/components/CosmicJourney3D/__tests__/prologueScroll.test.ts
git commit -m "feat: add prologue/flight scroll split with crossfade"
```

---

## Task 3: Scroll-driven raymarch layer (`HeroPrologue.tsx`)

**Files:**
- Create: `src/components/CosmicJourney3D/HeroPrologue.tsx`

**Interfaces:**
- Consumes: `useScrollProgressRef` (raw global), `splitProgress`, `phaseStateFromProgress`, and `RaymarchedRenderer` + `CONSTANTS` from `@/components/QuasarBackground/engine/*`.
- Produces: `export function HeroPrologue(props: { opacity: number }): JSX.Element` — a fixed full-viewport container hosting the raymarcher, driven by scroll; `opacity` (1 - crossfade) is applied to the container for the fade-out. Disposes the renderer on unmount.

- [ ] **Step 1: Implement `HeroPrologue.tsx`**

Reuses the proven renderer: a fixed `PerspectiveCamera` frames the black hole (no OrbitControls — scroll is the only input), and each frame we set the phase from scroll and call `update(dt)`. A gentle dolly from `CAMERA_START_DISTANCE` inward as the prologue progresses gives life without orbiting.

```tsx
// src/components/CosmicJourney3D/HeroPrologue.tsx
'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RaymarchedRenderer } from '@/components/QuasarBackground/engine/RaymarchedRenderer'
import { CONSTANTS } from '@/components/QuasarBackground/engine/types'
import { useScrollProgressRef } from './ScrollRig'
import { splitProgress } from './prologueScroll'
import { phaseStateFromProgress } from './prologuePhase'

export function HeroPrologue({ opacity }: { opacity: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useScrollProgressRef()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      1000,
    )
    const frame = (dist: number) => camera.position.set(0, 8, dist).setLength(dist)
    frame(CONSTANTS.CAMERA_START_DISTANCE)
    camera.lookAt(0, 0, 0)

    let renderer: RaymarchedRenderer | null = null
    try {
      renderer = new RaymarchedRenderer()
      renderer.init(container, camera)
    } catch {
      return // WebGL unavailable: Fallback handles the experience
    }

    let raf = 0
    let last = performance.now()
    let disposed = false
    const loop = () => {
      if (disposed) return
      raf = requestAnimationFrame(loop)
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now
      const { prologueProgress } = splitProgress(progressRef.current)
      // gentle dolly inward across the prologue (40 -> 22 r_s), then hold
      frame(CONSTANTS.CAMERA_START_DISTANCE - 18 * prologueProgress)
      camera.lookAt(0, 0, 0)
      camera.updateMatrixWorld()
      renderer!.setPhase(phaseStateFromProgress(prologueProgress))
      renderer!.update(dt)
    }
    raf = requestAnimationFrame(loop)

    const observer = new ResizeObserver(() => {
      const w = container.clientWidth
      const h = Math.max(container.clientHeight, 1)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer?.resize(w, h)
    })
    observer.observe(container)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      renderer?.dispose()
    }
  }, [progressRef])

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', inset: 0, zIndex: 1, background: '#000',
        opacity, pointerEvents: 'none', transition: 'opacity 80ms linear',
      }}
    >
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
    </div>
  )
}
```

- [ ] **Step 2: tsc + lint**

Run: `pnpm exec tsc --noEmit` (0 errors) and `pnpm lint` (no new errors in this file).

- [ ] **Step 3: Commit**

```bash
git add src/components/CosmicJourney3D/HeroPrologue.tsx
git commit -m "feat: add scroll-driven raymarched hero prologue layer"
```

---

## Task 4: Wire prologue into the page (crossfade + remap flight + overlay + fallback)

**Files:**
- Modify: `src/components/CosmicJourney3D/index.tsx`
- Modify: `src/components/CosmicJourney3D/Overlay.tsx`
- Modify: `src/components/CosmicJourney3D/CameraRig.tsx`
- Modify: `src/components/CosmicJourney3D/ChapterRail.tsx`
- Modify: `src/components/CosmicJourney3D/Fallback.tsx`

**Interfaces:**
- The flight consumers must read a **remapped flight progress**. Introduce a shared reader: `CameraRig`, `Overlay`, `ChapterRail` compute their local index/curve param from `splitProgress(progressRef.current).flightProgress` instead of `progressRef.current` directly. `Overlay` additionally renders `HERO_PHASES` copy while `inPrologue`.

- [ ] **Step 1: Remap CameraRig to flightProgress**

In `CameraRig.tsx`, where it reads the scroll ref in `useFrame`, wrap it:
```tsx
import { splitProgress } from './prologueScroll'
// inside useFrame, replace `progressRef.current` feeding easedCurveU with:
const u = easedCurveU(splitProgress(progressRef.current).flightProgress, ranges)
```
So the camera holds at the origin anchor (flightProgress 0) for the whole prologue, then flies once the prologue ends.

- [ ] **Step 2: Remap ChapterRail + Overlay active-index to flightProgress**

In `ChapterRail.tsx` and `Overlay.tsx`, in the rAF reader, replace `locate(progressRef.current, ranges)` with `locate(splitProgress(progressRef.current).flightProgress, ranges)`.

In `Overlay.tsx`, additionally show the hero copy during the prologue. Read the split each frame; when `inPrologue`, render the current `HERO_PHASES` line (selected by `phaseStateFromProgress(prologueProgress).phase`) instead of the beat. Concretely, add state `heroText: string | null` updated in the rAF loop (only on change), and when non-null render it in place of the beat's eyebrow/headline/body:

```tsx
import { splitProgress } from './prologueScroll'
import { phaseStateFromProgress } from './prologuePhase'
import { HERO_PHASES } from './narrative'
import { Phase } from '@/components/QuasarBackground/engine/types'
// map Phase -> the HERO_PHASES text that exists (STAR/SHELL/BIRTH/QUASAR have copy; COLLAPSE/FLASH reuse the prior line)
const HERO_TEXT: Partial<Record<Phase, string>> = {
  [Phase.STAR]: HERO_PHASES[0]!.text,
  [Phase.SHELL]: HERO_PHASES[1]!.text,
  [Phase.BIRTH]: HERO_PHASES[2]!.text,
  [Phase.QUASAR]: HERO_PHASES[3]!.text,
}
// in the rAF tick:
const sp = splitProgress(progressRef.current)
if (sp.inPrologue) {
  const ph = phaseStateFromProgress(sp.prologueProgress).phase
  const t = HERO_TEXT[ph] ?? null
  setHeroText((prev) => (prev === t ? prev : t))
} else {
  setHeroText((prev) => (prev === null ? prev : null))
  // ...existing beat-index update using sp.flightProgress
}
```
When `heroText` is non-null, the overlay renders just an `<h2>` with that text (centered, same styling as the beat headline). When null, render the active beat as today.

- [ ] **Step 3: Mount the prologue + crossfade in index.tsx; extend scroll height**

In `index.tsx`:
- Import `HeroPrologue`, `splitProgress`, `PROLOGUE_FRACTION`.
- Extend the ScrollRig total height so the prologue gets `PROLOGUE_FRACTION` of the scroll: `totalScrollVh={TOTAL_SCROLL_VH / (1 - PROLOGUE_FRACTION)}`.
- Add a small component inside `ScrollRig` that reads the scroll ref each frame (rAF) and stores `crossfade` in state (only on meaningful change, e.g. quantized to 0.02) to drive the prologue opacity and to unmount the prologue once `crossfade >= 1`:
```tsx
function PrologueLayer() {
  const progressRef = useScrollProgressRef()
  const [xfade, setXfade] = useState(0)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const c = Math.round(splitProgress(progressRef.current).crossfade * 50) / 50
      setXfade((p) => (p === c ? p : c))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progressRef])
  if (xfade >= 1) return null // prologue fully gone -> dispose 2nd context
  return <HeroPrologue opacity={1 - xfade} />
}
```
Render `<PrologueLayer />` as a sibling above the flight Canvas (higher z-index). The flight Canvas + Overlay + ChapterRail stay mounted underneath (the prologue covers them until the crossfade reveals them).

- [ ] **Step 4: Prepend hero copy to the static Fallback**

In `Fallback.tsx`, before the 21 beat `<article>`s, render the four `HERO_PHASES` lines as intro paragraphs (so reduced-motion / no-WebGL users get the full narrative including the prologue). Use the existing `<h2>`/`<p>` styling.

- [ ] **Step 5: Verify (tsc + lint + tests) and commit**

Run:
```bash
pnpm test            # expect: prologue tests pass + 88 prior = all green
pnpm exec tsc --noEmit   # 0 errors
pnpm lint            # 0 errors
```
Commit:
```bash
git add src/components/CosmicJourney3D/
git commit -m "feat: wire scroll-driven hero prologue with crossfade into the flight"
```

- [ ] **Step 6: Controller runtime verification (not the implementer)**

The controller runs the headless-Chrome smoke against `/my-story/preview` and confirms: page serves 200, no console/page errors, a canvas mounts, the overlay shows a hero phase line near scroll 0 (e.g. "Every story begins with a massive star.") and a beat headline past the prologue fraction. Visual look/pacing/crossfade tuning is handed to the site owner.

---

## Self-Review

- **Scroll → phase** (Task 1) and **prologue/flight split + crossfade** (Task 2) are pure and TDD-covered, including the edge the flight must respect (flightProgress holds 0 through the whole prologue).
- **Hero copy preserved** — `HERO_PHASES` is the existing verbatim source; Overlay + Fallback render it; no new copy introduced.
- **Reuse** — `RaymarchedRenderer` and `phaseUniforms`/`types` are imported unchanged; the prologue's only new rendering code is camera framing + the scroll-driven `setPhase` loop.
- **Resource hygiene** — the prologue's renderer is disposed on unmount, and `PrologueLayer` unmounts once `crossfade >= 1`, returning to a single WebGL context for the flight.
- **Known visual-tuning items (owner-driven, not bugs):** `PROLOGUE_FRACTION`, `PHASE_WEIGHTS` pacing, the camera dolly range, and `CROSSFADE_BAND` are all first-pass values to be tuned by eye on the dev server.

## Open Items / Deferred

- Reduced-motion currently routes to the static `Fallback` (no prologue motion) — consistent with Phase 0; a "frozen representative prologue frame" is a Phase 6 option.
- The brief crossfade keeps two WebGL contexts alive simultaneously; if context pressure ever matters on low-end devices, gate the prologue mount on the quality tier (Phase 6).
- Final look/pacing/framing of the raymarch prologue and the crossfade timing require visual iteration with the site owner.
