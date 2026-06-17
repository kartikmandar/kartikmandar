# Procedural Sky Background — Design

- **Date:** 2026-06-12
- **Scope:** `src/components/QuasarBackground/engine/` background only
- **Replaces:** `addBackgroundStars` (1,400 uniform points), `addBackgroundGalaxies`
  (12 Canvas2D polyline-spiral sprites), `createGalaxyTexture`
- **Builds on:** `docs/superpowers/specs/2026-06-11-quasar-realism-design.md`

## Context

Both render tiers of the /my-story hero share `engine/background.ts`. The
raymarched tier bakes its scene once into a 1024 cubemap that escaped geodesic
rays sample (so the background lenses); the mesh tier adds the same points and
sprites live to its scene.

Problems: every star has the same size and near-identical brightness (no
luminosity function — the "salt on black paper" tell); there is no Milky Way
band, so the sky has no structure or axis; the 12 galaxies subtend 5–16° each
(Andromeda, the largest real one, is ~3°) and their textures are jittered
polylines that read as wiggly doodles; sprites billboard, so galaxies never
show inclination as the camera orbits; star colors sit in one warm hue band
instead of a blackbody population; the sky re-randomizes every page load.

## Goals

- A sky that reads as a long-exposure astrophoto: power-law star magnitudes,
  blackbody tints, a structured Milky Way with dust lanes, small physical
  galaxies, one art-directed hero galaxy.
- One sky implementation for both tiers, baked once, zero per-frame cost.
- Fixed seed: identical sky every visit; screenshots are reproducible.
- No new assets, no new runtime dependencies.

## Non-goals

- Real star-catalog data (Yale BSC constellations) — a possible later
  increment on top of this design.
- Animated sky (twinkle is atmospheric; a static sky is physically right in
  space and keeps bake-once valid).
- Changing the lensing march, phase machine, bloom constants, or tier
  selection.

## Architecture

```
engine/
  shaders/sky.frag.ts    NEW: pure function (view direction -> HDR color);
                         all layers below, driven by SKY_SEED + const arrays
  background.ts          REWRITE: bakeBackgroundCubemap(renderer, opts) only —
                         renders an inward-facing sphere carrying the sky
                         shader through the existing CubeCamera into the
                         WebGLCubeRenderTarget, once at init
  RaymarchedRenderer.ts  unchanged flow; passes desktop bake opts
  MeshRenderer.ts        drops live points/sprites; bakes the same cubemap and
                         sets scene.background = cubemap.texture
```

`addBackgroundStars`, `addBackgroundGalaxies`, `createGalaxyTexture`, the
`BackgroundHandle` interface, and `MeshRenderer.backgrounds` are deleted, along
with their unit tests. The mesh tier gets cheaper at runtime (no 1,400-point +
12-sprite draws per frame).

**Bake options:** `{ size = 1024, type }`. Desktop requests `HalfFloatType`
(≈48 MB GPU) so star cores brighter than 1.0 feed UnrealBloom; gated on
`renderer.capabilities.isWebGL2 && renderer.extensions.has('EXT_color_buffer_float')`,
falling back to `UnsignedByteType`. The mesh tier uses `UnsignedByteType`
(≈24 MB, same as today). No mipmaps (status quo — implicit-derivative mip
selection inside the divergent march loop is unsafe); stars instead get a
PSF ≥2 texels wide so they survive bilinear sampling and lensing distortion.

## Sky shader layers

All layers are summed in HDR within one fragment shader, reusing the existing
`GLSL_NOISE` (`hash13`/`vnoise`/`fbm`) and `GLSL_BLACKBODY` chunks. A single
`SKY_SEED` constant folds into every hash; hero stars and galaxies are TS
const arrays injected via the template literal so they are hand-tunable.

1. **Faint star field.** 3–4 octave layers of 3D cell-hashed stars: scale the
   direction by the layer frequency, each cell hosts ≤1 star at a hashed
   sub-cell direction, search the 27 neighbor cells (bake-once, so the cost is
   acceptable). Frequency doubles and base flux quarters per octave, with
   per-star `pow(hash, 3.0)` flux jitter — compounding into the power-law
   magnitude distribution. Effective count ~8–10k. Per-star temperature maps
   through `blackbody()` then desaturates 65% toward white (tints, not candy).
   PSF: gaussian core, sigma ≥2 texels at the bake resolution.
