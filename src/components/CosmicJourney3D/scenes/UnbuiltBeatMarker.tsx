// src/components/CosmicJourney3D/scenes/UnbuiltBeatMarker.tsx
'use client'

import type { BeatSceneProps } from '../types'

// A real, intentional anchored marker for beats not yet rebuilt. Keeps the
// flight continuous end-to-end; later phases replace these one at a time.
export default function UnbuiltBeatMarker(_props: BeatSceneProps) {
  return (
    <mesh>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshBasicMaterial color="#1e2547" wireframe transparent opacity={0.5} />
    </mesh>
  )
}
