// The stops in calm mode: the opening, each beat, then the ending.
import { BEATS_META } from './beatsMeta'
import { NARRATIVE, PAGE_SUBTITLE, PAGE_TITLE, type EvidenceLink } from './narrative'
import { DEFAULT_STAR_PATH, openingLines } from './openingStory'
import { slugFor } from './storyView'

export interface CalmStep {
  /** URL hash without the #. The first step has none. */
  slug: string
  poster: string
  eyebrow?: string
  headline: string
  paragraphs: string[]
  phrases?: string[]
  evidence?: EvidenceLink
  ending?: boolean
}

// The opening's stills come in Phase 6 of the stellar opening; until then both steps use the stars-only loader backdrop.
const OPENING_POSTER = '/media/my-story/loader-backdrop.webp'
const OPENING_LINES = openingLines(DEFAULT_STAR_PATH)
const TRUNK_SEGMENTS = new Set(['cloud', 'protostar', 'choice'])

export const CALM_STEPS: CalmStep[] = [
  {
    slug: '',
    poster: OPENING_POSTER,
    eyebrow: PAGE_SUBTITLE,
    headline: PAGE_TITLE,
    paragraphs: OPENING_LINES.filter((line) => TRUNK_SEGMENTS.has(line.segment)).map((line) => line.text),
  },
  {
    slug: 'like-the-sun',
    poster: OPENING_POSTER,
    headline: 'A star like the Sun',
    paragraphs: OPENING_LINES.filter((line) => !TRUNK_SEGMENTS.has(line.segment)).map((line) => line.text),
  },
  ...NARRATIVE.map((beat) => ({
    slug: slugFor(beat.id),
    poster: BEATS_META[beat.id]!.posterSrc,
    eyebrow: beat.eyebrow,
    headline: beat.headline,
    paragraphs: beat.body ? [beat.body] : [],
    phrases: beat.typedPhrases,
    evidence: beat.evidence,
  })),
  {
    slug: 'lets-talk',
    poster: BEATS_META[NARRATIVE[NARRATIVE.length - 1]!.id]!.posterSrc,
    eyebrow: 'Still searching for signals',
    headline: "Let's talk.",
    paragraphs: ["Research, open-source tools, or a hard problem that needs both. I'd love to hear from you."],
    ending: true,
  },
]

export function stepForHash(hash: string): number {
  const slug = hash.replace(/^#/, '').toLowerCase()
  if (!slug) return 0
  const index = CALM_STEPS.findIndex((step) => step.slug === slug)
  return index >= 0 ? index : 0
}
