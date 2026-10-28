# Wow Redesign: Phase 4 (The Full Flight)

Phase 4 of `2026-10-28-site-wow-redesign-plan.md`. Built 2026-10-28. **Signed off by the owner 2026-10-28** after flying through all 31 beats and the finale.

## What changed
- **Every beat has a built scene in the "made of light" idiom.**
  - 28 scenes were built by 7 parallel agents (grouped by act for palette coherence), working from the shared brief `2026-10-28-wow-phase-4-scene-brief.md`.
  - The 3 reference beats were already done, and the finale was built here.
  - A test now fails if any beat falls back to `UnbuiltBeatMarker`.

| # | Beat | Scene | | # | Beat | Scene |
|---|---|---|---|---|---|---|
| 1 | nao | Beat_Textbook (rebuilt) | | 17 | lensing | Beat_Lensing (rebuilt, cursor-draggable lens) |
| 2 | comet | Beat_Comet (rebuilt) | | 18 | publication | Beat_Nufft (new) |
| 3 | decision | Beat_Trajectory (new) | | 19 | cygnus | Beat_CygnusX1 (reference) |
| 4 | constellation | Beat_Eclipse (new) | | 20 | radiosim | Beat_JonesChain (new) |
| 5 | search | Beat_Search (rebuilt) | | 21 | hera-upstream | Beat_Upstream (new) |
| 6 | new-system | Beat_CodeOrbits (new) | | 22 | instruments | Beat_Instruments (new) |
| 7 | fixation | Beat_TidalLock (new) | | 23 | xray-followup | Beat_Reflection (new) |
| 8 | slingshot | Beat_Slingshot (rebuilt) | | 24 | oss-maintainer | Beat_Revival (new) |
| 9 | lens | Beat_ThreeSuns (new) | | 25 | engineer | Beat_Reconcile (new) |
| 10 | internship | Beat_DualPaths (rebuilt) | | 26 | enrolia | Beat_HonestRoad (new) |
| 11 | injury | Beat_SmashToCoach (reference) | | 27 | off-court | Beat_RunTrekShip (new) |
| 12 | rri-research | Beat_HeraArray (reference) | | 28 | admission | Beat_Portal (new) |
| 13 | gsoc | Beat_Dashboard (rebuilt) | | 29 | arrival | Beat_Etna (new) |
| 14 | doubling-down | Beat_MidnightOil (rebuilt) | | 30 | analysis | Beat_EorWedge (new) |
| 15 | journal-club | Beat_JournalClub (new) | | 31 | journey-continues | Beat_Finale (new, bookend) |
| 16 | bs-exit | Beat_LoneTrajectory (new) | | | | |

- **Finale (bookend):** `Beat_Finale` shows the hydrogen web being reionized.
  - Bubbles grow and eat the web, then converge into the opening's photon ring.
  - The Oman eclipse ring slides into alignment over it with a soft swell, and a single 21-cm pulse rings out as the camera departs.
  - `FinaleConstellation` then reveals all 31 beats in miniature near the nebula: coloured by act, cold to ember, joined in story order by a line that draws on, with the last star pulsing ember.
  - The overlay hands over to a **"Let's talk." end card**: Email (contact@kartikmandar.com), CV, Publications, ORCID. CTAs are magnetic on desktop.
- **HUD** (`Hud.tsx`): a mono readout top-left, `NN / 31` plus each beat's `hud` string from `narrative.ts`.
  - It decodes left to right (scramble resolving) when the shot settles and fades on departure.
  - It writes to the DOM through a ref, never per-frame React state.
- **Evidence chips:** a glowing pill under the copy for beats with an `evidence` link (arXiv, repos, merakinist.com, beta.enrolia.app, /talks, /journal-club, the over-planning post).
  - Chips open in a new tab, so the story keeps its place, and screen readers are told so.
- **Art kit additions:**
  - `Label` gained `preserveCase` for notation such as `k_perp`, `v1.0`, `6.4 keV`, `Py 3.13` and `21cmFAST`.
  - GLSL `pow(x, 2.0)` with a possibly negative base (undefined on some GPUs) was replaced with `x*x` in the finale and Cygnus shaders.
- **Hand-off fix (found on the contact sheet):**
  - Problem: Phase 3's copy-length dwell made beat 1 short enough that its hold fell inside the prologue's hand-off band, so beat 1's copy played over the black hole.
  - Fix: the flight now starts only once the prologue has fully dissolved (`flightStart = PROLOGUE_FRACTION + CROSSFADE_BAND`). The camera rests at the origin during the band. A test asserts the flight never moves before the crossfade reaches 1.
- **`?perf` → `__journeyPerf.renderAll()`** draws every object once (hidden ones included), so every shader program links and is checked, even when the page's rAF is paused.

## Verified (production build, MacBook M1 Max)
- Typecheck, lint and **154 tests** pass, and the production build passes.
- **All shaders compile and link on the GPU:**
  - `renderAll()` linked **214 programs** with zero shader errors or warnings in the console.
  - The loader's `compileAsync` plus warm-up readied the whole flight in about 3.8 s.
- **No allocation inside any scene's `useFrame`** (static scan of all 46 scene files: 0 hits) and no per-frame `setState`.
- **Frame times for a full scroll of the 31-beat flight** (constant-speed sweep, pane painting at 144 Hz):

| Section | p50 | p95 | p99 | max | frames > 50 ms |
|---|---|---|---|---|---|
| Opening + hand-off | 6.9 | 7.4 | 7.8 | 27.7 | 0 |
| Acts I–II | 6.9 | 7.7 | 13.5 | 42.9 | 0 |
| Acts II–III | 6.9 | 8.5 | 14.0 | 49.7 | 0 |
| Acts III–IV | 6.9 | 8.4 | 14.2 | 63.4 | 1 |
| Acts IV–V + finale | 6.9 | 8.0 | 13.5 | 34.9 | 0 |

- **The end card appears** at the end of the flight.
- **Beat 1 checked by eye after the hand-off fix:** textbook, figure and chart, with the HUD and copy rendering correctly.

## Owner review
- The owner flew through all 31 beats and the finale on the MacBook and signed them off.

## Not yet verified
- Phones and the Ubuntu PC.
- Fill cost of the larger shader planes on weaker GPUs. The agents flagged Portal (beat 28) and the Comet sky (beat 2).

## Cleanup decision for the owner
These 13 scene files are no longer registered, because their beats were rebuilt under new names or merged:
- Beat_Compass, Beat_Constellation, Beat_ExitFork, Beat_FocusLens, Beat_MajorLens, Beat_Network, Beat_PaperPlane, Beat_Walker, Beat_Workbench
- Beat_Shuttlecock, Beat_Milestones, Beat_SignalToSim, Beat_Visibility (unused since Phases 1–2)

They are kept for now; deleting them is the owner's call.
