const sharp = require('sharp');
const files = ['erster-kontakt.png','ueberlebensinstinkt.png','wissensdurst.png'];
const THRESHOLD = 250;
(async () => {
  for (const f of files) {
    const p = `public/calling-cards/${f}`;
    try {
      const { data, info } = await sharp(p).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const ch = info.channels;
      let transparent = 0, nearWhiteNonTransparent = 0, nearWhiteTotal = 0;
      for (let i = 0; i < data.length; i += ch) {
        const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
        const isNearWhite = r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD;
        if (isNearWhite) nearWhiteTotal++;
        if (isNearWhite && a > 0) nearWhiteNonTransparent++;
        if (a === 0) transparent++;
      }
      const totalPixels = info.width * info.height;
      console.log(`--- ${f} ---`);
      console.log('size', `${info.width}x${info.height}`, 'pixels', totalPixels);
      console.log('transparent pixels:', transparent, `(${(transparent/totalPixels*100).toFixed(2)}%)`);
      console.log('near-white pixels:', nearWhiteTotal, `(${(nearWhiteTotal/totalPixels*100).toFixed(2)}%)`);
      console.log('near-white that are still non-transparent:', nearWhiteNonTransparent, `(${(nearWhiteNonTransparent/totalPixels*100).toFixed(4)}%)`);
    } catch (err) {
      console.error(`error ${f}:`, err.message);
    }
  }
})();