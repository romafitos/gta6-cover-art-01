// Procedural art: the seeded skyline backdrop and the marina scene panel.
// Both are drawn entirely by canvas code from the grade palette and the
// cover seed, so the same seed always paints the same picture. No photo
// assets are involved, which is what makes the marina panel unique art
// instead of a third copy of a photograph.

import { drawHalftone, makeRng } from './halftone.js';

function skyGradient(ctx, x, y, w, h, grade) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  for (const [stop, colour] of grade.sky) g.addColorStop(stop, colour);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

// A sun disc with a warm glow and slatted bands cut across its lower half.
// (cx, cy) and r are absolute canvas coordinates. The slats use the sky's
// top colour so the sun reads as setting behind thin cloud bands.
function drawSun(ctx, cx, cy, r, grade) {
  const glow = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 3);
  glow.addColorStop(0, grade.glow);
  glow.addColorStop(1, 'rgba(255,140,60,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 3, cy - r * 3, r * 6, r * 6);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grade.sun;
  ctx.fill();
  ctx.clip();
  // Slats: horizontal bands of the sky's top colour, widening as they drop.
  ctx.fillStyle = grade.sky[0][1];
  let band = 2;
  let yy = cy + r * 0.05;
  while (yy < cy + r) {
    ctx.fillRect(cx - r, yy, r * 2, band);
    yy += band + 6;
    band += 1.5;
  }
  ctx.restore();
}

// One row of skyline silhouettes along a baseline. Buildings get seeded
// widths and heights between minH and maxH; when windows is true, a few
// lit windows are punched into each tower.
function drawSkylineRow(ctx, x, yBase, w, minH, maxH, colour, grade, seed, salt, windows) {
  const rng = makeRng(seed, salt);
  let bx = x;
  ctx.fillStyle = colour;
  while (bx < x + w) {
    const bw = w * (0.05 + rng() * 0.09);
    const bh = minH + rng() * (maxH - minH);
    ctx.fillRect(bx, yBase - bh, bw, bh);
    if (windows) {
      const cols = Math.max(1, Math.floor(bw / 14));
      const rows = Math.max(1, Math.floor(bh / 20));
      ctx.fillStyle = grade.windows;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (rng() > 0.62) {
            ctx.fillRect(bx + 4 + c * 14, yBase - bh + 6 + r * 20, 5, 7);
          }
        }
      }
      ctx.fillStyle = colour;
    }
    bx += bw + w * 0.008;
  }
}

// A palm silhouette: a leaning trunk and five drooping fronds.
export function drawPalm(ctx, x, yBase, height, colour, width = 2) {
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = Math.max(2, width);
  ctx.lineCap = 'round';
  const lean = height * 0.12;
  ctx.beginPath();
  ctx.moveTo(x, yBase);
  ctx.quadraticCurveTo(x + lean * 0.4, yBase - height * 0.55, x + lean, yBase - height);
  ctx.stroke();
  const topX = x + lean;
  const topY = yBase - height;
  for (let i = 0; i < 5; i++) {
    const spread = -0.9 + i * 0.45;
    const len = height * (0.42 - Math.abs(spread) * 0.12);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.sin(spread) * len * 0.7, topY - Math.cos(spread) * len * 0.35,
      topX + Math.sin(spread) * len, topY + len * 0.45,
    );
    ctx.stroke();
  }
  ctx.restore();
}

// The full backdrop: gradient sky, slatted sun, two skyline rows, a ground
// band, palms at the edges, and a halftone dot field across the sky.
export function drawBackdrop(ctx, x, y, w, h, grade, seed) {
  skyGradient(ctx, x, y, w, h, grade);
  drawSun(ctx, x + w * 0.5, y + h * 0.42, h * 0.16, grade);
  const groundY = y + h * 0.78;
  drawSkylineRow(ctx, x, groundY, w, h * 0.08, h * 0.20, grade.far, grade, seed, 11, false);
  drawSkylineRow(ctx, x, groundY + h * 0.03, w, h * 0.12, h * 0.26, grade.near, grade, seed, 23, true);
  ctx.fillStyle = grade.near;
  ctx.fillRect(x, groundY + h * 0.03, w, y + h - (groundY + h * 0.03));
  drawPalm(ctx, x + w * 0.06, y + h * 0.98, h * 0.22, grade.near, Math.max(2, h * 0.008));
  drawPalm(ctx, x + w * 0.94, y + h * 0.98, h * 0.20, grade.near, Math.max(2, h * 0.008));
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y + h * 0.10, w, h * 0.45);
  ctx.clip();
  drawHalftone(ctx, x, y + h * 0.10, w, h * 0.45, 14, grade.dots, seed, 1, 2.4);
  ctx.restore();
}

