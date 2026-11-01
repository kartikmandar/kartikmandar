import Image from 'next/image'
import Link from 'next/link'
import { BEATS_META } from './beatsMeta'
import { CONTACT_EMAIL } from '@/constants/navigation'
import { HERO_PHASES, NARRATIVE, PAGE_SUBTITLE, PAGE_TITLE } from './narrative'

// Shown instead of the canvas when JavaScript is off. Reduced motion and missing
// WebGL reveal the same article through globals.css.
const NO_SCRIPT_CSS = '.story-article{position:static;width:auto;height:auto;margin:0;clip-path:none;overflow:visible;white-space:normal}.story-article-poster{display:block}.story-loader{display:none!important}'

/**
 * The whole story as plain HTML, so search engines, screen readers and visitors
 * without WebGL get every beat. Over the flight it stays in the document but
 * visually hidden, and the canvas is the visual enhancement of it.
 */
export function StoryArticle() {
  return (
    <>
      <noscript>
        <style>{NO_SCRIPT_CSS}</style>
      </noscript>
      <article className="story-article">
        <header className="story-article-header">
          <h1 className="font-display text-display-xl text-foreground">{PAGE_TITLE}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{PAGE_SUBTITLE}</p>
          <div className="mt-10 space-y-3 text-lg text-foreground/85">
            {HERO_PHASES.map((phase) => <p key={phase.phase}>{phase.text}</p>)}
          </div>
        </header>

        {NARRATIVE.map((beat) => (
          <section key={beat.id} className="story-article-beat">
            {/* Decorative: the text below carries the meaning. Display none keeps it unloaded during the flight. */}
            <Image
              src={BEATS_META[beat.id]!.posterSrc}
              alt=""
              width={1600}
              height={900}
              sizes="(max-width: 720px) 100vw, 672px"
              className="story-article-poster mb-6 rounded-lg"
            />
            {beat.eyebrow && <p className="mono-label mb-3 text-ember">{beat.eyebrow}</p>}
            <h2 className="font-display text-display-md text-foreground">{beat.headline}</h2>
            {beat.body && <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{beat.body}</p>}
            {beat.typedPhrases && (
              <ol className="mt-3 font-mono text-sm text-muted-foreground">
                {beat.typedPhrases.map((phrase) => <li key={phrase}>{phrase}</li>)}
              </ol>
            )}
            {beat.evidence && (
              <p className="mt-4">
                <a
                  href={beat.evidence.href}
                  className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-ember hover:decoration-ember"
                >
                  {beat.evidence.label}
                </a>
              </p>
            )}
          </section>
        ))}

        <section className="story-article-beat">
          <p className="mono-label mb-3 text-ember">Still searching for signals</p>
          <h2 className="font-display text-display-md text-foreground">Let&apos;s talk.</h2>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            Research, open-source tools, or a hard problem that needs both. I&apos;d love to hear from you.
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-foreground">
            <li><a href={`mailto:${CONTACT_EMAIL}`} className="underline decoration-ember underline-offset-4 hover:text-ember">Email me</a></li>
            <li><Link href="/cv" className="underline decoration-border underline-offset-4 hover:text-ember">CV</Link></li>
            <li><Link href="/publications" className="underline decoration-border underline-offset-4 hover:text-ember">Publications</Link></li>
            <li><Link href="/" className="underline decoration-border underline-offset-4 hover:text-ember">Home</Link></li>
          </ul>
        </section>
      </article>
    </>
  )
}
