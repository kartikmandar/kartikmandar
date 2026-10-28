// src/components/CosmicJourney3D/art/diskFrame.ts
import * as THREE from 'three'

/**
 * World → accretion-disk frame used by the black hole shader (disk plane is y = 0).
 * Same tilt as QuasarBackground's RaymarchedRenderer, so every view of the black
 * hole (live hero, prologue pass, origin impostor) shows the same composition.
 */
export function diskFrame(out: THREE.Matrix3): THREE.Matrix3 {
  const tilt = new THREE.Matrix4()
    .makeRotationZ(-Math.PI / 8)
    .multiply(new THREE.Matrix4().makeRotationX(0.749))
  return out.setFromMatrix4(tilt.invert())
}
