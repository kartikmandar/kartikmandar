# Wow Redesign: Phase 6, Done-When Check

The plan's Phase 6 exit check, run on 2026-11-01 against the production build in headless Chrome, driven over the DevTools Protocol.

## Results
| Check | Result |
|---|---|
| Every route in 2 interactions | **Pass.** All 11 main routes are in the fullscreen menu (button, then link). `/search` and the Stingray report are secondary and are reached from Cmd-K's route and the Open Source page. |
| No spinner for static data | **Pass.** None in the HTML or after load on 13 routes, and none during 4 in-site navigations on slow 4G. |
| Hero LCP under 2.0 s on mobile | **Passes in simulation:** 1.05, 1.19 and 1.53 s. A real phone hasn't been measured. |
| 5-second test with 3 people | **Not done.** It needs the owner. |

## LCP measurement
Viewport 412 x 823, slow 4G (1.6 Mbps, 150 ms latency), CPU 4x slower, cache off, three runs each.

| Route | LCP (s) | LCP element |
|---|---|---|
| `/` | 1.05, 1.53, 1.19 | The name in the hero |
| `/publications` | 1.14, 0.99, 1.08 | First card summary |
| `/open-source` | 0.96, 1.14, 1.10 | RadioSim image |
| `/about` | 1.10, 1.08, 1.08 | Page lead |

This ran against `next start` on localhost, so it has no DNS, TLS or CDN cost, and the numbers are best read as a lower bound.

## Fixed by this check
1. **The consent card was the mobile LCP.** It appears about 5 s after load, and its long paragraph was larger than the hero name, so first-time visitors would report about 5.9 s. It is now two shorter paragraphs with the same words.
2. **Page leads were invisible until JavaScript ran** (`opacity: 0` in the HTML). This put `/about` at 2.6 to 3.2 s, and hid the text with JavaScript off. `PageHeader` now renders the lead as plain text, so leads no longer fade in.
3. **The tucked top bar could take keyboard focus while off screen.** Focus now brings it back (0 to 80 px on screen, measured).
4. **The consent card covered Back to top on desktop.** The card now sits above it (measured no overlap at 1280 x 900).

## Keyboard pass, up to 40 stops per route
- 12 routes: no stop was off screen or covered, with the consent card answered. `/my-story` wasn't included.
- The skip link appears on first Tab.
- **Menu:** opens with Enter, focus moves in and stays trapped, Escape closes it and returns focus to the button.
- **Cmd-K:** opens from its button and with Cmd-K, focus moves to the input, Escape closes it and returns focus.
- **Folding lists on `/about`** open with Enter.
- **Reported as having no focus ring, and both are fine:** card titles, because the ring is on the card (`.content-card:has(a:focus-visible)`), and the search input once the palette is open. The report's embedded iframe was also listed, and this wasn't looked at further.

## Reduced motion
Home loads no video and keeps the poster, and the name is fully visible (emulated).

## Still open
- **Owner:** the 5-second test; About photos.
- **Real devices:** a real phone for LCP and touch, the Ubuntu PC, Firefox and Safari.
- **Consent card on phones:** it still covers the floating buttons until answered.
- **Below the first 40 stops:** long pages were not tabbed to the end in the final run. An earlier run went up to 90 stops and its only problems were the tucked bar and the consent card.
- **Screen readers** were not tested.
- **Before pushing:** merge the one `origin/main` commit (`9df5d54`).
