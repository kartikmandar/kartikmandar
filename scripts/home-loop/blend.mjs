// Crossfades the tail over the head so the loop is seamless, and scales to 1280x720 JPEG.
import { createRequire } from 'module'
const require = createRequire(new URL('../../package.json', import.meta.url))
const sharp = require('sharp')
const [S] = process.argv.slice(2)
const LOOP = 192, FADE = 36
const name = (i) => `${S}/frames/f${String(i).padStart(4, '0')}.png`
const load = (i) => sharp(name(i)).resize(1280, 720, { fit: 'cover' }).removeAlpha().raw().toBuffer()
for (let i = 0; i < LOOP; i++) {
  const head = await load(i)
  let out = head
  if (i < FADE) {
    const tail = await load(LOOP + i)
    const w = (i + 1) / (FADE + 1)
    out = Buffer.alloc(head.length)
    for (let k = 0; k < head.length; k++) out[k] = head[k] * w + tail[k] * (1 - w)
  }
  await sharp(out, { raw: { width: 1280, height: 720, channels: 3 } }).jpeg({ quality: 95 }).toFile(`${S}/final/f${String(i).padStart(4, '0')}.jpg`)
}
const public_ = new URL('../../public/media/home/blackhole-poster.avif', import.meta.url).pathname
await sharp(name(96)).resize(1600, 900, { fit: 'cover' }).removeAlpha().avif({ quality: 55, effort: 6 }).toFile(public_)
console.log('blended')
