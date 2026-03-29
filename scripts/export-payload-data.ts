/**
 * Export all Payload CMS data to JSON files.
 *
 * Usage:
 *   1. Make sure your dev server is running (`pnpm dev`) OR
 *      set NEXT_PUBLIC_SERVER_URL to your production URL
 *   2. Run: npx tsx scripts/export-payload-data.ts
 *
 * This script hits the Payload REST API to dump all collections as JSON
 * into src/data/exports/ for migration to static files.
 */

import fs from 'fs'
import path from 'path'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const EXPORTS_DIR = path.resolve(import.meta.dirname, '..', 'src', 'data', 'exports')

const COLLECTIONS = [
  { slug: 'projects', depth: 2, limit: 200 },
  { slug: 'talks', depth: 2, limit: 200 },
  { slug: 'posts', depth: 2, limit: 200 },
  { slug: 'pages', depth: 2, limit: 200 },
  { slug: 'categories', depth: 1, limit: 200 },
  { slug: 'media', depth: 0, limit: 500 },
  { slug: 'redirects', depth: 1, limit: 200 },
]

async function fetchCollection(slug: string, depth: number, limit: number) {
  const url = `${BASE_URL}/api/${slug}?depth=${depth}&limit=${limit}&pagination=false`
  console.log(`  Fetching ${slug} from ${url}...`)

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${slug}: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  return data
}

async function main() {
  console.log(`\nExporting Payload data from ${BASE_URL}\n`)
  console.log(`Output directory: ${EXPORTS_DIR}\n`)

  fs.mkdirSync(EXPORTS_DIR, { recursive: true })

  for (const { slug, depth, limit } of COLLECTIONS) {
    try {
      const data = await fetchCollection(slug, depth, limit)
      const docs = data.docs || []
      const outPath = path.join(EXPORTS_DIR, `${slug}.json`)
      fs.writeFileSync(outPath, JSON.stringify(docs, null, 2))
      console.log(`  ✓ ${slug}: ${docs.length} documents → ${outPath}\n`)
    } catch (err) {
      console.error(`  ✗ ${slug}: ${err instanceof Error ? err.message : err}\n`)
    }
  }

  console.log('Done! Exported files are in src/data/exports/')
  console.log('Next steps:')
  console.log('  1. Review the exported JSON files')
  console.log('  2. Run: npx tsx scripts/convert-to-data-files.ts')
}

main().catch(console.error)
