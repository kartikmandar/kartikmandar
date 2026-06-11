# My Story Black Hole & Supernova Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sprite-based quasar + separate supernova on `/my-story` with one physically-motivated scene: star → collapse → supernova → black hole birth → lensed accretion disk, with a raymarched desktop tier and a mesh fallback tier.

**Architecture:** A React shell (`index.tsx`) owns the camera, OrbitControls, and a pure-TS `PhaseMachine`; two interchangeable renderers (`RaymarchedRenderer`, `MeshRenderer`) implement a shared `SceneRenderer` interface and consume derived phase uniforms. Tier selection is heuristics + a hidden micro-benchmark, with runtime demotion (raymarched → mesh → static poster).

**Tech Stack:** Three.js (already a dependency; `EffectComposer`/`UnrealBloomPass`/`OrbitControls` from `three/examples`), GLSL shaders as template strings, vitest (new devDependency) for pure-TS units.

**Spec:** `docs/superpowers/specs/2026-06-11-quasar-realism-design.md` — read it first.

**Repo rules:** conventional commits, NO Claude co-authorship line. The repo owner requires confirmation before git commands — at each commit step, ask the owner (or batch-confirm at session start).

**Verification commands:** `pnpm test` (vitest), `npx tsc --noEmit` (typecheck), `pnpm lint`, `pnpm dev` (manual visual checks at `http://localhost:3000/my-story`).

---

## File Map

| File | Status | Responsibility |
|---|---|---|
| `vitest.config.ts` | create | test runner config, `@` alias |
| `package.json` | modify | add vitest, `test` script |
| `src/components/QuasarBackground/engine/types.ts` | create | `Phase`, `SceneRenderer`, all tunable constants |
| `src/components/QuasarBackground/engine/PhaseMachine.ts` | create | narrative state machine (pure TS) |
| `src/components/QuasarBackground/engine/phaseUniforms.ts` | create | `PhaseState` → derived uniform values (pure TS) |
| `src/components/QuasarBackground/engine/tierSelect.ts` | create | tier decision (pure TS) + browser env reader |
| `src/components/QuasarBackground/engine/background.ts` | create | starfield + galaxy generators (extracted from old code) + cubemap baker |
| `src/components/QuasarBackground/engine/shaders/chunks.ts` | create | shared GLSL: noise, blackbody, shell color, star surface |
| `src/components/QuasarBackground/engine/shaders/blackhole.frag.ts` | create | raymarched fragment shader (geodesics, disk, jets, supernova) |
| `src/components/QuasarBackground/engine/shaders/meshShaders.ts` | create | mesh-tier disk/jet/star/shell shaders |
| `src/components/QuasarBackground/engine/RaymarchedRenderer.ts` | create | desktop tier |
| `src/components/QuasarBackground/engine/MeshRenderer.ts` | create | fallback tier |
| `src/components/QuasarBackground/index.tsx` | rewrite | React shell: overlays, tier flow, debug overlay, poster fallback |
| `src/components/QuasarBackground/ClientWrapper.tsx` | unchanged | dynamic import |
| `src/components/SupernovaEffect/` | delete | absorbed into phase system |
| `public/media/quasar-poster.jpg` | create (manual capture) | static last-resort fallback |
| `src/components/QuasarBackground/engine/__tests__/*.test.ts` | create | unit tests |

Tests live in `src/components/QuasarBackground/engine/__tests__/`.

---

### Task 1: Vitest setup

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install vitest**

Run: `pnpm add -D vitest`
Expected: vitest appears under `devDependencies` in `package.json`.

- [ ] **Step 2: Add test script**

In `package.json` `"scripts"`, add (keep alphabetical position after `start`):

```json
"test": "vitest run"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/__tests__/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: true,
  },
})
```

- [ ] **Step 4: Verify runner works**

Run: `pnpm test`
Expected: exit 0 with "No test files found" (passWithNoTests).

- [ ] **Step 5: Commit (ask owner first)**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts
git commit -m "chore: add vitest for engine unit tests"
```

---

### Task 2: Engine types and constants

**Files:**
- Create: `src/components/QuasarBackground/engine/types.ts`

- [ ] **Step 1: Create `engine/types.ts` with the full content below**

```ts
import type { PerspectiveCamera } from 'three'

/** Narrative phases, in order. Numeric so they can feed a shader uniform. */
export enum Phase {
  STAR = 0,
  COLLAPSE = 1,
  FLASH = 2,
  SHELL = 3,
  BIRTH = 4,
  QUASAR = 5,
}

export const PHASE_ORDER: Phase[] = [
  Phase.STAR,
  Phase.COLLAPSE,
  Phase.FLASH,
  Phase.SHELL,
  Phase.BIRTH,
  Phase.QUASAR,
]

/** Seconds. STAR and QUASAR are open-ended (no entry). */
export const PHASE_DURATIONS: Partial<Record<Phase, number>> = {
  [Phase.COLLAPSE]: 1.5,
  [Phase.FLASH]: 0.4,
  [Phase.SHELL]: 8,
  [Phase.BIRTH]: 4,
}

export interface PhaseState {
  phase: Phase
  /** 0..1 within the current phase (0 for open-ended STAR, 1 for QUASAR). */
  progress: number
}

export interface PhaseInputs {
  dt: number
  cameraDistance: number
  userInteracted: boolean
  reducedMotion: boolean
}

/** Implemented by both tiers. index.tsx owns camera + controls. */
export interface SceneRenderer {
  init(container: HTMLElement, camera: PerspectiveCamera): void
  setPhase(state: PhaseState): void
  update(dt: number): void
  resize(width: number, height: number): void
  dispose(): void
}

/**
 * All tunables in one place (spec: "named constants, expected to be tuned").
 * Scene unit: 1 = 1 Schwarzschild radius (r_s).
 */
export const CONSTANTS = {
  // camera
  CAMERA_START_DISTANCE: 40,
  CAMERA_MIN_DISTANCE: 8,
  CAMERA_MAX_DISTANCE: 300,
  DPR_CAP: 2,
  // narrative
  STAR_RADIUS: 10,
  COLLAPSE_TRIGGER_DISTANCE: 15,
  IDLE_AUTOPLAY_SECONDS: 12,
  // disk / jets (r_s units)
  DISK_INNER_RS: 3,
  DISK_OUTER_RS: 14,
  ESCAPE_RADIUS_RS: 60,
  JET_LENGTH_RS: 50,
  JET_HALF_ANGLE_DEG: 4,
  // tiering / performance
  BENCHMARK_FRAME_MS: 12,
  BENCHMARK_FRAMES: 10,
  BENCHMARK_SIZE: 256,
  WATCHDOG_FPS: 30,
  WATCHDOG_SECONDS: 5,
  RESOLUTION_SCALE_MIN: 0.5,
  MESH_TIER_MAX_POLAR_DEG: 35,
  // bloom
  BLOOM_STRENGTH: 1.2,
  BLOOM_RADIUS: 0.6,
  BLOOM_THRESHOLD: 0.85,
} as const
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit (ask owner first)**

```bash
git add src/components/QuasarBackground/engine/types.ts
git commit -m "feat: add engine types and constants for my-story scene"
```

---

### Task 3: PhaseMachine (TDD)

**Files:**
- Create: `src/components/QuasarBackground/engine/PhaseMachine.ts`
- Test: `src/components/QuasarBackground/engine/__tests__/PhaseMachine.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { PhaseMachine } from '../PhaseMachine'
import { Phase, CONSTANTS, PHASE_DURATIONS } from '../types'

/** Inputs for a user idling at the start distance. */
const idle = (dt: number) => ({
  dt,
  cameraDistance: CONSTANTS.CAMERA_START_DISTANCE,
  userInteracted: false,
  reducedMotion: false,
})

describe('PhaseMachine', () => {
  it('starts in STAR with progress 0', () => {
    const m = new PhaseMachine()
    expect(m.state).toEqual({ phase: Phase.STAR, progress: 0 })
  })

  it('advances to COLLAPSE when camera zooms below the trigger distance', () => {
    const m = new PhaseMachine()
    const s = m.update({ ...idle(0.016), cameraDistance: CONSTANTS.COLLAPSE_TRIGGER_DISTANCE - 1 })
    expect(s.phase).toBe(Phase.COLLAPSE)
  })

  it('auto-plays after the idle timeout', () => {
    const m = new PhaseMachine()
    for (let t = 0; t < CONSTANTS.IDLE_AUTOPLAY_SECONDS; t += 0.1) m.update(idle(0.1))
    expect(m.state.phase).toBe(Phase.COLLAPSE)
  })

  it('does not auto-play under reduced motion', () => {
    const m = new PhaseMachine()
    for (let t = 0; t < CONSTANTS.IDLE_AUTOPLAY_SECONDS * 2; t += 0.1) {
      m.update({ ...idle(0.1), reducedMotion: true })
    }
    expect(m.state.phase).toBe(Phase.STAR)
  })

  it('zoom trigger still works under reduced motion', () => {
    const m = new PhaseMachine()
    const s = m.update({ ...idle(0.016), reducedMotion: true, cameraDistance: 10 })
    expect(s.phase).toBe(Phase.COLLAPSE)
  })

  it('interaction resets the idle timer', () => {
    const m = new PhaseMachine()
    for (let t = 0; t < 10; t += 0.1) m.update(idle(0.1)) // 10s idle
    m.update({ ...idle(0.1), userInteracted: true })      // reset
    for (let t = 0; t < 10; t += 0.1) m.update(idle(0.1)) // 10s more (< 12 again)
    expect(m.state.phase).toBe(Phase.STAR)
  })

  it('runs timed phases in order with correct durations', () => {
    const m = new PhaseMachine()
    m.update({ ...idle(0.016), cameraDistance: 10 }) // -> COLLAPSE
    const expectSequence: Array<[Phase, number]> = [
      [Phase.COLLAPSE, PHASE_DURATIONS[Phase.COLLAPSE] ?? 0],
      [Phase.FLASH, PHASE_DURATIONS[Phase.FLASH] ?? 0],
      [Phase.SHELL, PHASE_DURATIONS[Phase.SHELL] ?? 0],
      [Phase.BIRTH, PHASE_DURATIONS[Phase.BIRTH] ?? 0],
    ]
    for (const [phase, duration] of expectSequence) {
      expect(m.state.phase).toBe(phase)
      for (let t = 0; t < duration; t += 0.05) m.update(idle(0.05))
    }
    expect(m.state.phase).toBe(Phase.QUASAR)
  })

  it('reports progress within a timed phase and clamps to 1', () => {
    const m = new PhaseMachine()
    m.update({ ...idle(0.016), cameraDistance: 10 }) // -> COLLAPSE (1.5s)
    m.update(idle(0.75))
    expect(m.state.progress).toBeCloseTo(0.5, 5)
  })

  it('carries leftover dt across a phase boundary', () => {
    const m = new PhaseMachine()
    m.update({ ...idle(0.016), cameraDistance: 10 }) // -> COLLAPSE (1.5s)
    m.update(idle(1.6)) // 0.1s into FLASH (0.4s)
    expect(m.state.phase).toBe(Phase.FLASH)
    expect(m.state.progress).toBeCloseTo(0.1 / 0.4, 5)
  })

  it('a huge dt lands in QUASAR with progress 1, and stays there', () => {
    const m = new PhaseMachine()
    m.update({ ...idle(0.016), cameraDistance: 10 })
    m.update(idle(1000))
    expect(m.state).toEqual({ phase: Phase.QUASAR, progress: 1 })
    m.update(idle(1000))
    expect(m.state.phase).toBe(Phase.QUASAR)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — `Cannot find module '../PhaseMachine'` (or equivalent).

- [ ] **Step 3: Implement `engine/PhaseMachine.ts`**

```ts
import {
  CONSTANTS,
  Phase,
  PHASE_DURATIONS,
  PHASE_ORDER,
  type PhaseInputs,
  type PhaseState,
} from './types'

