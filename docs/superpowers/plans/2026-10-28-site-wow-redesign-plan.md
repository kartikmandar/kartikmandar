# Site "Wow" Redesign: Master Plan (2026-10-28)

**Goal:** turn kartikmandar.com from "clunky" into a sleek, cinematic site that wows PIs, recruiters, peers and the general public. `/my-story` is the showpiece: a continuous, directed camera flight through a single universe. Every other page shares one design system, one motion language and one scroll engine.

**Inputs to this plan:**
- Research workflow `wow-redesign-research`, with 12 agents:
  - Awwwards/FWA-style scrollytelling
  - space/science sites
  - portfolio motion/UI
  - tech stack
  - three audits: code for /my-story, code for the site UI, and the live site in a browser
  - three competing plan drafts, then a synthesis, then a completeness critic
- Story-mining workflow over `~/Documents/AboutMe`, with a privacy and accuracy review.
- About 40 answers from the owner.

**Companion doc:** `docs/superpowers/specs/2026-10-28-my-story-narrative-v2-draft.md`, the new 31-beat story text, pending line-by-line approval.

> Research caveat: several award or "Site of the Day" claims came from secondary roundups and could not be verified on awwwards.com. Use them as technique references only, never as dependencies. No existing site is being recreated.

---

## 1. Locked decisions (owner, 2026-10-28)

| Area | Decision |
|---|---|
| Feel | **Cinematic awe**: dark, immersive, film-like, slow and confident motion |
| Effort | All-in showpiece, shipped in phases |
| Ordering | **Visual wow first.** New and rebuilt beats are written on the new ref/uniform scene API from day one, so the engine migration never redoes art. |
| Scope | /my-story showpiece + site-wide polish + **content refresh everywhere** |
| Story form | One continuous flight; **flat beat list, no act labels** (acts are internal art-direction groups only); long, readable dwell per beat |
| Story text | **Free rewrite allowed** (the verbatim rule is lifted). Research is the spine, with engineering/founder beats as chapters. See the narrative v2 draft. |
| Art | "Made of light" art bible. **Owner signs off on 3 reference beats** before the rest are converted. **No photos inside the flight.** |
| Signature | **Photon-ring hand-off**: one WebGL context, with a gentle bloom swell rather than a hard flash |
| Finale | Bookend to the singularity → pull back to reveal all beats as one constellation → "Let's talk" end card (CV, publications, ORCID, email) |
| Story extras | Scientific **HUD**, **evidence chips** (paper/repo), **deep links + keyboard** (J/K or arrows, Esc to skip). No stardust narrator for now. |
| Visual language | **Dark only**; big editorial **serif display + quiet sans + mono** for scientific labels; one **ember** accretion-disk accent |
| Stack | **Lenis** as the single scroll clock (site-wide, shared with R3F) + **Framer Motion** for DOM UI + **GSAP SplitText** only for masked text reveals. GSAP never drives the camera. |
| Navigation | Slim top bar + **fullscreen menu overlay** + SpotlightTerminal reborn as a **Cmd-K** palette; the floating dock and the path pill are retired |
| Micro-motion | Subtle: a small cursor label, magnetic CTAs, masked reveals, ~400 ms route transitions (fast on CV/publications) |
| Pages | Focus on Home, CV, Publications, Open source/Projects, Talks. Fold Certificates, Courses, Journal Club and Hobbies into **About / More** (with photos). |
| Home | **Pre-rendered black-hole loop** behind the name (captured from the real raymarcher) + an **"Enter the story"** portal + a treated portrait. No live WebGL on home. |
| Sound | **Opt-in** ambient score + subtle SFX, muted by default, wired to GlobalAudioButton; commissioned or licensed audio |
| Assets | CC0 or paid 3D models OK; the owner supplies photos (home/About only); audio commissioned |
| Mobile | **Full parity**: same flight, adaptive quality |
| SEO | Story text **server-rendered** under the canvas (also serves as the reduced-motion / no-WebGL version) |
| Verification | **Manual checks only** (no CI gates, no new PostHog story events). Devices: **MacBook, Ubuntu PC, iPhone, Android**. |
| Awards | Not targeting juries; build for visitors |
| WIP | The uncommitted prologue-flicker diagnostics stay uncommitted and are deleted when the single-context prologue lands (Phase 2) |

