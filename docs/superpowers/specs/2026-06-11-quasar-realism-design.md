# My Story Hero: Physically-Motivated Black Hole & Supernova

- **Date:** 2026-06-11
- **Status:** Approved design, pending implementation plan
- **Owner:** Kartik Mandar
- **Replaces:** sprite-based `QuasarBackground` + standalone `SupernovaEffect`

## Context

The `/my-story` page opens with an interactive Three.js scene
(`src/components/QuasarBackground/index.tsx`, ~820 lines). Today it renders a
spiral-galaxy-like disc built from ~4,100 individual sprites plus a 1,440-point
smoke system, a bright white sphere as the core, and a solid white cylinder as
the "axis". The whole disc rotates rigidly at 1 RPM. Zooming out past camera
distance 1750 swaps in a separate `SupernovaEffect` component (20,000 points
expanding radially, fading over 12 s). There is no post-processing, no tone
mapping, and no `setPixelRatio`.

Problems: the object reads as a galaxy rather than a quasar; the core should be
a dark shadow, not a bright ball; the axis rod is not a jet; rotation should be
differential; the supernova is a filled ball rather than a shell and is
physically unrelated to a quasar; the scene-swap is a jump cut; thousands of
sprite draw calls are slow.

## Decisions (made during brainstorming)

1. **Realism type:** physically-motivated look — black-hole shadow, photon
   ring, gravitationally lensed accretion disk, bipolar jets (Interstellar/EHT
   aesthetic).
2. **Scope:** both the quasar scene and the supernova get the full treatment.
3. **Performance:** adaptive — true raymarched lensing on capable desktops,
   cheaper mesh-shader tier on mobile/weak GPUs.
4. **Architecture order (Option A):** raymarched renderer is built first as the
   primary implementation; the mesh tier is the fallback.
