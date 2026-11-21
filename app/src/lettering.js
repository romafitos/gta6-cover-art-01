// Lettering: the gradient title, script subtitle, quote strip,
// panel labels, badges, and bottom strip. All sizes come from the
// fix spec. Two rules carry the whole module: badge type scales
// with U = min(W, H) (never with height alone), and every fitted
// line shrinks until it fits its allotted width, so portrait and
// square exports never overflow.
import { makeRng, halftoneField, drawPalm, drawBarcode, barcodeWidth } from './halftone.js';

// Shrinks a font size from `start` in 2 px steps until `text` fits
// `maxWidth`, never going below `min`. Returns the fitting size.
export function fitSize(ctx, text, font, start, maxWidth, min = 8) {
  let size = start;
  ctx.font = font(size);
  while (size > min && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = font(size);
  }
  return size;
}

// Tracks capitals by inserting a thin space between letters.
export function tracked(text) {
  return text.split('').join(' ');
}

// --- Title band (y 0.70H–0.94H) -------------------------------------

export function drawTitleBand(ctx, W, H, state, grade) {
  const bandY = 0.70 * H;
  const bandH = 0.24 * H;
  // Scrim: a deep plum gradient with a subtle halftone dot field.
  const scrim = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
  scrim.addColorStop(0, 'rgba(20,8,32,0.92)');
  scrim.addColorStop(1, 'rgba(10,6,18,0.96)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, bandY, W, bandH);
  const rng = makeRng(state.seed + 31);
  ctx.save();
  ctx.fillStyle = 'rgba(255,158,107,0.07)';
  for (let gy = bandY + 6; gy < bandY + bandH; gy += 13) {
    for (let gx = 6; gx < W; gx += 13) {
      const r = 1 + rng() * 1.8;
      ctx.beginPath();
      ctx.arc(gx, gy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  drawQuote(ctx, W, H, state, grade);
  drawTitle(ctx, W, H, state, grade);
  drawScript(ctx, W, H, state, grade);
}

// Quote strip: five stars, the quoted kicker, an em dash, and the
// herald credit, fitted to at most 0.72W so it never runs under
// the VOL. chip at the right end of the same row.
export function drawQuote(ctx, W, H, state, grade) {
  const text = `★★★★★ "${state.kicker}" — THE COAST HERALD`;
  const size = fitSize(ctx, text, (s) => `900 ${s}px "Archivo Black", sans-serif`, 0.024 * H, 0.72 * W, 10);
  ctx.save();
  ctx.font = `900 ${size}px "Archivo Black", sans-serif`;
  ctx.fillStyle = grade.kicker;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 0.3 * size;
  ctx.shadowOffsetY = 1;
  ctx.fillText(text, 0.02 * W, 0.722 * H);
  ctx.restore();
}

// The giant gradient title: pale gold through orange to pink, a
// dark outline, a magenta drop shadow, and a faint bright rim along
// the top edge of the glyphs for a bevelled look.
export function drawTitle(ctx, W, H, state, grade) {
  const text = (state.caption || '').trim().toUpperCase();
  if (!text) return;
  const size = fitSize(ctx, text, (s) => `${s}px Anton, "Archivo Black", sans-serif`, 0.155 * H, 0.94 * W, 12);
  const baseline = 0.885 * H;
  ctx.save();
  ctx.font = `${size}px Anton, "Archivo Black", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const grad = ctx.createLinearGradient(0, baseline - size * 0.85, 0, baseline + size * 0.1);
  grad.addColorStop(0, '#ffe9a8');
  grad.addColorStop(0.38, '#ffb347');
  grad.addColorStop(0.68, '#ff7e47');
  grad.addColorStop(1, '#ff2e88');
  ctx.shadowColor = 'rgba(255,46,136,0.55)';
  ctx.shadowBlur = 0.12 * size;
  ctx.shadowOffsetY = 0.055 * size;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = grade.outline;
  ctx.lineWidth = 0.13 * size;
  ctx.strokeText(text, W / 2, baseline);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = grad;
  ctx.fillText(text, W / 2, baseline);
  // Rim: a faint bright stroke along the top edge of the glyphs.
  ctx.strokeStyle = 'rgba(255,243,214,0.35)';
  ctx.lineWidth = 0.02 * size;
  ctx.strokeText(text, W / 2, baseline - 0.02 * size);
  ctx.restore();
}

// Script subtitle in Pacifico, pink with a dark outline and a soft
// white glow, rotated slightly, fitted to at most 0.32W so it never
// runs under the COLLECTOR'S ribbon.
export function drawScript(ctx, W, H, state, grade) {
  const text = state.script || '';
  if (!text) return;
  const size = fitSize(ctx, text, (s) => `${s}px Pacifico, cursive`, 0.058 * H, 0.32 * W, 10);
  ctx.save();
  ctx.translate(W * 0.50, 0.932 * H);
  ctx.rotate(-0.035);
  ctx.font = `${size}px Pacifico, cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(255,255,255,0.65)';
  ctx.shadowBlur = 0.18 * size;
  ctx.shadowOffsetY = 1;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(28,11,46,0.85)';
  ctx.lineWidth = 0.07 * size;
  ctx.strokeText(text, 0, 0);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ff8fd1';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

// --- Panel labels ----------------------------------------------------

// A dark pill at the bottom-left inside the panel: the place name in
// bold white on the first line, time plus tagline in amber on the
// second. Both lines shrink together (×0.9 per step, up to 12 steps)
// until the wider line fits 0.94 of the panel width minus padding.
export function drawPanelLabel(ctx, panel, W, H, grade) {
  const px = panel.x * W;
  const py = panel.y * H;
  const pw = panel.w * W;
  const ph = panel.h * H;
  const padX = 0.045 * ph;
  const padY = 0.04 * ph;
  let nameSize = Math.max(10, 0.052 * ph);
  let subSize = Math.max(8, 0.036 * ph);
  const nameFont = (s) => `900 ${s}px "Archivo Black", sans-serif`;
  const subFont = (s) => `700 ${s}px "Archivo Black", sans-serif`;
  for (let step = 0; step < 12; step++) {
    ctx.font = nameFont(nameSize);
    const nw = ctx.measureText(panel.label).width;
    ctx.font = subFont(subSize);
    const sw = ctx.measureText(panel.sub).width;
    if (Math.max(nw, sw) <= 0.94 * pw - 2 * padX) break;
    nameSize = Math.max(10, nameSize * 0.9);
    subSize = Math.max(8, subSize * 0.9);
  }
  ctx.font = nameFont(nameSize);
  const nameW = ctx.measureText(panel.label).width;
  ctx.font = subFont(subSize);
  const subW = ctx.measureText(panel.sub).width;
  const pillW = Math.max(nameW, subW) + 2 * padX;
  const pillH = nameSize + subSize + 3 * padY;
  const pillX = px + 0.02 * pw;
  const pillY = py + ph - pillH - 0.035 * ph;
  ctx.save();
  ctx.fillStyle = 'rgba(10,6,18,0.78)';
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 0.18 * pillH);
  ctx.fill();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = nameFont(nameSize);
  ctx.fillText(panel.label, pillX + padX, pillY + padY + nameSize * 0.9);
  ctx.fillStyle = grade.kicker;
  ctx.font = subFont(subSize);
  ctx.fillText(panel.sub, pillX + padX, pillY + padY + nameSize + padY + subSize * 0.9);
  ctx.restore();
}

// --- Badges (all type scales with U = min(W, H)) ---------------------

export function drawBadges(ctx, W, H, state, grade) {
  const U = Math.min(W, H);
  // WANTED pill, top-right corner: gold text on dark, gold border.
  const wanted = 'WANTED ★★★★★';
  const wFont = 0.024 * U;
  const wPad = 0.012 * U;
  ctx.save();
  ctx.font = `900 ${wFont}px "Archivo Black", sans-serif`;
  const wText = ctx.measureText(wanted).width;
  const wW = wText + 2 * wPad;
  const wH = wFont + 2 * wPad;
  const wX = W - wW - wPad * 1.6;
  const wY = wPad * 2;
  ctx.fillStyle = 'rgba(10,6,18,0.85)';
  ctx.strokeStyle = grade.kicker;
  ctx.lineWidth = Math.max(2, 0.002 * U);
  ctx.beginPath();
  ctx.roundRect(wX, wY, wW, wH, 0.5 * wH);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = grade.kicker;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(wanted, wX + wW / 2, wY + wH / 2 + wFont * 0.05);
  ctx.restore();

  // EST. starburst seal at the hero-pier junction, mid-height of
  // the pier panel: sixteen spikes, gold, dark ring and dark text.
  const cx = 0.52 * W;
  const cy = 0.175 * H;
  const r = 0.048 * U;
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 32; i++) {
    const ang = (i / 32) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.80;
    const x = cx + Math.cos(ang) * rad;
    const y = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = grade.kicker;
  ctx.fill();
  ctx.strokeStyle = grade.outline;
  ctx.lineWidth = 0.06 * r;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2);
  ctx.strokeStyle = grade.outline;
  ctx.lineWidth = Math.max(1, 0.03 * r);
  ctx.stroke();
  ctx.fillStyle = grade.outline;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${0.34 * r}px "Archivo Black", sans-serif`;
  ctx.fillText('EST.', cx, cy - r * 0.18);
  ctx.font = `900 ${0.42 * r}px "Archivo Black", sans-serif`;
  ctx.fillText('2026', cx, cy + r * 0.28);
  ctx.restore();

  // VOL. 06 chip, dark text on cyan, right end of the quote row.
  const vol = 'VOL. 06';
  const vFont = 0.022 * U;
  const vPad = 0.01 * U;
  ctx.save();
  ctx.font = `900 ${vFont}px "Archivo Black", sans-serif`;
  const vW = ctx.measureText(vol).width + 2 * vPad;
  const vH = vFont + 2 * vPad;
  const vX = 0.985 * W - vW;
  const vY = 0.715 * H;
  ctx.fillStyle = '#7df9ff';
  ctx.strokeStyle = '#0d0616';
  ctx.lineWidth = Math.max(2, 0.002 * U);
  ctx.beginPath();
  ctx.roundRect(vX, vY, vW, vH, 0.25 * vH);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#0d0616';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(vol, vX + vW / 2, vY + vH / 2 + vFont * 0.05);
  ctx.restore();

  // COLLECTOR'S EDITION ribbon, white on pink, notched left end,
  // right end of the title row.
  const rib = "COLLECTOR'S EDITION";
  const rFont = 0.02 * U;
  const rPad = 0.012 * U;
  ctx.save();
  ctx.font = `900 ${rFont}px "Archivo Black", sans-serif`;
  const rText = ctx.measureText(rib).width;
  const rW = rText + 2 * rPad;
  const rH = rFont + 2 * rPad;
  const rX = 0.985 * W - rW;
  const rY = 0.90 * H;
  ctx.fillStyle = grade.accent;
  ctx.beginPath();
  ctx.moveTo(rX + 0.5 * rH, rY);
  ctx.lineTo(rX + rW, rY);
  ctx.lineTo(rX + rW, rY + rH);
  ctx.lineTo(rX + 0.5 * rH, rY + rH);
  ctx.lineTo(rX, rY + rH / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(rib, rX + 0.5 * rH + rText / 2 + rPad * 0.5, rY + rH / 2 + rFont * 0.05);
  ctx.restore();
}

// --- Bottom strip (y 0.94H–1.00H) -------------------------------------

export function drawStrip(ctx, W, H, state, grade) {
  const stripY = 0.94 * H;
  const stripH = 0.06 * H;
  const bg = ctx.createLinearGradient(0, stripY, 0, H);
  bg.addColorStop(0, '#1c0b2e');
  bg.addColorStop(1, '#0d0616');
  ctx.fillStyle = bg;
  ctx.fillRect(0, stripY, W, stripH);
  ctx.fillStyle = '#ff7e47';
  ctx.fillRect(0, stripY, W, Math.max(2, 0.003 * H));
  // Palm silhouettes at both ends.
  drawPalm(ctx, 0.03 * W, stripY + stripH * 0.96, stripH * 0.90, 'rgba(255,126,71,0.9)', Math.max(2, 0.09 * stripH));
  drawPalm(ctx, 0.97 * W, stripY + stripH * 0.96, stripH * 0.90, 'rgba(255,126,71,0.9)', Math.max(2, 0.09 * stripH));
  // Centred tracked-caps tagline, fitted to at most 0.60W.
  const tag = tracked(state.strip || '');
  const size = fitSize(ctx, tag, (s) => `900 ${s}px "Archivo Black", sans-serif`, Math.max(9, 0.34 * stripH), 0.60 * W, 9);
  ctx.save();
  ctx.font = `900 ${size}px "Archivo Black", sans-serif`;
  ctx.fillStyle = grade.kicker;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tag, W / 2, stripY + stripH / 2 + size * 0.05);
  ctx.restore();
  // Fine print at the left, landscape only (W >= 1.15H).
  if (W >= 1.15 * H) {
    const fp = Math.max(7, 0.20 * stripH);
    ctx.save();
    ctx.font = `700 ${fp}px "Archivo Black", sans-serif`;
    ctx.fillStyle = 'rgba(244,239,255,0.75)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('VICE COVER STUDIO — ORIGINAL ART PRINT', 0.055 * W, stripY + stripH / 2);
    ctx.restore();
  }
  // Barcode bars at the right, right-aligned to end at 0.93W so
  // they never run off the cover edge or into the right palm's
  // fronds (the palm crown leans left to about 0.94W).
  drawBarcode(ctx, 0.93 * W - barcodeWidth(stripH), stripY, stripH, 'rgba(244,239,255,0.85)');
}
