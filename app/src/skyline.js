// Procedural Vice City backdrop: gradient sky, sun disc with glow, seeded
// skyline silhouette with lit windows, palm-tree silhouettes and a halftone
// dot field. Everything is drawn with canvas 2D from a seed, so the same
// seed always paints the same city. No image assets, no network.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A palm silhouette: curved trunk plus a fan of drooping fronds. */
export function drawPalm(ctx, x, y, s, color, rng) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  // Trunk: gentle S-curve leaning either way.
  const lean = (rng() - 0.5) * 44;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(lean * 0.4, -70, lean, -128);
  ctx.stroke();
  // Fronds fan out from the crown.
  const crownX = lean;
  const crownY = -128;
  const fronds = 7;
  for (let i = 0; i < fronds; i++) {
    const a = (-Math.PI * 0.15) - (i / (fronds - 1)) * Math.PI * 0.7;
    const len = 52 + rng() * 26;
    const tipX = crownX + Math.cos(a) * len;
    const tipY = crownY + Math.sin(a) * len * 0.55 + 26;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(crownX, crownY);
    ctx.quadraticCurveTo(
      crownX + Math.cos(a) * len * 0.55,
      crownY + Math.sin(a) * len * 0.5 - 6,
      tipX, tipY,
    );
    ctx.stroke();
  }
  // Coconuts: two small dots under the crown.
  ctx.beginPath();
  ctx.arc(crownX - 6, crownY + 6, 5, 0, Math.PI * 2);
  ctx.arc(crownX + 7, crownY + 8, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** One row of skyline buildings with lit windows, drawn as silhouette. */
export function drawSkylineRow(ctx, w, baseY, minH, maxH, color, windowColor, rng, windowsOn) {
  let x = -10;
  while (x < w + 10) {
    const bw = 34 + rng() * 96;
    const bh = minH + rng() * (maxH - minH);
    const top = baseY - bh;
    ctx.fillStyle = color;
    ctx.fillRect(x, top, bw, bh);
    // Rooftop antenna on some towers.
    if (rng() < 0.3) {
      ctx.fillRect(x + bw * 0.5 - 2, top - 22 - rng() * 18, 4, 26);
      ctx.fillStyle = windowColor;
      ctx.beginPath();
      ctx.arc(x + bw * 0.5, top - 24 - rng() * 16, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
    }
    // Lit windows: sparse grid, some dark.
    if (windowsOn) {
      ctx.fillStyle = windowColor;
      const cols = Math.max(1, Math.floor(bw / 18));
      const rows = Math.max(1, Math.floor(bh / 22));
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (rng() < 0.42) {
            ctx.globalAlpha = 0.35 + rng() * 0.6;
            ctx.fillRect(x + 6 + c * 18, top + 8 + r * 22, 8, 11);
          }
        }
      }
      ctx.globalAlpha = 1;
    }
    x += bw + 2 + rng() * 14;
  }
}

/** Halftone dot field fading toward the bottom of a band. */
export function drawHalftoneField(ctx, x, y, w, h, dotColor, rng) {
  const step = 14;
  for (let gy = 0; gy < h; gy += step) {
    for (let gx = 0; gx < w; gx += step) {
      const fade = gy / h;
      const r = 1 + fade * 4.2 + rng() * 0.8;
      ctx.fillStyle = dotColor;
      ctx.globalAlpha = 0.16 + fade * 0.5;
      ctx.beginPath();
      ctx.arc(x + gx + step / 2, y + gy + step / 2, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * Paints the full backdrop on ctx at size w x h.
 * palette: { sky:[...stops], sun, sunGlow, far, near, windows, dots, horizon }
 */
export function drawBackdrop(ctx, w, h, seed, palette) {
  const rng = mulberry32(seed);
  // Sky gradient.
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  palette.sky.forEach(([stop, color]) => sky.addColorStop(stop, color));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  // Sun disc + glow, placed upper third, slightly off-centre.
  const sunX = w * (0.62 + rng() * 0.1);
  const sunY = h * 0.3;
  const sunR = Math.min(w, h) * 0.13;
  const glow = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 3.2);
  glow.addColorStop(0, palette.sunGlow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = palette.sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
  // Sun slats: thin sky-coloured bands across the lower half of the sun.
  ctx.save();
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = palette.sky[0][1];
  let sy = sunY + sunR * 0.05;
  let band = 3;
  while (sy < sunY + sunR) {
    ctx.fillRect(sunX - sunR, sy, sunR * 2, band);
    sy += band + 9;
    band += 2;
  }
  ctx.restore();
  // Far skyline, then near skyline, both silhouettes.
  const horizon = h * 0.78;
  drawSkylineRow(ctx, w, horizon, h * 0.1, h * 0.24, palette.far, palette.windows, rng, false);
  drawSkylineRow(ctx, w, horizon + h * 0.04, h * 0.16, h * 0.34, palette.near, palette.windows, rng, true);
  // Ground band.
  ctx.fillStyle = palette.near;
  ctx.fillRect(0, horizon + h * 0.04, w, h - horizon);
  // Palms along the ground line, a few tall ones framing the edges.
  const palmCount = 5 + Math.floor(rng() * 3);
  for (let i = 0; i < palmCount; i++) {
    const px = (i / (palmCount - 1)) * w + (rng() - 0.5) * 60;
    const ps = (0.5 + rng() * 0.7) * (h / 900);
    drawPalm(ctx, px, horizon + h * 0.05 + rng() * 8, ps, palette.near, rng);
  }
  // Halftone dots across the lower sky band.
  drawHalftoneField(ctx, 0, h * 0.52, w, h * 0.26, palette.dots, rng);
}