/**
 * Pure narrative state machine. Fed inputs each frame by index.tsx;
 * renderers consume the resulting PhaseState. No DOM, no Three.js.
 */
export class PhaseMachine {
  private phaseIndex = 0
  private elapsed = 0
  private idleSeconds = 0

  get state(): PhaseState {
    const phase = PHASE_ORDER[this.phaseIndex] ?? Phase.QUASAR
    const duration = PHASE_DURATIONS[phase]
    if (duration !== undefined) {
      return { phase, progress: Math.min(this.elapsed / duration, 1) }
    }
    return { phase, progress: phase === Phase.QUASAR ? 1 : 0 }
  }

  update(inputs: PhaseInputs): PhaseState {
    const phase = PHASE_ORDER[this.phaseIndex] ?? Phase.QUASAR

    if (phase === Phase.STAR) {
      if (inputs.userInteracted) this.idleSeconds = 0
      else this.idleSeconds += inputs.dt

      const zoomTriggered = inputs.cameraDistance < CONSTANTS.COLLAPSE_TRIGGER_DISTANCE
      const idleTriggered =
        !inputs.reducedMotion && this.idleSeconds >= CONSTANTS.IDLE_AUTOPLAY_SECONDS
      if (zoomTriggered || idleTriggered) this.advance(0)
      return this.state
    }

    // Timed phases: accumulate, carrying leftover dt across boundaries.
    this.elapsed += inputs.dt
    let duration = PHASE_DURATIONS[PHASE_ORDER[this.phaseIndex] ?? Phase.QUASAR]
    while (duration !== undefined && this.elapsed >= duration) {
      this.advance(this.elapsed - duration)
      duration = PHASE_DURATIONS[PHASE_ORDER[this.phaseIndex] ?? Phase.QUASAR]
    }
    return this.state
  }

