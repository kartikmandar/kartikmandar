# /my-story Opening: a Star's Life Cycle, Steered by the Visitor

**Status:** draft for the owner's review, 2026-11-04. Nothing is built yet. Decisions in §9 need answers before Phase 1.

**Goal:** replace the supernova → black hole prologue with a star's life cycle. The visitor watches a cloud collapse into a protostar with a disk, jets and forming planets, chooses how much mass the star gathers, and follows that star's life and ending. Every path then settles into a quiet night sky, and the existing story starts at beat 1, "The Spark: NAO".

---

## 1. What the black hole opening touches today

Mapped from the code on `main` at `513c477`.

| Area | Files | What changes |
|---|---|---|
| Prologue pass | `ProloguePass.tsx`, `prologueDive.ts`, `prologuePhase.ts` | Removed. |
| Scroll split | `prologueScroll.ts` (`PROLOGUE_FRACTION` 0.22, `CROSSFADE_BAND` 0.04, `splitProgress`, `flightStart`, `pageScrollVh`) | Kept as the mechanism, renamed to the opening, with new fractions (§5). |
| Origin black hole | `scenes/OriginBlackHole.tsx`, `ORIGIN_BLACK_HOLE` in `beatsMeta.ts`, mounted in `index.tsx` `SceneHost` | Removed from the start of the flight. Its impostor technique is reused for the black hole ending only (§7). |
| Per-frame state | `store.ts` (`prologue`, `crossfade`, `covered`), `index.tsx` `JourneyDriver` | `prologue` becomes `opening`; adds the chosen path. `covered` goes: the new opening is ordinary scene geometry, not a full-screen cover. |
| Sky hiding | `Environment.tsx`, `CoverAware.tsx` | `CoverAware` no longer needed for the opening. The opening uses its own sky density (§6). |
| Copy | `narrative.ts` `HERO_PHASES`, `Overlay.tsx` `HERO_LINE`, `overlayView.ts` `inPrologue` | Replaced by the opening's lines (§8), shown by opening phase and path. |
| Keyboard and links | `JourneyNav.tsx` (`inPrologue` = `flight <= 0`), `navigation.ts` | Kept. J from the opening still jumps to beat 1. Adds the path query (§9.6). |
| Calm mode | `calmSteps.ts` (step 0 uses `/media/home/blackhole-poster.avif` and `HERO_PHASES`), `CalmStory.tsx` | New opening steps and a choice step (§10). |
| Article | `StoryArticle.tsx` (renders `HERO_PHASES`) | New opening section listing every path briefly (§10). |
| Sound | `soundMix.ts` `subGain` from `crossfade`, `StorySound.tsx` | Sub swell moves to the path's ending event (§10). |
| Loader | `LoaderView.tsx`, `JourneyLoader.tsx`, `loader.ts` | The point of light "ignites into the prologue's star". Now it fades into the cloud instead. **Correction to the brief:** `loader-backdrop.webp` is stars only (checked by eye, and `2026-11-02-wow-phase-7-cutover.md` says so), so it can stay. |
| Finale | `scenes/Beat_Finale.tsx` (bubbles tighten into "the photon ring the story opened on"), its acceptance notes in `beatsMeta.ts`, and the Eclipse beat's note "rhymes with the opening photon ring" | New rhyme (§10). |
| Capture | `capture.ts`, `scripts/capture-posters.mjs`, `scripts/encode-posters.mjs`, `window.__storyBeats` | Adds opening positions and a `star=` parameter for per-path posters. |
| Shaders | `QuasarBackground/engine/` | Importers are only `ProloguePass`, `OriginBlackHole`, `prologuePhase` and `Overlay` (for `Phase`). The home page uses a pre-rendered video and poster, not these shaders. Keep `blackhole.frag` for the black hole ending and for re-rendering the home loop; delete only what nothing imports afterwards. |
| Tests | `prologuePhase`, `prologueDive`, `prologueScroll`, `narrative` snapshot, `storyArticle`, `soundMix`, `posters` | Updated or replaced alongside each phase. |
| Home | `Home/HeroLoop.tsx` (black hole video), `Home/StoryPortal.tsx` ("a photon-ring link") | **Not touched.** Question for the owner in §9.8. |

## 2. Measured starting point

From `registry.tsx` and `prologueScroll.ts` (computed in a scratch test, not by hand):

