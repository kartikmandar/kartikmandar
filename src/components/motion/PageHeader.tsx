import type { ReactNode } from 'react'
import { cn } from '@/utilities/ui'
import { MaskedLines } from './MaskedLines'
import { Reveal } from './Reveal'

/**
 * The one page header: a mono eyebrow, an oversized serif title that rises in
 * line by line, and an optional lead. Replaces the per-page gradient h1s.
 */
export function PageHeader({ eyebrow, title, lead, className, children }: {
  eyebrow?: string
  title: string
  lead?: ReactNode
  className?: string
  children?: ReactNode
}) {
  return (
    <header className={cn('pt-28 pb-10 md:pt-36 md:pb-14', className)}>
      {eyebrow && <p className="mono-label text-ember mb-5">{eyebrow}</p>}
      <MaskedLines as="h1" className="font-display text-display-xl tracking-[-0.015em] text-foreground text-balance">
        {title}
      </MaskedLines>
      {lead && (
        <Reveal delay={0.15} className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground text-pretty">
          {lead}
        </Reveal>
      )}
      {children}
    </header>
  )
}