  private advance(carrySeconds: number): void {
    if (this.phaseIndex < PHASE_ORDER.length - 1) {
      this.phaseIndex += 1
      this.elapsed = carrySeconds
    } else {
      this.elapsed = 0
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: all PhaseMachine tests PASS.

- [ ] **Step 5: Commit (ask owner first)**

```bash
git add src/components/QuasarBackground/engine/PhaseMachine.ts src/components/QuasarBackground/engine/__tests__/PhaseMachine.test.ts
git commit -m "feat: add narrative phase machine for my-story scene"
```

---

### Task 4: Derived phase uniforms (TDD)

Maps `PhaseState` to the animated scalar values both renderers feed their shaders. Keeping it pure makes visual continuity testable.

**Files:**
- Create: `src/components/QuasarBackground/engine/phaseUniforms.ts`
- Test: `src/components/QuasarBackground/engine/__tests__/phaseUniforms.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { derivePhaseUniforms } from '../phaseUniforms'
import { Phase, CONSTANTS } from '../types'

describe('derivePhaseUniforms', () => {
  it('STAR: full-size star, nothing else active', () => {
    const u = derivePhaseUniforms({ phase: Phase.STAR, progress: 0 })
    expect(u.starRadius).toBe(CONSTANTS.STAR_RADIUS)
    expect(u.flash).toBe(0)
    expect(u.lensing).toBe(0)
    expect(u.ignition).toBe(0)
    expect(u.shellRadius).toBe(0)
  })

  it('is continuous across COLLAPSE -> FLASH (star radius)', () => {
    const end = derivePhaseUniforms({ phase: Phase.COLLAPSE, progress: 1 })
    const start = derivePhaseUniforms({ phase: Phase.FLASH, progress: 0 })
    expect(start.starRadius).toBeCloseTo(end.starRadius, 5)
  })

  it('is continuous across FLASH -> SHELL (shell radius)', () => {
    const end = derivePhaseUniforms({ phase: Phase.FLASH, progress: 1 })
    const start = derivePhaseUniforms({ phase: Phase.SHELL, progress: 0 })
    expect(start.shellRadius).toBeCloseTo(end.shellRadius, 5)
  })

  it('FLASH peaks at entry and decays', () => {
    const a = derivePhaseUniforms({ phase: Phase.FLASH, progress: 0 })
    const b = derivePhaseUniforms({ phase: Phase.FLASH, progress: 1 })
    expect(a.flash).toBeGreaterThan(2)
    expect(b.flash).toBeCloseTo(0, 3)
  })

  it('SHELL decelerates (Sedov-like): first half covers most of the radius', () => {
    const half = derivePhaseUniforms({ phase: Phase.SHELL, progress: 0.5 })
    const full = derivePhaseUniforms({ phase: Phase.SHELL, progress: 1 })
    expect(half.shellRadius).toBeGreaterThan(0.6 * full.shellRadius)
  })

  it('BIRTH ramps lensing and ignition together from 0 to 1', () => {
    const mid = derivePhaseUniforms({ phase: Phase.BIRTH, progress: 0.5 })
    expect(mid.lensing).toBeCloseTo(0.5, 5)
    expect(mid.ignition).toBeCloseTo(0.5, 5)
    expect(mid.starRadius).toBe(0)
  })

  it('QUASAR: steady state', () => {
    const u = derivePhaseUniforms({ phase: Phase.QUASAR, progress: 1 })
    expect(u).toEqual({
      starRadius: 0,
      shellRadius: 0,
      flash: 0,
      lensing: 1,
      ignition: 1,
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — `Cannot find module '../phaseUniforms'`.

- [ ] **Step 3: Implement `engine/phaseUniforms.ts`**

```ts
import { CONSTANTS, Phase, type PhaseState } from './types'

export interface PhaseUniforms {
  /** Progenitor star radius in r_s (0 = no star). */
  starRadius: number
  /** Supernova shock-shell radius in r_s (0 = no shell). */
  shellRadius: number
  /** Additive white-out intensity (HDR, >1 drives bloom). */
  flash: number
  /** 0..1 — scales the GR bending term; 0 = straight rays. */
  lensing: number
  /** 0..1 — disk ignition front from ISCO outward. */
  ignition: number
}

const COLLAPSED_RADIUS = 1.2
const SHELL_START = COLLAPSED_RADIUS + 2 * 0.9 // matches FLASH end below
const SHELL_END = 30

export function derivePhaseUniforms({ phase, progress }: PhaseState): PhaseUniforms {
  const u: PhaseUniforms = { starRadius: 0, shellRadius: 0, flash: 0, lensing: 0, ignition: 0 }

  switch (phase) {
    case Phase.STAR:
      u.starRadius = CONSTANTS.STAR_RADIUS
      break
    case Phase.COLLAPSE:
      // ease-in contraction: 10 -> 1.2 r_s
      u.starRadius =
        CONSTANTS.STAR_RADIUS - (CONSTANTS.STAR_RADIUS - COLLAPSED_RADIUS) * progress * progress
      break
    case Phase.FLASH:
      // star winks out, core flash, shock front launches
      u.starRadius = COLLAPSED_RADIUS * (1 - progress)
      u.flash = 4 * Math.pow(1 - progress, 1.5)
      u.shellRadius = COLLAPSED_RADIUS + 2 * 0.9 * progress
      break
    case Phase.SHELL:
      // Sedov-like deceleration: R grows fast then slows
      u.shellRadius = SHELL_START + (SHELL_END - SHELL_START) * Math.pow(progress, 0.4)
      break
    case Phase.BIRTH:
      u.shellRadius = SHELL_END + 10 * progress // remnant keeps drifting out while fading
      u.lensing = progress
      u.ignition = progress
      break
    case Phase.QUASAR:
      u.lensing = 1
      u.ignition = 1
      break
  }
  return u
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: all tests PASS (including continuity: FLASH end shell = `1.2 + 1.8 = 3.0` = SHELL start).

- [ ] **Step 5: Commit (ask owner first)**

```bash
git add src/components/QuasarBackground/engine/phaseUniforms.ts src/components/QuasarBackground/engine/__tests__/phaseUniforms.test.ts
git commit -m "feat: derive per-phase shader uniform values"
```

---

### Task 5: Tier selection (TDD)

**Files:**
- Create: `src/components/QuasarBackground/engine/tierSelect.ts`
- Test: `src/components/QuasarBackground/engine/__tests__/tierSelect.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { selectTier, tierFromBenchmark, type TierEnvironment } from '../tierSelect'
import { CONSTANTS } from '../types'

/** A capable desktop: every heuristic says "raymarched is fine". */
const capable: TierEnvironment = {
  queryQuality: null,
  webgl2: true,
  floatColorBuffer: true,
  reducedMotion: false,
  coarsePointer: false,
  smallScreen: false,
  deviceMemoryGb: 16,
}

describe('selectTier', () => {
  it('?quality=high forces raymarched', () => {
    expect(selectTier({ ...capable, queryQuality: 'high', webgl2: false })).toBe('raymarched')
  })

  it('?quality=low forces mesh', () => {
    expect(selectTier({ ...capable, queryQuality: 'low' })).toBe('mesh')
  })

  it('missing WebGL2 forces mesh', () => {
    expect(selectTier({ ...capable, webgl2: false })).toBe('mesh')
  })

  it('missing float color buffer forces mesh', () => {
    expect(selectTier({ ...capable, floatColorBuffer: false })).toBe('mesh')
  })

  it('prefers-reduced-motion forces mesh', () => {
    expect(selectTier({ ...capable, reducedMotion: true })).toBe('mesh')
  })

  it('coarse pointer + small screen forces mesh', () => {
    expect(selectTier({ ...capable, coarsePointer: true, smallScreen: true })).toBe('mesh')
  })

  it('coarse pointer alone (e.g. touch laptop) does NOT force mesh', () => {
    expect(selectTier({ ...capable, coarsePointer: true })).toBe('benchmark')
  })

  it('low device memory forces mesh', () => {
    expect(selectTier({ ...capable, deviceMemoryGb: 4 })).toBe('mesh')
  })

  it('unknown device memory is not held against the device', () => {
    expect(selectTier({ ...capable, deviceMemoryGb: null })).toBe('benchmark')
  })

  it('ambiguous capable hardware goes to benchmark', () => {
    expect(selectTier(capable)).toBe('benchmark')
  })
})

describe('tierFromBenchmark', () => {
  it('fast frames pick raymarched', () => {
    expect(tierFromBenchmark(CONSTANTS.BENCHMARK_FRAME_MS - 1)).toBe('raymarched')
  })
  it('slow frames pick mesh', () => {
    expect(tierFromBenchmark(CONSTANTS.BENCHMARK_FRAME_MS + 1)).toBe('mesh')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — `Cannot find module '../tierSelect'`.

- [ ] **Step 3: Implement `engine/tierSelect.ts`**

```ts
import { CONSTANTS } from './types'

export type Tier = 'raymarched' | 'mesh'
export type TierDecision = Tier | 'benchmark'

export interface TierEnvironment {
  queryQuality: 'high' | 'low' | null
  webgl2: boolean
  floatColorBuffer: boolean
  reducedMotion: boolean
  coarsePointer: boolean
  smallScreen: boolean
  deviceMemoryGb: number | null
}

/**
 * Pure tier decision (spec §Tier selection). Order matters:
 * query override > hard requirements > reduced motion > heuristics > benchmark.
 * Note: ?quality=high overrides even missing WebGL2 — the runtime failure
 * ladder (shader compile failure -> mesh) is the safety net for that case.
 */
export function selectTier(env: TierEnvironment): TierDecision {
  if (env.queryQuality === 'high') return 'raymarched'
  if (env.queryQuality === 'low') return 'mesh'
  if (!env.webgl2 || !env.floatColorBuffer) return 'mesh'
  if (env.reducedMotion) return 'mesh'
  if (env.coarsePointer && env.smallScreen) return 'mesh'
  if (env.deviceMemoryGb !== null && env.deviceMemoryGb <= 4) return 'mesh'
  return 'benchmark'
}

export function tierFromBenchmark(avgFrameMs: number): Tier {
  return avgFrameMs < CONSTANTS.BENCHMARK_FRAME_MS ? 'raymarched' : 'mesh'
}

/** Browser reads. Kept thin and untested; all logic lives in selectTier. */
export function readTierEnvironment(): TierEnvironment {
  const params = new URLSearchParams(window.location.search)
  const q = params.get('quality')

  let webgl2 = false
  let floatColorBuffer = false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    if (gl) {
      webgl2 = true
      floatColorBuffer = gl.getExtension('EXT_color_buffer_float') !== null
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  } catch {
    // leave both false
  }

  const nav = navigator as Navigator & { deviceMemory?: number }
  return {
    queryQuality: q === 'high' || q === 'low' ? q : null,
    webgl2,
    floatColorBuffer,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    smallScreen: Math.min(window.screen.width, window.screen.height) < 768,
    deviceMemoryGb: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: all tests PASS.

- [ ] **Step 5: Commit (ask owner first)**

```bash
git add src/components/QuasarBackground/engine/tierSelect.ts src/components/QuasarBackground/engine/__tests__/tierSelect.test.ts
git commit -m "feat: add render tier selection with benchmark escape hatch"
```

---

### Task 6: Background module (starfield, galaxies, cubemap)

Extracts the existing procedural starfield + galaxy sprites out of the old `index.tsx` (lines ~480–604 of the current file) into a reusable module, and adds a one-shot cubemap baker so the raymarched tier can sample (and lens) the same background.

**Files:**
- Create: `src/components/QuasarBackground/engine/background.ts`

- [ ] **Step 1: Create `engine/background.ts`**

The star/galaxy functions below are the old implementations with two changes: they take an `object: THREE.Object3D` parent instead of `scene`, and they return their disposables.

```ts
import * as THREE from 'three'

export interface BackgroundHandle {
  dispose(): void
}

/** 1400 stars on a far sphere shell (extracted from the legacy scene). */
export function addBackgroundStars(
  parent: THREE.Object3D,
  numStars = 1400,
  radius = 120,
): BackgroundHandle {
  const positions = new Float32Array(numStars * 3)
  const colors = new Float32Array(numStars * 3)
  for (let i = 0; i < numStars; i++) {
    const phi = Math.acos(2 * Math.random() - 1)
    const theta = 2 * Math.PI * Math.random()
    const r = radius * (0.92 + 0.08 * Math.random())
    positions[3 * i] = r * Math.sin(phi) * Math.cos(theta)
    positions[3 * i + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[3 * i + 2] = r * Math.cos(phi)
    const base = 0.85 + Math.random() * 0.15
    const color = new THREE.Color().setHSL(
      0.1 + 0.15 * Math.random(),
      0.05 + 0.17 * Math.random(),
      base,
    )
    colors[3 * i] = color.r
    colors[3 * i + 1] = color.g
    colors[3 * i + 2] = color.b
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const mat = new THREE.PointsMaterial({
    size: 0.72,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  })
  const stars = new THREE.Points(geo, mat)
  parent.add(stars)
  return {
    dispose() {
      parent.remove(stars)
      geo.dispose()
      mat.dispose()
    },
  }
}

/** Procedural wispy spiral-galaxy sprite texture (extracted from legacy). */
function createGalaxyTexture(size = 256, color1 = '#fff', color2 = '#ffd080'): THREE.CanvasTexture | null {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.save()
  ctx.translate(size / 2, size / 2)
  for (let arm = 0; arm < 3; arm++) {
    ctx.rotate(((2 * Math.PI) / 3) * arm + Math.random() * 0.2)
    ctx.beginPath()
    for (let i = 0; i < 90; i++) {
      const t = i / 90
      const r = (size / 2) * t * (0.6 + 0.2 * Math.random())
      const theta = 2.5 * Math.PI * t
      const x = r * Math.cos(theta)
      const y = r * Math.sin(theta)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 2.5 + Math.random() * 2.5
    ctx.shadowColor = color2
    ctx.shadowBlur = 8 + Math.random() * 10
    ctx.globalAlpha = 0.7
    ctx.stroke()
  }
  ctx.restore()
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2 * 0.45)
  grad.addColorStop(0, color1)
  grad.addColorStop(0.35, color2)
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.globalAlpha = 1.0
  ctx.globalCompositeOperation = 'lighter'
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2 * 0.45, 0, 2 * Math.PI)
  ctx.closePath()
  ctx.fillStyle = grad
  ctx.fill()
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/** 12 galaxy sprites on the far shell (extracted; placement bias removed — the cubemap covers all directions anyway). */
export function addBackgroundGalaxies(
  parent: THREE.Object3D,
  num = 12,
  radius = 110,
): BackgroundHandle {
  const disposables: Array<() => void> = []
  for (let i = 0; i < num; i++) {
    const phi = Math.acos(2 * Math.random() - 1)
    const theta = 2 * Math.PI * Math.random()
    const r = radius * (0.93 + 0.09 * Math.random())
    const color1 = i % 3 === 0 ? '#fff' : i % 3 === 1 ? '#ffd080' : '#b5e3ff'
    const color2 = i % 3 === 0 ? '#ffd080' : i % 3 === 1 ? '#ffb347' : '#a6c8ff'
    const tex = createGalaxyTexture(256, color1, color2)
    if (!tex) continue
    const mat = new THREE.SpriteMaterial({
      map: tex,
      color: 0xffffff,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const sprite = new THREE.Sprite(mat)
    const scale = 10 + Math.random() * 22
    sprite.scale.set(scale, scale, 1)
    sprite.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    )
    parent.add(sprite)
    disposables.push(() => {
      parent.remove(sprite)
      mat.dispose()
      tex.dispose()
    })
  }
  return {
    dispose() {
      disposables.forEach((d) => d())
    },
  }
}

/**
 * Bake stars + galaxies into a cubemap once at init.
 * Escaped rays in the raymarcher sample this, so the background lenses for free.
 */
export function bakeBackgroundCubemap(renderer: THREE.WebGLRenderer): THREE.CubeTexture {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)
  const stars = addBackgroundStars(scene)
  const galaxies = addBackgroundGalaxies(scene)

  const target = new THREE.WebGLCubeRenderTarget(1024, {
    generateMipmaps: false,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  })
  const cubeCamera = new THREE.CubeCamera(0.1, 500, target)
  cubeCamera.update(renderer, scene)

  stars.dispose()
  galaxies.dispose()
  return target.texture
}
```

Note (amended during code review): `bakeBackgroundCubemap` returns a `BakedCubemap { texture, dispose() }` handle whose `dispose()` calls `target.dispose()` — disposing only the CubeTexture would leak the render target's 6 FBOs (three@0.183 frees framebuffers only via RenderTarget.dispose). `RaymarchedRenderer.dispose()` calls the handle's `dispose()` (Task 8).

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: clean.

- [ ] **Step 3: Commit (ask owner first)**

```bash
git add src/components/QuasarBackground/engine/background.ts
git commit -m "feat: extract background stars/galaxies and add cubemap baker"
```

---

### Task 7: GLSL shader library

GLSL can't be unit-tested here; correctness is verified visually in Tasks 8–9. This task only creates the strings and ensures they typecheck.

**Files:**
- Create: `src/components/QuasarBackground/engine/shaders/chunks.ts`
- Create: `src/components/QuasarBackground/engine/shaders/blackhole.frag.ts`

- [ ] **Step 1: Create `engine/shaders/chunks.ts`**

```ts
/** Shared GLSL chunks (GLSL ES 1.0, used by both tiers). */

export const GLSL_NOISE = /* glsl */ `
float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}
float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  float a = hash13(i);
  float b = hash13(i + vec3(1.0, 0.0, 0.0));
  float c = hash13(i + vec3(0.0, 1.0, 0.0));
  float d = hash13(i + vec3(1.0, 1.0, 0.0));
  float e = hash13(i + vec3(0.0, 0.0, 1.0));
  float g = hash13(i + vec3(1.0, 0.0, 1.0));
  float h = hash13(i + vec3(0.0, 1.0, 1.0));
  float k = hash13(i + vec3(1.0, 1.0, 1.0));
  return mix(
    mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
    mix(mix(e, g, u.x), mix(h, k, u.x), u.y),
    u.z
  );
}
float fbm(vec3 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += amp * vnoise(p);
    p *= 2.03;
    amp *= 0.5;
  }
  return v;
}
`

export const GLSL_BLACKBODY = /* glsl */ `
// Normalized temperature t in [0,1] (0 = cool outer disk, 1 = ISCO) -> RGB.
vec3 blackbody(float t) {
  vec3 cold = vec3(0.55, 0.12, 0.03);
  vec3 mid  = vec3(1.00, 0.45, 0.10);
  vec3 warm = vec3(1.00, 0.85, 0.55);
  vec3 hot  = vec3(0.75, 0.85, 1.00);
  if (t < 0.33) return mix(cold, mid, t / 0.33);
  if (t < 0.66) return mix(mid, warm, (t - 0.33) / 0.33);
  return mix(warm, hot, (t - 0.66) / 0.34);
}
`

export const GLSL_SHELL_COLOR = /* glsl */ `
// Supernova ejecta cooling: white -> yellow -> orange -> deep red. HDR (>1 feeds bloom).
vec3 shellColorRamp(float t) {
  vec3 white  = vec3(1.30, 1.25, 1.15);
  vec3 yellow = vec3(1.20, 0.95, 0.45);
  vec3 orange = vec3(1.00, 0.45, 0.12);
  vec3 red    = vec3(0.60, 0.12, 0.05);
  if (t < 0.2) return mix(white, yellow, t / 0.2);
  if (t < 0.55) return mix(yellow, orange, (t - 0.2) / 0.35);
  return mix(orange, red, (t - 0.55) / 0.45);
}
`

export const GLSL_STAR_SURFACE = /* glsl */ `
// Red supergiant surface: convective granulation + limb darkening.
// collapse in [0,1] brightens the core during COLLAPSE.
vec3 starSurface(vec3 nrm, vec3 rd, float time, float collapse) {
  float gran = fbm(nrm * 6.0 + vec3(0.0, time * 0.12, 0.0));
  vec3 base = mix(vec3(0.85, 0.18, 0.04), vec3(1.0, 0.62, 0.25), gran);
  float limb = pow(max(dot(nrm, -rd), 0.0), 0.55);
  float brighten = 1.0 + 7.0 * collapse * collapse;
  return base * limb * brighten * 1.6;
}
`

export const GLSL_SPHERE_INTERVAL = /* glsl */ `
// Ray/sphere (centered at origin): returns (tNear, tFar), or (-1,-1) on miss.
vec2 sphereInterval(vec3 ro, vec3 rd, float R) {
  float b = dot(ro, rd);
  float c = dot(ro, ro) - R * R;
  float h = b * b - c;
  if (h < 0.0) return vec2(-1.0);
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}
`
```

- [ ] **Step 2: Create `engine/shaders/blackhole.frag.ts`**

```ts
import {
  GLSL_BLACKBODY,
  GLSL_NOISE,
  GLSL_SHELL_COLOR,
  GLSL_SPHERE_INTERVAL,
  GLSL_STAR_SURFACE,
} from './chunks'
import { CONSTANTS } from '../types'

export const FULLSCREEN_VERT = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const JET_TAN = Math.tan((CONSTANTS.JET_HALF_ANGLE_DEG * Math.PI) / 180).toFixed(5)

export const BLACKHOLE_FRAG = /* glsl */ `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uCamPos;
uniform mat4 uInvProjView;
uniform mat3 uWorldToDisk;   // world -> disk frame (disk plane is y = 0)
uniform samplerCube uBackground;
uniform int uPhase;          // Phase enum: 0 STAR .. 5 QUASAR
uniform float uProgress;
uniform float uStarRadius;
uniform float uShellRadius;
uniform float uFlash;
uniform float uLensing;
uniform float uIgnition;

#define DISK_INNER ${CONSTANTS.DISK_INNER_RS.toFixed(1)}
#define DISK_OUTER ${CONSTANTS.DISK_OUTER_RS.toFixed(1)}
#define ESCAPE_R ${CONSTANTS.ESCAPE_RADIUS_RS.toFixed(1)}
#define JET_LEN ${CONSTANTS.JET_LENGTH_RS.toFixed(1)}
#define JET_TAN ${JET_TAN}
#define MAX_STEPS 128
#define SHELL_SAMPLES 10

${GLSL_NOISE}
${GLSL_BLACKBODY}
${GLSL_SHELL_COLOR}
${GLSL_STAR_SURFACE}
${GLSL_SPHERE_INTERVAL}

vec3 sampleBackground(vec3 dirDisk) {
  // v * M == transpose(M) * v: inverse rotation for orthonormal uWorldToDisk
  vec3 worldDir = dirDisk * uWorldToDisk;
  return textureCube(uBackground, worldDir).rgb;
}

// Volumetric supernova shell between R-thickness and R, with fbm filaments.
vec3 shellEmission(vec3 ro, vec3 rd) {
  float R = uShellRadius;
  if (R <= 0.01) return vec3(0.0);
  float thick = 0.18 * R + 0.4;
  vec2 tOut = sphereInterval(ro, rd, R);
  if (tOut.y < 0.0) return vec3(0.0);
  float t0 = max(tOut.x, 0.0);
  float t1 = tOut.y;
  // cooled color: FLASH = white, SHELL cools with progress, BIRTH = fully cooled + fading
  float coolT = uPhase == 2 ? 0.0 : (uPhase == 3 ? uProgress : 1.0);
  float fade = uPhase == 4 ? (1.0 - uProgress) : 1.0;
  vec3 acc = vec3(0.0);
  for (int i = 0; i < SHELL_SAMPLES; i++) {
    float t = mix(t0, t1, (float(i) + 0.5) / float(SHELL_SAMPLES));
    vec3 p = ro + rd * t;
    float pr = length(p);
    float band = exp(-pow((pr - (R - thick * 0.5)) / (thick * 0.5), 2.0));
    if (band < 0.01) continue;
    vec3 dir = p / max(pr, 1e-4);
    float fil = pow(fbm(dir * 6.0 + vec3(0.0, 0.0, 1.7)), 3.0) * 2.5;   // filaments
    float aniso = 0.55 + 0.9 * fbm(dir * 2.1 + vec3(13.1));             // large-scale asymmetry
    acc += shellColorRamp(coolT) * band * fil * aniso;
  }
  return acc * (t1 - t0) / float(SHELL_SAMPLES) * 0.6 * fade;
}

// Accretion disk emission at a plane-crossing point.
vec3 diskSample(vec3 cp, float cr, vec3 stepDir) {
  float azimuth = atan(cp.z, cp.x);
  float omega = 1.1 * pow(cr, -1.5) * 6.2831853;     // Keplerian differential rotation
  float ang = azimuth - omega * uTime;
  vec2 q = vec2(cos(ang), sin(ang)) * cr;
  float turb = 0.25 + 1.75 * pow(fbm(vec3(q * 0.9, cr * 0.35)), 2.0);

  float tNorm = clamp(1.0 - (cr - DISK_INNER) / (DISK_OUTER - DISK_INNER), 0.0, 1.0);
  vec3 bb = blackbody(pow(tNorm, 0.75));             // T ~ r^-3/4

  vec3 vdir = normalize(vec3(-cp.z, 0.0, cp.x));     // orbital direction
  float beta = clamp(sqrt(0.5 / max(cr - 1.0, 0.8)), 0.0, 0.6);
  float cosTheta = dot(vdir, -stepDir);              // photon travels -stepDir to observer
  float beam = pow(1.0 / max(1.0 - beta * cosTheta, 0.3), 3.5);

  float g = sqrt(max(1.0 - 1.0 / cr, 0.0));          // gravitational redshift dimming
  float radial = pow(DISK_INNER / cr, 1.6);
  float edges = smoothstep(DISK_INNER, DISK_INNER + 0.35, cr)
              * (1.0 - smoothstep(DISK_OUTER - 2.5, DISK_OUTER, cr));
  float front = mix(DISK_INNER, DISK_OUTER + 2.0, uIgnition);
  float lit = smoothstep(front + 1.0, front - 1.0, cr); // ignites inner-out (BIRTH)

  return bb * turb * beam * g * radial * edges * lit * 2.4;
}

// Bipolar jets, sampled volumetrically along the march.
vec3 jetSample(vec3 p) {
  float ay = abs(p.y);
  if (ay < 0.5 || ay > JET_LEN) return vec3(0.0);
  float rho = length(p.xz);
  float coneR = 0.25 + JET_TAN * ay;
  float radial = exp(-pow(rho / coneR, 2.0) * 2.0);
  if (radial < 0.01) return vec3(0.0);
  float knots = 0.3 + 1.4 * pow(
    fbm(vec3(rho * 1.5, p.y * 0.35 - sign(p.y) * uTime * 2.2, atan(p.z, p.x) * 1.5)), 2.0);
  float lf = 1.0 - ay / JET_LEN;
  return vec3(0.55, 0.7, 1.0) * radial * knots * lf * lf * 0.035 * uIgnition;
}

// Schwarzschild null geodesic march: u'' = 1.5*L*u^2 - u, u = 1/r, r_s = 1.
vec3 marchBlackHole(vec3 ro, vec3 rd) {
  float r0 = length(ro);
  vec3 er = ro / r0;
  vec3 nvec = cross(er, rd);
  float nlen = length(nvec);
  if (nlen < 1e-4) {
    // purely radial ray
    if (dot(rd, er) < 0.0) return vec3(0.0);
    return sampleBackground(rd);
  }
  vec3 n = nvec / nlen;
  vec3 et = cross(n, er);                  // in-plane tangent, dot(rd, et) >= 0
  float u = 1.0 / r0;
  float drds = dot(rd, er);
  float rdphids = max(dot(rd, et), 1e-6);
  float up = -drds * u / rdphids;          // du/dphi

  float phi = 0.0;
  vec3 col = vec3(0.0);
  vec3 prevPos = ro;
  vec3 pos = ro;
  float minR = r0;
  int crossings = 0;
  bool escaped = false;

  for (int i = 0; i < MAX_STEPS; i++) {
    float r = 1.0 / max(u, 1e-6);
    float dphi = r < 3.0 ? 0.015 : (r < 10.0 ? 0.04 : 0.12);

    // RK2 midpoint
    float a1 = 1.5 * uLensing * u * u - u;
    float um = u + up * 0.5 * dphi;
    float upm = up + a1 * 0.5 * dphi;
    float a2 = 1.5 * uLensing * um * um - um;
    u += upm * dphi;
    up += a2 * dphi;
    phi += dphi;

    if (u <= 0.0) { escaped = true; break; }
    float rNew = 1.0 / u;
    minR = min(minR, rNew);
    if (rNew < 1.0) break;                  // captured by horizon
    pos = (cos(phi) * er + sin(phi) * et) * rNew;

    if (uIgnition > 0.001 && crossings < 3 && sign(pos.y) != sign(prevPos.y)) {
      float f = abs(prevPos.y) / max(abs(prevPos.y) + abs(pos.y), 1e-6);
      vec3 cp = mix(prevPos, pos, f);
      float cr = length(cp.xz);
      if (cr > DISK_INNER && cr < DISK_OUTER) {
        col += diskSample(cp, cr, normalize(pos - prevPos));
      }
      crossings++;
    }

    if (uIgnition > 0.001) col += jetSample(pos) * length(pos - prevPos);

    if (rNew > ESCAPE_R && up < 0.0) { escaped = true; break; }
    prevPos = pos;
  }

  // photon-ring rim from closest approach to the photon sphere (1.5 r_s)
  float ring = exp(-pow((minR - 1.5) * 2.8, 2.0));
  col += vec3(1.0, 0.9, 0.75) * ring * 0.6 * uLensing * uIgnition;

  if (escaped) {
    vec3 outDir = pos == prevPos ? rd : normalize(pos - prevPos);
    col += sampleBackground(outDir);
  }
  return col;
}

// Phases 0-2 (+3): analytic star + shell + straight-ray background. No march.
vec3 preBirthScene(vec3 ro, vec3 rd) {
  vec3 col = sampleBackground(rd);
  float effR = uStarRadius;
  if (uPhase == 0) effR *= 1.0 + 0.02 * sin(uTime * 0.7);   // gentle pulsation
  if (effR > 0.01) {
    vec2 t = sphereInterval(ro, rd, effR);
    if (t.x > 0.0) {
      vec3 nrm = (ro + rd * t.x) / effR;
      col = starSurface(nrm, rd, uTime, uPhase == 1 ? uProgress : 0.0);
    }
  }
  if (uPhase == 2 || uPhase == 3) col += shellEmission(ro, rd);
  return col;
}

void main() {
  vec2 ndc = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
  vec4 pw = uInvProjView * vec4(ndc, 0.5, 1.0);
  vec3 rdWorld = normalize(pw.xyz / pw.w - uCamPos);
  vec3 ro = uWorldToDisk * uCamPos;
  vec3 rd = uWorldToDisk * rdWorld;

  vec3 col;
  if (uPhase < 4) {
    col = preBirthScene(ro, rd);
  } else {
    col = marchBlackHole(ro, rd);
    if (uPhase == 4) col += shellEmission(ro, rd);   // remnant fading during BIRTH
  }
  col += vec3(uFlash);
  gl_FragColor = vec4(col, 1.0);
}
`
```

Note: `pos == prevPos` is not valid GLSL — when transcribing, use `length(pos - prevPos) < 1e-6 ? rd : normalize(pos - prevPos)` via an `if`:

```glsl
    vec3 outDir = rd;
    if (length(pos - prevPos) > 1e-6) outDir = normalize(pos - prevPos);
    col += sampleBackground(outDir);
```

Use this corrected form in the actual file.

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: clean. (Shader compile errors surface in Task 8's visual check.)

- [ ] **Step 4: Commit (ask owner first)**

```bash
git add src/components/QuasarBackground/engine/shaders/chunks.ts src/components/QuasarBackground/engine/shaders/blackhole.frag.ts
git commit -m "feat: add GLSL chunks and raymarched black hole shader"
```

---

### Task 8: RaymarchedRenderer

**Files:**
- Create: `src/components/QuasarBackground/engine/RaymarchedRenderer.ts`

- [ ] **Step 1: Create `engine/RaymarchedRenderer.ts`**

```ts
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { bakeBackgroundCubemap, type BakedCubemap } from './background'
import { derivePhaseUniforms } from './phaseUniforms'
import { BLACKHOLE_FRAG, FULLSCREEN_VERT } from './shaders/blackhole.frag'
import { CONSTANTS, Phase, type PhaseState, type SceneRenderer } from './types'

/**
 * Desktop tier: fullscreen quad raymarching Schwarzschild geodesics,
 * HDR -> UnrealBloom -> ACES. Owns its WebGLRenderer; index.tsx owns
 * the perspective camera + OrbitControls.
 */
export class RaymarchedRenderer implements SceneRenderer {
  /** index.tsx sets this; called when the watchdog gives up. */
  onDemote: (() => void) | null = null

  private renderer: THREE.WebGLRenderer | null = null
  private composer: EffectComposer | null = null
  private material: THREE.ShaderMaterial | null = null
  private quadGeometry: THREE.PlaneGeometry | null = null
  private bloomPass: UnrealBloomPass | null = null
  private background: BakedCubemap | null = null
  private camera: THREE.PerspectiveCamera | null = null

  private size = { width: 1, height: 1 }
  private resolutionScale = 1
  private time = 0
  private frameTimes: number[] = []
  private slowSeconds = 0
  private demoted = false
  private readonly invProjView = new THREE.Matrix4()
  private readonly worldToDisk = new THREE.Matrix3()

  init(container: HTMLElement, camera: THREE.PerspectiveCamera): void {
    this.camera = camera

    const renderer = new THREE.WebGLRenderer({ antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONSTANTS.DPR_CAP))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)
    this.renderer = renderer

    this.background = bakeBackgroundCubemap(renderer)

    // Disk tilt: reuse the legacy scene's tilt so the composition reads the same.
    const tilt = new THREE.Matrix4()
      .makeRotationZ(-Math.PI / 8)
      .multiply(new THREE.Matrix4().makeRotationX(0.749))
    this.worldToDisk.setFromMatrix4(tilt.invert())

    this.material = new THREE.ShaderMaterial({
      vertexShader: FULLSCREEN_VERT,
      fragmentShader: BLACKHOLE_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uResolution: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uCamPos: { value: new THREE.Vector3() },
        uInvProjView: { value: this.invProjView },
        uWorldToDisk: { value: this.worldToDisk },
        uBackground: { value: this.background.texture },
        uPhase: { value: Phase.STAR },
        uProgress: { value: 0 },
        uStarRadius: { value: CONSTANTS.STAR_RADIUS },
        uShellRadius: { value: 0 },
        uFlash: { value: 0 },
        uLensing: { value: 0 },
        uIgnition: { value: 0 },
      },
    })

    const scene = new THREE.Scene()
    this.quadGeometry = new THREE.PlaneGeometry(2, 2)
    scene.add(new THREE.Mesh(this.quadGeometry, this.material))
    const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, orthoCamera))
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(256, 256),
      CONSTANTS.BLOOM_STRENGTH,
      CONSTANTS.BLOOM_RADIUS,
      CONSTANTS.BLOOM_THRESHOLD,
    )
    composer.addPass(this.bloomPass)
    composer.addPass(new OutputPass())
    this.composer = composer

    this.resize(container.clientWidth, container.clientHeight)
  }

  setPhase(state: PhaseState): void {
    const u = this.material?.uniforms
    if (!u) return
    const derived = derivePhaseUniforms(state)
    u.uPhase!.value = state.phase
    u.uProgress!.value = state.progress
    u.uStarRadius!.value = derived.starRadius
    u.uShellRadius!.value = derived.shellRadius
    u.uFlash!.value = derived.flash
    u.uLensing!.value = derived.lensing
    u.uIgnition!.value = derived.ignition
  }

  update(dt: number): void {
    const { renderer, composer, material, camera } = this
    if (!renderer || !composer || !material || !camera) return

    const started = performance.now()
    this.time += dt
    material.uniforms.uTime!.value = this.time

    camera.updateMatrixWorld()
    ;(material.uniforms.uCamPos!.value as THREE.Vector3).copy(camera.position)
    // clip -> world: matrixWorld * projectionMatrixInverse
    this.invProjView.copy(camera.projectionMatrixInverse).premultiply(camera.matrixWorld)

    composer.render()
    this.governor(performance.now() - started, dt)
  }

  /**
   * Resolution governor + watchdog (spec §Desktop tier). Renders internally at
   * size * resolutionScale; CSS stretches the canvas to full size.
   */
  private governor(frameMs: number, dt: number): void {
    this.frameTimes.push(frameMs)
    if (this.frameTimes.length < 30) return
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
    this.frameTimes.length = 0

    if (avg > 1000 / 50 && this.resolutionScale > CONSTANTS.RESOLUTION_SCALE_MIN) {
      this.resolutionScale = Math.max(CONSTANTS.RESOLUTION_SCALE_MIN, this.resolutionScale - 0.1)
      this.applySize()
    } else if (avg < 1000 / 80 && this.resolutionScale < 1) {
      this.resolutionScale = Math.min(1, this.resolutionScale + 0.1)
      this.applySize()
    }

    if (avg > 1000 / CONSTANTS.WATCHDOG_FPS && this.resolutionScale <= CONSTANTS.RESOLUTION_SCALE_MIN) {
      this.slowSeconds += dt * 30 // 30 frames worth of dt since we batch
      if (this.slowSeconds >= CONSTANTS.WATCHDOG_SECONDS && !this.demoted) {
        this.demoted = true
        this.onDemote?.()
      }
    } else {
      this.slowSeconds = 0
    }
  }

  /**
   * Hidden micro-benchmark (spec §Tier selection): renders the QUASAR phase at
   * low resolution for a few frames and reports the average frame time.
   * Call after init() and before the canvas is revealed.
   */
  runBenchmark(): number {
    const { renderer, composer, material } = this
    if (!renderer || !composer || !material) return Number.POSITIVE_INFINITY

    const prev = {
      phase: material.uniforms.uPhase!.value as Phase,
      progress: material.uniforms.uProgress!.value as number,
    }
    this.setPhase({ phase: Phase.QUASAR, progress: 1 })
    renderer.domElement.style.visibility = 'hidden'
    composer.setSize(CONSTANTS.BENCHMARK_SIZE, CONSTANTS.BENCHMARK_SIZE)
    ;(material.uniforms.uResolution!.value as THREE.Vector2).set(
      CONSTANTS.BENCHMARK_SIZE,
      CONSTANTS.BENCHMARK_SIZE,
    )

    const started = performance.now()
    for (let i = 0; i < CONSTANTS.BENCHMARK_FRAMES; i++) composer.render()
    // Force the GPU to finish so timings are honest.
    renderer.getContext().finish()
    const avg = (performance.now() - started) / CONSTANTS.BENCHMARK_FRAMES

    this.setPhase({ phase: prev.phase, progress: prev.progress })
    this.applySize()
    renderer.domElement.style.visibility = 'visible'
    return avg
  }

  resize(width: number, height: number): void {
    this.size = { width: Math.max(width, 1), height: Math.max(height, 1) }
    this.applySize()
  }

  private applySize(): void {
    const { renderer, composer, material } = this
    if (!renderer || !composer || !material) return
    const w = Math.round(this.size.width * this.resolutionScale)
    const h = Math.round(this.size.height * this.resolutionScale)
    renderer.setSize(w, h, false) // false: keep CSS at 100%
    composer.setSize(w, h)
    const dpr = renderer.getPixelRatio()
    ;(material.uniforms.uResolution!.value as THREE.Vector2).set(w * dpr, h * dpr)
  }

  dispose(): void {
    this.composer?.dispose()
    this.bloomPass?.dispose()
    this.material?.dispose()
    this.quadGeometry?.dispose()
    this.background?.dispose() // frees the cubemap render target (6 FBOs + texture)
    if (this.renderer) {
      this.renderer.domElement.remove()
      this.renderer.dispose()
    }
    this.renderer = null
    this.composer = null
    this.material = null
    this.camera = null
  }
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: clean. If `tsc` complains about `uniforms.uPhase!` index access, the repo's `noUncheckedIndexedAccess` is on — keep the non-null assertions as written.

- [ ] **Step 3: Temporary visual smoke test**

The React shell doesn't exist yet, so verify with a scratch harness. Temporarily replace the body of the default export in `src/components/QuasarBackground/index.tsx` (keep the old code in git, you'll fully rewrite this file in Task 10) with:

```tsx
'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RaymarchedRenderer } from './engine/RaymarchedRenderer'
import { Phase } from './engine/types'

export default function QuasarBackground() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = ref.current
    if (!container) return
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(0, 6, 40)
    camera.lookAt(0, 0, 0)
    const r = new RaymarchedRenderer()
    r.init(container, camera)
    r.setPhase({ phase: Phase.QUASAR, progress: 1 })
    let last = performance.now()
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const now = performance.now()
      r.update((now - last) / 1000)
      last = now
    }
    loop()
    return () => {
      cancelAnimationFrame(raf)
      r.dispose()
    }
  }, [])
  return <div ref={ref} style={{ width: '100%', height: '100%' }} />
}
```

Run: `pnpm dev`, open `http://localhost:3000/my-story`.
Expected: a black hole with a dark shadow, bright thin photon ring, a turbulent orange-to-blue-white disk brighter on one side (Doppler), the far side of the disk bent above/below the shadow, faint blue jets, lensed starfield. No console shader errors. Orbiting is not wired yet (camera is fixed) — that's Task 10.

