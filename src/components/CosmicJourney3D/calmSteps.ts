// The stops in calm mode: the opening, each beat, then the ending.
import { BEATS_META } from './beatsMeta'
import { NARRATIVE, PAGE_SUBTITLE, PAGE_TITLE, type EvidenceLink } from './narrative'
import {
  CHOICE_LINE, CLEARING_LINE, DEFAULT_STAR_PATH, HANDOFF_LINE, OPENING_HEADING, OPENING_TRUNK, PLANETS_LINE, starPath, type StarPathId,
} from './openingStory'
import { openingPoster, PATH_STILLS, TRUNK_STILLS } from './openingStills'
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
  /** The choice of star: the preset buttons. */
  choice?: boolean
  /** The night sky: a way back to the choice. */
  tryAnother?: boolean
}

// The opening in calm mode (spec §10): the cloud, the protostar and the choice,
// then the chosen path in two or three stills, then the night sky, then beat 1.
// Each path still carries the lines up to its ending; its last still, the ending.
const CALM_PATHS: Record<StarPathId, readonly { headline: string; lines: readonly number[] }[]> = {
  'sun': [
    { headline: 'Like the Sun', lines: [0] },
    { headline: 'A red giant', lines: [1, 2, 3] },
    { headline: 'A white dwarf', lines: [4, 5, 6] },
  ],
  'massive': [
    { headline: 'Massive', lines: [0] },
    { headline: 'A red supergiant', lines: [1] },
    { headline: 'A supernova', lines: [2, 3, 4] },
  ],
  'very-massive': [
    { headline: 'Very massive', lines: [0, 1] },
    { headline: 'A black hole', lines: [2] },
  ],
  'red-dwarf': [
    { headline: 'Red dwarf', lines: [0, 1] },
    { headline: 'A long future', lines: [2, 3] },
  ],
  'brown-dwarf': [
    { headline: 'Brown dwarf', lines: [0] },
    { headline: 'Cooling', lines: [1] },
  ],
  'first-stars': [
    { headline: 'First stars', lines: [0, 1] },
    { headline: 'Nothing left', lines: [2, 3] },
  ],
}

function openingSteps(id: StarPathId): CalmStep[] {
  const path = starPath(id)
  const stills = PATH_STILLS[id]
  return [
    {
      slug: '',
      poster: openingPoster(TRUNK_STILLS.cloud.name),
      eyebrow: PAGE_SUBTITLE,
      headline: PAGE_TITLE,
      paragraphs: [OPENING_TRUNK[0], OPENING_TRUNK[1]],
    },
    {
      slug: TRUNK_STILLS.protostar.name,
      poster: openingPoster(TRUNK_STILLS.protostar.name),
      headline: 'A young star',
      paragraphs: [OPENING_TRUNK[2], OPENING_TRUNK[3]],
    },
    {
      slug: TRUNK_STILLS.choose.name,
      poster: openingPoster(TRUNK_STILLS.choose.name),
      eyebrow: OPENING_HEADING,
      headline: 'Mass of the star',
      paragraphs: [CHOICE_LINE],
      choice: true,
    },
    ...CALM_PATHS[id].map((step, index): CalmStep => ({
      slug: stills[index]!.name,
      poster: openingPoster(stills[index]!.name),
      eyebrow: index === 0 ? path.label : undefined,
      headline: step.headline,
      // The first still also tells how the planets formed and how the star ignited (or didn't).
      paragraphs: [
        ...(index === 0 ? [PLANETS_LINE, path.planets, CLEARING_LINE, path.ignition] : []),
        ...step.lines.map((line) => path.life[line]!),
      ],
    })),
    {
      slug: TRUNK_STILLS.sky.name,
      poster: openingPoster(TRUNK_STILLS.sky.name),
      headline: 'Many stars later',
      paragraphs: [HANDOFF_LINE],
      tryAnother: true,
    },
  ]
}

/** Every step for the path `id`: the opening along it, each beat, then the ending. */
export function calmSteps(id: StarPathId): CalmStep[] {
  return [...openingSteps(id), ...BEAT_STEPS]
}

const BEAT_STEPS: CalmStep[] = [
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

/** The default path's steps: the Sun's (decision 9.5). */
export const CALM_STEPS: CalmStep[] = calmSteps(DEFAULT_STAR_PATH)

export function stepForHash(hash: string, steps: readonly CalmStep[] = CALM_STEPS): number {
  const slug = hash.replace(/^#/, '').toLowerCase()
  if (!slug) return 0
  const index = steps.findIndex((step) => step.slug === slug)
  return index >= 0 ? index : 0
}
