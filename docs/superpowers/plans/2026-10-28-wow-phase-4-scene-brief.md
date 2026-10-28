# Phase 4 Scene Brief ("made of light")

Read this brief in full before building any beat scene. The owner has signed off three reference beats, and every scene must look like it belongs with them:
- `src/components/CosmicJourney3D/scenes/Beat_HeraArray.tsx`
- `scenes/Beat_CygnusX1.tsx`
- `scenes/Beat_SmashToCoach.tsx`

Study those three files first.

## Where things live
- Repo: `/Users/kartikmandar/MacProjects/kartikmandar`, a Next.js 16 / React 19 app using @react-three/fiber 9, drei 10.7 and three 0.183.
- Scene files: `src/components/CosmicJourney3D/scenes/`. **Write only the scene files you are assigned.** Do not edit the registry, the art kit, the store, or anything else. The lead wires and registers the scenes.
- Story copy, with each beat's text, HUD and act: `src/components/CosmicJourney3D/narrative.ts`.
- Scene ideas and acceptance notes:
  - `docs/superpowers/specs/2026-10-28-my-story-narrative-v2-draft.md` (field "Scene")
  - `src/components/CosmicJourney3D/beatsMeta.ts` (field "acceptance")

## The scene contract
```tsx
'use client'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'
export default function Beat_X({ index, quality, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  useFrame(() => {
    if (!beat.near) return
    const p = beat.local   // 0..1 through the beat's scroll range
    const t = beat.clock   // seconds, shared clock
    // mutate refs / uniforms / buffers here
  })
  return <group>...</group>
}
```

### Timing
The camera follows a shot schedule:
- **Arrive:** `p` 0 → 0.15, flying in from the previous beat.
- **Hold:** `p` 0.15 → 0.85. The camera sits still at its station.
- **Depart:** `p` 0.85 → 1.

The beat's text overlay is visible only from 0.16 to 0.84. Put the scene's main action and its reveal inside the hold (roughly `ease(p, 0.15, 0.6)` for the build-up), and let the scene keep living on the clock. Use the departure for the exit beat or the hand-off. Everything must also look right at a fixed `p` with `t` frozen, because capture mode stills frames.

### Framing
- The scene is mounted at its station. The camera holds at local `(0, 1.5, 7)` with a 60° vertical FOV, looking at local `(0, 0, 0)`.
- The usable stage is about **x ∈ [-4.5, 4.5], y ∈ [-1.2, 3.6], z ∈ [-5, 1.5]**.
- The bottom ~35% of the screen is covered by the text scrim, so keep the hero subject above y ≈ -1.0 at z = 0.
- Do not put anything closer than z = 2.5: it would clip the camera or loom.
- Neighbouring stations are 8 units away in −z and alternate in x, and the fog (`FogExp2` 0.045) dissolves them.

## Art bible (mandatory)
- **Idiom.** Everything is made of light on a near-black void:
  - luminous hairlines (`LightLine`, world-unit widths 0.008–0.04)
  - rim-lit bodies (`createRimMaterial`: dim base, HDR fresnel rim)
  - soft additive glows (`GlowSprite`)
  - particles with the shared glow texture (`getGlowTexture()`)
  - custom shaders that are additive and HDR
  - holographic glass panels for flat infographics (`createHoloMaterial`)

  Do not use `meshBasicMaterial toneMapped={false}` hero meshes, flat opaque saturated fills, `MeshStandardMaterial` plastic, or default troika labels.
- **Palette.** Use only `PALETTE` from `art/palette.ts`: void, ember, emberDeep, signal, starGold, nearWhite, hydrogen, stellarBlue. Use the beat's act from `narrative.ts`, and lean on `ACT_GRADE[act].accent` as the dominant accent:
  - Act I (spark) stellarBlue
  - Act II (course-correction) signal
  - Act III (ignition) signal plus starGold
  - Act IV (widening) starGold
  - Act V (catania) ember

  Ember is precious: keep it for the hottest or most meaningful element.
- **Brightness** comes from `GLOW` (dim 0.35, base 0.9, hero 2.2, hot 4.5) through `hdr(color, level)`. Bloom catches only values above ~1 (threshold 0.85), so most structure sits at base or dim, and only one or two focal elements per shot reach hero or hot. If everything glows, nothing does.
- **Labels.** At most 1–3 per scene, via `<Label>` from `art/Label.tsx`: ASCII plus "·" only (no arrows, Greek or symbols). The latin font subset lacks those glyphs, and missing glyphs make troika fetch fonts from a CDN. Labels are quiet captions; the story text lives in the DOM overlay, so never repeat the beat's prose in 3D. Draw arrows as `LightLine`s.
- **Reveal and draw-on:** `setLineReveal(ref.current, p)` and `setLineOpacity`, `setUniform(ref.current, 'uX', v)`, and `ease` / `ramp` / `pulse` / `seeded` from `art/anim.ts`.
- **Motion** is calm and confident: slow drifts, eased reveals, no jitter. If `reducedMotion` is true, freeze ambient clock motion (scroll-driven reveals stay).
- **No photos, logos or brand marks.** Represent institutions abstractly. HERA, the GBT and similar instruments may appear as recognisable instrument shapes made of light.

## Engineering rules (mandatory; the lint and the owner will check)
1. **No React re-render per frame.** Read `beat.local`, `beat.clock` and `beat.near` only inside `useFrame`, and early-return when `!beat.near`. No `setState` in `useFrame`.
2. **No allocation inside `useFrame`.** That means no `new`, array literals, spread, map, filter or clone. Pre-allocate with `useMemo` or `useDisposable`, or use module-level scratch objects, and mutate in place. For buffer changes, set `attribute.needsUpdate = true` and use `setDrawRange`.
3. **React compiler lint.** You may not mutate hook-returned values (results of `useMemo`, `useDisposable` or `useThree`) or props. Mutate through `ref.current`: `setUniform(meshRef.current, ...)`, `(ref.current.material as THREE.ShaderMaterial).uniforms...`. Don't read refs during render. Module-level scratch objects are fine. To mutate a camera, take it from `useFrame`'s state argument.
4. **Materials and geometries** you create with `new` go through `useDisposable` (from `art/materials.ts`), which disposes on unmount.
5. **Performance:**
   - Keep each scene under about 60 draw calls; use instancing for repeated meshes.
   - Particle counts: about 400 on high, half on `quality === 'low'`, and a quarter on `'mobile'`.
   - Avoid heavy fullscreen shaders; shader planes should be no bigger than they need to be.
   - Custom `ShaderMaterial`s should be additive with `depthWrite: false` and `fog: false` unless you include the fog chunks.
6. **Determinism:** use `seeded(i, channel)`. Never call `Math.random()`.
7. **Checks:** from the repo root, `pnpm exec tsc --noEmit` and `pnpm exec eslint <your files>` must be clean for your files. tsc errors in files you don't own may come from other agents mid-edit.
8. Don't use the in-app browser: several agents run at once. Don't commit.

## Your final message
For each file, give:
- one paragraph on the shot (what the viewer sees at arrive, hold and depart);
- the main elements and their colours and glow levels;
- the draw-call and particle budget;
- anything you were unsure about.
