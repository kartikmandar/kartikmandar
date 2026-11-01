import Link from 'next/link'
import { MaskedLines } from '@/components/motion'
import { HeroLoop } from './HeroLoop'
import { StoryPortal } from './StoryPortal'

const POSITIONING = ['MSc Astrophysics @ Catania', 'HERA / 21-cm', 'X-ray binaries', 'AI engineering']

export function HomeHero() {
  return (
    <section className="relative flex min-h-svh flex-col justify-end overflow-hidden px-5 pb-10 pt-28 md:px-10 md:pb-14">
      {/* Desktop: scaled up and pushed right so the disk clears the name, with no exposed edge. */}
      <HeroLoop className="md:translate-x-[14%] md:scale-[1.3]" />
      <div aria-hidden className="absolute inset-0 bg-ember/30 mix-blend-soft-light" />
      <div aria-hidden className="absolute inset-0 bg-background/30 md:hidden" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background from-5% via-background/75 via-45% to-transparent md:via-background/45 md:via-40%" />
      <div aria-hidden className="absolute inset-0 hidden bg-gradient-to-r from-background/85 via-background/30 via-45% to-transparent md:block" />

      <div className="relative">
        <p className="mono-label mb-5 text-ember">Searching for Signals</p>
        <MaskedLines as="h1" className="font-display text-display-2xl tracking-[-0.02em] text-foreground">
          Kartik Mandar
        </MaskedLines>
        <div>
          <p className="mono-label mt-6 flex max-w-3xl flex-wrap gap-x-2 leading-relaxed text-foreground/85">
            {POSITIONING.map((item, index) => (
              <span key={item} className="whitespace-nowrap">{item}{index < POSITIONING.length - 1 && ' ·'}</span>
            ))}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="basis-full md:basis-auto">
              <StoryPortal />
            </div>
            <Link href="#work" className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
              View projects
            </Link>
            <Link href="/publications" className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
              Read papers
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
