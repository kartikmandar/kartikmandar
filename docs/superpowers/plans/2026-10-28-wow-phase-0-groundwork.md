# Wow Redesign: Phase 0 (Groundwork)

Phase 0 of `2026-10-28-site-wow-redesign-plan.md`. Started 2026-10-28.

## Done
- **Narrative v2** is in `src/components/CosmicJourney3D/narrative.ts`:
  - 31 beats, as approved by the owner on 2026-10-28.
  - New per-beat `act`, `hud` and optional `evidence` fields. Acts are internal art direction; HUD and evidence are consumed in Phase 4.
  - The hero prologue's line 4 is updated.
- **Tests:** `narrative.test.ts` now pins the full copy with a snapshot, plus order, act contiguity, required fields, link shape, and a privacy guard that bans visa, fee, scholarship, rank and client terms.
- **Beat metadata:** `beatsMeta.ts` has 31 entries with new acceptance notes. `NEBULA_ANCHOR` is now derived from the station count, so the camera never doubles back with the longer flight, and the Environment nebula depth follows it.
- **Registry:** `radio-section` is merged into `rri-research-section` per the approved draft, so `Beat_Visibility` is unregistered. The file is kept so its uv-fringe visual can be reused when beat 12 is rebuilt. The 11 new beats fly as `UnbuiltBeatMarker` until Phase 4.
- **Copy fix:** the "RRIViz" → "RRIVis" 3D labels in `Beat_MidnightOil` and `Beat_SignalToSim`.
- **Capture mode:** `capture.ts`, plus `capture.test.ts` for the parsing logic.
  - Parameters: `?capture=1&p=<global progress>&t=<clock s>&dpr=<n>&ui=0`.
  - Freezes the scene clock and the prologue shader clock, pins progress, snaps the camera, fixes DPR, and optionally hides the overlay and rail.
  - Sets `<html data-capture="ready">` after 30 flight frames.
- **Perf probe:** `?perf` lazy-loads `PerfProbe.tsx`, which shows stats-gl and records wall-clock frame intervals. Read them with `__journeyPerf.summary()` (p50/p95/p99/max/over50) and clear with `__journeyPerf.reset()`.

## API spike results (installed versions)
| Check | Result |
|---|---|
| `THREE.Timer` (three 0.183.2) | In core: `three/src/core/Timer.js`, exported from `three`. Use `new THREE.Timer()`. |
| `renderer.compileAsync(scene, camera)` | Present on `WebGLRenderer` (0.183). Reach it in R3F via `useThree((s) => s.gl)`. |
| AgX tone mapping | `THREE.AgXToneMapping` (6) on the renderer. postprocessing 6.39.1 also has `ToneMappingMode.AGX` (7). **Use exactly one.** With an `EffectComposer`, R3F's renderer tone mapping is bypassed for the composited output, so put AgX in the post `ToneMapping` effect. |
| drei `Line` world units | `Line` passes `LineMaterialParameters` through, and three's `LineMaterial` has `worldUnits`. So `<Line worldUnits lineWidth={0.05} />` works (drei 10.7.7). |
| drei `PerformanceMonitor` / `AdaptiveDpr` | Both present in drei 10.7.7. |
| R3F `addEffect` | Exported from `@react-three/fiber` 9 (`core/loop`). Use it to step Lenis once per frame. |
| Lenis | Latest 1.3.27 (2026-10-15). Peer dependency `react >=17`. **Pin 1.3.26** (2026-08-05) to stay on a release that is more than 2 weeks old. Import `ReactLenis` from `lenis/react`. |
| GSAP / SplitText | `gsap` 3.15.0 (2026-04-13), `@gsap/react` 2.1.2. SplitText ships inside `gsap` (free). Not installed yet; it is added in Phase 3. |
| `@mui/*` usage | `grep -rln "@mui" src` finds no imports. Both packages can be removed in Phase 5. |

## License ledger (start)
This is the starting record from 2026-10-28. The current one is `docs/license-ledger.md`.