Iterate on shader constants here if anything looks broken (NaN black screen → check `max()` guards; no disk → check `uIgnition` is 1).

- [ ] **Step 4: Commit (ask owner first; include the scratch harness as-is)**

```bash
git add src/components/QuasarBackground/engine/RaymarchedRenderer.ts src/components/QuasarBackground/index.tsx
git commit -m "feat: add raymarched black hole renderer (desktop tier)"
```

---

### Task 9: Mesh fallback tier

**Files:**
- Create: `src/components/QuasarBackground/engine/shaders/meshShaders.ts`
- Create: `src/components/QuasarBackground/engine/MeshRenderer.ts`

- [ ] **Step 1: Create `engine/shaders/meshShaders.ts`**

```ts
import { GLSL_BLACKBODY, GLSL_NOISE, GLSL_SHELL_COLOR, GLSL_STAR_SURFACE } from './chunks'

/** Disk: RingGeometry lies in object XY; the mesh is rotated flat by MeshRenderer. */
export const DISK_VERT = /* glsl */ `
varying vec2 vPos;
void main() {
  vPos = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const DISK_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uIgnition;
uniform float uInner;
uniform float uOuter;
varying vec2 vPos;
${GLSL_NOISE}
${GLSL_BLACKBODY}
void main() {
  float r = length(vPos);
  float azimuth = atan(vPos.y, vPos.x);
  float omega = 1.1 * pow(r, -1.5) * 6.2831853;
  float ang = azimuth - omega * uTime;
  vec2 q = vec2(cos(ang), sin(ang)) * r;
  float turb = 0.25 + 1.75 * pow(fbm(vec3(q * 0.9, r * 0.35)), 2.0);

  float tNorm = clamp(1.0 - (r - uInner) / (uOuter - uInner), 0.0, 1.0);
  vec3 bb = blackbody(pow(tNorm, 0.75));

  // Static Doppler approximation: fixed approaching side (fallback-tier compromise).
  float beam = pow(1.0 / (1.0 - 0.45 * sin(azimuth)), 2.5);

  float radial = pow(uInner / r, 1.6);
  float edges = smoothstep(uInner, uInner + 0.35, r)
              * (1.0 - smoothstep(uOuter - 2.5, uOuter, r));
  float front = mix(uInner, uOuter + 2.0, uIgnition);
  float lit = smoothstep(front + 1.0, front - 1.0, r);

  gl_FragColor = vec4(bb * turb * beam * radial * edges * lit * 2.0, 1.0);
}
`

/** Jets: open-ended cones, vUv.y runs base->tip. */
export const JET_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const JET_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uIgnition;
varying vec2 vUv;
${GLSL_NOISE}
void main() {
  float knots = 0.3 + 1.4 * pow(
    fbm(vec3(vUv.x * 6.2831853, vUv.y * 18.0 - uTime * 2.2, 0.0)), 2.0);
  float lengthFade = pow(1.0 - vUv.y, 2.0);
  gl_FragColor = vec4(vec3(0.55, 0.7, 1.0) * knots * lengthFade * uIgnition * 0.6, 1.0);
}
`

export const STAR_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;
void main() {
  vNormal = normalize(mat3(modelMatrix) * normal);
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPos, 1.0);
}
`

export const STAR_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uCollapse;
varying vec3 vNormal;
varying vec3 vWorldPos;
${GLSL_NOISE}
${GLSL_STAR_SURFACE}
void main() {
  vec3 rd = normalize(vWorldPos - cameraPosition);
  gl_FragColor = vec4(starSurface(normalize(vNormal), rd, uTime, uCollapse), 1.0);
}
`

