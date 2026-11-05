# Stellar opening, Phase 3: the choice, planets and ignition

Date: 2026-11-05. Plan: `2026-11-04-stellar-opening-plan.md`. Scenes O5-O7 from the spec (§4, §6).

## What was built

- **`starChoice.ts`** (pure, plus a small zustand store):
  - A log-scale mass from 0.02 to 250 M☉ over 1,000 slider steps.
  - Each preset (0.05, 0.15, 1, 15, 40, 200) sits on an exact slider position.
  - While dragging, the thumb snaps to a preset within 14 steps. Arrow keys don't snap.
  - `pathForMass` uses `PATH_BOUNDARIES` [0.08, 0.5, 8, 25, 140], the same values as the slider's tick marks.
  - Lifetimes come from the §3.3 model table, interpolated in log space. Below 0.1 M☉ and above 120 M☉ they hold the end values.
  - Endings follow §3.2 at readout detail.
  - The readout reads `1.0 M☉ · about 10 billion years · white dwarf` and is also the slider's `aria-valuetext`.
  - `?star=` is read on load and written with `replaceState` when the visitor's choice changes the path.
- **`MassChoice.tsx`**, shown under line 5 only while the choice is on screen:
  - A native `<input type="range">` labelled "Mass of the star", with tick marks at the path boundaries.
  - A mono readout.
  - Six preset buttons with `aria-pressed`.
  - It sits lower and smaller than the other lines, so the star stays clear above it. On phones the buttons are compact and the block sits above the corner buttons.
- **`#choose`**: lands mid-choice and focuses the slider. The hash reads `#choose` while the choice is on screen. Beat hashes are unchanged.
- **Overlay**: the lines below the choice follow the chosen path.
- **`openingStage.ts`** schedules the planets segment (lines 6-8) and ignition (line 9) by path:
  - Pebbles, then planet growth.
  - The snow line and giants appear only for the Sun and red dwarfs, never for brown dwarfs or heavy stars.
  - The gas clears from the outside in.
  - A heavy star's light clears its outer disk early, but its inner disk keeps feeding until the star is already burning ("Heavy stars don't wait").
  - Jets and the cocoon die down as the disk ages.
- **`starLook.ts`**, how a mass is drawn:
  - Main-sequence temperatures; colour from a blackbody fit.
  - Radius, brightness and disk size compressed to stay on screen.
  - Disk spin ∝ √M.
- **`OpeningStage.tsx`**:
  - From the choice on, the protostar's size, colour, brightness and disk speed follow the chosen mass. The drawn mass eases toward it in log mass, and the disk turns on an accumulated clock, so dragging never jumps.
  - Dust grows into pebbles, then rocky worlds inside the snow line and banded giants beyond it, which open gaps in the disk. Worlds are lit from the star.
  - Some dust stays behind as debris.
  - Ignition is an exposure ramp to the mass's colour, never a flash. A brown dwarf dims instead.
  - The planets, snow line and new disk uniforms are always mounted, so `Precompile` covers them and no path change hitches.
- **`openingCamera.ts`**: over the planets the camera rises (to 8.2 out and 5.4 up) and looks further below the star, so the orbits open out above the copy.

## Found along the way

- **Arrow keys were stuck.** Rounding the stored mass to two significant figures sent every one-step move back to its own position. The store now keeps the exact mass and only the readout rounds. A test checks that every step moves.
- `starChoice.ts` and a component file named `StarChoice.tsx` clash on macOS's case-insensitive disk, so the component is `MassChoice.tsx`.

## Verified

- `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test` (31 files, 220 tests) and `pnpm build` pass.
- New tests:
  - Every preset lands exactly; snapping; every arrow step moves; the path changes at each tick and only forward.
  - The spec's readout example; model lifetimes at both ends; lifetimes only fall with mass.
  - `?star=` parsing and writing.
  - Temperatures and colours by mass.
  - The planet, clearing and ignition order for each path.
  - `#choose` lands inside the choice.
  - The camera keeps the star within 25° of the view centre.
- Production renders on this Mac's GPU, in capture mode:
  - Desktop 1280 x 800: the choice at 1, 15 and 0.05 M☉; the Sun's three planet lines and ignition; a red dwarf's planets and ignition; a massive star's cleared disk and ignition; a brown dwarf's ignition.
  - Phone 390 x 664: the choice, the planets and ignition.
- The live page (not capture mode) driven over CDP at 390 x 664:
  - `#choose` focus, and the hash staying `#choose`.
  - ArrowRight, Page Up, End and Home.
  - Tab to the presets, and preset clicks.
  - A touch drag that snaps onto Massive, then ArrowRight stepping past it.
  - `?star=` written for each path.
  - No exceptions.

## Not verified

- **A real screen reader.** I only checked what one is given: label, `aria-valuetext`, the group label, `aria-pressed`, and a hidden range description. I didn't listen with VoiceOver. During fine arrow steps the readout often stays the same, so a screen reader repeats it.
- **Touch on a real phone.** Only emulated touch was tested.
- **Frame timing** (Phase 7).
- **Reduced motion**, which isn't wired yet; the scene still renders with `reducedMotion={false}`.
- **A second science review.**
- **Colour.** Small stars still look pale rather than red once lit, because the tone mapping washes out warm HDR colour. Phase 4's red dwarf and brown dwarf paths should settle their real look.
- **The path segment.** It holds on the lit star and its planets until Phase 4.

## Stop

The owner checks the interaction: keyboard, touch and screen reader.
