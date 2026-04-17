'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Download, Copy, Check } from 'lucide-react'

type Props = { baseUrl: string }

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

export function QrGenerator({ baseUrl }: Props) {
  const [rawSrc, setRawSrc] = useState('')
  const [label, setLabel] = useState('')
  const [svgMarkup, setSvgMarkup] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const src = slugify(rawSrc)

  const targetUrl = useMemo(() => {
    const base = `${baseUrl.replace(/\/$/, '')}/links`
    return src ? `${base}?src=${encodeURIComponent(src)}` : base
  }, [baseUrl, src])

  const filenameStem = `qr-links-${src || 'default'}`

  useEffect(() => {
    let cancelled = false
    QRCode.toString(targetUrl, {
      type: 'svg',
      width: 400,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((svg) => {
        if (!cancelled) setSvgMarkup(svg)
      })
      .catch(() => {
        if (!cancelled) setSvgMarkup('')
      })
    return () => {
      cancelled = true
    }
  }, [targetUrl])

  const handleDownloadSvg = () => {
    if (!svgMarkup) return
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filenameStem}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPng = async () => {
    try {
      const canvas = canvasRef.current ?? document.createElement('canvas')
      await QRCode.toCanvas(canvas, targetUrl, {
        width: 800,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#ffffff' },
      })
      const dataUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `${filenameStem}.png`
      a.click()
    } catch {
      /* noop */
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* noop */
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col gap-6 px-5 pb-16 pt-10 sm:pt-14">
      <header className="flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Secret tool
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">QR generator</h1>
        <p className="text-sm text-muted-foreground">
          Mint a per-source QR for /links. The <code className="rounded bg-muted px-1 py-0.5 text-xs">src</code> tag
          is encoded into the QR target so each placement is distinguishable in analytics.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">
            Source tag <span className="text-muted-foreground">(slug used in analytics)</span>
          </span>
          <input
            type="text"
            value={rawSrc}
            onChange={(e) => setRawSrc(e.target.value)}
            placeholder="iau-poster-2026"
            autoComplete="off"
            spellCheck={false}
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
          />
          {rawSrc && src !== rawSrc.trim().toLowerCase() && (
            <span className="text-xs text-muted-foreground">
              normalized → <code className="font-mono">{src}</code>
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">
            Label <span className="text-muted-foreground">(for your reference only, not in URL)</span>
          </span>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="IAU Poster Oct 2026"
            autoComplete="off"
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-3 py-2">
          <code className="min-w-0 flex-1 truncate text-xs font-mono text-foreground/80">
            {targetUrl}
          </code>
          <button
            type="button"
            onClick={handleCopyUrl}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            aria-label="Copy URL"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-4">
        <div
          className="overflow-hidden rounded-lg bg-white p-3"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
          aria-label={`QR code for ${targetUrl}`}
          role="img"
        />
        <p className="text-center text-xs text-muted-foreground">
          {label ? label : 'No label set'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleDownloadSvg}
          disabled={!svgMarkup}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          SVG
        </button>
        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={!svgMarkup}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          PNG (800px)
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </div>
  )
}