| Asset | Source | License | Action |
|---|---|---|---|
| `blackhole.frag`, `sky.frag`, `meshShaders` | Written in this repo (Jun 2026 quasar-realism spec) | Owner's own | none |
| `hash13` / `vnoise` / `fbm` in `shaders/chunks.ts` | `hash13` is the widely used "Hash without Sine" pattern (Dave Hoskins, MIT) | MIT | Add a credit comment in `chunks.ts` and a credits line on the site |
| Gravitational-lens shader in `Beat_Lensing.tsx` | Ported from the site's own old 2D block | Owner's own | none |
| `public/audio/quasar-compressed.mp3` | Unknown; committed 2025-06-24 | **Unknown** | **Owner: where did this track come from?** Replace it with the commissioned score in Phase 7 regardless. |
| Montserrat, JetBrains Mono (next/font) | Google Fonts | OFL | Montserrat is replaced in Phase 5. The serif display face and the sans must be OFL so troika/WebGL embedding is allowed. |
| Future 3D models, audio, LUTs | n/a | n/a | Log each one here before it is committed |

## Baseline (production build, 2026-10-28)
Measured in the in-app browser on the owner's MacBook: ANGLE Metal on an Apple M1 Max, 120 Hz, 1024×768 viewport at DPR 2.

- **Build:** `pnpm exec next build && pnpm exec next start`, which is the `prod` entry in `.claude/launch.json`. Using `next build` directly skips the sitemap `postbuild` step, so the tracked `public/sitemap.xml` stays untouched.
- **Method:** `?perf` plus a scripted constant-speed scroll (7 s per segment), then `__journeyPerf.summary()` for each segment.

| Segment | Frames | p50 ms | p95 ms | p99 ms | max ms | frames > 50 ms |
|---|---|---|---|---|---|---|
| Prologue (0–0.22) | 593 | 8.3 | 9.4 | 17.5 | **994** | 4 |
| Beats 1–8 (0.22–0.42) | 609 | 8.3 | 9.3 | 9.6 | **1008** | 1 |
| Beats 9–16 | 840 | 8.3 | 9.3 | 9.5 | 9.8 | 0 |
| Beats 17–24 | 840 | 8.3 | 9.3 | 9.4 | 9.8 | 0 |
| Beats 25–31 | 840 | 8.3 | 9.3 | 9.4 | 9.6 | 0 |

**Reading the numbers:**
- On this GPU the steady state is a clean 120 fps.
- The felt clunkiness on desktop comes from **about 1-second freezes**: one inside the prologue, and one at the prologue → flight hand-off, where the second WebGL context is disposed.
- It also comes from the unsmoothed, step-y scroll and the visual design, not from average frame time.
- Phase 2 (single context) targets the freezes, and Phase 3 targets scroll feel.
- Phones and the Ubuntu PC still need their own baseline (manual check, §6 of the master plan).

**Visual findings from capture frames:**
- **The "square artifact" at about 0.2 is not a raymarch bug.** It is beat 1's white textbook page (`Beat_Textbook`) showing through the prologue as it crossfades into the flight (crossfade band 0.18–0.26). The Phase 4 Textbook rebuild and the Phase 2 single-context hand-off both remove it.
- The supernova (0.12) is a near-white full-frame wash.
- At beat 11 (Captaincy and Injury) the framing shows the *previous* beat's EECS phone, with the shuttlecock pushed to the corner. This is a known framing issue addressed by the Phase 3 shot schedule.

**Visual baseline frames:** capture works on production, but the full 12-position set was not recorded: the browser pane was hidden part-way through, and the page gets throttled in the background. Re-run with the pane visible, using `?capture=1&p=<p>&t=2` at the positions below.
- Prologue: p = 0.03, 0.12, 0.2.
- Beat centres: 3 → 0.3058, 7 → 0.4089, 10 → 0.4825, 11 → 0.507, 16 → 0.6296, 18 → 0.6787, 19 → 0.7032, 29 → 0.9485, 30 → 0.9804.

## Notes for later phases
- Dev mode needs several seconds before `data-capture="ready"` because of on-demand compiling. Always capture and measure on a production build, with the browser window visible: background tabs throttle rAF, which leaves frames blank or stale.
- `CaptureReady` waits until the scene graph's object count has been stable for 30 frames. Async troika text and suspense content mount late, so a plain frame count fired on still-empty frames.
- The prologue raymarch canvas can briefly sit at 300×150 before its ResizeObserver fires. On a deep-link capture (`p` beyond the prologue), the prologue still mounts for its first frame. Phase 2's single-context prologue removes both.