/** Supernova shell as shader-driven points: dir/seed attributes, radius uniform. */
export const SHELL_VERT = /* glsl */ `
attribute vec3 dir;
attribute float seed;
uniform float uShellRadius;
varying float vSeed;
void main() {
  vSeed = seed;
  vec3 p = dir * uShellRadius * (1.0 + 0.22 * (seed - 0.5));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (60.0 + 90.0 * seed) / max(-mv.z, 1.0);
  gl_Position = projectionMatrix * mv;
}
`

export const SHELL_FRAG = /* glsl */ `
precision highp float;
uniform float uCool;
uniform float uFade;
varying float vSeed;
${GLSL_SHELL_COLOR}
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float soft = smoothstep(0.5, 0.05, length(c));
  float alpha = soft * (0.25 + 0.75 * fract(vSeed * 7.13)) * uFade;
  gl_FragColor = vec4(shellColorRamp(uCool) * alpha, 1.0);
}
`
```

- [ ] **Step 2: Create `engine/MeshRenderer.ts`**

```ts
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { addBackgroundGalaxies, addBackgroundStars, type BackgroundHandle } from './background'
import { derivePhaseUniforms } from './phaseUniforms'
import {
  DISK_FRAG,
  DISK_VERT,
  JET_FRAG,
  JET_VERT,
  SHELL_FRAG,
  SHELL_VERT,
  STAR_FRAG,
  STAR_VERT,
} from './shaders/meshShaders'
import { CONSTANTS, Phase, type PhaseState, type SceneRenderer } from './types'

