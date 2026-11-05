// src/components/CosmicJourney3D/MassChoice.tsx
'use client'

// The choice (O5): how much the young star gathers. A native range input on a
// log scale, so keyboard (arrows, Page Up/Down, Home/End), touch and screen
// readers work without custom code; its readout is also its aria-valuetext.
// Dragging snaps to each path's preset; the buttons below set a preset directly.
// Choosing writes `?star=` (a query, because JourneyNav owns the hash).

import { useEffect, useRef } from 'react'
import { STAR_PATHS } from './openingStory'
import {
  MASS_MAX, MASS_MIN, PATH_BOUNDARIES, SLIDER_STEPS,
  massReadout, massToSlider, parseStarParam, pathForMass, setStarMass, sliderToMass, snapToPreset, useStarMass, withStarParam,
} from './starChoice'
import { readCapture } from './capture'

export const STAR_MASS_ID = 'journey-star-mass'
const LABEL_ID = 'journey-star-mass-label'
const THUMB_PX = 18

export function MassChoice() {
  const mass = useStarMass()
  const path = pathForMass(mass)
  const readout = massReadout(mass)
  const dragging = useRef(false)
  // Only a visitor's own choice is written to the URL, never the default on arrival.
  const touched = useRef(false)

  useEffect(() => {
    if (!touched.current || readCapture().enabled) return
    const { pathname, search, hash } = window.location
    if (parseStarParam(search) === path) return
    window.history.replaceState(window.history.state, '', `${pathname}${withStarParam(search, path)}${hash}`)
  }, [path])

  return (
    <div role="group" aria-labelledby={LABEL_ID} style={wrap}>
      <label id={LABEL_ID} htmlFor={STAR_MASS_ID} style={label}>Mass of the star</label>
      <div style={track}>
        {PATH_BOUNDARIES.map((boundary) => (
          <span
            key={boundary}
            aria-hidden
            style={{ ...tick, left: `calc(${THUMB_PX / 2}px + (100% - ${THUMB_PX}px) * ${massToSlider(boundary) / SLIDER_STEPS})` }}
          />
        ))}
        <input
          id={STAR_MASS_ID}
          className="journey-star-range"
          type="range"
          min={0}
          max={SLIDER_STEPS}
          step={1}
          value={massToSlider(mass)}
          aria-valuetext={readout}
          aria-describedby={`${LABEL_ID}-range`}
          onPointerDown={() => { dragging.current = true }}
          onPointerUp={() => { dragging.current = false }}
          onPointerCancel={() => { dragging.current = false }}
          onChange={(event) => {
            touched.current = true
            const value = Number(event.target.value)
            // Detents only while dragging: arrow keys must be able to step past a preset.
            setStarMass(sliderToMass(dragging.current ? snapToPreset(value) : value))
          }}
          style={range}
        />
      </div>
      <span id={`${LABEL_ID}-range`} style={srOnly}>{`From ${MASS_MIN} to ${MASS_MAX} solar masses, on a logarithmic scale.`}</span>
      <p aria-hidden style={readoutStyle}>{readout}</p>
      <div className="journey-star-presets" style={presets}>
        {STAR_PATHS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="journey-star-preset"
            aria-pressed={preset.id === path}
            onClick={() => {
              touched.current = true
              setStarMass(preset.mass)
            }}
            style={preset.id === path ? { ...presetButton, ...presetCurrent } : presetButton}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <style>{`
        .journey-star-range{-webkit-appearance:none;appearance:none;background:transparent;cursor:pointer}
        .journey-star-range::-webkit-slider-runnable-track{height:2px;background:rgba(238,242,255,0.32)}
        .journey-star-range::-moz-range-track{height:2px;background:rgba(238,242,255,0.32)}
        .journey-star-range::-webkit-slider-thumb{-webkit-appearance:none;width:${THUMB_PX}px;height:${THUMB_PX}px;margin-top:-8px;border-radius:50%;background:#ff7a1a;border:0;box-shadow:0 0 0 4px rgba(255,122,26,0.18),0 0 18px rgba(255,122,26,0.55)}
        .journey-star-range::-moz-range-thumb{width:${THUMB_PX}px;height:${THUMB_PX}px;border-radius:50%;background:#ff7a1a;border:0;box-shadow:0 0 0 4px rgba(255,122,26,0.18),0 0 18px rgba(255,122,26,0.55)}
        .journey-star-range:focus-visible{outline:2px solid #5ee7ff;outline-offset:6px;border-radius:4px}
        .journey-star-preset:hover{border-color:rgba(238,242,255,0.6)}
        .journey-star-preset:focus-visible{outline:2px solid #5ee7ff;outline-offset:2px}
        @media (max-width:560px){.journey-star-preset{padding:6px 10px!important;font-size:11px!important;letter-spacing:0.02em!important}.journey-star-presets{gap:6px!important}}
      `}</style>
    </div>
  )
}

const mono = 'var(--font-jetbrains-mono), ui-monospace, monospace'

const wrap: React.CSSProperties = {
  pointerEvents: 'auto', margin: '28px auto 0', width: 'min(560px, 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center',
}
const label: React.CSSProperties = {
  fontFamily: mono, fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9cc4ff', marginBottom: 10,
}
const track: React.CSSProperties = { position: 'relative', width: '100%', height: 32, display: 'flex', alignItems: 'center' }
const tick: React.CSSProperties = {
  position: 'absolute', top: '50%', width: 1, height: 10, marginTop: -5, background: 'rgba(238,242,255,0.4)', pointerEvents: 'none',
}
const range: React.CSSProperties = { position: 'relative', width: '100%', height: 32, margin: 0, touchAction: 'pan-y' }
const readoutStyle: React.CSSProperties = {
  fontFamily: mono, fontSize: 'clamp(11px, 1.1vw, 14px)', letterSpacing: '0.04em', color: '#eef2ff', margin: '8px 0 16px',
  fontVariantNumeric: 'tabular-nums', minHeight: '1.4em',
}
const presets: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }
const presetButton: React.CSSProperties = {
  minHeight: 40, padding: '8px 14px', borderRadius: 999, border: '1px solid rgba(238,242,255,0.22)', background: 'rgba(4,5,11,0.45)',
  color: 'rgba(238,242,255,0.86)', fontFamily: mono, fontSize: 12, letterSpacing: '0.06em', cursor: 'pointer',
}
const presetCurrent: React.CSSProperties = { borderColor: '#ff7a1a', color: '#eef2ff', background: 'rgba(255,122,26,0.1)' }
const srOnly: React.CSSProperties = {
  position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap',
}
