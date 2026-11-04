// src/components/CosmicJourney3D/art/diskFrame.ts
import * as THREE from 'three'

/**
 * World → accretion-disk frame used by the black hole shader (disk plane is y = 0).
 * Same tilt as the home page's pre-rendered black hole, so the impostor
 * (scenes/OriginBlackHole.tsx) shows the same composition.
 */
export function diskFrame(out: THREE.Matrix3): THREE.Matrix3 {
  const tilt = new THREE.Matrix4()
    .makeRotationZ(-Math.PI / 8)
    .multiply(new THREE.Matrix4().makeRotationX(0.749))
  return out.setFromMatrix4(tilt.invert())
}
