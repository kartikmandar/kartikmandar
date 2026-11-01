import { describe, expect, it } from 'vitest'
import { MAX_CONTEXT_LOSSES, isSoftwareRenderer, shouldAbandonAfterLoss } from '../robustness'

describe('isSoftwareRenderer', () => {
  it.each([
    'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)',
    'llvmpipe (LLVM 15.0.7, 256 bits)',
    'Mesa softpipe',
    'Microsoft Basic Render Driver',
    'Google SwiftShader',
  ])('flags %s', (renderer) => {
    expect(isSoftwareRenderer(renderer)).toBe(true)
  })

  it.each([
    'ANGLE (Apple, ANGLE Metal Renderer: Apple M1 Max, Unspecified Version)',
    'Apple GPU',
    'Adreno (TM) 740',
    'ANGLE (NVIDIA, NVIDIA GeForce RTX 3090 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'Mali-G715',
  ])('accepts %s', (renderer) => {
    expect(isSoftwareRenderer(renderer)).toBe(false)
  })

  it('accepts an unknown renderer, because browsers may hide it', () => {
    expect(isSoftwareRenderer(null)).toBe(false)
  })
})

describe('shouldAbandonAfterLoss', () => {
  it('keeps trying until the limit', () => {
    expect(shouldAbandonAfterLoss(1)).toBe(false)
    expect(shouldAbandonAfterLoss(MAX_CONTEXT_LOSSES - 1)).toBe(false)
    expect(shouldAbandonAfterLoss(MAX_CONTEXT_LOSSES)).toBe(true)
  })
})
