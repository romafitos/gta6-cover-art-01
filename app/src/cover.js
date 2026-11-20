// The compositor: paints one cover onto a canvas from the shared state
// and the loaded photos. The preview canvas and the PNG export both go
// through this one function, so what is seen is what the file holds.
//
// Panel order: photos (or drawn scenes) first, then panel borders and
// labels, then the title band with its quote/title/script/chip/ribbon,
// then the WANTED pill and EST. seal, then the bottom strip.

import { GRADES, LAYOUTS } from './presets.js';
import { drawGrain, drawHalftone } from './halftone.js';
import { drawBackdrop, drawMarinaScene } from './skyline.js';
import {
  drawEstSeal, drawPanelLabel, drawRibbon, drawStrip, drawTitleBand,
  drawVolChip, drawWantedPill,
} from './lettering.js';

// Anchor crop: the photo point (ax, ay) lands on the panel centre, then
// the drawn image is clamped so the panel stays fully covered. Pan
// offsets shift the image on top of the anchor; zoom never goes below 0.5.
// The clamp is what keeps wide-short panels from ever showing a gap at
// an edge, and the anchor is what keeps faces inside the frame.
function anchorDraw(ctx, photo, px, py, pw, ph, anchor, crop) {
  const zoom = Math.max(0.5, crop?.zoom ?? 1);
  const scale = Math.max(pw / photo.naturalWidth, ph / photo.naturalHeight) * zoom;
  const dw = photo.naturalWidth * scale;
  const dh = photo.naturalHeight * scale;
  let dx = px + pw / 2 - anchor[0] * dw + (crop?.panX ?? 0) * pw;
  let dy = py + ph / 2 - anchor[1] * dh + (crop?.panY ?? 0) * ph;
  dx = Math.min(px, Math.max(px + pw - dw, dx));
  dy = Math.min(py, Math.max(py + ph - dh, dy));
  ctx.drawImage(photo, dx, dy, dw, dh);
}

function drawPhotoPanel(ctx, photo, px, py, pw, ph, anchor, crop, grade) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  const treatment = grade.treatment;
  if (treatment === 'duotone') {
    // Grey first (same anchor crop, on an offscreen canvas), then a
    // two-colour overlay tint so the photograph reads as a duotone.
    const off = document.createElement('canvas');
    off.width = Math.max(2, Math.round(pw));
    off.height = Math.max(2, Math.round(ph));
    const octx = off.getContext('2d');
    octx.filter = 'grayscale(1) contrast(1.08)';
    anchorDraw(octx, photo, 0, 0, pw, ph, anchor, crop);
    octx.filter = 'none';
    ctx.drawImage(off, px, py, pw, ph);
    const tint = ctx.createLinearGradient(px, py, px, py + ph);
    tint.addColorStop(0, grade.duoLight);
    tint.addColorStop(1, grade.duoDark);
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = tint;
    ctx.fillRect(px, py, pw, ph);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  } else if (treatment === 'vivid') {
    ctx.filter = 'saturate(1.62) contrast(1.20) brightness(1.04)';
    anchorDraw(ctx, photo, px, py, pw, ph, anchor, crop);
    ctx.filter = 'none';
    // Warm split-tone: orange at the top fading out mid-panel, pink at
    // the foot, laid over the photograph in overlay blend mode.
    const warm = ctx.createLinearGradient(px, py, px, py + ph);
    warm.addColorStop(0, 'rgba(255,140,60,0.16)');
    warm.addColorStop(0.55, 'rgba(255,140,60,0.02)');
    warm.addColorStop(1, 'rgba(255,46,136,0.18)');
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = warm;
    ctx.fillRect(px, py, pw, ph);
    // Teal shadow lift so the sea and sky keep their own hue.
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(0,229,255,0.10)';
    ctx.fillRect(px, py, pw, ph);
    ctx.globalCompositeOperation = 'source-over';
    // Gentle radial vignette darkening the panel edges.
    const vig = ctx.createRadialGradient(
      px + pw / 2, py + ph / 2, Math.min(pw, ph) * 0.42,
      px + pw / 2, py + ph / 2, Math.max(pw, ph) * 0.75,
    );
    vig.addColorStop(0, 'rgba(10,6,18,0)');
    vig.addColorStop(1, 'rgba(10,6,18,0.20)');
    ctx.fillStyle = vig;
    ctx.fillRect(px, py, pw, ph);
  } else {
    anchorDraw(ctx, photo, px, py, pw, ph, anchor, crop);
    if (treatment === 'halftone') {
      drawHalftone(ctx, px, py, pw, ph, 7, 'rgba(10,6,18,0.18)', 5, 0.8, 2.2);
    } else if (treatment === 'grain') {
      drawGrain(ctx, px, py, pw, ph, 7);
    }
  }
  ctx.restore();
}

export function drawCover(canvas, state, photos) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const U = Math.min(W, H);
  const grade = GRADES[state.grade] || GRADES.vivid;
  const layout = LAYOUTS[state.layout] || LAYOUTS['vice-hero'];
  const seed = state.seed | 0;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d0616';
  ctx.fillRect(0, 0, W, H);

  for (const p of layout.panels) {
    const px = p.x * W;
    const py = p.y * H;
    const pw = p.w * W;
    const ph = p.h * H;
    if (p.scene === 'marina') {
      ctx.save();
      ctx.beginPath();
      ctx.rect(px, py, pw, ph);
      ctx.clip();
      drawMarinaScene(ctx, px, py, pw, ph, grade, seed);
      ctx.restore();
    } else if (p.scene === 'backdrop') {
      ctx.save();
      ctx.beginPath();
      ctx.rect(px, py, pw, ph);
      ctx.clip();
      drawBackdrop(ctx, px, py, pw, ph, grade, seed);
      ctx.restore();
    } else {
      const photo = photos[p.photo] || null;
      if (photo) {
        drawPhotoPanel(ctx, photo, px, py, pw, ph, p.anchor, state.crops[p.photo], grade);
      } else {
        ctx.save();
        ctx.beginPath();
        ctx.rect(px, py, pw, ph);
        ctx.clip();
        drawBackdrop(ctx, px, py, pw, ph, grade, seed);
        ctx.restore();
      }
    }
    // Panel borders: dark outer line, thin bright inner line.
    ctx.save();
    ctx.lineWidth = Math.max(3, W * 0.005);
    ctx.strokeStyle = '#0d0616';
    ctx.strokeRect(px, py, pw, ph);
    ctx.lineWidth = Math.max(1, W * 0.0012);
    ctx.strokeStyle = 'rgba(255,233,168,0.55)';
    ctx.strokeRect(px + 3, py + 3, pw - 6, ph - 6);
    ctx.restore();
    drawPanelLabel(ctx, px, py, pw, ph, p.label, p.sub);
  }

  drawTitleBand(ctx, W, H, U, grade, state, seed);
  drawWantedPill(ctx, W, H, U);
  drawEstSeal(ctx, W, H, U);
  drawStrip(ctx, W, H, U, state);
}

// Renders the cover at an arbitrary size into a fresh canvas and returns
// it, so exports do not disturb the preview canvas.
export function renderCover(width, height, state, photos) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  drawCover(canvas, state, photos);
  return canvas;
}
