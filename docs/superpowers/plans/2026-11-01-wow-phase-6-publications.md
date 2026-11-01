# Wow Redesign: Phase 6, Publications

The third step of Phase 6 in `2026-10-28-site-wow-redesign-plan.md`. Built 2026-11-01. **Signed off by the owner on 2026-11-01.**

## What changed
- **Server-rendered list:** `data/publications.ts` replaces the live arXiv widget and its spinner. The page is now static, so citations are in the HTML and no request goes to arxiv.org.
- **Layout:** sticky year headers, topic chips (All, 21-cm, X-ray binaries) and a paper count, on the shared `ContentCard`. The owner's name is highlighted in each author list.
- **Copy BibTeX:** `toBibtex` writes an `@article` for published papers and an `@misc` with a review note for the survey. Covered by `data/__tests__/publications.test.ts`.
- **Citations, checked against Crossref and arXiv on 2026-11-01:**
  - State-dependent X-ray Variability in Cygnus X-1: ApJ 1003, 13 (2026), doi:10.3847/1538-4357/ae5632. Crossref's title wording is used.
  - fftvis: RASTI 4, rzaf056 (2025), doi:10.1093/rasti/rzaf056.
  - NuSTAR Reflection-Spectroscopy Survey of Cygnus X-1: arXiv:2608.15902, under review at ApJ.
- **ID question resolved:** arXiv:2608.18051, the ID on the CV, is an unrelated paper (Cotton et al., PICSARR-2). 2608.15902 is correct.
- **Footer:** its publications list said "arXiv preprint" for both papers and the Cygnus link went nowhere (`#`). It now has real citations and links, and lists the survey.
- **Project data:** the Cygnus X-1 entry now says "Published" instead of "Accepted".

## Trade-offs
- New papers no longer appear on their own. Add them to `data/publications.ts`.
- Abstracts are gone. Each card has a one-sentence summary written for this page and links to arXiv. Owner-supplied abstracts can go in the data.
- The Dainotti et al. paper stays out of this list because it is an acknowledgement, not authorship. It is still in the footer, labelled as such.

## Verified (production build, in-app browser)
- Typecheck, lint, 158 tests and the build pass; `/publications` builds as static; no console errors.
- Server HTML has all three citations and no spinner or widget. Both DOIs redirect.
- Chips filter correctly (1 paper for 21-cm, 2 for X-ray binaries, 3 for All), and empty years disappear.
- Copy BibTeX produces the right text and resets its label, tested with a stubbed clipboard.
- Year headers stick on desktop. No horizontal overflow at 375 wide.

## Not yet verified
- A real clipboard write, real phones, the Ubuntu PC and Firefox.
- A keyboard-only pass.
