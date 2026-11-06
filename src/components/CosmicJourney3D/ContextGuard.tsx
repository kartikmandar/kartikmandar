'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { CONTEXT_RESTORE_TIMEOUT_MS, shouldAbandonAfterLoss } from './robustness'
import { isTeardownCanvas } from './rendererLifecycle'

/**
 * Watches for a lost WebGL context, which phones trigger under memory pressure.
 * three.js rebuilds its GPU resources on restore. If the context doesn't come
 * back in time, or keeps being lost, the story switches to the HTML article.
 */
export function ContextGuard({ onAbandon }: { onAbandon: () => void }) {
  const canvas = useThree((state) => state.gl.domElement)

  useEffect(() => {
    let lossCount = 0
    let restoreTimer: ReturnType<typeof setTimeout> | undefined

    const onLost = (event: Event) => {
      // Without preventDefault the browser never restores the context.
      event.preventDefault()
      // Our own teardown (the canvas has left the page) is not a device losing the GPU.
      if (isTeardownCanvas(canvas)) return
      lossCount += 1
      clearTimeout(restoreTimer)
      if (shouldAbandonAfterLoss(lossCount)) {
        onAbandon()
        return
      }
      restoreTimer = setTimeout(onAbandon, CONTEXT_RESTORE_TIMEOUT_MS)
    }
    const onRestored = () => clearTimeout(restoreTimer)

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    return () => {
      clearTimeout(restoreTimer)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
    }
  }, [canvas, onAbandon])

  return null
}
