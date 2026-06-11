import {
  CONSTANTS,
  Phase,
  PHASE_DURATIONS,
  PHASE_ORDER,
  type PhaseInputs,
  type PhaseState,
} from './types'

/**
 * Pure narrative state machine. Fed inputs each frame by index.tsx;
 * renderers consume the resulting PhaseState. No DOM, no Three.js.
 */
export class PhaseMachine {
  private phaseIndex = 0
  private elapsed = 0
  private idleSeconds = 0

  /** Seconds until idle auto-play would fire (full window when idle resets). */
  get idleRemainingSeconds(): number {
    return Math.max(0, CONSTANTS.IDLE_AUTOPLAY_SECONDS - this.idleSeconds)
  }

  get state(): PhaseState {
    const phase = PHASE_ORDER[this.phaseIndex] ?? Phase.QUASAR
    const duration = PHASE_DURATIONS[phase]
    if (duration !== undefined) {
      return { phase, progress: Math.min(this.elapsed / duration, 1) }
    }
    return { phase, progress: phase === Phase.QUASAR ? 1 : 0 }
  }

  update(inputs: PhaseInputs): PhaseState {
    const phase = PHASE_ORDER[this.phaseIndex] ?? Phase.QUASAR

    if (phase === Phase.STAR) {
      if (inputs.userInteracted || inputs.reducedMotion) this.idleSeconds = 0
      else this.idleSeconds += inputs.dt

      const zoomTriggered = inputs.cameraDistance < CONSTANTS.COLLAPSE_TRIGGER_DISTANCE
      const idleTriggered =
        !inputs.reducedMotion && this.idleSeconds >= CONSTANTS.IDLE_AUTOPLAY_SECONDS
      if (zoomTriggered || idleTriggered) this.advance(0)
      return this.state
    }

    // Timed phases: accumulate, carrying leftover dt across boundaries.
    this.elapsed += inputs.dt
    let duration = PHASE_DURATIONS[PHASE_ORDER[this.phaseIndex] ?? Phase.QUASAR]
    while (duration !== undefined && this.elapsed >= duration) {
      this.advance(this.elapsed - duration)
      duration = PHASE_DURATIONS[PHASE_ORDER[this.phaseIndex] ?? Phase.QUASAR]
    }
    return this.state
  }

  private advance(carrySeconds: number): void {
    if (this.phaseIndex < PHASE_ORDER.length - 1) {
      this.phaseIndex += 1
      this.elapsed = carrySeconds
    } else {
      // Unreachable via update(): QUASAR has no duration, so the while loop never advances past it. Kept as a defensive guard.
      this.elapsed = 0
    }
  }
}
