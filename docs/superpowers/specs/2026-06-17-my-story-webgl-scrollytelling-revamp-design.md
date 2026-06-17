# `/my-story` — Cinematic WebGL Scrollytelling Revamp

- **Date:** 2026-06-17
- **Status:** Design approved (brainstorming) — pending spec review → implementation plan
- **Owner:** Kartik Mandar
- **Scope:** `src/app/(frontend)/my-story` and the scroll-narrative below the black-hole hero
- **Related:** `docs/superpowers/specs/2026-06-12-procedural-sky-background-design.md` (the hero `QuasarBackground` engine this builds on)

---

## 1. Context & problem

The `/my-story` page is two stacked pieces:

1. **The hero** — `QuasarBackground` (`src/components/QuasarBackground/`), an 80vh WebGL black hole with a real phase narrative (STAR → SHELL → BIRTH → FLASH → QUASAR), two render tiers (raymarched desktop / mesh mobile), idle auto-play, context-loss handling, and a poster fallback. Recent, polished, well-engineered.
2. **The story** — `CosmicJourney` (`src/blocks/CosmicJourney/Component.tsx`), a **single 3,059-line client component** that drives 21 scroll-linked **2D-canvas** scenes plus a typing effect and one Three.js gravitational-lensing scene.

The narrative concept is strong. The scroll *substrate* is what caps it. The current `CosmicJourney` implementation has five load-bearing problems:

- A **permanent `requestAnimationFrame` poll** that never idles (≈30 fps forever while mounted, even off-screen), calling `getBoundingClientRect()` per visible canvas per tick (layout thrash), competing with the hero's own un-paused loop.
- **No easing/smoothing** — scroll maps 1:1 to state, and a `>0.01` progress gate actively prevents interpolation, so motion is steppy.
- **Two correctness bugs:** DPR compounds on resize (`ctx.scale(dpr,dpr)` without a `setTransform` reset → 2×→4× shrink on orientation change); the shuttlecock scene re-randomizes 25 shards every frame (`generateShards` called inside the draw with `data.shards` undefined) so it never settles. Plus `Math.random()` inside several "plot" draws = per-frame flicker.
- **Accessibility is disqualifying:** zero `prefers-reduced-motion` handling, no ARIA on canvases, `background-attachment: fixed` starfield, unconditional blinking/glow.
- **Broken scroll math** for the non-≈350vh sections (the `(viewHeight − rect.top)/(viewHeight + rect.height)` formula assumes a tall section; the 100vh search section and 400vh finale never traverse the 0→1 range their draws expect), plus `vh` traps on mobile.

This revamp replaces the scroll/animation/rendering substrate with a cinematic WebGL experience **without changing one word of the story**.

## 2. Goal & non-goals

**Goal.** Rebuild `/my-story` as one continuous, scroll-driven camera flight through a single 3D universe — Awwwards-tier — that fixes every problem above and elevates the experience to a portfolio centerpiece.

**Non-goals.**
- Changing the narrative: headlines, body copy, eyebrows, order, and metaphor meanings are fixed (see §3).
- Rewriting unrelated parts of the site.
- Touching the blog/other routes' rendering.
- Fixing existing copy typos (preserved verbatim by default; see §3).

## 3. Hard constraint — narrative preservation

Every visible word is reproduced **verbatim**, including existing typos (e.g. "fascinaing", the double space in "I  solidified"). A Vitest snapshot test pins the registry copy to this exact wording so a rebuild can never silently drift it. Fixing typos is an explicit, separate opt-in — **not** part of this work.

The full narrative = the hero prologue copy **plus** the 21 beats. Both are preserved. The canonical copy lives in §7.

Page-level: title **"A Cosmic Journey"**, subtitle **"The story of a path written in the stars."**

## 4. Locked design decisions

These were chosen interactively (visual companion) on 2026-06-17:

