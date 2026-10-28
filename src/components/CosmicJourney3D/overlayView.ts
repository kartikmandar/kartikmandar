// src/components/CosmicJourney3D/overlayView.ts
import { SHOT_TRAVEL } from './cameraPath'

export interface OverlayView {
  kind: 'hero' | 'beat' | 'end'
  /** Hero line index, or beat index. */
  index: number
  /** Whether the copy should be on screen (it animates in/out on change). */
  visible: boolean
}

/** Copy enters just after the shot settles and leaves just before the camera departs. */
export const COPY_IN = SHOT_TRAVEL / 2 + 0.01
export const COPY_OUT = 1 - SHOT_TRAVEL / 2 - 0.01

/** The end card takes over as the camera pulls back from the final beat. */
export const END_AT = 0.9

/** What the overlay shows for the current frame (pure; React commits only changes). */
export function overlayView(input: {
  inPrologue: boolean
  heroIndex: number
  activeIndex: number
  local: number
  /** Index of the final beat (the bookend); its departure becomes the end card. */
  lastIndex?: number
}): OverlayView {
  if (input.inPrologue) return { kind: 'hero', index: input.heroIndex, visible: true }
  if (input.lastIndex !== undefined && input.activeIndex === input.lastIndex && input.local >= END_AT) {
    return { kind: 'end', index: input.activeIndex, visible: true }
  }
  return {
    kind: 'beat',
    index: input.activeIndex,
    visible: input.local >= COPY_IN && input.local <= COPY_OUT,
  }
}