- Beats total **5,918 vh**. With the 26% prologue and band, the page is **7,997 vh**.
- The prologue plus band is about **2,080 vh**. At 390 x 664 that is about 13,800 px of the 53,000 px page.
- Phase 0 baseline (M1 Max, 120 Hz): prologue segment p50 8.3 ms, p95 9.4 ms; beats p95 9.3 ms. After the scene-bleed fix, a full scroll gave p95 9.3 ms. Those are the numbers to hold.

## 3. Science outline

Mass limits depend on metallicity and on modelling choices, so the copy says "about" everywhere. Items marked **≈** are approximate or debated; items marked **⚑** correct or refine the brief.

### 3.1 Shared trunk (every path)
1. **Cold molecular cloud.** About 10-20 K, mostly H₂, a little dust. Densest cores reach roughly 10⁴-10⁵ molecules per cm³. Collapse sets in where gravity beats thermal pressure (the Jeans criterion), often helped by turbulence and losing magnetic support.
2. **Fragmentation.** A collapsing clump breaks into cores, which is why stars mostly form in groups. Free-fall time about 10⁵ years **≈**.
3. **Protostar.** The core heats as it contracts, hidden inside a dusty envelope (Class 0/I). Infrared, not visible light.
4. **Disk and jets.** Gas with angular momentum can't fall straight in, so it forms a disk. Bipolar jets and outflows carry angular momentum away, which lets more gas reach the star.
5. **Planets begin.** Micron dust grains stick into pebbles; pebbles concentrate (streaming instability) into planetesimals of kilometres to 100 km; these grow into protoplanets. Beyond the snow line (about 150-170 K; about 3 AU for the young Sun **≈**) ice makes solids more plentiful, so cores of about 10 Earth masses can form fast enough to pull in gas before it disperses. That makes gas giants.
6. **Mass gathering.** The final mass is set by how long and how fast the protostar accretes. This is where the visitor chooses (§4).
7. **Clearing.** Within a few million years (typical disk lifetimes 1-10 Myr **≈**), the star's wind, UV and X-rays photoevaporate the leftover gas. Whatever giants exist by then are all there will be.
8. **Ignition.** A pre-main-sequence star contracts and heats. Once the core reaches about 10 million K, hydrogen fusion (pp chain in Sun-like and smaller stars; CNO cycle above about 1.3 M☉) supplies the energy, contraction stops, and the star sits on the zero-age main sequence.
   - **⚑ Order differs for massive stars.** Above roughly 8 M☉ the core ignites while the star is still accreting. The massive paths say so instead of showing a clean "gather, then ignite".
   - **⚑ Planets depend on mass.** Around massive stars, disks are photoevaporated quickly and planets are unlikely. Around brown dwarfs, disks are small and only small planets are expected. The disk scene adapts to the chosen mass, which is why the choice comes before planet growth (§4).

### 3.2 Paths
Lifespans are main-sequence lifetimes, rounded.

| Path | Preset mass | Main sequence | Ending |
|---|---|---|---|
| Brown dwarf | 0.05 M☉ (about 50 Jupiter masses) | None: no sustained hydrogen fusion | Cools and fades |
| Red dwarf | 0.15 M☉ | Trillions of years **≈** | Helium white dwarf, none exist yet |
| Sun-like | 1 M☉ | About 10 billion years | Carbon-oxygen white dwarf |
| Massive | 15 M☉ | About 11-13 million years | Type II supernova, neutron star |
| Very massive | 40 M☉ | About 5 million years | Often a black hole, weak or failed supernova |
| Pair instability (optional) | 200 M☉, in metal-poor gas, which lets it keep its mass | About 2-3 million years **≈** | Nothing left |

**Brown dwarf (below about 0.075-0.08 M☉).**
- Never reaches a stable hydrogen-burning core; electron degeneracy pressure halts contraction first.
- Above about 13 Jupiter masses it fuses deuterium: for millions to tens of millions of years at the 50 Jupiter-mass preset, and up to about a billion years near the 13 Jupiter-mass edge, where burning is slow (Spiegel et al. 2011) **≈**; above about 65 Jupiter masses it also burns lithium **≈**.
- Then it cools and dims indefinitely, shifting from L to T to Y spectral types.

