import { describe, expect, it } from 'vitest'
import { CALM_STEPS, calmSteps, stepForHash } from '../calmSteps'
import { NARRATIVE } from '../narrative'
import { HANDOFF_LINE, OPENING_TRUNK, STAR_PATHS, starPath } from '../openingStory'
import { openingPoster, OPENING_STILLS, PATH_STILLS } from '../openingStills'
import { slugFor } from '../storyView'

describe('calm mode steps', () => {
  it("follows the Sun's path by default", () => {
    expect(CALM_STEPS).toEqual(calmSteps('sun'))
  })

  for (const path of STAR_PATHS) {
    describe(path.label, () => {
      const steps = calmSteps(path.id)
      const opening = steps.slice(0, steps.length - NARRATIVE.length - 1)
      const text = opening.flatMap((step) => step.paragraphs)

      it('opens on the trunk, offers the choice, then shows the path in its own stills and the night sky', () => {
        expect(opening[0]!.slug).toBe('')
        expect(opening[0]!.paragraphs).toEqual([OPENING_TRUNK[0], OPENING_TRUNK[1]])
        expect(opening[2]!.choice).toBe(true)
        expect(opening[2]!.slug).toBe('choose')
        const stills = PATH_STILLS[path.id]
        expect(stills.length).toBeGreaterThanOrEqual(2)
        expect(stills.length).toBeLessThanOrEqual(3)
        expect(opening.slice(3, 3 + stills.length).map((step) => step.poster)).toEqual(stills.map((still) => openingPoster(still.name)))
        const sky = opening[opening.length - 1]!
        expect(sky.paragraphs).toEqual([HANDOFF_LINE])
        expect(sky.tryAnother).toBe(true)
        // Then beat 1.
        expect(steps[opening.length]!.slug).toBe(slugFor(NARRATIVE[0]!.id))
      })

      it("tells every line of the path once, in order, with how its planets formed and how it ignited", () => {
        const pathLines = [path.planets, path.ignition, ...starPath(path.id).life]
        for (const line of pathLines) expect(text.filter((candidate) => candidate === line)).toHaveLength(1)
        const lifeAt = starPath(path.id).life.map((line) => text.indexOf(line))
        expect([...lifeAt].sort((a, b) => a - b)).toEqual(lifeAt)
      })

      it('has slugs that are unique and never a beat', () => {
        const slugs = steps.map((step) => step.slug)
        expect(new Set(slugs).size).toBe(slugs.length)
        const beats = new Set(NARRATIVE.map((beat) => slugFor(beat.id)))
        for (const step of opening) expect(beats.has(step.slug)).toBe(false)
      })
    })
  }

  it('finds the choice from #choose, as the flight does', () => {
    expect(stepForHash('#choose')).toBe(2)
    expect(stepForHash('#massive-supernova', calmSteps('massive'))).toBe(5)
    expect(stepForHash('#nowhere')).toBe(0)
  })

  it('has every still on the list', () => {
    const posters = new Set(OPENING_STILLS.map((still) => openingPoster(still.name)))
    for (const path of STAR_PATHS) {
      for (const step of calmSteps(path.id).slice(0, -NARRATIVE.length - 1)) expect(posters.has(step.poster), step.poster).toBe(true)
    }
  })
})