2. **Hero stars.** ~12 explicit entries (direction, flux 1.5–4.0, temperature)
   in a TS const array. These add a wide low halo term and subtle 4-point
   diffraction spikes (two perpendicular line gaussians in a fixed sky frame),
   and their HDR cores bloom gently through the existing pass (threshold 0.85).
3. **Milky Way band.** A fixed galactic frame (rotation matrix tilted ~50°
   from the accretion-disk plane, oriented so the band crosses a corner of the
   default view). Glow = gaussian falloff in galactic latitude × multi-octave
   `fbm` along longitude, with a brighter, vertically wider bulge at one
   chosen longitude; warm core color, cooler blue-grey fringe. Realism keys:
   **multiplicative dust extinction** — a second, band-stretched fbm field
   that darkens and reddens the glow along the mid-plane — and a 2–4× boost to
   faint-star cell probability inside the band. Band glow stays below ~0.5 so
   it never blooms.
4. **Faint galaxy field.** One sparse low-frequency cell layer: ~40–60
   smudges, 0.1–0.5° apparent size. Hashed type: elliptical → soft Sérsic
   blob; spiral → inclined ellipse (random 3D orientation projected to a 2D
   frame around the galaxy direction) with a faint `cos(2θ − k·ln r)` arm
   hint; near-edge-on → thin streak with a dark mid-line. All well below the
   bloom threshold.
5. **Hero galaxy + companions.** One Andromeda-like spiral, ~3°, inclined
   ~70°, placed off-band and off-disk-axis: Sérsic bulge + log-spiral arm
   density × fbm clumping + dust lane on the near side + warm-bulge→blue-arm
   color gradient + faint outer halo, with a tiny elliptical companion dot.
   One LMC-style irregular fbm smudge elsewhere for sky asymmetry.
6. **Floor.** ~0.005-luminance blue-grey large-scale fbm tint plus fine hash
   dither, so the dark sky doesn't band at 8 bits on the mesh tier.

## What stays the same

Phase machine, phase/uniform flow in both renderers, lensing march, bloom
constants, tier selection and demotion ladder, OrbitControls. The
escape-direction quantization near the photon ring (`dphi = 0.12` far-field
step in `blackhole.frag.ts`) is accepted for now; if the sharper stars make it
visible, shrinking that step is a separate follow-up.

## Error handling

- `EXT_color_buffer_float` missing → fall back to `UnsignedByteType` (stars
  clamp at 1.0; the brightest still clear the 0.85 bloom threshold).
- Sky shader compile failure → Three logs and the cubemap renders black; the
  scene remains functional (foreground narrative unaffected). The shader is
  far simpler than `blackhole.frag`, and the existing demotion ladder already
  covers the main-shader risk, so no extra ladder rung is added.
- Bake cost is one-time at init, before the benchmark warm-up. If mobile init
  is slow, the mesh-tier bake drops to 3 star octaves (tunable constant).

## Testing

- Vitest (TS side): bake option/HalfFloat-fallback selection, exported
  seed/hero-array shape, disposal still frees the render target; remove tests
  for the deleted star/galaxy functions.
- Visual (manual): fixed seed makes before/after screenshots comparable.
  Verify via `?quality=high|low` and `?debug=fps`; the window must be
  foregrounded for rAF to run (occluded Chrome suspends it). Checks: Einstein
  ring warps the Milky Way band around the shadow; star brightness hierarchy
  reads; hero galaxy doesn't compete with the disk; no banding in dark sky on
  the mesh tier.

## Risks

- The procedural hero galaxy is the most likely layer to look synthetic and
  need tuning iterations. Mitigation: it is one isolated shader function with
  hand-tunable constants, and the Milky Way + faint field carry the scene even
  if the hero ends up shrunk or cut.
- 27-cell × 4-octave star search makes the bake shader heavy; acceptable
  because it runs once per init, but mobile constants must stay tunable.

## Decisions log

- Approach: fully procedural shader bake (over star-catalog hybrid, real HDRI
  asset, or polishing existing primitives) — zero assets, unifies tiers,
  deletes the Canvas2D path.
- Aesthetic: astrophoto (halos + subtle diffraction spikes on heroes), not
  naked-eye austerity.
- Seed: fixed; sky identical every visit.
- Galaxies: 1–2 art-directed heroes plus a faint field, not faint-only.
