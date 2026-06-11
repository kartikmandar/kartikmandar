import { describe, it, expect } from 'vitest'
import { PhaseMachine } from '../PhaseMachine'
import { Phase, CONSTANTS, PHASE_DURATIONS } from '../types'

/** Inputs for a user idling at the start distance. */
const idle = (dt: number) => ({
  dt,
  cameraDistance: CONSTANTS.CAMERA_START_DISTANCE,
  userInteracted: false,
  reducedMotion: false,
})

describe('PhaseMachine', () => {
  it('starts in STAR with progress 0', () => {
    const m = new PhaseMachine()
    expect(m.state).toEqual({ phase: Phase.STAR, progress: 0 })
  })

  it('advances to COLLAPSE when camera zooms below the trigger distance', () => {
    const m = new PhaseMachine()
    const s = m.update({ ...idle(0.016), cameraDistance: CONSTANTS.COLLAPSE_TRIGGER_DISTANCE - 1 })
    expect(s.phase).toBe(Phase.COLLAPSE)
  })

  it('auto-plays after the idle timeout', () => {
    const m = new PhaseMachine()
    for (let t = 0; t < CONSTANTS.IDLE_AUTOPLAY_SECONDS; t += 0.1) m.update(idle(0.1))
    expect(m.state.phase).toBe(Phase.COLLAPSE)
  })

  it('does not auto-play under reduced motion', () => {
    const m = new PhaseMachine()
    for (let t = 0; t < CONSTANTS.IDLE_AUTOPLAY_SECONDS * 2; t += 0.1) {
      m.update({ ...idle(0.1), reducedMotion: true })
    }
    expect(m.state.phase).toBe(Phase.STAR)
  })

  it('does not silently accumulate idle time while reducedMotion is true', () => {
    const m = new PhaseMachine()
    for (let i = 0; i < 200; i++) m.update({ ...idle(0.1), reducedMotion: true }) // 20s
    expect(m.state.phase).toBe(Phase.STAR)
    // Toggling reduced motion off must NOT fire the idle trigger immediately
    m.update({ ...idle(0.016), reducedMotion: false })
    expect(m.state.phase).toBe(Phase.STAR)
  })

  it('zoom trigger still works under reduced motion', () => {
    const m = new PhaseMachine()
    const s = m.update({ ...idle(0.016), reducedMotion: true, cameraDistance: 10 })
    expect(s.phase).toBe(Phase.COLLAPSE)
  })

  it('interaction resets the idle timer', () => {
    const m = new PhaseMachine()
    for (let t = 0; t < 10; t += 0.1) m.update(idle(0.1)) // 10s idle
    m.update({ ...idle(0.1), userInteracted: true })      // reset
    for (let t = 0; t < 10; t += 0.1) m.update(idle(0.1)) // 10s more (< 12 again)
    expect(m.state.phase).toBe(Phase.STAR)
  })

  it('runs timed phases in order with correct durations', () => {
    const m = new PhaseMachine()
    m.update({ ...idle(0.016), cameraDistance: 10 }) // -> COLLAPSE
    const expectSequence: Array<[Phase, number]> = [
      [Phase.COLLAPSE, PHASE_DURATIONS[Phase.COLLAPSE] ?? 0],
      [Phase.FLASH, PHASE_DURATIONS[Phase.FLASH] ?? 0],
      [Phase.SHELL, PHASE_DURATIONS[Phase.SHELL] ?? 0],
      [Phase.BIRTH, PHASE_DURATIONS[Phase.BIRTH] ?? 0],
    ]
    for (const [phase, duration] of expectSequence) {
      expect(m.state.phase).toBe(phase)
      for (let t = 0; t < duration; t += 0.05) m.update(idle(0.05))
    }
    expect(m.state.phase).toBe(Phase.QUASAR)
  })

  it('reports progress within a timed phase and clamps to 1', () => {
    const m = new PhaseMachine()
    m.update({ ...idle(0.016), cameraDistance: 10 }) // -> COLLAPSE (1.5s)
    m.update(idle(0.75))
    expect(m.state.progress).toBeCloseTo(0.5, 5)
  })

  it('carries leftover dt across a phase boundary', () => {
    const m = new PhaseMachine()
    m.update({ ...idle(0.016), cameraDistance: 10 }) // -> COLLAPSE (1.5s)
    m.update(idle(1.6)) // 0.1s into FLASH (0.4s)
    expect(m.state.phase).toBe(Phase.FLASH)
    expect(m.state.progress).toBeCloseTo(0.1 / 0.4, 5)
  })

  it('reports seconds remaining until idle auto-play', () => {
    const m = new PhaseMachine()
    expect(m.idleRemainingSeconds).toBe(CONSTANTS.IDLE_AUTOPLAY_SECONDS)
    for (let i = 0; i < 50; i++) m.update(idle(0.1)) // 5s idle
    expect(m.idleRemainingSeconds).toBeCloseTo(CONSTANTS.IDLE_AUTOPLAY_SECONDS - 5, 5)
  })

  it('idle countdown resets on interaction', () => {
    const m = new PhaseMachine()
    for (let i = 0; i < 50; i++) m.update(idle(0.1)) // 5s idle
    m.update({ ...idle(0.1), userInteracted: true })
    expect(m.idleRemainingSeconds).toBe(CONSTANTS.IDLE_AUTOPLAY_SECONDS)
  })

  it('a huge dt lands in QUASAR with progress 1, and stays there', () => {
    const m = new PhaseMachine()
    m.update({ ...idle(0.016), cameraDistance: 10 })
    m.update(idle(1000))
    expect(m.state).toEqual({ phase: Phase.QUASAR, progress: 1 })
    m.update(idle(1000))
    expect(m.state.phase).toBe(Phase.QUASAR)
  })
})
