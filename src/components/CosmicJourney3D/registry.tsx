// src/components/CosmicJourney3D/registry.tsx
import type React from 'react'
import { NARRATIVE } from './narrative'
import { BEATS_META } from './beatsMeta'
import type { BeatMeta, SceneProps } from './types'
import UnbuiltBeatMarker from './scenes/UnbuiltBeatMarker'
import Beat_Textbook from './scenes/Beat_Textbook'
import Beat_Comet from './scenes/Beat_Comet'
import Beat_FocusLens from './scenes/Beat_FocusLens'
import Beat_Constellation from './scenes/Beat_Constellation'
import Beat_Search from './scenes/Beat_Search'
import Beat_Network from './scenes/Beat_Network'
import Beat_Compass from './scenes/Beat_Compass'
import Beat_Slingshot from './scenes/Beat_Slingshot'
import Beat_MajorLens from './scenes/Beat_MajorLens'
import Beat_DualPaths from './scenes/Beat_DualPaths'
import Beat_Shuttlecock from './scenes/Beat_Shuttlecock'
import Beat_SignalToSim from './scenes/Beat_SignalToSim'
import Beat_Dashboard from './scenes/Beat_Dashboard'
import Beat_Visibility from './scenes/Beat_Visibility'
import Beat_MidnightOil from './scenes/Beat_MidnightOil'
import Beat_ExitFork from './scenes/Beat_ExitFork'
import Beat_Lensing from './scenes/Beat_Lensing'
import Beat_PaperPlane from './scenes/Beat_PaperPlane'
import Beat_Milestones from './scenes/Beat_Milestones'
import Beat_Workbench from './scenes/Beat_Workbench'
import Beat_Walker from './scenes/Beat_Walker'

export interface Beat {
  id: string
  eyebrow?: string
  headline: string
  body?: string
  typedPhrases?: string[]
  meta: BeatMeta
  Scene: React.FC<SceneProps>
}

// Built scenes are registered here; everything else flies as an UnbuiltBeatMarker
// until its own phase replaces it. Origin black hole is mounted separately at ORIGIN_ANCHOR.
const SCENES: Record<string, React.FC<SceneProps>> = {
  'nao-section': Beat_Textbook,
  'comet-section': Beat_Comet,
  'decision-section': Beat_FocusLens,
  'constellation-section': Beat_Constellation,
  'search-section-wrapper': Beat_Search,
  'new-system-section': Beat_Network,
  'fixation-section': Beat_Compass,
  'slingshot-section': Beat_Slingshot,
  'lens-section': Beat_MajorLens,
  'internship-section': Beat_DualPaths,
  'injury-section': Beat_Shuttlecock,
  'rri-research-section': Beat_SignalToSim,
  'gsoc-section': Beat_Dashboard,
  'radio-section': Beat_Visibility,
  'doubling-down-section': Beat_MidnightOil,
  'bs-exit-section': Beat_ExitFork,
  'lensing-section': Beat_Lensing,
  'publication-section': Beat_PaperPlane,
  'cygnus-publication-section': Beat_Milestones,
  'analysis-section': Beat_Workbench,
  'journey-continues-section': Beat_Walker,
}

export const BEATS: Beat[] = NARRATIVE.map((b) => ({
  ...b,
  meta: BEATS_META[b.id]!,
  Scene: SCENES[b.id] ?? UnbuiltBeatMarker,
}))

export const SCROLL_LENGTHS = BEATS.map((b) => b.meta.scrollLength)
export const TOTAL_SCROLL_VH = SCROLL_LENGTHS.reduce((a, b) => a + b, 0)
