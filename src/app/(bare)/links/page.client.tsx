'use client'

import Image from 'next/image'
import { useEffect, useMemo } from 'react'
import { ExternalLink } from 'lucide-react'
import { LINKS, type LinkCategory } from '@/data/links'
import { LinkIcon } from '@/components/icons/LinkIcon'
import { TrackedLink } from '@/components/TrackedLink'
import { getPosthog } from '@/components/PostHogProvider'

const CATEGORY_ORDER: LinkCategory[] = ['primary', 'contact', 'social', 'academic', 'professional']

const CATEGORY_LABEL: Record<LinkCategory, string> = {
  primary: 'Featured',
  contact: 'Get in touch',
  social: 'Social',
  academic: 'Academic',
  professional: 'Professional',
}

export function LinksView({ src }: { src: string | null }) {
  useEffect(() => {
    if (!src) return
    const posthog = getPosthog()
    if (!posthog) return
    posthog.register({ links_src: src })
  }, [src])

  const grouped = useMemo(() => {
    const map = new Map<LinkCategory, typeof LINKS>()
    for (const link of LINKS) {
      const bucket = map.get(link.category) ?? []
      bucket.push(link)
      map.set(link.category, bucket)
    }
    return map
  }, [])

  const featured = useMemo(() => LINKS.filter((l) => l.featured), [])
  const nonFeaturedGroups = useMemo(
    () =>
      CATEGORY_ORDER.map((cat) => ({
        category: cat,
        items: (grouped.get(cat) ?? []).filter((l) => !l.featured),
      })).filter((g) => g.items.length > 0),
    [grouped],
  )

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[460px] flex-col items-center px-5 pb-16 pt-10 sm:pt-14 md:max-w-[920px]">
      <div className="flex flex-col items-center text-center">
        <div className="relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-border shadow-lg">
          <Image
            src="/kartik-mandar.jpeg"
            alt="Kartik Mandar"
            fill
            sizes="96px"
            className="object-cover"
            priority
          />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">
          Kartik Mandar
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Astrophysicist &amp; Software Developer
        </p>
      </div>

      <div className="mt-8 flex w-full flex-col gap-6">
        {featured.length > 0 && (
          <LinkSection title={CATEGORY_LABEL.primary} items={featured} src={src} />
        )}

        {nonFeaturedGroups.map(({ category, items }) => (
          <LinkSection
            key={category}
            title={CATEGORY_LABEL[category]}
            items={items}
            src={src}
          />
        ))}
      </div>

      <p className="mt-12 text-[11px] uppercase tracking-widest text-muted-foreground/70">
        kartikmandar.com
      </p>
    </div>
  )
}

function LinkSection({
  title,
  items,
  src,
}: {
  title: string
  items: typeof LINKS
  src: string | null
}) {
  return (
    <section aria-labelledby={`section-${title}`} className="flex flex-col gap-2">
      <h2
        id={`section-${title}`}
        className="px-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
      >
        {title}
      </h2>
      <ul role="list" className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {items.map((link) => (
          <li key={link.id}>
            <TrackedLink
              id={link.id}
              category={link.category}
              href={link.href}
              src={src}
              className="group flex min-h-[56px] w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-card-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md active:translate-y-0 active:shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/80 group-hover:bg-foreground/10">
                <LinkIcon icon={link.icon} className="h-5 w-5" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{link.label}</span>
                {link.description && (
                  <span className="truncate text-xs text-muted-foreground">
                    {link.description}
                  </span>
                )}
              </span>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-muted-foreground" />
            </TrackedLink>
          </li>
        ))}
      </ul>
    </section>
  )
}
