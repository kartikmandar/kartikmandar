import { Phase, PHASE_ORDER, type PhaseState } from '@/components/QuasarBackground/engine/types'

// Dwell weights across the prologue scroll, so the hero copy is readable.
export const PHASE_WEIGHTS: Record<Phase, number> = {
  [Phase.STAR]: 3,
  [Phase.COLLAPSE]: 1.5,
  [Phase.FLASH]: 0.5,
  [Phase.SHELL]: 3,
  [Phase.BIRTH]: 2.5,
  [Phase.QUASAR]: 2.5,
}

export function phaseStateFromProgress(progress: number): PhaseState {
  if (progress <= 0) return { phase: Phase.STAR, progress: 0 }
  if (progress >= 1) return { phase: Phase.QUASAR, progress: 1 }
  const p = progress
  const total = PHASE_ORDER.reduce((a, ph) => a + PHASE_WEIGHTS[ph], 0)
  let acc = 0
  for (let i = 0; i < PHASE_ORDER.length; i++) {
    const phase = PHASE_ORDER[i]!
    const w = PHASE_WEIGHTS[phase] / total
    const start = acc
    const end = acc + w
    acc = end
    if (p < end || i === PHASE_ORDER.length - 1) {
      const local = w > 0 ? (p - start) / w : 0
      return { phase, progress: Math.max(0, Math.min(1, local)) }
    }
  }
  return { phase: Phase.QUASAR, progress: 1 }
}