| # | Decision | Choice | Why |
|---|----------|--------|-----|
| 1 | Ambition | **C — maximal pinned-WebGL scrollytelling** | Portfolio centerpiece |
| 2 | Spatial model | **Model 1 — continuous cosmic camera flight** | One world; black hole origin → nebula end |
| 3 | Scene treatment | **C — full volumetric** (all 21 beats native 3D) | Maximum immersion; metaphors rebuilt faithfully |
| 4 | Camera journey | **A — one unbroken take** (spiral-out opening, a few pinned arrivals on heavy beats) | Premium continuity; antithesis of today's steppy scroll |
| 5 | Art direction | **A — cinematic scientific realism**, base lit with **B's indigo/green/gold accents** | Authentic to an astrophysicist; unifies with existing hero |
| 6 | Length & nav | **Continuous + light controls** (slim chapter/progress rail, click-to-jump, skip) | Long scroll stays navigable without breaking cinema |
| 7 | Mobile | **Same flight, auto-scaled quality** (extend the existing tier system) | Parity with graceful degradation |
| 8 | Reduced-motion / fallback | **Full a11y + generate the missing poster** | Clears the a11y/SEO bar; fixes latent 404 |
| 9 | 3D architecture | **React Three Fiber + drei + postprocessing**, scroll driven by **Framer Motion** (not drei ScrollControls) | Maintainable at 21-scene scale; hero absorbed in |

## 5. Experience specification

- **Opening (hero prologue).** The page opens inside/at the black hole — the existing raymarched hero, reused. Its STAR → SHELL → BIRTH → FLASH → QUASAR phases run as the **scroll-driven prologue** (idle auto-play retained for the very first beat before the user scrolls; the existing zoom/pinch interaction is preserved as a secondary input on this segment). Hero phase copy is unchanged.
- **The flight.** A single `CatmullRom` spline carries the camera from the black-hole origin, **spiralling outward**, then along an unbroken path that visits all 21 stations in order, ending by **flying into the nebula**. The camera *always moves forward*; it eases to a near-stop at each station's center to let the reader settle, then accelerates onward. Curve tangent + scroll velocity drive subtle banking/roll and a light motion-blur on the fast segments.
- **Arrivals.** Most stations are a smooth eased pass-through. The **heaviest beats may pin** for a beat (local scroll scrubs the scene in place) before releasing — used sparingly where a scene needs dwell time (e.g. the dashboard build, the two lensing/GSoC scenes).
- **Ending.** The finale ("The Journey Continues…") flies into a growing nebula; the closing subtitle holds in indigo.

## 6. Technical architecture

### 6.1 Dependencies to add
- `@react-three/fiber` (R3F renderer for React 19)
- `@react-three/drei` (camera/curve/loader/util helpers)
- `@react-three/postprocessing` (bloom, depth-of-field, vignette, lens flare for the cinematic look)
- `three` is already installed (0.183). **Add `transpilePackages: ['three']` to `next.config.js`** (currently missing).
- Framer Motion 12 is already installed (used as the scroll source).
- Dev-only tuning (`leva`) is optional and must not ship to production.

### 6.2 One Canvas, one context
A single R3F `<Canvas>` is fixed full-viewport (`position: fixed`, behind the DOM overlay). A tall scroll container (height = Σ beat scroll-lengths) provides the native scrollbar. Never more than one WebGL context.

### 6.3 Scroll bridge (Framer Motion → R3F)
- `useScroll({ target: scrollContainer, offset })` produces `scrollYProgress` (a `MotionValue`, 0→1 over the whole journey).
- The motion value is written to a **ref** (via `useMotionValueEvent` or by passing the `MotionValue` itself) and read inside R3F's `useFrame` with `.get()` — **no React re-render per frame**.
- Drei `ScrollControls` is intentionally **not** used (it owns its own scroll and fights Framer Motion, per research).

