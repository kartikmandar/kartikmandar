import type { PerspectiveCamera } from 'three'

/** Narrative phases, in order. Numeric so they can feed a shader uniform. */
export enum Phase {
  STAR = 0,
  COLLAPSE = 1,
  FLASH = 2,
  SHELL = 3,
  BIRTH = 4,
  QUASAR = 5,
}

export const PHASE_ORDER: Phase[] = [
  Phase.STAR,
  Phase.COLLAPSE,
  Phase.FLASH,
  Phase.SHELL,
  Phase.BIRTH,
  Phase.QUASAR,
]

/** Seconds. STAR and QUASAR are open-ended (no entry). */
export const PHASE_DURATIONS: Partial<Record<Phase, number>> = {
  [Phase.COLLAPSE]: 1.5,
  [Phase.FLASH]: 0.4,
  [Phase.SHELL]: 8,
  [Phase.BIRTH]: 4,
}

export interface PhaseState {
  phase: Phase
  /** 0..1 within the current phase (0 for open-ended STAR, 1 for QUASAR). */
  progress: number
}

export interface PhaseInputs {
  dt: number
  cameraDistance: number
  userInteracted: boolean
  reducedMotion: boolean
}

/** Implemented by both tiers. index.tsx owns camera + controls. */
export interface SceneRenderer {
  init(container: HTMLElement, camera: PerspectiveCamera): void
  setPhase(state: PhaseState): void
  update(dt: number): void
  resize(width: number, height: number): void
  dispose(): void
}

/**
 * All tunables in one place (spec: "named constants, expected to be tuned").
 * Scene unit: 1 = 1 Schwarzschild radius (r_s).
 */
export const CONSTANTS = {
  // camera
  CAMERA_START_DISTANCE: 40,
  CAMERA_MIN_DISTANCE: 8,
  CAMERA_MAX_DISTANCE: 300,
  DPR_CAP: 2,
  // narrative
  STAR_RADIUS: 10,
  COLLAPSE_TRIGGER_DISTANCE: 15,
  IDLE_AUTOPLAY_SECONDS: 12,
  // disk / jets (r_s units)
  DISK_INNER_RS: 3,
  DISK_OUTER_RS: 14,
  /**
   * HDR luminance ceiling for disk emission. Identity for the typical disk
   * (1-6); clips the rare turbulence x beaming peaks (~100) that otherwise
   * drive UnrealBloom into periodic full-frame white-outs up close.
   */
  DISK_RADIANCE_CAP: 8,
  /**
   * Proximity auto-exposure: ACES saturates to white near luminance ~3, and
   * the collapse trigger (15 r_s) parks the camera at the disk's outer edge,
   * so direct emission whites out the frame in pulses as the turbulence
   * rotates. Dim the disk toward EXPOSURE_MIN as camera distance falls from
   * FAR to NEAR (r_s); full tuned look is restored by the 40 r_s start.
   */
  DISK_EXPOSURE_MIN: 0.12,
  DISK_EXPOSURE_NEAR_RS: 10,
  DISK_EXPOSURE_FAR_RS: 28,
  ESCAPE_RADIUS_RS: 60,
  JET_LENGTH_RS: 50,
  JET_HALF_ANGLE_DEG: 4,
  // tiering / performance
  BENCHMARK_FRAME_MS: 12,
  BENCHMARK_FRAMES: 10,
  BENCHMARK_SIZE: 256,
  WATCHDOG_FPS: 30,
  WATCHDOG_SECONDS: 5,
  RESOLUTION_SCALE_MIN: 0.5,
  MESH_TIER_MAX_POLAR_DEG: 35,
  // background sky
  SKY_CUBEMAP_SIZE: 1024,
  // bloom
  BLOOM_STRENGTH: 1.2,
  BLOOM_RADIUS: 0.6,
  BLOOM_THRESHOLD: 0.85,
} as const
