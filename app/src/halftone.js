// Seeded randomness and halftone dot fields. Everything drawn from a seed
// is deterministic: the same seed paints the same dots every time, so a
// cover rebuilt from the same state is byte-identical.

// A tiny linear congruential generator; returns a function yielding
// pseudo-random numbers in [0, 1). Seeded from the cover's seed plus a
// per-field salt so different fields do not march in lockstep. The
// constants are the classic Numerical Recipes pair, chosen because they
// are stable across engines and easy to verify by hand.
export function makeRng(seed, salt = 0) {
  let s = (seed * 2654435761 + salt * 40503 + 12345) >>> 0;
  return function next() {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Paints a field of halftone dots inside a rectangle. Dot radius grows
// toward the bottom of the field (bigger dots = darker print feel). The
// caller clips to the region it wants dotted.
export function drawHalftone(ctx, x, y, w, h, step, colour, seed, minR = 1, maxR = 2.8) {
  const rng = makeRng(seed, 77);
  ctx.save();
  ctx.fillStyle = colour;
  for (let row = 0, yy = y + step / 2; yy < y + h; yy += step, row++) {
    for (let col = 0, xx = x + step / 2; xx < x + w; xx += step, col++) {
      const t = h > 0 ? (yy - y) / h : 0;
      const jitter = (rng() - 0.5) * step * 0.35;
      const r = minR + (maxR - minR) * t * (0.6 + 0.8 * rng());
      ctx.beginPath();
      ctx.arc(xx + jitter, yy + (rng() - 0.5) * step * 0.2, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Speckles a rectangle with faint light/dark grain flecks (the grain
// treatment's finish). Count scales with area so large panels stay even.
export function drawGrain(ctx, x, y, w, h, seed, count = 0) {
  const rng = makeRng(seed, 913);
  const n = count || Math.floor((w * h) / 900);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const px = x + rng() * w;
    const py = y + rng() * h;
    const light = rng() > 0.5;
    ctx.fillStyle = light ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(px, py, 1 + rng() * 2, 1 + rng() * 2);
  }
  ctx.restore();
}
