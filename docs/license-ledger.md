# License Ledger

What the site ships that someone could ask about, checked against the repo on 2026-11-02. Log new fonts, models, audio, textures and borrowed shader code here before committing them.

## Story art and shaders
| Asset | Source | License | Notes |
|---|---|---|---|
| `blackhole.frag`, `sky.frag`, scene shaders in `CosmicJourney3D` | Written in this repo | Owner's own | |
| Gravitational-lens shader in `Beat_Lensing.tsx` | Ported from the site's own old 2D block | Owner's own | |
| `hash13` in `shaders/chunks.ts` and `art/glsl.ts` | "Hash without Sine" pattern, Dave Hoskins | MIT | Credited in the code and the site footer |
| `public/media/my-story/*` posters, share image, loader backdrop | Rendered from the site's own scenes | Owner's own | |
| 3D models, HDRs, LUTs, textures in the story | None: the art is procedural | n/a | Nothing is loaded; the plan's CC0 models weren't needed |

## Audio
| Asset | Source | License | Notes |
|---|---|---|---|
| `public/audio/quasar-compressed.mp3` | Existing track | Owner confirmed they hold the rights, 2026-11-02 | The owner's word; no document is on file here |
| Whoosh, sub swell, arrival notes | Generated at runtime in `src/lib/audioEngine.ts` | Owner's own | No effect files ship |

## Fonts
| Asset | Source | License | Notes |
|---|---|---|---|
| Instrument Serif, Inter, JetBrains Mono | Google Fonts through `next/font` | OFL | Self-hosted at build time |
| `public/fonts/JetBrainsMono-Medium.woff` | JetBrains Mono, for WebGL labels | OFL | License text is alongside it in `JetBrainsMono-OFL.txt` |

## Main libraries
| Package | Version | License | Notes |
|---|---|---|---|
| `gsap` (with SplitText) | 3.15.0 | GSAP Standard "no charge" license | Not open source; the terms are at gsap.com/standard-license |
| `three` | 0.183.2 | MIT | |
| `@react-three/fiber`, `drei`, `postprocessing` | 9.6.1, 10.7.7, 3.0.4 | MIT | |
| `postprocessing` | 6.39.1 | Zlib | |
| `troika-three-text` (through drei) | 0.52.4 | MIT | |
| `lenis` | 1.3.26 | MIT | |
| `framer-motion` | 12.38.0 | MIT | |
| `sharp` | 0.34.5 | Apache-2.0 | Scripts only |

## Not checked
- **Images outside the story:** `public/media` also holds project logos and screenshots (ML4SCI, Stingray, DAVE, GSoC) and post images such as `Library.jpg` and `buttermilk_stuck.JPG`. Where they came from isn't recorded here.
- **Smaller dependencies:** only the packages above were checked, not the full tree.