const SHELL_POINTS = 3000

function additive(params: THREE.ShaderMaterialParameters): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    ...params,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}

/** Soft radial ring texture for the photon-ring billboard. */
function createRingTexture(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0.0, 'rgba(0,0,0,0)')
  grad.addColorStop(0.46, 'rgba(0,0,0,0)')
  grad.addColorStop(0.5, 'rgba(255,235,200,1)')
  grad.addColorStop(0.54, 'rgba(0,0,0,0)')
  grad.addColorStop(1.0, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

/** Soft white radial texture for the FLASH sprite. */
function createFlashTexture(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

/**
 * Fallback tier: one disk mesh, black sphere + photon-ring billboard +
 * over-arc, cone jets, point-shell supernova. Quarter-res bloom.
 */
export class MeshRenderer implements SceneRenderer {
  private renderer: THREE.WebGLRenderer | null = null
  private composer: EffectComposer | null = null
  private bloomPass: UnrealBloomPass | null = null
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera | null = null
  private time = 0
  private disposables: Array<{ dispose(): void }> = []
  private backgrounds: BackgroundHandle[] = []

  private bhGroup = new THREE.Group()
  private starMesh: THREE.Mesh | null = null
  private starMaterial: THREE.ShaderMaterial | null = null
  private diskMaterial: THREE.ShaderMaterial | null = null
  private jetMaterial: THREE.ShaderMaterial | null = null
  private shellPoints: THREE.Points | null = null
  private shellMaterial: THREE.ShaderMaterial | null = null
  private ringMaterial: THREE.SpriteMaterial | null = null
  private arcMaterial: THREE.MeshBasicMaterial | null = null
  private flashMaterial: THREE.SpriteMaterial | null = null

  init(container: HTMLElement, camera: THREE.PerspectiveCamera): void {
    this.camera = camera
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONSTANTS.DPR_CAP))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)
    this.renderer = renderer

    this.scene.background = new THREE.Color(0x000000)
    this.backgrounds.push(addBackgroundStars(this.scene), addBackgroundGalaxies(this.scene))

    // Same tilt as the raymarched tier / legacy scene.
    this.bhGroup.rotation.x = 0.749
    this.bhGroup.rotation.z = -Math.PI / 8
    this.scene.add(this.bhGroup)

    // Black hole shadow
    const bhGeo = new THREE.SphereGeometry(1, 32, 32)
    const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
    this.bhGroup.add(new THREE.Mesh(bhGeo, bhMat))
    this.disposables.push(bhGeo, bhMat)

    // Photon ring billboard (apparent radius ~2.6 r_s)
    const ringTex = createRingTexture()
    this.ringMaterial = new THREE.SpriteMaterial({
      map: ringTex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const ring = new THREE.Sprite(this.ringMaterial)
    ring.scale.set(5.2, 5.2, 1)
    this.scene.add(ring) // billboard: not tilted with the group
    this.disposables.push(ringTex, this.ringMaterial)

    // Lensing over-arc hint (upper half-torus in the group's vertical plane)
    const arcGeo = new THREE.TorusGeometry(4.2, 0.5, 12, 48, Math.PI)
    this.arcMaterial = new THREE.MeshBasicMaterial({
      color: 0xffc080,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    this.bhGroup.add(new THREE.Mesh(arcGeo, this.arcMaterial))
    this.disposables.push(arcGeo, this.arcMaterial)

    // Accretion disk
    const diskGeo = new THREE.RingGeometry(
      CONSTANTS.DISK_INNER_RS,
      CONSTANTS.DISK_OUTER_RS,
      128,
      8,
    )
    this.diskMaterial = additive({
      vertexShader: DISK_VERT,
      fragmentShader: DISK_FRAG,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uIgnition: { value: 0 },
        uInner: { value: CONSTANTS.DISK_INNER_RS },
        uOuter: { value: CONSTANTS.DISK_OUTER_RS },
      },
    })
    const disk = new THREE.Mesh(diskGeo, this.diskMaterial)
    disk.rotation.x = -Math.PI / 2 // lie flat in the group's XZ plane
    this.bhGroup.add(disk)
    this.disposables.push(diskGeo, this.diskMaterial)

    // Jets (two open cones along the group's Y axis)
    const jetGeo = new THREE.ConeGeometry(
      Math.tan((CONSTANTS.JET_HALF_ANGLE_DEG * Math.PI) / 180) * CONSTANTS.JET_LENGTH_RS,
      CONSTANTS.JET_LENGTH_RS,
      24,
      1,
      true,
    )
    this.jetMaterial = additive({
      vertexShader: JET_VERT,
      fragmentShader: JET_FRAG,
      side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 }, uIgnition: { value: 0 } },
    })
    const jetUp = new THREE.Mesh(jetGeo, this.jetMaterial)
    jetUp.position.y = CONSTANTS.JET_LENGTH_RS / 2
    jetUp.rotation.x = Math.PI // tip at origin, opening upward
    const jetDown = new THREE.Mesh(jetGeo, this.jetMaterial)
    jetDown.position.y = -CONSTANTS.JET_LENGTH_RS / 2
    this.bhGroup.add(jetUp, jetDown)
    this.disposables.push(jetGeo, this.jetMaterial)

    // Progenitor star
    const starGeo = new THREE.SphereGeometry(1, 48, 48)
    this.starMaterial = new THREE.ShaderMaterial({
      vertexShader: STAR_VERT,
      fragmentShader: STAR_FRAG,
      uniforms: { uTime: { value: 0 }, uCollapse: { value: 0 } },
    })
    this.starMesh = new THREE.Mesh(starGeo, this.starMaterial)
    this.scene.add(this.starMesh)
    this.disposables.push(starGeo, this.starMaterial)

    // Supernova shell points
    const dirs = new Float32Array(SHELL_POINTS * 3)
    const seeds = new Float32Array(SHELL_POINTS)
    for (let i = 0; i < SHELL_POINTS; i++) {
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      dirs[3 * i] = Math.sin(phi) * Math.cos(theta)
      dirs[3 * i + 1] = Math.sin(phi) * Math.sin(theta)
      dirs[3 * i + 2] = Math.cos(phi)
      seeds[i] = Math.random()
    }
    const shellGeo = new THREE.BufferGeometry()
    // Position attribute is required by Three even though the vertex shader ignores it.
    shellGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SHELL_POINTS * 3), 3))
    shellGeo.setAttribute('dir', new THREE.BufferAttribute(dirs, 3))
    shellGeo.setAttribute('seed', new THREE.BufferAttribute(seeds, 1))
    shellGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100) // skip culling math
    this.shellMaterial = additive({
      vertexShader: SHELL_VERT,
      fragmentShader: SHELL_FRAG,
      uniforms: {
        uShellRadius: { value: 0 },
        uCool: { value: 0 },
        uFade: { value: 1 },
      },
    })
    this.shellPoints = new THREE.Points(shellGeo, this.shellMaterial)
    this.shellPoints.visible = false
    this.scene.add(this.shellPoints)
    this.disposables.push(shellGeo, this.shellMaterial)

    // FLASH sprite
    const flashTex = createFlashTexture()
    this.flashMaterial = new THREE.SpriteMaterial({
      map: flashTex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const flash = new THREE.Sprite(this.flashMaterial)
    flash.scale.set(120, 120, 1)
    this.scene.add(flash)
    this.disposables.push(flashTex, this.flashMaterial)

    // Composer with quarter-res bloom
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(this.scene, camera))
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(Math.max(container.clientWidth / 4, 64), Math.max(container.clientHeight / 4, 64)),
      CONSTANTS.BLOOM_STRENGTH,
      CONSTANTS.BLOOM_RADIUS,
      CONSTANTS.BLOOM_THRESHOLD,
    )
    composer.addPass(this.bloomPass)
    composer.addPass(new OutputPass())
    this.composer = composer

    this.resize(container.clientWidth, container.clientHeight)
  }

  setPhase(state: PhaseState): void {
    const d = derivePhaseUniforms(state)
    if (this.starMesh && this.starMaterial) {
      this.starMesh.visible = d.starRadius > 0.01
      this.starMesh.scale.setScalar(Math.max(d.starRadius, 0.01))
      this.starMaterial.uniforms.uCollapse!.value =
        state.phase === Phase.COLLAPSE ? state.progress : 0
    }
    if (this.shellPoints && this.shellMaterial) {
      this.shellPoints.visible = d.shellRadius > 0.01
      this.shellMaterial.uniforms.uShellRadius!.value = d.shellRadius
      this.shellMaterial.uniforms.uCool!.value =
        state.phase === Phase.SHELL ? state.progress : state.phase >= Phase.BIRTH ? 1 : 0
      this.shellMaterial.uniforms.uFade!.value =
        state.phase === Phase.BIRTH ? 1 - state.progress : 1
    }
    if (this.diskMaterial) this.diskMaterial.uniforms.uIgnition!.value = d.ignition
    if (this.jetMaterial) this.jetMaterial.uniforms.uIgnition!.value = d.ignition
    if (this.ringMaterial) this.ringMaterial.opacity = d.ignition
    if (this.arcMaterial) this.arcMaterial.opacity = 0.35 * d.ignition
    if (this.flashMaterial) this.flashMaterial.opacity = Math.min(d.flash / 4, 1)
  }

  update(dt: number): void {
    if (!this.composer) return
    this.time += dt
    if (this.diskMaterial) this.diskMaterial.uniforms.uTime!.value = this.time
    if (this.jetMaterial) this.jetMaterial.uniforms.uTime!.value = this.time
    if (this.starMaterial) this.starMaterial.uniforms.uTime!.value = this.time
    this.composer.render()
  }

  resize(width: number, height: number): void {
    if (!this.renderer || !this.composer || !this.camera) return
    this.renderer.setSize(width, height, false)
    this.composer.setSize(width, height)
  }

  dispose(): void {
    this.backgrounds.forEach((b) => b.dispose())
    this.disposables.forEach((d) => d.dispose())
    this.composer?.dispose()
    this.bloomPass?.dispose()
    if (this.renderer) {
      this.renderer.domElement.remove()
      this.renderer.dispose()
    }
    this.renderer = null
    this.composer = null
    this.camera = null
  }
}
```

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: clean.

- [ ] **Step 4: Visual smoke test**

In the Task 8 scratch harness, swap `RaymarchedRenderer` for `MeshRenderer` (same interface — only the import and `new` change). Run `pnpm dev`, open `/my-story`.
Expected: black shadow sphere with a bright billboard ring, glowing turbulent disk (one side brighter), faint blue cones, point-free background stars/galaxies. Then swap the harness's `setPhase` to `{ phase: Phase.SHELL, progress: 0.5 }` and reload — an expanding-looking filamentary point shell in orange tones. Swap back to QUASAR when done.

- [ ] **Step 5: Commit (ask owner first)**

```bash
git add src/components/QuasarBackground/engine/shaders/meshShaders.ts src/components/QuasarBackground/engine/MeshRenderer.ts src/components/QuasarBackground/index.tsx
git commit -m "feat: add mesh fallback renderer (mobile tier)"
```

---

### Task 10: React shell rewrite (`index.tsx`)

Replaces the Task 8/9 scratch harness with the real shell: tier flow, phase machine wiring, overlays, debug HUD, failure ladder.

**Files:**
- Rewrite: `src/components/QuasarBackground/index.tsx`

- [ ] **Step 1: Rewrite `index.tsx` with the full content below**

```tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Image from 'next/image'
import { PhaseMachine } from './engine/PhaseMachine'
import { RaymarchedRenderer } from './engine/RaymarchedRenderer'
import { MeshRenderer } from './engine/MeshRenderer'
import { readTierEnvironment, selectTier, tierFromBenchmark, type Tier } from './engine/tierSelect'
import { CONSTANTS, Phase, type SceneRenderer } from './engine/types'

