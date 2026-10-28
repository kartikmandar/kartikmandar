# Wow Redesign: Phase 1 (Look-dev and Reference Beats)

Phase 1 of `2026-10-28-site-wow-redesign-plan.md`. Built 2026-10-28. **Awaiting owner sign-off on the 3 reference beats.**

## Engine core (minimal, so new art never needs reworking)
- **`store.ts`**: one per-frame `journeyFrame` (raw/flight progress, shared clock, dt, active index, and a continuous per-beat `local` progress).
  - `JourneyDriver` (in `index.tsx`) writes it once per frame via R3F `addEffect`, before any `useFrame`.
  - The active beat goes through a zustand store, so React re-renders only when the beat changes.
- **`useBeat(i)`**: a per-frame view for Phase 1+ scenes (`local`, `clock`, `dt`, `near`). Read it inside `useFrame` only.
- **New scene API:** `BeatSceneProps { index, quality, reducedMotion }`, registered in `registry.tsx` → `BEAT_SCENES`.
- **Legacy adapter:** `LegacyBeat` keeps the old prop-API scenes working. Only on-screen beats (active ±1) re-render, instead of all 31 every frame. The full migration is Phase 3.
- **`setClock` removed from `SceneHost`.**
- **Camera fix (`cameraPath.ts` → `flightCurveT`, plus tests):**
  - The spline has 33 control points (origin, 31 stations, nebula), but the camera was sampled with arc-length `getPointAt` against a station count that ignored the origin and nebula. With 31 beats, that parked the camera between stations, so the previous beat crowded the frame.
  - The camera now uses `getPoint(k / (n + 1))`, which lands exactly on each station at its beat's centre. This improves framing for every beat, legacy ones included.

## Art bible and kit (`art/`)
- **`palette.ts`**: tokens for void, ember, signal, starGold, nearWhite, hydrogen and stellarBlue; a per-act grade drifting cold → ember; `GLOW` levels (dim/base/hero/hot; bloom catches only values above ~1); `hdr()` and the allocation-free `setHdr()`.
- **`materials.ts`**:
  - `createRimMaterial`: fresnel rim-lit body, instancing-aware, with optional per-instance reveal.
  - `createHoloMaterial`: glass panel for flat infographics, used from Phase 4.
  - `getGlowTexture`: shared soft radial falloff.
  - `useDisposable`, and `setUniform`, which drives uniforms through object refs to satisfy the React compiler lint.
- **`GlowSprite`**: additive camera-facing glow; replaces stacked transparent spheres.
- **`LightLine`**: fat world-unit hairlines (drei `Line`), with allocation-free `setLineReveal` (draw-on via `instanceCount`) and `setLineOpacity`.
- **`Label`**: tracked uppercase mono in the self-hosted JetBrains Mono (`public/fonts`, OFL; the license is alongside it).
  - The latin subset has no arrows or Greek, so labels stay ASCII plus "·". Otherwise troika would fetch fallback fonts from a CDN.
  - Arrows belong in light-lines or the DOM HUD.
- **`anim.ts`**: `ramp`, `ease` (smootherstep), `pulse`, `easeInCubic` and a deterministic `seeded()`.
- **`glsl.ts`**: shared noise/fbm (credited to Dave Hoskins' MIT hash) and an instancing transform.

## Post stack (`Environment.tsx`)
- **Bloom:** threshold 0.85 with mipmapBlur, so only HDR emissives glow. Previously the threshold of 0.2 bloomed everything into a haze.
- **AgX** tone mapping, applied once in the post `ToneMapping` effect. The renderer also uses AgX for the mobile tier, which has no composer.
- **SMAA** with `multisampling={0}`.
- **Grain:** 3.5% soft-light film grain.
- **Fog:** `FogExp2` matched to the background, so stations emerge and dissolve.
- **Vignette:** moved from a GPU pass to a CSS radial overlay.
- **Nebula points:** now use the soft glow texture instead of hard squares.
- **Dependencies:** `postprocessing@6.39.1` is now a direct dependency (the same version that was already installed transitively), and `@fontsource/jetbrains-mono@5.3.0` is a dev dependency (the source of the woff).

## Reference beats
| Beat | Scene | What it does |
|---|---|---|
| 11 · Captaincy and Injury | `scenes/Beat_SmashToCoach.tsx` | A light-built shuttlecock (rim-lit cork with a hairline skirt) smashes steeply over a hairline court, leaving a gold trail ("CAPTAIN"). It trembles at impact under a gentle glow swell rather than a flash. Then 24 shards burst, with drag and gravity, and drift back to settle as markers along a slower dashed coaching arc in chalk-cyan ("COACH"). |
| 12 · First Foray into Research | `scenes/Beat_HeraArray.tsx` | A 61-dish hex-packed array (zenith-pointing, as HERA is) lights up from the core outward over a fine Karoo grid. Baselines draw between dish pairs. On a sky dome in direction-cosine space, three baseline fringe patterns sweep across with Earth rotation, over faint red 21-cm haze, and fringe × haze glows where the array "samples" the signal. |
| 19 · Cygnus X-1 in ApJ | `scenes/Beat_CygnusX1.tsx` | HDE 226868 (a rim-lit blue supergiant) feeds a GPU particle stream into a turbulent accretion disk: T ∝ r^-3/4, Keplerian shear, a Doppler-boosted side and a hot inner rim. The inner edge slides from 5.5 to 2.0 Rg (a live label ticks the value) while the hard-state corona flickers and fades. Photon ring and shadow at the centre. |

None of the three allocate inside `useFrame` (checked statically). The Cygnus label string is rebuilt only when the displayed tenth changes.

## Review links (production build: `prod` entry in `.claude/launch.json`)
- Beat 11: `http://localhost:3000/my-story/preview?capture=1&p=0.4825&t=4&ui=0`
- Beat 12: `http://localhost:3000/my-story/preview?capture=1&p=0.507&t=4&ui=0`
- Beat 19: `http://localhost:3000/my-story/preview?capture=1&p=0.6787&t=4&ui=0`
- Live scroll: `http://localhost:3000/my-story/preview?perf`. Drop `capture` to see each beat animate, and scroll through a beat to see its full choreography (progress 0 → 1).

## Known issues and notes
- The in-app browser pane was hidden for most of this session, so only beat 11 was reviewed visually after the framing fix. Beats 12 and 19 compile, render without errors and pass every check, but have not been eyeballed since their last tuning pass. **The owner review is the real gate.**
- The old beats now render through AgX with a 0.85 bloom threshold, so many look dimmer and less glowy than before. That is expected: they are rebuilt in this idiom in Phase 4.
- Console `Uncaught SyntaxError: Unexpected token '<'` appears only after analytics consent: the Vercel/PostHog scripts get HTML from localhost. This existed before Phase 1 and is a Phase 5 cleanup item.