**Red dwarf (about 0.08-0.5 M☉).**
- **⚑ Fully convective only below about 0.35 M☉**, not up to 0.5. Convection mixes the whole star, so it uses nearly all its hydrogen. The preset (0.15 M☉) is fully convective; the copy says "below about a third of the Sun's mass" if it mentions convection.
- **⚑ Lifetime formula fails here.** `t ≈ 10 Gyr × M^-2.5` gives about 1 trillion years at 0.15 M☉. Models that include full mixing give several trillion (Laughlin, Bodenheimer & Adams 1997). The copy says "trillions of years".
- End: below about 0.16-0.20 M☉, red dwarfs are predicted to heat up into "blue dwarfs" (to about 5,800 K at 0.1 M☉) without becoming giants, then contract into helium white dwarfs **≈** (a model prediction, Laughlin et al. 1997). From about 0.25 to 0.5 M☉ they pass through a red giant phase first. All end as helium white dwarfs.
- **⚑ Ignition temperature:** red dwarf cores ignite at a few million K, not 10 million, so the ignition line says "millions of kelvin".
- None has died yet: the Universe is 13.8 billion years old.

**Sun-like (about 0.5-8 M☉).**
- Main sequence about 10 billion years at 1 M☉ (the formula is fine in this range).
- Core hydrogen runs out → shell burning → red giant.
- Below about 2 M☉ the helium core is degenerate and ignites in a **helium flash**. Above that, helium ignites quietly.
- Core helium burning on the horizontal branch (the "red clump" for metal-rich stars), about 100 million years for the Sun **≈**.
- Asymptotic giant branch: hydrogen and helium shells, **thermal pulses**, heavy mass loss.
- The shed envelope, ionized by the hot core, glows as a **planetary nebula** for about 10,000 years **≈**.
- Remnant: a carbon-oxygen white dwarf, about Earth-sized. For the Sun, about 0.54 M☉ (Schröder & Smith 2008); 0.6 M☉ is the average for field white dwarfs.
- Cooling: a fully cold **black dwarf** would take far longer than the age of the Universe; none exist and it remains a prediction.
- Planets: Mercury and Venus are engulfed. **⚑ Earth's fate is uncertain**: likely engulfed in most models (Schröder & Smith 2008), so the copy says "the inner planets" and does not name Earth. Outer planets survive and drift outward as the star loses mass. Planets around white dwarfs are observed (for example WD 1856+534 b).
- **⚑ Upper end:** stars of roughly 6-8 M☉ may instead leave oxygen-neon white dwarfs or end as electron-capture supernovae **≈**. The path is narrated at 1 M☉, so this only appears in the article and the readout if the visitor sets a mass near 8.

**Massive (about 8 to 20-25 M☉).**
- Hot blue main sequence; CNO cycle.
- Red supergiant. Successive burning stages in nested shells: hydrogen, helium, carbon, neon, oxygen, silicon. The core ends as iron, which cannot release energy by fusing.
- The iron core collapses in under a second, reaches nuclear density and rebounds. The bounce shock stalls; neutrino heating behind it revives the shock, which unbinds the star: a **Type II supernova** (II-P for most red supergiants).
- Remnant: a **neutron star**, radius about 12 km (NICER), so about 25 km across. A spinning, beamed one is seen as a pulsar.
- **⚑ The NS/BH line is not clean.** Which stars explode depends on core structure, not only on mass ("islands of explodability", Sukhbold et al. 2016), and few supernova progenitors above about 17-18 M☉ are seen (the "red supergiant problem", Smartt 2015; its significance is disputed by Davies & Beasor 2018, 2020). The path narrates the typical case.

**Very massive (above about 20-25 M☉).**
- Strong radiation-driven winds remove much of the envelope. Above about 25-30 M☉ at solar metallicity, a **Wolf-Rayet** phase is possible **≈**.
- Core collapse into a **black hole**, with a weak supernova, or none (a failed supernova, where the star simply vanishes from view; debated candidates: N6946-BH1, which JWST data may instead fit as a stellar merger (Beasor et al. 2024), and M31-2014-DS1 (De et al. 2024)).
- Many such stars explode as stripped-envelope supernovae (Ib/c) and leave a neutron star instead: at solar metallicity a 40 M☉ star ends with only about 13 M☉ (Ekström et al. 2012). The copy says "may".
- **⚑ The formula fails here too.** `10 Gyr × 40^-2.5` gives about 1 Myr; models give about 5 Myr. Lifetimes flatten above about 30 M☉ toward a floor of about 3 Myr. Readouts use model lifetimes (§3.3).

**Pair instability (optional, about 140-260 M☉ initial).**
- Stars near 200 M☉ exist today (R136a1 in the LMC). What needs very metal-poor gas is **keeping** that mass: winds are weak there. That was common in the early Universe, and still happens in metal-poor galaxies **≈**.
- A helium core of about 64-133 M☉ (Heger & Woosley 2002) gets hot enough that photons make electron-positron pairs, pressure drops, the core contracts, and explosive oxygen burning unbinds the whole star. No remnant.
- Below this range (helium cores about 30-64 M☉, roughly 70-140 M☉ initial), "pulsational" pair instability ejects shells and then a black hole forms (Woosley 2017); above about 260 M☉ the star collapses straight to a black hole **≈**.
- Candidates exist (SN 2007bi; SN 2018ibb, in a low-metallicity host at z ≈ 0.17); none is certain.

