// Seeded randomness and halftone dot fields. Everything drawn from a
// seed is deterministic: the same seed paints the same dots every
// time, so a cover rebuilt from the same state is byte-identical.

// A tiny linear congruential generator; returns a function yielding
// a float in [0, 1) on every call, fully determined by the seed.
export function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Paints a field of dots over a rectangle. Dots sit on a regular grid
// with a seeded jitter; their radius grows toward the bottom of the
// field, which reads as a print halftone. `area` is {x, y, w, h} in
// pixels, `step` the grid spacing, `colour` the dot fill.
export function halftoneField(ctx, area, seed, step, colour, minR, maxR) {
  const rng = makeRng(seed * 7919 + 13);
  const { x, y, w, h } = area;
  ctx.save();
  ctx.fillStyle = colour;
  for (let gy = y + step / 2; gy < y + h; gy += step) {
    const t = (gy - y) / Math.max(1, h);
    for (let gx = x + step / 2; gx < x + w; gx += step) {
      const r = minR + (maxR - minR) * t * (0.6 + 0.8 * rng());
      ctx.beginPath();
      ctx.arc(gx + (rng() - 0.5) * step * 0.3, gy + (rng() - 0.5) * step * 0.3, Math.max(0.4, r), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Draws a small barcode: the width pattern is fixed, the overall
// scale comes from the strip height, so the bars stay proportional
// at every export size.
export function drawBarcode(ctx, x, y, h, colour) {
  const widths = [3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1];
  const unit = Math.max(1, 0.045 * h);
  const gap = Math.max(1, 0.05 * h);
  const barH = 0.56 * h;
  ctx.save();
  ctx.fillStyle = colour;
  let cx = x;
  for (const w of widths) {
    ctx.fillRect(cx, y + (h - barH) / 2, w * unit, barH);
    cx += w * unit + gap;
  }
  ctx.restore();
  return cx - x;
}

// Total width of a barcode at strip height `h`, so a caller can
// right-align it instead of guessing where it ends.
export function barcodeWidth(h) {
  const widths = [3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1];
  const unit = Math.max(1, 0.045 * h);
  const gap = Math.max(1, 0.05 * h);
  return widths.reduce((sum, w) => sum + w * unit, 0) + gap * (widths.length - 1);
}

// A single palm silhouette: a curved trunk and five fronds fanning
// from the crown. Drawn with strokes so it stays legible at small
// sizes; `h` is the palm height in pixels.
export function drawPalm(ctx, x, baseY, h, colour, width) {
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(2, width);
  // Trunk: a gentle S-curve leaning right.
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + h * 0.06, baseY - h * 0.5, x + h * 0.14, baseY - h * 0.82);
  ctx.stroke();
  const cx = x + h * 0.14;
  const cy = baseY - h * 0.82;
  // Five fronds, each a quadratic arc drooping from the crown.
  const fronds = [
    [-0.42, -0.10, -0.55, 0.28],
    [-0.28, -0.28, -0.34, 0.30],
    [-0.05, -0.38, -0.02, 0.34],
    [0.22, -0.30, 0.30, 0.30],
    [0.40, -0.12, 0.52, 0.26],
  ];
  for (const [dx, dy, ex, ey] of fronds) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx + dx * h, cy + dy * h, cx + ex * h, cy + ey * h);
    ctx.stroke();
  }
  ctx.restore();
}