type ShellState = Tier | 'failed'

/** Overlay copy per phase (spec §Narrative). Edit the story here. */
const OVERLAY_TEXT: Partial<Record<Phase, string>> = {
  [Phase.STAR]: 'Every story begins with a massive star.',
  [Phase.SHELL]: 'It dies in a supernova — outshining its entire galaxy.',
  [Phase.BIRTH]: 'What remains collapses into a black hole. Matter spirals in, and the disk ignites.',
  [Phase.QUASAR]: 'But this is just the surface of what really is happening!!',
}

const overlayTextStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: 'white',
  fontSize: '32px',
  fontWeight: 900,
  letterSpacing: '1px',
  textAlign: 'center',
  maxWidth: '80%',
  textShadow:
    '-2px -2px 4px rgba(0,0,0,1), 2px -2px 4px rgba(0,0,0,1), -2px 2px 4px rgba(0,0,0,1), 2px 2px 4px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.8)',
  WebkitTextStroke: '2px rgba(0,0,0,0.9)',
  paintOrder: 'stroke fill',
  zIndex: 3,
  pointerEvents: 'none',
  fontFamily: 'sans-serif',
}

const hintPillStyle: React.CSSProperties = {
  padding: '10px 16px',
  background: 'rgba(0,0,0,0.7)',
  color: 'rgba(255,255,255,0.9)',
  borderRadius: '25px',
  fontSize: '14px',
  fontWeight: 500,
  letterSpacing: '0.5px',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  fontFamily: 'sans-serif',
  textAlign: 'center',
  whiteSpace: 'nowrap',
}

