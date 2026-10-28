# Wow Redesign: Phase 2 (The Signature Opening)

Phase 2 of `2026-10-28-site-wow-redesign-plan.md`. Built 2026-10-28; the owner reviewed the opening and hand-off and signed them off the same day.

## What changed
- **One WebGL context on `/my-story/preview`.**
  - The supernova → black hole prologue now runs inside the journey's R3F canvas (`ProloguePass.tsx`).
  - The second `WebGLRenderer`, `preserveDrawingBuffer` and the canvas-resizing governor are gone from the default path, and so is the flicker they caused.
  - `?legacyPrologue` still mounts the old two-context `HeroPrologue` for side-by-side comparison.
- **Shader builder:** `buildBlackholeFrag({ variant })` in `QuasarBackground/engine/shaders/blackhole.frag.ts`.
  - `'standalone'` is the live hero. It is verified byte-equivalent to the previous shader apart from two no-op capture-flag writes, and `BLACKHOLE_FRAG` is unchanged.
  - `'pass'` adds opacity and exposure plus three's tone-mapping and colour-space chunks.
  - `'impostor'` raymarches from the real camera inside a bounding sphere: escaped rays add nothing, and captured rays write alpha so the shadow occludes the flight's sky. `IMPOSTOR_VERT` is new.
- **Resolution governor without canvas resizes:**
  - The raymarch renders into its own HalfFloat render target, which is then drawn fullscreen behind the flight and graded by the shared post stack (bloom 0.85, AgX).
  - Scale is discrete per tier: high 1.0, low 0.75, mobile 0.6, and 0.5 during the dive under the swell (`prologueScale`).
- **Photon-ring hand-off** (`prologueDive.ts`, pure and tested): across the crossfade band (raw 0.18–0.26) the virtual camera dives at the top of the photon ring.
  - The FOV opens from 60° to 82°.
  - Exposure swells to at most 2.4×, as a smooth ramp with no flash; a test asserts the cap and the step size.
  - The pass then dissolves.
  - While the pass covers the screen, `journeyFrame.covered` hides the flight and its starfield (`CoverAware`), so nothing is drawn twice.
- **Origin black hole:** the flat torus stand-in is replaced by the same raymarched shader as a world-space impostor (`scenes/OriginBlackHole.tsx`).
  - Scale: 0.15 world per r_s, bound 18 r_s, 72/56/40 steps by tier.
  - It sits at `ORIGIN_BLACK_HOLE` (world origin), ahead of the camera as it emerges from the dive. The camera then flies over its disk toward beat 1.
  - The old warm point light is kept and fades in with it.
- **Loader as prologue** (`loader.ts`, `LoaderView.tsx`, `JourneyLoader.tsx`):
  - **Server first paint:** `LoaderView` is the `dynamic()` loading fallback, so the HTML already contains the title, subtitle and point of light. The page is never black.
  - **Real progress:**
    - 0.35 once the canvas is live and the sky is baked.
    - 0.85 once `gl.compileAsync(scene, camera)` has compiled every material (all 31 beats, the pass, the impostor; `KHR_parallel_shader_compile` where available).
    - 1.0 after a 4-frame warm-up, during which the flight's opening draws behind the loader so geometry, textures and glyphs upload before the hand-off.
  - **Ignition:** the point of light ignites into the star (scale and fade, 1.1 s).
  - **Pacing and scroll:** scroll is locked until then. First visits hold at least 1.2 s; repeat visits in the same session skip the hold (`sessionStorage` key `journey:seen`). Capture mode skips the loader.
- **The `?diag` flicker instrumentation is removed** (its question is answered: one context).

## Measurements (production build, M1 Max, 120 Hz, 1024×768 at DPR 2)
| Segment | Phase 0 baseline | Phase 2 |
|---|---|---|
| Prologue sweep: p95 / max | 9.4 / **994 ms** | 12.5 / 44 ms (no frames > 50 ms) |
| Hand-off sweep: p95 / max | (inside "beats 1–8") 9.3 / **1008 ms** | 9.4 / 27.5 ms (no frames > 50 ms) |
| Hand-off held still, c = 0.2–0.8 | n/a | p50 8.3 ms, p95 ≤ 9.3 ms everywhere |
| Flight | 9.3 p95 | unchanged |
| Loader to ignition (warm cache) | n/a | ≈2.7 s, including the 1.2 s first-visit hold |
| WebGL contexts | 2 | **1** (plus stats panels under `?perf`) |

Earlier iterations of this phase were measured and rejected:
- The full-resolution pass with a 0.9 r_s stand-off had p95 17 ms with 70 ms spikes.
- A 2.4 r_s stand-off was worse.
- Before the warm-up was added, the first reveal hitched for 181 ms.

## Review notes
- **Visual review of the dive and the origin impostor:** done by the owner on their GPU (the in-app pane was hidden during capture, so no screenshots are stored). Review links:
  - `?capture=1&p=0.19&t=3&ui=0` (prologue: the quasar)
  - `p=0.205` and `p=0.215` (mid-dive and swell)
  - `p=0.24` (emerging; origin black hole ahead)
  - `p=0.27` (flying over its disk)
  - and the live scroll from the top.
- Tone and grade: the prologue now goes through AgX and the shared bloom instead of its own ACES + UnrealBloom, so it will look softer and less contrasty than the live hero. Compare with `?legacyPrologue`.
- Phones and the Ubuntu PC have not been measured.
