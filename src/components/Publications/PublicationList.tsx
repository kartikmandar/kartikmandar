'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/utilities/ui'

export interface PublicationEntry {
  id: string
  year: number
  topic: string
  card: ReactNode
}

const ALL = 'All'

/** Filter chips over server-rendered cards, grouped under sticky year headers. */
export function PublicationList({ entries, topics }: { entries: PublicationEntry[]; topics: string[] }) {
  const [topic, setTopic] = useState(ALL)
  const visible = entries.filter((entry) => topic === ALL || entry.topic === topic)
  const years = [...new Set(visible.map((entry) => entry.year))].sort((a, b) => b - a)

  return (
    <>
      <div role="group" aria-label="Filter by topic" className="mb-10 flex flex-wrap items-center gap-2">
        {[ALL, ...topics].map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={topic === option}
            onClick={() => setTopic(option)}
            className={cn(
              'mono-label min-h-9 rounded-full border px-3.5 transition-colors',
              topic === option ? 'border-ember text-ember' : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {option}
          </button>
        ))}
        <span aria-live="polite" className="ml-auto text-sm text-muted-foreground">
          {visible.length} {visible.length === 1 ? 'paper' : 'papers'}
        </span>
      </div>

      {years.map((year) => (
        <section key={year} className="mb-12 grid gap-4 md:grid-cols-[6rem_minmax(0,1fr)] md:gap-8">
          {/* Phones: pinned to the very top, where it shows once the top bar has slid away on scroll down. */}
          <h2 className="sticky top-0 z-[var(--z-raised)] -mx-4 self-start bg-background px-4 py-2 font-display text-3xl text-foreground md:top-24 md:mx-0 md:bg-transparent md:px-0 md:py-0 md:text-4xl">
            {year}
          </h2>
          <div className="min-w-0 space-y-6">
            {visible.filter((entry) => entry.year === year).map((entry) => <div key={entry.id}>{entry.card}</div>)}
          </div>
        </section>
      ))}
    </>
  )
}
