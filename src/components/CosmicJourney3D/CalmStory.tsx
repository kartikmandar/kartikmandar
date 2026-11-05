'use client'

// The story without the 3D: framed stills that crossfade, one beat at a time.
// No drift, grain or chromatic aberration. J / → next, K / ← previous, Esc to the end.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CONTACT_EMAIL } from '@/constants/navigation'
import { calmSteps, stepForHash } from './calmSteps'
import { STAR_PATHS } from './openingStory'
import { massReadout, pathForMass, setStarMass, starStore, useStarMass, withStarParam } from './starChoice'

const LINK = 'underline decoration-border underline-offset-4 transition-colors hover:text-ember hover:decoration-ember'
const CONTROL = 'mono-label inline-flex min-h-11 items-center rounded-full border border-border px-4 text-foreground transition-colors hover:border-ember hover:text-ember disabled:pointer-events-none disabled:opacity-40'

export function CalmStory({ canFly, onFlight, onTimeline }: { canFly: boolean; onFlight: () => void; onTimeline: () => void }) {
  // The opening follows the chosen star (?star=, or the Sun); the choice step's buttons change it.
  const mass = useStarMass()
  const path = pathForMass(mass)
  const steps = useMemo(() => calmSteps(path), [path])
  const [index, setIndex] = useState(() => (typeof window === 'undefined' ? 0 : stepForHash(window.location.hash, calmSteps(pathForMass(starStore.getState().mass)))))
  const headingRef = useRef<HTMLHeadingElement>(null)
  const moved = useRef(false)
  const step = steps[index] ?? steps[0]!
  const lastIndex = steps.length - 1
  const chooseIndex = steps.findIndex((candidate) => candidate.choice)

  const goTo = useCallback((next: number) => {
    moved.current = true
    setIndex(Math.max(0, Math.min(lastIndex, next)))
  }, [lastIndex])

  const choose = (id: (typeof STAR_PATHS)[number]['id'], presetMass: number) => {
    setStarMass(presetMass)
    const { pathname, search, hash } = window.location
    window.history.replaceState(window.history.state, '', `${pathname}${withStarParam(search, id)}${hash}`)
  }

  // The hash follows the step, so links work and the flight or timeline can pick up here.
  useEffect(() => {
    const hash = step.slug ? `#${step.slug}` : ''
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${hash}`)
    if (!moved.current) return
    window.scrollTo(0, 0)
    headingRef.current?.focus({ preventScroll: true })
  }, [step.slug])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (event.metaKey || event.ctrlKey || event.altKey || (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return
      if (event.key === 'j' || event.key === 'J' || event.key === 'ArrowRight') {
        event.preventDefault()
        setIndex((current) => { moved.current = true; return Math.min(lastIndex, current + 1) })
      } else if (event.key === 'k' || event.key === 'K' || event.key === 'ArrowLeft') {
        event.preventDefault()
        setIndex((current) => { moved.current = true; return Math.max(0, current - 1) })
      } else if (event.key === 'Escape') {
        goTo(lastIndex)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo, lastIndex])

  return (
    <div className="mx-auto flex min-h-dvh max-w-4xl flex-col px-4 pt-20 md:pt-24">
      <h1 className="sr-only">{steps[0]!.headline}</h1>
      {/* Neighbours stay mounted (invisible) so they're loaded before the crossfade reaches them. */}
      <div aria-hidden className="relative mx-auto aspect-video w-full max-w-[calc(50dvh*16/9)] overflow-hidden rounded-lg border border-border bg-background-deep">
        {steps.map((candidate, candidateIndex) => Math.abs(candidateIndex - index) <= 1 && (
          <Image
            key={candidate.slug}
            src={candidate.poster}
            alt=""
            fill
            sizes="(max-width: 896px) 100vw, 864px"
            priority={candidateIndex === index}
            className={`object-cover transition-opacity duration-500 ${candidateIndex === index ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>

      <div className="mt-6">
        {step.eyebrow && <p className="mono-label mb-3 text-ember">{step.eyebrow}</p>}
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-display-lg text-foreground outline-none">{step.headline}</h2>
        {step.paragraphs.map((paragraph) => (
          <p key={paragraph} className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">{paragraph}</p>
        ))}
        {step.phrases && (
          <ol className="mt-3 font-mono text-sm text-muted-foreground">
            {step.phrases.map((phrase) => <li key={phrase}>{phrase}</li>)}
          </ol>
        )}
        {step.evidence && (
          <p className="mt-4">
            <a href={step.evidence.href} target="_blank" rel="noopener noreferrer" className={`text-foreground ${LINK}`}>{step.evidence.label}</a>
          </p>
        )}
        {step.choice && (
          <div className="mt-5">
            <div role="group" aria-label="Mass of the star" className="flex flex-wrap gap-2">
              {STAR_PATHS.map((preset) => (
                <button key={preset.id} type="button" aria-pressed={preset.id === path} className={`${CONTROL} ${preset.id === path ? 'border-ember text-ember' : ''}`} onClick={() => choose(preset.id, preset.mass)}>
                  {preset.label}
                </button>
              ))}
            </div>
            <p aria-live="polite" className="mt-3 font-mono text-sm text-muted-foreground">{massReadout(mass)}</p>
          </div>
        )}
        {step.tryAnother && chooseIndex >= 0 && (
          <p className="mt-4">
            <button type="button" className={`text-foreground ${LINK}`} onClick={() => goTo(chooseIndex)}>Try another star</button>
          </p>
        )}
        {step.ending && (
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-foreground">
            <li><a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>Email me</a></li>
            <li><Link href="/cv" className={LINK}>CV</Link></li>
            <li><Link href="/publications" className={LINK}>Publications</Link></li>
            <li><Link href="/" className={LINK}>Home</Link></li>
          </ul>
        )}
      </div>

      {/* Pinned, so the main controls stay on screen however long the text is. The right padding clears the audio button. */}
      <div className="sticky bottom-0 mt-auto flex flex-wrap items-center gap-3 bg-background py-4 pr-20">
        <button type="button" className={CONTROL} disabled={index === 0} onClick={() => goTo(index - 1)}>Previous</button>
        <button type="button" className={CONTROL} disabled={index === lastIndex} onClick={() => goTo(index + 1)}>Next</button>
        <span aria-live="polite" className="text-sm text-muted-foreground">{index + 1} of {steps.length}</span>
        <span className="flex flex-wrap gap-x-5 gap-y-1 sm:ml-auto">
          <button type="button" className={`text-sm text-muted-foreground ${LINK}`} onClick={onTimeline}>Read as timeline</button>
          {canFly && <button type="button" className={`text-sm text-muted-foreground ${LINK}`} onClick={onFlight}>Play the 3D flight</button>}
        </span>
      </div>

      <nav aria-label="Story chapters" className="fixed right-3 top-1/2 hidden h-[62vh] -translate-y-1/2 md:block">
        <ol className="flex h-full flex-col justify-between">
          {steps.map((candidate, candidateIndex) => (
            <li key={candidate.slug}>
              <button
                type="button"
                onClick={() => goTo(candidateIndex)}
                aria-current={candidateIndex === index ? 'step' : undefined}
                aria-label={`${candidateIndex + 1}. ${candidate.headline}`}
                title={candidate.headline}
                className="flex h-3 w-6 items-center justify-end"
              >
                <span className={`block h-0.5 rounded-full ${candidateIndex === index ? 'w-4 bg-ember' : 'w-2 bg-foreground/40'}`} />
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
