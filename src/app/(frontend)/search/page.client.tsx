'use client'
import React, { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import type { SearchDocument } from '@/data/types'
import { useSearchParams, useRouter } from 'next/navigation'

const TYPE_LABELS: Record<string, string> = {
  post: 'Post',
  project: 'Project',
  talk: 'Talk',
  page: 'Page',
}

const TYPE_COLORS: Record<string, string> = {
  post: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  project: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  talk: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  page: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

export default function SearchPageClient({
  searchIndex,
}: {
  searchIndex: SearchDocument[]
}) {
  const { setHeaderTheme } = useHeaderTheme()
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)

  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  const fuse = useMemo(
    () =>
      new Fuse(searchIndex, {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'description', weight: 1 },
          { name: 'categories', weight: 0.5 },
          { name: 'slug', weight: 0.3 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [searchIndex],
  )

  const results = useMemo(() => {
    if (!query.trim()) return []
    return fuse.search(query).map((r) => r.item)
  }, [fuse, query])

  const handleChange = (value: string) => {
    setQuery(value)
    const params = new URLSearchParams()
    if (value) params.set('q', value)
    router.replace(`/search${value ? `?${params.toString()}` : ''}`, { scroll: false })
  }

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Search</h1>

          <div className="max-w-[50rem] mx-auto">
            <form onSubmit={(e) => e.preventDefault()}>
              <Label htmlFor="search" className="sr-only">
                Search
              </Label>
              <Input
                id="search"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Search posts, projects, and talks..."
                autoFocus
              />
            </form>
          </div>
        </div>
      </div>

      <div className="container">
        {query.trim() && results.length === 0 && (
          <p className="text-muted-foreground text-center">No results found.</p>
        )}

        {results.length > 0 && (
          <div className="grid gap-4 max-w-3xl mx-auto">
            {results.map((doc) => (
              <Link
                key={`${doc.type}-${doc.slug}`}
                href={doc.url}
                className="block border border-border rounded-lg p-5 hover:shadow-md hover:border-primary/50 transition-all duration-200 bg-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                      {doc.title}
                    </h3>
                    {doc.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {doc.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${TYPE_COLORS[doc.type] || TYPE_COLORS.page}`}
                  >
                    {TYPE_LABELS[doc.type] || doc.type}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
