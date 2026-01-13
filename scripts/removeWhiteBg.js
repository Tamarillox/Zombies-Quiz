const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, '..', 'public', 'calling-cards');
const outDir = path.join(dir, 'transparent');
const THRESHOLD = 250; // RGB threshold for being considered "white"

(async () => {
  await fs.mkdir(outDir, { recursive: true });
  const files = await fs.readdir(dir);
  const pngs = files.filter(f => f.toLowerCase().endsWith('.png'));
  for (const f of pngs) {
    const inPath = path.join(dir, f);
    const outPath = path.join(outDir, f);
    try {
      const { data, info } = await sharp(inPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const channels = info.channels; // should be 4 after ensureAlpha
      for (let i = 0; i < data.length; i += channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // if pixel is near-white, make fully transparent
        if (r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD) {
          data[i + 3] = 0;
        }
      }
      await sharp(Buffer.from(data), { raw: { width: info.width, height: info.height, channels: channels } }).png().toFile(outPath);
      console.log(`Processed: ${f} -> transparent/${f}`);
    } catch (err) {
      console.error(`Failed processing ${f}:`, err.message);
    }
  }
})();
