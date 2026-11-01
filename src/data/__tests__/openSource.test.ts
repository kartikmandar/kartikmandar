import { describe, expect, it } from 'vitest'
import { OPEN_SOURCE_GROUPS } from '../openSource'

const projects = OPEN_SOURCE_GROUPS.flatMap((group) => group.projects)

describe('OPEN_SOURCE_GROUPS', () => {
  it('names each project once', () => {
    const names = projects.map((project) => project.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('gives every project a primary link that is internal or https', () => {
    for (const project of projects) {
      expect(project.links.length).toBeGreaterThan(0)
      for (const link of project.links) {
        expect(link.href).toMatch(/^(\/|https:\/\/)/)
      }
    }
  })

  it('links the pull request behind every open-PR status', () => {
    for (const project of projects.filter((candidate) => candidate.status?.includes('PR open'))) {
      expect(project.links.some((link) => link.href.includes('/pull/'))).toBe(true)
    }
  })

  it('does not point at the old RRIVis repository', () => {
    const hrefs = projects.flatMap((project) => project.links.map((link) => link.href))
    expect(hrefs.some((href) => href.includes('RRI-interferometry/RRIVis'))).toBe(false)
  })
})
