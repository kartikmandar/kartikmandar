# Wow Redesign: Phase 3 (Flow and Feel)

Phase 3 of `2026-10-28-site-wow-redesign-plan.md`. Built 2026-10-28; the owner scrolled through it and signed it off the same day.

## What changed
- **Every scene is on the beat API.**
  - The 17 remaining legacy scenes were migrated in parallel, one batch of files per agent, with no shared files: Textbook, Comet, FocusLens, Constellation, Search, Network, Compass, Slingshot, MajorLens, DualPaths, Dashboard, MidnightOil, ExitFork, Lensing, PaperPlane, Workbench and Walker, plus the placeholder marker.
  - Each one reads `useBeat(index)` inside `useFrame` and mutates refs and in-place buffers. They no longer re-render per frame and no longer allocate inside `useFrame`.
  - Geometry that used to be rebuilt per frame (growing lines, ring and torus radii, typed text) is now a fixed-size buffer updated in place, with `setDrawRange`, imperative troika text, and visibility and opacity.
  - The registry has one `Scene: FC<BeatSceneProps>` per beat, and the `LegacyBeat` adapter is gone.
  - Four unregistered legacy files are kept for reference: Shuttlecock, Milestones, SignalToSim and Visibility.
  - **Parity:** checked by reading the code against the old maths. Each agent reported its geometry, colours, timing and text unchanged. The owner should still eyeball the beats.
- **Lenis is the journey's scroll clock** (`scrollEngine.ts`, `ScrollRig.tsx`).
  - It uses native document scroll smoothed by Lenis 1.3.26 (`autoRaf: false`, `syncTouch: false`), so keyboard, anchors, find-in-page and assistive tech keep working.
  - `JourneyDriver` steps `lenis.raf` first in the R3F loop, so scroll and the scene advance on the same frame.
  - Progress is mapped from the scroll track measured through a ResizeObserver.
  - CSS smooth-scroll is disabled while the journey is mounted.
  - Framer `useScroll` is no longer used on the journey.
- **Camera** (`CameraRig.tsx`):
  - Frame-rate-independent `MathUtils.damp` follow (λ 10) on the shot schedule.
  - A capped speed → FOV kick (+9° at most), which makes long jumps read as a warp.
  - A small damped pointer sway (±0.3 units, `pointer: fine` only).
  - It reads the shared `journeyFrame` instead of re-splitting the scroll.
- **Shot schedule** (`cameraPath.ts → shotCurveT`, `holdProgress`, plus tests):
  - Every beat is arrive (15%) → hold exactly on its station (70%) → depart (15%), and travel spans the boundaries between beats.
  - The first beat arrives from the origin black hole, and the last departs to the nebula.
  - **Dwell scales with the copy:** about 2.2 vh per word on top of a base, between 110 and 240 vh per beat, and the finale gets 240 (`dwellFor`). The page is now about 59,500 px tall.
- **Overlay rebuild** (`Overlay.tsx`, `overlayView.ts`, plus tests):
  - Copy is shown only during the held shot.
  - **Reveal:** the headline and body reveal line by line through masks (GSAP 3.15 SplitText, `autoSplit`, `aria: 'auto'`), with an `NN / 31 · eyebrow` mono counter.
  - **Exit:** a 0.45 s blur and fade before the camera departs.
  - **Contrast:** a lower-third scrim guarantees it.
  - **Prologue lines:** they cross-fade per phase the same way.
  - **Rendering:** React commits only when what is on screen changes, through one global `addEffect` watcher. There are no rAF loops.
  - **Typed phrases** (the search beat) render as a list with the final choice in signal cyan.
- **Chapter rail** (`ChapterRail.tsx`):
  - A hairline track whose cold → ember gradient fill follows the flight, written to the DOM through a ref, not state.
  - 31 ticks placed at each beat's start. The active tick is longer and ember.
  - Hover and focus labels read "NN headline".
  - Ticks are real buttons with visible focus, and "Skip story" is at the bottom.
  - Clicks fly to the beat's hold with eased, distance-scaled durations.
- **Deep links + keyboard** (`navigation.ts`, `JourneyNav.tsx`, plus tests):
  - **Hash sync:** the hash follows the beat whose copy is on screen (`/my-story/preview#rri-research`), via throttled `replaceState`.
  - **Opening a link:** the page jumps to the beat behind the loader. The loader now waits for `linked` before igniting, so the visitor never sees the prologue flash first.
  - **Keys:** J or → for the next beat, K or ← for the previous one, Esc to skip to the end. Focus moves to the beat heading after each jump.
  - **Skip link:** "Skip the story" appears on keyboard focus.
- **Adaptive DPR** (`tiers.ts → adaptiveDpr`, drei `PerformanceMonitor`, plus tests):
  - DPR moves in 0.25 steps within each tier's range (high 1–2, low and mobile 0.75–1.5), never above the device DPR.
  - It starts at 70% of the range, stops flip-flopping after 4 changes, and falls back to the floor.
  - The prologue's render target follows it automatically.
- **Dependencies:** `lenis@1.3.26` (pinned to a release more than 2 weeks old) and `gsap@3.15.0` (SplitText is included in the free package).

## Verified
- Typecheck, lint and **146 tests** pass, and the production build passes.
- On the production build (functional):
  - Deep link `#rri-research` → lands on beat 12 with its heading up and the hash preserved.
  - `J` → beat 13 (`#gsoc`), and `K` → back to beat 12.
  - A rail click → beat 3 (`#decision`).
  - The rail renders 31 ticks plus Skip, and the page has the Lenis class.
- There are no per-frame `setState` calls in any scene (scanned), and no remaining legacy-prop scenes in the registry.

## Open items (the in-app pane was hidden during automated measurement)
- Frame-time sweep with Lenis and the migrated scenes. Re-run `?perf` with the constant-speed sweep in a visible window.
- Visual parity of the 17 migrated scenes: the owner reviewed by scrolling the whole story; no stored screenshots.
- Scroll feel: the Lenis `lerp` of 0.09 combined with the camera's λ 10 at 60 Hz and 120 Hz, and on iPhone and Android.
- The console's `Unexpected token '<'` errors are the known analytics scripts after consent, and nothing in the journey.
