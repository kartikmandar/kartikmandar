import { cn } from '@/utilities/ui'

/** The shared card button style, usable from client components without the card itself. */
export function cardActionClass(primary = false): string {
  return cn(
    'inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors',
    primary ? 'bg-foreground text-primary-foreground hover:bg-ember' : 'border border-border text-foreground hover:border-ember hover:text-ember',
  )
}
