// src/components/CosmicJourney3D/scenes/Beat_Search.tsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { BeatSceneProps } from '../types'
import { useBeat } from '../store'

// Acceptance: a dark glowing terminal panel types and deletes through three
// search phrases in order and stops on the last ("IISER Bhopal"), turning the
// caret green (mirrors the original React typewriter in CosmicJourney).

// The three phrases, typed in order. The first two type, hold, then delete; the
// final phrase types and stays, settling the trajectory with a green caret.
const PHRASES = ['DU > Hansraj College...', 'IISERs...', 'IISER Bhopal'] as const

// Panel geometry in this beat's local XY plane. The panel is lifted to PANEL_Y
// so the terminal sits in the upper-center of the frame, clear of the overlay
// copy reserved below local Y = -1.5, and fills more of the ~9x6 stage.
const PANEL_W = 9
const PANEL_H = 2.6
const PANEL_Y = 1.0
const FONT_SIZE = 0.5
// Approximate per-character advance for the default drei font at FONT_SIZE,
// used to deterministically place the block caret after the typed text.
const CHAR_ADVANCE = FONT_SIZE * 0.55
// Left edge where the "> " prompt starts, and where typed text begins after it.
const PROMPT_X = -PANEL_W / 2 + 0.5
const TEXT_X = PROMPT_X + 2 * CHAR_ADVANCE + 0.15

// Per-phrase window allocations across localProgress [0..1]. The first two
// phrases each get a type/hold/delete cycle; the final phrase gets type/hold so
// it settles and remains for the rest of the beat.
const SEGMENTS = [
  { type: 0.1, hold: 0.06, del: 0.06 }, // 'DU > Hansraj College...'
  { type: 0.07, hold: 0.06, del: 0.05 }, // 'IISERs...'
  { type: 0.1, hold: 0.33, del: 0 }, // 'IISER Bhopal' (final, no delete)
] as const

const TOTAL = SEGMENTS.reduce((s, seg) => s + seg.type + seg.hold + seg.del, 0)

// Outlined rectangle (line loop) for the thin panel border, centered at origin.
function borderPositions(w: number, h: number, z = 0.01): Float32Array {
  const x = w / 2
  const y = h / 2
  return new Float32Array([
    -x, -y, z, x, -y, z, x, -y, z, x, y, z,
    x, y, z, -x, y, z, -x, y, z, -x, -y, z,
  ])
}

const BORDER = borderPositions(PANEL_W, PANEL_H)

type TroikaText = THREE.Mesh & {
  text: string
  color: string
  fillOpacity: number
  sync: () => void
}

// Module-level scratch so resolving the typed text never allocates per frame.
const typingScratch = { phraseIndex: 0, chars: 0, final: false }

// Resolve which phrase is showing, how many characters of it are visible, and
// whether we are on the final, settled phrase, from a deterministic localProgress.
function resolveTyping(progress: number): void {
  const p = Math.min(1, Math.max(0, progress)) * TOTAL
  let cursor = 0
  for (let i = 0; i < SEGMENTS.length; i++) {
    const seg = SEGMENTS[i]
    const phrase = PHRASES[i]
    if (!seg || phrase === undefined) continue
    const span = seg.type + seg.hold + seg.del
    const isLast = i === SEGMENTS.length - 1
    if (p < cursor + span || (isLast && p >= cursor)) {
      const local = p - cursor
      typingScratch.phraseIndex = i
      if (local < seg.type) {
        const t = seg.type > 0 ? local / seg.type : 1
        const chars = Math.round(t * phrase.length)
        typingScratch.chars = chars
        typingScratch.final = isLast && chars >= phrase.length
        return
      }
      if (local < seg.type + seg.hold) {
        typingScratch.chars = phrase.length
        typingScratch.final = isLast
        return
      }
      // Deleting tail (only the non-final phrases reach here).
      const dl = local - seg.type - seg.hold
      const t = seg.del > 0 ? dl / seg.del : 1
      typingScratch.chars = Math.round((1 - Math.min(1, t)) * phrase.length)
      typingScratch.final = false
      return
    }
    cursor += span
  }
  // Past the end: settle on the final phrase.
  typingScratch.phraseIndex = PHRASES.length - 1
  typingScratch.chars = PHRASES[PHRASES.length - 1]?.length ?? 0
  typingScratch.final = true
}

