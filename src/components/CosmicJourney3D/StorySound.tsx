// src/components/CosmicJourney3D/StorySound.tsx
'use client'

// Feeds the flight into the site's sound while the visitor has it switched on.

import { useEffect } from 'react'
import { addEffect } from '@react-three/fiber'
import { isSoundOn, NEUTRAL_MIX, playNotes, setSoundMix } from '@/lib/audioEngine'
import { overlayView } from './overlayView'
import { BEATS } from './registry'
import { arrivalNotes, FULL_SCROLL_SPEED, openingSwell, storyMix } from './soundMix'
import { journeyFrame } from './store'
import { pathForMass, starStore } from './starChoice'

const MIX_INTERVAL_SECONDS = 1 / 15
const SPEED_SMOOTHING_PER_SECOND = 6
/** Fast scrolling crosses many beats; a note per beat would chatter. */
const MIN_NOTE_GAP_SECONDS = 0.7

export function StorySound() {
  useEffect(() => {
    let wasOn = false
    let lastRaw = 0
    let scrollSpeed = 0
    let sinceMix = 0
    let lastNoteAge = MIN_NOTE_GAP_SECONDS
    let arrivedAt = -1

    const unsubscribe = addEffect(() => {
      const f = journeyFrame
      const instant = f.dt > 0 ? Math.abs(f.raw - lastRaw) / f.dt / FULL_SCROLL_SPEED : 0
      lastRaw = f.raw
      scrollSpeed += (instant - scrollSpeed) * Math.min(1, SPEED_SMOOTHING_PER_SECOND * f.dt)
      lastNoteAge += f.dt
      sinceMix += f.dt

      const view = overlayView({
        inOpening: f.flight <= 0,
        openingIndex: 0,
        activeIndex: f.activeIndex,
        local: f.local[f.activeIndex] ?? 0,
        lastIndex: BEATS.length - 1,
      })
      const beat = view.kind === 'beat' && view.visible ? view.index : -1

      if (!isSoundOn()) {
        wasOn = false
        return
      }
      // Switching on in the middle of a beat isn't an arrival.
      if (!wasOn) arrivedAt = beat
      wasOn = true

      if (beat >= 0 && beat !== arrivedAt && lastNoteAge >= MIN_NOTE_GAP_SECONDS) {
        arrivedAt = beat
        lastNoteAge = 0
        playNotes(arrivalNotes(beat))
      }
      if (sinceMix >= MIX_INTERVAL_SECONDS) {
        sinceMix = 0
        // The sub swells at the star's ignition and its ending; the opening is over once the hand-off begins.
        const event = f.handoff > 0 ? null : openingSwell(pathForMass(starStore.getState().mass), f.opening)
        setSoundMix(storyMix({ scrollSpeed, cameraSpeed: f.cameraSpeed, swell: event?.swell ?? 0, level: event?.level ?? 0 }))
      }
    })

    // A hidden tab stops this loop, so it mustn't leave a whoosh running.
    const onVisibility = () => { if (document.hidden) setSoundMix(NEUTRAL_MIX) }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      unsubscribe()
      document.removeEventListener('visibilitychange', onVisibility)
      setSoundMix(NEUTRAL_MIX)
    }
  }, [])

  return null
}
