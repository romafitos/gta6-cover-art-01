// Photo treatment: duotone grade, halftone dot screen and film grain,
// all computed on offscreen canvases with plain 2D compositing.
// treatments: 'duotone' | 'halftone' | 'clean' | 'grain'

/** Builds a reusable halftone dot tile (dark dots on transparent). */
export function makeDotTile(size, radius, color) {
  const tile = document.createElement('canvas');
  tile.width = size;
  tile.height = size;
  const t = tile.getContext('2d');
  t.fillStyle = color;
  t.beginPath();
  t.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
  t.fill();
  return tile;
}

/** Grayscale + duotone: photo -> grey, then light colour screened over dark. */
export function duotoneImage(img, w, h, dark, light) {
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.round(w));
  c.height = Math.max(2, Math.round(h));
  const x = c.getContext('2d');
  // Cover-fit the photo into the frame.
  const s = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight);
  const pw = img.naturalWidth * s;
  const ph = img.naturalHeight * s;
  x.filter = 'grayscale(1) contrast(1.12) brightness(1.04)';
  x.drawImage(img, (c.width - pw) / 2, (c.height - ph) / 2, pw, ph);
  x.filter = 'none';
  // Duotone: dark shadows, light highlights.
  x.globalCompositeOperation = 'multiply';
  x.fillStyle = light;
  x.fillRect(0, 0, c.width, c.height);
  x.globalCompositeOperation = 'screen';
  x.fillStyle = dark;
  x.fillRect(0, 0, c.width, c.height);
  x.globalCompositeOperation = 'source-over';
  return c;
}

/** Overlays a halftone dot screen whose dot size follows local brightness. */
export function halftoneScreen(ctx, w, h, color, strength) {
  const step = 9;
  const tile = makeDotTile(step, 2.6, color);
  const pattern = ctx.createPattern(tile, 'repeat');
  ctx.save();
  ctx.globalAlpha = strength;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Sparse monochrome grain: deterministic-ish speckle from a seed. */
export function grainOverlay(ctx, w, h, seed, amount) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  ctx.save();
  for (let i = 0; i < amount; i++) {
    const v = next();
    ctx.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    ctx.globalAlpha = 0.05 + next() * 0.09;
    const s = 1 + next() * 2;
    ctx.fillRect(next() * w, next() * h, s, s);
  }
  ctx.restore();
}

/**
 * Draws img into rect (x, y, w, h) with cover-fit crop, a per-panel zoom and
 * pan offsets, then applies the named treatment. zoom 1 = cover fit.
 * ox/oy are fractions of the frame the crop centre may shift by.
 */
export function drawTreatedPhoto(ctx, img, x, y, w, h, treatment, dark, light, zoom, ox, oy, seed) {
  if (!img || w <= 0 || h <= 0) return;
  const z = Math.max(0.5, zoom || 1);
  if (treatment === 'duotone' || treatment === 'halftone') {
    const duo = duotoneImage(img, w, h, dark, light);
    // Pan/zoom on the duotone result: draw it scaled around the centre.
    const dw = w * z;
    const dh = h * z;
    ctx.drawImage(duo, x + (w - dw) / 2 + ox * w, y + (h - dh) / 2 + oy * h, dw, dh);
  } else {
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight) * z;
    const pw = img.naturalWidth * s;
    const ph = img.naturalHeight * s;
    ctx.drawImage(img, x + (w - pw) / 2 + ox * w, y + (h - ph) / 2 + oy * h, pw, ph);
  }
  if (treatment === 'halftone') {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    halftoneScreen(ctx, w, h, dark, 0.5);
    ctx.restore();
  }
  if (treatment === 'grain' || treatment === 'halftone') {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.translate(x, y);
    grainOverlay(ctx, w, h, seed + 7, Math.round((w * h) / 900));
    ctx.restore();
  }
}
