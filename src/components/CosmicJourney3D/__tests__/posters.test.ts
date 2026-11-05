import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BEATS_META } from '../beatsMeta'
import { NARRATIVE } from '../narrative'
import { openingPoster, OPENING_STILLS } from '../openingStills'

describe('story posters', () => {
  it('has a poster file for every beat, within budget', () => {
    for (const beat of NARRATIVE) {
      const file = join(process.cwd(), 'public', BEATS_META[beat.id]!.posterSrc)
      expect(existsSync(file), file).toBe(true)
      expect(statSync(file).size).toBeLessThan(200 * 1024)
    }
  })

  it("has a poster for every one of the opening's stills, within budget", () => {
    expect(OPENING_STILLS.length).toBeGreaterThanOrEqual(16)
    for (const still of OPENING_STILLS) {
      const file = join(process.cwd(), 'public', openingPoster(still.name))
      expect(existsSync(file), file).toBe(true)
      expect(statSync(file).size).toBeLessThan(200 * 1024)
    }
  })

  it('has the share image', () => {
    expect(existsSync(join(process.cwd(), 'public/media/my-story/share.jpg'))).toBe(true)
  })
})