### 3.3 Lifespan figures
- **The brief's formula is only within about a factor of 2 for 0.5-10 M☉** (it gives 1.8 Gyr at 2 M☉ against about 1.0-1.3 Gyr in models, and 180 Myr at 5 M☉ against about 90-110 Myr), and it fails badly at both ends. `L ∝ M^3.5` steepens below and flattens above that range.
- The readout uses a small table of model lifetimes, interpolated in log space, shown rounded with "about". Checked by the independent review (§3.5):

| Mass (M☉) | Lifetime | Source |
|---|---|---|
| 0.1 | about 6 trillion yr | Laughlin et al. 1997 §3.2 (verified) |
| 0.15 | about 2-3 trillion yr | interpolated, Laughlin et al. 1997 |
| 0.2 | about 1 trillion yr | Laughlin et al. 1997 §5.1 (verified) |
| 0.3 | about 500 billion yr **≈** | extrapolated from Laughlin et al. 1997 and Adams et al. 2004; not directly verified |
| 0.5 | about 100 billion yr **≈** | not verified; models span roughly 60-150 Gyr with metallicity |
| 1 | about 10 billion yr | textbook; Ekström et al. 2012 give 8.5-8.8 Gyr at Z = 0.014 |
| 2 | about 1 billion yr | Ekström et al. 2012: 1.0-1.3 Gyr |
| 5 | about 100 million yr | Ekström et al. 2012: 88-109 Myr |
| 15 | about 12 million yr | Ekström et al. 2012: 11.0-13.4 Myr |
| 40 | about 5 million yr | Ekström et al. 2012: 4.4-5.7 Myr |
| 120 | about 3 million yr | Ekström et al. 2012: 2.7-3.2 Myr |

  Ranges in the Ekström column are without and with rotation. Schaller et al. 1992 was not checked directly.

- The article states the formula once ("roughly, a star's lifetime falls as its mass to the power 2.5") and says it fails at both ends.

### 3.4 Sources (textbook and review level)
Checked against Crossref: Bally 2016; Spiegel et al. 2011; Schröder & Smith 2008; Sukhbold et al. 2016; Heger & Woosley 2002; Zinnecker & Yorke 2007. Checked against the paper itself: Ekström et al. 2012; Laughlin et al. 1997. The rest are believed correct but were not fetched.
- Kippenhahn, Weigert & Weiss, *Stellar Structure and Evolution*, 2nd ed. (2012).
- Carroll & Ostlie, *An Introduction to Modern Astrophysics*, 2nd ed. (2007).
- Prialnik, *An Introduction to the Theory of Stellar Structure and Evolution*, 2nd ed. (2009).
- Armitage, *Astrophysics of Planet Formation*, 2nd ed. (2020).
- McKee & Ostriker 2007, ARA&A 45, 565: star formation theory.
- Zinnecker & Yorke 2007, ARA&A 45, 481: massive star formation, ignition while accreting.
- Bally 2016, ARA&A 54, 491: protostellar outflows and jets.
- Johansen et al. 2014, *Protostars and Planets VI*: planetesimal formation; Chiang & Youdin 2010, AREPS 38, 493.
- Pollack et al. 1996, Icarus 124, 62: core accretion.
- Alexander et al. 2014, *Protostars and Planets VI*: disk dispersal.
- Burrows et al. 2001, Rev. Mod. Phys. 73, 719: brown dwarfs; Spiegel, Burrows & Milsom 2011, ApJ 727, 57: deuterium-burning limit.
- Chabrier & Baraffe 1997, A&A 327, 1039: fully convective boundary.
- Laughlin, Bodenheimer & Adams 1997, ApJ 482, 420: red dwarf lifetimes and blue dwarfs.
- Schaller et al. 1992, A&AS 96, 269; Ekström et al. 2012, A&A 537, A146: model lifetimes.
- Herwig 2005, ARA&A 43, 435: AGB stars and thermal pulses.
- Schröder & Smith 2008, MNRAS 386, 155: the Sun's red giant phase and Earth.
- Vanderburg et al. 2020, Nature 585, 363: a giant planet around a white dwarf.
- Fontaine, Brassard & Bergeron 2001, PASP 113, 409: white dwarf cooling.
- Woosley, Heger & Weaver 2002, Rev. Mod. Phys. 74, 1015; Heger et al. 2003, ApJ 591, 288: how massive single stars end.
- Smartt 2009, ARA&A 47, 63; Smartt 2015, PASA 32, e016: supernova progenitors.
- Sukhbold et al. 2016, ApJ 821, 38: explodability.
- Crowther 2007, ARA&A 45, 177: Wolf-Rayet stars.
- Heger & Woosley 2002, ApJ 567, 532: pair-instability supernovae.
- Woosley 2017, ApJ 836, 244: pulsational pair instability.
- Adams et al. 2004, RMxAC 22: red dwarf lifetimes.
- Beasor et al. 2024, ApJ 964, 171: N6946-BH1 with JWST.

