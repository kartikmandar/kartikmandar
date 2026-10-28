// src/components/CosmicJourney3D/capture.ts
// Deterministic capture mode for before/after screenshots, posters and the home loop.
//   ?capture=1        freeze the clock and pin the scroll progress
//   &p=<0..1>         global page progress to hold (prologue + flight); default 0
//   &t=<seconds>      frozen scene clock; default 0
//   &dpr=<n>          fixed device pixel ratio; default 1
//   &ui=0             hide the DOM overlay and chapter rail
// When the frame is settled, <html data-capture="ready"> is set for automation.

export interface CaptureConfig {
  enabled: boolean
  progress: number
  time: number
  dpr: number
  hideUi: boolean
}

const OFF: CaptureConfig = { enabled: false, progress: 0, time: 0, dpr: 1, hideUi: false }

const finiteOr = (raw: string | null, fallback: number) => {
  if (raw === null || raw.trim() === '') return fallback
  const n = Number(raw)
  return Number.isFinite(n) ? n : fallback
}

export function parseCapture(search: string): CaptureConfig {
  const params = new URLSearchParams(search)
  const flag = params.get('capture')
  if (flag === null || flag === '0' || flag === 'false') return OFF
  return {
    enabled: true,
    progress: Math.max(0, Math.min(1, finiteOr(params.get('p'), 0))),
    time: Math.max(0, finiteOr(params.get('t'), 0)),
    dpr: Math.max(0.5, Math.min(3, finiteOr(params.get('dpr'), 1))),
    hideUi: params.get('ui') === '0',
  }
}

let cached: CaptureConfig | null = null

/** Browser read, parsed once per page load. Server render always gets capture off. */
export function readCapture(): CaptureConfig {
  if (typeof window === 'undefined') return OFF
  if (!cached) cached = parseCapture(window.location.search)
  return cached
}

/** Frames rendered before the capture frame counts as settled (shader warm-up, font load). */
export const CAPTURE_SETTLE_FRAMES = 30
