import type { Category } from './types'

/**
 * Site categories.
 * Generated from Payload CMS export on 2026-03-29.
 */
export const categories: Category[] = [
  {
    "id": 1,
    "title": "Self Doubt",
    "slug": "self-doubt",
    "breadcrumbs": [
      {
        "url": "/self-doubt",
        "label": "Self Doubt"
      }
    ]
  }
] as Category[]

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}

export function getCategoryById(id: number | string): Category | undefined {
  return categories.find((c) => c.id === id)
}
