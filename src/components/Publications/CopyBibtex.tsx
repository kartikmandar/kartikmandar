'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cardActionClass } from '@/components/ContentCard/cardAction'

type CopyState = 'idle' | 'copied' | 'failed'

export function CopyBibtex({ bibtex }: { bibtex: string }) {
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(bibtex)
      setState('copied')
    } catch {
      setState('failed')
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('idle'), 2000)
  }

  return (
    <button type="button" onClick={copy} className={cardActionClass()}>
      {state === 'copied' ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
      <span aria-live="polite">
        {state === 'idle' && 'Copy BibTeX'}
        {state === 'copied' && 'Copied'}
        {state === 'failed' && 'Copy failed'}
      </span>
    </button>
  )
}
