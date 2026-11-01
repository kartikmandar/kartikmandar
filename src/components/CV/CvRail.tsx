'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/utilities/ui'

/** The sticky section list beside the CV; marks the section being read. */
export function CvRail({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entering = entries.filter((entry) => entry.isIntersecting)
        const top = entering.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (top) setActive(top.target.id)
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )
    for (const { id } of sections) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [sections])

  return (
    <nav aria-label="CV sections" className="sticky top-28 hidden self-start md:block print:hidden">
      <ul className="space-y-1.5">
        {sections.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={active === id ? 'true' : undefined}
              className={cn(
                'mono-label flex min-h-7 items-center gap-2 transition-colors hover:text-foreground',
                active === id ? 'text-ember' : 'text-muted-foreground',
              )}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