const GREEN = '#4ade80'
const GLOW_BLUE = new THREE.Color('#38bdf8')
const GLOW_GREEN = new THREE.Color(GREEN)
const BORDER_BLUE = new THREE.Color('#1e3a5f')
const BORDER_GREEN = new THREE.Color(GREEN)

export default function Beat_Search({ index, reducedMotion }: BeatSceneProps) {
  const beat = useBeat(index)
  const glowRef = useRef<THREE.Mesh>(null)
  const borderRef = useRef<THREE.LineSegments>(null)
  const typedRef = useRef<TroikaText>(null)
  const caretRef = useRef<TroikaText>(null)
  // Last values pushed to the scene, so text/colour work happens only on change.
  const lastPhraseRef = useRef(-1)
  const lastCharsRef = useRef(-1)
  const lastFinalRef = useRef<boolean | null>(null)

  useFrame(() => {
    if (!beat.near) return
    resolveTyping(beat.local)
    const { phraseIndex, chars, final } = typingScratch

    // Typed phrase: re-sync the troika text only when the visible string changes.
    const typed = typedRef.current
    if (typed && (phraseIndex !== lastPhraseRef.current || chars !== lastCharsRef.current)) {
      lastPhraseRef.current = phraseIndex
      lastCharsRef.current = chars
      typed.text = PHRASES[phraseIndex]!.slice(0, chars)
      typed.sync()
    }

    // Blinking caret driven by the clock; steady (always shown) when reduced motion.
    const caret = caretRef.current
    if (caret) {
      caret.visible = reducedMotion ? true : Math.sin(beat.clock * Math.PI * 2 * 1.3) > 0
      // Place the block caret just after the last typed glyph.
      caret.position.x = TEXT_X + chars * CHAR_ADVANCE
    }

    // Green tint once the trajectory settles on the final phrase.
    if (final !== lastFinalRef.current) {
      lastFinalRef.current = final
      if (caret) caret.color = final ? GREEN : '#e0e0e0'
      const glow = glowRef.current
      if (glow) (glow.material as THREE.MeshBasicMaterial).color.copy(final ? GLOW_GREEN : GLOW_BLUE)
      const border = borderRef.current
      if (border) {
        const borderMaterial = border.material as THREE.LineBasicMaterial
        borderMaterial.color.copy(final ? BORDER_GREEN : BORDER_BLUE)
        borderMaterial.opacity = final ? 0.9 : 0.6
      }
    }
  })

  return (
    <group position={[0, PANEL_Y, 0]}>
      {/* Faint glow plane behind the panel for the "glowing terminal" feel. */}
      <mesh ref={glowRef} position={[0, 0, -0.02]}>
        <planeGeometry args={[PANEL_W + 0.6, PANEL_H + 0.6]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.12} toneMapped={false} />
      </mesh>

      {/* Dark, semi-transparent terminal panel. */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        <meshBasicMaterial color="#0a0f1a" transparent opacity={0.82} toneMapped={false} />
      </mesh>

      {/* Thin border outline, tinting green once the trajectory settles. */}
      <lineSegments ref={borderRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[BORDER, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#1e3a5f" transparent opacity={0.6} toneMapped={false} />
      </lineSegments>

      {/* Green monospace prompt. */}
      <Text
        position={[PROMPT_X, 0, 0.05]}
        anchorX="left"
        anchorY="middle"
        fontSize={FONT_SIZE}
        color="#4ade80"
      >
        {'> '}
      </Text>

      {/* Typed phrase. */}
      <Text
        ref={(mesh) => {
          typedRef.current = mesh as TroikaText | null
        }}
        position={[TEXT_X, 0, 0.05]}
        anchorX="left"
        anchorY="middle"
        fontSize={FONT_SIZE}
        color="#e0e0e0"
      >
        {''}
      </Text>

      {/* Blinking block caret, green once settled on the final phrase. */}
      <Text
        ref={(mesh) => {
          caretRef.current = mesh as TroikaText | null
        }}
        position={[TEXT_X, 0, 0.05]}
        anchorX="left"
        anchorY="middle"
        fontSize={FONT_SIZE}
        color="#e0e0e0"
      >
        {'█'}
      </Text>
    </group>
  )
}