### 3.5 Independent science review (2026-11-04)
A separate reviewer, reading only §3 and §8 and checking against papers where it could, found four errors, all fixed above and in §8: the 15 M☉ lifetime in the copy, the 0.3 M☉ lifetime, the pulsational and pair-instability mass ranges, and the claim that a 200 M☉ star needs the early Universe to form. Its wording fixes are also applied: black hole formation is "may", not certain; the supernova mechanism; neutron star size; red dwarf ignition temperature; the Sun's white dwarf mass; deuterium burning time; N6946-BH1 as debated.

## 4. Interaction design

**Where the choice sits:** after the protostar, disk and jets are visible, and before planets grow. The protostar is still feeding, which is the honest moment for "how much will it gather?", and planet formation can then follow the chosen mass (§3.1).

**Recommended control (decision 9.1):** a mass slider on a logarithmic scale from 0.02 to 250 M☉ (120 without the pair-instability path), with:
- A native `<input type="range">`, so keyboard (arrows, Page Up/Down, Home/End), touch and screen readers work without custom code.
- Detents that snap to the preset of each path, and tick marks at the path boundaries.
- A live readout in mono: mass, main-sequence lifespan, ending. For example `1.0 M☉ · about 10 billion years · white dwarf`. The same text is the slider's `aria-valuetext`.
- Under it, one text button per path ("Brown dwarf", "Red dwarf", "Like the Sun", "Massive", "Very massive"), which set the slider to that preset. These are the quickest route for touch and screen readers.
- The disk on screen responds as the value changes: accretion speeds up, the protostar grows and its colour shifts. This is the diegetic part, without making the visitor hold a button.
- It starts at 1 M☉. Scrolling past without touching it means the Sun's path.
- No scroll lock. Scroll is never captured; the choice holds on screen for a dwell like a beat.

**Branching (decision 9.2):** every path fills the same scroll segment after the choice.
- The page height stays fixed, so Lenis's cached height, deep links to beats, the chapter rail and `flightFractionToGlobal` all stay correct whatever the visitor picks. A path-dependent height would shift every beat's scroll position and re-introduce the "deep link clamps to the top" bug class fixed in Phase 7.
- Each path splits its segment into its own sub-phases. Short lives (massive stars) spend more of the segment on the ending; the Sun's path spends more on the giant phases.
- The mass can be changed only while the choice is on screen. Above it, the opening plays the trunk; below it, the chosen path is fixed until the visitor scrolls back up.

## 5. Scroll budget (decision 9.3)

**Proposal: keep the opening at about the current 2,080 vh, so the page stays about 8,000 vh (about 53,000 px on a 390 x 664 phone).**

| Segment | vh | Share of page |
|---|---|---|
| Cloud and fragmentation | 260 | 3.3% |
| Protostar, disk, jets | 240 | 3.0% |
| The choice (mass gathering) | 220 | 2.8% |
| Planets form, gas clears (adapts to mass) | 260 | 3.3% |
| Ignition and main sequence | 180 | 2.3% |
| The path's life and ending (same length for every path) | 720 | 9.0% |
| Hand-off: the remnant recedes into a night sky | 200 | 2.5% |
| **Opening total** | **2,080** | **26%** |

`PROLOGUE_FRACTION` and `CROSSFADE_BAND` become `OPENING_FRACTION` (about 0.235) and a hand-off band (about 0.025), with the same total of 0.26, so every beat keeps its current scroll position.

## 6. Scene list

All procedural, in the art kit's idiom (`createRimMaterial`, `GlowSprite`, `LightLine`, `NOISE_GLSL`, `PALETTE`, `GLOW`), no raymarch except the black hole ending. Opening scenes live in world space ahead of the first station (positive z, before `ORIGIN_ANCHOR`), and the camera's opening path ends exactly on `ORIGIN_ANCHOR`, so the flight starts where it starts today.

