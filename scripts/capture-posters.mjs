// Captures a still of every story beat, and of the opening's stills (openingStills.ts),
// from the real renderer, using this machine's GPU.
// Needs `pnpm build && pnpm start` running. Usage:
//   node scripts/capture-posters.mjs <png-dir> [--origin=http://localhost:3000] [beat-id | opening-<still> ...]
// Then review the PNGs and run scripts/encode-posters.mjs <png-dir>.
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9610
const SCENE_TIME = 12
const DEFAULT_LOCAL = 0.5
// Beats whose art changes through the shot. Cygnus X-1 shows the disk's inner radius,
// which only reads as a published value (5.5 to 2 Rg) once it has finished sliding.
const POSTER_LOCAL = { 'cygnus-publication-section': 0.82 }
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const args = process.argv.slice(2)
// --flight keeps the neighbouring scenes, to see a beat as visitors do.
const flight = args.includes('--flight')
const origin = args.find((arg) => arg.startsWith('--origin='))?.slice('--origin='.length) ?? 'http://localhost:3000'
const STORY = `${origin}/my-story`
const [outDir, ...only] = args.filter((arg) => !arg.startsWith('--'))
if (!outDir) throw new Error('Usage: capture-posters.mjs <png-dir> [beat-id ...]')
mkdirSync(outDir, { recursive: true })

const profile = mkdtempSync(join(tmpdir(), 'posters-'))
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', 'about:blank'], { stdio: 'ignore' })

let page
for (let attempt = 0; attempt < 40 && !page; attempt++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()
    page = list.find((candidate) => candidate.type === 'page')
  } catch { /* still starting */ }
  await wait(250)
}
if (!page) throw new Error('Chrome did not start')

const socket = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve) => { socket.onopen = resolve })
let nextId = 1
const pending = new Map()
socket.onmessage = (event) => {
  const message = JSON.parse(String(event.data))
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message.result)
    pending.delete(message.id)
  }
}
const send = (method, params = {}) => new Promise((resolve) => {
  const id = nextId++
  pending.set(id, resolve)
  socket.send(JSON.stringify({ id, method, params }))
})
const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  return result.result.value
}

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 900, deviceScaleFactor: 1, mobile: false })

const GRAB = `new Promise((resolve) => {
  window.__captureFrame(${SCENE_TIME}).then((blob) => {
    if (!blob) return resolve(null)
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.readAsDataURL(blob)
  })
})`

// Capture mode publishes each beat's id and the page progress where its scroll range starts and ends.
const waitForReady = async () => {
  for (let attempt = 0; attempt < 120; attempt++) {
    if (await evaluate(`document.documentElement.dataset.capture === 'ready'`)) return true
    await wait(250)
  }
  return false
}
await send('Page.navigate', { url: `${STORY}?capture=1&ui=0` })
await wait(1500)
if (!(await waitForReady())) throw new Error('The story never settled')
const beats = (await evaluate('window.__storyBeats')).map((target) => ({
  id: target.id,
  progress: target.start + (target.end - target.start) * (POSTER_LOCAL[target.id] ?? DEFAULT_LOCAL),
  star: null,
}))
// The opening's stills each name their path, which ?star= selects.
const opening = (await evaluate('window.__storyOpening')).map((still) => ({ id: `opening-${still.name}`, progress: still.progress, star: still.star }))
const targets = [...opening, ...beats].filter((target) => only.length === 0 || only.includes(target.id))

for (const target of targets) {
  const { progress } = target
  const star = target.star ? `&star=${target.star}` : ''
  await send('Page.navigate', { url: `${STORY}?capture=1&p=${progress.toFixed(5)}&t=${SCENE_TIME}&ui=0${flight ? '' : '&solo=1'}${star}` })
  await wait(1500)
  if (!(await waitForReady())) {
    console.log(`${target.id}: never settled`)
    continue
  }
  const renderer = await evaluate(`(() => { const gl = document.createElement('canvas').getContext('webgl2'); const info = gl && gl.getExtension('WEBGL_debug_renderer_info'); return info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : null })()`)
  if (SOFTWARE_RENDERER.test(renderer ?? '')) throw new Error(`Refusing to capture on a software renderer: ${renderer}`)
  const png = await evaluate(GRAB)
  if (!png) {
    console.log(`${target.id}: no frame`)
    continue
  }
  writeFileSync(join(outDir, `${target.id}.png`), Buffer.from(png, 'base64'))
  console.log(`${target.id}: p=${progress.toFixed(4)}`)
}

socket.close()
chrome.kill()
await wait(400)
rmSync(profile, { recursive: true, force: true })
process.exit(0)
