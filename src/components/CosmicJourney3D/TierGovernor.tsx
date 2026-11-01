'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { frameSignal, nextTier } from './tiers'
import type { QualityTier } from './types'

const WINDOW_MS = 3000
// Shaders compile while the story loads and after a tier change, so those frames don't count.
const SETTLE_MS = 5000
// Two windows in a row, so one slow moment doesn't cost a tier.
const WINDOWS_TO_ACT = 2

/**
 * Drops the quality tier when the device can't keep up, or sits at a 30 Hz cap
 * (Low Power Mode). It only ever goes down: rebuilding a tier causes a hitch, and
 * going back up could repeat it on a device that's just warm.
 */
export function TierGovernor({ quality, onChange }: { quality: QualityTier; onChange: (tier: QualityTier) => void }) {
  const state = useRef({ last: 0, windowStart: 0, ignoreUntil: 0, intervals: [] as number[], strikes: 0 })

  useEffect(() => {
    const onVisibility = () => {
      state.current.last = 0
      state.current.intervals = []
      state.current.strikes = 0
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // A new tier gets a fresh start.
  useEffect(() => {
    const s = state.current
    s.ignoreUntil = performance.now() + SETTLE_MS
    s.intervals = []
    s.strikes = 0
  }, [quality])

  useFrame(() => {
    const s = state.current
    const now = performance.now()
    const interval = s.last ? now - s.last : 0
    s.last = now
    if (now < s.ignoreUntil || interval === 0) {
      s.windowStart = now
      return
    }
    s.intervals.push(interval)
    if (now - s.windowStart < WINDOW_MS) return

    const signal = frameSignal(s.intervals)
    s.intervals = []
    s.windowStart = now
    s.strikes = signal === 'steady' ? 0 : s.strikes + 1
    if (s.strikes < WINDOWS_TO_ACT) return
    s.strikes = 0
    const next = nextTier(quality, signal)
    if (next !== quality) onChange(next)
  })

  return null
}
