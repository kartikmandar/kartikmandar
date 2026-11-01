import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { BLUR_DATA } from '@/data/blurData.generated'
import { cn } from '@/utilities/ui'
import { cardActionClass } from './cardAction'

type Variant = 'feature' | 'row' | 'compact'

export interface ContentCardProps {
  /** feature: image-backed tile. row: wide, optional image at the side. compact: image on top. */
  variant: Variant
  title: string
  titleAs?: 'h2' | 'h3'
  /** The bigger type for the lead tile in a grid (feature only). */
  prominent?: boolean
  eyebrow?: ReactNode
  meta?: ReactNode
  summary?: ReactNode
  tags?: string[]
  image?: { src: string; alt: string }
  imageSizes?: string
  /** Makes the whole card a link. Actions stay clickable above it. */
  href?: string
  external?: boolean
  cursorLabel?: string
  /** Longer content under the summary. */
  children?: ReactNode
  /** Links or buttons along the bottom (see CardAction). */
  actions?: ReactNode
  className?: string
}

function CardImage({ image, sizes, className }: { image: { src: string; alt: string }; sizes: string; className: string }) {
  const blurDataURL = BLUR_DATA[image.src]
  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      className={className}
      {...(blurDataURL ? { placeholder: 'blur' as const, blurDataURL } : {})}
    />
  )
}

function CardTitle({ title, as: Tag, href, external, className }: {
  title: string
  as: 'h2' | 'h3'
  href?: string
  external?: boolean
  className: string
}) {
  // The stretched ::after makes the whole card clickable without nesting links.
  const stretched = 'after:absolute after:inset-0 after:rounded-[inherit] focus-visible:outline-none'
  return (
    <Tag className={className}>
      {!href && title}
      {href && external && (
        <a href={href} target="_blank" rel="noopener noreferrer" className={stretched}>{title}</a>
      )}
      {href && !external && <Link href={href} className={stretched}>{title}</Link>}
    </Tag>
  )
}

/**
 * The one card on the site: projects, talks, posts and posters. Its pointer
 * spotlight runs from one shared listener (CardSpotlight), so a card ships no
 * JavaScript of its own.
 */
export function ContentCard({
  variant, title, titleAs = 'h3', prominent = false, eyebrow, meta, summary, tags, image, imageSizes,
  href, external = false, cursorLabel, children, actions, className,
}: ContentCardProps) {
  const body = (
    <>
      {eyebrow && <p className="mono-label mb-2 text-ember">{eyebrow}</p>}
      <CardTitle
        title={title}
        as={titleAs}
        href={href}
        external={external}
        className={cn(
          'font-display text-foreground text-balance',
          variant === 'feature' && prominent ? 'text-display-md' : variant === 'row' ? 'text-3xl md:text-4xl' : 'text-3xl',
        )}
      />
      {meta && <div className="mt-2 text-sm text-muted-foreground">{meta}</div>}
      {summary && (
        <div className={cn('mt-3 text-sm leading-relaxed', variant === 'feature' ? 'max-w-xl text-foreground/75' : 'text-muted-foreground')}>
          {summary}
        </div>
      )}
      {tags && tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{tag}</li>
          ))}
        </ul>
      )}
      {children}
      {actions && <div className="relative z-[var(--z-raised)] mt-6 flex flex-wrap gap-2">{actions}</div>}
    </>
  )

  if (variant === 'feature') {
    return (
      <article data-cursor={cursorLabel} className={cn('content-card group flex size-full min-h-80 flex-col justify-end p-5 md:p-6', className)}>
        {image && (
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-[inherit]">
            <CardImage
              image={image}
              sizes={imageSizes ?? '(max-width: 768px) 100vw, 33vw'}
              className="object-cover object-top opacity-60 transition duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-85"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-transparent" />
          </div>
        )}
        <div>{body}</div>
      </article>
    )
  }

  if (variant === 'row') {
    return (
      <article data-cursor={cursorLabel} className={cn('content-card group grid gap-6 p-6 md:p-8', image && 'sm:grid-cols-[12rem_minmax(0,1fr)]', className)}>
        {image && (
          <div className="relative aspect-video overflow-hidden rounded-lg sm:aspect-square">
            <CardImage
              image={image}
              sizes={imageSizes ?? '(max-width: 640px) 100vw, 192px'}
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>
        )}
        <div className="min-w-0">{body}</div>
      </article>
    )
  }

  return (
    <article data-cursor={cursorLabel} className={cn('content-card group flex h-full flex-col', className)}>
      {image && (
        <div className="relative aspect-video overflow-hidden rounded-t-[inherit]">
          <CardImage
            image={image}
            sizes={imageSizes ?? '(max-width: 768px) 100vw, 33vw'}
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div className="flex-1 p-5 md:p-6">{body}</div>
    </article>
  )
}

/** A link along the bottom of a card, kept clickable above a card-wide link. */
export function CardAction({ href, children, primary = false, external = true }: {
  href: string
  children: ReactNode
  primary?: boolean
  external?: boolean
}) {
  const className = cardActionClass(primary)
  if (!external) return <Link href={href} className={className}>{children}</Link>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <ArrowUpRight aria-hidden className="size-3.5" />
    </a>
  )
}
