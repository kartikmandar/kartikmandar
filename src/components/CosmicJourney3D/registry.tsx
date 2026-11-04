// src/components/CosmicJourney3D/registry.tsx
import type React from 'react'
import { NARRATIVE, type Act, type EvidenceLink } from './narrative'
import { BEATS_META } from './beatsMeta'
import type { BeatMeta, BeatSceneProps } from './types'
import UnbuiltBeatMarker from './scenes/UnbuiltBeatMarker'
// Act I
import Beat_Textbook from './scenes/Beat_Textbook'
import Beat_Comet from './scenes/Beat_Comet'
import Beat_Trajectory from './scenes/Beat_Trajectory'
import Beat_Eclipse from './scenes/Beat_Eclipse'
import Beat_Search from './scenes/Beat_Search'
// Act II
import Beat_CodeOrbits from './scenes/Beat_CodeOrbits'
import Beat_TidalLock from './scenes/Beat_TidalLock'
import Beat_Slingshot from './scenes/Beat_Slingshot'
import Beat_ThreeSuns from './scenes/Beat_ThreeSuns'
import Beat_DualPaths from './scenes/Beat_DualPaths'
import Beat_SmashToCoach from './scenes/Beat_SmashToCoach'
// Act III
import Beat_HeraArray from './scenes/Beat_HeraArray'
import Beat_Dashboard from './scenes/Beat_Dashboard'
import Beat_MidnightOil from './scenes/Beat_MidnightOil'
import Beat_JournalClub from './scenes/Beat_JournalClub'
import Beat_LoneTrajectory from './scenes/Beat_LoneTrajectory'
import Beat_Lensing from './scenes/Beat_Lensing'
import Beat_Nufft from './scenes/Beat_Nufft'
import Beat_CygnusX1 from './scenes/Beat_CygnusX1'
// Act IV
import Beat_JonesChain from './scenes/Beat_JonesChain'
import Beat_Upstream from './scenes/Beat_Upstream'
import Beat_Instruments from './scenes/Beat_Instruments'
import Beat_Reflection from './scenes/Beat_Reflection'
import Beat_Revival from './scenes/Beat_Revival'
import Beat_Reconcile from './scenes/Beat_Reconcile'
import Beat_HonestRoad from './scenes/Beat_HonestRoad'
import Beat_RunTrekShip from './scenes/Beat_RunTrekShip'
// Act V
import Beat_Portal from './scenes/Beat_Portal'
import Beat_Etna from './scenes/Beat_Etna'
import Beat_EorWedge from './scenes/Beat_EorWedge'
import Beat_Finale from './scenes/Beat_Finale'

export interface Beat {
  id: string
  act: Act
  hud: string
  evidence?: EvidenceLink
  eyebrow?: string
  headline: string
  body?: string
  typedPhrases?: string[]
  meta: BeatMeta
  Scene: React.FC<BeatSceneProps>
}

// Every beat has a scene in the made-of-light idiom (useBeat refs, no per-frame
// re-render). UnbuiltBeatMarker remains only as a safety fallback.
const SCENES: Record<string, React.FC<BeatSceneProps>> = {
  'nao-section': Beat_Textbook,
  'comet-section': Beat_Comet,
  'decision-section': Beat_Trajectory,
  'constellation-section': Beat_Eclipse,
  'search-section-wrapper': Beat_Search,
  'new-system-section': Beat_CodeOrbits,
  'fixation-section': Beat_TidalLock,
  'slingshot-section': Beat_Slingshot,
  'lens-section': Beat_ThreeSuns,
  'internship-section': Beat_DualPaths,
  'injury-section': Beat_SmashToCoach,
  'rri-research-section': Beat_HeraArray,
  'gsoc-section': Beat_Dashboard,
  'doubling-down-section': Beat_MidnightOil,
  'journal-club-section': Beat_JournalClub,
  'bs-exit-section': Beat_LoneTrajectory,
  'lensing-section': Beat_Lensing,
  'publication-section': Beat_Nufft,
  'cygnus-publication-section': Beat_CygnusX1,
  'radiosim-section': Beat_JonesChain,
  'hera-upstream-section': Beat_Upstream,
  'instruments-section': Beat_Instruments,
  'xray-followup-section': Beat_Reflection,
  'oss-maintainer-section': Beat_Revival,
  'engineer-section': Beat_Reconcile,
  'enrolia-section': Beat_HonestRoad,
  'off-court-section': Beat_RunTrekShip,
  'admission-section': Beat_Portal,
  'arrival-section': Beat_Etna,
  'analysis-section': Beat_EorWedge,
  'journey-continues-section': Beat_Finale,
}

export const BEATS: Beat[] = NARRATIVE.map((b) => ({
  ...b,
  meta: BEATS_META[b.id]!,
  Scene: SCENES[b.id] ?? UnbuiltBeatMarker,
}))

export const SCROLL_LENGTHS = BEATS.map((b) => b.meta.scrollLength)
export const TOTAL_SCROLL_VH = SCROLL_LENGTHS.reduce((a, b) => a + b, 0)