## 2. Why it feels clunky today (audit summary)

1. **Jank by design** (the main cause):
   - `SceneHost` calls `setClock` every frame, which re-renders all 21 scenes at 60–120 Hz.
   - Scenes rebuild `Float32Array`, `Vector3` and `Color` objects in `useMemo([clock])` every frame, which causes GC spikes.
   - There are separate rAF loops in Overlay, ChapterRail and PrologueLayer.
   - Native scroll is unsmoothed, and the camera lerp `0.12`/frame is frame-rate-dependent (it feels different at 60 Hz and 120 Hz).
   - A **second WebGL context** for the prologue (with `preserveDrawingBuffer` and a resolution governor that resizes the canvas) is the likely cause of the flicker and the square artifact around 0.2.
2. **Cheap visuals:**
   - `meshBasicMaterial toneMapped={false}` almost everywhere, 1-px GL lines and default troika text.
   - A bloom threshold of 0.2, so everything glows evenly into mush.
   - No fog, grade, grain or shared palette.
   - The origin black hole is a **flat torus** that the photoreal raymarch crossfades into, which reads as a downgrade at the key moment.
3. **Choppy narrative:**
   - Camera arrival, scene progress and copy run on different timelines.
   - Hard pop-in at beat boundaries.
   - The flat saturated bars around 0.7, the textless void around 0.8–0.9, and the cramped DOM finale.
4. **Site UI reads as a template:**
   - A stock grayscale palette and the same gradient h1 copy-pasted on 11 pages.
   - One Material bezier used for all motion, no page transitions and no scroll reveals.
   - Three overlapping nav systems, and glass pills hard-coded to white-on-black.
   - The cookie banner covers the lower third of every screen.
   - `@mui/*` is installed but imported nowhere.
5. **Stale content:**
   - It still says "Astrophysics Student" with the RRI address and never mentions Catania.
   - Publications show the Cyg X-1 paper as submitted to arXiv, but it is now in ApJ.
   - The RRIVis repo link returns 404.
   - It claims fftvis speedups that aren't benchmarked.
   - The homelab card overclaims.

## 3. Architecture targets (carried through every phase)

- **One clock:**
  - Lenis (native document scroll, `autoRaf:false`) is stepped from R3F `addEffect`.
  - A **zustand ref store** (`store.ts`: rawProgress, smoothProgress, velocity, activeIndex, per-beat progress) is written once per frame.
  - React re-renders only on discrete changes (active beat).
  - Camera, uniforms, overlay, rail, HUD and audio all read from the store.
