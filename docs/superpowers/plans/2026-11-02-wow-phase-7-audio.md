# Wow Redesign: Phase 7, Audio

The audio step of Phase 7 in `2026-10-28-site-wow-redesign-plan.md`. Built 2026-11-02. **The measurements below are from Chrome; the owner approved it on 2026-11-02.**

## Departure from the plan
The plan called for a commissioned or licensed score and sound effects. Instead, the owner confirmed on 2026-11-02 that they hold the rights to the existing track, `public/audio/quasar-compressed.mp3`, and chose generated sound effects. No effect files ship and there's nothing further to license.

## What changed
- **`src/lib/audioEngine.ts`:** one Web Audio graph, created on the first press of the sound button.
- **`AudioProvider`:** now drives the engine. Its API and the button are unchanged, and the sound still carries across client navigation.
- **`soundMix.ts`:** pure mapping from the flight to the mix. All the levels to tune are here and at the top of the engine.
- **`StorySound.tsx`:** feeds the flight into the mix while sound is on. Mounted only in the flight, so calm and timeline views get the plain track.
- **`journeyFrame.cameraSpeed`:** the same signal as the warp lens kick.

| Sound | Driven by | Source |
|---|---|---|
| Low-pass on the track, 2.2 kHz at rest to 16 kHz flat out | Scroll speed | The track |
| Whoosh, rising in level and pitch | Camera speed, so it's silent while scrolling through a held shot | Filtered noise |
| Sub swell, 42 Hz plus an octave for small speakers | The black hole hand-off | Oscillators |
| Arrival chord, rising through the story, with a soft echo | The beat's text appearing, at most one per 0.7 s | Oscillators |

## Measured (production build, Chrome, signal at the compressor)
| Stage | Peak | Above 4 kHz | 20-120 Hz |
|---|---|---|---|
| Before any click | No audio context, no track request | | |
| At rest in the flight | 0.31 | -103 dB | -30 dB |
| Scrolling | 0.33 | -50 dB | -32 dB |
| At the black hole | 0.58 | -87 dB | -20 dB |
| On `/about`, sound left on | 0.26 | -89 dB, filter fully open | -34 dB |

- **Peak** stays well below clipping (1.0).
- **Off:** the button fades out, pauses the track and suspends the context. On again resumes.
- **Calm mode at phone size:** plays the plain track, and Next adds no generated sound.
- **Tests:** 186 pass, typecheck and lint on the changed code pass, and the build compiles.

## Needs the owner's ears
- **Whether it sounds good:** the mix, chord pitch and whoosh level are first guesses. This is the main open question.
- **The rest cutoff:** 2.2 kHz removes nearly all of the track's top end while reading. If it feels too dull, raise `REST_CUTOFF_HZ`.
- **The arrival chords** are the most likely to feel intrusive over a long read. `NOTE_PEAK` turns them down.

## Not yet verified
- **Real devices.** iPhones are the main risk: Web Audio may be silenced by the ringer switch, and older Safari versions have had problems routing a media element through Web Audio.
- **Sub on phone speakers:** small speakers won't play 42 Hz, so the swell relies on its 84 Hz octave.
- **The track's loop point:** it uses the media element's loop, which can leave a small gap.
