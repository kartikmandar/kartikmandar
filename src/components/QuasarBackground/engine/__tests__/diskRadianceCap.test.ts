import { describe, it, expect } from 'vitest'
import { BLACKHOLE_FRAG } from '../shaders/blackhole.frag'
import { DISK_FRAG } from '../shaders/meshShaders'
import { CONSTANTS } from '../types'

/**
 * Unbounded disk radiance (turbulence x relativistic beaming, ~100 HDR at
 * peaks) made UnrealBloom white out the frame in pulses as the inner-disk
 * turbulence rotated (~4.7 s period). Both tiers must bound what bloom can
 * integrate.
 */
describe('disk radiance cap', () => {
  it('is a tunable constant', () => {
    expect(CONSTANTS.DISK_RADIANCE_CAP).toBeGreaterThan(0)
  })

  it('raymarched disk applies capRadiance', () => {
    expect(BLACKHOLE_FRAG).toContain('capRadiance(')
    expect(BLACKHOLE_FRAG).toContain(`#define DISK_CAP ${CONSTANTS.DISK_RADIANCE_CAP.toFixed(1)}`)
  })

  it('mesh disk applies capRadiance', () => {
    expect(DISK_FRAG).toContain('capRadiance(')
    expect(DISK_FRAG).toContain(CONSTANTS.DISK_RADIANCE_CAP.toFixed(1))
  })
})

/**
 * ACES saturates to white near luminance ~3, so capping alone cannot stop the
 * white-out when direct disk emission fills the frame: the collapse trigger
 * (15 r_s) parks the camera at the disk's outer edge (14 r_s). Proximity
 * auto-exposure dims the disk as the camera approaches, like a real camera.
 */
describe('disk proximity exposure', () => {
  it('exposure constants are tunable and ordered', () => {
    expect(CONSTANTS.DISK_EXPOSURE_MIN).toBeGreaterThan(0)
    expect(CONSTANTS.DISK_EXPOSURE_MIN).toBeLessThan(1)
    expect(CONSTANTS.DISK_EXPOSURE_NEAR_RS).toBeLessThan(CONSTANTS.DISK_EXPOSURE_FAR_RS)
    // full exposure must be restored by the narrative camera distance (40 r_s)
    expect(CONSTANTS.DISK_EXPOSURE_FAR_RS).toBeLessThanOrEqual(CONSTANTS.CAMERA_START_DISTANCE)
  })

  it('raymarched disk applies diskExposure from camera distance', () => {
    expect(BLACKHOLE_FRAG).toContain('diskExposure(')
    expect(BLACKHOLE_FRAG).toContain('length(uCamPos)')
  })

  it('mesh disk applies diskExposure from camera distance', () => {
    expect(DISK_FRAG).toContain('diskExposure(')
    expect(DISK_FRAG).toContain('length(cameraPosition)')
  })
})