### 6.4 Camera rig
- `THREE.CatmullRomCurve3` through `[origin, ...21 anchors, nebula]`.
- Global progress → **piecewise eased** parameter `u` so the camera decelerates near each station center and accelerates between. `camera.position = curve.getPointAt(u)`.
- Look-at target follows a parallel target-curve (or the upcoming anchor) for natural framing.
- **Banking/roll** from `curve.getTangentAt(u)` + scroll-velocity (derivative of the motion value); velocity also feeds a subtle motion-blur pass.

### 6.5 Hero fusion
The hero black hole is **absorbed into the unified scene** as the origin object, reusing the existing GLSL from `src/components/QuasarBackground/engine/shaders/blackhole.frag.ts` inside an R3F `shaderMaterial`. The hero's `PhaseMachine` logic (STAR→QUASAR) is mapped onto the prologue's scroll sub-range. The existing tier/benchmark/context-loss concepts are carried into the new `tiers.ts`. Net: the polished raymarched work is preserved, not discarded.

### 6.6 Beat registry (single source of truth)
`registry.ts` exports an ordered array. Each entry:

```ts
type Beat = {
  id: string            // stable id, mirrors the original section id
  eyebrow?: string      // chapter label (verbatim; some beats have none)
  headline: string      // verbatim
  body?: string         // verbatim (search beat has none; it uses typedPhrases)
  typedPhrases?: string[] // for the terminal-typing beat
  scrollLength: number  // in vh-equivalents; defines this beat's share of the scroll
  pin?: boolean         // does the camera pin here?
  anchor: { position: [number,number,number]; lookAt?: [number,number,number] }
  Scene: React.FC<SceneProps>  // the volumetric scene module
  posterSrc: string     // static still for reduced-motion / low-power
  acceptance: string[]  // checklist derived from the original draw fn (parity guard)
}
```

**Both** the 3D scenes **and** the real-DOM narrative copy render from this one array.

## 7. Beat registry content (canonical copy + parity checklist)

> Copy below is verbatim from the current build and is the snapshot the preservation test pins to. "Original draw" names the function in `CosmicJourney/Component.tsx` that defines the metaphor each volumetric scene must faithfully reproduce.

**Hero prologue (reused `QuasarBackground`), phase overlay copy:**
- STAR — "Every story begins with a massive star."
- SHELL — "It dies in a supernova, outshining its entire galaxy."
- BIRTH — "What remains collapses into a black hole. Matter spirals in, and the disk ignites."
- QUASAR — "But this is just the surface of what really is happening!!"
- Hint (STAR) — "Zoom in to witness its end" / touch: "Pinch in to witness its end" (+ "· auto-plays in {n}s")
- Hint (QUASAR) — "Scroll down to glimpse into my ~~boring~~ simple journey"

**The 21 beats:**

