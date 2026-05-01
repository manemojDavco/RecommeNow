/**
 * export-brand-assets.mjs
 * Converts all SVG brand files to PNG/JPG at every platform-required size.
 *
 * Run: node scripts/export-brand-assets.mjs
 */

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const BRAND_DIR = 'public/brand'
const OUT_DIR   = 'public/brand/exports'

fs.mkdirSync(OUT_DIR, { recursive: true })

// ── Helper ────────────────────────────────────────────────────────────────────
async function exportPng(svgFile, outName, width, height) {
  const svgPath = path.join(BRAND_DIR, svgFile)
  if (!fs.existsSync(svgPath)) { console.warn(`  ⚠ skipping ${svgPath} (not found)`); return }
  const outPath = path.join(OUT_DIR, outName)
  await sharp(svgPath).resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(outPath)
  const kb = Math.round(fs.statSync(outPath).size / 1024)
  console.log(`  ✓ ${outName.padEnd(50)} ${width}×${height}  (${kb}KB)`)
}

async function exportJpg(svgFile, outName, width, height, bg = { r: 45, g: 106, b: 79 }) {
  const svgPath = path.join(BRAND_DIR, svgFile)
  if (!fs.existsSync(svgPath)) { console.warn(`  ⚠ skipping ${svgPath} (not found)`); return }
  const outPath = path.join(OUT_DIR, outName)
  await sharp(svgPath).resize(width, height, { fit: 'contain', background: bg }).flatten({ background: bg }).jpeg({ quality: 95 }).toFile(outPath)
  const kb = Math.round(fs.statSync(outPath).size / 1024)
  console.log(`  ✓ ${outName.padEnd(50)} ${width}×${height}  (${kb}KB)`)
}

// Also export favicon as PNG for legacy <link rel="icon"> support
async function exportFaviconPng(size) {
  const outPath = path.join('public', `favicon-${size}.png`)
  await sharp('public/favicon.svg').resize(size, size).png().toFile(outPath)
  console.log(`  ✓ favicon-${size}.png`)
}

// ── Exports ───────────────────────────────────────────────────────────────────
console.log('\n🎨 RecommeNow brand asset export\n')

console.log('── Logo mark (square icons) ─────────────────────────────────')

// LinkedIn logo: 300×300 JPG (on green) + PNG transparent
await exportJpg('logo-mark-on-green.svg',       'logo-mark-300x300-green.jpg',       300, 300)
await exportPng('logo-mark-transparent.svg',    'logo-mark-300x300-transparent.png', 300, 300)
await exportJpg('logo-mark-on-white.svg',       'logo-mark-300x300-white.jpg',       300, 300, { r:255, g:255, b:255 })
await exportJpg('logo-mark-on-dark.svg',        'logo-mark-300x300-dark.jpg',        300, 300, { r:27, g:67, b:50 })

// Instagram / Facebook profile: 320×320
await exportJpg('logo-mark-on-green.svg',       'logo-mark-320x320-green.jpg',       320, 320)
await exportPng('logo-mark-transparent.svg',    'logo-mark-320x320-transparent.png', 320, 320)

// X (Twitter) profile: 400×400
await exportJpg('logo-mark-on-green.svg',       'logo-mark-400x400-green.jpg',       400, 400)
await exportPng('logo-mark-transparent.svg',    'logo-mark-400x400-transparent.png', 400, 400)

// Generic large
await exportJpg('logo-mark-on-green.svg',       'logo-mark-1024x1024-green.jpg',    1024, 1024)
await exportPng('logo-mark-transparent.svg',    'logo-mark-1024x1024-transparent.png', 1024, 1024)

console.log('\n── Wordmark (horizontal) ────────────────────────────────────')

// Standard widths for email headers, presentations, etc.
await exportPng('logo-wordmark-transparent.svg', 'logo-wordmark-600-transparent.png',  600, 143)
await exportJpg('logo-wordmark-on-green.svg',    'logo-wordmark-600-green.jpg',         600, 143)
await exportJpg('logo-wordmark-on-white.svg',    'logo-wordmark-600-white.jpg',         600, 143, { r:255, g:255, b:255 })
await exportJpg('logo-wordmark-on-dark.svg',     'logo-wordmark-600-dark.jpg',          600, 143, { r:27, g:67, b:50 })

await exportPng('logo-wordmark-transparent.svg', 'logo-wordmark-1200-transparent.png', 1200, 286)
await exportJpg('logo-wordmark-on-green.svg',    'logo-wordmark-1200-green.jpg',        1200, 286)

console.log('\n── Banners / Cover images ───────────────────────────────────')

// OG image / link preview: 1200×630
await exportJpg('og-image-default.svg',          'og-image-1200x630.jpg',             1200, 630, { r:27, g:67, b:50 })
await exportPng('og-image-default.svg',          'og-image-1200x630.png',             1200, 630)

// LinkedIn banner: 1584×396
await exportJpg('og-image-default.svg',          'linkedin-banner-1584x396.jpg',      1584, 396, { r:27, g:67, b:50 })

// X (Twitter) header: 1500×500
await exportJpg('og-image-default.svg',          'twitter-header-1500x500.jpg',       1500, 500, { r:27, g:67, b:50 })

// Facebook cover: 820×312
await exportJpg('og-image-default.svg',          'facebook-cover-820x312.jpg',         820, 312, { r:27, g:67, b:50 })

console.log('\n── Favicons ─────────────────────────────────────────────────')
await exportFaviconPng(16)
await exportFaviconPng(32)
await exportFaviconPng(64)
await exportFaviconPng(180)   // Apple touch icon
await exportFaviconPng(512)   // PWA

console.log('\n✅  All exports done → public/brand/exports/\n')
