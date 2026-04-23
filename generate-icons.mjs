// generate-icons.mjs
// Run with: node generate-icons.mjs
// Generates all required PWA icon sizes for Blue Links (AdDU branding)

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = './public/icons';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 96;

  // Background circle
  ctx.fillStyle = '#0d1b4b';
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Shield shape
  ctx.fillStyle = '#162060';
  ctx.beginPath();
  ctx.moveTo(cx, 6 * scale);
  ctx.lineTo((cx + 34) * scale / (96/size) + cx - cx, 20 * scale);

  // Redraw shield properly scaled from center
  const s = scale;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 40 * s);
  ctx.lineTo(cx + 34 * s, cy - 28 * s);
  ctx.lineTo(cx + 34 * s, cy - 2 * s);
  ctx.quadraticCurveTo(cx + 34 * s, cy + 28 * s, cx, cy + 40 * s);
  ctx.quadraticCurveTo(cx - 34 * s, cy + 28 * s, cx - 34 * s, cy - 2 * s);
  ctx.lineTo(cx - 34 * s, cy - 28 * s);
  ctx.closePath();
  ctx.fillStyle = '#162060';
  ctx.fill();

  // Shield border (gold)
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 2 * s;
  ctx.stroke();

  // Letter "B"
  ctx.fillStyle = '#c9a84c';
  ctx.font = `bold ${Math.floor(32 * s)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B', cx, cy + 2 * s);

  return canvas.toBuffer('image/png');
}

sizes.forEach(size => {
  const buffer = drawIcon(size);
  const filePath = path.join(outputDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ Generated: ${filePath}`);
});

console.log('\n🎉 All icons generated in public/icons/');
