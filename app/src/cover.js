// Compositor: paints one cover at any size from a state object.
// Layers: (1) procedural backdrop, (2) photo panels with per-panel treatment
// and crop, (3) panel gutters + comic borders, (4) caption block, (5) badge.
import { drawBackdrop } from './skyline.js';
import { drawTreatedPhoto } from './halftone.js';
import { drawCaptionBlock, drawBadge } from './lettering.js';
import { LAYOUTS, GRADES } from './presets.js';

/** Diagonal clip polygons for the diagonal-split layout (fractions). */
function diagClip(ctx, w, h, which) {
  const band = h * 0.78;
  ctx.beginPath();
  if (which === 'diag-a') {
    ctx.moveTo(0, 0);
    ctx.lineTo(w * 0.62, 0);
    ctx.lineTo(w * 0.38, band);
    ctx.lineTo(0, band);
  } else {
    ctx.moveTo(w * 0.62, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, band);
    ctx.lineTo(w * 0.38, band);
  }
  ctx.closePath();
  ctx.clip();
  // Diagonal seam: a bright gutter line along the split.
  ctx.beginPath();
  ctx.moveTo(w * 0.62, 0);
  ctx.lineTo(w * 0.38, band);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(3, w * 0.006);
  ctx.stroke();
}

/**
 * Renders the cover into ctx at size w x h.
 * state: { photos: HTMLImageElement[], layout, grade, caption, kicker, seed,
 *   panels: { [index]: { zoom, ox, oy } } }
 */
export function drawCoverInto(ctx, w, h, state) {
  const grade = GRADES[state.grade] || GRADES.sunset;
  const layout = LAYOUTS[state.layout] || LAYOUTS['hero-left'];
  const seed = state.seed >>> 0 || 1;
  // Layer 1: procedural backdrop fills the whole cover (shows in gutters).
  drawBackdrop(ctx, w, h, seed, grade);
  // Layer 2: photo panels.
  const panels = layout.panels(w, h);
  panels.forEach((p, i) => {
    const px = Math.round(p.x * w);
    const py = Math.round(p.y * h);
    const pw = Math.round(p.w * w);
    const ph = Math.round(p.h * h);
    const img = state.photos[p.photo % Math.max(1, state.photos.length)] || null;
    const adj = (state.panels && state.panels[i]) || {};
    const zoom = adj.zoom ?? 1;
    const ox = adj.ox ?? 0;
    const oy = adj.oy ?? 0;
    ctx.save();
    if (p.clip) {
      diagClip(ctx, w, h, p.clip);
    } else {
      ctx.beginPath();
      ctx.rect(px, py, pw, ph);
      ctx.clip();
    }
    // Placeholder panel when no photo is loaded yet: skyline + label.
    if (!img) {
      ctx.fillStyle = grade.dark;
      ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = grade.light;
      ctx.font = `${Math.round(ph * 0.06)}px "Archivo Black", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('ADD A PHOTO', px + pw / 2, py + ph / 2);
    } else if (p.rotate) {
      const cx = px + pw / 2;
      const cy = py + ph / 2;
      ctx.translate(cx, cy);
      ctx.rotate((p.rotate * Math.PI) / 180);
      ctx.translate(-cx, -cy);
      drawTreatedPhoto(ctx, img, px, py, pw, ph, p.treatment, grade.dark, grade.light, zoom, ox, oy, seed + i * 13);
    } else {
      drawTreatedPhoto(ctx, img, px, py, pw, ph, p.treatment, grade.dark, grade.light, zoom, ox, oy, seed + i * 13);
    }
    ctx.restore();
    // Layer 3: comic border around each panel (skip the diagonal pair's
    // outer box; the seam line already divides them).
    if (!p.clip) {
      ctx.save();
      ctx.strokeStyle = '#0d0616';
      ctx.lineWidth = Math.max(3, w * 0.005);
      ctx.strokeRect(px, py, pw, ph);
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = Math.max(1, w * 0.0012);
      ctx.strokeRect(px + 3, py + 3, pw - 6, ph - 6);
      ctx.restore();
    }
  });
  // Layer 4: caption block over the bottom band.
  drawCaptionBlock(ctx, w, h, state.caption, state.kicker, grade);
  // Layer 5: small own-mark badge, top-right.
  drawBadge(ctx, w, h, 'VICE COVER STUDIO', grade);
}

/** Renders the cover onto a fresh canvas at export size and returns it. */
export function renderCover(state, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  drawCoverInto(ctx, w, h, state);
  return canvas;
}