| # | Scene | Visual | Budget notes |
|---|---|---|---|
| O1 | Molecular cloud | Layered noise billboards (dark dust lanes, faint rim light), sparse background stars dimmed by extinction | 4-6 large quads, one fbm in the fragment shader; half-resolution on low/mobile |
| O2 | Fragmentation | Instanced particles drift into 5-8 clumps; one is followed | One `InstancedMesh` or `points`; counts by tier |
| O3 | Protostar | Glowing core inside a dusty envelope, seen dimmed and reddened | Rim material + glow sprite |
| O4 | Disk and jets | Particle disk with Keplerian shear in the vertex shader; two collimated jets with knots | Motion in shaders, buffers allocated once |
| O5 | The choice | O4, with the star's size, colour and accretion rate driven by the chosen mass | No new geometry |
| O6 | Planets | Dust brightens into pebbles, then a few planetesimals and protoplanets; a snow line ring; giants beyond it; the gas fades as it clears | Variants for brown dwarf (small disk), Sun-like, massive (disk blown away early) |
| O7 | Ignition | Core brightens as it settles; colour from mass (red to blue-white); planets on their orbits | Exposure ramp only, no flash |
| P1 | Brown dwarf | Dim magenta-red ball, faint deuterium glow, then slow cooling to near black | Cheapest path |
| P2 | Red dwarf | Small red star, convective mottling, a time readout running into trillions, then a hot blue dwarf and a tiny white dwarf shown as a prediction (dashed outline or ghosted) | |
| P3 | Sun-like | Star swells to a red giant and engulfs the inner orbits; helium flash (a ramp in the core, not a screen flash); horizontal branch; AGB with pulsing shells; planetary nebula shells; white dwarf with surviving outer planets; slow cooling | Longest path, most sub-phases |
| P4 | Massive | Blue star, then red supergiant with nested coloured shells (cutaway), iron core, collapse, supernova shell expanding past the camera (ramped exposure), pulsar with beams | Supernova uses expanding shells and sprites |
| P5 | Very massive | Strong wind as streaming particles, Wolf-Rayet core, collapse to a black hole impostor (the existing `blackhole.frag` impostor variant), faint or no explosion | Reuses `OriginBlackHole`'s impostor at small screen size |
| P6 | Pair instability (optional) | Huge blue star in a sparse early-Universe field, pair-production glow, total disruption, empty space | |
| O8 | Night sky | The remnant recedes; the flight's `Environment` stars and nebula fade up; quiet hold before beat 1 | Uses existing `Environment` |

Only the chosen path's scene is mounted below the choice point (the others unmount), so the GPU cost is one path at a time.

## 7. What is deleted, kept and reused

- **Delete:** `ProloguePass.tsx`, `prologueDive.ts`, `prologuePhase.ts`, their tests, `HERO_PHASES`, `HERO_LINE`, the `crossfade`-based sub swell, `covered`, and `CoverAware` if nothing else uses it.
- **Move:** `OriginBlackHole.tsx` becomes the black hole of the very massive path.
- **Keep:** `QuasarBackground/engine/shaders/blackhole.frag.ts` and `types.ts` for that impostor. `background.ts` and `phaseUniforms.ts` are deleted only if nothing imports them after the move; the home loop is a video, so it doesn't need them at runtime.

## 8. Copy draft (for approval, line by line)

Plain, short, no em dashes. Each line shows on its own, centred in the serif like today's prologue lines. Mono readouts are marked `[mono]`.

### Trunk
1. A cold cloud of gas and dust, about ten degrees above absolute zero.
2. In its densest knots, gravity wins. The cloud breaks into clumps, and each one starts to fall in.
3. At the centre of one clump, a core heats up inside a cocoon of dust.
4. Gas that can't fall straight in spreads into a spinning disk. Jets from the poles carry spin away, helping gas drain onto the star.

### The choice
5. The young star is still feeding from its disk. How much it gathers decides how long it lives and how it ends.
- Control label: **Mass of the star**
- Readout `[mono]`: `1.0 M☉ · about 10 billion years · white dwarf`
- Preset buttons: **Brown dwarf**, **Red dwarf**, **Like the Sun**, **Massive**, **Very massive** (and **First stars** if the pair-instability path is in)

