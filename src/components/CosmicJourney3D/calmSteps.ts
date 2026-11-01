// The stops in calm mode: the prologue, each beat, then the ending.
import { BEATS_META } from './beatsMeta'
import { HERO_PHASES, NARRATIVE, PAGE_SUBTITLE, PAGE_TITLE, type EvidenceLink } from './narrative'
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

export const CALM_STEPS: CalmStep[] = [
  {
    slug: '',
    poster: '/media/home/blackhole-poster.avif',
    eyebrow: PAGE_SUBTITLE,
    headline: PAGE_TITLE,
    paragraphs: HERO_PHASES.map((phase) => phase.text),
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
