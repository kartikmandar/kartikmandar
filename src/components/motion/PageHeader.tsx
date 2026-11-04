import type { ReactNode } from 'react'
import { cn } from '@/utilities/ui'
import { MaskedLines } from './MaskedLines'

/**
 * The one page header: an oversized serif title that rises in line by line, and
 * an optional lead. Replaces the per-page gradient h1s.
 */
export function PageHeader({ title, lead, className, children }: {
  title: string
  lead?: ReactNode
  className?: string
  children?: ReactNode
}) {
  return (
    <header className={cn('pt-28 pb-10 md:pt-36 md:pb-14', className)}>
      <MaskedLines as="h1" className="font-display text-display-xl tracking-[-0.015em] text-foreground text-balance">
        {title}
      </MaskedLines>
      {lead && (
        // Plain on purpose: it paints with the first HTML, so it can't delay LCP or hide without JavaScript.
        <div className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground text-pretty">
          {lead}
        </div>
      )}
      {children}
    </header>
  )
}