// The marina scene: the one panel no winner has. Sky and sun up top, a
// two-row skyline down to a waterline, a dark water band with a gold sun
// reflection made of narrowing dashes, two sailboat silhouettes, and a
// halftone field across the sky band.
export function drawMarinaScene(ctx, x, y, w, h, grade, seed) {
  const waterline = y + h * 0.70;
  skyGradient(ctx, x, y, w, h * 0.70, grade);
  drawSun(ctx, x + w * 0.68, y + h * 0.46, h * 0.17, grade);
  drawSkylineRow(ctx, x, waterline, w, h * 0.08, h * 0.20, grade.far, grade, seed, 31, false);
  drawSkylineRow(ctx, x, waterline + h * 0.03, w, h * 0.12, h * 0.26, grade.near, grade, seed, 47, true);
  const water = ctx.createLinearGradient(0, waterline, 0, y + h);
  water.addColorStop(0, '#14324a');
  water.addColorStop(1, '#081826');
  ctx.fillStyle = water;
  ctx.fillRect(x, waterline, w, y + h - waterline);
  // Sun reflection: gold dashes under the sun, narrowing as they descend.
  const rng = makeRng(seed, 59);
  const sunX = x + w * 0.68;
  let dashW = h * 0.17 * 0.9;
  let ry = waterline + h * 0.02;
  ctx.fillStyle = 'rgba(255,200,110,0.55)';
  while (ry < y + h - h * 0.02 && dashW > 2) {
    const jitter = (rng() - 0.5) * dashW * 0.3;
    ctx.fillRect(sunX - dashW / 2 + jitter, ry, dashW, Math.max(2, h * 0.012));
    dashW *= 0.92;
    ry += h * 0.045;
  }
  // Sailboats: hull trapezoid, mast, two triangular sails. Both boats
  // sit right of the label pill: the pill spans up to ~0.56 of the panel
  // width at portrait size, and boats at the spec's 0.22/0.44 hid behind
  // it (only mast tips poked out). 0.63 and 0.85 clear it at all sizes.
  drawSailboat(ctx, x + w * 0.63, waterline + h * 0.13, h / 380);
  drawSailboat(ctx, x + w * 0.85, waterline + h * 0.19, h / 460);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y + h * 0.28, w, h * 0.30);
  ctx.clip();
  drawHalftone(ctx, x, y + h * 0.28, w, h * 0.30, 14, grade.dots, seed, 1, 2.4);
  ctx.restore();
}

function drawSailboat(ctx, bx, by, s) {
  ctx.save();
  ctx.fillStyle = '#0d0616';
  ctx.strokeStyle = '#0d0616';
  // Hull: a trapezoid, wider at the top edge.
  ctx.beginPath();
  ctx.moveTo(bx - 26 * s, by - 6 * s);
  ctx.lineTo(bx + 26 * s, by - 6 * s);
  ctx.lineTo(bx + 18 * s, by + 6 * s);
  ctx.lineTo(bx - 18 * s, by + 6 * s);
  ctx.closePath();
  ctx.fill();
  // Mast.
  ctx.lineWidth = Math.max(1, 2 * s);
  ctx.beginPath();
  ctx.moveTo(bx, by - 6 * s);
  ctx.lineTo(bx, by - 52 * s);
  ctx.stroke();
  // Two sails: a tall triangle ahead of the mast, a shorter one behind.
  ctx.beginPath();
  ctx.moveTo(bx + 2 * s, by - 50 * s);
  ctx.lineTo(bx + 2 * s, by - 10 * s);
  ctx.lineTo(bx + 24 * s, by - 10 * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bx - 2 * s, by - 46 * s);
  ctx.lineTo(bx - 2 * s, by - 10 * s);
  ctx.lineTo(bx - 18 * s, by - 10 * s);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
