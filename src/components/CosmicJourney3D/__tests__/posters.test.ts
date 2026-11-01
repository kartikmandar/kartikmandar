import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BEATS_META } from '../beatsMeta'
import { NARRATIVE } from '../narrative'

describe('story posters', () => {
  it('has a poster file for every beat, within budget', () => {
    for (const beat of NARRATIVE) {
      const file = join(process.cwd(), 'public', BEATS_META[beat.id]!.posterSrc)
      expect(existsSync(file), file).toBe(true)
      expect(statSync(file).size).toBeLessThan(200 * 1024)
    }
  })

  it('has the share image', () => {
    expect(existsSync(join(process.cwd(), 'public/media/my-story/share.jpg'))).toBe(true)
  })
})
