#!/usr/bin/env node
/**
 * Generate PWA icons for Dads-cogs.
 * Creates placeholder icons with "DC" text on violet gradient background.
 */

import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const icons = [
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generateIcon(size) {
  // Create SVG with gradient background and "DC" text
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.1}"/>
      <text
        x="50%"
        y="55%"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="${size * 0.4}"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="middle"
      >DC</text>
    </svg>
  `;

  return sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toBuffer();
}

async function main() {
  console.log('Generating PWA icons...');

  for (const icon of icons) {
    const buffer = await generateIcon(icon.size);
    const outputPath = join(publicDir, icon.name);
    writeFileSync(outputPath, buffer);
    console.log(`Created: ${icon.name} (${icon.size}x${icon.size})`);
  }

  console.log('Done!');
}

main().catch(console.error);