### Planets and clearing (one line per path type)
6. In the disk, dust grains stick together. Pebbles become planetesimals, and planetesimals become planets.
7. *(Sun-like, red dwarf)* Beyond the snow line, ice helps cores grow big enough to pull in gas. Giants form there.
   *(Brown dwarf)* A small disk makes small worlds, if any.
   *(Massive, very massive)* Ultraviolet light from a star this heavy clears the disk quickly. Planets have little time to form.
8. The star's wind and light clear away the leftover gas. What has formed by now is all there will be.

### Ignition
9. The core passes about ten million kelvin. Hydrogen fuses into helium, and the star settles onto the main sequence.
   *(Red dwarf, instead)* The core reaches a few million kelvin, just enough. Hydrogen fuses into helium, and the star settles onto the main sequence.
   *(Massive and very massive, instead)* Its core ignites while it is still feeding. Heavy stars don't wait.

### Brown dwarf
10. It stopped short. Below about 0.08 solar masses, the core never gets hot enough to keep hydrogen burning.
11. It burns deuterium for a while, then glows only with leftover heat.
12. It cools and dims for billions of years, never quite a star.

### Red dwarf
13. A small, cool red dwarf. Its whole interior churns, so it uses almost all of its hydrogen.
14. It will shine for trillions of years. The Universe is only 13.8 billion years old.
15. Late in life it should heat up and shrink into a helium white dwarf.
16. None has done this yet. There hasn't been time.

### Like the Sun
17. It fuses hydrogen steadily for about ten billion years.
18. When the core runs out, the star swells into a red giant and swallows the inner planets.
19. Below about two solar masses, helium in the core ignites in a runaway: the helium flash. From outside, nothing shows.
20. It burns helium calmly for about a hundred million years, then swells again. Its outer layers pulse and drift away.
21. The drifting gas glows as a planetary nebula, lit by the bare core.
22. The core is now a white dwarf of carbon and oxygen, about the size of Earth. The outer planets still orbit it.
23. It cools for longer than the Universe has existed. A cold, dark black dwarf is still only a prediction.

### Massive
24. A massive star burns hot, blue and fast: about twelve million years.
25. It swells into a red supergiant. Inside, shells fuse heavier and heavier elements, out to iron.
26. Fusing iron releases no energy. The core collapses in less than a second.
27. The core rebounds. Neutrinos pouring out heat the stalled shock until it blows the star apart: a Type II supernova.
28. Left behind is a neutron star about twenty-five kilometres across. If its beams sweep past us, we see a pulsar.

### Very massive
29. A star this heavy lives only a few million years and blows much of itself away as it goes.
30. Its winds can strip it down to a hot, bare core, a Wolf-Rayet star.
31. Its core may collapse straight into a black hole, with a weak explosion or none at all.

### First stars (optional)
32. In gas with almost no heavy elements, as in the early Universe, a star this heavy can keep its mass.
33. Its core gets so hot that light turns into pairs of electrons and positrons. The pressure drops, and the core falls in.
34. Oxygen ignites all at once, and the star blows itself apart. Nothing is left behind.
35. A few candidates have been seen. None is certain.

### Hand-off (all paths)
36. Billions of years and many stars later, someone looked up at the sky.
    *(Alternative)* Much later, under a sky full of stars like these, a child looked up.
- Link after the hand-off line: **Try another star** (jumps back to the choice)

### Article and calm-mode extras
- Section heading: **How a star lives and ends**
- Formula sentence: Roughly, a star's lifetime falls with its mass to the power 2.5, so a star ten times heavier lives a few hundred times less long. The rule breaks down for the smallest and largest stars.

## 9. Decisions for the owner

