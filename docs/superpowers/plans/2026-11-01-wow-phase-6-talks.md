# Wow Redesign: Phase 6, Talks

The sixth step of Phase 6 in `2026-10-28-site-wow-redesign-plan.md`. Built 2026-11-01. **Signed off by the owner on 2026-11-01.**

## What changed
- **SALF XI:** added as "Radio Array Systematics: HERA Case Study" (France, December 2025). The card's top line says "Presented by Dr. Rajorshi Chandra", and the summary repeats it. This uses a new optional `presentedBy` field on talks.
- **ASI 2026:** the 44th Annual Meeting at IIT Guwahati appears under a new "Schools & meetings attended" list, not as a talk. The list comes from the CV's section in `data/cv.ts`, so there is one source.
- **Dates:** talk dates now show month and year. The TIFR talk's stored date, 15 March 2026, falls after the event (3 to 11 March), and the exact day isn't known.
- **Small fixes:**
  - The RRIVis talk now says "now RadioSim".
  - The GSoC talk's summary no longer repeats its event name.
  - The "Java" tag is gone from the Celestial Sphere Mechanics talk.
  - Locations no longer repeat the city ("TIFR Mumbai, India").

## Choices to review
- **No SALF slides link:** the deck is in the owner's private notes, so nothing is published. A link can be added to `materials`.
- **SALF location is country only:** the sources don't give a city.
- **The owner's own CV PDFs** may still list SALF as their own talk. One source noted that it might have been co-presented. The site follows the plan: presented by Dr. Chandra.
- **Funding is left out**, under the privacy rules, even where a source says "fully funded".

## Verified (production build, in-app browser)
- Typecheck, lint, 165 tests and the build pass; `/talks` builds as static; no console errors.
- Talks run newest first, and the SALF credit shows. No horizontal overflow at 375 wide.

## Not yet verified
- Real phones, the Ubuntu PC and Firefox, and a keyboard-only pass.

## Left alone
- The other cards' top line still says "Completed".
