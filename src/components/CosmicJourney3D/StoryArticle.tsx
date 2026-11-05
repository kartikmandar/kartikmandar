import Image from 'next/image'
import Link from 'next/link'
import { BEATS_META } from './beatsMeta'
import { CONTACT_EMAIL } from '@/constants/navigation'
import { slugFor } from './storyView'
import { NARRATIVE, PAGE_SUBTITLE, PAGE_TITLE } from './narrative'
import { DEFAULT_STAR_PATH, LIFETIME_FORMULA_LINE, OPENING_HEADING, openingLines, pathSummary, STAR_PATHS } from './openingStory'

const SUN_LINES = openingLines(DEFAULT_STAR_PATH)

// Shown when JavaScript is off. The timeline view reveals the same article through globals.css.
const NO_SCRIPT_CSS = '.story-article{position:static;width:auto;height:auto;margin:0;clip-path:none;overflow:visible;white-space:normal}.story-article-poster{display:block}.story-loader{display:none!important}'

/**
 * The whole story as plain HTML, so search engines, screen readers and visitors
 * without JavaScript get every beat. Over the flight it stays in the document but
 * visually hidden, calm mode replaces it, and the timeline view shows it.
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
        </header>

        {/* The Sun's path in full (the opening's default), then every other star briefly, then the hand-off into the story. */}
        <section id="timeline-opening" className="story-article-beat">
          <h2 className="font-display text-display-md text-foreground">{OPENING_HEADING}</h2>
          <div className="mt-3 space-y-3 text-lg leading-relaxed text-muted-foreground">
            {SUN_LINES.slice(0, -1).map((line) => <p key={line.text}>{line.text}</p>)}
            <p>{LIFETIME_FORMULA_LINE}</p>
          </div>
          <dl className="mt-6 space-y-4">
            {STAR_PATHS.filter((path) => path.id !== DEFAULT_STAR_PATH).map((path) => (
              <div key={path.id}>
                <dt className="mono-label text-ember">{path.label}</dt>
                <dd className="mt-1 text-lg leading-relaxed text-muted-foreground">{pathSummary(path.id).join(' ')}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-lg leading-relaxed text-foreground">{SUN_LINES[SUN_LINES.length - 1]!.text}</p>
        </section>

        {NARRATIVE.map((beat) => (
          <section key={beat.id} id={`timeline-${slugFor(beat.id)}`} className="story-article-beat">
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

        <section id="timeline-lets-talk" className="story-article-beat">
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
