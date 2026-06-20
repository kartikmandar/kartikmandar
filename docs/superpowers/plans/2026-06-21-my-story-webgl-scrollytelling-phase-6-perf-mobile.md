# My-Story WebGL Scrollytelling — Phase 6 (Perf / Mobile / Posters) Plan

**Goal:** Cut idle/background cost, make the experience mobile-safe, and remove the latent poster 404 — without touching the 21 beat scenes (their deeper per-frame perf refactor is deferred to pair with the visual-polish phase, since both edit the scenes).

## Global Constraints
- Non-destructive; existing `/my-story` route + `CosmicJourney/Component.tsx` + `QuasarBackground/engine` untouched.
- 2-space indent; conventional commits; NO Claude co-authorship line; tsc + lint clean; runtime-verified (0 console errors).

## Items (this round)

1. **Visibility-gated frameloop** — `index.tsx`: the R3F `<Canvas>` runs `frameloop="always"` only while the page is visible; switch to `"never"` when `document.hidden` OR the scroll container is not intersecting the viewport (IntersectionObserver). On resume, `invalidate()` once. This stops the flight rendering when the tab is backgrounded or the journey is scrolled away (the old build's "renders forever" cost). Also skip the prologue's render work when `document.hidden` in `HeroPrologue.tsx`'s rAF loop.

2. **Mobile prologue gate** — `index.tsx`: when `quality === 'mobile'`, do not mount the fullscreen geodesic raymarch prologue (`PrologueLayer`) — it is far too heavy for phones. The flight still plays (the origin black-hole 3D object covers the start) and the hero phase copy still shows over it via the Overlay. Confirm `Environment` already drops postprocessing + particle counts on mobile (Phase 0) and the Canvas `dpr` is capped (`[1, 1.5]` off-high).

3. **Graceful poster fallback** — `Fallback.tsx`: the reduced-motion experience references `/media/my-story/<id>.jpg` posters that don't exist (latent 404 / broken images). Replace the `next/image` poster with a CSS cosmic-gradient placeholder until real GPU-captured posters exist. Removes the 404 cleanly without committing low-fi assets.

## Deferred (pair with the visual-polish phase — both edit scenes)
- **Per-frame perf refactor of the scenes:** several scenes rebuild `Float32Array` buffers in `useMemo([…, clock/localProgress])` every frame; convert to imperative in-place attribute mutation in each scene's own `useFrame`, and drive the shared clock + active-scene `localProgress` via refs so `SceneHost` stops the per-frame React re-render.
- **Real poster stills + `public/media/quasar-poster.jpg`:** must be captured on a real GPU (headless software-WebGL renders the raymarch black hole black and under-renders the scenes). Generate during the GPU/polish phase.

## Verify
`pnpm exec tsc --noEmit` (0) · `pnpm lint` (0) · `pnpm test` (105) · headless runtime check (0 console errors; tab-hidden pause observable via frameloop). Then commit.