1. **How the choice works.** Options: (a) five or six preset buttons; (b) a log-scale mass slider with snapping presets and a live readout, plus preset buttons; (c) diegetic: hold to keep feeding, release to stop. **Recommendation: (b).** It lets any mass show an honest lifespan and ending, uses a native control that keyboard, touch and screen readers already handle, and the presets keep it quick. (c) is hard to make accessible and fights scrolling.
2. **Branching.** **Recommendation: every path fills the same 720 vh segment**, so the page height and every beat position never change (§4).
3. **Total length.** **Recommendation: about 2,080 vh, the same as today**, so the page stays about 8,000 vh and 53,000 px on phones (§5). A shorter option is about 1,600 vh (trunk 760, choice 160, path 520, hand-off 160), which cuts about 3,200 px on phones but halves the time per path line.
4. **Other paths.** **Recommendation:** a "Try another star" link after the hand-off line, and in the chapter rail's first tick, jumping back to the choice. No "see all endings" sequence in the flight; the article lists them all.
5. **Default path.** **Recommendation: the Sun's path (1 M☉)** for no choice, no JavaScript, calm mode and reduced motion. Calm mode still offers the choice with the preset buttons. The server-rendered article tells the Sun's path in full and lists the others briefly, as the owner suggested.
6. **Deep links.** **Recommendation: `?star=brown-dwarf|red-dwarf|sun|massive|very-massive|first-stars`**, written with `replaceState` when the visitor chooses. A query, not a hash, because `JourneyNav` rewrites the hash every 400 ms to follow the beat. Beat hashes (`#nao`, `#radiosim`) keep skipping the opening as they do now. `#choose` jumps to the choice.
7. **The optional pair-instability path.** **Recommendation: include it as "First stars"**, since it stays clear in four lines and connects to the cosmic dawn work at the end of the story. Type Ia from a binary: **leave it out** (single-star story), as the brief suggested; no question needed unless the owner wants it.
8. **The home page.** `HeroLoop` plays the black hole video, and `StoryPortal` calls its link "a photon-ring link". **Question:** keep the home black hole as it is, or change it to match the new opening? **Recommendation: keep it for now** and revisit after Phase 7, since a new loop needs a capture of the finished opening.
9. **The finale's rhyme.** The finale currently merges ionized bubbles into "the photon ring the story opened on". **Recommendation:** each bubble grows around a small first star, so the story ends with the first stars lighting the Universe, rhyming with the one star it began with. The eclipse ring alignment stays. The scene's text is unchanged; only its art changes.
10. **Readout on screen.** **Recommendation:** a small mono readout during the opening (mass, age, core temperature), using the beat HUD's style. Option: none, and the lines carry the numbers.
11. **Hand-off line.** Pick line 36 or its alternative, or neither.

## 10. Supporting changes

- **Calm mode:** steps for the trunk (cloud, protostar with disk, the choice), then the chosen path in two or three stills (life, ending), then a night-sky still, then beat 1. The choice step uses the preset buttons. New posters: about 4 trunk, 2-3 per path (about 14), 1 sky; each under 200 kB.
- **Article:** an opening section, "How a star lives and ends", with the trunk lines, the Sun's path in full, one or two sentences per other path, and the formula sentence. `storyArticle.test.tsx` checks every line.
- **Posters:** `capture-posters.mjs` gains opening positions and `star=`; `posters.test.ts` covers the new files. The share image stays (Cygnus X-1).
- **Sound:** the sub swell moves from the black hole hand-off to each path's ending event (supernova, collapse, helium flash as a soft swell, nothing for the brown dwarf and red dwarf). A low rise at ignition. Same levels and limits as the Phase 7 mix.
- **Loader:** the point of light fades into the cloud instead of igniting into a star. The backdrop stays.
- **Photosensitivity:** the supernova, flash and ignition are exposure ramps of at least 300 ms, never full-field flashes; none in calm mode.
- **Precompile:** every opening and path material is compiled by `Precompile` behind the loader, so choosing a path doesn't hitch.

## 11. Performance targets

- One WebGL context; the existing tiers, `TierGovernor` and `PerformanceMonitor` unchanged.
- Each opening segment and each path, measured like Phase 0 (`?perf`, constant-speed scroll, `__journeyPerf.summary()`), must stay within the prologue's baseline: p95 ≤ 9.4 ms on the M1 Max, and no frames over 50 ms after the loader.
- Mobile tier: particle counts and noise resolution reduced; tested in Chrome's phone emulation at CPU 4x slower, and on the owner's phones (still owed from Phase 7).
- LCP: the loader backdrop stays the LCP element; mobile LCP must stay under 2.5 s in the same simulation as the cutover note.

## 12. Phases, with a stop after each

1. **Remove the black hole opener.** The story starts from a plain night sky with a placeholder opening of the same length. Tests, calm mode and the article adjusted. *Stop: owner checks that the flight and beat positions are unchanged.*
2. **Nebula to protostar and disk** (O1-O4, O8). *Stop: look and science.*
3. **The choice** (O5) and the planet and ignition scenes (O6-O7). *Stop: interaction, keyboard, touch, screen reader.*
4. **Each path, one at a time:** Sun-like, then massive, very massive, red dwarf, brown dwarf, first stars. *Stop after each.*
5. **The hand-off into the story** and the finale's new rhyme. *Stop.*
6. **Calm mode, article, posters, sound and loader.** *Stop.*
7. **Mobile check and performance.** *Stop.*

After every phase: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, `pnpm build`, and screenshots at desktop and 390 x 664, with notes in `docs/superpowers/plans/` saying what was and wasn't verified.