1. **`nao-section`** · eyebrow "4th Standard" · **The Spark: NAO** — "Cleared the regional round of the National Astronomy Olympiad. Reading their textbooks sparked a fascination that led me to participating each year, fueling a deep interest in the cosmos." · *Original draw: `drawPageToCosmos`* — flat textbook page; 2D outline planets (Saturn w/ rings, Jupiter, Mars) lift off and become shaded 3D spheres, flat shadows fade.
2. **`comet-section`** · "6th - 8th Standard" · **Hands-On Exploration** — "Joined SPACE-India astronomy club at school. It was fascinaing. Solar observations, making dry-ice comets, finding asteroids, calculating Earth's circumference and overnight observation camps at Sariska somehow made the universe tangible." · *`drawBuildAComet`* — ~50 particles accrete onto a growing nucleus; nearing the sun it sublimates into a blue coma + curved dust tail + straight ion tail pointing away from the sun.
3. **`decision-section`** · "9th - 10th Standard" · **A Future Decided** — "With a clear vision, I decided my future lay among the cosmos. It seemed like a pipe dream but I  solidified my resolve to become an astronomer." · *`drawFocusingLens`* — vignette tunnel closes; a stick-figure astronomer (arm up, telescope past 50%) sharpens into focus in a sky-blue glow.
4. **`constellation-section`** · "11th - 12th Standard" · **Forging My Own Path** — "Even though I chose PCM in my high school, I went on a goal to pursue research over engineering, built my own refractor, started the \"Brittle Stars\" blog, and played badminton competitively. I also bagged AIR 14 in Heliodyssey, winning a fully sponsored solar expedition to Oman to study an annular eclipse." · *`drawConstellations`* — a faint "engineering" cluster fades while a brighter labeled Gemini "research" constellation (Castor, Pollux, Wasat, Mebsuta, Alhena, Mekbuda, Alzirr, Propus, Tejat, Kappa Gem) lights up; indigo lines connect the stars.
5. **`search-section-wrapper`** · "Partial Drop Year" · **Searching for the Right Trajectory** — *(no body)* terminal/search box, green monospace `>` prompt + blinking caret; typewriter cycles `["DU > Hansraj College...", "IISERs...", "IISER Bhopal"]`, stops on the last and turns the caret green. *Original: React typing `useEffect`.*
6. **`new-system-section`** · "1st Year at IISER Bhopal" · **A New System** — "After a partial drop year, I joined the BS Economic Sciences programme at IISER Bhopal. The first semester was online due to COVID, a time I used to focus on full-stack web development alongside my studies." · *`drawVirtualNetwork`* — central indigo node connects out to nodes appearing one by one (academic = chart icon, code = `</>`), lines + flowing particles.
7. **`fixation-section`** · "Temporary Home" · **Fixated on Physics** — "Though I started as an Economic Sciences student, my focus was always fixed on finding a way into physics and astronomy." · *`drawUnwaveringCompass`* — labeled compass rose ("Economic Sciences"); red needle swings from North and locks onto a growing "Physics" star, with a slight tremble.
8. **`slingshot-section`** · "End of 1st Year" · **Orbital Correction** — "Scoring one of the highest CGPA in my branch gave me the option to switch. I chose to migrate to the 5-year BS-MS Natural Sciences programme, correcting my course toward astrophysics." · *`drawSlingshot`* — planet orbits a yellow sun (Econ), follows a quadratic transfer to a larger blue-indigo sun (BS-MS), settles into a wider orbit; dotted orbit guides fade/appear.
9. **`lens-section`** · "2nd & 3rd Year" · **Finding My Sun** — "Exploring Physics, Maths, and Data Science as pre-majors, I finally chose Physics as my major and joined the IISER Bhopal Astronomy Club and the Sports Council." · *`drawMajorChoiceLens`* — three labeled orbs ("Maths", "Physics", "Data Sci"); focal point sweeps across them (blur/sharpen) while a white focus ring expands.
10. **`internship-section`** · "After 2nd Year" · **Dual Pathways** — "I got selected for an internship in Sysmatics Lab at EECS department, to develop a mobile app for collecting data for detecting signs of depression among academicians. Also got selected for the iGEM team of IISER Bhopal for the synthetic biology competition organized by MIT in Paris." · *`drawInternshipPathways`* — two diverging glowing paths from a branch point: blue tech path → phone w/ signal bars ("Sysmatics Lab / EECS Dept"); green bio path → DNA helix ("iGEM Team / MIT (Paris)"); faint purple connecting arc later.
11. **`injury-section`** · "Leadership & Setbacks" · **Captaincy and Injury** — "I captained the IISER Bhopal badminton team at the Inter IISER Sports Meet. Unfortunately, I also broke my shoulder and tore my ACL during a game, leading me to transition my role from captain to a coach." · *`drawShatteringShuttlecock`* — shuttlecock rises, cracks, shatters into ~25 feather/cork shards that scatter and fall under gravity, fading. *(Note: fix the original's per-frame re-randomization — shards generated once into `data`.)*
12. **`rri-research-section`** · "Summer After 3rd Year" · **First Foray into Research** — "Joined Raman Research Institute as a visiting student, working with the HERA radio array in South Africa. As a part of the validation team, I built my own visibility simulator, RRIViz." · *`drawSignalToSimulation`* — noisy radio waveform; array of radio dishes fade in; green baseline lines between every antenna pair; bottom plot resolves a noisy curve into a clean green sine labeled "RRIViz".
13. **`gsoc-section`** · "Google Summer of Code 2024" · **GSoC & Open Source** — "Selected for Google Summer of Code with Stingray, I built a quicklook dashboard for X-ray time series data. This marked the start of my open-source journey." · *`drawBuildingDashboard`* — dashboard self-assembles: wireframe → sliding panels → content types in ("Stingray QL", "Obs ID: 4040130102", "Target: Cygnus X-1", "Quicklook Dashboard - X-Ray Time Series") + Light Curve / Power Spectrum / Phase Lag plots.
14. **`radio-section`** · *(no eyebrow)* · **HERA: Seeing the Invisible** — "My work at RRI involved simulating visibility data from radio interferometers like HERA. I also learned about matvis and other popular visibility simulators." · *`drawRadioInterferometry`* — labeled axes "LST (Time)" × "Visibility Amplitude"; green oscillating visibility curve draws in left-to-right.
15. **`doubling-down-section`** · "Winter Vacation" · **Doubling Down** — "Successfully completing both internships, I churned the midnight oil and returned to RRI in December to continue my work on RRIViz." · *`drawBurningMidnightOil`* — sky transitions day→night, sun/moon cross; "College" bar (yellow, fading) and "RRIViz" bar (green, glowing).
16. **`bs-exit-section`** · "A Strategic Pivot" · **The BS Exit Decision** — "I decided to take a BS exit from college to pursue an MS in Astrophysics elsewhere for better opportunities." · *`drawDivergingPaths`* — indigo path rises to a fork; BS-MS continuation fades to a dashed ghost; new yellow branch veers upper-right ("BS-MS" / "BS Exit"); a white traveler dot takes the new branch.
17. **`lensing-section`** · "Summer of Code 2025" · **GSoC 2025: ML for Science** — "Selected again for GSoC with ML4SCI, working on an LSST data analysis pipeline for DeepLense and applying machine learning to gravitational lensing." · *`initGravitationalLensing` (Three.js shader)* — a dark wandering lens mass warps a procedural galaxy field, forming a bright Einstein-ring glow that grows/shrinks (lens_mass ← progress, einstein_radius ← sin(progress·π)·0.15, lens drifts on a Lissajous path). *This scene is already WebGL — port/upgrade directly.*
18. **`publication-section`** · "Third RRI Stint" · **First Publication & New Horizons** — "Returning to RRI, I worked on fftvis, leading to my first co-authored paper on arXiv. I was also selected for fully-sponsored summer programs at the University of Toronto and IIT Indore for SKA training." · *`drawPublicationFlight`* — paper (showing "arXiv:2506.02130", title "fftvis: A Non-Uniform Fast Fourier Transform Based Interferometric Visibility Simulator", "K. Mandar, et al.") folds into a paper airplane and flies off, trails splitting to two stars "U of Toronto" and "IIT Indore (SKA)".
19. **`cygnus-publication-section`** · "Second Publication & Some Training" · **Cygnus X-1 Discovery & ZTF Summer School** — "Timing analysis of Cygnus X-1 using 26 NuSTAR observations resulted in my second co-authored paper submitted to arXiv. Selected for the prestigious ZTF Summer School at Caltech, focusing on data science techniques for the Rubin Observatory era." · *`drawPublicationJourney`* — dashed milestone path with icons: "NuSTAR", "Data", "Analysis", "Results", "Paper (arXiv)", "ZTF"; glowing particles travel the path.
20. **`analysis-section`** · "Current Endeavors" · **What I am working on?** — "Currently working across different projects: spectral analysis of Cygnus X-1, RRIVis version 2 with polarization and antenna beam support, contributing to RIPPLe, DAVE and Stingray, and maintaining fftvis." · *`drawCelestialWorkbench`* — three overlapping phases: a Cygnus X-1 black hole with expanding rings; an indigo RRIViz/EM grid; a crystal that pulls in and "absorbs" floating LaTeX symbols (∫, Σ, a/b, α, ∇).
21. **`journey-continues-section`** · *(no eyebrow)* · **The Journey Continues...** — "...in search of a Master's in Astrophysics." (indigo subtitle) · *`drawJourneyContinues`* — a walking stick-figure ascends a narrowing perspective path of stars, shrinking into a growing blue nebula. → flies into the nebula = the finale.

## 8. Scene module pattern

```ts
type SceneProps = {
  localProgress: number          // 0→1 across this beat's pinned sub-range
  clock: number                  // shared elapsed seconds (single time base — never Date.now())
  quality: QualityTier           // drives particle counts / shader cost
  reducedMotion: boolean
}
```

- Each beat is a self-contained R3F component under `scenes/`, mounted at its registry `anchor`.
- Heavy work is gated by progress-range/visibility — only the active station and its immediate neighbors run expensive draws.
- **One time base:** a shared `clock` from `useFrame`, never `Date.now()` and never `+=0.01` per frame, so motion is frame-rate-independent (fixes the 120 Hz speed-up bug).
- Each module's header comment lists its registry `acceptance[]` checklist; a scene is "done" only when it satisfies that parity list against the original.

## 9. Navigation & UX

- **Chapter/progress rail** (slim, fixed): chapters labeled by the eyebrows ("4th Standard" … "GSoC 2024" … "Second Publication & Some Training"); current-position indicator tracks `scrollYProgress`.
- **Click-to-jump:** clicking a chapter smooth-scrolls to that beat's scroll offset; keyboard-navigable (focusable, arrow/enter support).
- **Skip** affordance to jump to the end / exit the flight.
- The existing first-beat scroll hint is retained.

## 10. Performance & mobile tiers

- **One context; demand-driven render:** render while scrolling or animating, `invalidate()` on scroll; idle otherwise. Pause on `document.hidden` and when the canvas is off-screen. Clamp `dt` to `min(dt, 1/30)` (also addresses the MEMORY-noted rAF-freeze-on-return).
- **Quality tiers** extend the existing `tierSelect` concept into `tiers.ts`:
  - *desktop-high* — full postprocessing (bloom, DoF, vignette, lens flare), DPR ≤ 2, high particle counts.
  - *desktop-low* — trimmed postprocessing, fewer particles.
  - *mobile* — DPR capped ~1.5, reduced particle counts, simplified/disabled postprocessing and volumetrics. **Same flight, auto-scaled.**
- Animate only compositor-friendly work on DOM overlays (transform/opacity); avoid `ctx.filter`/`blur` GPU stalls from the old build.

## 11. Accessibility & reduced-motion fallback

- **Reduced-motion-first.** `prefers-reduced-motion` (media query + JS `matchMedia` change listener): render a static representative **still per beat** (the `posterSrc`), freeze camera fly/parallax, kill caret blink and time-advances. Provide an **on-page motion toggle** (WCAG 2.2.2) so users can opt in/out regardless of OS setting.
- **Real DOM copy.** All narrative text (`h2`/`p` from the registry) is in the DOM and crawlable; the canvas is `aria-hidden`. This restores SEO and screen-reader access that the current canvas-only narrative loses.
- **Assets.** Generate `public/media/quasar-poster.jpg` (fixes the latent hero `fail()` 404) plus the per-beat stills. Stills can be baked from the scenes at a fixed representative `localProgress`.
- No scroll-jacking: native scroll + passive Framer Motion `useScroll`; we never hijack wheel/touch.

## 12. File layout

New `src/components/CosmicJourney3D/`:

```
index.tsx          client entry: <Canvas> + Overlay + ChapterRail + Fallback gating
registry.ts        ordered beats (single source of truth) + copy snapshot
ScrollRig.tsx      Framer Motion useScroll → MotionValue/ref bridge into R3F
CameraRig.tsx      CatmullRom spline + piecewise easing + banking/velocity
Environment.tsx    shared starfield, volumetric nebula, lighting, postprocessing
Overlay.tsx        DOM narrative panels synced to beats (real, crawlable copy)
ChapterRail.tsx    chapter/progress rail, click-to-jump, skip
Fallback.tsx       reduced-motion / low-power static experience
tiers.ts           quality-tier selection (extends existing tierSelect concept)
scenes/Beat_*.tsx  hero prologue + 21 volumetric scene modules
shaders/           reused blackhole + lensing GLSL, new scene shaders
__tests__/         registry/copy, scroll math, tiers, reduced-motion, spline
```

Built **behind the route**; the existing `CosmicJourney` stays until parity, then the `my-story/page.tsx` import is swapped and dead code (old component, dead `.timeline-event` CSS, duplicate observers) is removed.

## 13. Testing strategy

WebGL itself is verified manually; the **pure logic is unit-tested** (Vitest):
- **Copy preservation** — snapshot of registry `headline`/`body`/`eyebrow`/`typedPhrases` against §7 wording (guards against drift).
- **Registry completeness** — hero prologue + 21 beats present, ordered, each with `Scene`, `anchor`, `posterSrc`, non-empty `acceptance`.
- **Scroll math** — global→local progress mapping and pin sub-ranges, including the edge beats broken today (search = short; finale = tall) traverse a full 0→1.
- **Tier selection** — environment → quality tier.
- **Reduced-motion** — fallback path renders all narrative copy as DOM and mounts no animation loop.
- **Camera spline** — continuity/monotonic `u` across the eased mapping.
- **Manual/visual** — dev server + `verify` skill across desktop-high, desktop-low, and mobile tiers, plus a no-console-errors scroll-to-end smoke check.

## 14. Phasing / walking skeleton

Realistic solo effort ≈ 5–7 weeks. Build a thin end-to-end slice first, then fill in.

- **Phase 0 — Foundation.** Add deps + `transpilePackages`; scaffold the directory; one `<Canvas>` with the hero black hole as the origin; Framer Motion scroll bridge; spline camera through placeholder anchors; DOM overlay + chapter rail from the registry; reduced-motion fallback skeleton. **Ships an end-to-end vertical slice with 2–3 real scenes.**
- **Phase 1 — Hero prologue** fused and scroll-driven (STAR→QUASAR, copy preserved, idle auto-play + zoom retained on this segment).
- **Phases 2–5 — Scenes in faithful batches** (3–4 beats per batch), each validated against its `acceptance[]` checklist and the original draw function.
- **Phase 6 — Tiers / mobile / postprocessing polish**, reduced-motion stills, poster generation.
- **Phase 7 — a11y pass, full test suite, cross-device QA**, swap the route, remove dead code.

Each phase is independently shippable behind the in-progress route.

## 15. Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Scope (21 volumetric scenes) | Registry-driven + phased; each phase ships a slice |
| Metaphor drift during 3D rebuild | Per-scene `acceptance[]` checklist + copy snapshot test |
| Performance (heavy GPU work) | One context + demand rendering + quality tiers + visibility gating |
| R3F vs the raw-Three hero | Absorb the hero into R3F, reusing its shader; no parallel renderers |
| Bundle weight | Journey is a code-split dynamic import on this one route |
| Long build risks regressions elsewhere | Built behind the route; old component retained until parity |

## 16. Open items & decisions log

- All nine §4 decisions are locked.
- **Pinned-arrival set** (which heavy beats pin vs. pass-through) to be finalized during Phase 2 scene work — candidates: dashboard build (13), lensing (17), workbench (20).
- **Poster/still generation method** (bake from scenes vs. author) decided in Phase 6.
- Existing copy typos preserved by default; cleanup is a separate opt-in.

## 17. Out of scope

- Any narrative/copy change.
- Other routes and the global layout.
- Dependency cleanup beyond what this route touches (the earlier audit flagged possibly-unused `zustand`/`@mui`/`emotion`/`geist` — out of scope here unless separately requested).
