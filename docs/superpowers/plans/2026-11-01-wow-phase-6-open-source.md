# Wow Redesign: Phase 6, Open Source & Projects

The fifth step of Phase 6 in `2026-10-28-site-wow-redesign-plan.md`. Built 2026-11-01. **Signed off by the owner on 2026-11-01.**

## What changed
- **Page content:** `data/openSource.ts` replaces the data in the page file, which had a "Mock data" comment. Projects are grouped as Radio astronomy, X-ray astronomy, Strong lensing, and Products and tools.
- **Added:** RadioSim, hera_pspec, matvis, fftvis, hera_strip, Enrolia and Merakinist Labs. GSoC details, mentors, reports, blogs and proposals are kept on the Stingray Explorer and RIPPLe cards.
- **Status line:** unmerged work is labelled and links to its pull request.
- **Corrections elsewhere:**
  - `data/projects.ts`: RRIVis is now RadioSim with the working repo link (this is the 404 fix). The DAVE "3x faster FFT" claim is gone.
  - Home tile: fftvis now says the GPU backend is in an open pull request.
  - Home index: Enrolia no longer describes the old React Native and Supabase app.
- **Internal card links** ("Final report", "Paper") stay in the same tab.

## Statuses, checked on GitHub on 2026-11-01
- matvis #114: open. PROFILE.md says merged, which is out of date.
- fftvis #46 (GPU): open. #41 (structure): merged.
- DAVE #79: open. Stingray Explorer #2 (desktop rebuild): open.
- hera_pspec: 14 merged, 2 open (#499, #545).
- hera-strip: 1.0.1 on PyPI.

## Choices to review
- **matvis is listed**, marked "PR open", as the plan asks. The owner removed it from the home list, so it may be unwanted here too. Removing it means deleting one entry.
- **Dropped as unbenchmarked or unverifiable:** DAVE's "improved performance and memory usage", and PromptPrep's "12 releases" (PyPI shows 9; 0.1.12 is the version number).
- **Enrolia:** no pricing, user counts or cohort numbers. The stack is named only in general terms.
- **Images:** only RadioSim, fftvis and DAVE have one. The Stingray logo and ML4SCI banner cropped badly and the dashboard screenshot is illegible at card size. The RadioSim poster still shows the RRIVis name, which the card explains.

## Verified (production build, in-app browser)
- Typecheck, lint, 162 tests and the build pass; `/open-source` builds as static; no console errors.
- All 11 cards are in the server HTML. No "faster", "10x" or mock text remains on the page.
- External links return 200 where checked. No horizontal overflow at 375 wide.

## Not yet verified
- Real phones, the Ubuntu PC and Firefox, and a keyboard-only pass.

## Left alone
- The Cmd-K terminal's help text suggests `cd /projects`, a route that doesn't exist.
- The `/open-source/stingray-explorer` report is kept as a 2024 record.
- The home index's AzuFlow row describes React Native and Electron; the profile describes a SwiftUI app.
- The CV says "Wrote the GPU backend", which is accurate, with no merge status.