5. **Narrative:** physically coherent story replacing the zoom-out trigger:
   massive star → collapse → supernova → black hole birth → accretion disk
   ignites → free exploration. (Connects to the owner's BHXB research.)

## Goals

- A scene a professional astronomer would not wince at, and a layperson finds
  spectacular.
- 60 fps at 1× DPR on typical discrete/Apple-silicon GPUs (raymarched tier);
  60 fps on a mid-range phone (mesh tier). Graceful degradation, never jank.
- No public API changes: `my-story/page.tsx` keeps using
  `QuasarBackgroundWrapper` with the same props.
- No new runtime dependencies (`EffectComposer`, `UnrealBloomPass`,
  `OrbitControls` all come from `three/examples`, already shipped).

## Non-goals

- Kerr metric, disk self-shadowing, radiative transfer, or spectral accuracy.
  Schwarzschild + standard thin-disk scalings are accurate enough for the look.
- Changing the CosmicJourney scroll story below the hero.
- Photoreal volumetric nebula simulation for the remnant.

## Architecture

```
src/components/QuasarBackground/
  index.tsx                  React shell: overlay text, hints, tier state,
                             mounts/disposes the active engine
  ClientWrapper.tsx          unchanged (dynamic import, ssr: false)
  engine/
    types.ts                 SceneRenderer interface, Phase enum, shared consts
    PhaseMachine.ts          narrative state machine (pure TS, unit-tested)
    tierSelect.ts            capability detection + micro-benchmark (unit-tested)
    RaymarchedRenderer.ts    desktop tier
    MeshRenderer.ts          fallback tier
    backgroundCubemap.ts     renders procedural starfield+galaxies to a cubemap
    shaders/                 GLSL template strings (blackhole.frag.ts, disk
                             noise, star surface, supernova shell, jet noise)
```

Both renderers implement:

```ts
interface SceneRenderer {
  init(container: HTMLElement, camera: PerspectiveCamera): void
  setPhase(phase: Phase, progress: number): void
  update(dt: number): void
  resize(w: number, h: number): void
  dispose(): void
}
```

`index.tsx` owns the camera + OrbitControls and the PhaseMachine; renderers are
swappable consumers. `SupernovaEffect/` is deleted (only QuasarBackground
imports it); its role is absorbed by the SHELL/FLASH phases so the supernova
and black hole live in one continuous scene.

**Scene units:** 1 unit = 1 Schwarzschild radius (r_s). Camera starts at
~40 r_s. OrbitControls limits: min 8 r_s, max 300 r_s (raymarched tier). The
progenitor star renders at ~10 r_s — deliberately stylized; a real supergiant
is ~10⁶ r_s and unstageable in one scene (covered by Non-goals).

## Desktop tier: raymarched renderer

A fullscreen quad; the fragment shader receives camera position and inverse
view-projection as uniforms and constructs a ray per pixel.

- **Geodesics:** numerically integrate Schwarzschild null geodesics per pixel
  in the deflection plane: `d²u/dφ² = (3/2) r_s u² − u`, `u = 1/r`. Fixed-step
  RK2, max ~128 steps, adaptive step shrink near the photon sphere (1.5 r_s).
  Early exit when the ray escapes (r > 60 r_s, sample background) or crosses
  the horizon (return black + photon-ring contribution).
- **Accretion disk:** equatorial annulus, ISCO (3 r_s) to 14 r_s. At each sign
  change of the ray's height relative to the equatorial plane, interpolate the
  crossing radius and accumulate emission; allow up to 3 crossings so
  higher-order images (over/under arcs) appear naturally. Emission model:
  - turbulence: 4-octave fbm advected with Keplerian differential rotation
    (Ω ∝ r^−3/2, animated by a time uniform)
  - temperature: T ∝ r^−3/4 (Shakura–Sunyaev) → blackbody color ramp
    (blue-white at ISCO → orange → deep red at the outer edge)
  - Doppler beaming: brightness × D^3.5 using tangential orbital velocity,
    approaching side brighter; plus gravitational redshift dimming near ISCO
- **Jets:** two narrow cones along the spin axis sampled volumetrically during
  the same march (3D position is reconstructed per step): scrolling noise for
  knots, density ∝ exp(−distance), additive emission. Cone half-angle ~4°,
  length ~50 r_s.
- **Background:** at init, `backgroundCubemap.ts` renders the existing
  procedural starfield + galaxy sprites into a `WebGLCubeRenderTarget` once;
  escaped rays sample it by direction, so the background lenses correctly
  (Einstein ring while orbiting).
- **Post:** render to a HalfFloat HDR target → UnrealBloomPass → ACES filmic
  tone mapping. `renderer.setPixelRatio(min(devicePixelRatio, 2))`.
- **Performance governor:** internal resolution-scale uniform stepped between
  1.0 and 0.5 × DPR from a rolling frame-time average. If FPS stays < 30 for
  5 s at minimum scale, hot-swap to the mesh tier.

## Fallback tier: mesh renderer

Same look, cheap primitives, one draw call per element:

- **Disk:** annulus mesh with a fragment shader sharing the raymarcher's
  noise/blackbody/Doppler logic in 2D UV space (per-radius rotation of the
  sample angle gives differential rotation).
- **Black hole:** black sphere + thin photon-ring billboard + one curved
  "over-arc" mesh behind the shadow to suggest lensing. OrbitControls polar
  angle constrained to ±35° from the disk plane in this tier so the fake holds
  up (no constraint in the raymarched tier).
- **Jets:** two tapered additive cones with scrolling noise texture.
- **Background:** existing starfield + procedural galaxy sprites reused as-is.
- **Post:** quarter-resolution bloom + ACES, `setPixelRatio` capped at 2.

## Tier selection (`tierSelect.ts`)

Order of evaluation at init:

1. `?quality=high|low` query param → forced tier (testing override).
2. Hard requirements for raymarching: WebGL2 + float color-buffer support;
   missing → mesh tier.
3. `prefers-reduced-motion` → mesh tier; also disables camera shake and idle
   auto-play (phase advances only on explicit interaction).
4. Heuristics: coarse pointer + small screen, or `navigator.deviceMemory ≤ 4`
   → mesh tier.
5. Still ambiguous → hidden 10-frame micro-benchmark of the raymarcher at low
   resolution during the STAR phase (cheap in both tiers, user sees no stall);
   average frame time < 12 ms → raymarched tier, else mesh tier.

Runtime demotions: shader compile failure or the governor's 30 fps watchdog
→ mesh tier.

All thresholds (12 ms, 30 fps, 5 s, distances below) are named constants in
`engine/types.ts`, expected to be tuned during implementation.

## Narrative phase machine

| # | Phase    | Duration | Visuals | Trigger to next |
|---|----------|----------|---------|-----------------|
| 1 | STAR     | open     | Red supergiant: emissive sphere, animated granulation/convection noise, limb darkening, slow pulsation | Camera zooms in below 15 r_s, or 12 s idle auto-play |
| 2 | COLLAPSE | 1.5 s    | Star contracts, core brightens, surface infall accelerates | timer |
| 3 | FLASH    | 0.4 s    | Screen-filling white-out via bloom, point-light spike, subtle camera shake | timer |
| 4 | SHELL    | 8 s      | Expanding shock shell (velocities clustered at the front, not a filled ball); 3D fbm carves filamentary, asymmetric ejecta; color cools white → yellow → orange → deep red | timer |
| 5 | BIRTH    | 4 s      | Remnant clears center-out; photon ring fades in; residual material flattens and spirals into a disk igniting from the inner edge; `lensingStrength` uniform ramps 0 → 1 | timer |
| 6 | QUASAR   | steady   | Free orbit/zoom of the accreting black hole | — (scroll-down hint to CosmicJourney) |

- `PhaseMachine.ts` is pure TS: it is fed
  `{ dt, cameraDistance, userInteracted, reducedMotion }` each frame and owns
  timings, triggers, and per-phase progress (0–1); renderers consume
  `{ phase, progress }`; React shell maps phases to overlay text.
- Supernova per tier: raymarched tier integrates the emissive shell
  volumetrically in the same shader (two sphere-shell intersections + fbm);
  mesh tier reuses a particle system with shell-clustered velocities and the
  same color curve.
- The `lensingStrength` ramp doubles as cover for the metric being absent
  pre-collapse.
- Overlay copy (initial draft, owner edits in one map in `index.tsx`):
  1. STAR: "Every story begins with a massive star." + hint "Zoom in to
     witness its end."
  2. SHELL: "It dies in a supernova — outshining its entire galaxy."
  3. BIRTH: "What remains collapses into a black hole. Matter spirals in, and
     the disk ignites."
  4. QUASAR: "But this is just the surface of what really is happening!!" +
     existing scroll-down hint.

## Error handling

Failure ladder, each step independent:

1. Raymarcher shader compile failure or missing WebGL2 → mesh tier.
2. Mesh tier failure or `webglcontextlost` without restore → static poster
   image (a render of the QUASAR phase captured during development and
   committed under `public/media/`) with overlay text intact; the layout never
   shows an empty black region.
3. `dispose()` is a first-class contract per renderer: all geometries,
   materials, render targets, and composer passes released; verified on
   unmount and on tier hot-swap.

## Testing

- **Unit (vitest, new devDependency — repo currently has no test runner):**
  - `PhaseMachine`: transition ordering, zoom + idle triggers, reduced-motion
    behavior (no auto-play), progress clamping, timer math with irregular dt.
  - `tierSelect`: each heuristic branch, query-param override, benchmark
    threshold logic (benchmark itself mocked).
- **Visual verification:** `?debug=fps` overlay (FPS, tier, phase, resolution
  scale). Verify both tiers locally by forcing `?quality=`, checking every
  phase transition, orbit/zoom, resize, supernova end-to-end, and unmount
  cleanup (navigate away, check for WebGL warnings).
- **Device matrix:** desktop Chrome/Safari/Firefox (raymarched); iPhone +
  mid-range Android (mesh) via local network (`192.168.0.12:3000` is already
  in `allowedDevOrigins`).
- **Performance:** budgets above, enforced at runtime by the governor; manual
  spot-check with the debug overlay.

## Rollout

- Single self-contained component swap: no route, data, or config changes.
- `SupernovaEffect/` deleted in the same change.
- Old implementation preserved in git history only; the tier system (not a
  feature flag) is the safety net.
- Follow-ups out of scope for this change: reduced-motion poster variant
  styling, copy polish, possible OG image refresh of the new scene.
