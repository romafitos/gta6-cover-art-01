// Lettering: the gradient title, script subtitle, quote strip, panel
// labels, badges, and bottom strip. All sizes come from the round-2 fix
// spec. Two rules carry the whole module: badge type scales with
// U = min(W, H) (never with height alone), and every fitted line shrinks
// until it fits its allotted width, so portrait and square exports
// cannot overflow the way round 1 did.

import { drawHalftone } from './halftone.js';
import { drawPalm } from './skyline.js';

// Shrinks a font from startSize by 2 px steps until text fits maxWidth.
// Returns the fitted size; the caller sets ctx.font with it.
export function fitSize(ctx, text, family, weight, startSize, maxWidth, minSize = 8) {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// --- Title band -----------------------------------------------------------

export function drawTitleBand(ctx, W, H, U, grade, state, seed) {
  const top = H * 0.70;
  const bottom = H * 0.94;
  const scrim = ctx.createLinearGradient(0, top, 0, bottom);
  scrim.addColorStop(0, 'rgba(20,8,32,0.92)');
  scrim.addColorStop(1, 'rgba(10,6,18,0.96)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, top, W, bottom - top);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, top, W, bottom - top);
  ctx.clip();
  drawHalftone(ctx, 0, top, W, bottom - top, 13, 'rgba(255,158,107,0.07)', seed, 1, 2.8);
  ctx.restore();
  drawQuote(ctx, W, H, grade, state);
  drawTitle(ctx, W, H, grade, state);
  drawScript(ctx, W, H, state);
  drawVolChip(ctx, W, H, U);
  drawRibbon(ctx, W, H, U);
}

function drawQuote(ctx, W, H, grade, state) {
  const text = `★★★★★ "${state.kicker.toUpperCase()}" — THE COAST HERALD`;
  const size = fitSize(ctx, text, '"Archivo Black", sans-serif', '400', H * 0.024, W * 0.72, 8);
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = grade.kicker;
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = size * 0.3;
  ctx.shadowOffsetY = 1;
  ctx.fillText(text, W * 0.015, H * 0.722);
  ctx.restore();
}

function drawTitle(ctx, W, H, grade, state) {
  const text = state.caption.trim().toUpperCase();
  if (!text) return;
  const size = fitSize(ctx, text, 'Anton, sans-serif', '400', H * 0.155, W * 0.94, 10);
  const baseline = H * 0.885;
  const grad = ctx.createLinearGradient(0, baseline - size, 0, baseline + size * 0.1);
  grad.addColorStop(0, '#ffe9a8');
  grad.addColorStop(0.38, '#ffb347');
  grad.addColorStop(0.68, '#ff7e47');
  grad.addColorStop(1, '#ff2e88');
  ctx.save();
  ctx.font = `400 ${size}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(255,46,136,0.55)';
  ctx.shadowBlur = size * 0.12;
  ctx.shadowOffsetY = size * 0.055;
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.13;
  ctx.strokeStyle = grade.outline;
  ctx.strokeText(text, W / 2, baseline);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = grad;
  ctx.fillText(text, W / 2, baseline);
  // Faint bright rim along the top edge of the glyphs, for a bevelled look.
  ctx.lineWidth = size * 0.02;
  ctx.strokeStyle = 'rgba(255,243,214,0.35)';
  ctx.strokeText(text, W / 2, baseline - size * 0.02);
  ctx.restore();
}

function drawScript(ctx, W, H, state) {
  const text = state.script;
  if (!text) return;
  const size = fitSize(ctx, text, 'Pacifico, cursive', '400', H * 0.058, W * 0.32, 10);
  ctx.save();
  ctx.translate(W * 0.5, H * 0.932);
  ctx.rotate(-0.035);
  ctx.font = `400 ${size}px Pacifico, cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(255,255,255,0.65)';
  ctx.shadowBlur = size * 0.18;
  ctx.shadowOffsetY = 1;
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.07;
  ctx.strokeStyle = 'rgba(28,11,46,0.85)';
  ctx.strokeText(text, 0, 0);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = '#ff8fd1';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

// --- Panel labels ---------------------------------------------------------

export function drawPanelLabel(ctx, px, py, pw, ph, name, sub) {
  let nameSize = Math.max(10, ph * 0.052);
  let subSize = Math.max(8, ph * 0.036);
  const padX = ph * 0.045;
  const padY = ph * 0.04;
  const limit = pw * 0.94 - padX * 2;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  for (let step = 0; step < 12; step++) {
    ctx.font = `400 ${nameSize}px "Archivo Black", sans-serif`;
    const nw = ctx.measureText(name).width;
    ctx.font = `400 ${subSize}px "Archivo Black", sans-serif`;
    const sw = ctx.measureText(sub).width;
    if (Math.max(nw, sw) <= limit) break;
    nameSize = Math.max(10, nameSize * 0.9);
    subSize = Math.max(8, subSize * 0.9);
  }
  ctx.font = `400 ${nameSize}px "Archivo Black", sans-serif`;
  const nameW = ctx.measureText(name).width;
  ctx.font = `400 ${subSize}px "Archivo Black", sans-serif`;
  const subW = ctx.measureText(sub).width;
  const pillW = Math.max(nameW, subW) + padX * 2;
  const pillH = padY * 2 + nameSize * 1.05 + subSize * 1.25;
  const pillX = px + pw * 0.02;
  const pillY = py + ph - pillH - ph * 0.035;
  ctx.save();
  ctx.fillStyle = 'rgba(10,6,18,0.78)';
  roundRect(ctx, pillX, pillY, pillW, pillH, pillH * 0.18);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `400 ${nameSize}px "Archivo Black", sans-serif`;
  ctx.fillText(name, pillX + padX, pillY + padY + nameSize * 0.95);
  ctx.fillStyle = '#ffd166';
  ctx.font = `400 ${subSize}px "Archivo Black", sans-serif`;
  ctx.fillText(sub, pillX + padX, pillY + padY + nameSize * 1.05 + subSize * 1.15);
  ctx.restore();
}

// --- Badges ---------------------------------------------------------------

export function drawWantedPill(ctx, W, H, U) {
  const font = U * 0.024;
  const pad = U * 0.012;
  const text = 'WANTED ★★★★★';
  ctx.save();
  ctx.font = `400 ${font}px "Archivo Black", sans-serif`;
  const tw = ctx.measureText(text).width;
  const bw = tw + pad * 2;
  const bh = font * 1.9;
  const bx = W - bw - pad * 1.6;
  const by = pad * 2;
  ctx.fillStyle = 'rgba(10,6,18,0.85)';
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = Math.max(2, U * 0.002);
  roundRect(ctx, bx, by, bw, bh, bh * 0.4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffd166';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + bw / 2, by + bh / 2 + font * 0.05);
  ctx.restore();
}

export function drawEstSeal(ctx, W, H, U) {
  const cx = W * 0.52;
  const cy = H * 0.175;
  const r = U * 0.048;
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 32; i++) {
    const ang = (i / 32) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.8;
    const x = cx + Math.cos(ang) * rad;
    const y = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd166';
  ctx.fill();
  ctx.lineWidth = r * 0.06;
  ctx.strokeStyle = '#1c0b2e';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1, r * 0.04);
  ctx.stroke();
  ctx.fillStyle = '#1c0b2e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `400 ${r * 0.34}px "Archivo Black", sans-serif`;
  ctx.fillText('EST.', cx, cy - r * 0.22);
  ctx.font = `400 ${r * 0.42}px "Archivo Black", sans-serif`;
  ctx.fillText('2026', cx, cy + r * 0.24);
  ctx.restore();
}

export function drawVolChip(ctx, W, H, U) {
  const font = U * 0.022;
  const pad = U * 0.01;
  const text = 'VOL. 06';
  ctx.save();
  ctx.font = `400 ${font}px "Archivo Black", sans-serif`;
  const tw = ctx.measureText(text).width;
  const bw = tw + pad * 2;
  const bh = font * 1.9;
  const bx = W * 0.985 - bw;
  const by = H * 0.715 - bh / 2;
  ctx.fillStyle = '#7df9ff';
  ctx.strokeStyle = '#0d0616';
  ctx.lineWidth = Math.max(2, U * 0.002);
  roundRect(ctx, bx, by, bw, bh, bh * 0.3);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#0d0616';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + bw / 2, by + bh / 2 + font * 0.05);
  ctx.restore();
}

export function drawRibbon(ctx, W, H, U) {
  const font = U * 0.02;
  const pad = U * 0.012;
  const text = "COLLECTOR'S EDITION";
  ctx.save();
  ctx.font = `400 ${font}px "Archivo Black", sans-serif`;
  const tw = ctx.measureText(text).width;
  const bw = tw + pad * 2;
  const bh = font * 1.9;
  const bx = W * 0.985 - bw;
  const by = H * 0.90 - bh / 2;
  const notch = bh * 0.5;
  ctx.beginPath();
  ctx.moveTo(bx + notch, by);
  ctx.lineTo(bx + bw, by);
  ctx.lineTo(bx + bw, by + bh);
  ctx.lineTo(bx + notch, by + bh);
  ctx.lineTo(bx, by + bh / 2);
  ctx.closePath();
  ctx.fillStyle = '#ff2e88';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + notch / 2 + bw / 2, by + bh / 2 + font * 0.05);
  ctx.restore();
}

// --- Bottom strip ---------------------------------------------------------

export function drawStrip(ctx, W, H, U, state) {
  const top = H * 0.94;
  const sh = H - top;
  const bg = ctx.createLinearGradient(0, top, 0, H);
  bg.addColorStop(0, '#1c0b2e');
  bg.addColorStop(1, '#0d0616');
  ctx.fillStyle = bg;
  ctx.fillRect(0, top, W, sh);
  ctx.fillStyle = '#ff7e47';
  ctx.fillRect(0, top, W, Math.max(2, H * 0.003));
  const palmH = sh * 0.90;
  const strokeW = Math.max(2, sh * 0.09);
  drawPalm(ctx, W * 0.03, top + sh * 0.96, palmH, 'rgba(255,126,71,0.9)', strokeW);
  drawPalm(ctx, W * 0.97, top + sh * 0.96, palmH, 'rgba(255,126,71,0.9)', strokeW);
  // Tracked-caps tagline: a thin space between every letter.
  const tracked = state.strip.toUpperCase().split('').join(' ');
  const size = fitSize(ctx, tracked, '"Archivo Black", sans-serif', '400', Math.max(9, sh * 0.34), W * 0.60, 9);
  ctx.save();
  ctx.font = `400 ${size}px "Archivo Black", sans-serif`;
  ctx.fillStyle = '#ffd166';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tracked, W / 2, top + sh * 0.52);
  ctx.restore();
  // Fine print: landscape only, so it never collides with the tagline.
  if (W >= 1.15 * H) {
    const fp = Math.max(7, sh * 0.20);
    ctx.save();
    ctx.font = `400 ${fp}px "Archivo Black", sans-serif`;
    ctx.fillStyle = 'rgba(244,239,255,0.75)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('VICE COVER STUDIO — ORIGINAL ART PRINT', W * 0.055, top + sh * 0.52);
    ctx.restore();
  }
  // Barcode bars at the right. The start is clamped so the whole code
  // stays on the canvas even at portrait width, where the strip is tall.
  const widths = [3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1];
  const unit = Math.max(1, sh * 0.045);
  const gap = Math.max(1, sh * 0.05);
  const barH = sh * 0.56;
  const total = widths.reduce((a, m) => a + m * unit, 0) + gap * (widths.length - 1);
  let bx = Math.min(W * 0.90, W * 0.985 - total);
  ctx.save();
  ctx.fillStyle = 'rgba(244,239,255,0.85)';
  for (const mult of widths) {
    ctx.fillRect(bx, top + (sh - barH) / 2, mult * unit, barH);
    bx += mult * unit + gap;
  }
  ctx.restore();
}
