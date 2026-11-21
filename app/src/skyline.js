// Procedural art: the seeded skyline backdrop and the marina scene
// panel. Both are drawn entirely by canvas code from the grade
// palette and the cover seed, so the same seed always paints the
// same picture. No photo assets are involved, which is what makes
// the marina panel unique art instead of a third copy of a photo.
import { makeRng, halftoneField, drawPalm } from './halftone.js';

// Paints a vertical gradient from the grade's sky stops over a
// rectangle, then returns the context for the caller to keep drawing.
export function paintSky(ctx, x, y, w, h, grade) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  for (const [stop, colour] of grade.sky) g.addColorStop(stop, colour);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

// A sun disc with a soft glow and slatted bands across its lower
// half, so the disc reads as a setting sun behind blinds of light.
export function drawSun(ctx, cx, cy, r, grade) {
  ctx.save();
  const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 3);
  glow.addColorStop(0, grade.sunGlow);
  glow.addColorStop(1, 'rgba(255,140,60,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 3, cy - r * 3, r * 6, r * 6);
  ctx.fillStyle = grade.sun;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // Slats: horizontal bands of the sky's darkest stop, widening
  // as they go down, clipped to the disc.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = grade.sky[0][1];
  let bandY = cy + r * 0.05;
  let bandH = 2;
  while (bandY < cy + r) {
    ctx.fillRect(cx - r, bandY, r * 2, bandH);
    bandY += bandH + 6;
    bandH += 1.5;
  }
  ctx.restore();
  ctx.restore();
}

// One row of skyline silhouettes: seeded building widths and heights
// between minH and maxH, with lit windows when `windows` is true.
export function drawSkylineRow(ctx, x, yBase, w, minH, maxH, colour, windows, windowColour, rng) {
  ctx.save();
  ctx.fillStyle = colour;
  let bx = x;
  while (bx < x + w) {
    const bw = w * (0.05 + rng() * 0.09);
    const bh = minH + rng() * (maxH - minH);
    ctx.fillRect(bx, yBase - bh, bw, bh);
    if (windows) {
      ctx.fillStyle = windowColour;
      const cols = Math.max(1, Math.floor(bw / 14));
      const rows = Math.max(1, Math.floor(bh / 18));
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (rng() < 0.42) {
            ctx.fillRect(bx + 4 + c * 14, yBase - bh + 5 + r * 18, 5, 7);
          }
        }
      }
      ctx.fillStyle = colour;
    }
    bx += bw + w * 0.008;
  }
  ctx.restore();
}

// The full backdrop: sky, sun, two skyline rows, a ground band,
// palms at the edges, and a halftone dot field across the sky.
export function drawBackdrop(ctx, x, y, w, h, grade, seed) {
  const rng = makeRng(seed);
  paintSky(ctx, x, y, w, h, grade);
  drawSun(ctx, x + w * 0.68, y + h * 0.42, h * 0.16, grade);
  const groundY = y + h * 0.82;
  drawSkylineRow(ctx, x, groundY, w, h * 0.08, h * 0.20, grade.farSkyline, false, grade.windows, rng);
  drawSkylineRow(ctx, x, groundY + h * 0.03, w, h * 0.12, h * 0.26, grade.nearSkyline, true, grade.windows, rng);
  ctx.fillStyle = grade.nearSkyline;
  ctx.fillRect(x, groundY, w, y + h - groundY);
  drawPalm(ctx, x + w * 0.06, y + h * 0.98, h * 0.30, grade.nearSkyline, Math.max(2, h * 0.012));
  drawPalm(ctx, x + w * 0.94, y + h * 0.98, h * 0.26, grade.nearSkyline, Math.max(2, h * 0.012));
  halftoneField(ctx, { x, y: y + h * 0.05, w, h: h * 0.35 }, seed + 7, 14, grade.dots, 1, 2.6);
}

// The marina scene: its own sky, a big low sun, two skyline rows
// down to a waterline, a water band with a gold sun reflection,
// two sailboat silhouettes, and a halftone field across the sky.
export function drawMarinaScene(ctx, x, y, w, h, grade, seed) {
  const rng = makeRng(seed + 101);
  paintSky(ctx, x, y, w, h, grade);
  const sunX = x + w * 0.68;
  const sunY = y + h * 0.46;
  const sunR = h * 0.17;
  drawSun(ctx, sunX, sunY, sunR, grade);
  const waterY = y + h * 0.70;
  drawSkylineRow(ctx, x, waterY, w, h * 0.08, h * 0.20, grade.farSkyline, false, grade.windows, rng);
  drawSkylineRow(ctx, x, waterY + h * 0.03, w, h * 0.12, h * 0.26, grade.nearSkyline, true, grade.windows, rng);
  // Water: a dark teal gradient from the waterline to the panel foot.
  const water = ctx.createLinearGradient(0, waterY, 0, y + h);
  water.addColorStop(0, '#14324a');
  water.addColorStop(1, '#081826');
  ctx.fillStyle = water;
  ctx.fillRect(x, waterY, w, y + h - waterY);
  // Sun reflection: gold dashes under the sun, narrowing as they
  // descend, with a seeded horizontal jitter per row.
  ctx.save();
  ctx.fillStyle = 'rgba(255,200,110,0.55)';
  let dashW = sunR * 0.9;
  let dashY = waterY + h * 0.02;
  while (dashY < y + h - 4) {
    const jitter = (rng() - 0.5) * dashW * 0.3;
    ctx.fillRect(sunX - dashW / 2 + jitter, dashY, dashW, Math.max(2, h * 0.008));
    dashW *= 0.92;
    dashY += h * 0.045;
  }
  ctx.restore();
  // Two sailboats: hull trapezoid, mast, and two triangular sails.
  drawSailboat(ctx, x + w * 0.22, waterY + h * 0.13, h / 380, '#0d0616');
  drawSailboat(ctx, x + w * 0.44, waterY + h * 0.19, h / 460, '#0d0616');
  halftoneField(ctx, { x, y: y + h * 0.28, w, h: h * 0.30 }, seed + 23, 14, grade.dots, 1, 2.6);
}

function drawSailboat(ctx, bx, by, s, colour) {
  ctx.save();
  ctx.fillStyle = colour;
  ctx.strokeStyle = colour;
  // Hull: a trapezoid wider at the top.
  ctx.beginPath();
  ctx.moveTo(bx - 26 * s, by);
  ctx.lineTo(bx + 26 * s, by);
  ctx.lineTo(bx + 18 * s, by + 12 * s);
  ctx.lineTo(bx - 18 * s, by + 12 * s);
  ctx.closePath();
  ctx.fill();
  // Mast.
  ctx.lineWidth = Math.max(1.5, 2.5 * s);
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx, by - 46 * s);
  ctx.stroke();
  // Two sails: a tall main sail left of the mast, a smaller jib right.
  ctx.beginPath();
  ctx.moveTo(bx - 2 * s, by - 44 * s);
  ctx.lineTo(bx - 2 * s, by - 4 * s);
  ctx.lineTo(bx - 22 * s, by - 4 * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bx + 2 * s, by - 40 * s);
  ctx.lineTo(bx + 2 * s, by - 4 * s);
  ctx.lineTo(bx + 16 * s, by - 4 * s);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// A plain ground-band skyline for the 'skyline' scene panel used by
// the non-champion layouts: backdrop art without the marina water.
export function drawSkylineScene(ctx, x, y, w, h, grade, seed) {
  drawBackdrop(ctx, x, y, w, h, grade, seed + 5);
}