- **Scene API:**
  - `useBeat(i)` returns refs. Each scene mutates meshes and uniforms in its own `useFrame`.
  - Buffers are allocated once, and motion lives in vertex shaders where it's trivial.
  - Every new or rebuilt beat uses this from the start (that's what lets "visual first" avoid rework).
- **Shot schedule:**
  - A declarative per-beat schedule in `beatsMeta` covering approach → settle → **hold** → depart (about 30% travel and 70% hold, with long holds), plus camera keyframes (position/target/FOV/roll), palette and HUD.
  - `locate()` and the camera's `easedCurveU` read the same schedule.
- **One WebGL context on /my-story:**
  - The raymarch becomes a fullscreen pass inside the R3F Canvas.
  - The origin black hole uses the same shader.
- **Art bible:**
  - `art/palette.ts` is shared by the CSS tokens and the GLSL uniforms. Tokens: tinted near-black, ember accent, cyan signal, star gold, near-white.
  - The colour grade drifts from cold (Act I) to ember (Act V).
  - Material kit: a fresnel/rim celestial material, additive glow sprites, holographic glass panels, HDR emissive (above 1.0) so bloom is selective, fat `Line2` light-lines with draw-on, and a self-hosted troika font.
- **Post stack:**
  - AgX tone mapping, bloom threshold around 0.85–0.9 (mipmapBlur), 3–4% grain, SMAA with multisampling 0, and velocity chromatic aberration plus an FOV kick (both capped, and off in calm mode).
  - The vignette moves to CSS.
  - Every pass is gated by **drei PerformanceMonitor**, which drives DPR, passes, particle counts and raymarch steps.
- **Site:**
  - Dark-only OKLCH tokens, with fonts via `next/font` (OFL faces, so WebGL embedding is allowed).
  - `src/lib/motion.ts` holds eases, durations, springs and stagger, mirrored as Tailwind `@theme` tokens, plus `MotionConfig reducedMotion="user"`.
  - Route transitions go through `app/(frontend)/template.tsx`, with React ViewTransition as a feature-detected spike and /my-story excluded.
  - Heavy WebGL stays on /my-story only.

## 4. Phases

Every phase ships independently behind `/my-story/preview` (or behind the route itself for site pages) and leaves the site working. Each ends with the **manual check** in §6.

### Phase 0: Groundwork (2–3 days)
- **Owner approves the narrative v2 text**, which then replaces `narrative.ts`. Update `narrative.test.ts` to snapshot the new copy, and update beatsMeta/registry for 31 beats. New beats temporarily fly as `UnbuiltBeatMarker`.
- **Deterministic capture mode** `?capture=1&t=<s>&p=<progress>`: freezes the clock, disables grain/CA/accumulation, fixes DPR and sets progress. Used for manual before/after screenshots, posters and the home loop.
- `?perf` overlay (r3f-perf, dev-only dynamic import).
- **API spike list.** Confirm against the installed versions:
  - `THREE.Timer` import path in r0.183
  - `gl.compileAsync` through R3F
  - drei `Line` world-units
  - AgX through the renderer versus the postprocessing ToneMapping effect (only one should apply)
  - GSAP SplitText with React 19 StrictMode
  - Lenis with R3F `addEffect`
- **License ledger:** fonts, models, audio, and blackhole.frag/noise shader provenance.
- **Baseline:** `next build && next start`; screenshots of every route plus /my-story/preview at 12 capture positions on the MacBook; a rough p95 frame time from the Chrome Performance panel.
- **Done when:** the new copy is approved and live in the preview, the capture mode works, and the baseline exists.

### Phase 1: Look-dev and reference beats (about 2 weeks) ← visual wow first
- **Minimal engine core**, only what new art needs: `store.ts` + `useBeat(i)` + an adapter so the old beats keep working. Remove `setClock` from `SceneHost`; old scenes read the clock from the store through the adapter.
- **Art bible + material kit + post retune:** palette.ts, fresnel material, GlowSprite, holographic panel, LightLine, troika font, AgX/bloom/grain/SMAA, fog matched to the background.
- **3 reference beats** in the new idiom, chosen to cover the range:
  1. **12 · First Foray (HERA array on the Karoo, fringes, 21-cm haze)**: research and instrument.
  2. **19 · Cygnus X-1 (accretion disk + companion, inner edge sliding)**: black-hole physics; rhymes with the prologue.
  3. **11 · Captaincy and Injury (shuttlecock smash → shards → coaching arc)**: personal.
- **Owner sign-off gate:** a contact sheet from capture mode plus a live review on the MacBook. Iterate until approved. Everything after this phase copies this look.
- **Done when:** the 3 beats are approved and no reference beat allocates inside `useFrame`.

### Phase 2: The signature opening (about 2 weeks)
- **Single context:**
  - Port `blackhole.frag` into a fullscreen `ProloguePass` in the R3F Canvas, with uniforms from the store.
  - Retire the second `WebGLRenderer` and `preserveDrawingBuffer`. This fixes the flicker for good.
  - Delete the uncommitted `?diag` code.
  - Keep `?legacyPrologue` for side-by-side comparison.
- **Origin black hole = the same raymarch** (fewer steps at distance, or an impostor). The flat torus is retired.
- **Photon-ring transition:**
  - The camera dollies into the photon ring.
  - A screen-space lens distortion plus a **gentle bloom swell** (luminance ramp ≥300 ms, never a full-field flash, none in calm mode).
  - The viewer emerges at beat 1 with matched FOV and direction.
- **Loader as prologue:**
  - A point of light whose glow tracks real progress (`compileAsync` of all materials, font preload, texture builds), then ignites into the massive star.
  - SSR title + poster at first paint instead of `return null`.
  - Short on repeat visits.
- **Raymarch polish:** temporal accumulation at rest, disk-noise epochs, step tiers, idle-stop, and a bloom mask so the shadow stays inky.
- **Re-grade** side by side with the legacy prologue.
- **Done when:** /my-story/preview uses exactly one WebGL context; there is no seam, flicker or recompile scrolling up and down through 0–0.25; first paint is never black.

### Phase 3: Flow and feel, the engine pass (about 1.5 weeks)
- **Migrate every remaining beat to `useBeat`.** Allocate buffers once; Comet, Milestones, Shuttlecock, Slingshot, MidnightOil and Textbook come first (Textbook has an inline `Float32Array` around `:81`).
- **Lenis** replaces Framer `useScroll` as the progress source (the tall-div ScrollRig contract is kept). Replace the camera lerp with `MathUtils.damp(dt)` plus an arc-length lookup table. Use **one primary smoother** and check it at 60 Hz and 120 Hz.
- **Shot schedule and dwell plateaus:**
  - Long holds; copy reveals only after the shot settles.
  - Continuous neighbour progress, with past beats playing their exit and future beats their entry.
  - Distance fog/opacity, and meshes stay mounted, so no pop-in.
- **Overlay rebuild:**
  - GSAP SplitText masked line reveals during the hold, a blur exit, a `07 / 31` eyebrow, a lower-third scrim (guaranteed 4.5:1) and the display font.
  - aria text = the full string.
  - Remove the inline styles and the rAF loops.
- **Chapter rail:**
  - 31 hairline ticks with a smoothed progress fill and hover/focus labels (beat headline).
  - Visible focus.
  - `lenis.scrollTo` jumps, with a starfield "warp" stretch on long jumps.
- **Deep links + keyboard:**
  - Sync the active beat to the hash (`/my-story#hera`), and restore it on load and on back.
  - J/K or arrows for the previous/next beat (focus moves to the beat heading), Esc to skip to the end card, and a "Skip story" link.
- **Pointer life:** damped camera sway (±0.3 units), idle drift at rest (pausable), and velocity FOV kick + chromatic aberration (capped).
- **PerformanceMonitor** with adaptive DPR (start at 1.5). Pass the **real** `reducedMotion` (currently hard-coded to `false`).
- **Done when:**
  - React Profiler shows 0 commits per frame while scrolling inside a beat.
  - The heap stays flat over a 30 s scroll.
  - Production p95 ≤ 16.7 ms on the MacBook.
  - The camera feels identical at 60 Hz and 120 Hz.
  - There's no textless dead zone from 0 to 1.

### Phase 4: The full flight, art pass + new beats (about 4–5 weeks, beat by beat)
- **Build the 10 new beats:** journal club, RadioSim (Jones-plate stack), HERA upstream, instruments, X-ray follow-up, reviving old code, engineer, Enrolia, off-court, admission, arrival.
- **Rebuild the old beats worst-first:**
  1. Dashboard/bars (around 0.7)
  2. Textbook
  3. Comet
  4. PaperPlane → the fftvis NUFFT grid
  5. MidnightOil (remove the day-sky teal)
  6. Walker/FocusLens (silhouette or particle figures)
  7. then the rest
- **Beat 17 Lensing** becomes a screen-space lens over the real starfield, **cursor-draggable**: the interactive science moment.
- **Environment layers:** velocity dust near the camera, baked-noise nebula slabs per act, and a far skybox reusing `sky.frag`. The per-act colour temperature drifts from cold to ember.
- **Per-beat camera direction:** orbit reveals, low-angle hero shots, pull-backs, roll into turns. Authored with a dev-only leva path editor.
- **Scientific HUD:** a mono readout per beat (the values in the narrative draft), ticking with smoothed progress.
- **Evidence chips** (arXiv/repo/merakinist/enrolia) open in a new tab, so the scroll position is kept.
- **Finale:** bookend to the photon ring → the eclipse ring aligns → pull back to reveal the 31-beat constellation → a large-type "Let's talk" end card with a magnetic CTA, CV, publications, ORCID and email.
- **3D models:** CC0 or paid models (telescope, GBT dish, HERA dish, shuttlecock, Etna terrain) converted to the made-of-light idiom (wireframe, rim, glow), compressed with Draco/meshopt and KTX2.
- **Precompile** every new material in the Phase 2 loader.
- **Done when:** the owner signs off on a contact sheet of all 31 beats as one universe; there are no `toneMapped={false}` hero meshes; p95 is ≤ 16.7 ms on the MacBook and < 33 ms on the Android with graceful tier fallback; no `useFrame` allocations.

### Phase 5: Site-wide foundation (about 1.5 weeks; can run in parallel with Phase 4, since it touches different files)
- **Dark-only tokens:**
  - OKLCH tinted near-blacks, the ember accent, a single `.glass` utility and a z-index scale.
  - Remove the `html{opacity:0}` hack and the `payload-theme` key; drop the light theme.
  - Delete the runtime-injected `<style>` blocks and the inline hover handlers.
  - A static grain overlay at about 4%.
- **Fonts:**
  - Editorial **serif display** (e.g. Instrument Serif / Fraunces, both OFL) + a quiet sans (e.g. Geist / Inter) + **JetBrains Mono** for dates, DOIs, arXiv IDs and venues.
  - Fluid `clamp()` scale; the same display font is self-hosted for troika. The owner picks between 2–3 pairings.
- **Motion system:** `src/lib/motion.ts` (easeOutExpo `[0.16,1,0.3,1]`, inOut `[0.65,0,0.35,1]`, durations 0.3/0.6/1.0, stagger 0.06), Tailwind `@theme` tokens, and `MotionConfig reducedMotion="user"`. Primitives: `Reveal`, `Stagger`, `MaskedLines`, `PageHeader` (replaces the 11 gradient h1s).
- **Lenis at the root:**
  - Remove `scroll-behavior:smooth`.
  - `data-lenis-prevent` on Cmd-K/search.
  - `lenis.stop()` while Radix overlays are open.
  - Hash-scroll on route change; back/forward restoration tested.
  - `syncTouch:false`; smoothing off under reduced motion.
- **Route transitions:** `template.tsx` (about 400 ms clip/crossfade, faster on CV and publications); ViewTransition as a spike; /my-story excluded. Delay RadioTelescopeLoader by 250 ms and replace its 150 DOM stars with CSS.
- **Navigation:**
  - A slim top bar.
  - The **fullscreen menu** with grouped big type and staggered reveals: Research · Software · Talks & Teaching · About · Contact. It traps focus, closes on Esc, pauses Lenis and sets `aria-expanded`.
  - SpotlightTerminal becomes **Cmd-K**.
  - Retire FloatingBottomNav and the path pill.
  - Nav metadata centralised in `constants/navigation.ts`.
- **Micro-interactions:** a cursor label and magnetic CTAs on desktop only (`pointer:fine`); clip-path image reveals.
- **Cookie:** a compact corner card that springs in late and never covers captions or the hero.
- **Cleanup:** remove `@mui/*`, HeaderThemeProvider, the Payload leftovers and the unused `Header/Component.client.tsx`. Fix the Footer setTimeout leak and add a passive scroll listener.
- **Done when:** inertial scroll works on every route, with anchors, find-in-page and keyboard scrolling all intact; route changes take ≤ 450 ms with no loader flash; the cookie card covers no content; visible focus everywhere; bundle smaller than baseline.

### Phase 6: Pages and content refresh (about 2 weeks, route by route)
- **Home:**
  - Oversized name and the tagline "Searching for Signals".
  - A one-line mono positioning statement (e.g. "MSc Astrophysics @ Catania · HERA / 21-cm · X-ray binaries · AI engineering").
  - Proof chips: HERA, ApJ, RASTI, GSoC ×2.
  - A treated duotone portrait with pointer parallax.
  - A **pre-rendered black-hole loop** (from capture mode on the MacBook GPU; AV1 + H.264, ≤ 3 MB, AVIF poster as LCP).
  - The **"Enter the story"** portal.
  - A bento "Selected work" grid, plus the project list as a hover index with a cursor-following thumbnail.
- **One ContentCard system** (feature/row/compact variants) with a cursor-spotlight border and blur placeholders. Used on projects, talks, posts and posters.
- **Publications:**
  - Server-rendered from `src/data`, with sticky year headers, filter chips and copy-BibTeX.
  - Correct citations: ApJ 1003, 13 (2026); RASTI 4, rzaf056 (2025); the reflection survey (arXiv:2608.15902, submitted to ApJ).
- **CV:** a sticky section rail, PDF download and a print stylesheet; updated to Catania.
- **Open source / Projects:**
  - RadioSim (fix the 404 link), hera_pspec, hera_strip, matvis (PR open), DAVE/Stingray Explorer (PRs open), RIPPLe, Enrolia (enrolia.app), Merakinist.
  - Drop the unbenchmarked fftvis speedups and soften the homelab card.
- **Talks:** add ASI 2026 (attended) and SALF XI (presented by Dr. Chandra; credit accurately).
- **About / More:** merge Hobbies, Certificates, Courses and Journal Club. Owner photos go here: treks, badminton, the Oman eclipse, Catania. Hobbies refreshed: running, calisthenics, cycling, treks.
- **Footer/contact:** Catania (city level only); a server/client split; a "Let's talk" end moment.
- **Consultancy:** link merakinist.com; no rates, no client names.
- **Done when:** a 5-second test with 3 people (each can state role, field and one project); hero LCP < 2.0 s on mobile; no spinner for static data; every route reachable in 2 interactions.

### Phase 7: Every visitor, sound and cutover (about 2 weeks)
- **SSR story article:**
  - All 31 beats as a semantic `<article>` (h2 + p) from `narrative.ts` in the server HTML, which the canvas then enhances.
  - Canonical `/my-story`, Article + Person JSON-LD, and an OG image from captured posters.
  - The spacer is `aria-hidden`.
- **Calm mode** (prefers-reduced-motion, plus a visible "Reduce effects" toggle): crossfaded framed stills with rail navigation, no drift, grain or CA. A **"Read as timeline"** link.
- **Full mobile parity, on the owner's iPhone and Android:**
  - PerformanceMonitor tiers, glow sprites instead of bloom on low tiers, halved particle counts, DPR 1–1.25, and fewer raymarch steps.
  - Use `dvh`/`lvh` units so the canvas doesn't jump when the address bar resizes.
  - Fall back from half-float to 8-bit targets.
  - Treat sustained 30 Hz (Low Power Mode) as a tier signal.
- **Robustness:**
  - Handle `webglcontextlost`/restore.
  - An ErrorBoundary around the Canvas that falls back to the SSR article plus posters.
  - A pre-flight in `tiers.ts` (`failIfMajorPerformanceCaveat`, renderer string) that sends software renderers to calm mode.
- **Opt-in audio engine** (Web Audio, muted by default, persisted across pages through GlobalAudioButton):
  - An ambient bed whose low-pass follows scroll velocity.
  - Soft beat-arrival stingers, a warp whoosh, and a sub swell at the black hole.
  - Uses the commissioned score.
- **Poster capture script:** AVIF/WebP per beat to `public/media/my-story/`, for calm mode, OG images, loader backdrops and per-beat share previews.
- **Cutover** (asks the owner first): `/my-story` → CosmicJourney3D, keeping `?legacy` for one release. Retiring `QuasarBackground`'s live use and the 3,059-line `CosmicJourney` block happens only after a clean week and the owner's OK.
- **Done when:**
  - /my-story mobile LCP < 2.5 s (the poster is the LCP element).
  - Reduced-motion and no-WebGL users get the full story.
  - No audio without an explicit toggle.
  - No 404 assets.
  - 0 console errors on all 4 devices.

**Rough total:** about 15–18 weeks part-time. **Minimum "felt" cut** if time runs short: Phases 0–3 + the Phase 5 foundation + the Phase 6 home page.

## 5. Asset list (owner / to source)

| Asset | Source | Used in |
|---|---|---|
| Portrait + photos (treks, badminton, Oman, Catania) | Owner | Home, About |
| Display serif, sans, mono | OFL (Google Fonts / self-host) | Site + troika |
| 3D models (telescopes, GBT/HERA dishes, shuttlecock, Etna DEM) | CC0 (Poly Haven, NASA 3D, Sketchfab CC0) or paid; logged in the license ledger | Phase 4 |
| Ambient score + SFX stems | Commissioned or licensed (redistribution rights confirmed) | Phase 7 |
| Black-hole home loop + beat posters | Captured on the owner's GPU via capture mode | Phases 6–7 |
| Noise textures, glow sprites, LUT | Baked by `scripts/bake-*.ts`; LUT graded in DaVinci Resolve (free) | Phases 1, 4 |

## 6. Manual check (end of every phase)
1. `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`: all clean.
2. **Production build** (`pnpm build && pnpm start`), not dev mode, for any perf judgment.
3. On the **MacBook**: walk the whole flight (or the touched routes); capture-mode screenshots at the 12 baseline positions; Chrome Performance p95 frame time; React Profiler commits while scrolling; console clean.
4. On the **iPhone (Safari)** and **Android (Chrome)**: the full flight, scroll feel, address-bar behaviour, no context loss, readable text.
5. On the **Ubuntu PC**: a second GPU/driver and a Firefox pass.
6. Accessibility: keyboard-only pass; VoiceOver on the story (each beat read once); `prefers-reduced-motion` on; 200% zoom.
7. Content: no private data per the privacy rules; every number on the page is sourced.

## 7. Risks and mitigations
- **"Visual first" before the engine pass** means old beats stay janky until Phase 3. Mitigation: the minimal store and adapter land in Phase 1, and all new art uses the new API.
- **Double smoothing** (Lenis + damp) can feel floaty. Mitigation: one primary smoother, checked at 60 Hz and 120 Hz.
- **Merging the raymarch into the shared Canvas** changes tone mapping and sRGB. Mitigation: re-grade side by side with `?legacyPrologue`.
- **Phase 4 scope creep** across 31 beats. Mitigation: the reference-beat sign-off, worst-first ordering, and a timebox per beat.
- **Mobile full parity** risks thermal throttling and iOS memory limits. Mitigation: PerformanceMonitor, a real-device check each phase, and the calm fallback.
- **Photosensitivity:** bloom swell ramps only, no flashes; calm mode removes velocity effects.
- **Lenis conflicts** with Radix scroll locks, hash links and back/forward restoration. Mitigation: the Phase 5 compatibility checklist.
- **Privacy:** story and site content comes from private notes. Mitigation: the privacy rules in the narrative draft, and the owner approves every line.
- **Font, model and audio licensing:** OFL/CC0-first, with a license ledger.

## 8. Next step
The owner reviews `docs/superpowers/specs/2026-10-28-my-story-narrative-v2-draft.md`. Once it is approved, Phase 0 starts. A detailed task-level plan is written per phase as each phase begins, like the earlier phase plans in this folder.
