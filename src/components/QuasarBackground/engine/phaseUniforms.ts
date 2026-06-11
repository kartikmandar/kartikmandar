import { CONSTANTS, Phase, type PhaseState } from './types'

export interface PhaseUniforms {
  /** Progenitor star radius in r_s (0 = no star). */
  starRadius: number
  /** Supernova shock-shell radius in r_s (0 = no shell). */
  shellRadius: number
  /** Additive white-out intensity (HDR, >1 drives bloom). */
  flash: number
  /** 0..1 — scales the GR bending term; 0 = straight rays. */
  lensing: number
  /** 0..1 — disk ignition front from ISCO outward. */
  ignition: number
}

const COLLAPSED_RADIUS = 1.2
/** Shock front travel in r_s during the FLASH phase (0.4 s). */
const FLASH_SHOCK_REACH = 2 * 0.9
const SHELL_START = COLLAPSED_RADIUS + FLASH_SHOCK_REACH
const SHELL_END = 30
/** Additional remnant drift in r_s during BIRTH. */
const BIRTH_SHELL_DRIFT = 10

export function derivePhaseUniforms({ phase, progress }: PhaseState): PhaseUniforms {
  const u: PhaseUniforms = { starRadius: 0, shellRadius: 0, flash: 0, lensing: 0, ignition: 0 }

  switch (phase) {
    case Phase.STAR:
      u.starRadius = CONSTANTS.STAR_RADIUS
      break
    case Phase.COLLAPSE:
      // ease-in contraction: 10 -> 1.2 r_s
      u.starRadius =
        CONSTANTS.STAR_RADIUS - (CONSTANTS.STAR_RADIUS - COLLAPSED_RADIUS) * progress * progress
      break
    case Phase.FLASH:
      // star winks out, core flash, shock front launches
      u.starRadius = COLLAPSED_RADIUS * (1 - progress)
      u.flash = 4 * Math.pow(1 - progress, 1.5)
      u.shellRadius = COLLAPSED_RADIUS + FLASH_SHOCK_REACH * progress
      break
    case Phase.SHELL:
      // Sedov-like deceleration: R grows fast then slows
      u.shellRadius = SHELL_START + (SHELL_END - SHELL_START) * Math.pow(progress, 0.4)
      break
    case Phase.BIRTH:
      // Shell drifts outward and fades. At p=1 shellRadius=SHELL_END+BIRTH_SHELL_DRIFT;
      // QUASAR resets it to 0. The jump is safe: the shaders fade shell alpha to 0
      // during BIRTH (fade = 1 - progress), so it is invisible before the reset.
      u.shellRadius = SHELL_END + BIRTH_SHELL_DRIFT * progress
      u.lensing = progress
      u.ignition = progress
      break
    case Phase.QUASAR:
      u.lensing = 1
      u.ignition = 1
      break
  }
  return u
}
