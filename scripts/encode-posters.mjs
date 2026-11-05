// Encodes the reviewed stills from scripts/capture-posters.mjs for the site.
// Usage: node scripts/encode-posters.mjs <png-dir>
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const SHARE_IMAGE_BEAT = 'cygnus-publication-section'
const OUT = 'public/media/my-story'

const [pngDir] = process.argv.slice(2)
if (!pngDir) throw new Error('Usage: encode-posters.mjs <png-dir>')
mkdirSync(OUT, { recursive: true })

let total = 0
for (const file of readdirSync(pngDir).filter((name) => name.endsWith('.png'))) {
  const target = join(OUT, file.replace(/\.png$/, '.webp'))
  await sharp(join(pngDir, file)).webp({ quality: 74, effort: 6 }).toFile(target)
  total += statSync(target).size
}
console.log(`Posters: ${Math.round(total / 1024)} kB`)

// The story's share image. The art sits in the upper part of the frame, so crop from the top.
// Skipped when only other stills were captured this time.
const shareSource = join(pngDir, `${SHARE_IMAGE_BEAT}.png`)
if (!existsSync(shareSource)) process.exit(0)
const share = join(OUT, 'share.jpg')
await sharp(shareSource)
  .resize(1200, 630, { fit: 'cover', position: 'top' })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(share)
console.log(`Share image: ${Math.round(statSync(share).size / 1024)} kB`)
