// The site's opt-in sound. Nothing is created until the visitor presses the sound
// button. The ambient track plays on every page; the story flight also drives a
// low-pass on it and generated sounds (no audio files): a warp whoosh, a sub swell
// at the black hole and soft notes on arriving at a beat.

const BED_SOURCE = '/audio/quasar-compressed.mp3'
const FADE_SECONDS = 0.4
const SMOOTHING_SECONDS = 0.12
const NOISE_SECONDS = 2
const SUB_HZ = 42
/** Small speakers can't reproduce the sub, so an octave above carries it on phones. */
const SUB_OCTAVE_LEVEL = 0.35
const NOTE_PEAK = 0.05
const NOTE_ATTACK_SECONDS = 0.012
const NOTE_DECAY_SECONDS = 2.4
const ECHO_SECONDS = 0.28
const ECHO_FEEDBACK = 0.35
const ECHO_LEVEL = 0.4
const ECHO_CUTOFF_HZ = 2400

export interface SoundMix {
  cutoffHz: number
  whooshGain: number
  whooshHz: number
  subGain: number
}

/** Outside the flight: the track as recorded, and no generated sound. */
export const NEUTRAL_MIX: SoundMix = { cutoffHz: 20000, whooshGain: 0, whooshHz: 800, subGain: 0 }

interface SoundGraph {
  context: AudioContext
  bed: HTMLAudioElement
  master: GainNode
  bedLevel: GainNode
  lowpass: BiquadFilterNode
  whoosh: GainNode
  whooshFilter: BiquadFilterNode
  sub: GainNode
  notes: GainNode
}

let graph: SoundGraph | null = null
let on = false
let suspendTimer: ReturnType<typeof setTimeout> | undefined

function buildGraph(volume: number): SoundGraph {
  const context = new AudioContext()
  const master = context.createGain()
  master.gain.value = 0
  const compressor = context.createDynamicsCompressor()
  compressor.connect(master).connect(context.destination)

  const bed = new Audio(BED_SOURCE)
  bed.loop = true
  const lowpass = context.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.Q.value = 0.5
  lowpass.frequency.value = NEUTRAL_MIX.cutoffHz
  const bedLevel = context.createGain()
  bedLevel.gain.value = volume
  context.createMediaElementSource(bed).connect(lowpass).connect(bedLevel).connect(compressor)

  const noiseBuffer = context.createBuffer(1, context.sampleRate * NOISE_SECONDS, context.sampleRate)
  const samples = noiseBuffer.getChannelData(0)
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1
  const noise = context.createBufferSource()
  noise.buffer = noiseBuffer
  noise.loop = true
  const whooshFilter = context.createBiquadFilter()
  whooshFilter.type = 'bandpass'
  whooshFilter.Q.value = 0.8
  whooshFilter.frequency.value = NEUTRAL_MIX.whooshHz
  const whoosh = context.createGain()
  whoosh.gain.value = 0
  noise.connect(whooshFilter).connect(whoosh).connect(compressor)
  noise.start()

  const sub = context.createGain()
  sub.gain.value = 0
  sub.connect(compressor)
  const subTone = context.createOscillator()
  subTone.frequency.value = SUB_HZ
  subTone.connect(sub)
  subTone.start()
  const subOctave = context.createOscillator()
  subOctave.frequency.value = SUB_HZ * 2
  const subOctaveLevel = context.createGain()
  subOctaveLevel.gain.value = SUB_OCTAVE_LEVEL
  subOctave.connect(subOctaveLevel).connect(sub)
  subOctave.start()

  const notes = context.createGain()
  notes.connect(compressor)
  const echo = context.createDelay(1)
  echo.delayTime.value = ECHO_SECONDS
  const echoFilter = context.createBiquadFilter()
  echoFilter.type = 'lowpass'
  echoFilter.frequency.value = ECHO_CUTOFF_HZ
  const echoFeedback = context.createGain()
  echoFeedback.gain.value = ECHO_FEEDBACK
  const echoLevel = context.createGain()
  echoLevel.gain.value = ECHO_LEVEL
  notes.connect(echo).connect(echoFilter).connect(echoFeedback).connect(echo)
  echoFilter.connect(echoLevel).connect(compressor)

  return { context, bed, master, bedLevel, lowpass, whoosh, whooshFilter, sub, notes }
}

/** Starts the sound. Must be called from a click or tap. Resolves to whether it's playing. */
export async function startSound(volume: number): Promise<boolean> {
  clearTimeout(suspendTimer)
  graph ??= buildGraph(volume)
  const { context, bed, master } = graph
  await context.resume()
  await bed.play()
  master.gain.setTargetAtTime(1, context.currentTime, FADE_SECONDS / 3)
  on = true
  return true
}

export function stopSound(): void {
  on = false
  if (!graph) return
  const { context, bed, master } = graph
  master.gain.setTargetAtTime(0, context.currentTime, FADE_SECONDS / 3)
  clearTimeout(suspendTimer)
  suspendTimer = setTimeout(() => {
    bed.pause()
    void context.suspend()
  }, FADE_SECONDS * 1000)
}

export function isSoundOn(): boolean {
  return on
}

export function setSoundVolume(volume: number): void {
  if (graph) graph.bedLevel.gain.setTargetAtTime(volume, graph.context.currentTime, SMOOTHING_SECONDS)
}

export function setSoundMix(mix: SoundMix): void {
  if (!graph) return
  const now = graph.context.currentTime
  graph.lowpass.frequency.setTargetAtTime(mix.cutoffHz, now, SMOOTHING_SECONDS)
  graph.whoosh.gain.setTargetAtTime(mix.whooshGain, now, SMOOTHING_SECONDS)
  graph.whooshFilter.frequency.setTargetAtTime(mix.whooshHz, now, SMOOTHING_SECONDS)
  graph.sub.gain.setTargetAtTime(mix.subGain, now, SMOOTHING_SECONDS)
}

export function playNotes(frequencies: readonly number[]): void {
  if (!graph || !on) return
  const { context, notes } = graph
  const now = context.currentTime
  frequencies.forEach((frequency, i) => {
    const tone = context.createOscillator()
    tone.frequency.value = frequency
    const envelope = context.createGain()
    const peak = NOTE_PEAK / (i + 1)
    envelope.gain.setValueAtTime(0.0001, now)
    envelope.gain.linearRampToValueAtTime(peak, now + NOTE_ATTACK_SECONDS)
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + NOTE_DECAY_SECONDS)
    tone.connect(envelope).connect(notes)
    tone.onended = () => envelope.disconnect()
    tone.start(now)
    tone.stop(now + NOTE_DECAY_SECONDS)
  })
}