export default function QuasarBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const debugRef = useRef<HTMLDivElement>(null)
  const [shellState, setShellState] = useState<ShellState>('raymarched')
  const [phase, setPhase] = useState<Phase>(Phase.STAR)
  const [isTouch, setIsTouch] = useState(false)
  const debugEnabled =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === 'fps'

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const env = readTierEnvironment()
    const machine = new PhaseMachine()

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      1000,
    )
    camera.position.set(0, 10, CONSTANTS.CAMERA_START_DISTANCE)
    camera.position.setLength(CONSTANTS.CAMERA_START_DISTANCE)

    const controls = new OrbitControls(camera, container)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enablePan = false
    controls.zoomSpeed = 1.2
    controls.rotateSpeed = 0.8
    controls.minDistance = CONSTANTS.CAMERA_MIN_DISTANCE
    controls.maxDistance = CONSTANTS.CAMERA_MAX_DISTANCE
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }

    let renderer: SceneRenderer | null = null
    let raf = 0
    let disposed = false
    let userInteracted = false
    let activeTier: Tier = 'raymarched'

    const onInteractionStart = () => {
      userInteracted = true
    }
    controls.addEventListener('start', onInteractionStart)

    const applyMeshConstraints = () => {
      const span = (CONSTANTS.MESH_TIER_MAX_POLAR_DEG * Math.PI) / 180
      controls.minPolarAngle = Math.PI / 2 - span
      controls.maxPolarAngle = Math.PI / 2 + span
    }

    const watchContextLoss = () => {
      const canvas = container.querySelector('canvas')
      canvas?.addEventListener('webglcontextlost', (e) => {
        e.preventDefault()
        if (activeTier === 'raymarched') demoteToMesh()
        else fail()
      })
    }

    const fail = () => {
      renderer?.dispose()
      renderer = null
      setShellState('failed')
    }

    const startMesh = () => {
      activeTier = 'mesh'
      applyMeshConstraints()
      try {
        const mesh = new MeshRenderer()
        mesh.init(container, camera)
        renderer = mesh
        watchContextLoss()
        setShellState('mesh')
      } catch (err) {
        console.error('Mesh tier failed:', err)
        fail()
      }
    }

    const demoteToMesh = () => {
      renderer?.dispose()
      renderer = null
      startMesh()
    }

    const startRaymarched = () => {
      activeTier = 'raymarched'
      try {
        const ray = new RaymarchedRenderer()
        ray.init(container, camera)
        ray.onDemote = demoteToMesh
        renderer = ray
        watchContextLoss()
        setShellState('raymarched')
        return ray
      } catch (err) {
        console.error('Raymarched tier failed:', err)
        startMesh()
        return null
      }
    }

    // Tier flow (spec §Tier selection)
    const decision = selectTier(env)
    if (decision === 'mesh') {
      startMesh()
    } else {
      const ray = startRaymarched()
      if (ray && decision === 'benchmark') {
        const avgMs = ray.runBenchmark()
        if (tierFromBenchmark(avgMs) === 'mesh') demoteToMesh()
      }
    }

    // Debug HUD bookkeeping
    let fpsFrames = 0
    let fpsTime = 0

    let last = performance.now()
    const loop = () => {
      if (disposed) return
      raf = requestAnimationFrame(loop)
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now

      controls.update()
      const state = machine.update({
        dt,
        cameraDistance: camera.position.length(),
        userInteracted,
        reducedMotion: env.reducedMotion,
      })
      userInteracted = false

      // camera shake during FLASH
      if (state.phase === Phase.FLASH && !env.reducedMotion) {
        controls.target.set((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, 0)
      } else if (controls.target.lengthSq() > 0) {
        controls.target.set(0, 0, 0)
      }

      setPhase((prev) => (prev === state.phase ? prev : state.phase))
      renderer?.setPhase(state)
      renderer?.update(dt)

      if (debugRef.current) {
        fpsFrames++
        fpsTime += dt
        if (fpsTime >= 0.5) {
          debugRef.current.textContent = `${Math.round(fpsFrames / fpsTime)} fps | ${activeTier} | ${Phase[state.phase]} ${state.progress.toFixed(2)}`
          fpsFrames = 0
          fpsTime = 0
        }
      }
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
      controls.removeEventListener('start', onInteractionStart)
      controls.dispose()
      renderer?.dispose()
      renderer = null
    }
  }, [])

  const overlayText = OVERLAY_TEXT[phase]

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {shellState === 'failed' ? (
        <Image
          src="/media/quasar-poster.jpg"
          alt="An accreting black hole with a glowing, lensed accretion disk"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      ) : (
        <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
      )}

      {overlayText && <div style={overlayTextStyle}>{overlayText}</div>}

      {shellState !== 'failed' && phase === Phase.STAR && (
        <div
          style={{
            position: 'absolute',
            bottom: isTouch ? '40px' : '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div style={hintPillStyle}>
            {isTouch ? 'Pinch in to witness its end' : 'Zoom in to witness its end'}
          </div>
        </div>
      )}

      {shellState !== 'failed' && phase === Phase.QUASAR && (
        <div
          style={{
            position: 'absolute',
            bottom: isTouch ? '40px' : '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div style={hintPillStyle}>
            Scroll down to glimpse into my{' '}
            <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>boring</span> simple
            journey
          </div>
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '12px solid rgba(255,255,255,0.8)',
              animation: 'bounce 2s infinite',
            }}
          />
        </div>
      )}

      {debugEnabled && (
        <div
          ref={debugRef}
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 20,
            color: '#0f0',
            fontFamily: 'monospace',
            fontSize: 12,
            background: 'rgba(0,0,0,0.6)',
            padding: '4px 8px',
            borderRadius: 4,
          }}
        />
      )}
    </div>
  )
}
```

Note on the `bounce` keyframes: the legacy component injected them via JS. Instead, add once to `src/app/(frontend)/globals.css`:

```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

- [ ] **Step 2: Typecheck + lint + tests**

Run: `npx tsc --noEmit && pnpm lint && pnpm test`
Expected: all clean/passing.

- [ ] **Step 3: Full visual verification (both tiers)**

Run: `pnpm dev`, then check `http://localhost:3000/my-story`:

1. `?quality=high&debug=fps` — STAR phase: pulsating granulated red supergiant over lensed starfield; HUD shows tier `raymarched`.
2. Zoom in (scroll) below ~15 r_s → COLLAPSE → FLASH (white-out + shake) → SHELL (filamentary expanding shell, cooling colors) → BIRTH (ring + disk ignite, lensing ramps) → QUASAR (free orbit; over/under lensed disk arcs visible).
3. Reload, don't touch anything for 12 s → sequence auto-plays.
4. Reload, orbit/drag at second 10 → auto-play timer restarts (no collapse at 12 s).
5. `?quality=low&debug=fps` — same sequence on the mesh tier; polar orbit is clamped near the disk plane.
6. DevTools → Rendering → emulate `prefers-reduced-motion` → reload (no quality param): mesh tier, no auto-play, zoom-in still triggers, no camera shake.
7. Resize the window during QUASAR — no stretching/blur artifacts.
8. Navigate to another page and back — no console errors or leaked WebGL context warnings.

- [ ] **Step 4: Commit (ask owner first)**

```bash
git add src/components/QuasarBackground/index.tsx src/app/\(frontend\)/globals.css
git commit -m "feat: rewrite my-story scene shell with phase narrative and tier flow"
```

---

### Task 11: Cleanup, poster fallback, final verification

**Files:**
- Delete: `src/components/SupernovaEffect/`
- Create: `public/media/quasar-poster.jpg` (manual capture)

- [ ] **Step 1: Confirm nothing else imports SupernovaEffect**

Run: `grep -rn "SupernovaEffect" src/ --include="*.tsx" --include="*.ts"`
Expected: no matches outside `src/components/SupernovaEffect/` itself.

- [ ] **Step 2: Delete the component**

```bash
git rm -r src/components/SupernovaEffect
```

- [ ] **Step 3: Capture the poster fallback**

With `pnpm dev` running, open `/my-story?quality=high`, let the sequence reach QUASAR, frame a good angle, and take a browser screenshot of the canvas. Export as JPEG ~1920px wide, quality ~80, save to `public/media/quasar-poster.jpg`. Verify the failure path renders it by temporarily hard-coding `setShellState('failed')` in `index.tsx` (then revert).

- [ ] **Step 4: Full check suite**

Run: `pnpm test && npx tsc --noEmit && pnpm lint && pnpm build`
Expected: all pass; `pnpm build` completes including sitemap postbuild.

- [ ] **Step 5: Production-mode smoke test**

Run: `pnpm dev:prod`, open `/my-story` once with `?quality=high`, once with `?quality=low`.
Expected: both tiers work in the production build (Turbopack dev and prod builds can differ on shader string handling).

- [ ] **Step 6: Commit (ask owner first)**

```bash
git add -A
git commit -m "feat: replace legacy supernova with phase narrative, add poster fallback"
```

- [ ] **Step 7: Device matrix (after deploy or via LAN)**

Open `http://192.168.0.12:3000/my-story` (already in `allowedDevOrigins`) from an iPhone and an Android phone: expect mesh tier, 60 fps-ish, pinch/drag works, full narrative plays. Desktop Safari + Firefox: expect raymarched tier, no shader compile errors in console.

---

## Self-Review Notes (run after drafting — issues found and fixed inline)

- **Spec coverage check:** narrative phases ✔ (Task 3/4/10), raymarched geodesics/disk/jets/background cubemap ✔ (Tasks 6–8), mesh tier + polar clamp ✔ (Tasks 9–10), tier ladder + benchmark + query override ✔ (Tasks 5, 8, 10), failure ladder incl. context loss + poster ✔ (Tasks 10–11), governor + watchdog ✔ (Task 8), bloom/ACES/pixel ratio ✔ (Tasks 8–9), vitest ✔ (Task 1), `SupernovaEffect` deletion ✔ (Task 11), overlay copy in one map ✔ (Task 10), `?debug=fps` ✔ (Task 10), reduced-motion behavior ✔ (Tasks 3, 5, 10).
- **Known intentional simplifications** (all within spec's non-goals): static Doppler side on mesh tier; photon-ring rim as additive glow keyed on closest approach; shell is emissive-only (no absorption).
- **Type consistency:** `SceneRenderer` interface matches both renderers; `derivePhaseUniforms` consumed identically by both tiers; `Tier`/`TierDecision` names consistent across Tasks 5, 10.






