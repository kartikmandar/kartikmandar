# My-Story WebGL Scrollytelling — Phase 2 (Volumetric Scenes) Plan

> Executed via a parallel scene-building Workflow + controller integration/verification, not bite-sized TDD (the deliverables are visual R3F components, not unit-testable logic).

**Goal:** Replace the 20 `UnbuiltBeatMarker` placeholders with faithful volumetric 3D scenes — one per beat — each a 3D reinterpretation of the original 2D `drawX` function in `src/blocks/CosmicJourney/Component.tsx`, satisfying that beat's `acceptance[]` checklist in `beatsMeta.ts`.

**Architecture:** Each scene is a self-contained `React.FC<SceneProps>` under `scenes/`, registered in `registry.tsx`'s `SCENES` map. Scenes are pure R3F primitives driven by `localProgress` (0→1 across the beat) + the shared `clock`. The `constellation-section` scene (Phase 0) is the reference pattern.

## Global Constraints

- **Narrative unchanged** — scenes are visual only; all copy stays in `narrative.ts`.
- **Faithful to the original** — each scene reproduces its source draw function's metaphor and beats (the `acceptance[]` list is the checklist). Reading the original `drawX` in `CosmicJourney/Component.tsx` is required.
- **Constrained R3F vocabulary** (keeps tsc/lint clean under strict + `noUncheckedIndexedAccess`): `<mesh>`, `<group>`, geometry primitives (`sphereGeometry`/`boxGeometry`/`torusGeometry`/`ringGeometry`/`coneGeometry`/`planeGeometry`/`icosahedronGeometry`), `<lineSegments>`/`<line>` with `<bufferGeometry>` + `<bufferAttribute attach="attributes-position" args={[Float32Array, 3]}>`, `<points>` + `<pointsMaterial vertexColors>`, `<meshBasicMaterial>`/`<lineBasicMaterial>` (with `transparent`/`opacity`/`toneMapped={false}`), `useFrame` reading the passed `clock` (never `Date.now()`), `useMemo` for buffers, drei `<Text>` for any in-scene labels. Index access uses `!`/guards. No new dependencies.
- **One time base** (the `clock` prop); animate `localProgress`-driven state; `reducedMotion` should hold motion.
- Non-destructive; 2-space indent; conventional commits; **NO Claude co-authorship line**; tsc + lint clean; runtime-verified (canvas mounts, scene visible, 0 console errors). Visual fidelity/polish is owner-driven follow-up.

## Scene list (beat id → original draw fn → scene file → metaphor)

| Beat id | Original draw fn | Scene file | Metaphor |
|---|---|---|---|
| nao-section | drawPageToCosmos | Beat_Textbook | 2D outline planets lift off a textbook page and become 3D spheres |
| comet-section | drawBuildAComet | Beat_Comet | particles accrete to a nucleus; coma + dust + ion tails near the sun |
| decision-section | drawFocusingLens | Beat_FocusLens | vignette tunnel; astronomer + telescope sharpen into focus |
| new-system-section | drawVirtualNetwork | Beat_Network | central node connects to academic/code nodes one by one |
| fixation-section | drawUnwaveringCompass | Beat_Compass | compass needle swings from N, locks onto a growing Physics star |
| slingshot-section | drawSlingshot | Beat_Slingshot | planet orbits a yellow sun → transfer → wider orbit of a blue sun |
| lens-section | drawMajorChoiceLens | Beat_MajorLens | focus sweeps Maths/Physics/Data-Sci orbs; focus ring expands |
| internship-section | drawInternshipPathways | Beat_DualPaths | two diverging paths → phone (EECS) + DNA helix (iGEM) |
| injury-section | drawShatteringShuttlecock | Beat_Shuttlecock | shuttlecock rises, cracks, shatters into falling shards |
| rri-research-section | drawSignalToSimulation | Beat_SignalToSim | radio dishes + baselines; noisy curve resolves to RRIViz sine |
| gsoc-section | drawBuildingDashboard | Beat_Dashboard | dashboard assembles: wireframe → panels → plots |
| radio-section | drawRadioInterferometry | Beat_Visibility | axes LST × Visibility; green visibility curve draws in |
| doubling-down-section | drawBurningMidnightOil | Beat_MidnightOil | day→night sky; College bar fades, RRIViz bar glows |
| bs-exit-section | drawDivergingPaths | Beat_ExitFork | fork: BS-MS ghost dashed up, yellow BS-Exit branch, traveler takes it |
| lensing-section | initGravitationalLensing | Beat_Lensing | **port the existing GLSL lens shader** onto an R3F plane; lens warps a galaxy field, Einstein ring grows/shrinks |
| publication-section | drawPublicationFlight | Beat_PaperPlane | paper (arXiv:2506.02130 / fftvis) folds to a plane, trails split to two stars |
| cygnus-publication-section | drawPublicationJourney | Beat_Milestones | dashed milestone path: NuSTAR/Data/Analysis/Results/Paper/ZTF + traveling particles |
| analysis-section | drawCelestialWorkbench | Beat_Workbench | Cygnus black hole + rings; RRIViz grid; crystal absorbs LaTeX symbols |
| journey-continues-section | drawJourneyContinues | Beat_Walker | walker ascends a narrowing star path into a growing nebula |
| search-section-wrapper | (React typing) | Beat_Search | a glowing 3D terminal panel; the typed phrases ('DU > Hansraj College...', 'IISERs...', 'IISER Bhopal') shown via drei `<Text>` cycling, caret turns green on the last |

## Execution

1. **Build (Workflow):** fan out scene-builder agents (batched ~6 at a time), each reads its original `drawX` in `CosmicJourney/Component.tsx` + its `acceptance[]` and writes `scenes/<file>.tsx` following the constrained vocabulary and the `Beat_Constellation` pattern. Special cases: `Beat_Lensing` ports the existing `ShaderMaterial` from `initGravitationalLensing` onto an R3F `<mesh>` with a `shaderMaterial`; `Beat_Search` uses drei `<Text>`.
2. **Integrate (controller):** register every scene in `registry.tsx`'s `SCENES` map.
3. **Verify (controller):** `pnpm exec tsc --noEmit` + `pnpm lint` (fix strict-typing issues; dispatch a cleanup agent if many) + `pnpm test` (still green) + headless runtime check (each scene's beat mounts a canvas with 0 console errors, scroll lands on several scenes without errors).
4. **Commit** per batch; **hand off** visual fidelity/polish to the site owner.

## Out of scope (later phases)
- Per-scene visual polish, lighting, materials richness (owner-driven, Phase 2 follow-up).
- Phase 6 (ref-based clock/demand-frameloop, mobile tiers, poster stills) and Phase 7 (a11y, route swap).
