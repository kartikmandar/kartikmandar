// src/components/CosmicJourney3D/scenes/Beat_Search.tsx
'use client'

import { Text } from '@react-three/drei'
import type { SceneProps } from '../types'

// Acceptance: a dark glowing terminal panel types and deletes through three
// search phrases in order and stops on the last ("IISER Bhopal"), turning the
// caret green (mirrors the original React typewriter in CosmicJourney).

// The three phrases, typed in order. The first two type, hold, then delete; the
// final phrase types and stays, settling the trajectory with a green caret.
const PHRASES = ['DU > Hansraj College...', 'IISERs...', 'IISER Bhopal'] as const

// Panel geometry in this beat's local XY plane.
const PANEL_W = 9
const PANEL_H = 2.2
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

// Resolve the visible substring and whether we are on the final, settled phrase
// from a deterministic localProgress in [0..1].
function resolveTyping(progress: number): { text: string; final: boolean } {
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
      if (local < seg.type) {
        const t = seg.type > 0 ? local / seg.type : 1
        const chars = Math.round(t * phrase.length)
        return { text: phrase.slice(0, chars), final: isLast && chars >= phrase.length }
      }
      if (local < seg.type + seg.hold) {
        return { text: phrase, final: isLast }
      }
      // Deleting tail (only the non-final phrases reach here).
      const dl = local - seg.type - seg.hold
      const t = seg.del > 0 ? dl / seg.del : 1
      const chars = Math.round((1 - Math.min(1, t)) * phrase.length)
      return { text: phrase.slice(0, chars), final: false }
    }
    cursor += span
  }
  // Past the end: settle on the final phrase.
  const last = PHRASES[PHRASES.length - 1]
  return { text: last ?? '', final: true }
}

export default function Beat_Search({ localProgress, clock, reducedMotion }: SceneProps) {
  const { text, final } = resolveTyping(localProgress)

  // Blinking caret driven by the clock; steady (always shown) when reduced motion.
  const caretOn = reducedMotion ? true : Math.sin(clock * Math.PI * 2 * 1.3) > 0
  // Caret turns green once the trajectory settles on the final phrase.
  const caretColor = final ? '#4ade80' : '#e0e0e0'
  // Place the block caret just after the last typed glyph.
  const caretX = TEXT_X + text.length * CHAR_ADVANCE

  return (
    <group>
      {/* Faint glow plane behind the panel for the "glowing terminal" feel. */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[PANEL_W + 0.6, PANEL_H + 0.6]} />
        <meshBasicMaterial
          color={final ? '#4ade80' : '#38bdf8'}
          transparent
          opacity={0.12}
          toneMapped={false}
        />
      </mesh>

      {/* Dark, semi-transparent terminal panel. */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        <meshBasicMaterial color="#0a0f1a" transparent opacity={0.82} toneMapped={false} />
      </mesh>

      {/* Thin border outline, tinting green once the trajectory settles. */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[BORDER, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={final ? '#4ade80' : '#1e3a5f'}
          transparent
          opacity={final ? 0.9 : 0.6}
          toneMapped={false}
        />
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
        position={[TEXT_X, 0, 0.05]}
        anchorX="left"
        anchorY="middle"
        fontSize={FONT_SIZE}
        color="#e0e0e0"
      >
        {text}
      </Text>

      {/* Blinking block caret, green once settled on the final phrase. */}
      {caretOn && (
        <Text
          position={[caretX, 0, 0.05]}
          anchorX="left"
          anchorY="middle"
          fontSize={FONT_SIZE}
          color={caretColor}
        >
          {'█'}
        </Text>
      )}
    </group>
  )
}
