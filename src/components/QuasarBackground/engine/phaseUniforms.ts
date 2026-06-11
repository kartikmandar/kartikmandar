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
const SHELL_START = COLLAPSED_RADIUS + 2 * 0.9 // matches FLASH end below
const SHELL_END = 30

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
      u.shellRadius = COLLAPSED_RADIUS + 2 * 0.9 * progress
      break
    case Phase.SHELL:
      // Sedov-like deceleration: R grows fast then slows
      u.shellRadius = SHELL_START + (SHELL_END - SHELL_START) * Math.pow(progress, 0.4)
      break
    case Phase.BIRTH:
      u.shellRadius = SHELL_END + 10 * progress // remnant keeps drifting out while fading
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
