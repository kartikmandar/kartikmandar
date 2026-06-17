import { describe, it, expect } from 'vitest'
import { phaseStateFromProgress, PHASE_WEIGHTS } from '../prologuePhase'
import { Phase, PHASE_ORDER } from '@/components/QuasarBackground/engine/types'

describe('phaseStateFromProgress', () => {
  it('starts at STAR progress 0 and ends at QUASAR progress 1', () => {
    expect(phaseStateFromProgress(0)).toEqual({ phase: Phase.STAR, progress: 0 })
    expect(phaseStateFromProgress(1)).toEqual({ phase: Phase.QUASAR, progress: 1 })
  })

  it('clamps out-of-range input', () => {
    expect(phaseStateFromProgress(-0.5)).toEqual({ phase: Phase.STAR, progress: 0 })
    expect(phaseStateFromProgress(2)).toEqual({ phase: Phase.QUASAR, progress: 1 })
  })

  it('visits every phase in PHASE_ORDER as progress increases', () => {
    const seen: Phase[] = []
    for (let p = 0; p <= 1.00001; p += 0.001) {
      const ph = phaseStateFromProgress(p).phase
      if (seen[seen.length - 1] !== ph) seen.push(ph)
    }
    expect(seen).toEqual(PHASE_ORDER)
  })

  it('phase progress runs 0..1 within each phase and never goes backwards in phase index', () => {
    let lastIdx = -1
    for (let p = 0; p <= 1.00001; p += 0.005) {
      const { phase, progress } = phaseStateFromProgress(p)
      expect(progress).toBeGreaterThanOrEqual(-1e-9)
      expect(progress).toBeLessThanOrEqual(1 + 1e-9)
      const idx = PHASE_ORDER.indexOf(phase)
      expect(idx).toBeGreaterThanOrEqual(lastIdx)
      lastIdx = idx
    }
  })

  it('every phase has a positive weight', () => {
    for (const ph of PHASE_ORDER) expect(PHASE_WEIGHTS[ph]).toBeGreaterThan(0)
  })
})
